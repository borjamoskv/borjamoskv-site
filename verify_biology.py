#!/usr/bin/env python3
"""
VERIFY-BIOLOGY-Ω: C5-REAL Sovereign Biological Exergy Validator & Ledger compiler.
Quantifies cellular voltage, arterial flexibility, electrolyte saturation, and AMPK/mTOR balance
based on base biological engineering inputs. Logs results to substack_archive/biology_ledger.jsonl.
"""

import sys
import os
import json
import time
import argparse

LEDGER_PATH = "/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/substack_archive/biology_ledger.jsonl"

def calculate_biological_exergy(inputs):
    """
    Calculates biological sub-indices and overall Biological Exergy Score (OBES).
    All scores scaled 0-100.
    """
    # 1. Arterial Flexibility Index (AFI)
    # Target: 150g blueberries, regular strength training, sodium balance.
    polyphenols_score = min(100.0, (inputs.get("polyphenols_g", 0) / 150.0) * 100.0)
    exercise_bonus = 30.0 if inputs.get("strength_training_sessions", 0) >= 3 else (inputs.get("strength_training_sessions", 0) * 10.0)
    afi = min(100.0, polyphenols_score * 0.7 + exercise_bonus)

    # 2. Electrolyte Saturation Ratio (ESR)
    # Sodium target: 4.0g (increases to 6.0g if low_carb is True)
    target_sodium = 6.0 if inputs.get("low_carb", False) else 4.0
    sodium_score = max(0.0, min(100.0, 100.0 - abs(inputs.get("sodium_g", 0) - target_sodium) / target_sodium * 100.0))
    
    # Potassium target: 4.7g
    potassium_score = max(0.0, min(100.0, 100.0 - abs(inputs.get("potassium_g", 0) - 4.7) / 4.7 * 100.0))
    
    # Magnesium target: 500mg
    magnesium_score = max(0.0, min(100.0, 100.0 - abs(inputs.get("magnesium_mg", 0) - 500.0) / 500.0 * 100.0))
    
    esr = (sodium_score * 0.4) + (potassium_score * 0.3) + (magnesium_score * 0.3)

    # 3. Mitochondrial Voltage Output (MVO)
    # Infrared exposure clears NO block. Target: 30 mins.
    ir_score = min(100.0, (inputs.get("infrared_mins", 0) / 30.0) * 100.0)
    
    # Stress/EMF penalty
    emf_penalty = 0.0
    if inputs.get("emf_stress_level", "low") == "high":
        emf_penalty = 30.0
    elif inputs.get("emf_stress_level", "low") == "medium":
        emf_penalty = 15.0
        
    # Glucose saturation penalty: massive carbs saturate enzymes and cause electron leaks (chaos)
    # Target simple carbs: < 50g. Max penalty at > 150g.
    glucose = inputs.get("glucose_sugars_g", 0)
    glucose_penalty = 0.0
    if glucose > 50:
        glucose_penalty = min(50.0, ((glucose - 50) / 100.0) * 50.0)
        
    mvo = max(0.0, ir_score - emf_penalty - glucose_penalty)

    # 4. Microbiota Integrity Index (MII)
    # Target: 2 servings of ferments ( kefir, kombucha, chucrut) and 35g fiber.
    ferments_score = min(100.0, (inputs.get("ferments_servings", 0) / 2.0) * 100.0)
    fiber_score = min(100.0, (inputs.get("fiber_g", 0) / 35.0) * 100.0)
    mii = (ferments_score * 0.5) + (fiber_score * 0.5)

    # 5. Stomach Acid & Digestion Efficiency (SADE)
    # Apple cider vinegar or Roquefort increases acid. Kiwi (with skin) has actinidin.
    acid_pre = 40.0 if inputs.get("acid_preload", False) else 0.0
    kiwi_skin = 60.0 if inputs.get("kiwi_with_skin", False) else 0.0
    sade = acid_pre + kiwi_skin

    # 6. AMPK/mTOR Balance (AMB)
    # Fasting window: 16 hours triggers AMPK GLUT4 transport.
    fasting_score = min(100.0, (inputs.get("fasting_window_hours", 0) / 16.0) * 100.0)
    # Protein intake: target 1.8 g/kg.
    protein_score = min(100.0, (inputs.get("protein_g_per_kg", 0.0) / 1.8) * 100.0)
    
    amb = (fasting_score * 0.5) + (protein_score * 0.5)

    # Overall Biological Exergy Score (OBES)
    obes = (afi * 0.15) + (esr * 0.20) + (mvo * 0.25) + (mii * 0.15) + (sade * 0.10) + (amb * 0.15)
    
    # Calculate entropic biological noise (Anergy)
    anergy = 100.0 - obes

    return {
        "AFI": round(afi, 2),
        "ESR": round(esr, 2),
        "MVO": round(mvo, 2),
        "MII": round(mii, 2),
        "SADE": round(sade, 2),
        "AMB": round(amb, 2),
        "OBES": round(obes, 2),
        "anergy": round(anergy, 2)
    }

def main():
    parser = argparse.ArgumentParser(description="Verify biological exergy based on saludleona post.")
    parser.add_argument("--polyphenols", type=float, default=50.0, help="Polyphenols intake in grams (blueberries etc.)")
    parser.add_argument("--strength-sessions", type=int, default=1, help="Strength training sessions per week")
    parser.add_argument("--sodium", type=float, default=2.0, help="Sodium intake in grams")
    parser.add_argument("--low-carb", action="store_true", help="Is the subject on a low-carb ketogenic diet?")
    parser.add_argument("--potassium", type=float, default=2.5, help="Potassium intake in grams")
    parser.add_argument("--magnesium", type=float, default=250.0, help="Magnesium intake in milligrams")
    parser.add_argument("--infrared-mins", type=float, default=10.0, help="Minutes of infrared sun exposure")
    parser.add_argument("--emf-stress", choices=["low", "medium", "high"], default="medium", help="EMF and stress exposure level")
    parser.add_argument("--glucose", type=float, default=120.0, help="Simple sugars/glucose intake in grams")
    parser.add_argument("--ferments", type=int, default=0, help="Servings of fermented foods (kefir etc.)")
    parser.add_argument("--fiber", type=float, default=15.0, help="Fiber intake in grams")
    parser.add_argument("--acid-preload", action="store_true", help="Apple cider vinegar/acid preload before meals")
    parser.add_argument("--kiwi-skin", action="store_true", help="Kiwi consumed with skin 15m before carbs")
    parser.add_argument("--fasting-hours", type=float, default=12.0, help="Fasting window in hours")
    parser.add_argument("--protein-ratio", type=float, default=1.0, help="Protein intake in g per kg body weight")
    parser.add_argument("--log", action="store_true", help="Save results to append-only ledger")
    parser.add_argument("--subject", type=str, default="Anonymous-Subject", help="Name or ID of subject")

    args = parser.parse_args()

    inputs = {
        "polyphenols_g": args.polyphenols,
        "strength_training_sessions": args.strength_sessions,
        "sodium_g": args.sodium,
        "low_carb": args.low_carb,
        "potassium_g": args.potassium,
        "magnesium_mg": args.magnesium,
        "infrared_mins": args.infrared_mins,
        "emf_stress_level": args.emf_stress,
        "glucose_sugars_g": args.glucose,
        "ferments_servings": args.ferments,
        "fiber_g": args.fiber,
        "acid_preload": args.acid_preload,
        "kiwi_with_skin": args.kiwi_skin,
        "fasting_window_hours": args.fasting_hours,
        "protein_g_per_kg": args.protein_ratio
    }

    metrics = calculate_biological_exergy(inputs)

    print("┌────────────────────────────────────────────────────────┐")
    print("│ VERIFY-BIOLOGY-Ω: BIOLOGICAL EXERGY DEEP REPORT        │")
    print("├────────────────────────────────────────────────────────┤")
    print(f"│ Subject: {args.subject}")
    print(f"│ Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
    print("├────────────────────────────────────────────────────────┤")
    print(f"│ Arterial Flexibility (AFI)   : {metrics['AFI']}%")
    print(f"│ Electrolyte Saturation (ESR)  : {metrics['ESR']}%")
    print(f"│ Mitochondrial Voltage (MVO)  : {metrics['MVO']}%")
    print(f"│ Microbiota Integrity (MII)   : {metrics['MII']}%")
    print(f"│ Stomach Acid Efficiency (SADE): {metrics['SADE']}%")
    print(f"│ AMPK / mTOR Balance (AMB)    : {metrics['AMB']}%")
    print("├────────────────────────────────────────────────────────┤")
    print(f"│ BIOLOGICAL EXERGY SCORE      : {metrics['OBES']}% (Useful Signal)")
    print(f"│ METABOLIC ANERGY (NOISE)     : {metrics['anergy']}% (Heat loss)")
    print("└────────────────────────────────────────────────────────┘")

    if args.log:
        log_entry = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "subject": args.subject,
            "inputs": inputs,
            "metrics": metrics
        }
        os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
        with open(LEDGER_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
        print(f"[✓] Verification entry logged to ledger: {LEDGER_PATH}")

if __name__ == "__main__":
    main()
