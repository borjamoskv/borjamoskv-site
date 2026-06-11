// C5-REAL
// src/lib/ledger/cryptLedger.ts
// Handles cryptographic append-only JSONL ledger updates with SHA-256 block chaining and Cloudflare KV fallback.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { ExergyAuditRecord } from '../exergy/evaluator.ts';

export async function loadLastHash(ledgerPath: string, kvNamespace?: any): Promise<string> {
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

export async function appendLedgerEntry(
  record: Omit<ExergyAuditRecord, 'prev_hash' | 'hash'>,
  options: { ledgerPath?: string; kvNamespace?: any } = {}
): Promise<ExergyAuditRecord> {
  const defaultPath = path.resolve(process.cwd(), 'substack_archive/exergy_ledger.jsonl');
  const ledgerPath = options.ledgerPath || defaultPath;
  const kv = options.kvNamespace;

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
      } catch (err: any) {
        if (err.code === 'EEXIST') {
          return false;
        }
        throw err;
      }
    };

    let lockAcquired = await acquireLock();
    if (!lockAcquired) {
      // Locking error. Check if the lock file is older than 30 seconds.
      try {
        const lockContent = await fs.readFile(lockPath, 'utf-8');
        const lockTime = parseInt(lockContent.trim(), 10);
        const now = Date.now();
        if (Number.isNaN(lockTime) || now - lockTime > 30000) {
          // Break/delete the lock file and retry lock acquisition once
          try {
            await fs.unlink(lockPath);
          } catch (unlinkErr) {
            // Ignore if deleted by another process
          }
          lockAcquired = await acquireLock();
        }
      } catch (readErr) {
        // If file was deleted or cannot be read, retry once
        lockAcquired = await acquireLock();
      }
    }

    if (!lockAcquired) {
      throw new Error("Ledger file is locked by another process");
    }
    lockCreated = true;
  }

  try {
    // Under testing, introduce a delay to force concurrent requests to overlap and test lock collision
    if (typeof process !== 'undefined' && process.env && process.env.MOCK_SERVER_PORT) {
      await new Promise((r) => setTimeout(r, 200));
    }

    // 2. Load previous hash
    const prev_hash = await loadLastHash(ledgerPath, kv);

    // 3. Build entry
    const entry: ExergyAuditRecord = {
      ...record,
      prev_hash,
      exergy: record.exergy_score // Ensure 'exergy' matches python test runner checks
    };

    // 4. Calculate hash: sha256(timestamp + title + str(exergy) + prev_hash)
    const hashStr = `${entry.timestamp}${entry.title}${entry.exergy}${entry.prev_hash}`;
    const hash = crypto.createHash('sha256').update(hashStr).digest('hex');
    entry.hash = hash;

    // 5. Persist
    let writtenLocal = false;
    
    try {
      await fs.appendFile(ledgerPath, JSON.stringify(entry) + "\n", 'utf-8');
      writtenLocal = true;
    } catch (err) {
      console.warn("Local ledger append failed (possibly edge environment).");
    }

    if (kv) {
      try {
        await kv.put("exergy_ledger_head", hash, {
          metadata: { timestamp: entry.timestamp }
        });
        await kv.put("fallback_ledger", JSON.stringify(entry));
        await kv.put(`ledger_block_${hash}`, JSON.stringify(entry));
      } catch (err) {
        if (!writtenLocal) {
          throw new Error("Both local and KV persistence failed: " + (err as Error).message);
        }
      }
    } else if (!writtenLocal) {
      throw new Error("Local persistence failed and no KV namespace is bound.");
    }

    return entry;
  } finally {
    if (lockCreated) {
      try {
        await fs.unlink(lockPath);
      } catch (err) {
        // Ignore lock cleanup error
      }
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
      } catch (err: any) {
        return { valid: false, message: `Line ${idx + 1} has invalid JSON syntax: ${err.message}` };
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
  } catch (err: any) {
    return { valid: false, message: `Ledger file error: ${err.message}` };
  }
}
