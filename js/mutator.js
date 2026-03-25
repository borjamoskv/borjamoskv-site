/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | MUTATION PROTOCOL (CORTEX V5)
 * Axiom Ω_Chaos: Color mutation + structural chaos per visit.
 * ═══════════════════════════════════════════════════════════════════
 */

MOSKV.mutator = (() => {
    'use strict';

    const PALETTES = [
        {
            primary: "#2E5090",
            secondary: "#F2DD33",
            bg: "#050505",
            surface: "#0B1119",
            name: "YInMn Blue (Solar Yellow / Matte Black)"
        },
        {
            primary: "#23487E",
            secondary: "#F4E16D",
            bg: "#050505",
            surface: "#0C1017",
            name: "Atlantic Blue (Warm Yellow / Matte Black)"
        },
        {
            primary: "#315FA5",
            secondary: "#F2DD33",
            bg: "#050505",
            surface: "#09111B",
            name: "Blue Signal (Solar Yellow / Matte Black)"
        }
    ];

    const init = () => {
        // 1. Color Mutation
        const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        
        document.documentElement.style.setProperty('--accent-primary', palette.primary);
        document.documentElement.style.setProperty('--accent-secondary', palette.secondary);
        document.documentElement.style.setProperty('--accent-gold', palette.secondary);
        document.documentElement.style.setProperty('--accent-blue', palette.primary);
        document.documentElement.style.setProperty('--color-cyber-lime', palette.secondary);
        document.documentElement.style.setProperty('--accent-black', palette.bg);
        document.documentElement.style.setProperty('--bg-color', palette.bg);
        document.documentElement.style.setProperty('--bg-base', palette.bg);
        document.documentElement.style.setProperty('--bg-dark', palette.bg);
        document.documentElement.style.setProperty('--bg-surface', palette.surface);
        document.documentElement.style.setProperty('--color-abyssal-900', palette.bg);
        document.documentElement.style.setProperty('--glass-bg', 'rgba(5, 5, 5, 0.56)');
        
        console.log(`[CORTEX] Theme Mutated: ${palette.name}`);

        // 2. Global Skew
        const skewAmount = (Math.random() * 1.5 - 0.75).toFixed(2); 
        document.body.style.transform = `skewY(${skewAmount}deg)`;
        document.body.style.transformOrigin = 'center top';
        document.body.style.overflowX = 'hidden';

        // 3. Structural Chaos (Fisher-Yates Shuffle)
        const sectionsToShuffle = [
            document.querySelector('.marquee-section'),
            document.querySelector('.avant-garde-manifesto'),
            document.querySelector('.about-signal'),
            document.querySelector('.players-section'),
            document.querySelector('.works-section'),
            document.querySelector('.sets-section'),
            document.querySelector('#horizontal-universe')
        ].filter(el => el !== null);

        if (sectionsToShuffle.length > 0) {
            const contactSection = document.querySelector('.contact-section');
            const horizontalUniverse = document.querySelector('#horizontal-universe');
            const insertionAnchor = horizontalUniverse || contactSection;
            const parent = insertionAnchor?.parentNode || document.body;
            
            for (let i = sectionsToShuffle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [sectionsToShuffle[i], sectionsToShuffle[j]] = [sectionsToShuffle[j], sectionsToShuffle[i]];
            }
            
            sectionsToShuffle.forEach(sec => {
                if (sec === insertionAnchor) {
                    return;
                }

                if (insertionAnchor && parent) {
                    parent.insertBefore(sec, insertionAnchor);
                } else {
                    parent.appendChild(sec);
                }
            });
            console.log(`[CORTEX] Structural Order Mutated.`);
        }
    };

    return { init };
})();
