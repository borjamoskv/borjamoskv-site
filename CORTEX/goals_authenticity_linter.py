#!/usr/bin/env python3
"""
CORTEX Goals Authenticity Linter (C5-REAL)
Audits objective lists for Mimetic Anergy vs Intrinsic Exergy.
Based on René Girard's Mimetic Theory and CORTEX Thermodynamic Principles.
"""
import sys
import json
import hashlib
import time

def evaluate_goal(goal: dict) -> dict:
    text = goal.get("text", "Unnamed Goal")
    intrinsic_drive = goal.get("intrinsic_drive", 0.5)  # [0.0 - 1.0]
    mimetic_factor = goal.get("mimetic_factor", 0.5)    # [0.0 - 1.0]
    proof_of_work = goal.get("proof_of_work", 0.0)      # [0.0 - 1.0]
    anergy_cost = goal.get("anergy_cost", 0.5)          # [0.0 - 1.0] (pressure / obligation)

    # Core Formula: Exergy is intrinsic drive multiplied by actual proof of work,
    # depleted by mimetic noise and obligation friction.
    exergy = (intrinsic_drive * 0.6 + proof_of_work * 0.4) * (1.0 - (mimetic_factor * 0.5 + anergy_cost * 0.5) * 0.7)
    exergy_pct = round(exergy * 100, 2)
    
    classification = "Sovereign Goal (C5-REAL)"
    if mimetic_factor > 0.7:
        classification = "Mimetic Hype (C4-SIM)"
    elif anergy_cost > 0.7:
        classification = "Extrinsic Obligation"
    elif proof_of_work < 0.2:
        classification = "Aesthetic Vaporware"
        
    return {
        "text": text,
        "metrics": {
            "intrinsic_drive": intrinsic_drive,
            "mimetic_factor": mimetic_factor,
            "proof_of_work": proof_of_work,
            "anergy_cost": anergy_cost
        },
        "exergy_score": exergy_pct,
        "classification": classification
    }

def audit_list(goals: list) -> dict:
    audited = [evaluate_goal(g) for g in goals]
    if not audited:
        return {}
        
    avg_exergy = sum(g["exergy_score"] for g in audited) / len(audited)
    verdict = "VERIFIED - Sovereign Agenda" if avg_exergy >= 65 else "REJECTED - High Mimetic Contamination"
    
    # Calculate hash signature for ledger verification
    raw_data = json.dumps(audited, sort_keys=True).encode()
    ledger_hash = hashlib.sha256(raw_data).hexdigest()
    
    return {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "average_exergy": round(avg_exergy, 2),
        "verdict": verdict,
        "hash": ledger_hash,
        "goals": audited
    }

if __name__ == "__main__":
    # Sample run with common copied list goals vs true intrinsic goals
    sample_goals = [
        {
            "text": "Escribir un libro antes de los 30 para impresionar a gente en Twitter",
            "intrinsic_drive": 0.2,
            "mimetic_factor": 0.9,
            "proof_of_work": 0.1,
            "anergy_cost": 0.8
        },
        {
            "text": "Hacer un viaje espiritual a Bali porque lo vi en Instagram",
            "intrinsic_drive": 0.1,
            "mimetic_factor": 0.95,
            "proof_of_work": 0.05,
            "anergy_cost": 0.4
        },
        {
            "text": "Aprender ensamblador para programar microcontroladores en tu sótano sin que nadie lo sepa",
            "intrinsic_drive": 0.95,
            "mimetic_factor": 0.05,
            "proof_of_work": 0.85,
            "anergy_cost": 0.1
        },
        {
            "text": "Hacer 100 flexiones diarias por disciplina silenciosa",
            "intrinsic_drive": 0.8,
            "mimetic_factor": 0.2,
            "proof_of_work": 0.9,
            "anergy_cost": 0.3
        }
    ]
    
    result = audit_list(sample_goals)
    print(json.dumps(result, indent=2, ensure_ascii=False))
