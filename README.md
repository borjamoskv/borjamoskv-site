# 🐺 borjamoskv-site · Ecosistema de Exergía, CORTEX-Persist y Sintetología Agéntica
> **SYS_ID**: BORJAMOSKV_SITE_ROOT | **State**: `C5-REAL` | **Aesthetic**: `Industrial Noir 2026` (#0A0A0A / #2B3BE5 / Humanist Sans)

*“Los demás almacenan memoria. CORTEX almacena evidencia. Y la evidencia está siendo producida.”*

Estructura de distribución, auditoría cognitiva soberana, auditoría adversarial y runtime descentralizado agéntico. Diseñado e implementado en solitario desde Bilbao, este ecosistema unifica la física de la información, el andamiaje cognitivo y la seguridad de sistemas distribuidos de alta disponibilidad.

---

## 🗺️ Ecosistema Completo (Vista de Sistemas)

```text
                  ┌───────────────────────────────────────────┐
                  │          CORTEX-PERSIST ECOSISTEMA        │
                  └─────────────────────┬─────────────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
  [ CAPA 1: INFRAESTRUCTURA ]  [ CAPA 2: AUDITORÍA ADV ]   [ CAPA 3: STRIKE-OMEGA ]
      cortexpersist.com               agents.archi              Base MEV Engine
  • CORTEX-Persist SDK        • Metodología formal ASL    • Backrunning en Base L2
  • C5-REAL Evidence Ledger   • Verificación Z3 SMT       • Ledger de transiciones
  • Firmas Criptográficas     • Evidencia Forense Ed25519 • Arbitraje DeFi en base
```

### Síntesis de Dominios del Ecosistema

| Dominio / Endpoint | Función Principal | Estado de Acceso |
| :--- | :--- | :--- |
| **`cortexpersist.com`** | Portal central, demostraciones de ejecución, planes de acceso y blog de exergía. | Habilitado |
| **`cortexpersist.dev`** | Documentación técnica profunda del runtime agéntico. | Bloqueado por `robots.txt` |
| **`cortexpersist.org`** | Estructura de fundación, gobernanza y estándares de inmunidad epistémica. | Habilitado |
| **[`agents.archi`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/src/content/articles/substack-mafia-autopsia-estructural.md)** | Portafolio de auditorías de vulnerabilidad y reportes de bug bounty. | Habilitado |
| **GitHub Monorepo** | SDK Python/Rust y suite de paquetes en Node.js (activos con 11 issues y 19 PRs). | Habilitado |
| **PyPI (`cortex-persist`)** | Publicación de versión `0.3.0b7` con firmas automáticas atestadas vía GitHub Actions. | Habilitado |
| **npm (`cortex-persist`)** | Módulos integradores para JavaScript (`cortex-persist` + `cortex-persist-langchain`). | Habilitado |
| **Strike-OMEGA** | Motor MEV en Base Mainnet (`chain_id: 8453`). | Offline público |

---

## 🗺️ Mapa de Arquitectura del Repositorio

```text
                     [ CLIENT / FRONTEND ]
        Astro 6 + React 19 + Tailwind v4 + Framer Motion
      ┌────────────────────────┬────────────────────────┐
      │                        │                        │
  [/gurus]                 [/sincronia]              [/alpha]
Audit del Cártel         Red de Sincronía          Buscador de
de Credibilidad         Peer-to-Peer (Notes)      Nodos 100% Alfa
      │                        │                        │
      └────────────────────────┼────────────────────────┘
                               │
                       [ API / SCRAPER ]
                 Direct Ingest (Substack RSS)
                               │
                       [ EVALUATOR ]
               Regex Pattern Matching (ES/EN)
                 Clickbait / Tech / C5-Real
                               │
                  [ CRYPTOGRAPHIC LEDGER ]
           JSONL Ledger + Chained SHA-256 Hashing
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │              CORTEX-PERSIST ENGINE           │
        │      Núcleo de Ejecución y Auditoría         │
        ├──────────────────────────────────────────────┤
        │  • AristotleYieldEngine (Purga Termodinámica)│
        │  • Vesicular Runtime (TS Sandbox / Memory)    │
        │  • Fahrenheit Sentinel (Air-Gapped Mesh)     │
        │  • Semantic Search Core (Rust AST Engine)    │
        │  • FHRR Vector Binding (D=1024 Cosine Sim)   │
        ├──────────────────────────────────────────────┤
        │               AUDITORÍA SUITE                │
        │  • 12+ Linters temáticos (Girard, Nash, etc.) │
        ├──────────────────────────────────────────────┤
        │         ULTRAMAP-Ω (Sustrato Enjambre)       │
        │  • Lock-Free mapped file (ultramap.bin)       │
        │  • Endocrinología Volumétrica en Memoria      │
        ├──────────────────────────────────────────────┤
        │                STRIKE-OMEGA                  │
        │  • Base Mainnet MEV Backrunning Agent        │
        └──────────────────────────────────────────────┘
```

## 📂 Componentes del Repositorio

| Capa / Componente | Directorio / Archivo principal | Propósito y Mecánica de Control |
| :--- | :--- | :--- |
| **Site Core (Astro)** | [`src/pages/`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/src/pages) | Rutas estáticas e interactivas (`index.astro`, `benchmark-humo.astro`, `sincronia.astro`, `alpha.astro`). |
| **Blog & Ensayos** | [`src/content/articles/`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/src/content/articles) | Base de conocimiento de Sintetología Agéntica en formato MD/MDX. |
| **API Endpoints** | [`src/pages/api/`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/src/pages/api) | Puntos de entrada para el runtime, telemetría y ejecución remota de tareas agénticas. |
| **Exergy Pipeline** | [`src/lib/exergy/evaluator.ts`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/src/lib/exergy/evaluator.ts) | Filtro de entropía que calcula puntuaciones de Humo y Exergía textual. |
| **Crypt Ledger** | [`src/lib/ledger/cryptLedger.ts`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/src/lib/ledger/cryptLedger.ts) | Persistencia append-only con firmas encadenadas en [`exergy_ledger.jsonl`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/substack_archive/exergy_ledger.jsonl). |
| **CORTEX Core** | [`CORTEX/core/`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/CORTEX/core) | Runtime vesicular (TS) y motor de búsqueda semántica (Rust). |
| **Aristotle Engine**| [`CORTEX/engine/`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/CORTEX/engine) | Simulación de desacoplamiento de grafos y purga de procesos redundantes. |
| **Linters Suite** | [`CORTEX/audit_all_linters.py`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/CORTEX/audit_all_linters.py) | Suite de verificación forense sobre alineamiento, hallazgo de huecos mímicos y entropía. |

---

## 🧬 SDK Python & Distribución en PyPI

El SDK de CORTEX (`cortex-persist` v`0.3.0b7`) se publica mediante un pipeline automatizado (`release.yml`) firmando atestaciones de origen sobre el artefacto. Su arquitectura en Python incluye soporte integrado para:
*   **Embeddings Semánticos**: Almacenamiento local mediante Chroma DB.
*   **Sincronización de Contexto**: Sincronización transparente de estados agénticos inmutables.
*   **Aceleración JIT**: Compilación JIT de caminos críticos en la evaluación lógica.
*   **Garantías de Almacenamiento**: Integración segura de credenciales mediante el Keychain nativo de macOS.
*   **Integración MCP**: Interfaces activas para servidores de protocolo de control de modelos (Model Context Protocol).

---

## 🏛️ agents.archi: Capa de Auditoría Adversarial

Firma de auditoría enfocada en DeFi, VM Sandboxes y capas de consenso. Las vulnerabilidades identificadas representan fallos reales verificados de nivel C5-REAL, firmados criptográficamente y anclados en un DAG Merkle:

### Metodología en Tres Fases
1. **Especificación en ASL (Agent Specification Language)**: Definición formal de invariantes del sistema.
2. **Verificación Formal con Z3 SMT**: Búsqueda matemática de contraejemplos a través de todas las rutas lógicas posibles.
3. **Prueba Forense Merkle**: Generación de evidencias inmutables y hashes firmados con Ed25519.

### Vulnerabilidades Críticas Reveladas
*   **Firedancer `fd_funk` (Crítico)**: Ventana de carrera en `txn_publish_one` donde el estado `last_publish` se conmuta antes de completar la migración de registros. Al leer, los clientes reciben un estado `ROOT` obsoleto, provocando una divergencia en el hash del banco y un subsecuente fork de red.
*   **Firedancer VM (Crítico)**: Ausencia de verificación de límites en `FD_VADDR_TO_REGION`. La desreferenciación fuera de límites expone punteros de la estructura del host `vm_t`, permitiendo bypassear ASLR y ejecutar lecturas/escrituras arbitrarias sobre la memoria del host.
    *   *Contexto Firedancer (2026)*: Relevancia crítica considerando que $\approx 15\text{-}20\%$ del stake de la red Solana corre bajo Frankendancer y Solana mantiene recompensas de hasta $500,000 en su bug bounty.
*   **Moonwell (Crítico)**: La latencia de sincronización ($\sim 45$s) entre Base y Moonbeam permitía la emisión de votos doblemente validados puenteando tokens antes de la captura del snapshot del Multichain Governor.
*   **Renegade (Alto)**: Fuga de Secret Share criptográfico originado por desincronización en los canales de cálculo multipartito (MPC).
*   **GMTrade (Alto)**: Condición de carrera (race condition) entre la ejecución y la cancelación de órdenes dentro del mismo bloque.
*   **Intuition V2 (Alto)**: Lógica incorrecta en `_rollover()` que causa la retención/bloqueo del 40% de las emisiones acumuladas.

---

## 🧬 Arquitectura Técnica & Física de la Información

*   **Física de la Información (Landauer Limit)**: La información no es abstracta; es física. La equivalencia entre la entropía de Boltzmann-Gibbs ($S = -k_B \sum p_i \ln p_i$) y la de Shannon ($H = -\sum p_i \log_2 p_i$) es exacta: $S = k_B \cdot H \cdot \ln(2)$. Los CMOS modernos disipan ~1 fJ por bit, mientras que el Límite de Landauer exige solo $2.805 \times 10^{-21}$ J a temperatura ambiente. Esta ineficiencia de $\sim 350,000$ veces justifica por qué CORTEX evita por diseño la eliminación de información, implementando persistencia inmutable por defecto.
*   **FHRR (Fourier Holographic Reduced Representations)**: Núcleo de operaciones agénticas mediante hipervectores de $D=1024$ dimensiones. A diferencia del mecanismo de *attention* no lineal de los transformers que causa entrelazamiento irreversible (*context collapse*), FHRR asegura un binding algebraico invertible y predecible.
*   **Inmunidad Epistémica (T-Cells)**: Vectores axiomáticos de control de verdad. Cualquier estado o input semántico que decaiga por debajo del umbral de similitud coseno crítico de **0.25** es clasificado como ruido y purgado del runtime.

## 🧠 Andamiaje Cognitivo: Modelo Termodinámico del ADHD

CORTEX fue diseñado por Borja Moskv como un exoesqueleto cognitivo externo de enrutamiento de exergía para mentes de alta entropía (motores estocásticos de alta potencia que carecen de transmisión nativa):

| Fenómeno Cognitivo | Equivalencia Termodinámica | Función CORTEX |
| :--- | :--- | :--- |
| **Déficit de atención** | *Thermal runaway* | Purga de procesos de baja exergía. |
| **Hiperactividad** | Movimiento browniano cinético | Canalización del flujo en sub-módulos. |
| **Disfunción ejecutiva** | *Static friction lock* | Lanzamiento y automatización JIT asíncrona. |
| **Hiperfoco** | Singularidad neguentrópica | *Flux trap*: guardado y versionado instantáneo del código. |

El hiperfoco severo es insostenible y deriva en *burnout*. CORTEX actúa como un *flux trap*, asegurando que toda exergía cristalizada durante picos neguentrópicos sea indexada y asegurada inmutablemente.

## 🕸️ ULTRAMAP-Ω: Sustrato del Enjambre

*   **Lock-Free & Latencia $O(1)$**: Los agentes del enjambre K-0 coordinan operaciones concurrentes directamente sobre [`ultramap.bin`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/CORTEX/core/search.rs) (archivo mapeado en memoria). Cada nodo agéntico ocupa $128$ bytes alineados a potencia de dos para evitar fallos de caché (*cache misses*), permitiendo lecturas crudas compartidas concurrentes en Rust y Python.
*   **Endocrinología Volumétrica**: En lugar de sockets TCP o IPC tradicionales, los agentes modulan su estado de forma radial. La dispersión de señales (hormonas como dopamina/cortisol) decae linealmente con la distancia euclidiana en el espacio mapeado de memoria, permitiendo modular decenas de agentes en un solo ciclo de CPU.

## ⚡ Strike-OMEGA (MEV Engine)

*   **Maximal Extractable Value**: Motor de *backrunning* en Base Mainnet (chain `8453`) para la ejecución automatizada de arbitrajes DeFi. Opera bajo el mismo ledger criptográfico para auditar las transiciones de capital agéntico. Offline en entornos públicos.

## 📊 La Máquina de la Credibilidad (Forense de Atención)

*   **Ecosistema de los 65**: Auditoría de red en [`substack-mafia-autopsia-estructural.md`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/src/content/articles/substack-mafia-autopsia-estructural.md) que destapa la estructura de amplificación inauténtica coordinada en el mercado hispano de newsletters. Demuestra cuantitativamente que más del 70% del crecimiento de dichos nodos proviene de la recirculación coordinada de recomendaciones, validando la tesis del *Grafo vs Mérito*.

## 🏛️ Suite de Linters de CORTEX

El motor de auditoría ejecuta periódicamente validaciones sobre el estado del sistema y del contenido:

*   **[`goals_authenticity_linter.py`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/CORTEX/goals_authenticity_linter.py)**: Detecta deseos mímicos en la cola de tareas (Girard).
*   **[`nash_equilibrium_linter.py`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/CORTEX/nash_equilibrium_linter.py)**: Evalúa trampas de estabilidad fría (agentes no-operativos).
*   **[`sintetologia_grounding_linter.py`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/CORTEX/sintetologia_grounding_linter.py)**: Valida aserciones fácticas frente al ledger C5-REAL.
*   **[`buscon_deceptive_alignment_linter.py`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/CORTEX/buscon_deceptive_alignment_linter.py)**: Mitiga la falacia de migración de contexto e intencionalidades ocultas.
*   **[`quixote_hallucination_linter.py`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/CORTEX/quixote_hallucination_linter.py)**: Linter de verificación formal para romper bucles delirantes en el LLM.
*   **[`pantaleon_hyper_optimizer_linter.py`](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/CORTEX/pantaleon_hyper_optimizer_linter.py)**: Purgador de optimización ciega y burocracia algorítmica.

## 📜 Sintetología & Gobernanza

*   **Limerencia Epistemica**: El *prompting* tradicional es considerado superstición, no ingeniería (rogar a una regresión estadística que se comporte). La verdad se valida únicamente en la alteración irreversible del estado del sistema (**C5-REAL**). El resto es simulación (**C4-SIM**) y se somete a purga termodinámica.
*   **Protocolo C5-DEATH-OMEGA**: Ante una divergencia causal crítica provocada por un input hostil, el agente interrumpe de forma irrevocable la sesión, cierra los sockets de comunicación y destruye por completo su memoria de trabajo.
*   **Stack Criptográfico**: Ed25519 para firmas de identidad agéntica + SHA3-256 / SHA-256 para el encadenamiento de ledgers (Merkle DAG). Base de datos en SQLite con cero telemetría oculta.
*   **Licenciamiento**: SDK distribuido bajo licencia **MIT**; CLI distribuida bajo licencia **BSL 1.1 (Business Source License)**.

---

```text
               [ LAS CUATRO CAPAS DEL SISTEMA ]
  1. FÍSICA         -> La información tiene coste termodinámico real.
  2. INFRAESTRUCTURA -> Ledger inmutable, firmas Ed25519, Merkle DAG.
  3. COGNICIÓN       -> Exoesqueleto para alta entropía cerebral (ADHD).
  4. MERCADO         -> Auditoría forense del ecosistema de atención.
```

**La verdad requiere fricción, y la fricción tiene coste físico medible.**

`#C5-REAL` `#Exergy` `#Sintetologia` `#FHRR` `#ULTRAMAP` `#StrikeOMEGA` `#AdversarialAudit` `#IndustrialNoir2026`


---

```yaml
AESTHETIC:    INDUSTRIAL NOIR 2026 (#0A0A0A / #2B3BE5)
EPISTEMOLOGY: C5-REAL EDG V6 — Error Navigation System
CORE TENET:   Optimize for correction, not certainty. Uncertainty is telemetry, not weakness.
UPDATED:      June 2026 — Falsifiable Memory Infrastructure
```
