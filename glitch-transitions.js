/**
 * GLITCH TRANSITIONS — RGB split + scanline burst between sections
 * Triggers on scroll entry to each section
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

let glitchOverlay = null;
let glitchTimeout = null;

function createOverlay() {
    glitchOverlay = document.createElement('div');
    glitchOverlay.id = 'glitch-transition';
    glitchOverlay.style.cssText = `
        position: fixed; inset: 0; z-index: 99998;
        pointer-events: none; opacity: 0;
        mix-blend-mode: screen;
    `;
    document.body.appendChild(glitchOverlay);

    const style = document.createElement('style');
    style.textContent = `
        #glitch-transition.active {
            opacity: 1;
            animation: glitchBurst 250ms steps(4) forwards;
        }
        @keyframes glitchBurst {
            0% {
                background: repeating-linear-gradient(
                    0deg,
                    transparent, transparent 2px,
                    rgba(43, 59, 229, 0.15) 2px, rgba(43, 59, 229, 0.15) 4px
                );
                transform: translateX(-2px);
            }
            25% {
                background: repeating-linear-gradient(
                    0deg,
                    transparent, transparent 3px,
                    rgba(229, 43, 59, 0.12) 3px, rgba(229, 43, 59, 0.12) 6px
                );
                transform: translateX(3px) skewX(-1deg);
            }
            50% {
                background: repeating-linear-gradient(
                    0deg,
                    transparent, transparent 1px,
                    rgba(43, 229, 180, 0.1) 1px, rgba(43, 229, 180, 0.1) 3px
                );
                transform: translateX(-1px) skewX(0.5deg);
            }
            75% {
                background: repeating-linear-gradient(
                    0deg,
                    transparent, transparent 4px,
                    rgba(43, 59, 229, 0.08) 4px, rgba(43, 59, 229, 0.08) 5px
                );
                transform: translateX(1px);
            }
            100% {
                opacity: 0;
                transform: none;
            }
        }
    `;
    document.head.appendChild(style);
}

function triggerGlitch() {
    if (!glitchOverlay) createOverlay();
    if (glitchTimeout) return; // debounce

    glitchOverlay.classList.remove('active');
    void glitchOverlay.offsetWidth; // force reflow
    glitchOverlay.classList.add('active');

    glitchTimeout = setTimeout(() => {
        glitchOverlay.classList.remove('active');
        glitchTimeout = null;
    }, 300);
}

function init() {
    createOverlay();

    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                triggerGlitch();
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(s => observer.observe(s));

    // Also trigger on video interstitials
    setTimeout(() => {
        document.querySelectorAll('.video-interstitial').forEach(v => observer.observe(v));
    }, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.GLITCH = { trigger: triggerGlitch };

})();
