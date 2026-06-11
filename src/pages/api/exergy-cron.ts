// C5-REAL
// src/pages/api/exergy-cron.ts
// Astro API endpoint to orchestrate Substack feed crawling, exergy evaluation, and cryptographic ledger updating.

import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fetchSubstackPosts } from '../../lib/substack/scraper';
import { detectLang, auditPostMetrics } from '../../lib/exergy/evaluator';
import { appendLedgerEntry } from '../../lib/ledger/cryptLedger';

export const prerender = false;

const handler: APIRoute = async ({ request, locals }) => {
  try {
    let kv: unknown = null;
    let mockPort: string | undefined = undefined;
    try {
      // @ts-ignore
      const cfWorkers = await import('cloudflare:workers');
      kv = cfWorkers.env?.CORTEX_ENTROPY;
      mockPort = cfWorkers.env?.MOCK_SERVER_PORT;
    } catch (e) {
      // Not in a cloudflare worker environment
    }
    if (!mockPort) {
      mockPort = process.env.MOCK_SERVER_PORT;
    }
    if (!mockPort) {
      // @ts-ignore
      mockPort = import.meta.env?.MOCK_SERVER_PORT;
    }
    const urlObj = new URL(request.url);
    
    let body: Record<string, unknown> = {};
    if (request.method === "POST") {
      try {
        body = await request.clone().json() as Record<string, unknown>;
      } catch (e) {
        // Body is not JSON or is empty
      }
    }

    const scenario = urlObj.searchParams.get("scenario") || (body.scenario as string | undefined) || "happy-es";
    const subdomain = urlObj.searchParams.get("subdomain") || (body.subdomain as string | undefined) || "borjamoskv";
    const forceJson = urlObj.searchParams.get("format") === "json" || 
                      urlObj.searchParams.get("forceJson") === "true" || 
                      (body.format as string | undefined) === "json" ||
                      body.forceJson === true;

    const ledgerPath = process.env.LEDGER_PATH || path.resolve(process.cwd(), 'substack_archive/exergy_ledger.jsonl');

    // Load existing ledger to find duplicates
    const existingTitles = new Set<string>();
    const existingLinks = new Set<string>();
    try {
      const data = await fs.readFile(ledgerPath, 'utf-8');
      const lines = data.trim().split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.title) existingTitles.add(entry.title);
          if (entry.link) existingLinks.add(entry.link);
        } catch (e) {}
      }
    } catch (e) {
      // Ledger might not exist yet, that's fine
    }

    if (kv) {
      try {
        const rawFallback = await kv.get("fallback_ledger");
        if (rawFallback) {
          const entry = JSON.parse(rawFallback);
          if (entry.title) existingTitles.add(entry.title);
          if (entry.link) existingLinks.add(entry.link);
        }
      } catch (e) {}
    }

    // Fetch posts
    const posts = await fetchSubstackPosts(subdomain, {
      forceJson,
      mockPort,
      scenario
    });

    let processedCount = 0;
    let newEntriesCount = 0;
    let latestHash = "GENESIS";

    // Deduplicate within the same feed response
    const seenInFeed = new Set<string>();
    const uniquePosts = posts.filter(post => {
      const key = post.link || post.title;
      if (!key) return false;
      if (seenInFeed.has(key)) return false;
      seenInFeed.add(key);
      return true;
    });

    for (const post of uniquePosts) {
      processedCount++;
      
      // Deduplicate against ledger history
      if (existingTitles.has(post.title) || (post.link && existingLinks.has(post.link))) {
        continue;
      }

      // Detect language
      const lang = detectLang(post.title, post.subtitle || "", post.description);

      // Audit metrics
      const audit = auditPostMetrics(post.title, post.subtitle || "", post.description, lang);

      // Construct timestamp
      let timestamp = new Date().toISOString();
      if (post.pubDate) {
        try {
          const parsedDate = new Date(post.pubDate);
          if (!isNaN(parsedDate.getTime())) {
            timestamp = parsedDate.toISOString();
          }
        } catch (e) {}
      }

      // Add to ledger
      const record = {
        timestamp,
        title: post.title,
        subtitle: post.subtitle || "",
        description: post.description,
        language: lang,
        metrics: audit.metrics,
        smoke_index: audit.smoke_index,
        exergy_score: audit.exergy_score,
        exergy: audit.exergy_score
      };

      const ledgerEntry = await appendLedgerEntry(record, {
        ledgerPath,
        kvNamespace: kv
      });

      newEntriesCount++;
      latestHash = ledgerEntry.hash || "GENESIS";
    }

    return new Response(JSON.stringify({
      success: true,
      processed_count: processedCount,
      processed_posts_count: processedCount,
      new_ledger_entries: newEntriesCount,
      latest_hash: latestHash,
      ledger_path: ledgerPath,
      cwd: process.cwd()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export const GET = handler;
export const POST = handler;
