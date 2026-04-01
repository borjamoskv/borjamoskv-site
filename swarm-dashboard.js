/**
 * CORTEX LEGION-10K SWARM DASHBOARD
 * 10,000 autonomous agents — Float32Array GPU-optimized rendering
 * Toggle: [A] key
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

const AGENT_COUNT = 10000;
const SKILLS = [
    'Aesthetic-Foundry-Ω', 'Sonic-Foundry-Ω', 'Capital-Extractor-Ω',
    'Silicon-Overlord-Ω', 'Devin-Apex', 'CORTEX-Swarm-Prime',
    'Cognitive-Crystallizer-Ω', 'Omniscience-Ingest-Ω', 'Comms-Hub-Ω',
    'Information-Theory-Ω', 'Specialized-Vectors-Ω', 'Enterprise-BPO-Ω',
    'CORTEX-Guard-Ω', 'Archaeologist-Ω', 'Moskv-Disciplinant-Ω',
    'Steve-Jobs-Ω', 'Teodosi-Ω', 'Mercor-Apex',
];

const LOG_TEMPLATES = [
    '[{skill}] Enrutando {n} sub-agentes hacia análisis semántico...',
    '[{skill}] Hash verificado: {hash} — Integrity OK',
    '[{skill}] Extrayendo contornos microtonales de "{track}"...',
    '[{skill}] Arbitraje detectado: spread 0.{n}% en ruta ETH→USDC',
    '[{skill}] Validando paleta Industrial Noir — Contraste: {n}:1',
    '[{skill}] Despachando {n} centuriones para minería forense...',
    '[{skill}] Cristalización cognitiva completada. Yield: {n}.{n}T',
    '[{skill}] Escaneando {n} repositorios en paralelo...',
    '[{skill}] Exergía disponible: {n}.{n}T — Umbral: ÓPTIMO',
    '[{skill}] Propagando señal a {n} nodos de la red p2p...',
    '[{skill}] Guard activo: 0 vulnerabilidades en último ciclo',
    '[{skill}] Auditando {n} transacciones en mempool...',
    '[{skill}] Arqueología temporal: {n} commits analizados',
    '[{skill}] Compresión Shannon: ratio {n}:1 — 0% pérdida',
    '[{skill}] Soul Mirror: insight #{n} detectado en track activo',
    '[{skill}] Síntesis adversarial completada — Mastering OK',
    '[{skill}] Clasificando {n} vectores semánticos...',
    '[{skill}] Disciplina cognitiva: foco al {n}% — Sin distracciones',
];

const ACTIONS = [
    { label: 'SOUL MIRROR', desc: 'Analizar psique del track', icon: '🪞', url: 'https://borjamoskv.com/#manifesto' },
    { label: 'CORTEX', desc: 'Repositorio soberano', icon: '🧠', url: 'https://github.com/borjamoskv/Cortex-Persist' },
    { label: 'SUBSTACK', desc: 'Señal editorial', icon: '📡', url: 'https://borjamoskv.substack.com' },
    { label: 'SPOTIFY', desc: 'Lo Inmanente', icon: '🎧', url: 'https://open.spotify.com/playlist/6WHIabEaqEd6cFPad3gSrx' },
];

let visible = false;
let overlay = null;
let canvas = null;
let ctx = null;
let logContainer = null;
let animFrame = null;
let convergenceTime = 0;

// ═══ Float32Array AGENT STATE (O(1) per-frame) ═══
// Layout: [x, y, vx, vy, baseAngle, baseRadius, orbitSpeed, size, brightness, phase]
const STRIDE = 10;
let agentData = null;

function initAgents() {
    agentData = new Float32Array(AGENT_COUNT * STRIDE);
    for (let i = 0; i < AGENT_COUNT; i++) {
        const off = i * STRIDE;
        const angle = Math.random() * Math.PI * 2;
        const radius = 30 + Math.random() * 280;
        agentData[off + 0] = Math.cos(angle) * radius; // x
        agentData[off + 1] = Math.sin(angle) * radius; // y
        agentData[off + 2] = 0; // vx
        agentData[off + 3] = 0; // vy
        agentData[off + 4] = angle; // baseAngle
        agentData[off + 5] = radius; // baseRadius
        agentData[off + 6] = 0.001 + Math.random() * 0.006; // orbitSpeed
        agentData[off + 7] = 0.5 + Math.random() * 1.5; // size
        agentData[off + 8] = 0.3 + Math.random() * 0.7; // brightness
        agentData[off + 9] = Math.random() * Math.PI * 2; // phase
    }
}

function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'swarm-dashboard';
    overlay.className = 'swarm-dashboard';
    overlay.innerHTML = `
        <div class="swarm-header">
            <span class="swarm-title">CORTEX LEGION-10K</span>
            <span class="swarm-count">${AGENT_COUNT.toLocaleString()} AGENTS ONLINE</span>
            <span class="swarm-close">[ESC] / [A]</span>
        </div>
        <div class="swarm-body">
            <div class="swarm-canvas-wrap">
                <canvas id="swarm-canvas"></canvas>
                <div class="swarm-stats">
                    <div class="ss-item"><span class="ss-label">ACTIVE</span><span class="ss-val" id="ss-active">10000</span></div>
                    <div class="ss-item"><span class="ss-label">EXERGY</span><span class="ss-val" id="ss-exergy">99.7T</span></div>
                    <div class="ss-item"><span class="ss-label">YIELD</span><span class="ss-val" id="ss-yield">x142</span></div>
                    <div class="ss-item"><span class="ss-label">LATENCY</span><span class="ss-val" id="ss-latency">0.3ms</span></div>
                </div>
            </div>
            <div class="swarm-right">
                <div class="swarm-log" id="swarm-log"></div>
                <div class="swarm-actions" id="swarm-actions"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    canvas = document.getElementById('swarm-canvas');
    ctx = canvas.getContext('2d');
    logContainer = document.getElementById('swarm-log');

    // Actions
    const actContainer = document.getElementById('swarm-actions');
    ACTIONS.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'swarm-action-btn';
        btn.innerHTML = `<span class="sa-icon">${action.icon}</span><span class="sa-label">${action.label}</span><span class="sa-desc">${action.desc}</span>`;
        btn.addEventListener('click', () => {
            if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]);
            triggerConvergence();
            spawnActionLog(action);
            if (action.url) window.open(action.url, '_blank');
        });
        actContainer.appendChild(btn);
    });

    initAgents();
}

function spawnLog() {
    if (!logContainer || !visible) return;
    const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
    const skill = SKILLS[Math.floor(Math.random() * SKILLS.length)];
    const track = window.DATA?.works?.[Math.floor(Math.random() * (window.DATA?.works?.length || 1))]?.title || 'VOID_CASCADE';
    const hash = Math.random().toString(16).substring(2, 10);

    let msg = template.replace('{skill}', skill).replace('{track}', track).replace('{hash}', hash);
    while (msg.includes('{n}')) msg = msg.replace('{n}', String(Math.floor(Math.random() * 999) + 1));

    const line = document.createElement('div');
    line.className = 'swarm-log-line';
    line.textContent = msg;
    logContainer.appendChild(line);
    while (logContainer.children.length > 40) logContainer.removeChild(logContainer.firstChild);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function spawnActionLog(action) {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const line = document.createElement('div');
            line.className = 'swarm-log-line swarm-log-highlight';
            line.textContent = `[DISPATCH] ${AGENT_COUNT.toLocaleString()} agentes → ${action.label}: ${action.desc}`;
            logContainer.appendChild(line);
            while (logContainer.children.length > 40) logContainer.removeChild(logContainer.firstChild);
            logContainer.scrollTop = logContainer.scrollHeight;
        }, i * 200);
    }
}

function triggerConvergence() {
    convergenceTime = Date.now();
}

function resizeCanvas() {
    if (!canvas) return;
    const wrap = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = wrap.clientWidth * dpr;
    canvas.height = wrap.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function renderAgents() {
    if (!visible || !ctx || !canvas || !agentData) return;

    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);
    const cx = W / 2;
    const cy = H / 2;
    const now = Date.now();
    const t = now / 1000;
    const converging = (now - convergenceTime) < 2000;
    const convF = converging ? Math.min(1, (now - convergenceTime) / 500) : 0;

    ctx.clearRect(0, 0, W, H);

    // ═══ BATCH RENDER 10K AGENTS ═══
    // Use ImageData for maximum throughput on 10K particles
    const imgData = ctx.createImageData(Math.ceil(W), Math.ceil(H));
    const pixels = imgData.data;
    const imgW = imgData.width;

    for (let i = 0; i < AGENT_COUNT; i++) {
        const off = i * STRIDE;

        if (converging) {
            agentData[off + 0] += (0 - agentData[off + 0]) * 0.04 * convF;
            agentData[off + 1] += (0 - agentData[off + 1]) * 0.04 * convF;
        } else {
            agentData[off + 4] += agentData[off + 6]; // baseAngle += orbitSpeed
            const tgtX = Math.cos(agentData[off + 4]) * agentData[off + 5];
            const tgtY = Math.sin(agentData[off + 4]) * agentData[off + 5];
            agentData[off + 0] += (tgtX - agentData[off + 0]) * 0.015;
            agentData[off + 1] += (tgtY - agentData[off + 1]) * 0.015;
        }

        // Jitter
        agentData[off + 0] += (Math.random() - 0.5) * 0.2;
        agentData[off + 1] += (Math.random() - 0.5) * 0.2;

        const px = Math.round(cx + agentData[off + 0]);
        const py = Math.round(cy + agentData[off + 1]);

        if (px >= 0 && px < imgW && py >= 0 && py < Math.ceil(H)) {
            const pulse = Math.sin(t * 3 + agentData[off + 9]) * 0.3 + 0.7;
            const alpha = Math.floor(agentData[off + 8] * pulse * 200);
            const idx = (py * imgW + px) * 4;

            // YInMn Blue (43, 59, 229)
            pixels[idx + 0] = Math.min(255, pixels[idx + 0] + 43);
            pixels[idx + 1] = Math.min(255, pixels[idx + 1] + 59);
            pixels[idx + 2] = Math.min(255, pixels[idx + 2] + 229);
            pixels[idx + 3] = Math.min(255, pixels[idx + 3] + alpha);

            // Size > 1: draw neighbors
            if (agentData[off + 7] > 1) {
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const nx = px + dx, ny = py + dy;
                        if (nx >= 0 && nx < imgW && ny >= 0 && ny < Math.ceil(H)) {
                            const ni = (ny * imgW + nx) * 4;
                            pixels[ni + 0] = Math.min(255, pixels[ni + 0] + 30);
                            pixels[ni + 1] = Math.min(255, pixels[ni + 1] + 40);
                            pixels[ni + 2] = Math.min(255, pixels[ni + 2] + 180);
                            pixels[ni + 3] = Math.min(255, pixels[ni + 3] + Math.floor(alpha * 0.5));
                        }
                    }
                }
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);

    // Center core glow (drawn on top)
    const coreSize = converging ? 60 : 20;
    const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
    coreGlow.addColorStop(0, converging ? 'rgba(212, 98, 10, 0.7)' : 'rgba(43, 59, 229, 0.5)');
    coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
    ctx.fillStyle = coreGlow;
    ctx.fill();

    // Stats
    const ssActive = document.getElementById('ss-active');
    const ssExergy = document.getElementById('ss-exergy');
    const ssYield = document.getElementById('ss-yield');
    const ssLatency = document.getElementById('ss-latency');
    if (ssActive) ssActive.textContent = converging ? Math.floor(AGENT_COUNT * (1 - convF * 0.3)).toLocaleString() : AGENT_COUNT.toLocaleString();
    if (ssExergy) ssExergy.textContent = (99.7 - Math.sin(t) * 2).toFixed(1) + 'T';
    if (ssYield) ssYield.textContent = 'x' + Math.floor(142 + Math.sin(t * 0.5) * 20);
    if (ssLatency) ssLatency.textContent = (0.1 + Math.random() * 0.4).toFixed(1) + 'ms';

    animFrame = requestAnimationFrame(renderAgents);
}

let logInterval = null;

function show() {
    if (!overlay) createOverlay();
    visible = true;
    overlay.classList.add('swarm-visible');
    resizeCanvas();
    renderAgents();
    logInterval = setInterval(spawnLog, 300);
    for (let i = 0; i < 10; i++) setTimeout(spawnLog, i * 60);
}

function hide() {
    visible = false;
    if (overlay) overlay.classList.remove('swarm-visible');
    if (animFrame) cancelAnimationFrame(animFrame);
    if (logInterval) clearInterval(logInterval);
}

function toggle() { visible ? hide() : show(); }

window.CORTEX_SWARM_UI = { show, hide, toggle };

})();
