// js/micro-details.js
// Generates 250+ micro-details for the Industrial Noir / CORTEX aesthetic

document.addEventListener("DOMContentLoaded", () => {
    // 1. Create a container for absolute placed elements across the whole document
    const container = document.createElement("div");
    container.className = "micro-details-container";
    container.style.position = "absolute";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.overflow = "hidden";
    container.style.pointerEvents = "none";
    container.style.zIndex = "2"; // Above background but below interactive UI elements
    
    document.body.appendChild(container);

    const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );

    const phrases = [
        "SYS.CORE.V5", "0x00F8A", "LAT: 43.2630 | LON: -2.9350", "[OK]", 
        "MEM_ALLOC", "CORTEX_ACTIVE", "AWAITING_SIGNAL", "GHOST_DETECTED", 
        "PULSE: ALIVE", "NOIR_MODE", "YINMN_BLUE", "LEMON_YELLOW_OK", 
        "// FRAG_09", "ERR_NULL", "0x99B0", "DECAY_RATE: 0.12",
        "T=(N-1)", "MOSKV_1", "BAKALA_DE_TROYA", "[DATA_SCRAMBLE]",
        "Ω₁", "Ω₆", "EXERGY_HIGH", "R=0.176", "STRUCT_INTEGRITY",
        "SYNC: ON", "LOCAL_NODE", "0x33", "0x8F", "0x11"
    ];

    const types = ['cross', 'bracket', 'line', 'dot'];
    const totalDetails = 3500; // "Miles de detalles" massive scale

    // Use DocumentFragment for performant massive DOM injection
    const fragment = document.createDocumentFragment();

    // Helper to get random number
    const rInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
    const rFloat = (min, max) => Math.random() * (max - min) + min;

    for (let i = 0; i < totalDetails; i++) {
        const el = document.createElement("div");
        
        // Massive bias towards dots and lines to avoid visual clutter dominating the screen
        const randType = Math.random();
        let type;
        if (randType < 0.6) type = 'dot';
        else if (randType < 0.8) type = 'line';
        else if (randType < 0.95) type = 'cross';
        else type = 'bracket';
        
        el.className = `micro-detail md-${type}`;
        
        // Random positioning
        const top = rFloat(0, docHeight);
        const left = rFloat(0.5, 99.5); // vw
        
        el.style.top = `${top}px`;
        el.style.left = `${left}vw`;
        
        // Random opacity - most extremely faint, a few slightly brighter
        el.style.opacity = rFloat(0.02, 0.15).toFixed(2);
        
        // Styles based on type
        if (type === 'cross') {
            el.innerText = "+";
            el.style.fontSize = `${rFloat(0.3, 0.7)}rem`;
            el.style.color = Math.random() > 0.95 ? "var(--accent-primary)" : "rgba(212, 212, 212,0.2)";
            el.style.fontFamily = "monospace";
        } else if (type === 'bracket') {
            el.innerText = Math.random() > 0.5 ? "[" : "]";
            el.style.fontSize = `${rFloat(0.5, 0.8)}rem`;
            el.style.color = "rgba(212, 212, 212,0.15)";
            el.style.fontFamily = "inherit";
        } else if (type === 'line') {
            const isVertical = Math.random() > 0.8;
            el.style.backgroundColor = Math.random() > 0.98 ? "var(--accent-primary)" : "rgba(212, 212, 212,0.08)";
            if (isVertical) {
                el.style.width = "1px";
                el.style.height = `${rFloat(10, 150)}px`;
            } else {
                el.style.width = `${rFloat(10, 150)}px`;
                el.style.height = "1px";
            }
        } else if (type === 'dot') {
            const size = rFloat(1, 3);
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            el.style.backgroundColor = Math.random() > 0.99 ? "var(--accent-primary)" : "rgba(212, 212, 212,0.3)";
            if(Math.random() > 0.5) el.style.borderRadius = "50%";
        }
        
        // Only animate 1% of elements to save performance when rendering thousands
        if (Math.random() > 0.99) {
            el.style.animation = `pulse ${rFloat(1, 4)}s infinite alternate`;
        }
        
        fragment.appendChild(el);
    }
    
    container.appendChild(fragment);
    
    // HUD removed to maintain maximum visual clarity for the Black Hole effect.
});
