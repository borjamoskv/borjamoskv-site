"""
C5-REAL: TACUINUM SANITATIS -> HUMAN THERMAL ENGINE VERIFICATION LEDGER
Purpose: Causal proof ledger validating biological sovereignty inputs vs. Anergy traps.
"""

from dataclasses import dataclass
from typing import List


@dataclass
class MetabolicInput:
    source: str
    thermal_effect: str
    anergy_cost: int
    exergy_yield: int


class TacuinumEngine:
    def __init__(self):
        self.voltage = 100
        self.anergy_traps = 0
        self.logs: List[str] = []

    def ingest(self, input_data: MetabolicInput) -> bool:
        net_yield = input_data.exergy_yield - input_data.anergy_cost
        self.voltage += net_yield

        if input_data.anergy_cost > 50:
            self.anergy_traps += 1
            self.logs.append(
                f"[FALLA C4] RECHAZO: '{input_data.source}' genera fuga de Exergy ({input_data.anergy_cost}). Voltaje: {self.voltage}."
            )
            return False

        self.logs.append(
            f"[C5-REAL] ACEPTADO: '{input_data.source}' aporta Soberanía ({input_data.exergy_yield}). Voltaje: {self.voltage}."
        )
        return True

    def verify_autonomy(self):
        print("\n--- AUDITORÍA DE SOBERANÍA BIOLÓGICA ---")
        print(f"Voltaje Final: {self.voltage}% (Baseline: 100%)")
        print(f"Fugas Detectadas (Anergy): {self.anergy_traps}")
        if self.voltage < 100:
            print("ESTADO: COMPROMETIDO. Dependencia del sistema médico/industrial.")
        else:
            print("ESTADO: SOBERANO. Autonomía biológica mantenida.")
        print("----------------------------------------\n")


def run_audit():
    engine = TacuinumEngine()

    inputs = [
        MetabolicInput("Aislamiento_HVAC", "neutro", anergy_cost=60, exergy_yield=5),
        MetabolicInput(
            "Hormesis_Estival_Sudor",
            "enfriamiento_activo",
            anergy_cost=10,
            exergy_yield=80,
        ),
        MetabolicInput(
            "Superfood_Importado", "variable", anergy_cost=40, exergy_yield=20
        ),
        MetabolicInput(
            "Proximidad_Aceite_Crudo",
            "calentamiento_metabolico",
            anergy_cost=5,
            exergy_yield=95,
        ),
        MetabolicInput(
            "Friccion_Social_Noticias",
            "calentamiento_nervioso",
            anergy_cost=90,
            exergy_yield=0,
        ),
        MetabolicInput(
            "Ecologia_Del_Silencio",
            "enfriamiento_nervioso",
            anergy_cost=0,
            exergy_yield=100,
        ),
    ]

    for item in inputs:
        engine.ingest(item)

    for log in engine.logs:
        print(log)

    engine.verify_autonomy()


if __name__ == "__main__":
    run_audit()
