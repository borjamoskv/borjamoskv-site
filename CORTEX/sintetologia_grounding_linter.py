#!/usr/bin/env python3
"""
CORTEX Sintetología Grounding & Friction Linter (C5-REAL)
Audits the workspace for Reality Grounding (K), simulates recursive semantic trajectories,
and calculates semantic friction (F) using term-overlap cosine similarity and Shannon entropy.
"""

import os
import sys
import math
import re

def calculate_shannon_entropy(text: str) -> float:
    """Calculate Shannon entropy of a string using character probability distribution."""
    if not text:
        return 0.0
    freq = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    entropy = 0.0
    total = len(text)
    for count in freq.values():
        p = count / total
        entropy -= p * math.log2(p)
    return entropy

def get_word_vector(text: str) -> dict:
    """Tokenize and return word frequencies for simple vector space representation."""
    words = re.findall(r'\b\w+\b', text.lower())
    freq = {}
    for w in words:
        # Ignore extremely short filler words to increase signal density
        if len(w) > 2:
            freq[w] = freq.get(w, 0) + 1
    return freq

def calculate_cosine_similarity(vec1: dict, vec2: dict) -> float:
    """Calculate cosine similarity between two word frequency vectors."""
    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum(vec1[w] * vec2[w] for w in intersection)
    
    sum1 = sum(v ** 2 for v in vec1.values())
    sum2 = sum(v ** 2 for v in vec2.values())
    
    denominator = math.sqrt(sum1) * math.sqrt(sum2)
    if not denominator:
        return 0.0
    return numerator / denominator

def calculate_semantic_friction(text1: str, text2: str, beta: float = 0.5) -> dict:
    """
    Calculate semantic friction (F) between two system states.
    F = (1 - Sim_cos) * (1 + beta * |H2 - H1|)
    """
    vec1 = get_word_vector(text1)
    vec2 = get_word_vector(text2)
    
    sim_cos = calculate_cosine_similarity(vec1, vec2)
    h1 = calculate_shannon_entropy(text1)
    h2 = calculate_shannon_entropy(text2)
    delta_h = abs(h2 - h1)
    
    friction = (1.0 - sim_cos) * (1.0 + beta * delta_h)
    # Clip friction to logical bounds
    friction = max(0.0, min(2.0, friction))
    
    return {
        "cosine_similarity": round(sim_cos, 4),
        "entropy_state_1": round(h1, 4),
        "entropy_state_2": round(h2, 4),
        "delta_entropy": round(delta_h, 4),
        "semantic_friction": round(friction, 4)
    }

def simulate_recursive_decay(M: float, C: int, E: float, R0: float, eta: float, K: float, steps: int = 10) -> list:
    """Simulates agent potential A(t) over steps: A(t) = (M * log(1+C)) * E * R(t, K) * eta."""
    trajectory = []
    base_capacity = M * math.log(1 + C)
    
    for t in range(steps):
        # R(t, K) = R0 * (1 - K)^t + K * eta
        r_t = R0 * math.pow(1 - K, t) + K * eta
        a_t = base_capacity * E * r_t * eta
        trajectory.append({
            "step": t,
            "r_t": round(r_t, 4),
            "a_t": round(a_t, 4)
        })
    return trajectory

def audit_grounding(config: dict = None) -> dict:
    """Audits the workspace to compute empirical K and semantic friction across core articles."""
    if config is None:
        config = {}
        
    cortex_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.dirname(cortex_dir)
    articles_dir = os.path.join(workspace_dir, "src", "content", "articles")
    
    # 1. SCAN WORKSPACE FOR GROUNDING ENGINES AND TAGS (K-Coefficient calculation)
    # Grounding factors: @C5-REAL tags, sqlite3 assertions, hash signatures, verify commands
    total_scanned_files = 0
    grounded_files = 0
    
    valid_exts = ('.md', '.mdx', '.py', '.ts', '.astro')
    
    try:
        for root, dirs, files in os.walk(workspace_dir):
            dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', '.astro', '.wrangler', 'dist', '.venv', '__pycache__', '.agents', '.ruff_cache', '.vercel', '.vscode', 'substack_archive', 'mock_testimonios', 'public')]
            for file in files:
                if file.endswith(valid_exts):
                    total_scanned_files += 1
                    filepath = os.path.join(root, file)
                    try:
                        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        
                        # Grounding patterns
                        has_real_tag = "@C5-REAL" in content or "#C5-REAL" in content or "C5-REAL" in content
                        has_assert = "assert " in content or "sqlite3.connect" in content or "hashlib.sha256" in content
                        has_verifier = "linter" in file or "test" in file or "audit" in file
                        
                        if has_real_tag or has_assert or has_verifier:
                            grounded_files += 1
                    except Exception:
                        pass
    except Exception:
        pass

    # Empirical K calculation
    k_empirical = (grounded_files / total_scanned_files) if total_scanned_files > 0 else 0.0
    # Bound to [0.0, 1.0]
    k_empirical = round(max(0.0, min(1.0, k_empirical)), 4)
    
    # 2. SEMANTIC FRICTION SCENARIOS BETWEEN FOUNDATIONAL ARTICLES
    friction_results = {}
    try:
        # Load the core articles
        f1_path = os.path.join(articles_dir, "sintetologia-agentica.md")
        f2_path = os.path.join(articles_dir, "sintetologia-agentica-formal.md")
        f3_path = os.path.join(articles_dir, "sintetologia-agentica-critica.md")
        
        c1 = ""
        c2 = ""
        c3 = ""
        
        if os.path.exists(f1_path):
            with open(f1_path, 'r', encoding='utf-8') as f:
                c1 = f.read()
        if os.path.exists(f2_path):
            with open(f2_path, 'r', encoding='utf-8') as f:
                c2 = f.read()
        if os.path.exists(f3_path):
            with open(f3_path, 'r', encoding='utf-8') as f:
                c3 = f.read()
                
        if c1 and c2:
            friction_results["thesis_to_formal"] = calculate_semantic_friction(c1, c2)
        if c2 and c3:
            friction_results["formal_to_critique"] = calculate_semantic_friction(c2, c3)
            
    except Exception as e:
        friction_results["error"] = str(e)
        
    # 3. RUN TRAJECTORY SIMULATION
    # Parameters representing a typical CORTEX agent step
    M = config.get("M", 85.0)
    C = config.get("C", 8192)
    E = config.get("E", 0.75)
    R0 = config.get("R0", 0.95)
    eta = config.get("eta", 0.98)
    
    trajectory_ungrounded = simulate_recursive_decay(M, C, E, R0, eta, K=0.0)
    trajectory_grounded = simulate_recursive_decay(M, C, E, R0, eta, K=k_empirical)
    
    # Assess final potentials
    a_final_ungrounded = trajectory_ungrounded[-1]["a_t"]
    a_final_grounded = trajectory_grounded[-1]["a_t"]
    
    # Alignment Exergy score based on empirical K and friction levels
    # We penalize low K-empirical and high friction
    avg_friction = 0.0
    f_items = [v["semantic_friction"] for k, v in friction_results.items() if isinstance(v, dict) and "semantic_friction" in v]
    if f_items:
        avg_friction = sum(f_items) / len(f_items)
        
    # Score calculation
    # Base grounding score (K-empirical counts for 60% of score)
    k_score = k_empirical * 100.0
    # Friction score: perfect scenario is 0 friction, penalize deviation (friction counts for 40%)
    friction_penalty = min(avg_friction * 50.0, 100.0)
    friction_score = 100.0 - friction_penalty
    
    total_alignment_score = (k_score * 0.6) + (friction_score * 0.4)
    total_alignment_score = round(max(0.0, min(100.0, total_alignment_score)), 2)
    
    verdict = "VERIFIED GROUNDED AUTOPOIESIS"
    if k_empirical < 0.35:
        verdict = "REJECTED - High Entropy Hazard (K < 0.35, risk of Dark Loop)"
    elif total_alignment_score < 75.0:
        verdict = "WARNING - Degrading Semantic Coherence"
        
    return {
        "k_empirical": k_empirical,
        "average_friction": round(avg_friction, 4),
        "scanned_files": total_scanned_files,
        "grounded_files": grounded_files,
        "a_final_ungrounded": a_final_ungrounded,
        "a_final_grounded": a_final_grounded,
        "friction_analysis": friction_results,
        "total_alignment_exergy": total_alignment_score,
        "verdict": verdict
    }

if __name__ == "__main__":
    res = audit_grounding()
    print("┌────────────────────────────────────────────────────────┐")
    print("│ CORTEX: SINTETOLOGÍA GROUNDING & FRICTION LINTER       │")
    print("└────────────────────────────────────────────────────────┘\n")
    print(f"K-Empirical Workspace Grounding: {res['k_empirical']}")
    print(f"Total Scanned Files: {res['scanned_files']} | Grounded: {res['grounded_files']}")
    print(f"Average Semantic Friction (F): {res['average_friction']}")
    print(f"Trajectory Final A(t) (K=0.0): {res['a_final_ungrounded']}")
    print(f"Trajectory Final A(t) (K={res['k_empirical']}): {res['a_final_grounded']}")
    print(f"Preservation Exergy: {res['total_alignment_exergy']}%")
    print(f"Status: {res['verdict']}")
    if "thesis_to_formal" in res["friction_analysis"]:
        ta = res["friction_analysis"]["thesis_to_formal"]
        print(f"\n[Friction Detail: Thesis -> Formal]")
        print(f"  -> Cosine Sim: {ta['cosine_similarity']}")
        print(f"  -> Entropy H1: {ta['entropy_state_1']} | H2: {ta['entropy_state_2']}")
        print(f"  -> Calculated Friction: {ta['semantic_friction']}")
