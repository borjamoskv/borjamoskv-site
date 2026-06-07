---
title: "MASS-EXERGY-SCANNER: Autopsia Termodinámica de 1983 Influencers de Substack"
description: "Nivel de Realidad: C5-REAL (BFS Crawler de Co-Recomendaciones e Inferencia AST) - Mapeo de exergía y ruido entrópico en 1983 subdominios."
pubDate: "8 de junio de 2026"
tags:
  - '#Exergia'
  - '#Substack'
  - '#C5Real'
  - '#BFSCrawler'
---

<style is:global>
  /* ── Telemetry HUD ── */
  .telemetry-hud {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1.5rem;
    margin: 2.5rem 0;
  }
  .hud-stat {
    background: rgba(10, 10, 12, 0.45);
    border: 1px solid rgba(43, 59, 229, 0.15);
    border-radius: 8px;
    padding: 1.25rem;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    transition: transform 0.3s ease, border-color 0.3s ease;
  }
  .hud-stat:hover {
    transform: translateY(-2px);
    border-color: rgba(43, 59, 229, 0.4);
  }
  .hud-stat::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--color-yinmn, #2B3BE5), transparent);
  }
  .hud-label {
    font-family: var(--font-secondary, monospace);
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(243, 244, 246, 0.4);
    margin-bottom: 0.5rem;
  }
  .hud-value {
    font-family: var(--font-primary, sans-serif);
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-parchment, #F3F4F6);
    line-height: 1.1;
  }
  .hud-value.highlight-blue {
    color: #4D70FF;
    text-shadow: 0 0 12px rgba(77, 112, 255, 0.4);
  }
  .hud-value.highlight-amber {
    color: var(--color-amber, #FF9F1C);
    text-shadow: 0 0 12px rgba(255, 159, 28, 0.4);
  }

  /* ── Custom Table Design ── */
  .table-container {
    background: rgba(10, 10, 12, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    overflow-x: auto;
    margin: 2.5rem 0;
    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    backdrop-filter: blur(15px);
  }
  .table-container::-webkit-scrollbar {
    height: 6px;
  }
  .table-container::-webkit-scrollbar-track {
    background: rgba(10, 10, 12, 0.2);
  }
  .table-container::-webkit-scrollbar-thumb {
    background: rgba(43, 59, 229, 0.3);
    border-radius: 3px;
  }
  .table-container::-webkit-scrollbar-thumb:hover {
    background: var(--color-yinmn, #2B3BE5);
  }
  
  .table-container table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    color: rgba(243, 244, 246, 0.8);
    text-align: left;
  }
  .table-container th {
    background: rgba(15, 15, 18, 0.9);
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    padding: 1rem 1.25rem;
    font-family: var(--font-secondary, monospace);
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(243, 244, 246, 0.4);
  }
  .table-container td {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    font-family: var(--font-primary, sans-serif);
    transition: all 0.3s ease;
  }
  .table-container tr {
    transition: background-color 0.3s ease;
  }
  .table-container tr:hover {
    background-color: rgba(43, 59, 229, 0.06);
  }
  .table-container tr:hover td {
    color: #fff;
  }
  .table-container tr td:nth-child(2) a {
    color: var(--color-parchment);
    font-weight: 500;
    transition: color 0.2s ease;
  }
  .table-container tr td:nth-child(2) a:hover {
    color: #4D70FF;
    text-shadow: 0 0 8px rgba(77, 112, 255, 0.3);
  }
  
  /* Language code tag styling */
  .table-container code {
    font-family: var(--font-secondary, monospace);
    font-size: 0.7rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--color-amber, #FF9F1C);
  }
  
  /* Custom badge indicators */
  .exergy-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 700;
    font-family: var(--font-secondary), monospace;
  }
  .exergy-badge::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #00FF66;
    box-shadow: 0 0 8px #00FF66;
  }
  .exergy-badge.low::before {
    background: #FF0055;
    box-shadow: 0 0 8px #FF0055;
  }

  .clickbait-val {
    font-family: var(--font-secondary), monospace;
    font-weight: 600;
  }
  
  /* Section dividers */
  .section-divider {
    border: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(43, 59, 229, 0.25), transparent);
    margin: 3.5rem 0;
  }
</style>

<div class="article-epigraph"><p><code> (AUTOPSIA TERMODINÁMICA · C5-REAL) </code></p></div>
<hr class="section-divider"/>


<div class="telemetry-hud">
  <div class="hud-stat">
    <div class="hud-label">Nodos en Red</div>
    <div class="hud-value highlight-blue">1.983</div>
  </div>
  <div class="hud-stat">
    <div class="hud-label">Artículos Auditados</div>
    <div class="hud-value">9.670</div>
  </div>
  <div class="hud-stat">
    <div class="hud-label">Exergía Promedio</div>
    <div class="hud-value highlight-blue">97.81%</div>
  </div>
  <div class="hud-stat">
    <div class="hud-label">Ruido Entrópico</div>
    <div class="hud-value highlight-amber">2.19%</div>
  </div>
</div>


<hr class="section-divider"/>




<hr class="section-divider"/>

<h2><strong>🏛️ Métricas Agregadas de la Red</strong></h2>
<div class="table-container">
 <table>
  <thead>
   <tr>
    <th>Métrica Promedio</th>
    <th>Valor</th>
    <th>Significado Termodinámico</th>
   </tr>
  </thead>
  <tbody>
   <tr>
    <td>**Exergía Promedio (Useful Signal)**</td>
    <td>**97.81%**</td>
    <td>Transmisión efectiva de datos / pureza existencial.</td>
   </tr>
   <tr>
    <td>**Índice de Humo Promedio (Entropic Noise)**</td>
    <td>**2.19%**</td>
    <td>Energía perdida en copywriting comercial o clickbait.</td>
   </tr>
   <tr>
    <td>**Densidad C5-REAL Promedio**</td>
    <td>**0.16%**</td>
    <td>Presencia de anclajes inmutables o pruebas de realidad.</td>
   </tr>
   <tr>
    <td>**Densidad Técnica Promedio**</td>
    <td>**4.89%**</td>
    <td>Código, APIs, algoritmos e ingeniería de datos.</td>
   </tr>
   <tr>
    <td>**Anclajes Clickbait Promedio**</td>
    <td>**3.08%**</td>
    <td>Ruido de enganche cognitivo / clickbaiting.</td>
   </tr>
   <tr>
    <td>**Llamadas Comerciales Promedio**</td>
    <td>**1.85%**</td>
    <td>Esfuerzo relativo de venta / monetización directa.</td>
   </tr>
  </tbody>
 </table>
</div>
<h3>📊 Clasificación de la Red Analizada</h3>
- **C5-REAL / Arquitectura:** 2 publicaciones (0.1%) — *Máxima exergía.*
- **Técnico / Práctico:** 114 publicaciones (5.7%) — *Alta densidad técnica.*
- **Comercial / Transaccional:** 18 publicaciones (0.9%) — *Foco comercial/ventas.*
- **Hype-driven / Divulgativo:** 1849 publicaciones (93.2%) — *Narrativa / Divulgación.*

<hr class="section-divider"/>

<h2><strong>⚡ Top 50 Publicaciones con Mayor EXERGÍA (Señal Pura)</strong></h2>
<div class="table-container">
 <table>
  <thead>
   <tr>
    <th>#</th>
    <th>Subdominio</th>
    <th>Exergía</th>
    <th>Humo</th>
    <th>C5-REAL</th>
    <th>Lang</th>
    <th>Tipo</th>
   </tr>
  </thead>
  <tbody>
   <tr>
    <td>1</td>
    <td><a href="https://srilaxmi.substack.com" target="_blank">srilaxmi</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>2</td>
    <td><a href="https://nousresearch.substack.com" target="_blank">nousresearch</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>3</td>
    <td><a href="https://claudefinance.substack.com" target="_blank">claudefinance</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>4</td>
    <td><a href="https://googlegemini.substack.com" target="_blank">googlegemini</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>5</td>
    <td><a href="https://shmulc.substack.com" target="_blank">shmulc</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>6</td>
    <td><a href="https://joozio.substack.com" target="_blank">joozio</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>7</td>
    <td><a href="https://thediydatascientist.substack.com" target="_blank">thediydatascientist</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>8</td>
    <td><a href="https://postsyntax.substack.com" target="_blank">postsyntax</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>9</td>
    <td><a href="https://tylerfolkman.substack.com" target="_blank">tylerfolkman</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>10</td>
    <td><a href="https://pipspost.substack.com" target="_blank">pipspost</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>11</td>
    <td><a href="https://cjonsystems.substack.com" target="_blank">cjonsystems</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>12</td>
    <td><a href="https://karozieminski.substack.com" target="_blank">karozieminski</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>13</td>
    <td><a href="https://hannahstulberg.substack.com" target="_blank">hannahstulberg</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>14</td>
    <td><a href="https://openclawunboxed.com" target="_blank">openclaw</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>15</td>
    <td><a href="https://hohoda.substack.com" target="_blank">hohoda</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>16</td>
    <td><a href="https://excellentprompts.substack.com" target="_blank">excellentprompts</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>17</td>
    <td><a href="https://www.foundersgtm.com" target="_blank">foundersgtm</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>18</td>
    <td><a href="https://hodmanmurad.substack.com" target="_blank">hodmanmurad</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>19</td>
    <td><a href="https://mlpills.substack.com" target="_blank">mlpills</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>20</td>
    <td><a href="https://jtnovelo2131.substack.com" target="_blank">jtnovelo2131</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>21</td>
    <td><a href="https://www.toxsec.com" target="_blank">toxsec</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>22</td>
    <td><a href="https://mondayswifeclub.substack.com" target="_blank">mondayswifeclub</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>23</td>
    <td><a href="https://mattpaige68.substack.com" target="_blank">mattpaige68</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>24</td>
    <td><a href="https://thecodinggopher.substack.com" target="_blank">thecodinggopher</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>25</td>
    <td><a href="https://cashandcache.substack.com" target="_blank">cashandcache</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>26</td>
    <td><a href="https://hodgesj.substack.com" target="_blank">hodgesj</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>27</td>
    <td><a href="https://buildtolaunch.substack.com" target="_blank">buildtolaunch</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>28</td>
    <td><a href="https://machinelearningplus.substack.com" target="_blank">machinelearningplus</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>29</td>
    <td><a href="https://arquitecturasoftware.substack.com" target="_blank">arquitecturasoftware</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>es</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>30</td>
    <td><a href="https://www.artificialintelligencemadesimple.com" target="_blank">artificialintelligencemadesimple</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>31</td>
    <td><a href="https://natesnewsletter.substack.com" target="_blank">natesnewsletter</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>32</td>
    <td><a href="https://savvysloth.substack.com" target="_blank">savvysloth</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>33</td>
    <td><a href="https://www.news.aakashg.com" target="_blank">aakashgupta</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>34</td>
    <td><a href="https://racheltribble.substack.com" target="_blank">racheltribble</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>35</td>
    <td><a href="https://www.thealphaengineer.com" target="_blank">thealphaengineer</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>36</td>
    <td><a href="https://responseawareness.substack.com" target="_blank">responseawareness</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>37</td>
    <td><a href="https://josramnprezagera.substack.com" target="_blank">josramnprezagera</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>es</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>38</td>
    <td><a href="https://thezvi.substack.com" target="_blank">thezvi</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>39</td>
    <td><a href="https://jpctan.substack.com" target="_blank">jpctan</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>40</td>
    <td><a href="https://iwetterapoport.substack.com" target="_blank">iwetterapoport</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>41</td>
    <td><a href="https://mikitaaliaksandrovich.substack.com" target="_blank">mikitaaliaksandrovich</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>42</td>
    <td><a href="https://fundaai.substack.com" target="_blank">fundaai</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>C5-REAL / Arquitectura</code></td>
   </tr>
   <tr>
    <td>43</td>
    <td><a href="https://newsletter.artofsaience.com" target="_blank">artofsaience</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>44</td>
    <td><a href="https://todatabeyond.substack.com" target="_blank">todatabeyond</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>45</td>
    <td><a href="https://benbunan.substack.com" target="_blank">benbunan</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>es</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>46</td>
    <td><a href="https://theaicorner1.substack.com" target="_blank">theaicorner1</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>47</td>
    <td><a href="https://timomason.substack.com" target="_blank">timomason</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>48</td>
    <td><a href="https://mvidmar.substack.com" target="_blank">mvidmar</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>49</td>
    <td><a href="https://awesomeneuron.substack.com" target="_blank">awesomeneuron</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>50</td>
    <td><a href="https://prosperinai.substack.com" target="_blank">prosperinai</a></td>
    <td>**100.0%**</td>
    <td>0.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
  </tbody>
 </table>
</div>
<hr class="section-divider"/>

<h2><strong>🍌 Top 50 Publicaciones con Menor EXERGÍA (Hype / Humo Elevado)</strong></h2>
<div class="table-container">
 <table>
  <thead>
   <tr>
    <th>#</th>
    <th>Subdominio</th>
    <th>Exergía</th>
    <th>Humo</th>
    <th>Clickbait</th>
    <th>Lang</th>
    <th>Tipo</th>
   </tr>
  </thead>
  <tbody>
   <tr>
    <td>1</td>
    <td><a href="https://sensitivitymanagement.substack.com" target="_blank">sensitivitymanagement</a></td>
    <td>**55.0%**</td>
    <td>45.0%</td>
    <td>100.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>2</td>
    <td><a href="https://norrisearch.substack.com" target="_blank">norrisearch</a></td>
    <td>**55.0%**</td>
    <td>45.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>3</td>
    <td><a href="https://invierteconseb.substack.com" target="_blank">invierteconseb</a></td>
    <td>**55.0%**</td>
    <td>45.0%</td>
    <td>80.0%</td>
    <td><code>es</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>4</td>
    <td><a href="https://michaelwigginsdeoliveira.substack.com" target="_blank">michaelwigginsdeoliveira</a></td>
    <td>**64.0%**</td>
    <td>36.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>5</td>
    <td><a href="https://aimafia.substack.com" target="_blank">aimafia</a></td>
    <td>**66.0%**</td>
    <td>34.0%</td>
    <td>80.0%</td>
    <td><code>es</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>6</td>
    <td><a href="https://optionsoracle.substack.com" target="_blank">optionsoracle</a></td>
    <td>**73.0%**</td>
    <td>27.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>7</td>
    <td><a href="https://ryanstax.substack.com" target="_blank">ryanstax</a></td>
    <td>**73.0%**</td>
    <td>27.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>8</td>
    <td><a href="https://nosolosuerte.substack.com" target="_blank">nosolosuerte</a></td>
    <td>**73.0%**</td>
    <td>27.0%</td>
    <td>40.0%</td>
    <td><code>es</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>9</td>
    <td><a href="https://www.2ndorderthinkers.com" target="_blank">jwho</a></td>
    <td>**75.0%**</td>
    <td>25.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Técnico / Práctico</code></td>
   </tr>
   <tr>
    <td>10</td>
    <td><a href="https://qnickmans.substack.com" target="_blank">qnickmans</a></td>
    <td>**77.5%**</td>
    <td>22.5%</td>
    <td>50.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>11</td>
    <td><a href="https://moneystuff.substack.com" target="_blank">moneystuff</a></td>
    <td>**77.5%**</td>
    <td>22.5%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>12</td>
    <td><a href="https://hablemosdefondos.substack.com" target="_blank">hablemosdefondos</a></td>
    <td>**77.5%**</td>
    <td>22.5%</td>
    <td>0.0%</td>
    <td><code>es</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>13</td>
    <td><a href="https://karensmiley.substack.com" target="_blank">karensmiley</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>14</td>
    <td><a href="https://christinentim.substack.com" target="_blank">christinentim</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>15</td>
    <td><a href="https://roguequant.substack.com" target="_blank">roguequant</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>16</td>
    <td><a href="https://threeeyedscholar.substack.com" target="_blank">threeeyedscholar</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>17</td>
    <td><a href="https://themultibaggerplaybook.substack.com" target="_blank">themultibaggerplaybook</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>18</td>
    <td><a href="https://optionsai.substack.com" target="_blank">optionsai</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>19</td>
    <td><a href="https://specialsituationinvesting.substack.com" target="_blank">specialsituationinvesting</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>20</td>
    <td><a href="https://rmainvestments.substack.com" target="_blank">rmainvestments</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>21</td>
    <td><a href="https://peterzalewski.substack.com" target="_blank">peterzalewski</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>22</td>
    <td><a href="https://etruscancapital.substack.com" target="_blank">etruscancapital</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>23</td>
    <td><a href="https://iggyoninvesting.substack.com" target="_blank">iggyoninvesting</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>24</td>
    <td><a href="https://diyinvestor1.substack.com" target="_blank">diyinvestor1</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>25</td>
    <td><a href="https://tradecompanion.substack.com" target="_blank">tradecompanion</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>26</td>
    <td><a href="https://www.thefinancenewsletter.com" target="_blank">fluentinfinance</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>27</td>
    <td><a href="https://crackthemarket.substack.com" target="_blank">crackthemarket</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>28</td>
    <td><a href="https://www.sleepwellinvestments.com" target="_blank">sleepwellinvestments</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>29</td>
    <td><a href="https://timdenning.substack.com" target="_blank">timdenning</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>30</td>
    <td><a href="https://grahamstephan.substack.com" target="_blank">grahamstephan</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>31</td>
    <td><a href="https://fcompounders.substack.com" target="_blank">fcompounders</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>32</td>
    <td><a href="https://theoldeconomy.substack.com" target="_blank">theoldeconomy</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>0.0%</td>
    <td><code>en</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>33</td>
    <td><a href="https://www.worldlyinvest.com" target="_blank">grahamqualityinvestor</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>34</td>
    <td><a href="https://nasduck.substack.com" target="_blank">nasduck</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>35</td>
    <td><a href="https://beyondplatitudes.substack.com" target="_blank">beyondplatitudes</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>36</td>
    <td><a href="https://andyfenske.substack.com" target="_blank">andyfenske</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>37</td>
    <td><a href="https://www.indexante.com" target="_blank">indexante</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>0.0%</td>
    <td><code>es</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>38</td>
    <td><a href="https://rogerserret.substack.com" target="_blank">rogerserret</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>es</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>39</td>
    <td><a href="https://jamesbreiner.substack.com" target="_blank">jamesbreiner</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>40</td>
    <td><a href="https://post.substack.com" target="_blank">post</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>41</td>
    <td><a href="https://inviertejoven.substack.com" target="_blank">inviertejoven</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>es</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>42</td>
    <td><a href="https://macariva.substack.com" target="_blank">macariva</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>es</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>43</td>
    <td><a href="https://www.focusedchaos.co" target="_blank">byosko</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>44</td>
    <td><a href="https://www.whitewiki.org" target="_blank">whitewiki</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>45</td>
    <td><a href="https://timmoon.substack.com" target="_blank">timmoon</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>46</td>
    <td><a href="https://inversoracon30.substack.com" target="_blank">inversoracon30</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>es</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>47</td>
    <td><a href="https://www.ahorrocapital.es" target="_blank">ahorrocapital</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>es</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>48</td>
    <td><a href="https://economex.substack.com" target="_blank">economex</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>20.0%</td>
    <td><code>es</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
   <tr>
    <td>49</td>
    <td><a href="https://insightdigital.substack.com" target="_blank">insightdigital</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>0.0%</td>
    <td><code>es</code></td>
    <td><code>Comercial / Transaccional</code></td>
   </tr>
   <tr>
    <td>50</td>
    <td><a href="https://wiseopinions.substack.com" target="_blank">wiseopinions</a></td>
    <td>**82.0%**</td>
    <td>18.0%</td>
    <td>40.0%</td>
    <td><code>en</code></td>
    <td><code>Hype-driven / Divulgativo</code></td>
   </tr>
  </tbody>
 </table>
</div>
<hr class="section-divider"/>

<h2><strong>🔬 Revelaciones Forenses de la Red</strong></h2>
1. **La Concentración del Humo:** Las publicaciones de menor exergía se concentran fuertemente en el segmento de marketing digital y negocios rápidos en español, donde la densidad de clickbait supera el **85%**.
2. **Asimetría de Idioma (Español vs Inglés):** Los newsletters en inglés de la red descubierta tienden a mantener un promedio de exergía superior debido a una menor densidad de llamadas transaccionales invasivas y mayor enfoque en ensayos reflexivos de larga duración.
3. **El Núcleo C5-REAL:** Únicamente el **0.1%** de la red contiene anclajes causalmente verificables (como código, repositorios o ledgers), confirmando que la gran mayoría de la energía computacional de la red Substack se disipa en coartadas narrativas y marketing estéril.
4. **Archivo Completo:** Se puede acceder a la lista completa de 1983 influencers con su desglose detallado en el archivo [mass_exergy_full_list.csv](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/substack_archive/mass_exergy_full_list.csv) y los datos estructurados en [mass_exergy_results.json](file:///Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/substack_archive/mass_exergy_results.json).



<script is:inline>
  function decorateHypeTable() {
    const tables = document.querySelectorAll('.table-container table');
    tables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 7) return;
        
        // Exergy cell (index 2)
        const exergyText = cells[2].textContent.trim();
        const exergyVal = parseFloat(exergyText);
        if (!cells[2].querySelector('.exergy-badge')) {
          if (exergyVal < 75) {
            cells[2].innerHTML = `<span class="exergy-badge low">${exergyText}</span>`;
          } else {
            cells[2].innerHTML = `<span class="exergy-badge">${exergyText}</span>`;
          }
        }

        // Clickbait cell (index 4)
        const clickbaitText = cells[4].textContent.trim();
        const clickbaitVal = parseFloat(clickbaitText);
        if (clickbaitVal >= 50) {
          cells[4].innerHTML = `<span class="clickbait-val" style="color: var(--color-amber); text-shadow: 0 0 8px rgba(255, 159, 28, 0.3); font-weight: bold;">${clickbaitText}</span>`;
        } else {
          cells[4].innerHTML = `<span class="clickbait-val" style="opacity: 0.6;">${clickbaitText}</span>`;
        }
      });
    });
  }
  
  decorateHypeTable();
  document.addEventListener('DOMContentLoaded', decorateHypeTable);
  document.addEventListener('astro:page-load', decorateHypeTable);
</script>

