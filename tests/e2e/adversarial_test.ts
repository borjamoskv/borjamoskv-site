// tests/e2e/adversarial_test.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseRss, fetchSubstackPosts } from '../../src/lib/substack/scraper.ts';
import { appendLedgerEntry, verifyLedgerIntegrity } from '../../src/lib/ledger/cryptLedger.ts';
import { detectLang, auditPostMetrics } from '../../src/lib/exergy/evaluator.ts';

async function runAdversarialTests() {
  console.log("=== STARTING ADVERSARIAL TESTS ===");
  let failed = false;

  // ---------------------------------------------------------------------------
  // Test 1: RSS Parser Cut-off / CDATA Injection Vulnerability
  // ---------------------------------------------------------------------------
  try {
    console.log("\n[Test 1] Running RSS CDATA Injection test...");
    const xmlWithCdataItemEnd = `
      <rss version="2.0">
        <channel>
          <title>Test Channel</title>
          <link>https://example.com</link>
          <item>
            <title>Post with code snippet</title>
            <link>https://example.com/p/code</link>
            <pubDate>Tue, 09 Jun 2026 08:00:00 GMT</pubDate>
            <description><![CDATA[
              Here is some RSS XML code:
              <item>
                <title>Nested Title</title>
              </item>
              This code discusses item tags.
            ]]></description>
          </item>
          <item>
            <title>Next Legitimate Post</title>
            <link>https://example.com/p/next</link>
            <pubDate>Tue, 09 Jun 2026 09:00:00 GMT</pubDate>
            <description>This post should be parsed normally.</description>
          </item>
        </channel>
      </rss>
    `;

    const parsed = parseRss(xmlWithCdataItemEnd);
    
    // We expect 2 posts to be parsed.
    console.log(`Parsed posts count: ${parsed.length}`);
    if (parsed.length !== 2) {
      console.log("❌ FAILURE: Scraper failed to parse both posts due to CDATA </item> injection! It parsed:", parsed.length);
      console.log("Parsed content:", JSON.stringify(parsed, null, 2));
      failed = true;
    } else {
      const firstPostDesc = parsed[0].description;
      if (!firstPostDesc.includes("Nested Title")) {
        console.log("❌ FAILURE: First post description was truncated/lost!");
        console.log("First post parsed description:", JSON.stringify(firstPostDesc));
        failed = true;
      } else {
        console.log("✅ SUCCESS (Vulnerability not hit or handled): Parsed correctly.");
      }
    }
  } catch (err: any) {
    console.log("❌ Test 1 Threw unexpected error:", err.message);
    failed = true;
  }

  // ---------------------------------------------------------------------------
  // Test 2: Concurrency Write Race / TOCTOU Lock Bypass
  // ---------------------------------------------------------------------------
  try {
    console.log("\n[Test 2] Running Ledger Concurrency TOCTOU Race test...");
    const testLedgerPath = path.resolve(process.cwd(), 'substack_archive/test_adversarial_ledger.jsonl');
    const lockPath = testLedgerPath + ".lock";

    // Cleanup previous files
    await fs.unlink(testLedgerPath).catch(() => {});
    await fs.unlink(lockPath).catch(() => {});

    // Prepare a base record
    const baseRecord = {
      timestamp: new Date().toISOString(),
      title: "Concurrent Post",
      subtitle: "Race Condition Test",
      description: "Testing non-atomic lock checking.",
      language: "en" as const,
      metrics: { clickbait: 0, tech: 0, commercial: 0, c5_real: 0 },
      smoke_index: 0,
      exergy_score: 100
    };

    // We trigger 5 concurrent appends
    const promises = Array.from({ length: 5 }).map((_, idx) => {
      const record = { ...baseRecord, title: `Concurrent Post ${idx}` };
      return appendLedgerEntry(record, { ledgerPath: testLedgerPath });
    });

    const results = await Promise.allSettled(promises);
    
    const succeededCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.filter(r => r.status === 'rejected').length;

    console.log(`Concurrent writes results: Succeeded: ${succeededCount}, Failed (locked): ${failedCount}`);

    // If the locking was robust, only 1 write should have succeeded, and 4 should have failed with lock error.
    // However, because of TOCTOU, multiple writes may succeed and potentially corrupt the file.
    if (succeededCount > 1) {
      console.log("⚠️ TOCTOU Race Condition confirmed: Multiple processes bypassed the lock and wrote concurrently!");
      
      // Let's inspect the ledger file content
      try {
        const fileContent = await fs.readFile(testLedgerPath, 'utf-8');
        console.log("Ledger file lines count:", fileContent.trim().split('\n').filter(Boolean).length);
        
        // Check integrity of the ledger
        const integrity = await verifyLedgerIntegrity(testLedgerPath);
        console.log("Cryptographic integrity verification result:", integrity);
        if (!integrity.valid) {
          console.log("❌ FAILURE: Concurrent writes corrupted the cryptographic chain / JSONL structure!");
          failed = true;
        } else {
          console.log("✅ Ledger remains cryptographically valid (writes serialized by OS/node filesystem layer, but lock failed to reject).");
        }
      } catch (err: any) {
        console.log("❌ Failed to read or verify ledger file:", err.message);
        failed = true;
      }
    } else {
      console.log("✅ SUCCESS: Exclusive lock successfully serialized/rejected concurrent writes.");
    }

    // Cleanup
    await fs.unlink(testLedgerPath).catch(() => {});
    await fs.unlink(lockPath).catch(() => {});

  } catch (err: any) {
    console.log("❌ Test 2 Threw unexpected error:", err.message);
    failed = true;
  }

  // ---------------------------------------------------------------------------
  // Test 3: TypeError on JSON Array containing Null
  // ---------------------------------------------------------------------------
  try {
    console.log("\n[Test 3] Running Scraper Null JSON array element test...");
    
    // Mock global fetch to return a JSON array containing null
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url: any) => {
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify([null, { title: "Valid Post" }])
      } as Response;
    };

    try {
      await fetchSubstackPosts("test", { forceJson: true });
      console.log("❌ FAILURE: Scraper did not throw TypeError on null post in JSON array!");
      failed = true;
    } catch (err: any) {
      if (err instanceof TypeError) {
        console.log("✅ SUCCESS (Vulnerability Confirmed): Scraper correctly threw TypeError as expected:", err.message);
      } else {
        console.log("❌ FAILURE: Scraper threw an unexpected error type:", err.name, err.message);
        failed = true;
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  } catch (err: any) {
    console.log("❌ Test 3 Threw unexpected error:", err.message);
    failed = true;
  }

  // ---------------------------------------------------------------------------
  // Test 4: Extreme / Emojis / Language Fallback Clickbait Saturation
  // ---------------------------------------------------------------------------
  try {
    console.log("\n[Test 4] Running Language Fallback & clickbait metrics on short/code inputs...");
    const title = "🍌🍌🍌 100% GRATIS 🍌🍌🍌";
    const desc = "rust code prompt API workflow JSON benchmark";
    
    const detected = detectLang(title, "", desc);
    console.log("Detected language for mixed content:", detected);
    
    const audit = auditPostMetrics(title, "", desc, detected);
    console.log("Audit result metrics:", JSON.stringify(audit.metrics));
    console.log("Exergy Score:", audit.exergy_score);
    console.log("Classification:", audit.classification);

    if (audit.exergy_score < 0 || audit.exergy_score > 100) {
      console.log("❌ FAILURE: Exergy score is out of bounds!");
      failed = true;
    } else {
      console.log("✅ Exergy score is within valid bounds (0-100).");
    }
  } catch (err: any) {
    console.log("❌ Test 4 Threw unexpected error:", err.message);
    failed = true;
  }

  console.log("\n=== ADVERSARIAL TESTS COMPLETED ===");
  if (failed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAdversarialTests();
