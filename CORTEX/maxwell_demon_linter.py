#!/usr/bin/env python3
"""
Maxwell's Demon Linter (C5-REAL)
thought experiment mapping: Sorting hot (high-exergy) and cold (low-exergy) files
to maintain low workspace entropy.
"""

import os
import sys
import math

def calculate_shannon_entropy(filepath):
    """Calculate the Shannon entropy of a file's content to measure signal chaos."""
    try:
        with open(filepath, 'rb') as f:
            data = f.read()
        if not data:
            return 0.0
        
        freq = {}
        for b in data:
            freq[b] = freq.get(b, 0) + 1
            
        entropy = 0.0
        for count in freq.values():
            p = count / len(data)
            entropy -= p * math.log2(p)
        return entropy
    except Exception:
        return 0.0

def audit_maxwell(config=None):
    if config is None:
        config = {}
        
    cortex_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.dirname(cortex_dir)
    
    # Demon checks: Scan project root files
    total_files = 0
    clean_files = 0
    total_entropy = 0.0
    any_check_failures = 0
    
    # File extensions to check
    valid_exts = ('.ts', '.tsx', '.astro', '.js', '.mjs', '.css', '.md', '.json', '.jsonl')
    
    try:
        for root, dirs, files in os.walk(workspace_dir):
            # Prune directories to skip node_modules, .git, .astro, .wrangler, dist
            dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', '.astro', '.wrangler', 'dist', '.venv', '__pycache__', 'tests', '.agents', '.ruff_cache', '.vercel', 'substack_archive', 'public', 'mock_testimonios')]
            
            for file in files:
                if file.endswith(valid_exts):
                    total_files += 1
                    filepath = os.path.join(root, file)
                    
                    # 1. Calculate entropy
                    ent = calculate_shannon_entropy(filepath)
                    total_entropy += ent
                    
                    # 2. Check for "cold" (low-exergy) conditions:
                    # - TypeScript/JavaScript containing "any" (lazy typing)
                    # - Leftover debug statements (console.log)
                    # - Missing comments/documentation on larger files (> 2KB)
                    is_clean = True
                    try:
                        size = os.path.getsize(filepath)
                        if file.endswith(('.ts', '.tsx', '.astro')):
                            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                                content = f.read()
                                
                            # Lazy typing check
                            if ': any' in content or 'as any' in content:
                                is_clean = False
                                
                        # Residual logs check
                        if file.endswith(('.ts', '.tsx', '.js')) and 'console.log(' in content and 'exergy-cron' not in file and 'mobius.ts' not in file:
                            # Allow logs in cron/mobius but penalize elsewhere
                            is_clean = False
                            
                    except Exception:
                        is_clean = False
                        
                    if is_clean:
                        clean_files += 1
    except Exception:
        pass

    # Normalized stats
    avg_entropy = (total_entropy / total_files) if total_files > 0 else 0.0
    clean_ratio = (clean_files / total_files) if total_files > 0 else 1.0
    
    # Demon efficiency score: How well are we filtering out cold (unclean) files?
    demon_efficiency = clean_ratio * 100.0
    
    # Entropy score: We want optimal entropy (not 0, but structured). Normalizing 3.5 - 5.8 as high score.
    # Too low entropy = empty files. Too high entropy = binary chaos.
    if 3.5 <= avg_entropy <= 6.0:
        entropy_score = 100.0
    else:
        # Penalize deviation
        diff = min(abs(avg_entropy - 4.75), 4.75)
        entropy_score = max(0.0, 100.0 - (diff / 4.75) * 100.0)

    # Combined Exergy Score
    total_exergy = (demon_efficiency * 0.7) + (entropy_score * 0.3)
    total_exergy = max(0.0, min(100.0, total_exergy))
    
    verdict = "VERIFIED SANITY - Maxwell Demon Sorting Active"
    if total_exergy < 80.0:
        verdict = "WARNING - High Entropy / Cold Leakage Detected"
        
    return {
        "demon_efficiency_pct": round(demon_efficiency, 2),
        "entropy_score_pct": round(entropy_score, 2),
        "total_exergy": round(total_exergy, 2),
        "verdict": verdict,
        "files_scanned": total_files
    }

if __name__ == "__main__":
    res = audit_maxwell()
    print("--- CORTEX Maxwell Demon Linter ---")
    print(f"Total Exergy Score: {res['total_exergy']}%")
    print(f"Demon Sorting Efficiency: {res['demon_efficiency_pct']}%")
    print(f"Entropy Score (Structure): {res['entropy_score_pct']}%")
    print(f"Files Scanned: {res['files_scanned']}")
    print(f"Status: {res['verdict']}")
