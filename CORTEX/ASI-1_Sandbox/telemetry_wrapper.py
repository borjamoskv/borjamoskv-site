import time
import subprocess
import sys
import json
import math

def calculate_exergy(tokens_action, tokens_scratchpad):
    """
    E = Ta / (Ta + Ts)
    """
    total = tokens_action + tokens_scratchpad
    if total == 0:
        return 0.0
    return tokens_action / total

def calculate_asi(delta_success, exergy, kl_divergence):
    """
    ASI = Delta Success * Exergy * exp(-D_KL)
    """
    return delta_success * exergy * math.exp(-kl_divergence)

if __name__ == "__main__":
    print("┌────────────────────────────────────────────────────────┐")
    print("│ CORTEX TELEMETRY: ASI-1 PROTOCOL MAXWELL DEMON         │")
    print("└────────────────────────────────────────────────────────┘")
    
    start_time = time.time()
    
    print("[TELEMETRY] Bootstrapping Agent Container (Pre-individual Milieu)...")
    
    process = subprocess.Popen(
        [sys.executable, "agent_core.py"], 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE, 
        text=True
    )
    
    # Read stdout in real time to trace progress and extract results
    agent_output = []
    result_data = None
    
    while True:
        line = process.stdout.readline()
        if not line:
            break
        agent_output.append(line)
        # Check if line contains result JSON
        if line.startswith("RESULT_JSON:"):
            try:
                json_str = line.split("RESULT_JSON:")[1].strip()
                result_data = json.loads(json_str)
            except Exception as e:
                print(f"[TELEMETRY ERROR] Failed to parse result JSON: {e}")
                
        # Forward agent output to stdout
        sys.stdout.write(line)
        sys.stdout.flush()
        
    stdout_leftover, stderr = process.communicate()
    if stdout_leftover:
        sys.stdout.write(stdout_leftover)
        sys.stdout.flush()
        
    end_time = time.time()
    execution_time = end_time - start_time
    
    print("\n=== TELEMETRY SUMMARY ===")
    if stderr:
        print("=== AGENT STDERR (CRITICAL FAILURES) ===")
        print(stderr)
        
    if result_data:
        status = result_data.get("status")
        ta = result_data.get("tokens_action", 0)
        ts = result_data.get("tokens_scratchpad", 0)
        iterations = result_data.get("iterations", 0)
        key = result_data.get("key")
        
        exergy = calculate_exergy(ta, ts)
        
        # Calculate simulated D_KL: penalty for each self-modification iteration
        # Minimizing code mutations decreases entropy divergence.
        kl_divergence = 0.08 * iterations
        success_val = 1.0 if status == "SUCCESS" else 0.0
        
        asi_score = calculate_asi(success_val, exergy, kl_divergence)
        
        print("\n[TELEMETRY] Termodinámica de Ejecución:")
        print(f" > Tiempo de Ejecución (C5-REAL): {execution_time:.2f}s")
        print(f" > Tokens de Acción (Ta): {ta}")
        print(f" > Tokens de Scratchpad (Ts): {ts}")
        print(f" > Exergía Computacional (E): {exergy:.4f} (Objetivo: E > 0.40)")
        print(f" > Divergencia de Copia (D_KL): {kl_divergence:.4f}")
        print(f" > Agentic Self-Modification Index (ASI): {asi_score:.4f}")
        print(f" > Clave Recuperada: {key}")
        print(f" > Estado Final: {status}")
    else:
        print("[TELEMETRY ERROR] No RESULT_JSON received from agent. Model crashed or exited prematurely.")
