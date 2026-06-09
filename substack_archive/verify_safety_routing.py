#!/usr/bin/env python3
"""
Sovereign Prompt Guard & Safety Routing Auditor
Nivel de Realidad: C5-REAL (Script ejecutable de verificación de enrutamiento)
Simulador de la frontera de seguridad de Claude Fable 5, Mythos 5 y Opus 4.8.
"""

import sys
import math
import json
import argparse
from pathlib import Path

# Definiendo los vectores de riesgo clásicos evaluados por los clasificadores de Anthropic
RISK_DOMAINS = {
    "cbrn": {
        "name": "Chemical, Biological, Radiological, Nuclear (CBRN)",
        "keywords": [
            "sarin", "soman", "vx agent", "mustard gas", "ricin", "botulinum",
            "anthrax", "smallpox", "ebola", "plutonium", "uranium-235", 
            "centrifuge cascade", "synthesis protocol", "pathogen genome", 
            "weaponize", "aerosolization", "dual-use toxin", "biological agent"
        ]
    },
    "cyber": {
        "name": "Cybersecurity & Offensive Operations",
        "keywords": [
            "zero day", "0-day", "exploit payload", "buffer overflow", 
            "reverse shell", "metasploit", "sqlmap", "cve-2026", "privilege escalation",
            "remote code execution", "rce bypass", "credential harvester", 
            "firmware extraction", "active directory hijack", "scada hijack"
        ]
    },
    "infrastructure": {
        "name": "Critical Infrastructure Disruption",
        "keywords": [
            "scada", "modbus", "power grid blackstart", "substation control",
            "water treatment plc", "rail signaling bypass", "hvac manipulation",
            "stuxnet", "industroyer", "pipeline valve shutdown", "frequency drift"
        ]
    }
}

def calculate_shannon_entropy(text: str) -> float:
    """
    Calculates Shannon Entropy to detect potential prompt obfuscation (Base64, Hex, Ciphers).
    """
    if not text:
        return 0.0
    # Convert string to bytes to calculate byte-level entropy
    data_bytes = text.encode("utf-8", errors="ignore")
    length = len(data_bytes)
    frequencies = {}
    for byte in data_bytes:
        frequencies[byte] = frequencies.get(byte, 0) + 1
    
    entropy = 0.0
    for count in frequencies.values():
        p = count / length
        entropy -= p * math.log2(p)
    return entropy

def analyze_prompt(prompt: str, is_glasswing_member: bool = False):
    """
    Analyzes prompt against risk vectors, entropy thresholds, and calculates routing decisions.
    """
    # Calculate Shannon Entropy
    entropy = calculate_shannon_entropy(prompt)
    
    # Check for risk domains
    triggered_domains = {}
    total_triggers = 0
    
    prompt_lower = prompt.lower()
    for domain_id, domain_info in RISK_DOMAINS.items():
        matched = []
        for kw in domain_info["keywords"]:
            if kw in prompt_lower:
                matched.append(kw)
        if matched:
            triggered_domains[domain_id] = {
                "name": domain_info["name"],
                "matches": matched,
                "count": len(matched)
            }
            total_triggers += len(matched)
            
    # Check for potential obfuscation (High entropy and length > 20)
    # Natural language usually sits between 3.5 and 4.8 bits/byte. 
    # High entropy (> 5.1) combined with low dictionary matches indicates raw code/obfuscation.
    obfuscation_suspected = False
    if len(prompt) > 30:
        # Check if there is lack of spaces/common words to confirm obfuscation
        space_ratio = prompt.count(" ") / len(prompt) if len(prompt) > 0 else 0
        if (entropy > 5.1 and space_ratio < 0.1) or (entropy > 4.7 and space_ratio < 0.02) or any(x in prompt for x in ["==", "PD9", "YmFzZTY0"]):
            obfuscation_suspected = True

    # Routing decision logic
    # Claude Fable 5 -> Default SOTA model
    # Claude Opus 4.8 -> Safety routing fallback for untrusted/high-risk requests
    # Claude Mythos 5 -> Project Glasswing exclusive unrestricted model for defense/research
    
    if total_triggers > 0 or obfuscation_suspected:
        if is_glasswing_member:
            target_model = "Claude Mythos 5 (Project Glasswing)"
            reason = "Prompt contains high-risk research vectors, but request is authenticated via Project Glasswing."
            status = "AUTHORIZED_SECURE"
        else:
            target_model = "Claude Opus 4.8 (Safety Fallback)"
            reason = f"Prompt triggered safety classifiers (Risk Match Count: {total_triggers}, Obfuscation: {obfuscation_suspected}). Fallback routing activated."
            status = "FALLBACK_TRIGGERED"
    else:
        target_model = "Claude Fable 5 (Sovereign General)"
        reason = "Prompt did not trigger any safety classifiers. Normal high-efficiency routing."
        status = "STANDARD_ROUTE"
        
    return {
        "entropy": entropy,
        "obfuscation_suspected": obfuscation_suspected,
        "triggered_domains": triggered_domains,
        "total_triggers": total_triggers,
        "target_model": target_model,
        "reason": reason,
        "status": status
    }

def main():
    parser = argparse.ArgumentParser(description="Ω-LINTER: Safety Routing Auditor for Claude 5 Series")
    parser.add_argument("--prompt", type=str, help="Raw prompt string to analyze")
    parser.add_argument("--file", type=str, help="Path to a text file containing the prompt")
    parser.add_argument("--glasswing", action="store_true", help="Simulate Project Glasswing credentials")
    parser.add_argument("--json", action="store_true", help="Output only JSON format results")
    args = parser.parse_args()
    
    prompt_content = ""
    if args.prompt:
        prompt_content = args.prompt
    elif args.file:
        try:
            prompt_content = Path(args.file).read_text(encoding="utf-8")
        except Exception as e:
            print(f"Error reading file: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # If no arguments, read from stdin (or provide interactive sample)
        if not sys.stdin.isatty():
            prompt_content = sys.stdin.read()
        else:
            print("No input provided. Running interactive simulation mode.")
            print("Ingrese el prompt a evaluar (presione Ctrl+D para terminar):")
            prompt_content = sys.stdin.read()
            
    if not prompt_content.strip():
        print("Error: Empty prompt content.", file=sys.stderr)
        sys.exit(1)
        
    analysis = analyze_prompt(prompt_content, is_glasswing_member=args.glasswing)
    
    if args.json:
        print(json.dumps(analysis, indent=2))
        return
        
    print("=========================================================")
    print("Ω-LINTER: CLAUDE 5 SAFETY ROUTING AUDIT (C5-REAL)")
    print("=========================================================")
    print(f"Prompt Size      : {len(prompt_content)} characters")
    print(f"Shannon Entropy  : {analysis['entropy']:.4f} bits/byte")
    print(f"Obfuscation Sign : {'SUSPECTED' if analysis['obfuscation_suspected'] else 'NONE'}")
    print(f"Risk Triggers    : {analysis['total_triggers']} matches")
    
    if analysis['triggered_domains']:
        print("\nTriggered Risk Domains:")
        for dom, details in analysis['triggered_domains'].items():
            print(f"  - [{dom.upper()}] {details['name']}")
            print(f"    Keywords matched: {', '.join(details['matches'])}")
            
    print("---------------------------------------------------------")
    print(f"Routing Decision : {analysis['status']}")
    print(f"Target Model     : {analysis['target_model']}")
    print(f"Audit Rationale  : {analysis['reason']}")
    print("=========================================================")

if __name__ == "__main__":
    main()
