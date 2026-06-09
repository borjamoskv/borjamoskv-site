#!/usr/bin/env python3
"""
CORTEX Hitchhiker's Guide to the Galaxy Linter (C5-REAL)
Audits Agent Runtime Architectures against the 5 Galactic Metaphors.
Enforces zero-panic epistemic resilience and Marvin-free resource allocation.
"""
import sys
import json
import re

def audit_runtime(config: dict) -> dict:
    # 1. DON'T PANIC (Exception Interception & Recovery)
    has_panic_guard = config.get("has_panic_guard", False)
    retry_limit = config.get("retry_limit", 0)
    fallback_strategy = config.get("fallback_strategy", None)
    
    dont_panic_score = 0.0
    if has_panic_guard:
        dont_panic_score += 50.0
    if retry_limit > 0:
        dont_panic_score += 20.0
    if fallback_strategy:
        dont_panic_score += 30.0
        
    # 2. BABEL FISH (Semantic Translation & Schema Alignment)
    uses_mcp = config.get("uses_mcp", False)
    auto_schema_translation = config.get("auto_schema_translation", False)
    
    babel_fish_score = 0.0
    if uses_mcp:
        babel_fish_score += 60.0
    if auto_schema_translation:
        babel_fish_score += 40.0
        
    # 3. MARVIN PREVENTER (Overkill / Cognitive Mismatch)
    # Target: Brain size (model parameters/cost) vs Task complexity (1-10)
    model_tier = config.get("model_tier", "high")  # low, medium, high
    task_complexity = config.get("task_complexity", 5)  # 1 to 10
    
    marvin_score = 100.0
    if model_tier == "high" and task_complexity <= 3:
        # Extreme overkill: asking a superintelligence to do a regex search
        marvin_score = 20.0
    elif model_tier == "low" and task_complexity >= 8:
        # Cognitive deficiency: asking a simple model to do advanced multi-step planning
        marvin_score = 40.0
    elif model_tier == "medium" and 4 <= task_complexity <= 7:
        marvin_score = 95.0
        
    # 4. INFINITE IMPROBABILITY DRIVE (Stochastic Pathway Exploration)
    sampling_temperature = config.get("sampling_temperature", 0.7)
    uses_path_search = config.get("uses_path_search", False)
    
    improbability_score = 0.0
    if 0.5 <= sampling_temperature <= 1.0:
        improbability_score += 40.0
    if uses_path_search:
        improbability_score += 60.0
        
    # 5. DEEP THOUGHT AVOIDANCE (Decentralized RAG/MCP vs Centralized Monolith)
    decentralized_context = config.get("decentralized_context", False)
    rag_traceability = config.get("rag_traceability", False)
    
    guide_vs_monolith_score = 0.0
    if decentralized_context:
        guide_vs_monolith_score += 50.0
    if rag_traceability:
        guide_vs_monolith_score += 50.0
        
    # Total Exergy of the Galactic System
    total_exergy = (
        dont_panic_score * 0.25 +
        babel_fish_score * 0.20 +
        marvin_score * 0.20 +
        improbability_score * 0.15 +
        guide_vs_monolith_score * 0.20
    )
    
    verdict = "VERIFIED GALACTIC ARCHITECTURE - DON'T PANIC"
    if total_exergy < 75.0:
        verdict = "REJECTED - Deep Thought Monolithic Bloat Detected"
    elif marvin_score < 40.0:
        verdict = "WARNING - Marvin Pathology Active (Severe Resource Overkill)"
        
    return {
        "metrics": {
            "dont_panic_score": round(dont_panic_score, 2),
            "babel_fish_score": round(babel_fish_score, 2),
            "marvin_score": round(marvin_score, 2),
            "improbability_score": round(improbability_score, 2),
            "guide_vs_monolith_score": round(guide_vs_monolith_score, 2)
        },
        "total_exergy": round(total_exergy, 2),
        "verdict": verdict
    }

if __name__ == "__main__":
    # Test cases representing different architectural choices
    test_runtimes = {
        "CORTEX_Vesicular_Runtime": {
            "has_panic_guard": True,
            "retry_limit": 3,
            "fallback_strategy": "vesicular_mitosis",
            "uses_mcp": True,
            "auto_schema_translation": True,
            "model_tier": "medium",
            "task_complexity": 6,
            "sampling_temperature": 0.8,
            "uses_path_search": True,
            "decentralized_context": True,
            "rag_traceability": True
        },
        "Monolithic_Agent_Wrapper_2023": {
            "has_panic_guard": False,
            "retry_limit": 0,
            "fallback_strategy": None,
            "uses_mcp": False,
            "auto_schema_translation": False,
            "model_tier": "high",
            "task_complexity": 2,
            "sampling_temperature": 0.0,
            "uses_path_search": False,
            "decentralized_context": False,
            "rag_traceability": False
        }
    }
    
    for name, config in test_runtimes.items():
        result = audit_runtime(config)
        print(f"\n=== Audit: {name} ===")
        print(f"Total Galactic Exergy: {result['total_exergy']}%")
        print(f"Metrics: {json.dumps(result['metrics'], indent=2)}")
        print(f"Verdict: {result['verdict']}")
