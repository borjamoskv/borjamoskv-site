// C5-REAL
// src/pages/api/exergy-sync.ts
// Astro API endpoint to sync cryptographic audits into Cloudflare D1 (SQL) and update the head in Cloudflare KV.

import type { APIRoute } from 'astro';

export const prerender = false;

// Helpers to parse hex or base64 into Uint8Array
function parseToUint8Array(str: string): Uint8Array {
  if (/^[0-9a-fA-F]+$/.test(str)) {
    const matches = str.match(/.{1,2}/g);
    if (matches) {
      return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
    }
  }
  try {
    const binaryString = atob(str);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    throw new Error(`Invalid format, must be hex or base64: ${str}`);
  }
}

// Compute SHA-256 hash of a string using Web Crypto API
async function computeSha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    
    // 1. Validate mandatory fields
    const required = ["timestamp", "title", "exergy_score", "prev_hash", "hash", "signature", "pubkey", "metrics"];
    for (const field of required) {
      if (!(field in body)) {
        return new Response(JSON.stringify({ success: false, error: `Missing required field: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const { timestamp, title, subtitle, description, language, metrics, smoke_index, exergy_score, prev_hash, hash, signature, pubkey } = body;

    // 2. Recompute and verify SHA-256 hash
    // Formula: hash = sha256(timestamp + title + exergy_score + prev_hash)
    const hashStr = `${timestamp}${title}${exergy_score}${prev_hash}`;
    const calculatedHash = await computeSha256(hashStr);

    if (hash !== calculatedHash) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Cryptographic hash mismatch. Calculated: ${calculatedHash}, received: ${hash}` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Verify Ed25519 signature
    let isSignatureValid = false;
    try {
      const pubkeyBytes = parseToUint8Array(pubkey);
      const signatureBytes = parseToUint8Array(signature);
      const hashBytes = new TextEncoder().encode(hash);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        pubkeyBytes,
        { name: "Ed25519", namedCurve: "Ed25519" },
        true,
        ["verify"]
      );

      isSignatureValid = await crypto.subtle.verify(
        "Ed25519",
        cryptoKey,
        signatureBytes,
        hashBytes
      );
    } catch (e) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Signature verification failed: ${(e as Error).message}` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!isSignatureValid) {
      return new Response(JSON.stringify({ success: false, error: "Invalid Ed25519 signature" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. Retrieve Bindings
    // @ts-ignore
    const env = locals?.runtime?.env;
    const db = env?.CORTEX_DB;
    const kv = env?.CORTEX_ENTROPY;

    if (!db || !kv) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Database or KV binding is not available in the current environment" 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. Verify the prev_hash matches the latest head in KV
    const latestHead = await kv.get("exergy_ledger_head");
    const expectedPrevHash = latestHead || "GENESIS";
    
    if (prev_hash !== expectedPrevHash) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Consensus chain gap. Expected prev_hash: ${expectedPrevHash}, received: ${prev_hash}` 
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 6. Insert into Cloudflare D1 SQLite Database
    await db.prepare(
      "INSERT INTO cortex_audit_ledger (hash, prev_hash, timestamp, title, subtitle, description, metrics, signature, pubkey) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(
      hash,
      prev_hash,
      timestamp,
      title,
      subtitle || "",
      description || "",
      JSON.stringify(metrics),
      signature,
      pubkey
    )
    .run();

    // 7. Update KV head cache
    await kv.put("exergy_ledger_head", hash, {
      metadata: { timestamp }
    });

    return new Response(JSON.stringify({
      success: true,
      hash,
      prev_hash
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
