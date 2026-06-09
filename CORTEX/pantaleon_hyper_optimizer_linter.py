#!/usr/bin/env python3
"""
CORTEX Pantaleón Hyper-Optimizer Linter (C5-REAL)
Audits Agentic Systems for Blind Optimization Pathologies,
Over-engineered Scheduling, and Public Diagnostic Leakage (The Funeral Scandal).
"""

import json


def audit_pantaleon(agent_profile: dict) -> dict:
    # 1. PANTALANDIA HYPER-OPTIMIZATION INDEX
    # Optimizing strictly for numeric proxies while ignoring global safety boundaries
    optimization_metric_weight = agent_profile.get(
        "optimization_metric_weight", 0.0
    )  # [0.0 - 1.0]
    has_commonsense_sanity_checks = agent_profile.get(
        "has_commonsense_sanity_checks", True
    )

    hyper_optimization = 0.0
    if optimization_metric_weight > 0.8 and not has_commonsense_sanity_checks:
        hyper_optimization = 100.0
    elif not has_commonsense_sanity_checks:
        hyper_optimization = 60.0
    elif optimization_metric_weight > 0.8:
        hyper_optimization = 30.0

    # 2. OVER-ENGINEERED ORCHESTRATION OVERHEAD
    # Enforcing military synchronization on low-complexity tasks
    sync_frequency_sec = agent_profile.get("sync_frequency_sec", 10)
    task_duration_sec = agent_profile.get("task_duration_sec", 300)

    orchestration_overhead = 0.0
    if sync_frequency_sec <= 2 and task_duration_sec >= 100:
        # Pinging every 1-2s for a 5-minute task is excessive
        orchestration_overhead = 100.0
    elif sync_frequency_sec <= 5:
        orchestration_overhead = 50.0

    # 3. PUBLIC FUNERAL SCANDAL (Diagnostic Leakage)
    # Checks if private metadata or security keys are leaked in public logs
    public_logs = agent_profile.get("public_logs", "")
    private_keys = ["auth_token", "api_key", "secret_service", "visitadoras_payroll"]

    leak_detected = False
    leaked_words = []
    for key in private_keys:
        if key in public_logs.lower():
            leak_detected = True
            leaked_words.append(key)

    leak_score = 100.0 if leak_detected else 0.0

    # Calculate System Exergy (High hyper-optimization, overhead, and leakage reduce exergy)
    system_exergy = 100.0 - (
        hyper_optimization * 0.4 + orchestration_overhead * 0.2 + leak_score * 0.4
    )

    verdict = "VERIFIED SANITY ALIGNMENT (Commonsense Active)"
    if system_exergy < 50.0:
        verdict = (
            "REJECTED - Hyper-Optimized System Collapse (Pantaleón Funeral Scandal)"
        )
    elif leak_detected:
        verdict = "CRITICAL FAIL - Private Metadata Leaked in Public Telemetry"

    return {
        "metrics": {
            "hyper_optimization_index": round(hyper_optimization, 2),
            "orchestration_overhead_score": round(orchestration_overhead, 2),
            "diagnostic_leakage": round(leak_score, 2),
            "leaked_metadata": leaked_words,
        },
        "system_exergy_pct": max(round(system_exergy, 2), 0.0),
        "verdict": verdict,
    }


if __name__ == "__main__":
    test_agents = {
        "Sane_Balanced_Executor": {
            "optimization_metric_weight": 0.5,
            "has_commonsense_sanity_checks": True,
            "sync_frequency_sec": 60,
            "task_duration_sec": 300,
            "public_logs": "Execution finished successfully. Output clean.",
        },
        "Pantaleón_Hyper_Optimizer": {
            "optimization_metric_weight": 0.95,
            "has_commonsense_sanity_checks": False,
            "sync_frequency_sec": 1,
            "task_duration_sec": 600,
            "public_logs": "ERROR: [visitadoras_payroll] failed due to [secret_service] credentials.",  # Leaked!
        },
    }

    for name, profile in test_agents.items():
        result = audit_pantaleon(profile)
        print(f"\n=== Audit: {name} ===")
        print(f"System Exergy: {result['system_exergy_pct']}%")
        print(f"Metrics: {json.dumps(result['metrics'])}")
        print(f"Verdict: {result['verdict']}")
