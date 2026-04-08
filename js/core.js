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

    const isLightweightMode = () => globalThis.matchMedia?.('(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)')?.matches ?? false;

    const runDeferred = (callback, delay = 180) => {
        if (typeof callback !== 'function') return;

        if ('requestIdleCallback' in globalThis) {
            globalThis.requestIdleCallback(() => callback(), { timeout: 1200 });
            return;
        }

        globalThis.setTimeout(callback, delay);
    };

    const showElement = (element, display) => {
        if (!element) return;
        element.style.setProperty('display', display, 'important');
        element.removeAttribute('hidden');
        element.setAttribute('aria-hidden', 'false');
    };

    const activateEditorialLanding = () => {
        const nav = document.getElementById('mainNav');
        const hero = document.getElementById('hero');
        const frontierBand = document.getElementById('frontier-band');
        const heroTitle = document.querySelector('.hero-title');

        document.body.classList.add('loaded', 'editorial-mode-active');
        document.documentElement.dataset.entry = 'editorial';

        if (isLightweightMode()) {
            document.body.classList.add('touch-editorial');
        } else {
            document.body.classList.remove('touch-editorial');
        }

        showElement(nav, 'flex');
        showElement(hero, 'flex');
        showElement(frontierBand, 'block');

        if (heroTitle) {
            heroTitle.style.opacity = '1';
            heroTitle.style.pointerEvents = 'auto';
        }
    };

    // ── LOADER & INITIALIZATION ──
    const initSystem = () => {
        try {
            activateEditorialLanding();
            if (MOSKV.scroll?.initAwwwardsScroll) {
                MOSKV.scroll.initAwwwardsScroll();
            }
        } catch (e) {
            console.error("[CORTEX] Initialization failure:", e);
            activateEditorialLanding();
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

        const setMenuState = (isOpen) => {
            nav.classList.toggle('menu-open', isOpen);
            if (toggle) {
                toggle.setAttribute('aria-expanded', String(isOpen));
            }
        };
        
        if (toggle) {
            toggle.addEventListener('click', (event) => {
                event.stopPropagation();
                setMenuState(!nav.classList.contains('menu-open'));
            });
        }

        nav.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                setMenuState(false);
            }
        });

        document.addEventListener('click', (event) => {
            if (nav.classList.contains('menu-open') && !nav.contains(event.target)) {
                setMenuState(false);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                setMenuState(false);
            }
        });

        globalThis.addEventListener('resize', () => {
            if (globalThis.innerWidth > 992) {
                setMenuState(false);
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
        const lightweightMode = isLightweightMode();

        // Phase 1: Critical path (synchronous)
        initSystem();
        initNav();
        initBizarre();
        if (MOSKV.theme) MOSKV.theme.init();

        // Phase 2: Feature modules (order matters for some)
        if (MOSKV.mutator) MOSKV.mutator.init();
        if (MOSKV.media) MOSKV.media.init();
        if (MOSKV.works) MOSKV.works.init();
        if (!lightweightMode && MOSKV.particles) {
            runDeferred(() => MOSKV.particles.init());
        }
        if (MOSKV.chat) {
            runDeferred(() => MOSKV.chat.init(), 320);
        }
        
        // Phase 3: Desktop-only enhancements
        if (!lightweightMode && globalThis.innerWidth > 768) {
            if (MOSKV.cursor) {
                runDeferred(() => MOSKV.cursor.init(), 260);
            }
        }

        // Phase 4: Heavy interactive (deferred)
        if (!lightweightMode && MOSKV.draggable) {
            runDeferred(() => MOSKV.draggable.init(), 420);
        }
        
        // Phase 5: Non-critical interactions (delayed)
        setTimeout(() => {
            if (MOSKV.interactions) MOSKV.interactions.init();
        }, lightweightMode ? 1400 : 700);
    };

    return { boot, setTranslate, isLightweightMode };
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
