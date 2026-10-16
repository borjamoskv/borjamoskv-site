# AGENTS.md — Sovereign Execution Contract (`INV_C5_AGENT_GATE`)

Any autonomous agent, LLM harness, or automated refactoring tool operating on this repository MUST obey the following hard invariants:

## 1. Epistemic & Authority Boundaries
* **O1 (`SOURCE ≠ INFERENCE`):** Never overwrite primary telemetry, WORM ledgers, or SHA-256 lineage tables with synthetic or inferred data.
* **O2 (`INFERENCE ≠ AUTHORITY`):** Destructive mutations (database drops, branch force-pushes, key rotations) require explicit human or hardware-enclave (`COSE_Sign1`) authorization.
* **O5 (`DECISION ≠ EFFECT`):** Every state transition must be verified by deterministic test execution (`cargo test`, `lean`, `pytest`) before reporting completion.

## 2. Code & Verification Hygiene
* **Zero-Sorry Invariant (Lean 4 / SMT):** Never introduce `sorry`, `admit`, or `axiom` shortcuts to bypass proof obligations.
* **Rust Ring-0 Discipline:** Preserve 64-byte cache-line alignment (`#[repr(align(64))]`) on lock-free primitives (`SeqlockCell`, SPSC/SPMC rings) and avoid heap allocations in hot paths.
* **Zero External Bloat:** Do not add third-party dependencies to zero-dep kernels (`axiom-0`, `c5-socint-extraction-suite`) without explicit architectural sign-off.
* **Strict English Invariant (AP-03):** Commit messages, public docstrings, and repository metadata must be written in precise technical English.
