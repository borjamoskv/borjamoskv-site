# Project: Substack Exergy Evaluator

## Architecture
- **Feed Scraper**: Fetches Substack RSS or API archive endpoints (e.g., `https://borjamoskv.substack.com/feed` or `/api/v1/archive`) to discover recent posts. Resolves network retries and handles errors.
- **Exergy Evaluator**: Analyzes text content using language-specific (ES/EN) regex patterns to calculate density and scores for Clickbait, Tech, Commercial, and C5-Real.
- **Cryptographic Ledger**: Persists audits in a JSONL file at `substack_archive/exergy_ledger.jsonl`. Each record has a SHA-256 signature chaining to the previous record's hash, using `GENESIS` for the first record. In Cloudflare Workers environments, falls back or writes to Cloudflare KV.
- **Astro API Endpoint**: Integrates these components under `src/pages/api/exergy-cron.ts`, triggered by a GET/POST request (compatible with Cloudflare Workers Cron triggers).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E1 | E2E Testing Track | Define test architecture, write test cases (Tiers 1-4), and publish `TEST_READY.md`. | None | DONE |
| I1 | Scraper Module | Build feed extraction logic from Substack feed/API, extracting title, subtitle, and description. | None | PLANNED |
| I2 | Exergy Evaluator | Port formula and patterns from `mass_exergy_scanner.py` to TS/JS. | None | PLANNED |
| I3 | Cryptographic Ledger | Develop JSONL append-only persistence with SHA-256 chaining and Cloudflare KV support. | None | PLANNED |
| I4 | API Route Integration | Integrate scraper, evaluator, and ledger into `src/pages/api/exergy-cron.ts`. | I1, I2, I3 | PLANNED |
| I5 | E2E Validation | Verify implementation passes 100% of E2E tests from `TEST_READY.md`. | E1, I4 | PLANNED |
| I6 | Adversarial Hardening | Challenger-led Tier 5 test coverage and robustness audit. | I5 | PLANNED |

## Interface Contracts
### Scraper ↔ Evaluator
- Output of Scraper / Input to Evaluator:
```typescript
interface SubstackPost {
  title: string;
  subtitle: string;
  description: string;
  link?: string;
  pubDate?: string;
}
```

### Evaluator ↔ Ledger
- Output of Evaluator / Input to Ledger:
```typescript
interface ExergyMetrics {
  clickbait: number; // 0 - 100
  tech: number;       // 0 - 100
  commercial: number; // 0 - 100
  c5_real: number;    // 0 - 100
}

interface ExergyAuditRecord {
  timestamp: string;      // ISO-8601
  title: string;
  subtitle: string;
  description: string;
  language: "es" | "en";
  metrics: ExergyMetrics;
  smoke_index: number;
  exergy_score: number;
  prev_hash: string;
  hash?: string;          // Added during persistence
}
```

### API Endpoint Response
- Success Response:
```json
{
  "success": true,
  "processed_posts_count": number,
  "new_ledger_entries": number,
  "latest_hash": string
}
```

## Code Layout
- `src/lib/substack/scraper.ts`: Scrapes feed or API endpoints.
- `src/lib/exergy/evaluator.ts`: Contains patterns and calculates exergy metrics.
- `src/lib/ledger/cryptLedger.ts`: Manages JSONL serialization, SHA-256 hashing, and Cloudflare KV writes.
- `src/pages/api/exergy-cron.ts`: Handles requests and invokes the scanning orchestrator.
- `tests/e2e/`: E2E test scripts and fixtures.
