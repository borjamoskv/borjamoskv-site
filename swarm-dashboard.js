/**
 * CORTEX LEGION-1000 SWARM DASHBOARD
 * 1000 autonomous agents rendered in real-time Canvas2D
 * Toggle: [A] key
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

const AGENT_COUNT = 1000;
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
let agents = [];
let animFrame = null;
let convergenceTarget = null;
let convergenceTime = 0;

// Generate agents
function initAgents() {
    agents = [];
    for (let i = 0; i < AGENT_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 80 + Math.random() * 200;
        agents.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            baseAngle: angle,
            baseRadius: radius,
            orbitSpeed: 0.002 + Math.random() * 0.008,
            size: 1 + Math.random() * 2,
            brightness: 0.4 + Math.random() * 0.6,
            skill: SKILLS[Math.floor(Math.random() * SKILLS.length)],
            phase: Math.random() * Math.PI * 2,
        });
    }
}

function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'swarm-dashboard';
    overlay.className = 'swarm-dashboard';
    overlay.innerHTML = `
        <div class="swarm-header">
            <span class="swarm-title">CORTEX LEGION-1000</span>
            <span class="swarm-count">${AGENT_COUNT} AGENTS ONLINE</span>
            <span class="swarm-close">[ESC] / [A]</span>
        </div>
        <div class="swarm-body">
            <div class="swarm-canvas-wrap">
                <canvas id="swarm-canvas"></canvas>
                <div class="swarm-stats">
                    <div class="ss-item"><span class="ss-label">ACTIVE</span><span class="ss-val" id="ss-active">1000</span></div>
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
    const n = Math.floor(Math.random() * 999) + 1;

    let msg = template.replace('{skill}', skill).replace('{track}', track).replace('{hash}', hash);
    while (msg.includes('{n}')) msg = msg.replace('{n}', String(Math.floor(Math.random() * 999) + 1));

    const line = document.createElement('div');
    line.className = 'swarm-log-line';
    line.textContent = msg;
    logContainer.appendChild(line);

    // Keep max 30 lines
    while (logContainer.children.length > 30) logContainer.removeChild(logContainer.firstChild);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function spawnActionLog(action) {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const line = document.createElement('div');
            line.className = 'swarm-log-line swarm-log-highlight';
            line.textContent = `[DISPATCH] ${AGENT_COUNT} agentes → ${action.label}: ${action.desc}`;
            logContainer.appendChild(line);
            while (logContainer.children.length > 30) logContainer.removeChild(logContainer.firstChild);
            logContainer.scrollTop = logContainer.scrollHeight;
        }, i * 300);
    }
}

function triggerConvergence() {
    convergenceTarget = { x: 0, y: 0 };
    convergenceTime = Date.now();
}

function resizeCanvas() {
    if (!canvas) return;
    const wrap = canvas.parentElement;
    canvas.width = wrap.clientWidth * window.devicePixelRatio;
    canvas.height = wrap.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

function renderAgents() {
    if (!visible || !ctx || !canvas) return;

    const W = canvas.width / window.devicePixelRatio;
    const H = canvas.height / window.devicePixelRatio;
    const cx = W / 2;
    const cy = H / 2;
    const now = Date.now();
    const t = now / 1000;

    ctx.clearRect(0, 0, W, H);

    // Draw connections (only between nearby agents, cap at 200 connections)
    ctx.strokeStyle = 'rgba(43, 59, 229, 0.08)';
    ctx.lineWidth = 0.5;
    let connCount = 0;
    for (let i = 0; i < agents.length && connCount < 200; i += 10) {
        for (let j = i + 10; j < agents.length && connCount < 200; j += 10) {
            const dx = agents[i].x - agents[j].x;
            const dy = agents[i].y - agents[j].y;
            const dist = dx * dx + dy * dy;
            if (dist < 2500) { // ~50px
                ctx.beginPath();
                ctx.moveTo(cx + agents[i].x, cy + agents[i].y);
                ctx.lineTo(cx + agents[j].x, cy + agents[j].y);
                ctx.stroke();
                connCount++;
            }
        }
    }

    // Update & draw agents
    const converging = convergenceTarget && (now - convergenceTime) < 2000;
    const convergeFactor = converging ? Math.min(1, (now - convergenceTime) / 500) : 0;
    const disperseFactor = converging ? 0 : Math.min(1, (now - convergenceTime - 2000) / 1000);

    for (let i = 0; i < agents.length; i++) {
        const a = agents[i];

        if (converging) {
            // Pull toward center
            a.x += (convergenceTarget.x - a.x) * 0.05 * convergeFactor;
            a.y += (convergenceTarget.y - a.y) * 0.05 * convergeFactor;
        } else {
            // Orbit
            a.baseAngle += a.orbitSpeed;
            const targetX = Math.cos(a.baseAngle) * a.baseRadius;
            const targetY = Math.sin(a.baseAngle) * a.baseRadius;
            a.x += (targetX - a.x) * 0.02;
            a.y += (targetY - a.y) * 0.02;
        }

        // Jitter
        a.x += (Math.random() - 0.5) * 0.3;
        a.y += (Math.random() - 0.5) * 0.3;

        // Draw
        const pulse = Math.sin(t * 3 + a.phase) * 0.3 + 0.7;
        const alpha = a.brightness * pulse;
        const size = a.size * (converging ? 1.5 : 1);

        ctx.beginPath();
        ctx.arc(cx + a.x, cy + a.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(43, 59, 229, ${alpha.toFixed(2)})`;
        ctx.fill();

        // Glow for every 50th agent
        if (i % 50 === 0) {
            ctx.beginPath();
            ctx.arc(cx + a.x, cy + a.y, size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(126, 184, 218, ${(alpha * 0.2).toFixed(2)})`;
            ctx.fill();
        }
    }

    // Center core glow
    const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, converging ? 40 : 15);
    coreGlow.addColorStop(0, converging ? 'rgba(212, 98, 10, 0.6)' : 'rgba(43, 59, 229, 0.4)');
    coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, converging ? 40 : 15, 0, Math.PI * 2);
    ctx.fillStyle = coreGlow;
    ctx.fill();

    // Update stats
    const ssActive = document.getElementById('ss-active');
    const ssExergy = document.getElementById('ss-exergy');
    const ssYield = document.getElementById('ss-yield');
    const ssLatency = document.getElementById('ss-latency');
    if (ssActive) ssActive.textContent = converging ? Math.floor(AGENT_COUNT * (1 - convergeFactor * 0.3)) : AGENT_COUNT;
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
    logInterval = setInterval(spawnLog, 400);
    // Initial burst of logs
    for (let i = 0; i < 8; i++) setTimeout(spawnLog, i * 80);
}

function hide() {
    visible = false;
    if (overlay) overlay.classList.remove('swarm-visible');
    if (animFrame) cancelAnimationFrame(animFrame);
    if (logInterval) clearInterval(logInterval);
}

function toggle() {
    visible ? hide() : show();
}

// Expose
window.CORTEX_SWARM_UI = { show, hide, toggle };

})();
