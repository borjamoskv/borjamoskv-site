#!/usr/bin/env python3
"""
CORTEX Relationship Exergy Linter (C5-REAL)
Audits interpersonal connections for Intimacy Friction vs Transactional Anergy.
Based on the thermodynamics of human connection and Pol Jordi's 'Recesión Sexual' thesis.
"""
import sys
import json
import hashlib
import time

def evaluate_connection(conn: dict) -> dict:
    name = conn.get("subject_alias", "Anonymous Node")
    offline_hours = conn.get("offline_hours_weekly", 0.0)      # Raw hours face-to-face
    uncomfortable_chats = conn.get("frictional_chats_count", 0) # Real vulnerability checks
    instagram_validation = conn.get("social_validation_factor", 0.5) # [0.0 - 1.0] (status need)
    discard_bias = conn.get("swipe_discard_bias", 0.5)          # [0.0 - 1.0] (disposability)

    # Intimacy requires raw physical presence (offline_hours) and cognitive friction (uncomfortable_chats)
    # It is severely depleted by the desire for external status (social_validation) and high-speed digital discard habits.
    raw_friction = (min(offline_hours / 10.0, 1.0) * 0.5) + (min(uncomfortable_chats / 3.0, 1.0) * 0.5)
    depletion_noise = (instagram_validation * 0.4) + (discard_bias * 0.6)
    
    exergy = raw_friction * (1.0 - depletion_noise * 0.8)
    exergy_pct = round(exergy * 100, 2)
    
    classification = "Sovereign Connection (C5-REAL)"
    if discard_bias > 0.8:
        classification = "Transactional Meat Consumption (Low Exergy)"
    elif instagram_validation > 0.8:
        classification = "Aesthetic Cosplay / Instagram Relationship"
    elif raw_friction < 0.2:
        classification = "High-Entropy Digital Vaporware"
        
    return {
        "alias": name,
        "metrics": {
            "offline_hours": offline_hours,
            "frictional_chats": uncomfortable_chats,
            "social_validation": instagram_validation,
            "discard_bias": discard_bias
        },
        "exergy_score": exergy_pct,
        "classification": classification
    }

def audit_connections(connections: list) -> dict:
    audited = [evaluate_connection(c) for c in connections]
    if not audited:
        return {}
        
    avg_exergy = sum(c["exergy_score"] for c in audited) / len(audited)
    verdict = "VERIFIED - Real Human Intimacy Detected" if avg_exergy >= 50 else "REJECTED - Cold Digital Recess"
    
    raw_data = json.dumps(audited, sort_keys=True).encode()
    ledger_hash = hashlib.sha256(raw_data).hexdigest()
    
    return {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "average_exergy": round(avg_exergy, 2),
        "verdict": verdict,
        "hash": ledger_hash,
        "nodes": audited
    }

if __name__ == "__main__":
    # Test cases: Modern swiping vs actual sovereign connections
    test_nodes = [
        {
            "subject_alias": "Contacto_Tinder_08",
            "offline_hours_weekly": 1.5,
            "frictional_chats_count": 0,
            "social_validation_factor": 0.9,
            "swipe_discard_bias": 0.95
        },
        {
            "subject_alias": "Pareja_Estable_Cuarto_B",
            "offline_hours_weekly": 15.0,
            "frictional_chats_count": 4,
            "social_validation_factor": 0.1,
            "swipe_discard_bias": 0.05
        },
        {
            "subject_alias": "Follamistad_Baja_Intensidad",
            "offline_hours_weekly": 2.0,
            "frictional_chats_count": 1,
            "social_validation_factor": 0.4,
            "swipe_discard_bias": 0.7
        }
    ]
    
    result = audit_connections(test_nodes)
    print(json.dumps(result, indent=2, ensure_ascii=False))
