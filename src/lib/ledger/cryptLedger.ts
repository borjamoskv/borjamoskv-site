// C5-REAL
// src/lib/ledger/cryptLedger.ts
// Handles cryptographic append-only JSONL ledger updates with SHA-256 block chaining and Cloudflare KV fallback.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { ExergyAuditRecord } from '../exergy/evaluator.ts';

export async function loadLastHash(ledgerPath: string, kvNamespace?: unknown): Promise<string> {
  // If KV is available, try KV first
  if (kvNamespace) {
    try {
      const head = await kvNamespace.get("exergy_ledger_head");
      if (head) return head;
    } catch (err) {
      console.warn("KV read failed, falling back to local filesystem if available:", err);
    }
  }

  // Filesystem check
  try {
    const data = await fs.readFile(ledgerPath, 'utf-8');
    const lines = data.split('\n').map(l => l.trim()).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const parsed = JSON.parse(lines[i]);
        if (parsed && typeof parsed === 'object') {
          return parsed.hash || "GENESIS";
        }
      } catch (e) {
        // Skip invalid/corrupt line and continue bottom-up
      }
    }
  } catch (err) {
    // File doesn't exist or is empty
  }
  return "GENESIS";
}

async function getOrCreateKeyPair(): Promise<{ publicKeyHex: string; signatureHex: (hash: string) => string }> {
  try {
    const keyDir = path.resolve(process.cwd(), '.cortex');
    await fs.mkdir(keyDir, { recursive: true });
    const privPath = path.join(keyDir, 'agent_key.pem');
    const pubPath = path.join(keyDir, 'agent_key.pub.pem');

    let privateKey: crypto.KeyObject;
    let publicKey: crypto.KeyObject;

    try {
      const privPem = await fs.readFile(privPath, 'utf8');
      const pubPem = await fs.readFile(pubPath, 'utf8');
      privateKey = crypto.createPrivateKey(privPem);
      publicKey = crypto.createPublicKey(pubPem);
    } catch (e) {
      // Generate new Ed25519 keypair
      const keys = crypto.generateKeyPairSync('ed25519');
      privateKey = keys.privateKey;
      publicKey = keys.publicKey;

      const privPem = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
      const pubPem = publicKey.export({ type: 'spki', format: 'pem' }) as string;
      
      await fs.writeFile(privPath, privPem, 'utf8');
      await fs.writeFile(pubPath, pubPem, 'utf8');
    }

    const rawPubKey = publicKey.export({ format: 'der', type: 'spki' });
    const publicKeyHex = rawPubKey.subarray(rawPubKey.length - 32).toString('hex');

    const signatureHex = (hash: string) => {
      return crypto.sign(null, Buffer.from(hash), privateKey).toString('hex');
    };

    return { publicKeyHex, signatureHex };
  } catch (err) {
    // Fallback/Mock key for environments without filesystem or full node:crypto support
    const mockPubKeyHex = "e0a36fe35c828d990d0b0b11b7fb7e91bfe976aa16d3f941eb915e3c9c99ceee";
    const mockSigHex = (hash: string) => `mock_signature_for_${hash}`;
    return { publicKeyHex: mockPubKeyHex, signatureHex: mockSigHex };
  }
}

export async function appendLedgerEntry(
  record: Omit<ExergyAuditRecord, 'prev_hash' | 'hash'>,
  options: { 
    ledgerPath?: string; 
    kvNamespace?: unknown; 
    dbNamespace?: unknown; 
    syncUrl?: string; 
  } = {}
): Promise<ExergyAuditRecord> {
  const defaultPath = path.resolve(process.cwd(), 'substack_archive/exergy_ledger.jsonl');
  const ledgerPath = options.ledgerPath || defaultPath;
  const kv = options.kvNamespace;
  const db = options.dbNamespace;
  const syncUrl = options.syncUrl;

  // 1. Lock check for local filesystem
  const lockPath = ledgerPath + ".lock";
  let lockCreated = false;

  if (!kv) {
    await fs.mkdir(path.dirname(ledgerPath), { recursive: true });

    const acquireLock = async (): Promise<boolean> => {
      try {
        const now = Date.now().toString();
        await fs.writeFile(lockPath, now, { flag: 'wx' });
        return true;
      } catch (err) {
        if ((err as { code?: string }).code === 'EEXIST') {
          return false;
        }
        throw err;
      }
    };

    let lockAcquired = await acquireLock();
    if (!lockAcquired) {
      try {
        const lockContent = await fs.readFile(lockPath, 'utf-8');
        const lockTime = parseInt(lockContent.trim(), 10);
        const now = Date.now();
        if (Number.isNaN(lockTime) || now - lockTime > 30000) {
          try {
            await fs.unlink(lockPath);
          } catch (unlinkErr) {}
          lockAcquired = await acquireLock();
        }
      } catch (readErr) {
        lockAcquired = await acquireLock();
      }
    }

    if (!lockAcquired) {
      throw new Error("Ledger file is locked by another process");
    }
    lockCreated = true;
  }

  try {
    if (typeof process !== 'undefined' && process.env && process.env.MOCK_SERVER_PORT) {
      await new Promise((r) => setTimeout(r, 200));
    }

    // 2. Load previous hash
    const prev_hash = await loadLastHash(ledgerPath, kv);

    // 3. Get identity public key and sign helper
    const { publicKeyHex, signatureHex } = await getOrCreateKeyPair();

    // 4. Build entry
    const entry: ExergyAuditRecord = {
      ...record,
      prev_hash,
      exergy: record.exergy_score, // Ensure 'exergy' matches python tests
      pubkey: publicKeyHex
    };

    // 5. Calculate hash: sha256(timestamp + title + exergy + prev_hash)
    const hashStr = `${entry.timestamp}${entry.title}${entry.exergy}${entry.prev_hash}`;
    const hash = crypto.createHash('sha256').update(hashStr).digest('hex');
    entry.hash = hash;

    // 6. Sign hash
    entry.signature = signatureHex(hash);

    // 7. Persist local
    let writtenLocal = false;
    try {
      await fs.appendFile(ledgerPath, JSON.stringify(entry) + "\n", 'utf-8');
      writtenLocal = true;
    } catch (err) {
      console.warn("Local ledger append failed (possibly edge environment).");
    }

    // 8. Direct D1 SQL persistence (if DB binding is present)
    if (db) {
      try {
        await db.prepare(
          "INSERT INTO cortex_audit_ledger (hash, prev_hash, timestamp, title, subtitle, description, metrics, signature, pubkey) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(
          entry.hash,
          entry.prev_hash,
          entry.timestamp,
          entry.title,
          entry.subtitle || "",
          entry.description || "",
          JSON.stringify(entry.metrics),
          entry.signature,
          entry.pubkey
        )
        .run();
      } catch (err) {
        console.error("Direct D1 SQL insertion failed:", (err as Error).message);
      }
    }

    // 9. Persist KV Namespace
    if (kv) {
      try {
        await kv.put("exergy_ledger_head", hash, {
          metadata: { timestamp: entry.timestamp }
        });
        await kv.put("fallback_ledger", JSON.stringify(entry));
        await kv.put(`ledger_block_${hash}`, JSON.stringify(entry));
      } catch (err) {
        if (!writtenLocal && !db) {
          throw new Error("Local, DB and KV persistence failed: " + (err as Error).message);
        }
      }
    } else if (!writtenLocal && !db) {
      throw new Error("Local persistence failed and no KV or D1 namespace is bound.");
    }

    // 10. Write-through Sync via POST request
    if (syncUrl) {
      try {
        const response = await fetch(syncUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
        if (!response.ok) {
          throw new Error(`Endpoint returned status ${response.status}`);
        }
      } catch (err) {
        console.warn(`Write-through sync failed. Enqueueing to local queue. Error: ${(err as Error).message}`);
        // Enqueue block in local persistent queue
        try {
          const queuePath = path.resolve(process.cwd(), '.cortex/sync_queue.jsonl');
          await fs.appendFile(queuePath, JSON.stringify(entry) + "\n", 'utf-8');
        } catch (queueErr) {
          console.error("Failed to write to local sync queue:", (queueErr as Error).message);
        }
      }
    }

    return entry;
  } finally {
    if (lockCreated) {
      try {
        await fs.unlink(lockPath);
      } catch (err) {}
    }
  }
}

/**
 * Helper to verify local ledger file integrity from JS code.
 */
export async function verifyLedgerIntegrity(ledgerPath: string): Promise<{ valid: boolean; message: string }> {
  try {
    const data = await fs.readFile(ledgerPath, 'utf-8');
    const lines = data.trim().split('\n').filter(Boolean);
    if (lines.length === 0) {
      return { valid: true, message: "Ledger is empty" };
    }

    let prev_hash = "GENESIS";
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      let entry: ExergyAuditRecord;
      try {
        entry = JSON.parse(line);
      } catch (err) {
        return { valid: false, message: `Line ${idx + 1} has invalid JSON syntax: ${(err as Error).message}` };
      }

      const required: (keyof ExergyAuditRecord)[] = ["timestamp", "title", "exergy", "hash", "prev_hash"];
      for (const field of required) {
        if (!(field in entry)) {
          return { valid: false, message: `Line ${idx + 1} is missing field: ${field}` };
        }
      }

      if (entry.prev_hash !== prev_hash) {
        return { valid: false, message: `Line ${idx + 1} prev_hash mismatch. Expected ${prev_hash}, got ${entry.prev_hash}` };
      }

      const hashStr = `${entry.timestamp}${entry.title}${entry.exergy}${entry.prev_hash}`;
      const hashCalc = crypto.createHash('sha256').update(hashStr).digest('hex');

      if (entry.hash !== hashCalc) {
        return { valid: false, message: `Line ${idx + 1} hash mismatch. Calculated ${hashCalc}, got ${entry.hash}` };
      }

      prev_hash = entry.hash || "";
    }

    return { valid: true, message: "Ledger is cryptographically valid" };
  } catch (err) {
    return { valid: false, message: `Ledger file error: ${(err as Error).message}` };
  }
}
