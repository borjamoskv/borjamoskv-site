// C5-REAL
// src/lib/ledger/flushQueue.ts
// Client-side utility to flush the offline queue (.cortex/sync_queue.jsonl) to the remote sync endpoint.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { ExergyAuditRecord } from '../exergy/evaluator.ts';

const DEFAULT_SYNC_URL = 'http://localhost:4322/api/exergy-sync';

// Local Ed25519 signature verification before sending (optional but ensures client-side sanity)
function verifyLocalSignature(entry: ExergyAuditRecord): boolean {
  if (!entry.hash || !entry.signature || !entry.pubkey) return false;
  try {
    // Recompute hash for verification
    const hashStr = `${entry.timestamp}${entry.title}${entry.exergy_score}${entry.prev_hash}`;
    const calculatedHash = crypto.createHash('sha256').update(hashStr).digest('hex');
    if (entry.hash !== calculatedHash) {
      console.warn(`[Flusher] Hash mismatch for block ${entry.hash}. Calculated: ${calculatedHash}`);
      return false;
    }

    // Verify signature using agent's public key PEM
    // Note: crypto.verify expects the public key in PEM/DER format
    // Since pubkey in entry is hex, we can reconstruct the PEM format if needed, or use node:crypto's raw support
    // For simplicity, we can verify using raw public keys
    // In node:crypto, we can create a public key from the raw 32-byte public key (for Ed25519)
    const rawPubBytes = Buffer.from(entry.pubkey, 'hex');
    const pubKeyObject = crypto.createPublicKey({
      key: Buffer.concat([
        Buffer.from([
          0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00
        ]),
        rawPubBytes
      ]),
      format: 'der',
      type: 'spki'
    });

    const signatureBytes = Buffer.from(entry.signature, 'hex');
    const hashBytes = Buffer.from(entry.hash);

    return crypto.verify(null, hashBytes, pubKeyObject, signatureBytes);
  } catch (err) {
    console.error(`[Flusher] Error verifying signature for block ${entry.hash}:`, (err as Error).message);
    return false;
  }
}

export async function flushQueue(options: { syncUrl?: string; queuePath?: string } = {}): Promise<{
  processed: number;
  synced: number;
  failed: number;
}> {
  const syncUrl = options.syncUrl || process.env.TARGET_API_URL ? `${process.env.TARGET_API_URL}/api/exergy-sync` : DEFAULT_SYNC_URL;
  const queuePath = options.queuePath || path.resolve(process.cwd(), '.cortex/sync_queue.jsonl');

  let queueContent = '';
  try {
    queueContent = await fs.readFile(queuePath, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { processed: 0, synced: 0, failed: 0 };
    }
    throw err;
  }

  const lines = queueContent.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { processed: 0, synced: 0, failed: 0 };
  }

  console.info(`[Flusher] Found ${lines.length} entries in sync queue. Synchronizing to ${syncUrl}...`);

  const entries: ExergyAuditRecord[] = [];
  for (const line of lines) {
    try {
      entries.push(JSON.parse(line));
    } catch (err) {
      console.warn(`[Flusher] Ignoring corrupt line in queue: ${line}`);
    }
  }

  let syncedCount = 0;
  let failedCount = 0;
  const remainingEntries: ExergyAuditRecord[] = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    // Verify signature before attempting POST to avoid sending garbage
    if (!verifyLocalSignature(entry)) {
      console.error(`[Flusher] Cryptographic validation failed for block ${entry.hash || 'unknown'}. Skipping.`);
      failedCount++;
      continue;
    }

    try {
      console.info(`[Flusher] Sending entry ${i + 1}/${entries.length}: ${entry.hash} (${entry.title})`);
      const response = await fetch(syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });

      if (response.ok) {
        console.info(`[✓] Synced block ${entry.hash}`);
        syncedCount++;
      } else {
        const bodyText = await response.text();
        let bodyJson: Record<string, unknown> = {};
        try {
          bodyJson = JSON.parse(bodyText);
        } catch (_) {}

        const errorMsg = bodyJson.error || bodyText;
        console.error(`[!] Failed to sync block ${entry.hash}: HTTP ${response.status} - ${errorMsg}`);

        // If it's a conflict (e.g. 409 Consensus chain gap), we must STOP syncing subsequent blocks
        // because subsequent blocks depend on this block's hash.
        // If it's a conflict because the block already exists (e.g. we re-sent it), we can treat it as synced if we want,
        // but the current endpoint returns 409 on any prev_hash mismatch.
        // Let's add all remaining entries back to the queue and abort.
        remainingEntries.push(...entries.slice(i));
        failedCount += entries.length - i;
        break;
      }
    } catch (err) {
      console.error(`[!] Sync request failed for block ${entry.hash}:`, (err as Error).message);
      remainingEntries.push(...entries.slice(i));
      failedCount += entries.length - i;
      break;
    }
  }

  // Rewrite queue file with remaining entries
  if (remainingEntries.length > 0) {
    const newQueueContent = remainingEntries.map(e => JSON.stringify(e)).join('\n') + '\n';
    await fs.writeFile(queuePath, newQueueContent, 'utf8');
  } else {
    try {
      await fs.unlink(queuePath);
    } catch (err) {
      // If unable to delete, truncate it
      await fs.writeFile(queuePath, '', 'utf8');
    }
  }

  return {
    processed: entries.length,
    synced: syncedCount,
    failed: failedCount
  };
}

// Script run block
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('flushQueue.ts')) {
  flushQueue()
    .then(res => {
      console.info(`[Flusher] Finished. Processed: ${res.processed}, Synced: ${res.synced}, Failed: ${res.failed}`);
      process.exit(res.failed > 0 ? 1 : 0);
    })
    .catch(err => {
      console.error('[Flusher] Critical failure:', err);
      process.exit(1);
    });
}
