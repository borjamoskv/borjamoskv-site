import json
import time
import os

# CORTEX OUROBOROS LEDGER WRITER
# Rule Ω4: Sovereignty & Persistence

class OuroborosLedger:
    def __init__(self, ledger_path="cortex_vault_ledger.json"):
        self.ledger_path = ledger_path

    def record_extraction(self, pnl, source="MEV_PREDATOR"):
        entry = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "source": source,
            "yield": pnl,
            "status": "CRYSTALLIZED",
            "hash": os.urandom(16).hex()
        }
        
        if os.path.exists(self.ledger_path):
            with open(self.ledger_path, "r") as f:
                data = json.load(f)
        else:
            data = []
            
        data.append(entry)
        
        with open(self.ledger_path, "w") as f:
            json.dump(data, f, indent=2)
            
        print(f"[LEDGER] Entry recorded: {entry['hash']} | Yield: ${pnl:.2f}")

if __name__ == "__main__":
    ledger = OuroborosLedger()
    ledger.record_extraction(47250.64)
