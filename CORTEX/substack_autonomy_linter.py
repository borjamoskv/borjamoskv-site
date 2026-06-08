import sys
import math

def calculate_exergy(text):
    # Pilar 1: Combustible de alta fidelidad (Entropía de Shannon como proxy de densidad)
    words = text.split()
    if not words:
        return 0.0
    
    word_freq = {}
    for w in words:
        w = w.lower().strip(".,!?")
        word_freq[w] = word_freq.get(w, 0) + 1
        
    entropy = 0
    for count in word_freq.values():
        p = count / len(words)
        entropy -= p * math.log2(p)
        
    # Pilar 2 y 3: Proximidad y Autonomía (Palabras clave)
    keywords = ['valor', 'conversaciones', 'directo', 'autonomía', 'interdependencia', 'cruzadas', 'alianzas']
    keyword_hits = sum(1 for k in keywords if k in text.lower())
    
    fidelity_score = min((entropy / 5.0) * 100, 100) # Normalizando
    proximity_score = min((keyword_hits / len(keywords)) * 100, 100)
    
    total_score = (fidelity_score * 0.6) + (proximity_score * 0.4)
    return {
        "fidelity": round(fidelity_score, 2),
        "proximity_and_autonomy": round(proximity_score, 2),
        "total_exergy": round(total_score, 2)
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python substack_autonomy_linter.py <text>")
        sys.exit(1)
        
    input_text = sys.argv[1]
    result = calculate_exergy(input_text)
    
    print(f"--- CORTEX Substack Autonomy Audit ---")
    print(f"Signal Exergy Score: {result['total_exergy']}%")
    print(f"High-Fidelity Fuel (Density): {result['fidelity']}%")
    print(f"Proximity/Autonomy Matrix: {result['proximity_and_autonomy']}%")
    
    if result['total_exergy'] > 80:
        print("STATUS: VERIFIED - High Exergy Component.")
    else:
        print("STATUS: REJECTED - Narrative Smoke Detected.")
