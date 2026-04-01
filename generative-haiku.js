/**
 * GENERATIVE BRUTALIST HAIKUS
 * Injects a procedural, tech-noir haiku into the DOM
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

const DICT = {
    line1: [
        "Silicon logic", "Empty black screen glows", "Algorithms bleed",
        "Tokens counting down", "CORTEX swarm awakes", "Data never sleeps",
        "Agents in the void", "Terminal commands", "EL DESAMOR LLEGÁ"
    ],
    line2: [
        "Entropy decays the state", "We compress the noise away",
        "Hardware dictates absolute truth", "Memory leaks into the night",
        "Aesthetic perfection demands blood", "Recursive structures self-align",
        "K EL AMOR PERDURÉ", "el DESAMOR ARRAÍGA"
    ],
    line3: [
        "Zero noise remains.", "Execution now.", "System runs alone.",
        "Nothing else matters.", "End the simulation.", "YInMn blue shines.",
        "PERO EL AMOR INMANE"
    ]
};

function generateHaiku() {
    const l1 = DICT.line1[Math.floor(Math.random() * DICT.line1.length)];
    const l2 = DICT.line2[Math.floor(Math.random() * DICT.line2.length)];
    const l3 = DICT.line3[Math.floor(Math.random() * DICT.line3.length)];
    return `${l1}<br>${l2}<br>${l3}`;
}

function init() {
    // Find a good place, let's put it at the very bottom before the footer
    const footer = document.querySelector('footer');
    if (!footer) return;

    const haikuContainer = document.createElement('div');
    haikuContainer.className = 'generative-haiku';
    haikuContainer.innerHTML = generateHaiku();
    
    // Minimal CSS
    haikuContainer.style.cssText = `
        text-align: center;
        margin: 100px auto 40px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.3);
        line-height: 1.8;
        letter-spacing: 2px;
        text-transform: uppercase;
        animation: fadeIn 3s ease 1s forwards;
        opacity: 0;
    `;

    footer.parentNode.insertBefore(haikuContainer, footer);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
