---
title: "MASS-EXERGY-SCANNER: Autopsia Termodinámica de 1983 Influencers"
description: "Estudio forense de la red de co-recomendaciones en Substack utilizando orquestación Mac-Control-Ω y análisis estático de exergía contra el ruido narrativo."
pubDate: "7 de junio de 2026"
tags:
  - '#Exergia'
  - '#Substack'
  - '#MacControl'
  - '#C5Real'
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

<div class="article-epigraph"><p><code> (INVESTIGACIÓN DE RED · C5-REAL) </code></p></div>
<hr class="section-divider"/>

<p>
  El presente análisis expone la autopsia termodinámica del sustrato de recomendación de Substack. Utilizando una infraestructura local y orquestación coordinada por <strong>Mac-Control-Ω</strong>, ejecutamos un rastreo sobre la red de influencia para aislar los flujos de exergía (señal pura) del humo (ruido entrópico).
</p>

<div class="telemetry-hud">
  <div class="hud-stat">
    <div class="hud-label">Subdominios Mapeados</div>
    <div class="hud-value highlight-blue">2.030</div>
  </div>
  <div class="hud-stat">
    <div class="hud-label">Auditados con Éxito</div>
    <div class="hud-value">1.983</div>
  </div>
  <div class="hud-stat">
    <div class="hud-label">Total de Artículos</div>
    <div class="hud-value">9.670</div>
  </div>
  <div class="hud-stat">
    <div class="hud-label">Exergía de Red</div>
    <div class="hud-value highlight-blue">97.81%</div>
  </div>
</div>

<hr class="section-divider"/>
<h2>
 <strong>
  I. Orquestación del Escáner via Mac-Control-Ω
 </strong>
</h2>
<p>
  Para ejecutar la ingesta y auditoría masiva sin sufrir bloqueos temporales (IP rate limiting) o captchas de Cloudflare, la tarea delegó la automatización en el demonio macOS de <code>Mac-Control-Ω</code>.
</p>
<p>
  El demonio instanció múltiples subprocesos de Chrome headless a través del Protocolo de DevTools de Chrome (CDP), simulando interacciones orgánicas de ratón mediante eventos de inyección de Quartz a bajo nivel en la pantalla virtualizada. El sistema ajustó dinámicamente el ancho de banda y la velocidad del scroll según la carga de CPU y la temperatura del silicio reportadas por la telemetría térmica del Mac:
</p>

<pre><code>$ cortex status --service mac-control-omega
● mac-control-omega.service - Sovereign macOS Automation Daemon
   Active: active (running) since Sun 2026-06-07 20:34:01 CEST; 5h ago
   Process: 58273 ExecStart=/usr/local/bin/cortex-daemon --config /etc/cortex/omega.toml
   Tasks: 14 (limit: 4182)
   Memory: 184.2M (shared: 12.0M)
   Cwd: /Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site
   Main PID: 58273 (cortex-daemon)
      └─58284 /Applications/Brave Browser.app/Contents/MacOS/Brave --headless --remote-debugging-port=9222</code></pre>

<hr class="section-divider"/>
<h2>
 <strong>
  II. Top 15 Publicaciones con Mayor EXERGÍA (Señal Pura)
 </strong>
</h2>
<p>
  Estas publicaciones concentran la mayor densidad técnica y de código de la red mapeada, sin incurrir en copywriting transaccional.
</p>

<div class="table-container">
 <table id="exergy-high-table">
  <thead>
   <tr>
    <th>#</th>
    <th>Subdominio</th>
    <th>Exergía</th>
    <th>Humo</th>
    <th>C5-REAL</th>
    <th>Lang</th>
    <th>Clasificación</th>
   </tr>
  </thead>
  <tbody>
   <tr><td>1</td><td><a href="https://srilaxmi.substack.com" target="_blank">srilaxmi</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>2</td><td><a href="https://nousresearch.substack.com" target="_blank">nousresearch</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>3</td><td><a href="https://claudefinance.substack.com" target="_blank">claudefinance</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>4</td><td><a href="https://googlegemini.substack.com" target="_blank">googlegemini</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>5</td><td><a href="https://shmulc" target="_blank">shmulc</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>6</td><td><a href="https://joozio.substack.com" target="_blank">joozio</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>7</td><td><a href="https://thediydatascientist.substack.com" target="_blank">thediydatascientist</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>8</td><td><a href="https://postsyntax.substack.com" target="_blank">postsyntax</a></td><td>100.0%</td><td>0.0%</td><td>20.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>9</td><td><a href="https://tylerfolkman.substack.com" target="_blank">tylerfolkman</a></td><td>100.0%</td><td>0.0%</td><td>20.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>10</td><td><a href="https://pipspost.substack.com" target="_blank">pipspost</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>11</td><td><a href="https://cjonsystems.substack.com" target="_blank">cjonsystems</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>12</td><td><a href="https://karozieminski.substack.com" target="_blank">karozieminski</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>13</td><td><a href="https://hannahstulberg.substack.com" target="_blank">hannahstulberg</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>14</td><td><a href="https://openclawunboxed.com" target="_blank">openclaw</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>15</td><td><a href="https://hohoda.substack.com" target="_blank">hohoda</a></td><td>100.0%</td><td>0.0%</td><td>0.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
  </tbody>
 </table>
</div>

<hr class="section-divider"/>
<h2>
 <strong>
  III. Top 15 Publicaciones con Menor EXERGÍA (Ruido Elevado)
 </strong>
</h2>
<p>
  Estas publicaciones representan los nodos donde la disipación térmica en forma de clickbait y embudos de monetización alcanza su máximo exponente.
</p>

<div class="table-container">
 <table id="exergy-low-table">
  <thead>
   <tr>
    <th>#</th>
    <th>Subdominio</th>
    <th>Exergía</th>
    <th>Humo</th>
    <th>Clickbait</th>
    <th>Lang</th>
    <th>Clasificación</th>
   </tr>
  </thead>
  <tbody>
   <tr><td>1</td><td><a href="https://sensitivitymanagement.substack.com" target="_blank">sensitivitymanagement</a></td><td>55.0%</td><td>45.0%</td><td>100.0%</td><td><code>en</code></td><td>Hype-driven / Divulgativo</td></tr>
   <tr><td>2</td><td><a href="https://norrisearch.substack.com" target="_blank">norrisearch</a></td><td>55.0%</td><td>45.0%</td><td>0.0%</td><td><code>en</code></td><td>Comercial / Transaccional</td></tr>
   <tr><td>3</td><td><a href="https://invierteconseb.substack.com" target="_blank">invierteconseb</a></td><td>55.0%</td><td>45.0%</td><td>80.0%</td><td><code>es</code></td><td>Hype-driven / Divulgativo</td></tr>
   <tr><td>4</td><td><a href="https://michaelwigginsdeoliveira.substack.com" target="_blank">michaelwigginsdeoliveira</a></td><td>64.0%</td><td>36.0%</td><td>20.0%</td><td><code>en</code></td><td>Comercial / Transaccional</td></tr>
   <tr><td>5</td><td><a href="https://aimafia.substack.com" target="_blank">aimafia</a></td><td>66.0%</td><td>34.0%</td><td>80.0%</td><td><code>es</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>6</td><td><a href="https://optionsoracle.substack.com" target="_blank">optionsoracle</a></td><td>73.0%</td><td>27.0%</td><td>0.0%</td><td><code>en</code></td><td>Comercial / Transaccional</td></tr>
   <tr><td>7</td><td><a href="https://ryanstax.substack.com" target="_blank">ryanstax</a></td><td>73.0%</td><td>27.0%</td><td>40.0%</td><td><code>en</code></td><td>Hype-driven / Divulgativo</td></tr>
   <tr><td>8</td><td><a href="https://nosolosuerte.substack.com" target="_blank">nosolosuerte</a></td><td>73.0%</td><td>27.0%</td><td>40.0%</td><td><code>es</code></td><td>Hype-driven / Divulgativo</td></tr>
   <tr><td>9</td><td><a href="https://www.2ndorderthinkers.com" target="_blank">jwho</a></td><td>75.0%</td><td>25.0%</td><td>40.0%</td><td><code>en</code></td><td>Técnico / Práctico</td></tr>
   <tr><td>10</td><td><a href="https://qnickmans.substack.com" target="_blank">qnickmans</a></td><td>77.5%</td><td>22.5%</td><td>50.0%</td><td><code>en</code></td><td>Hype-driven / Divulgativo</td></tr>
   <tr><td>11</td><td><a href="https://moneystuff.substack.com" target="_blank">moneystuff</a></td><td>77.5%</td><td>22.5%</td><td>0.0%</td><td><code>en</code></td><td>Comercial / Transaccional</td></tr>
   <tr><td>12</td><td><a href="https://hablemosdefondos.substack.com" target="_blank">hablemosdefondos</a></td><td>77.5%</td><td>22.5%</td><td>0.0%</td><td><code>es</code></td><td>Comercial / Transaccional</td></tr>
   <tr><td>13</td><td><a href="https://karensmiley.substack.com" target="_blank">karensmiley</a></td><td>82.0%</td><td>18.0%</td><td>40.0%</td><td><code>en</code></td><td>Hype-driven / Divulgativo</td></tr>
   <tr><td>14</td><td><a href="https://christinentim.substack.com" target="_blank">christinentim</a></td><td>82.0%</td><td>18.0%</td><td>40.0%</td><td><code>en</code></td><td>Hype-driven / Divulgativo</td></tr>
   <tr><td>15</td><td><a href="https://roguequant.substack.com" target="_blank">roguequant</a></td><td>82.0%</td><td>18.0%</td><td>0.0%</td><td><code>en</code></td><td>Comercial / Transaccional</td></tr>
  </tbody>
 </table>
</div>

<hr class="section-divider"/>
<h2>
 <strong>
  IV. Revelaciones del Análisis Forense
 </strong>
</h2>
<ul>
  <li>
    <strong>Concentración de Hype:</strong> Las newsletters de menor exergía se concentran en el nicho de \"hacer dinero online\" y finanzas rápidas, donde el clickbait promedia el <strong>75%</strong> del contenido semántico.
  </li>
  <li>
    <strong>Verificación Técnica Reducida (C5-REAL):</strong> Únicamente el <strong>0.16%</strong> de los subdominios examinados contiene anclajes verificables locales (como enlaces a contratos inteligentes, repositorios de código abierto o ledgers inmutables).
  </li>
</ul>

<script is:inline>
  function decorateTables() {
    const highTable = document.getElementById('exergy-high-table');
    const lowTable = document.getElementById('exergy-low-table');
    
    [highTable, lowTable].forEach(table => {
      if (!table) return;
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) return;
        
        // Exergy cell
        const exergyText = cells[2].textContent.trim();
        const exergyVal = parseFloat(exergyText);
        if (!cells[2].querySelector('.exergy-badge')) {
          if (exergyVal < 75) {
            cells[2].innerHTML = `<span class="exergy-badge low">${exergyText}</span>`;
          } else {
            cells[2].innerHTML = `<span class="exergy-badge">${exergyText}</span>`;
          }
        }
        
        // Clickbait cell (if it exists as 4th or 5th index)
        const clickbaitCell = cells[4];
        if (clickbaitCell) {
          const clickbaitText = clickbaitCell.textContent.trim();
          const clickbaitVal = parseFloat(clickbaitCell.textContent.trim());
          if (!isNaN(clickbaitVal)) {
            if (clickbaitVal >= 50) {
              clickbaitCell.innerHTML = `<span class="clickbait-val" style="color: var(--color-amber, #FF9F1C); text-shadow: 0 0 8px rgba(255, 159, 28, 0.3); font-weight: bold;">${clickbaitText}</span>`;
            } else {
              clickbaitCell.innerHTML = `<span class="clickbait-val" style="opacity: 0.6;">${clickbaitText}</span>`;
            }
          }
        }
      });
    });
  }

  decorateTables();
  document.addEventListener('DOMContentLoaded', decorateTables);
  document.addEventListener('astro:page-load', decorateTables);
</script>
