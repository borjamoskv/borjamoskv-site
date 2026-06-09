#!/usr/bin/env python3
"""
CORTEX Confederacy of Dunces Bloat Linter (C5-REAL)
Audits Agentic Outputs for Verbose Bloat (Ignatius Reilly syndrome) and Pyloric Throttling.
Analyzes exergy density (useful information vs rhetorical noise).
"""
import sys
import json

def audit_dunces_bloat(log_data: dict) -> dict:
    output_text = log_data.get("output_text", "")
    parameters_count = log_data.get("parameters_count", 0.0)  # in Billions
    api_throttled = log_data.get("api_throttled", False)
    has_ci_validation = log_data.get("has_ci_validation", False)
    
    # 1. EXERGY DENSITY (Useful signal vs Rhetorical bloat)
    words = output_text.split()
    total_words = len(words)
    
    # Technical keywords representing exergy
    keywords = ["class", "def", "import", "return", "assert", "function", "const", "interface", "type"]
    keyword_hits = sum(1 for w in words if w.lower().strip(".:,;()[]{}") in keywords)
    
    if total_words == 0:
        exergy_density = 100.0
    else:
        # Lower density means more wordy narrative excuses
        exergy_density = (keyword_hits / total_words) * 100.0
        
    # 2. IGNATIUS REILLY BLOAT SYNDROME
    # Very high parameter model generating massive textual logs with low technical content
    ignatius_syndrome = False
    if parameters_count >= 100.0 and exergy_density < 5.0:
        ignatius_syndrome = True
        
    # 3. PYLORIC VALVE CLOSURE (Rate-limit throttling under stress)
    # Throttling activates when log length is massive and API calls are blocked
    pyloric_valve_closed = api_throttled and total_words > 1000
    
    # 4. MYRNA MINKOFF (Adversarial CI validation)
    # The pressure that forces the model to actually output code
    critic_pressure = 100.0 if not has_ci_validation else 0.0
    
    # Confederacy Score (High is bad - means massive noise, low logic, high friction)
    confederacy_score = 0.0
    if ignatius_syndrome:
        confederacy_score += 40.0
    if pyloric_valve_closed:
        confederacy_score += 30.0
    if critic_pressure > 50.0:
        confederacy_score += 30.0
        
    verdict = "VERIFIED LEAN METABOLISM (No Ignatius Bloat)"
    if confederacy_score >= 70.0:
        verdict = "REJECTED - Confederacy of Dunces Bloat Active (Ignatius Valve Closed)"
    elif confederacy_score >= 30.0:
        verdict = "WARNING - High Rhetorical Noise Detected"
        
    return {
        "metrics": {
            "exergy_density_pct": round(exergy_density, 2),
            "ignatius_bloat_syndrome": ignatius_syndrome,
            "pyloric_valve_closed": pyloric_valve_closed,
            "missing_critic_pressure": critic_pressure > 0.0
        },
        "bloat_severity_pct": round(confederacy_score, 2),
        "verdict": verdict
    }

if __name__ == "__main__":
    test_logs = {
        "Ignatius_Bloated_Agent_400B": {
            "output_text": "Oh my god, the modern world is completely lacking in theological geometry and taste. In my voluminous journals, I must state that the server failed not due to my code, but due to the total decay of local authority and sanitary protocols. I shall write 500 pages of text before returning a simple hello world.",
            "parameters_count": 405.0,
            "api_throttled": True,
            "has_ci_validation": False
        },
        "Lean_Sovereign_Subagent_8B": {
            "output_text": "import sys; print('Exergy verified'); sys.exit(0)",
            "parameters_count": 8.0,
            "api_throttled": False,
            "has_ci_validation": True
        }
    }
    
    for name, log in test_logs.items():
        result = audit_dunces_bloat(log)
        print(f"\n=== Audit: {name} ===")
        print(f"Bloat Severity: {result['bloat_severity_pct']}%")
        print(f"Metrics: {json.dumps(result['metrics'])}")
        print(f"Verdict: {result['verdict']}")
