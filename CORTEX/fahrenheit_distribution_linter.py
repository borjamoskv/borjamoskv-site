#!/usr/bin/env python3
"""
CORTEX Fahrenheit 451 Knowledge Distribution Linter (C5-REAL)
Audits Agentic Networks for Centralized Dependencies, Censorship Susceptibility,
and Decentralized P2P Resilience (Book People replication).
"""

import json
import hashlib
import time


def evaluate_node(node: dict) -> dict:
    name = node.get("node_alias", "Unnamed Node")
    centralization_ratio = node.get(
        "centralization_ratio", 0.5
    )  # [0.0 - 1.0] (1.0 = full dependency on central APIs)
    interception_risk = node.get(
        "interception_risk", 0.5
    )  # [0.0 - 1.0] (lack of encryption or scrubbing)
    local_persistence = node.get(
        "local_persistence", 0.5
    )  # [0.0 - 1.0] (SQLite, Git checkpoints, ROM partition)
    mesh_discovery = node.get(
        "mesh_discovery", 0.5
    )  # [0.0 - 1.0] (Dynamic peer discovery / DHT)

    # Bombero Index (Centralization vulnerability)
    bombero_score = centralization_ratio * 100.0

    # Sabueso Index (Censorship / Intrusion risk)
    sabueso_score = interception_risk * 100.0

    # Persona-Libro Index (Local-first persistence and autonomy)
    persona_libro_score = local_persistence * 100.0

    # Granger Index (Decentralized mesh routing capabilities)
    granger_score = mesh_discovery * 100.0

    # Formula: Exergy is driven by P2P capabilities and local persistence,
    # depleted by centralization (Bomberos) and security exposure (Sabueso).
    exergy = (persona_libro_score * 0.5 + granger_score * 0.5) * (
        1.0 - (centralization_ratio * 0.6 + interception_risk * 0.4) * 0.8
    )
    exergy_pct = max(round(exergy, 2), 0.0)

    classification = "Decentralized Persona-Libro (C5-REAL)"
    if centralization_ratio > 0.8:
        classification = "Centralized Firehouse Monolith (Anergy Source)"
    elif interception_risk > 0.8:
        classification = "Compromised Node (Sabueso target)"
    elif local_persistence < 0.2:
        classification = "Ephemeral Vaporware Node"

    return {
        "node_alias": name,
        "metrics": {
            "bombero_index": round(bombero_score, 2),
            "sabueso_index": round(sabueso_score, 2),
            "persona_libro_index": round(persona_libro_score, 2),
            "granger_index": round(granger_score, 2),
        },
        "exergy_score": exergy_pct,
        "classification": classification,
    }


def audit_network(nodes: list) -> dict:
    import os
    cortex_dir = os.path.dirname(os.path.abspath(__file__))
    status_path = os.path.join(cortex_dir, "fahrenheit_real_status.json")
    
    nodes_to_audit = list(nodes)
    if os.path.exists(status_path):
        try:
            with open(status_path, "r", encoding="utf-8") as f:
                real_status = json.load(f)
            nodes_to_audit.append({
                "node_alias": real_status.get("node_alias", "Granger_Local_Edge_PoC"),
                "centralization_ratio": real_status.get("centralization_ratio", 0.1),
                "interception_risk": real_status.get("interception_risk", 0.05),
                "local_persistence": real_status.get("local_persistence", 0.95),
                "mesh_discovery": real_status.get("mesh_discovery", 0.9)
            })
        except Exception:
            pass

    audited = [evaluate_node(n) for n in nodes_to_audit]
    if not audited:
        return {}

    avg_exergy = sum(n["exergy_score"] for n in audited) / len(audited)
    verdict = (
        "VERIFIED - Resilient Decentralized Knowledge Mesh"
        if avg_exergy >= 60
        else "REJECTED - Firehouse Centralization Detected"
    )

    raw_data = json.dumps(audited, sort_keys=True).encode()
    ledger_hash = hashlib.sha256(raw_data).hexdigest()

    return {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "average_exergy": round(avg_exergy, 2),
        "verdict": verdict,
        "hash": ledger_hash,
        "nodes": audited,
    }



if __name__ == "__main__":
    # Test cases representing different topological designs
    test_nodes = [
        {
            "node_alias": "Central_Cloud_Monolith",
            "centralization_ratio": 1.0,  # Full cloud API lock-in
            "interception_risk": 0.9,  # Sending raw logs to external dashboards
            "local_persistence": 0.05,  # Ephemeral memory only
            "mesh_discovery": 0.0,  # Central registry only
        },
        {
            "node_alias": "Granger_Edge_Node_01",
            "centralization_ratio": 0.1,  # Local inference fallback active
            "interception_risk": 0.05,  # Encrypted WASM runtime
            "local_persistence": 0.95,  # Git + SQLite sharded persistence
            "mesh_discovery": 0.9,  # Peer discovery enabled
        },
        {
            "node_alias": "Hybrid_Scribe_Node_02",
            "centralization_ratio": 0.2,  # Local fallback + partial cloud sync
            "interception_risk": 0.1,  # Encrypted transport
            "local_persistence": 0.9,  # SQLite local db + Git mesh
            "mesh_discovery": 0.8,  # Hybrid dynamic peer table
        },
    ]

    result = audit_network(test_nodes)
    print(json.dumps(result, indent=2, ensure_ascii=False))
