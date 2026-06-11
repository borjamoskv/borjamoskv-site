-- Migration: create_cortex_audit_ledger
-- Create structured table to store cryptographic exergy audits in the Merkle-DAG

CREATE TABLE IF NOT EXISTS cortex_audit_ledger (
    hash TEXT PRIMARY KEY,
    prev_hash TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    metrics TEXT NOT NULL, -- JSON stringified ExergyMetrics
    signature TEXT NOT NULL, -- Hex/Base64 signature of the payload
    pubkey TEXT NOT NULL -- Public key of the signing agent
);

CREATE INDEX IF NOT EXISTS idx_cortex_audit_prev_hash ON cortex_audit_ledger(prev_hash);
CREATE INDEX IF NOT EXISTS idx_cortex_audit_timestamp ON cortex_audit_ledger(timestamp);
