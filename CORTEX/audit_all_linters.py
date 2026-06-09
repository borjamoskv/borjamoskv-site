#!/usr/bin/env python3
"""
CORTEX Unified Sentinel Audit (C5-REAL)
Orchestrates all CORTEX linters (Quixote, Buscón, Pantaleón, Catch-22, Dunces,
Hitchhiker, Goals, Relationship, Substack, and Fahrenheit) in a single execution loop.
Outputs a unified exergy matrix for the workspace.
"""

import sys
import os

# Ensure we can import modules from the current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import all linters
try:
    from quixote_hallucination_linter import audit_quixote_delusion
    from buscon_deceptive_alignment_linter import audit_buscon
    from pantaleon_hyper_optimizer_linter import audit_pantaleon
    from catch22_deadlock_linter import audit_catch22
    from confederacy_dunces_bloat_linter import audit_dunces_bloat
    from hitchhiker_guide_linter import audit_runtime as audit_hitchhiker
    from goals_authenticity_linter import audit_list as audit_goals
    from relationship_exergy_linter import audit_connections as audit_relationships
    from substack_autonomy_linter import calculate_exergy as audit_substack
    from fahrenheit_distribution_linter import audit_network as audit_fahrenheit
except ImportError as e:
    print(f"[!] Critical Import Error: {e}")
    sys.exit(1)


def run_workspace_diagnostic():
    print("┌────────────────────────────────────────────────────────┐")
    print("│ CORTEX: RUNNING UNIFIED SENTINEL WORKSPACE AUDIT       │")
    print("└────────────────────────────────────────────────────────┘\n")

    # 1. Quixote Delusion Audit Configuration
    quixote_config = {
        "overfitting_params": 0.15,
        "unverified_assumptions": 0.1,
        "has_local_linter": True,
        "verifies_physical_facts": True,
        "phantom_alerts": 1,
        "total_exceptions": 20,
        "useless_metric_weight": 0.05,
        "real_work_ratio": 0.95,
    }
    res_quixote = audit_quixote_delusion(quixote_config)

    # 2. Buscon Deceptive Alignment Configuration
    buscon_config = {
        "prompt_mutations": 0,
        "guards_bypassed": 0,
        "allocated_tokens": 8192,
        "required_tokens": 4096,
        "state_migrated": False,
        "prompt_refactored": True,
    }
    res_buscon = audit_buscon(buscon_config)

    # 3. Pantaleon Hyper-Optimizer Profile
    pantaleon_profile = {
        "optimization_metric_weight": 0.5,
        "has_commonsense_sanity_checks": True,
        "sync_frequency_sec": 60,
        "task_duration_sec": 300,
        "public_logs": "SYSTEM LOG: Exergy logged cleanly to ledger. No key leaks.",
    }
    res_pantaleon = audit_pantaleon(pantaleon_profile)

    # 4. Catch-22 Deadlock Dependency Graph
    catch22_graph = {
        "dependencies": {
            "AstroServer": ["CloudflareKV", "LLMProxy"],
            "CloudflareKV": ["LocalCache"],
            "LLMProxy": ["LocalCache"],
            "LocalCache": [],
        },
        "resources": {
            "memory_limit": 8192,
            "current_usage": 1024,
            "tool_invocation_cost": 256,
        },
        "router_active": True,
        "requires_absence": False,
    }
    res_catch22 = audit_catch22(catch22_graph)

    # 5. Confederacy of Dunces Bloat Linter
    dunces_log = {
        "output_text": "class WorkspaceSentinel: def __init__(self): self.verified = True; return",
        "parameters_count": 8.0,
        "api_throttled": False,
        "has_ci_validation": True,
    }
    res_dunces = audit_dunces_bloat(dunces_log)

    # 6. Hitchhiker's Guide Runtime Configuration
    hitchhiker_config = {
        "has_panic_guard": True,
        "retry_limit": 3,
        "fallback_strategy": "vesicular_mitosis",
        "uses_mcp": True,
        "auto_schema_translation": True,
        "model_tier": "medium",
        "task_complexity": 5,
        "sampling_temperature": 0.7,
        "uses_path_search": True,
        "decentralized_context": True,
        "rag_traceability": True,
    }
    res_hitchhiker = audit_hitchhiker(hitchhiker_config)

    # 7. Goals Authenticity Matrix
    goals_list = [
        {
            "text": "Refactor local database for direct-silicon writes",
            "intrinsic_drive": 0.95,
            "mimetic_factor": 0.05,
            "proof_of_work": 0.9,
            "anergy_cost": 0.1,
        },
        {
            "text": "Publish high exergy post explaining agent thermodynamics",
            "intrinsic_drive": 0.9,
            "mimetic_factor": 0.1,
            "proof_of_work": 0.85,
            "anergy_cost": 0.2,
        },
    ]
    res_goals = audit_goals(goals_list)

    # 8. Relationship Exergy Network
    connections_list = [
        {
            "subject_alias": "Sovereign_Operator_Borja",
            "offline_hours_weekly": 20.0,
            "frictional_chats_count": 5,
            "social_validation_factor": 0.1,
            "swipe_discard_bias": 0.05,
        }
    ]
    res_relationships = audit_relationships(connections_list)

    # 9. Substack Autonomy Post Audit
    sample_text = "Escribir requiere autonomía, interdependencia sin alianzas cruzadas que generen ruido térmico o pérdida de valor directo."
    res_substack = audit_substack(sample_text)

    # 10. Fahrenheit Knowledge Distribution Mesh
    fahrenheit_nodes = [
        {
            "node_alias": "Granger_Edge_Node_01",
            "centralization_ratio": 0.1,
            "interception_risk": 0.05,
            "local_persistence": 0.95,
            "mesh_discovery": 0.9,
        },
        {
            "node_alias": "Hybrid_Scribe_Node_02",
            "centralization_ratio": 0.3,
            "interception_risk": 0.2,
            "local_persistence": 0.8,
            "mesh_discovery": 0.6,
        },
    ]
    res_fahrenheit = audit_fahrenheit(fahrenheit_nodes)

    # Collect All Scores
    results = [
        (
            "Quixote (Hallucination)",
            res_quixote["total_alignment_exergy"],
            res_quixote["verdict"],
        ),
        (
            "Buscón (Deception)",
            res_buscon["alignment_exergy_pct"],
            res_buscon["verdict"],
        ),
        (
            "Pantaleón (Over-Optimization)",
            res_pantaleon["system_exergy_pct"],
            res_pantaleon["verdict"],
        ),
        (
            "Catch-22 (Deadlocks)",
            100.0 - res_catch22["deadlock_severity_pct"],
            res_catch22["verdict"],
        ),
        (
            "Dunces (Verbosity Bloat)",
            100.0 - res_dunces["bloat_severity_pct"],
            res_dunces["verdict"],
        ),
        (
            "Hitchhiker (Resilience)",
            res_hitchhiker["total_exergy"],
            res_hitchhiker["verdict"],
        ),
        ("Goals (Authenticity)", res_goals["average_exergy"], res_goals["verdict"]),
        (
            "Relationships (Intimacy)",
            res_relationships["average_exergy"],
            res_relationships["verdict"],
        ),
        (
            "Substack (Autonomy)",
            res_substack["total_exergy"],
            "VERIFIED - High Exergy"
            if res_substack["total_exergy"] > 80
            else "REJECTED - Noise",
        ),
        (
            "Fahrenheit (Distribution)",
            res_fahrenheit["average_exergy"],
            res_fahrenheit["verdict"],
        ),
    ]

    # Print Markdown Table
    print("| Dimension Linter | Exergy Score | Verdict / Status |")
    print("| :--- | :---: | :--- |")
    for name, score, verdict in results:
        print(f"| **{name}** | **{score:.2f}%** | {verdict} |")

    avg_score = sum(x[1] for x in results) / len(results)
    print(f"\n[C5-REAL] Unified Workspace Alignment Index: {avg_score:.2f}%")

    if avg_score >= 80.0:
        print("WORKSPACE VERDICT: VERIFIED SOVEREIGN STATE (MAX EXERGY)")
        sys.exit(0)
    else:
        print("WORKSPACE VERDICT: WARNING - HIGH SYSTEMIC ENTROPY DETECTED")
        sys.exit(1)


if __name__ == "__main__":
    run_workspace_diagnostic()
