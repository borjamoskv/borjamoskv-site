/**
 * CORTEX AGENT BAR — Live agent activity feed in the UI
 * Shows 10 specialist agents working in real-time
 * Persistent bottom bar while browsing
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

const AGENTS = [
    { id: 'aesthetic',    name: 'AESTHETIC-Ω',    icon: '🎨', role: 'Visual Enforcer',    color: '#2B3BE5' },
    { id: 'sonic',        name: 'SONIC-Ω',        icon: '🎧', role: 'Audio Engineer',     color: '#E52B8D' },
    { id: 'guard',        name: 'GUARD-Ω',        icon: '🛡️', role: 'Security Auditor',   color: '#2BE5A0' },
    { id: 'crystal',      name: 'CRYSTAL-Ω',      icon: '💎', role: 'Cognitive Engine',    color: '#A02BE5' },
    { id: 'silicon',      name: 'SILICON-Ω',      icon: '⚡', role: 'Hardware Synth',      color: '#E5D02B' },
    { id: 'archaeologist', name: 'ARCHAEO-Ω',     icon: '🏛️', role: 'Temporal Forensics',  color: '#2BE5E5' },
    { id: 'devin',        name: 'DEVIN-APEX',     icon: '🤖', role: 'Code Agency',         color: '#E57A2B' },
    { id: 'disciplinant', name: 'DISCIPLIN-Ω',    icon: '⚔️', role: 'Focus Guardian',      color: '#FF003C' },
    { id: 'capital',      name: 'CAPITAL-Ω',      icon: '💰', role: 'Revenue Extractor',   color: '#2BE540' },
    { id: 'steve',        name: 'STEVE-JOBS-Ω',   icon: '🍎', role: 'Aesthetic Dictator',  color: '#FFFFFF' },
];

const TASKS = [
    'Scanning viewport composition...',
    'Validating YInMn palette compliance...',
    'Analyzing scroll velocity patterns...',
    'Compressing Shannon entropy...',
    'Verifying audio pipeline latency...',
    'Monitoring click interaction density...',
    'Auditing DOM node performance...',
    'Computing exergy ratios...',
    'Extracting semantic patterns...',
    'Crystallizing user behavior model...',
    'Enforcing Industrial Noir tokens...',
    'Pruning low-signal elements...',
    'Routing inference through CORTEX...',
    'Measuring TTFB and CLS...',
    'Benchmarking kinetic physics engine...',
    'Validating typography hierarchy...',
    'Checking contrast ratios (WCAG)...',
    'Optimizing GPU compositing layers...',
    'Tracking engagement heatmap...',
    'Syncing with CORTEX Ledger...',
];

let bar = null;
let agentSlots = [];
let taskInterval = null;

function createBar() {
    bar = document.createElement('div');
    bar.id = 'agent-bar';
    bar.innerHTML = `
        <div class="ab-label">CORTEX AGENTS</div>
        <div class="ab-agents" id="ab-agents"></div>
        <div class="ab-task" id="ab-task">Initializing swarm...</div>
    `;
    document.body.appendChild(bar);

    const container = document.getElementById('ab-agents');
    AGENTS.forEach((agent, i) => {
        const dot = document.createElement('div');
        dot.className = 'ab-dot';
        dot.title = `${agent.name} — ${agent.role}`;
        dot.style.setProperty('--agent-color', agent.color);
        dot.style.animationDelay = `${i * 0.3}s`;
        dot.textContent = agent.icon;
        container.appendChild(dot);
        agentSlots.push(dot);
    });

    // CSS
    const style = document.createElement('style');
    style.textContent = `
        #agent-bar {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 9998;
            height: 28px;
            background: rgba(2, 2, 2, 0.85);
            -webkit-backdrop-filter: blur(8px);
            backdrop-filter: blur(8px);
            border-top: 1px solid rgba(43, 59, 229, 0.2);
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 0 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            color: rgba(255,255,255,0.5);
            transform: translateY(100%);
            transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        #agent-bar.ab-visible { transform: translateY(0); }
        .ab-label {
            color: #2B3BE5;
            font-weight: 700;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }
        .ab-agents {
            display: flex;
            gap: 4px;
            align-items: center;
        }
        .ab-dot {
            width: 18px; height: 18px;
            display: flex; align-items: center; justify-content: center;
            font-size: 10px;
            border-radius: 3px;
            background: rgba(43, 59, 229, 0.1);
            cursor: default;
            position: relative;
            transition: background 0.3s, transform 0.2s;
            animation: agentPulse 3s infinite;
        }
        .ab-dot:hover {
            transform: scale(1.3);
            background: rgba(43, 59, 229, 0.3);
        }
        .ab-dot.ab-active {
            background: rgba(43, 59, 229, 0.4);
            box-shadow: 0 0 6px var(--agent-color, #2B3BE5);
        }
        @keyframes agentPulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
        }
        .ab-task {
            flex: 1;
            text-align: right;
            color: rgba(43, 59, 229, 0.6);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        @media (max-width: 768px) {
            .ab-label { display: none; }
            .ab-dot { width: 14px; height: 14px; font-size: 8px; }
        }
        /* Push scroll counter up */
        #scroll-speedometer { bottom: 36px !important; }
    `;
    document.head.appendChild(style);

    // Show after 2 seconds
    setTimeout(() => bar.classList.add('ab-visible'), 2000);
}

function rotateTasks() {
    const taskEl = document.getElementById('ab-task');
    if (!taskEl) return;

    const agentIdx = Math.floor(Math.random() * AGENTS.length);
    const taskIdx = Math.floor(Math.random() * TASKS.length);
    const agent = AGENTS[agentIdx];

    // Highlight active agent
    agentSlots.forEach(s => s.classList.remove('ab-active'));
    if (agentSlots[agentIdx]) agentSlots[agentIdx].classList.add('ab-active');

    taskEl.textContent = `[${agent.name}] ${TASKS[taskIdx]}`;
}

function init() {
    createBar();
    taskInterval = setInterval(rotateTasks, 2500);
    // Initial burst
    setTimeout(rotateTasks, 500);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
