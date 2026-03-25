/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | SOVEREIGN JS ARCHITECTURE — CORE MODULE
 * Boot sequence, navigation, bizarre mode, and system orchestration.
 * ═══════════════════════════════════════════════════════════════════
 */

const MOSKV = globalThis.MOSKV || {};
globalThis.MOSKV = MOSKV;

MOSKV.core = (() => {
    'use strict';

    // ── LOADER & INITIALIZATION ──
    const initSystem = () => {
        try {
            const progress = document.querySelector('.loader-progress');
            if (!progress) return;
            
            let width = 0;
            const interval = setInterval(() => {
                width += Math.random() * 25;
                if (width >= 100) {
                    width = 100;
                    clearInterval(interval);
                    requestAnimationFrame(() => {
                        progress.style.width = width + '%';
                    });
                    
                    setTimeout(() => {
                        document.body.classList.add('loaded');
                        if (MOSKV.scroll?.initAwwwardsScroll) {
                            MOSKV.scroll.initAwwwardsScroll();
                        }
                    }, 200);
                } else {
                    requestAnimationFrame(() => {
                        progress.style.width = width + '%';
                    });
                }
            }, 30);
        } catch (e) {
            console.error("[CORTEX] Initialization failure:", e);
            document.body.classList.add('loaded');
            if (MOSKV.scroll?.initAwwwardsScroll) {
                MOSKV.scroll.initAwwwardsScroll();
            }
        }
    };

    // ── NAVIGATION ──
    const initNav = () => {
        const nav = document.getElementById('mainNav');
        const toggle = document.getElementById('navToggle');
        if (!nav) return;
        
        if (toggle) {
            toggle.addEventListener('click', () => {
                nav.classList.toggle('menu-open');
            });
        }

        nav.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                nav.classList.remove('menu-open');
            }
        });

        globalThis.addEventListener('resize', () => {
            if (globalThis.innerWidth > 980) {
                nav.classList.remove('menu-open');
            }
        });
    };

    // ── BIZARRE MODE ──
    const initBizarre = () => {
        const bToggle = document.getElementById('bizarreToggle');
        if (bToggle) {
            bToggle.addEventListener('click', () => {
                document.body.classList.toggle('bizarre-mode');
            });
        }
    };

    // ── UTILITY ──
    const setTranslate = (xPos, yPos, el) => {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    };

    // ── BOOT SEQUENCE ──
    const boot = () => {
        console.log("%c SYSTEM ONLINE %c v2.0 MODULAR ", "background:#CCFF00; color:#0A0A0A; font-weight:bold;", "background:#0A0A0A; color:#CCFF00;");

        // Phase 1: Critical path (synchronous)
        initSystem();
        initNav();
        initBizarre();
        if (MOSKV.theme) MOSKV.theme.init();

        // Phase 2: Feature modules (order matters for some)
        if (MOSKV.mutator) MOSKV.mutator.init();
        if (MOSKV.media) MOSKV.media.init();
        if (MOSKV.works) MOSKV.works.init();
        if (MOSKV.particles) MOSKV.particles.init();
        if (MOSKV.chat) MOSKV.chat.init();
        
        // Phase 3: Desktop-only enhancements
        if (globalThis.innerWidth > 768) {
            if (MOSKV.cursor) MOSKV.cursor.init();
        }

        // Phase 4: Heavy interactive (deferred)
        if (MOSKV.draggable) MOSKV.draggable.init();
        
        // Phase 5: Non-critical interactions (delayed)
        setTimeout(() => {
            if (MOSKV.interactions) MOSKV.interactions.init();
        }, 1000);
    };

    return { boot, setTranslate };
})();

// ── DOM READY ──
document.addEventListener("DOMContentLoaded", () => {
    MOSKV.core.boot();

    // Register Service Worker for PWA/Offline Shell
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('SW registered: ', registration);
            }).catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
        });
    }
});
