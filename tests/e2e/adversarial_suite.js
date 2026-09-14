#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import assert from 'node:assert';

if (!process.execArgv.includes('--experimental-strip-types')) {
  const child = spawn(
    process.execPath,
    ['--experimental-strip-types', fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    { stdio: 'inherit' }
  );
  child.on('exit', (code) => process.exit(code || 0));
} else {
  runAdversarialTests();
}

async function runAdversarialTests() {
  console.log("=========================================================");
  console.log("Ω-PORT ADVERSARIAL REVIEW: White-Box Stress Test Suite");
  console.log("=========================================================");

  try {
    const { appendLedgerEntry } = await import('../../src/lib/ledger/cryptLedger.ts');

    const tempDir = path.join(os.tmpdir(), `adversarial_test_${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    const ledgerPath = path.join(tempDir, "exergy_ledger.jsonl");

    const baseRecord = {
      timestamp: new Date().toISOString(),
      title: "Adversarial Test Post",
      subtitle: "Subtitle",
      description: "Description",
      language: "es",
      metrics: { clickbait: 10, tech: 10, commercial: 0, c5_real: 10 },
      smoke_index: 10,
      exergy_score: 90
    };

    // -------------------------------------------------------------------------
    // TEST 1: Concurrency Write Race (Lack of Atomic Locking)
    // -------------------------------------------------------------------------
    console.log("\n[TEST 1] Testing Concurrency Write Race (Parallel Appends)...");
    
    // We launch multiple append operations in parallel (using Promise.all)
    // to see if they both bypass the file lock check and execute concurrently.
    const runConcurrencyTest = async () => {
      // Clear ledger file
      try { await fs.writeFile(ledgerPath, ""); } catch (e) {}
      
      const p1 = appendLedgerEntry({ ...baseRecord, title: "Parallel Post 1" }, { ledgerPath });
      const p2 = appendLedgerEntry({ ...baseRecord, title: "Parallel Post 2" }, { ledgerPath });
      
      const results = await Promise.allSettled([p1, p2]);
      
      let fulfilledCount = 0;
      let rejectedCount = 0;
      let rejectError = "";
      
      for (const res of results) {
        if (res.status === 'fulfilled') {
          fulfilledCount++;
        } else {
          rejectedCount++;
          rejectError = res.reason.message;
        }
      }
      
      console.log(`- Parallel results: Fulfilled = ${fulfilledCount}, Rejected = ${rejectedCount}`);
      if (fulfilledCount > 1) {
        console.log("- [RISK CONFIRMED] Concurrency race condition detected: Both parallel writes succeeded!");
        return { success: false, reason: "Parallel writes allowed without collision error (race condition)" };
      } else {
        console.log(`- [LOCK MET] One request rejected with lock error: "${rejectError}"`);
        return { success: true };
      }
    };
    
    const raceResult = await runConcurrencyTest();

    // -------------------------------------------------------------------------
    // TEST 2: Stale Lock / Permanent Lockout
    // -------------------------------------------------------------------------
    console.log("\n[TEST 2] Testing Stale Lock / Permanent Lockout...");
    
    // Create a mock lock file to simulate a stale lock from a crashed process
    const lockPath = ledgerPath + ".lock";
    await fs.writeFile(lockPath, "locked");
    
    try {
      await appendLedgerEntry({ ...baseRecord, title: "Post during lock" }, { ledgerPath });
      console.log("- [FAIL] Allowed writing even with lock file present!");
      assert.fail("Allowed write when lock file was present");
    } catch (err) {
      console.log(`- [PASS] Correctly blocked write. Error: "${err.message}"`);
      
      // Check if it's a permanent block
      console.log("- Checking if lockout is permanent (no expiration)...");
      await new Promise(resolve => setTimeout(resolve, 200)); // wait a bit
      
      try {
        await appendLedgerEntry({ ...baseRecord, title: "Post during lock 2" }, { ledgerPath });
        console.log("- [FAIL] Lock automatically expired too early");
      } catch (err2) {
        console.log(`- [RISK CONFIRMED] Lockout is permanent. Lock file remains and is never expired: "${err2.message}"`);
      }
    }
    
    // Clean up lock
    try { await fs.unlink(lockPath); } catch (e) {}

    // -------------------------------------------------------------------------
    // TEST 3: Corrupted last JSON line resets prev_hash to "GENESIS"
    // -------------------------------------------------------------------------
    console.log("\n[TEST 3] Testing Corrupted last JSON line prev_hash Chain Reset...");
    
    // 1. Write a valid entry first
    const entry1 = await appendLedgerEntry({ ...baseRecord, title: "Valid Post A" }, { ledgerPath });
    const firstHash = entry1.hash;
    console.log(`- Wrote Valid Post A with hash: ${firstHash}`);
    
    // 2. Append a corrupted, half-written JSON line to simulate a crash/partial write
    await fs.appendFile(ledgerPath, '{"timestamp": "2026-06-09T08:00:00Z", "title": "Partially Written Post"\n');
    console.log("- Appended corrupted JSON line to ledger file");
    
    // 3. Write another valid entry
    const entry2 = await appendLedgerEntry({ ...baseRecord, title: "Valid Post B" }, { ledgerPath });
    console.log(`- Wrote Valid Post B. prev_hash = "${entry2.prev_hash}"`);
    
    // If it returned "GENESIS" instead of throwing an error or using the last valid hash,
    // then the cryptographic chain is broken!
    if (entry2.prev_hash === "GENESIS") {
      console.log("- [RISK CONFIRMED] Chain reset vulnerability verified: prev_hash reset to 'GENESIS' due to corrupted last line!");
    } else {
      console.log("- [PASS] Correctly handled corrupted line without resetting prev_hash to GENESIS");
    }

    // -------------------------------------------------------------------------
    // Clean up
    // -------------------------------------------------------------------------
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log("\n=========================================================");
    console.log("Ω-PORT ADVERSARIAL REVIEW: Execution Completed");
    console.log("=========================================================");

  } catch (err) {
    console.error("\n[❌] Adversarial test runner failed:", err);
    process.exit(1);
  }
}
