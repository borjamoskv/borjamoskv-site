/**
 * CINEMATIC ENGINE — Film grain, letterbox bars, fade transitions
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

// ═══ 1. FILM GRAIN ═══
function initFilmGrain() {
    const grainCanvas = document.createElement('canvas');
    grainCanvas.id = 'film-grain';
    grainCanvas.style.cssText = `
        position:fixed; inset:0; z-index:3;
        pointer-events:none; opacity:0.04;
        mix-blend-mode:overlay; width:100vw; height:100vh;
    `;
    document.body.appendChild(grainCanvas);
    const ctx = grainCanvas.getContext('2d');
    
    function resize() {
        grainCanvas.width = window.innerWidth / 2;
        grainCanvas.height = window.innerHeight / 2;
    }
    resize();
    window.addEventListener('resize', resize);
    
    function renderGrain() {
        const w = grainCanvas.width;
        const h = grainCanvas.height;
        const imgData = ctx.createImageData(w, h);
        const data = imgData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const v = Math.random() * 255;
            data[i] = v;
            data[i+1] = v;
            data[i+2] = v;
            data[i+3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
        requestAnimationFrame(renderGrain);
    }
    renderGrain();
}

// ═══ 2. CINEMATIC LETTERBOX BARS ═══
function initLetterbox() {
    const style = document.createElement('style');
    style.textContent = `
        .cinematic-bar {
            position: fixed; left: 0; right: 0; z-index: 4;
            height: 0; background: #000; pointer-events: none;
            transition: height 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .cinematic-bar--top { top: 0; }
        .cinematic-bar--bottom { bottom: 0; }
        body.cinematic-mode .cinematic-bar { height: 60px; }
        @media (max-width: 768px) {
            body.cinematic-mode .cinematic-bar { height: 30px; }
        }
    `;
    document.head.appendChild(style);
    
    const barTop = document.createElement('div');
    barTop.className = 'cinematic-bar cinematic-bar--top';
    const barBottom = document.createElement('div');
    barBottom.className = 'cinematic-bar cinematic-bar--bottom';
    document.body.appendChild(barTop);
    document.body.appendChild(barBottom);
    
    // Activate on video interstitials
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.body.classList.add('cinematic-mode');
            } else {
                document.body.classList.remove('cinematic-mode');
            }
        });
    }, { threshold: 0.3 });
    
    setTimeout(() => {
        document.querySelectorAll('.video-interstitial, #hero').forEach(el => {
            observer.observe(el);
        });
    }, 1500);
}

// ═══ 3. FADE TO BLACK ═══
function initFadeTransitions() {
    const fade = document.createElement('div');
    fade.id = 'fade-overlay';
    fade.style.cssText = `
        position:fixed; inset:0; z-index:5;
        background:#000; pointer-events:none;
        opacity:0; transition:opacity 0.4s ease;
    `;
    document.body.appendChild(fade);
    
    let lastSection = null;
    const sections = document.querySelectorAll('section[id]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target !== lastSection) {
                lastSection = entry.target;
                fade.style.opacity = '0.3';
                setTimeout(() => { fade.style.opacity = '0'; }, 200);
            }
        });
    }, { threshold: 0.5 });
    
    sections.forEach(s => observer.observe(s));
}

// ═══ INIT ═══
function init() {
    initFilmGrain();
    initLetterbox();
    initFadeTransitions();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
