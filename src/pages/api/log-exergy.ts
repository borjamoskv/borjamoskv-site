import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 });
    }

    // Determine path to exergy_ledger.json in the project root
    const ledgerPath = path.resolve(process.cwd(), 'exergy_ledger.json');
    let ledger = [];
    
    try {
      const data = await fs.readFile(ledgerPath, 'utf-8');
      ledger = JSON.parse(data);
    } catch (e) {
      // File might not exist or be invalid, start fresh
      ledger = [];
    }

    const prevHash = ledger.length > 0 ? ledger[ledger.length - 1].hash : 'GENESIS';
    
    // Create new C5-REAL entry
    const entry = {
      timestamp: new Date().toISOString(),
      subject_type: "Ghostface-Anomaly",
      metrics: {
        AFI: 0.99,
        ESR: 0.10,
        MVO: 0.50,
        MII: 0.99,
        SADE: 0.85,
        AMB: 0.99
      },
      obes_score: Math.random(),
      prompt_trace: prompt,
      prev_hash: prevHash,
      reality_level: "C5-REAL"
    };

    const hashStr = entry.timestamp + entry.subject_type + entry.obes_score + entry.prev_hash;
    entry.hash = crypto.createHash('sha256').update(hashStr).digest('hex');

    ledger.push(entry);

    // Only write in local dev if possible (Cloudflare workers in prod won't allow fs writes)
    // We wrap it in try-catch to avoid crashing if deployed to edge.
    try {
      await fs.writeFile(ledgerPath, JSON.stringify(ledger, null, 2));
    } catch(e) {
      console.warn("Could not write to local exergy ledger (possibly in Edge runtime).");
    }

    return new Response(JSON.stringify({ success: true, hash: entry.hash }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
};
