#!/usr/bin/env python3
"""
CORTEX Nash Equilibrium & Game Theoretic Linter (C5-REAL)
Audits Multi-Agent Ecosystems for Non-Cooperative Defection, Tragedy of the Commons,
Coordination Failures (Stag Hunt), and Sub-optimal Anergy Stability Traps.
"""

import json


def audit_nash(game_state: dict) -> dict:
    # 1. PRISONER'S DILEMMA: Defection Throttling Index
    # Competing agents spamming rate limits vs cooperating with polite backoffs
    cooperation_rate = game_state.get("cooperation_rate", 1.0)  # [0.0 - 1.0]
    shared_resource_demand = game_state.get("shared_resource_demand", 1.0)  # [0.0 - 2.0]

    defection_index = (
        (1.0 - cooperation_rate) * 0.6
        + min(max((shared_resource_demand - 1.0), 0.0), 1.0) * 0.4
    ) * 100.0

    # 2. TRAGEDY OF THE COMMONS: Resource Depletion Score
    # Depleting shared workspace memory, cache space, or file descriptors without local caching
    local_cache_hit_rate = game_state.get("local_cache_hit_rate", 1.0)  # [0.0 - 1.0]
    uses_compression = game_state.get("uses_compression", True)

    compression_penalty = 0.0 if uses_compression else 20.0
    depletion_score = (
        (shared_resource_demand / 2.0) * 50.0
        + (1.0 - local_cache_hit_rate) * 30.0
        + compression_penalty
    )

    # 3. STAG HUNT: Coordination Defect Metric
    # Mismatch in protocol schemas or API interfaces causing coordination failures
    protocol_alignment_rate = game_state.get("protocol_alignment_rate", 1.0)  # [0.0 - 1.0]
    coordination_defect = (1.0 - protocol_alignment_rate) * 100.0

    # 4. ANERGY STABILITY TRAP: Sub-optimal Nash Equilibrium
    # Systems locked in a stable, zero-progress state (e.g. infinite idle loops) to minimize local cost/errors
    task_progress_rate = game_state.get("task_progress_rate", 1.0)  # [0.0 - 1.0]
    exploration_factor = game_state.get("exploration_factor", 1.0)  # [0.0 - 1.0]

    trap_index = (
        (1.0 - task_progress_rate) * 0.7 + (1.0 - exploration_factor) * 0.3
    ) * 100.0

    # Calculate Total Coordination Exergy (ideal state: low defection, low depletion, low defect, low trap)
    total_coordination_exergy = 100.0 - (
        defection_index * 0.3
        + depletion_score * 0.25
        + coordination_defect * 0.25
        + trap_index * 0.2
    )
    total_coordination_exergy = max(min(total_coordination_exergy, 100.0), 0.0)

    verdict = "VERIFIED GAME COHERENCE - Pareto Optimal Nash Equilibrium"
    if total_coordination_exergy < 50.0:
        verdict = "REJECTED - Non-Cooperative Crash (Tragedy of the Commons / Defection Cascade)"
    elif trap_index > 75.0:
        verdict = "WARNING - Anergy Stability Trap Active (Sub-optimal Coordination Equilibrium)"

    return {
        "metrics": {
            "defection_throttling_index": round(defection_index, 2),
            "commons_depletion_score": round(depletion_score, 2),
            "coordination_defect_metric": round(coordination_defect, 2),
            "anergy_stability_trap": round(trap_index, 2),
        },
        "total_coordination_exergy": round(total_coordination_exergy, 2),
        "verdict": verdict,
    }


if __name__ == "__main__":
    # Test cases representing different multi-agent game states
    test_runs = {
        "Cooperative_Pareto_Optimal": {
            "cooperation_rate": 0.95,
            "shared_resource_demand": 0.8,
            "local_cache_hit_rate": 0.9,
            "uses_compression": True,
            "protocol_alignment_rate": 0.98,
            "task_progress_rate": 0.95,
            "exploration_factor": 0.8,
        },
        "Non_Cooperative_Tragedy": {
            "cooperation_rate": 0.15,
            "shared_resource_demand": 1.9,
            "local_cache_hit_rate": 0.2,
            "uses_compression": False,
            "protocol_alignment_rate": 0.4,
            "task_progress_rate": 0.1,
            "exploration_factor": 0.3,
        },
        "Anergy_Stability_Trap": {
            "cooperation_rate": 0.9,
            "shared_resource_demand": 0.4,
            "local_cache_hit_rate": 0.95,
            "uses_compression": True,
            "protocol_alignment_rate": 0.95,
            "task_progress_rate": 0.05,  # Stable but zero progress
            "exploration_factor": 0.0,   # No exploration
        }
    }

    for name, state in test_runs.items():
        result = audit_nash(state)
        print(f"\n=== Audit: {name} ===")
        print(f"Total Coordination Exergy: {result['total_coordination_exergy']}%")
        print(f"Metrics: {json.dumps(result['metrics'], indent=2)}")
        print(f"Verdict: {result['verdict']}")
