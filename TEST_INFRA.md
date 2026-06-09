# Substack Exergy Evaluator Test Infrastructure

This document describes the automated E2E test suite and runner designed for the Substack Exergy Evaluator in accordance with the requirements set in `ORIGINAL_REQUEST.md`.

## 1. Architecture Choice & Rationale

- **Language**: Python 3.
- **Why Python?**: Python is lightweight, has built-in HTTP server capabilities (`http.server`), lacks complex package manager conflicts that are common in Node.js testing libraries (e.g. Playwright/Cypress conflicts with edge adapters), is highly cross-platform, and allows direct import/invocation of the reference `mass_exergy_scanner.py` script.
- **Framework**: Standard `unittest` framework from Python.

## 2. Directory Layout

The test suite is structured as follows:

```
tests/e2e/
├── mock_server.py    # Mock RSS Feed, API Archive, and Recommendations HTTP server
├── test_cases.py     # 60 structured test cases across Tiers 1-4
└── run_tests.py      # Main test runner that orchestrates servers, tests, and cleanup
```

---

## 3. Mock Feed Server (`tests/e2e/mock_server.py`)

A local mock HTTP server runs on port `8012` during the test execution. It handles three core endpoints mimicking Substack API and RSS architecture:
1. `GET /feed` or `/feed/`: Simulates the Substack RSS feeds.
2. `GET /api/v1/archive`: Simulates the Substack archive posts metadata endpoints.
3. `GET /api/v1/recommendations/from/{pub_id}`: Simulates Substack publication recommendations endpoint.

### Scenarios Enforced via Query Parameter (`?scenario=<name>`)
- `happy-es`: Normal Spanish feed with two posts.
- `happy-en`: Normal English feed with one post.
- `empty`: Feed returning zero posts.
- `malformed`: Feed with truncated or corrupted XML/JSON structure.
- `huge`: Feed containing a post with 100,000 words to test boundary size handling.
- `clickbait`: Spanish post containing clickbait terms to verify clickbait scoring (max score 100).
- `tech`: English post containing high-density tech terms to verify technical classification.
- `commercial`: Post containing sponsor words to verify commercial classification.
- `c5`: Post containing C5-REAL keywords to verify high C5 classification score.
- `mixed-lang`: Feed containing a mix of Spanish and English posts.
- `duplicates`: Feed containing duplicate items to verify crawler deduplication logic.
- `rate-limit`: Simulates network failure by responding with HTTP 429.
- `timeout`: Simulates timeout condition by sleeping for 3 seconds before responding.
- `http-500`: Simulates server-side failure by responding with HTTP 500.

---

## 4. Test Tiers & Execution Scenarios

The test suite implements exactly **60 test cases** structured across 4 distinct Tiers:

### Tier 1: Feature Coverage (25 cases)
- **Feed Scraping (5 cases)**: Verifies valid RSS, JSON archive extraction, specific field extraction, empty feeds, and invalid URL handling.
- **Exergy Calculation (5 cases)**: Verifies scoring for ES and EN posts, and classifications (C5, Tech, Commercial) against the reference code.
- **Cryptographic Ledger (5 cases)**: Verifies Genesis entry structure, SHA-256 calculation, chaining, JSONL formatting, and validation.
- **Cloudflare KV Integration (5 cases)**: Verifies KV read/write, local fallback, optimistic locking, and empty state.
- **API Integration (5 cases)**: Verifies `/api/exergy-cron` trigger, auth parameters, response headers, response format, and HTTP statuses.

### Tier 2: Boundary & Corner Cases (25 cases)
- Evaluates behavior with empty title, subtitle, and description.
- Evaluates behavior with huge inputs (100k+ words).
- Mocks network failures (rate-limiting HTTP 429, timeouts, and HTTP 500 errors).
- Validates ledger detection of invalid JSONL lines, missing/altered `prev_hash`, or tampered signatures.
- Evaluates edge cases in language detection (short, mixed, number-only).
- Evaluates score saturation for clickbait, technical, commercial, and C5-REAL categories.
- Simulates rapid concurrent requests.
- Validates KV write/read exceptions and file permission errors.

### Tier 3: Cross-Feature Combinations (5 cases)
- Validates mixed languages in the same feed.
- Simulates concurrent cron executions.
- Simulates ledger write file locks under concurrency.
- Validates deduplication of already processed posts and duplicate items within a single feed.
- Verifies handling of updated/modified posts.

### Tier 4: Real-world Scenarios (5 cases)
- **Multi-step crawler runs**: Ensures chaining is maintained across multiple distinct cron runs.
- **Historic ledger validation**: Validates cryptographic chaining on a ledger with 10 existing valid entries.
- **Ledger corruption detection**: Ensures the validator correctly identifies and flags tampering in the middle of a 10-record ledger.
- **Mixed feed aggregates**: Verifies accurate statistics aggregation for a feed with diverse categories.
- **Transient error recovery**: Verifies that the crawler handles initial rate limits and recovers on subsequent retries.

---

## 5. Verification Logic

### 5.1 Exergy Logic Verification (AC1)
The E2E tests import the `audit_text` function directly from `substack_archive/mass_exergy_scanner.py`. Every test case performing exergy evaluation compares its results against this reference function.

### 5.2 Cryptographic Ledger Integrity (AC2)
A dedicated `verify_ledger_file_integrity` function in `tests/e2e/test_cases.py` scans a JSONL ledger, checks the presence of all required fields, verifies that `prev_hash` of line $N$ matches the `hash` of line $N-1$, and re-calculates the SHA-256 hash using the exact serialization schema:
$$\text{SHA-256}(\text{timestamp} + \text{title} + \text{exergy} + \text{prev\_hash})$$

---

## 6. How to Run the Tests

Execute the test runner script using:

```bash
python3 tests/e2e/run_tests.py
```

The runner will:
1. Start the mock feed server on port `8012` in a background thread.
2. Check if Astro is running on port `4321`. If not, it spawns `npx astro dev --port 4321` in the background and polls until reachable.
3. Execute the 60 E2E and unit test cases.
4. Verify the cryptographic integrity of the ledger file.
5. Gracefully stop all servers and terminate background processes.
