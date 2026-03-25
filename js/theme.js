/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | AUTO THEME — MODO DÍA / MODO NOCHE
 * Auto-detects based on local time: 7:00–20:00 = day, else night.
 * No toggle. Pure automatic. Re-checks every 5 minutes.
 * ═══════════════════════════════════════════════════════════════════
 */

MOSKV.theme = (() => {
    'use strict';

    const DAY_START = 7;   // 07:00
    const NIGHT_START = 20; // 20:00

    const detect = () => {
        const h = new Date().getHours();
        return (h >= DAY_START && h < NIGHT_START) ? 'day' : 'night';
    };

    const apply = (theme) => {
        const current = document.documentElement.dataset.theme;
        if (current === theme) return;
        document.documentElement.dataset.theme = theme;
        // Update meta theme-color
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', theme === 'day' ? '#F5F3EE' : '#2E5090');
        }
        console.log(`%c THEME: ${theme.toUpperCase()} MODE `, 
            `background:${theme === 'day' ? '#2E5090' : '#CCFF00'}; color:${theme === 'day' ? '#FFF' : '#000'}; font-weight:bold;`);
    };

    const init = () => {
        apply(detect());
        // Re-check every 5 minutes for seamless transition
        setInterval(() => apply(detect()), 5 * 60 * 1000);
    };

    return { init, detect, apply };
})();
