// C5-REAL
// tests/e2e/persistence_test.ts
// Integration test suite verifying Ed25519 signatures, D1 & KV persistence, and queue flushing.

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import assert from 'node:assert';
import crypto from 'node:crypto';

// Self-invocation using strip-types if run directly
if (!process.execArgv.includes('--experimental-strip-types')) {
  const child = spawn(
    process.execPath,
    ['--experimental-strip-types', fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    { stdio: 'inherit' }
  );
  child.on('exit', (code) => process.exit(code || 0));
} else {
  runPersistenceTests();
}

// Mock D1 Database Implementation
class MockD1Database {
  rows: any[] = [];
  prepare(sql: string) {
    const rowsRef = this.rows;
    return {
      bind(...args: any[]) {
        return {
          async run() {
            rowsRef.push(args);
            return { success: true };
          }
        };
      }
    };
  }
}

// Mock KV Namespace Implementation
class MockKVNamespace {
  store = new Map<string, string>();
  metadata = new Map<string, any>();
  async get(key: string) {
    return this.store.get(key) || null;
  }
  async put(key: string, value: string, options?: any) {
    this.store.set(key, value);
    if (options && options.metadata) {
      this.metadata.set(key, options.metadata);
    }
  }
}

async function runPersistenceTests() {
  console.log("=========================================================");
  console.log("CORTEX PERSISTENCE INTEGRATION TESTS (C5-REAL)");
  console.log("=========================================================");

  let failed = false;

  try {
    const { appendLedgerEntry } = await import('../../src/lib/ledger/cryptLedger.ts');
    const { flushQueue } = await import('../../src/lib/ledger/flushQueue.ts');

    const tempDir = path.join(os.tmpdir(), `persistence_test_${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    const ledgerPath = path.join(tempDir, "exergy_ledger.jsonl");
    const queuePath = path.join(tempDir, "sync_queue.jsonl");

    const baseRecord = {
      timestamp: new Date().toISOString(),
      title: "Persistence Integration Test",
      subtitle: "Offline Sync Mocking",
      description: "Testing cryptographic verification.",
      language: "en" as const,
      metrics: { clickbait: 5, tech: 95, commercial: 0, c5_real: 80 },
      smoke_index: 2,
      exergy_score: 98,
      exergy: 98
    };

    // -------------------------------------------------------------------------
    // TEST 1: Cryptographic Ed25519 Signing and Direct D1/KV Writing
    // -------------------------------------------------------------------------
    console.log("\n[TEST 1] Testing cryptographic signing and direct D1/KV writes...");
    const mockDb = new MockD1Database();
    const mockKv = new MockKVNamespace();

    const entry = await appendLedgerEntry(baseRecord, {
      ledgerPath,
      dbNamespace: mockDb,
      kvNamespace: mockKv
    });

    console.log("- Record successfully appended and signed.");
    console.log(`  Hash: ${entry.hash}`);
    console.log(`  Prev Hash: ${entry.prev_hash}`);
    console.log(`  Pubkey: ${entry.pubkey}`);
    console.log(`  Signature: ${entry.signature}`);

    assert.ok(entry.hash, "Hash should be generated");
    assert.ok(entry.signature, "Signature should be generated");
    assert.ok(entry.pubkey, "Pubkey should be generated");
    assert.strictEqual(entry.prev_hash, "GENESIS", "First entry prev_hash should be GENESIS");

    // Re-verify the signature using node:crypto
    const pubKeyBytes = Buffer.from(entry.pubkey!, 'hex');
    const pubKeyObject = crypto.createPublicKey({
      key: Buffer.concat([
        Buffer.from([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00]),
        pubKeyBytes
      ]),
      format: 'der',
      type: 'spki'
    });
    
    const signatureBytes = Buffer.from(entry.signature!, 'hex');
    const hashBytes = Buffer.from(entry.hash!);
    const isValid = crypto.verify(null, hashBytes, pubKeyObject, signatureBytes);
    
    console.log(`- Signature validation: ${isValid ? 'VALID' : 'INVALID'}`);
    assert.ok(isValid, "Cryptographic signature must be valid");

    // Verify D1 and KV insertions
    assert.strictEqual(mockDb.rows.length, 1, "Should have 1 insert in D1");
    assert.strictEqual(mockDb.rows[0][0], entry.hash, "D1 row hash should match");
    assert.strictEqual(mockDb.rows[0][1], entry.prev_hash, "D1 row prev_hash should match");

    const headInKv = await mockKv.get("exergy_ledger_head");
    console.log(`- KV exergy_ledger_head: ${headInKv}`);
    assert.strictEqual(headInKv, entry.hash, "KV head should point to latest entry hash");
    console.log("✅ TEST 1 PASSED");

    // -------------------------------------------------------------------------
    // TEST 2: Write-through Fallback to Offline Sync Queue
    // -------------------------------------------------------------------------
    console.log("\n[TEST 2] Testing offline queue fallback when endpoint fails...");
    
    // We clear D1 and KV bindings to force write-through fetch, 
    // and provide a non-existent or failing syncUrl
    const failingUrl = "http://localhost:9999/invalid-sync-endpoint";
    
    const entry2 = await appendLedgerEntry(
      { ...baseRecord, title: "Offline Queue Entry" },
      {
        ledgerPath,
        syncUrl: failingUrl
      }
    );

    // Verify it was appended locally but also written to the queue
    const queueContent = await fs.readFile(path.resolve(process.cwd(), '.cortex/sync_queue.jsonl'), 'utf8');
    const queueLines = queueContent.trim().split('\n').filter(Boolean);
    console.log(`- Local queue file has ${queueLines.length} entries.`);
    assert.ok(queueLines.length >= 1, "Sync queue should contain at least 1 entry");

    const parsedQueueEntry = JSON.parse(queueLines[queueLines.length - 1]);
    assert.strictEqual(parsedQueueEntry.hash, entry2.hash, "Queue entry hash should match local block hash");
    console.log("✅ TEST 2 PASSED");

    // -------------------------------------------------------------------------
    // TEST 3: Queue Flusher Execution
    // -------------------------------------------------------------------------
    console.log("\n[TEST 3] Testing queue flusher behavior...");

    // We write a controlled test queue file in our tempDir
    const testQueueEntry = entry2;
    await fs.writeFile(queuePath, JSON.stringify(testQueueEntry) + "\n", 'utf8');

    // Mock global fetch to intercept the POST request
    const originalFetch = globalThis.fetch;
    let receivedPayload: any = null;

    globalThis.fetch = async (url: any, opts: any) => {
      receivedPayload = JSON.parse(opts.body);
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true })
      } as Response;
    };

    try {
      const flushResult = await flushQueue({
        syncUrl: 'http://localhost:4322/api/exergy-sync',
        queuePath
      });

      console.log(`- Flush result: Processed = ${flushResult.processed}, Synced = ${flushResult.synced}, Failed = ${flushResult.failed}`);
      assert.strictEqual(flushResult.processed, 1, "Should process 1 entry");
      assert.strictEqual(flushResult.synced, 1, "Should sync 1 entry");
      assert.strictEqual(flushResult.failed, 0, "Should have 0 failures");

      assert.ok(receivedPayload, "Sync server should have received payload");
      assert.strictEqual(receivedPayload.hash, testQueueEntry.hash, "Received hash should match");

      // Verify queue file is now deleted or empty
      let queueExists = true;
      try {
        await fs.access(queuePath);
      } catch (_) {
        queueExists = false;
      }
      assert.ok(!queueExists, "Queue file should be deleted after successful flush");
      console.log("✅ TEST 3 PASSED");

    } finally {
      globalThis.fetch = originalFetch;
    }

    // Cleanup tempDir
    await fs.rm(tempDir, { recursive: true, force: true });

    // Clean up global sync queue changes made during Test 2
    try {
      await fs.unlink(path.resolve(process.cwd(), '.cortex/sync_queue.jsonl'));
    } catch (_) {}

    console.log("\n=========================================================");
    console.log("ALL PERSISTENCE INTEGRATION TESTS PASSED (C5-REAL)");
    console.log("=========================================================");
    process.exit(0);

  } catch (err) {
    console.error("\n[❌] Integration test runner failed:", err);
    process.exit(1);
  }
}
