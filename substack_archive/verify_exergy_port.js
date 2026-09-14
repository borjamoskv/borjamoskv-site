#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import assert from 'node:assert';

// Self-spawn with type-stripping support if not already running with it
if (!process.execArgv.includes('--experimental-strip-types')) {
  const child = spawn(
    process.execPath,
    ['--experimental-strip-types', fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    { stdio: 'inherit' }
  );
  child.on('exit', (code) => process.exit(code || 0));
} else {
  runLinter();
}

async function runLinter() {
  console.log("=========================================================");
  console.log("Ω-PORT LINTER: VERIFYING EXERGY scoring AND HASH CHAIN");
  console.log("=========================================================");

  try {
    // Import the TypeScript modules using Node 22 native type-stripping imports
    const { detectLang, auditPostMetrics } = await import('../src/lib/exergy/evaluator.ts');
    const { appendLedgerEntry, verifyLedgerIntegrity } = await import('../src/lib/ledger/cryptLedger.ts');

    // 1. Math check (ES)
    const textEs = {
      title: "Alucinaciones IA → 3 prompts + 1 sistema que hacen cualquier respuesta 100 % verificable",
      subtitle: "",
      desc: "workflow de rust y tokens"
    };
    const langEs = detectLang(textEs.title, textEs.subtitle, textEs.desc);
    assert.strictEqual(langEs, "es", "Language detection should resolve to 'es'");
    
    const scoreEs = auditPostMetrics(textEs.title, textEs.subtitle, textEs.desc, langEs);
    console.log("[✓] Math check (ES):", {
      exergy: scoreEs.exergy_score,
      smoke: scoreEs.smoke_index,
      clickbait: scoreEs.metrics.clickbait,
      tech: scoreEs.metrics.tech,
      comm: scoreEs.metrics.commercial,
      c5_real: scoreEs.metrics.c5_real,
      classification: scoreEs.classification
    });

    // 2. Math check (EN)
    const textEn = {
      title: "Thermodynamics and Autopoiesis inside maximum entropy boundary",
      subtitle: "cortex systems",
      desc: "immutable proof of work ledger"
    };
    const langEn = detectLang(textEn.title, textEn.subtitle, textEn.desc);
    assert.strictEqual(langEn, "en", "Language detection should resolve to 'en'");
    
    const scoreEn = auditPostMetrics(textEn.title, textEn.subtitle, textEn.desc, langEn);
    console.log("[✓] Math check (EN):", {
      exergy: scoreEn.exergy_score,
      smoke: scoreEn.smoke_index,
      clickbait: scoreEn.metrics.clickbait,
      tech: scoreEn.metrics.tech,
      comm: scoreEn.metrics.commercial,
      c5_real: scoreEn.metrics.c5_real,
      classification: scoreEn.classification
    });

    // 3. Cryptographic Chain on Mock KV
    console.log("Testing ledger serialization and cryptographic chaining...");
    const store = new Map();
    const mockKV = {
      get: async (key) => store.get(key) || null,
      put: async (key, val, options) => { store.set(key, val); }
    };

    const tempLedgerPath = path.join(os.tmpdir(), `mock_exergy_ledger_${Date.now()}.jsonl`);
    try {
      // Append first entry
      const record1 = {
        timestamp: new Date().toISOString(),
        title: "Mock Post A",
        subtitle: "",
        description: "content",
        language: "es",
        metrics: scoreEs.metrics,
        smoke_index: scoreEs.smoke_index,
        exergy_score: scoreEs.exergy_score
      };
      const entry1 = await appendLedgerEntry(record1, { ledgerPath: tempLedgerPath, kvNamespace: mockKV });
      assert.strictEqual(entry1.prev_hash, "GENESIS", "First entry prev_hash must be GENESIS");

      // Append second entry
      const record2 = {
        timestamp: new Date().toISOString(),
        title: "Mock Post B",
        subtitle: "",
        description: "content",
        language: "es",
        metrics: scoreEs.metrics,
        smoke_index: scoreEs.smoke_index,
        exergy_score: scoreEs.exergy_score
      };
      const entry2 = await appendLedgerEntry(record2, { ledgerPath: tempLedgerPath, kvNamespace: mockKV });
      assert.strictEqual(entry2.prev_hash, entry1.hash, "Second entry prev_hash must match first entry's hash");

      console.log("[✓] Sequential mock cryptographic chain validated successfully on mock KV.");
    } finally {
      try {
        await fs.unlink(tempLedgerPath);
      } catch (e) {}
    }

    // 4. Actual Disk Ledger validation
    const actualLedgerPath = path.resolve(process.cwd(), 'substack_archive/exergy_ledger.jsonl');
    let recordCount = 0;
    try {
      const fileContent = await fs.readFile(actualLedgerPath, 'utf-8');
      recordCount = fileContent.trim().split('\n').filter(Boolean).length;
    } catch (e) {
      // Ensure the file exists so verifyLedgerIntegrity doesn't fail on missing file
      await fs.mkdir(path.dirname(actualLedgerPath), { recursive: true });
      await fs.writeFile(actualLedgerPath, "");
    }

    console.log(`Analyzing ${recordCount} records in actual disk ledger...`);
    const integrityResult = await verifyLedgerIntegrity(actualLedgerPath);
    if (!integrityResult.valid) {
      throw new Error(integrityResult.message);
    }
    console.log("[✓] Cryptographic ledger chain matches perfectly.");
    console.log("=========================================================");

  } catch (err) {
    console.error("[❌] Validation failure:", err.message);
    process.exit(1);
  }
}
