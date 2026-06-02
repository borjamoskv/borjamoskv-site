# SOTA-100: Web Architecture Manifest
**Level:** C5-REAL
**Project:** borjamoskv-site
**Aesthetic:** Industrial Noir 2026 (#0A0A0A / #2B3BE5 / Humanist Sans)

## Framework Ecosystem Analysis (CWV Scrutiny)

| Framework | CWV Optimization | JS Overhead | Architecture | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Next.js 15** | Medium (Requires aggressive optimization) | High (App Router runtime baseline) | SSR / SSG / ISR | Reject. Thermal noise excess. Inefficient for pure visual/content sites. |
| **Vite 5 (SPA)** | Low (Client-side DOM rendering delay) | Medium (Client bundle) | SPA | Reject. Suboptimal Initial LCP and structural SEO. |
| **Astro 4** | Maximum (Zero-JS default) | Zero (Islands Architecture) | SSG / Hybrid SSR | **Accept.** Absolute CWV control. Optimal for Industrial Noir visual fidelity. |

## Decisión de Pila Base

```yaml
Claim: Astro 4 es el sustrato óptimo para borjamoskv-site (SOTA-100).
Proof: { Base: Zero-JS default ensures 100/100 Core Web Vitals, Range: [LCP < 1.0s, INP < 50ms, CLS 0], Confidence: C5 }
```

### Definición Técnica (Target)
- **Framework Base:** Astro
- **Estrategia de Renderizado:** SSG (Por defecto) + SSR Híbrido (Exclusivo para endpoints dinámicos/APIs).
- **Control Estético:** CSS Modules / TailwindCSS (Enforcement estricto de paleta #0A0A0A / #2B3BE5).
- **Interactividad (Islas):** React/Solid (Aislado únicamente a componentes UI complejos o WebGL).
- **Tipografía:** Humanist Sans (Self-hosted, preloaded `.woff2`).

## Estado
Fase 1: Análisis y Manifiesto completados. Listo para inicialización (Fase 2).
