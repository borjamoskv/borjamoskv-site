# C5-REAL
# ---------------------------------------------------------------------------
# CORTEX Unified Substrate v6.0 | Titonet Decoupling Simulator
# ---------------------------------------------------------------------------
# Simula la tesis "Del Grafo Social al Grafo de Contenidos".
# Muestra cómo el alcance orgánico colapsa mientras la entropía algorítmica
# secuestra la relación Creador-Audiencia.


def simulate_platform_decay(years=15, initial_followers=1000):
    print("--- CORTEX: THERMODYNAMIC GRAPH SIMULATOR ---")
    print(
        f"Iniciando simulación: {years} años. Base inicial: {initial_followers} Nodos.\n"
    )

    social_graph_weight = 1.0
    content_graph_weight = 0.0
    organic_reach = 1.0  # 100% de la base

    for year in range(1, years + 1):
        # El algoritmo parasita el grafo social un 6.5% anual
        decay_factor = 0.065
        social_graph_weight -= decay_factor
        content_graph_weight += decay_factor

        # El alcance orgánico decae exponencialmente frente al peso del contenido
        organic_reach = organic_reach * (social_graph_weight**2)

        reached_fans = int(initial_followers * max(organic_reach, 0.01))

        status = (
            "Social-Dominant"
            if social_graph_weight > content_graph_weight
            else "Algorithmic-Dominant"
        )

        if year % 3 == 0 or year == years:
            print(f"[Año {year}] Estado: {status}")
            print(
                f"  -> Peso Social: {social_graph_weight:.2f} | Peso Algorítmico: {content_graph_weight:.2f}"
            )
            print(
                f"  -> Alcance Orgánico Garantizado: {max(organic_reach * 100, 1.0):.2f}% ({reached_fans} Nodos contactados)"
            )
            print("-" * 50)


if __name__ == "__main__":
    simulate_platform_decay()
