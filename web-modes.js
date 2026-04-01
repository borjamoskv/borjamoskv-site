/**
 * WEB MODES — Day / Night / Chaos / Zen / Cena (Rick Rubin)
 * Toggle: [M] key cycles through modes
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

const MODES = [
    {
        id: 'mode-night',
        name: 'NOCHE',
        icon: '🌙',
        desc: 'Industrial Noir puro',
        css: {
            '--mode-bg': '#020202',
            '--mode-text': '#E0E0E0',
            '--mode-accent': '#2B3BE5',
            '--mode-grain': '0.04',
            '--mode-blur': '0px',
            '--mode-saturate': '1',
            '--mode-hue': '0deg',
        }
    },
    {
        id: 'mode-day',
        name: 'DÍA',
        icon: '☀️',
        desc: 'Luz soberana',
        css: {
            '--mode-bg': '#F0F0F0',
            '--mode-text': '#0A0A0A',
            '--mode-accent': '#2B3BE5',
            '--mode-grain': '0.02',
            '--mode-blur': '0px',
            '--mode-saturate': '1.1',
            '--mode-hue': '0deg',
        }
    },
    {
        id: 'mode-chaos',
        name: 'CAOS',
        icon: '🔥',
        desc: 'Destrucción creativa',
        css: {
            '--mode-bg': '#0A0000',
            '--mode-text': '#FF003C',
            '--mode-accent': '#FF003C',
            '--mode-grain': '0.12',
            '--mode-blur': '1px',
            '--mode-saturate': '2',
            '--mode-hue': '0deg',
        }
    },
    {
        id: 'mode-zen',
        name: 'ZEN',
        icon: '🧘',
        desc: 'Silencio absoluto',
        css: {
            '--mode-bg': '#050505',
            '--mode-text': '#888888',
            '--mode-accent': '#444444',
            '--mode-grain': '0.01',
            '--mode-blur': '0px',
            '--mode-saturate': '0.3',
            '--mode-hue': '0deg',
        }
    },
    {
        id: 'mode-cena',
        name: 'CENA',
        icon: '🧔',
        desc: 'Rick Rubin mode — reduce to the essential',
        css: {
            '--mode-bg': '#0A0805',
            '--mode-text': '#D4A855',
            '--mode-accent': '#D4A855',
            '--mode-grain': '0.06',
            '--mode-blur': '0px',
            '--mode-saturate': '0.6',
            '--mode-hue': '30deg',
        }
    }
];

let currentMode = 0;
let modeIndicator = null;
let rickOverlay = null;

function applyMode(mode) {
    const root = document.documentElement;

    // Remove all mode classes
    MODES.forEach(m => document.body.classList.remove(m.id));
    document.body.classList.add(mode.id);

    // Apply CSS vars
    Object.entries(mode.css).forEach(([key, val]) => {
        root.style.setProperty(key, val);
    });

    // Show indicator
    if (!modeIndicator) {
        modeIndicator = document.createElement('div');
        modeIndicator.id = 'mode-indicator';
        modeIndicator.style.cssText = `
            position:fixed; top:50%; left:50%; z-index:99999;
            transform:translate(-50%,-50%) scale(0);
            font-family:'Outfit',sans-serif; font-weight:800;
            font-size:32px; pointer-events:none;
            transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s;
            opacity:0; text-align:center;
        `;
        document.body.appendChild(modeIndicator);
    }

    modeIndicator.innerHTML = `${mode.icon}<br><span style="font-size:14px;opacity:0.6">${mode.name}</span>`;
    modeIndicator.style.color = mode.css['--mode-accent'];
    modeIndicator.style.transform = 'translate(-50%,-50%) scale(1)';
    modeIndicator.style.opacity = '1';

    setTimeout(() => {
        modeIndicator.style.transform = 'translate(-50%,-50%) scale(0)';
        modeIndicator.style.opacity = '0';
    }, 1500);

    // Rick Rubin special
    if (mode.id === 'mode-cena') {
        showRickRubin();
    } else {
        hideRickRubin();
    }
}

function showRickRubin() {
    if (rickOverlay) return;

    rickOverlay = document.createElement('div');
    rickOverlay.id = 'rick-rubin-overlay';
    rickOverlay.innerHTML = `
        <div class="rr-quote">"Remove everything that isn't essential."</div>
        <div class="rr-name">— RICK RUBIN</div>
        <div class="rr-wisdom" id="rr-wisdom"></div>
    `;
    document.body.appendChild(rickOverlay);

    const style = document.createElement('style');
    style.id = 'rick-rubin-style';
    style.textContent = `
        #rick-rubin-overlay {
            position: fixed;
            bottom: 40px; left: 50%;
            transform: translateX(-50%);
            z-index: 9997;
            text-align: center;
            pointer-events: none;
            animation: rrFadeIn 2s ease forwards;
        }
        @keyframes rrFadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .rr-quote {
            font-family: 'Georgia', serif;
            font-size: 16px;
            font-style: italic;
            color: #D4A855;
            max-width: 400px;
            line-height: 1.6;
        }
        .rr-name {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            color: #D4A855;
            opacity: 0.5;
            margin-top: 8px;
            letter-spacing: 2px;
        }
        .rr-wisdom {
            font-family: 'Georgia', serif;
            font-size: 12px;
            color: #D4A855;
            opacity: 0.4;
            margin-top: 16px;
            max-width: 300px;
            margin-left: auto;
            margin-right: auto;
        }
        /* Day mode overrides */
        body.mode-day { background: var(--mode-bg) !important; color: var(--mode-text) !important; }
        body.mode-day .section-heading, body.mode-day h1, body.mode-day h2, body.mode-day h3 { color: #0A0A0A !important; }
        body.mode-day #mainNav { background: rgba(240,240,240,0.9) !important; }
        /* Chaos mode overrides */
        body.mode-chaos { animation: chaosShake 0.1s infinite; }
        @keyframes chaosShake {
            0% { transform: translate(0); }
            25% { transform: translate(1px, -1px); }
            50% { transform: translate(-1px, 1px); }
            75% { transform: translate(1px, 0); }
        }
        body.mode-chaos * { text-shadow: 2px 0 #FF003C, -2px 0 #00FFFF !important; }
        /* Zen mode overrides */
        body.mode-zen .section-heading { letter-spacing: 0.3em !important; }
        body.mode-zen iframe, body.mode-zen video { filter: grayscale(1) !important; }
        /* Cena mode overrides */
        body.mode-cena { filter: sepia(0.15) hue-rotate(var(--mode-hue)); }
        body.mode-cena iframe, body.mode-cena video { filter: sepia(0.3) brightness(0.8) !important; }
    `;
    document.head.appendChild(style);

    // Rotate Rick Rubin wisdom
    const WISDOM = [
        '"The best art divides the audience."',
        '"The goal is not to be liked. It\'s to be you."',
        '"Creativity is not a competition."',
        '"Reduction is the essence of production."',
        '"Listen before you think."',
        '"Art is a practice, not a product."',
        '"The universe wants you to create."',
    ];

    let wisdomIdx = 0;
    const wisdomEl = document.getElementById('rr-wisdom');
    if (wisdomEl) {
        wisdomEl.textContent = WISDOM[0];
        setInterval(() => {
            wisdomIdx = (wisdomIdx + 1) % WISDOM.length;
            wisdomEl.style.opacity = '0';
            setTimeout(() => {
                wisdomEl.textContent = WISDOM[wisdomIdx];
                wisdomEl.style.opacity = '0.4';
            }, 500);
        }, 6000);
    }
}

function hideRickRubin() {
    if (rickOverlay) {
        rickOverlay.remove();
        rickOverlay = null;
    }
    const style = document.getElementById('rick-rubin-style');
    if (style) style.remove();
}

function cycleMode() {
    currentMode = (currentMode + 1) % MODES.length;
    applyMode(MODES[currentMode]);
    localStorage.setItem('moskv-mode', currentMode);

    // Haptic
    if ('vibrate' in navigator) navigator.vibrate([15, 30, 15]);
    // Glitch
    if (window.GLITCH) window.GLITCH.trigger();
}

// Keyboard [M]
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm' && !e.target.closest('input, textarea')) {
        cycleMode();
    }
});

// Restore saved mode
const saved = parseInt(localStorage.getItem('moskv-mode') || '0', 10);
if (saved > 0 && saved < MODES.length) {
    currentMode = saved;
    // Apply silently (no indicator)
    const mode = MODES[currentMode];
    MODES.forEach(m => document.body.classList.remove(m.id));
    document.body.classList.add(mode.id);
    Object.entries(mode.css).forEach(([key, val]) => {
        document.documentElement.style.setProperty(key, val);
    });
    if (mode.id === 'mode-cena') showRickRubin();
}

window.MOSKV_MODES = { cycle: cycleMode, MODES };

})();
