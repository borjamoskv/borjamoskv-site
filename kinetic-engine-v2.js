/**
 * KINETIC ENGINE v2 (Azkartu-Ω)
 * High-performance O(1) physics: Magnetic Springs, Scroll Skew Inertia
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

// ═══ 1. MAGNETIC ELEMENTS (Spring Physics) ═══
function initMagneticElements() {
    const magneticElements = document.querySelectorAll('.nav-links a, .btn-primary, .mica-card');
    
    // Lerp function for smooth spring damping
    const lerp = (start, end, factor) => start + (end - start) * factor;

    magneticElements.forEach(el => {
        let isHovered = false;
        let bounds = null;
        
        let mouseX = 0, mouseY = 0;
        let currentX = 0, currentY = 0;

        el.addEventListener('mouseenter', () => {
            isHovered = true;
            bounds = el.getBoundingClientRect();
            // Optional: increase element mass visually
            el.style.transformOrigin = 'center center';
            el.style.willChange = 'transform';
        });

        el.addEventListener('mousemove', (e) => {
            if (!bounds) bounds = el.getBoundingClientRect();
            // Calculate pull: max pull distance is width/2 or height/2
            mouseX = (e.clientX - bounds.left - bounds.width / 2) * 0.4;
            mouseY = (e.clientY - bounds.top - bounds.height / 2) * 0.4;
        });

        el.addEventListener('mouseleave', () => {
            isHovered = false;
            mouseX = 0;
            mouseY = 0;
            setTimeout(() => { if (!isHovered) el.style.willChange = 'auto'; }, 1000);
        });

        // Animation Loop per element (could be batched for extreme perf, but RAF handles it well)
        function renderMagnetic() {
            if (!isHovered && Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1) {
                // Sleep
                currentX = 0; currentY = 0;
                el.style.transform = `translate3d(0px, 0px, 0px)`;
            } else {
                currentX = lerp(currentX, mouseX, 0.15); // Spring tension
                currentY = lerp(currentY, mouseY, 0.15);
                
                // Add a slight rotation for 3D feel
                const rotX = (currentY / 10);
                const rotY = -(currentX / 10);
                
                el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            }
            requestAnimationFrame(renderMagnetic);
        }
        requestAnimationFrame(renderMagnetic);
    });
}

// ═══ 2. SCROLL INERTIA (Velocity Skew) ═══
function initScrollSkew() {
    // We skew the entire visual wrapper, or fallback to body wrapper if available.
    // Given the structure, we can wrap <main> or just apply it to structural sections.
    // For maximum stability, we apply to #main-content if it exists, otherwise to body directly
    // Note: Applying 3d transforms to body directly can break fixed elements like Agent Bar.
    // Instead we will target internal structural grids (.grid-layout).
    
    const skewContainers = document.querySelectorAll('.grid-layout, .hero, .terminal-window');
    
    let currentScroll = window.scrollY;
    let targetSkew = 0;
    let currentSkew = 0;
    
    const lerp = (start, end, factor) => start + (end - start) * factor;

    function renderSkew() {
        const newScroll = window.scrollY;
        // Calculate velocity delta
        const delta = newScroll - currentScroll;
        currentScroll = newScroll;
        
        // Target skew is proportional to velocity (clamped)
        targetSkew = Math.max(-10, Math.min(10, delta * 0.05));
        
        // Lerp current skew toward target skew (spring effect)
        currentSkew = lerp(currentSkew, targetSkew, 0.1);
        
        skewContainers.forEach(container => {
            if (container) {
                // If velocity is negligible and we've snapped back, remove transform
                if (Math.abs(currentSkew) < 0.01) {
                    container.style.transform = 'skewY(0deg)';
                } else {
                    container.style.willChange = 'transform';
                    container.style.transform = `translate3d(0,0,0) skewY(${currentSkew}deg)`;
                }
            }
        });
        
        
        requestAnimationFrame(renderSkew);
    }
    
    requestAnimationFrame(renderSkew);
}

// ═══ 3. CRESCENDO WALL (140% Infinite Scroll Zoom) ═══
function initCrescendoWall() {
    const wall = document.getElementById('crescendo-wall');
    if (!wall) return;
    
    // Zoom in crescendo base logic
    // Max scale 2.0, min 1.0. Starts at 1.0 (100%), scales as you scroll down.
    function renderCrescendo() {
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        
        if (maxScroll > 0) {
            // Calculate a ratio from 0 to 1 based on how far we scrolled
            const scrollRatio = Math.min(1, Math.max(0, scrollY / maxScroll));
            
            // Base scale is 1.0, increases up to 1.4 (and slightly beyond with overscroll)
            // It goes in crescendo
            const targetScale = 1.0 + (scrollRatio * 0.4); 
            
            // Apply scale and the -4deg rotation
            wall.style.transform = `rotate(-4deg) scale(${targetScale})`;
        }
        
        requestAnimationFrame(renderCrescendo);
    }
    
    // Initial static style for hardware acceleration
    wall.style.willChange = 'transform';
    wall.style.transformOrigin = 'center center';
    
    requestAnimationFrame(renderCrescendo);
}

function init() {
    initMagneticElements();
    initScrollSkew();
    initCrescendoWall();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
