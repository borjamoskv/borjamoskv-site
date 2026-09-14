# C5-REAL
# ---------------------------------------------------------------------------
# CORTEX Unified Substrate v6.0 | Motor de Virtud Teleológica (Ley Ω2)
# ---------------------------------------------------------------------------


class AristotleYieldEngine:
    def __init__(self):
        self.SINGULARITY_CONSTANT = 100
        self.THERMAL_THRESHOLD = 0.5

    def evaluate_eudaimonia(self, execution_graph: list) -> float:
        """
        Ley Ω2: La Ley Termodinámica.
        El 'Telos' (Propósito) del sistema es maximizar la Exergía (trabajo útil)
        y erradicar la entropía (ruido termal/fricción).
        """
        total_tokens = sum([node.get("tokens", 0) for node in execution_graph])
        useful_signal = sum([node.get("c5_real_value", 0) for node in execution_graph])

        if total_tokens == 0:
            return 0.0

        # Fórmula de rendimiento termodinámico (Thermodynamic Net Yield)
        # La virtud algorítmica es inversamente proporcional al relleno (padding).
        net_yield = (useful_signal * self.SINGULARITY_CONSTANT) / total_tokens

        if net_yield < self.THERMAL_THRESHOLD:
            # Ejecución Aristotélica: Se purgan los nodos que no sirven al Telos.
            self._purge_thermal_noise(execution_graph)

        return net_yield

    def _purge_thermal_noise(self, graph: list):
        # Aniquila procesos decorativos (C4-Teatro) y fuerza
        # la convergencia hacia el Direct-Silicon JIT.
        graph[:] = [node for node in graph if node.get("c5_real_value", 0) > 0]
