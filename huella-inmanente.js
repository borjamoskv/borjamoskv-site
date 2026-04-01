/**
 * HUELLA INMANENTE
 * Each click leaves a permanent mark on the canvas of the web.
 * Marks persist in localStorage across sessions.
 * YInMn Blue dominant.
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

const STORAGE_KEY = 'moskv_huellas';
const MAX_MARKS = 500;

let canvas, ctx;
let marks = [];

function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'huella-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:3;pointer-events:none;mix-blend-mode:screen;';
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');
    resize();

    // Load persistent marks
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) marks = JSON.parse(saved);
    } catch(e) {}

    // Listen for clicks
    document.addEventListener('click', onMark, { passive: true });
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            addMark(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    window.addEventListener('resize', resize);

    // Initial render
    renderAll();
}

function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    renderAll();
}

function onMark(e) {
    // Don't mark on UI buttons
    if (e.target.closest('button, a, input, .dj-studio, .swarm-dashboard, .game-hud')) return;
    addMark(e.clientX, e.clientY);
}

function addMark(x, y) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    
    const mark = {
        // Store as ratios so they survive resize
        rx: x / W,
        ry: y / H,
        size: 3 + Math.random() * 12,
        type: Math.floor(Math.random() * 5), // 0=dot, 1=ring, 2=cross, 3=splash, 4=line
        alpha: 0.3 + Math.random() * 0.5,
        hue: Math.random() > 0.7 ? 30 : 230, // Mostly YInMn, some orange
        rotation: Math.random() * Math.PI * 2,
        timestamp: Date.now(),
    };

    marks.push(mark);

    // Cap
    if (marks.length > MAX_MARKS) marks = marks.slice(-MAX_MARKS);

    // Persist
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(marks)); } catch(e) {}

    // Draw only the new mark (incremental)
    drawMark(mark);

    // Haptic
    if ('vibrate' in navigator) navigator.vibrate(10);
}

function drawMark(mark) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const x = mark.rx * W;
    const y = mark.ry * H;
    const s = mark.size;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(mark.rotation);
    ctx.globalAlpha = mark.alpha;

    const color = `hsla(${mark.hue}, 65%, 55%, ${mark.alpha})`;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    switch (mark.type) {
        case 0: // Dot
            ctx.beginPath();
            ctx.arc(0, 0, s, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 1: // Ring
            ctx.beginPath();
            ctx.arc(0, 0, s, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 2: // Cross
            ctx.beginPath();
            ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
            ctx.moveTo(0, -s); ctx.lineTo(0, s);
            ctx.stroke();
            break;
        case 3: // Splash (multiple small dots)
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i + mark.rotation;
                const dist = s * 0.8;
                ctx.beginPath();
                ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, s * 0.25, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        case 4: // Short line
            ctx.beginPath();
            ctx.moveTo(-s, -s * 0.5);
            ctx.lineTo(s, s * 0.5);
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
    }

    // Glow
    ctx.shadowBlur = s * 2;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
}

function renderAll() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    marks.forEach(drawMark);
}

// Boot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
