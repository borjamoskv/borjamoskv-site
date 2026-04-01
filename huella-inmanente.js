/**
 * HUELLA INMANENTE v2.0 — KINETIC PHYSICS ENGINE
 * Each click spawns a particle burst with real physics:
 *   - Spring-damped motion
 *   - Gravity drift
 *   - Trail persistence with fade
 *   - Collision glow on edges
 * Marks persist in localStorage across sessions.
 * YInMn Blue (#2B3BE5) dominant.
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

const STORAGE_KEY = 'moskv_huellas_v2';
const MAX_MARKS = 300;
const MAX_PARTICLES = 120;
const GRAVITY = 0.02;
const FRICTION = 0.995;
const SPRING_K = 0.003;

let canvas, ctx;
let marks = [];
let particles = [];
let mouseX = 0, mouseY = 0;
let animFrame = null;
let running = false;

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

    // Events
    document.addEventListener('click', onMark, { passive: true });
    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    document.addEventListener('touchstart', (e) => {
        if (e.touches[0]) addMark(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('resize', resize);

    running = true;
    loop();
}

function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function onMark(e) {
    if (e.target.closest('button, a, input, .dj-studio, .swarm-dashboard, .game-hud, .arcade-bezel')) return;
    addMark(e.clientX, e.clientY);
}

function addMark(x, y) {
    const W = window.innerWidth;
    const H = window.innerHeight;

    // Persistent mark
    const mark = {
        rx: x / W, ry: y / H,
        size: 2 + Math.random() * 6,
        type: Math.floor(Math.random() * 4),
        alpha: 0.2 + Math.random() * 0.4,
        hue: Math.random() > 0.75 ? 25 : 230, // YInMn dominant
        rotation: Math.random() * Math.PI * 2,
    };
    marks.push(mark);
    if (marks.length > MAX_MARKS) marks = marks.slice(-MAX_MARKS);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(marks)); } catch(e) {}

    // Spawn kinetic particle burst
    const count = 5 + Math.floor(Math.random() * 8);
    for (let i = 0; i < count; i++) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
        const speed = 1.5 + Math.random() * 4;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 1 + Math.random() * 3,
            life: 1.0,
            decay: 0.005 + Math.random() * 0.01,
            hue: mark.hue + Math.random() * 20 - 10,
            trail: [],
            maxTrail: 8 + Math.floor(Math.random() * 12),
            spring: Math.random() > 0.5, // Some particles spring back to origin
            ox: x, oy: y,
        });
    }

    if ('vibrate' in navigator) navigator.vibrate(10);
}

function loop() {
    if (!running) return;
    const W = window.innerWidth;
    const H = window.innerHeight;

    ctx.clearRect(0, 0, W, H);

    // ─── PERSISTENT MARKS ───
    for (const m of marks) {
        const x = m.rx * W, y = m.ry * H;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(m.rotation);
        ctx.globalAlpha = m.alpha * 0.6;
        const color = `hsla(${m.hue}, 65%, 55%, ${m.alpha})`;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 0.8;

        switch (m.type) {
            case 0: // Dot
                ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI * 2); ctx.fill();
                break;
            case 1: // Ring
                ctx.beginPath(); ctx.arc(0, 0, m.size, 0, Math.PI * 2); ctx.stroke();
                break;
            case 2: // Cross
                ctx.beginPath();
                ctx.moveTo(-m.size, 0); ctx.lineTo(m.size, 0);
                ctx.moveTo(0, -m.size); ctx.lineTo(0, m.size);
                ctx.stroke();
                break;
            case 3: // Small burst
                for (let i = 0; i < 3; i++) {
                    const a = (Math.PI * 2 / 3) * i;
                    ctx.beginPath();
                    ctx.arc(Math.cos(a) * m.size * 0.6, Math.sin(a) * m.size * 0.6, m.size * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
        }
        ctx.restore();
    }

    // ─── KINETIC PARTICLES ───
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Physics update
        if (p.spring) {
            // Spring force back to origin
            p.vx += (p.ox - p.x) * SPRING_K;
            p.vy += (p.oy - p.y) * SPRING_K;
        }

        // Mouse repulsion (subtle)
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 0) {
            const force = (100 - dist) * 0.0008;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
        }

        p.vy += GRAVITY;
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        // Edge bounce
        if (p.x < 0 || p.x > W) { p.vx *= -0.6; p.x = Math.max(0, Math.min(W, p.x)); }
        if (p.y < 0 || p.y > H) { p.vy *= -0.6; p.y = Math.max(0, Math.min(H, p.y)); }

        // Trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.maxTrail) p.trail.shift();

        // Remove dead
        if (p.life <= 0) { particles.splice(i, 1); continue; }

        // Draw trail
        if (p.trail.length > 1) {
            ctx.save();
            ctx.globalAlpha = p.life * 0.3;
            ctx.strokeStyle = `hsla(${p.hue}, 65%, 55%, ${p.life * 0.4})`;
            ctx.lineWidth = p.size * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            for (let t = 1; t < p.trail.length; t++) {
                ctx.lineTo(p.trail[t].x, p.trail[t].y);
            }
            ctx.stroke();
            ctx.restore();
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = `hsla(${p.hue}, 65%, 60%, ${p.life})`;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = `hsla(${p.hue}, 65%, 55%, 0.5)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    // ─── CONNECTION LINES between nearby particles ───
    if (particles.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(43, 59, 229, 0.08)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < 80) {
                    ctx.globalAlpha = (1 - d / 80) * Math.min(a.life, b.life);
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }
        ctx.restore();
    }

    animFrame = requestAnimationFrame(loop);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
