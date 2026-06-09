# Original User Request

## Initial Request — 2026-06-09T09:37:11+02:00

An automated tool (cron/worker) that extracts and evaluates the exergy score of new Substack posts in real-time.

Working directory: `/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site`

## Requirements

### R1. Substack Monitoring & Feed Extraction
- Monitor a Substack feed (e.g., RSS feed `https://borjamoskv.substack.com/feed` or API archive endpoints) to discover new posts.
- Extract post title, subtitle, and description text.

### R2. Exergy Evaluation Logic
- Calculate the exergy score of the extracted posts.
- Implement the exact language-specific formula and patterns (ES/EN) defined in [mass_exergy_scanner.py](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/substack_archive/mass_exergy_scanner.py).
- The metric breakdown must include: Clickbait, Tech, Commercial, and C5-Real scores.

### R3. Cryptographic Ledger Persistence
- Log results in a JSONL ledger on disk at `substack_archive/exergy_ledger.jsonl`.
- Each ledger entry must contain a SHA-256 hash chaining to the previous entry (`prev_hash`), starting with `GENESIS` for the first record.
- Support Cloudflare KV storage as a fallback/write target if executed in the Cloudflare Worker runtime (using Astro `locals.runtime.env` or binding).

### R4. Execution & Integration Platform
- Implement the logic inside the existing Astro project at `/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site`.
- Provide an API route (e.g., `src/pages/api/exergy-cron.ts`) that runs the check. This API route will be compatible with Cloudflare Workers cron triggers.

## Acceptance Criteria

### AC1. Verification Against Reference Code
- Include an automated verification test that checks the exergy scoring logic against the reference script `mass_exergy_scanner.py` using sample texts.

### AC2. Cryptographic Integrity
- The ledger file `exergy_ledger.jsonl` must maintain cryptographic consistency where `hash` correctly hashes the current block metadata concatenated with `prev_hash`.

### AC3. Error Resilience
- Scraping failures, feed rate limits, or network timeouts must be handled gracefully without crashing the endpoint or server.
