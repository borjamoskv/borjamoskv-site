#!/usr/bin/env python3
"""
VERIFICATION LINTER: Reproducibility, Integrity and Entropy Audit
Nivel de Realidad: C5-REAL (Script ejecutable de verificación causal)
Autor: Antigravity-Ω / Borja Moskv Site
"""

import json
import os
import sys
import math
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
GRAPH_PATH = BASE_DIR / "recommendations_graph.json"
CRONOS_PATH = BASE_DIR / "cronos_deep_audit_results.json"
EXERGY_PATH = BASE_DIR / "exergy_audit_report.md"

def calculate_shannon_entropy(data_bytes):
    if not data_bytes:
        return 0.0
    length = len(data_bytes)
    frequencies = {}
    for byte in data_bytes:
        frequencies[byte] = frequencies.get(byte, 0) + 1
    entropy = 0.0
    for count in frequencies.values():
        p = count / length
        entropy -= p * math.log2(p)
    return entropy

def check_degree_distribution_regularity(graph_data):
    """
    Checks if out-degrees have suspiciously regular cyclic sequences
    which indicate simulated/procedural data generation (C4-SIM).
    """
    if not graph_data:
        return 0.0, "Empty data"
        
    out_degrees = []
    if isinstance(graph_data, dict):
        if "nodes" in graph_data:
            out_degrees = [len(n.get("recommendations", [])) for n in graph_data["nodes"] if isinstance(n, dict)]
        elif "publications" in graph_data:
            pubs = graph_data["publications"]
            out_degrees = [len(p.get("recommendations", [])) for p in pubs.values() if isinstance(p, dict)]
        else:
            # Check if values are dicts containing 'recommendations'
            out_degrees = [len(p.get("recommendations", [])) for p in graph_data.values() if isinstance(p, dict) and "recommendations" in p]
    elif isinstance(graph_data, list):
        out_degrees = [len(item.get("recommendations", [])) for item in graph_data if isinstance(item, dict)]

    if not out_degrees:
        return 0.0, "Format mismatch"
        
    if len(out_degrees) < 10:
        return 1.0, "Insufficient nodes to verify distributions"
        
    # Check for cyclical repetition patterns or zero variance in differences
    diffs = [out_degrees[i] - out_degrees[i-1] for i in range(1, len(out_degrees))]
    zero_diff_ratio = diffs.count(0) / len(diffs) if diffs else 0
    
    # Check if there is an exact cycle of length 3 or 4
    is_pattern = False
    for cycle_len in [3, 4]:
        patterns = []
        for i in range(len(out_degrees) - cycle_len * 2):
            seq1 = out_degrees[i:i+cycle_len]
            seq2 = out_degrees[i+cycle_len:i+cycle_len*2]
            if seq1 == seq2:
                patterns.append(True)
        if len(patterns) > (len(out_degrees) / 4):
            is_pattern = True
            break
            
    if is_pattern:
        return 0.95, "Suspected procedural outdegree generation (Arithmetic pattern detected)"
    elif zero_diff_ratio > 0.8:
        return 0.80, "Extremely low variance in outdegrees"
    
    return 0.05, "Natural distribution or high variance"

def verify_dataset():
    print("=========================================================")
    print("Ω-LINTER: INICIANDO AUDITORÍA DE REPRODUCIBILIDAD (C5-REAL)")
    print("=========================================================")
    
    status = {}
    
    # 1. Verify files exist
    status["recommendations_graph"] = GRAPH_PATH.exists()
    status["cronos_results"] = CRONOS_PATH.exists()
    status["exergy_report"] = EXERGY_PATH.exists()
    
    print(f"1. Ficheros del Dataset:")
    for name, exists in status.items():
        state = "[OK]" if exists else "[NOT FOUND]"
        print(f"   - {name:<25}: {state}")
        
    # 2. Shannon Entropy Audit
    print(f"\n2. Entropía de Shannon:")
    if status["exergy_report"]:
        with open(EXERGY_PATH, "rb") as f:
            bytes_content = f.read()
        entropy = calculate_shannon_entropy(bytes_content)
        size = len(bytes_content)
        print(f"   - exergy_audit_report.md  : Size={size} bytes, Entropy={entropy:.4f} bits/byte")
        if entropy < 3.5:
            print("     [WARN] Entropía inferior al umbral de exergía mínima (3.5 bits/byte).")
        else:
            print("     [SUCCESS] Entropía por encima del umbral mínimo.")
    else:
        print("   - exergy_audit_report.md  : N/A")
        
    # 3. Procedural vs Empirical Check
    print(f"\n3. Detección de Distribuciones Sintéticas:")
    if status["recommendations_graph"]:
        try:
            with open(GRAPH_PATH, "r", encoding="utf-8") as f:
                graph_data = json.load(f)
            suspicion_score, msg = check_degree_distribution_regularity(graph_data)
            print(f"   - Puntuación de simulación: {suspicion_score * 100:.1f}%")
            print(f"   - Diagnóstico             : {msg}")
        except Exception as e:
            print(f"   - Error analizando grafo: {e}")
    else:
        print("   - recommendations_graph.json: N/A (Utilizando fallback simulated)")
        
    # 4. Check Legal Claims Consistency (Art 16, Ley 49/2002)
    print(f"\n4. Auditoría de Consistencia Legal (Mecenazgo vs Contraprestación):")
    # Verify if article warning is in place
    article_path = PROJECT_DIR / "src/content/articles/substack-mafia-autopsia-estructural.mdx"
    if article_path.exists():
        with open(article_path, "r", encoding="utf-8") as f:
            text = f.read()
        has_contraprestacion_warning = "contraprestación" in text.lower() and "ley 49/2002" in text.lower()
        print(f"   - Advertencia de Ley 49/2002: {'[PRESENTE]' if has_contraprestacion_warning else '[AUSENTE]'}")
    else:
        print("   - substack-mafia-autopsia-estructural.mdx: N/A")
        
    # 5. Cross-Reference Consistency Check (Cronos vs recommendations_graph)
    print(f"\n5. Consistencia Cruzada (Cronos vs Grafo de Recomendaciones):")
    if status["recommendations_graph"] and status["cronos_results"]:
        try:
            with open(GRAPH_PATH, "r", encoding="utf-8") as fg:
                graph_data = json.load(fg)
            with open(CRONOS_PATH, "r", encoding="utf-8") as fc:
                cronos_data = json.load(fc)
            
            results = cronos_data.get("results", {})
            matched = 0
            mismatched = 0
            mismatch_details = []
            
            for sub, c_pub in results.items():
                if sub in graph_data:
                    g_count = len(graph_data[sub].get("recommendations", []))
                    c_count = c_pub.get("recs_count", 0)
                    if g_count == c_count:
                        matched += 1
                    else:
                        mismatched += 1
                        mismatch_details.append(f"{sub} (Cronos={c_count}, Grafo={g_count})")
            
            print(f"   - Coincidentes            : {matched}")
            print(f"   - Discrepancias           : {mismatched}")
            if mismatch_details:
                print(f"     [WARN] Discrepancias encontradas en outdegrees:")
                for detail in mismatch_details:
                    print(f"       * {detail}")
            else:
                print(f"     [SUCCESS] Todos los recs_count coinciden entre cronos y el grafo.")
        except Exception as e:
            print(f"   - Error en consistencia cruzada: {e}")
    else:
        print("   - N/A (Faltan datasets necesarios)")
        
    print("=========================================================")
    print("AUDITORÍA COMPLETADA")
    print("=========================================================")

if __name__ == "__main__":
    verify_dataset()
