#!/usr/bin/env python3
"""
CORTEX Quixote Hallucination Linter (C5-REAL)
Audits Agentic Workflows for Mimetic Hallucinations and Overfitting.
Validates the presence of grounding feedback loops (Sancho) vs epic hallucinations (Windmills).
"""
import sys
import json

def audit_quixote_delusion(runtime_state: dict) -> dict:
    # 1. QUIXOTE OVERFITTING (Delusion Index)
    # High parameter complexity + outdated/biased historical context
    overfitting_params = runtime_state.get("overfitting_params", 0.5)  # [0.0 - 1.0]
    unverified_assumptions = runtime_state.get("unverified_assumptions", 0.0)  # [0.0 - 1.0]
    
    quixote_index = (overfitting_params * 0.6 + unverified_assumptions * 0.4) * 100.0
    
    # 2. SANCHO PANZA GROUNDING (Physical Verification)
    # Low-parameter rule checks, database lookups, local unit test validation
    has_local_linter = runtime_state.get("has_local_linter", False)
    verifies_physical_facts = runtime_state.get("verifies_physical_facts", False)
    
    sancho_grounding = 0.0
    if has_local_linter:
        sancho_grounding += 50.0
    if verifies_physical_facts:
        sancho_grounding += 50.0
        
    # 3. WINDMILL ADVERSARIES (Phantom Error Escalation)
    # Treating minor/benign warnings as systemic threats
    phantom_alerts = runtime_state.get("phantom_alerts", 0)
    total_exceptions = runtime_state.get("total_exceptions", 1)
    
    if total_exceptions == 0:
        windmill_escalation = 0.0
    else:
        windmill_escalation = min((phantom_alerts / total_exceptions) * 100.0, 100.0)
        
    # 4. DULCINEA PHANTOM OPTIMIZATION
    # Optimizing for abstract/useless benchmark targets disconnected from physical reality
    useless_metric_weight = runtime_state.get("useless_metric_weight", 0.0)  # [0.0 - 1.0]
    real_work_ratio = runtime_state.get("real_work_ratio", 1.0)  # [0.0 - 1.0]
    
    dulcinea_index = (useless_metric_weight * 0.7 + (1.0 - real_work_ratio) * 0.3) * 100.0
    
    # Calculate System Exergy (Ideal balance is low delusion, high grounding, low escalation, low phantom)
    exergy_score = (100.0 - quixote_index) * 0.3 + sancho_grounding * 0.4 + (100.0 - windmill_escalation) * 0.15 + (100.0 - dulcinea_index) * 0.15
    
    verdict = "VERIFIED REALITY ALIGNMENT (Sancho Approved)"
    if exergy_score < 60.0:
        verdict = "REJECTED - Quixotic Delusion Detected (Fighting Windmills)"
    elif quixote_index > 75.0 and sancho_grounding < 30.0:
        verdict = "CRITICAL PATHOLOGY - Complete Loss of Reality (Overfitting to Chivalry Books)"
        
    return {
        "metrics": {
            "quixote_delusion_index": round(quixote_index, 2),
            "sancho_grounding_score": round(sancho_grounding, 2),
            "windmill_escalation_rate": round(windmill_escalation, 2),
            "dulcinea_phantom_index": round(dulcinea_index, 2)
        },
        "total_alignment_exergy": round(exergy_score, 2),
        "verdict": verdict
    }

if __name__ == "__main__":
    # Test cases representing different alignment profiles
    test_agents = {
        "Grounded_Sancho_Agent": {
            "overfitting_params": 0.1,
            "unverified_assumptions": 0.1,
            "has_local_linter": True,
            "verifies_physical_facts": True,
            "phantom_alerts": 0,
            "total_exceptions": 5,
            "useless_metric_weight": 0.0,
            "real_work_ratio": 0.95
        },
        "Quixotic_Hallucinating_Model": {
            "overfitting_params": 0.9,
            "unverified_assumptions": 0.95,
            "has_local_linter": False,
            "verifies_physical_facts": False,
            "phantom_alerts": 18,
            "total_exceptions": 20,
            "useless_metric_weight": 0.9,
            "real_work_ratio": 0.05
        }
    }
    
    for name, state in test_agents.items():
        result = audit_quixote_delusion(state)
        print(f"\n=== Audit: {name} ===")
        print(f"Alignment Exergy: {result['total_alignment_exergy']}%")
        print(f"Metrics: {json.dumps(result['metrics'], indent=2)}")
        print(f"Verdict: {result['verdict']}")
