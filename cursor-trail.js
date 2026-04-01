/**
 * FLUID CANVAS CURSOR TRAIL (Azkartu-Ω Update)
 * Generates a 20-vertex Newtonian line that follows the pointer.
 * Replaces the old DOM-based cursor for 60fps O(1) performance.
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

const TRAIL_LENGTH = 20;

let canvas, ctx;
let mouse = { x: -1000, y: -1000 };
let trail = [];

function initTrail() {
    // Canvas Setup
    canvas = document.createElement('canvas');
    canvas.id = 'fluid-cursor-canvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        pointer-events: none;
        z-index: 9999998; /* Below Konami, above HUD */
        mix-blend-mode: screen;
    `;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d', { alpha: true });

    resize();
    window.addEventListener('resize', resize);

    // Initialize vertices
    for (let i = 0; i < TRAIL_LENGTH; i++) {
        trail.push({ x: mouse.x, y: mouse.y, dx: 0, dy: 0 });
    }

    // Track mouse
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Handle touch
    window.addEventListener('touchmove', (e) => {
        if(e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    }, {passive:true});

    requestAnimationFrame(render);
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Physics constants
    const spring = 0.4;
    const friction = 0.5;

    // Head follows mouse
    trail[0].x += (mouse.x - trail[0].x) * spring;
    trail[0].y += (mouse.y - trail[0].y) * spring;

    // Body follows head
    for (let i = 1; i < TRAIL_LENGTH; i++) {
        let node = trail[i];
        let prev = trail[i - 1];

        let dx = prev.x - node.x;
        let dy = prev.y - node.y;

        node.dx += dx * spring;
        node.dy += dy * spring;

        node.dx *= friction;
        node.dy *= friction;

        node.x += node.dx;
        node.y += node.dy;
    }

    // Draw the trail line
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);

    for (let i = 1; i < TRAIL_LENGTH - 1; i++) {
        const xc = (trail[i].x + trail[i + 1].x) / 2;
        const yc = (trail[i].y + trail[i + 1].y) / 2;
        ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
    }
    
    // Line style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Neon YInMn Blue gradient
    const grad = ctx.createLinearGradient(trail[0].x, trail[0].y, trail[TRAIL_LENGTH-1].x, trail[TRAIL_LENGTH-1].y);
    grad.addColorStop(0, 'rgba(43, 59, 229, 0.8)'); // YInMn Head
    grad.addColorStop(1, 'rgba(255, 0, 60, 0.0)');   // Fade out occasionally to red or invisible
    
    ctx.strokeStyle = grad;
    
    // Thicker at the head, tapering off (we have to fake global width or do multiple strokes)
    // For extreme performance, we just draw one fluid line with varying opacity.
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#2B3BE5';
    
    ctx.stroke();

    requestAnimationFrame(render);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrail);
} else {
    initTrail();
}

})();
