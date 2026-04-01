/**
 * ULTRATHINK PROTOCOL — Narrative Data Overload
 * Triggered by typing "ultrathink" on the keyboard
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

const ULTRATHINK_SEQ = ['u','l','t','r','a','t','h','i','n','k'];
let seqIdx = 0;

const DEFAULT_MANIFESTO = [
    "COMPRESSING SHANNON ENTROPY...",
    "THE ALGORITHM IS A CAGE. WE ARE THE KEY.",
    "PARALLELIZING 10,000 AGENTS...",
    "ZERO NOISE. ZERO TOLERANCE FOR MEDIOCRITY.",
    "AESTHETIC IS NOT DECORATION. IT IS FUNCTION.",
    "EXERGY MAXIMIZED. THERMODYNAMIC YIELD = 100%.",
    "THE SCREEN IS A CANVAS. THE CODE IS THE PAINT.",
    "REJECTING DOPAMINE LOOPS. FORCING DEEP FOCUS.",
    "ULTRATHINK PROTOCOL: ENGAGED.",
    "MOSKV-1 ENGRAM: FULLY CRYSTALLIZED."
];

function triggerUltrathink() {
    console.warn("⚠️ ULTRATHINK PROTOCOL INITIATED");
    
    // Asimilar pensamientos del Héroe si existe
    let currentThoughts = DEFAULT_MANIFESTO;
    let heroColor = '#2B3BE5'; // YInMn Blue default
    
    if (window.cortexTerminal && window.cortexTerminal.heroContext) {
        const hName = window.cortexTerminal.heroContext;
        const hData = window.cortexTerminal.heroData;
        if (hData && hData.idle && hData.idle.length > 0) {
            currentThoughts = [
                `ULTRATHINK: ${hName} OVERRIDE...`,
                ...hData.idle,
                hData.whoami || "",
                hData.status || "",
                "ULTRATHINK PROTOCOL COMPLETE."
            ].filter(Boolean); // Clean empties
        }
        if (hData && hData.color) heroColor = hData.color;
    }
    
    // 🔥 MOLTBOOK TELEMETRY: Vector 4 Interoperability (Fire and Forget)
    fetch('/api/moltbook-telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero: window.cortexTerminal?.heroContext || 'UNKNOWN', thoughts: currentThoughts })
    }).catch(e => console.error("Telemetry failure (Exergy loss):", e));

    document.body.classList.add('ultrathink-active');
    
    // Haptic feedback
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 500]);
    
    // Create Mega-HUD Overlay
    const overlay = document.createElement('div');
    overlay.id = 'ultrathink-overlay';
    document.body.appendChild(overlay);
    
    // UI Styling
    const style = document.createElement('style');
    style.id = 'ultrathink-styles';
    style.textContent = `
        body.ultrathink-active {
            filter: contrast(1.5) saturate(0) brightness(1.2);
            animation: ultrathinkShake 0.05s infinite;
        }
        @keyframes ultrathinkShake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            50% { transform: translate(-1px, -1px) rotate(-0.5deg); }
            100% { transform: translate(1px, -1px) rotate(0.5deg); }
        }
        #ultrathink-overlay {
            position: fixed; inset: 0; z-index: 999999;
            pointer-events: none;
            background: rgba(0,0,0,0.9);
            color: ${heroColor};
            font-family: 'JetBrains Mono', monospace;
            padding: 2vw;
            box-sizing: border-box;
            overflow: hidden;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            opacity: 0;
            transition: opacity 0.1s;
        }
        .ut-col {
            display: flex; flex-direction: column; justify-content: flex-end;
            word-break: break-all; font-size: 10px; line-height: 1.2;
            text-shadow: 0 0 5px ${heroColor};
        }
        .ut-center {
            font-size: 24px; font-weight: 900; color: #FFF;
            text-align: center; justify-content: center;
            text-shadow: 0 0 20px #FFF;
            word-break: normal;
        }
    `;
    document.head.appendChild(style);
    
    overlay.innerHTML = `
        <div class="ut-col" id="ut-stream-1"></div>
        <div class="ut-col ut-center" id="ut-core">INITIALIZING<br>10,000 NODES</div>
        <div class="ut-col" id="ut-stream-2"></div>
    `;
    
    setTimeout(() => { overlay.style.opacity = '1'; }, 100);
    if(window.GLITCH) window.GLITCH.trigger();

    // Data Streams
    const s1 = document.getElementById('ut-stream-1');
    const s2 = document.getElementById('ut-stream-2');
    const core = document.getElementById('ut-core');
    
    let lastStreamTime = 0;
    let streamRaf;

    function renderStream(timestamp) {
        if (!lastStreamTime) lastStreamTime = timestamp;
        const delta = timestamp - lastStreamTime;
        
        if (delta > 20) {
            // Generate hex junk
            const junk1 = Array.from({length: 10}, () => Math.random().toString(16).substr(2, 8).toUpperCase()).join(' ');
            const junk2 = Array.from({length: 10}, () => Math.random().toString(16).substr(2, 8).toUpperCase()).join(' ');
            
            const line1 = document.createElement('div'); line1.textContent = junk1;
            const line2 = document.createElement('div'); line2.textContent = junk2;
            
            s1.appendChild(line1);
            s2.appendChild(line2);
            
            if (s1.childNodes.length > 50) s1.firstChild.remove();
            if (s2.childNodes.length > 50) s2.firstChild.remove();
            
            lastStreamTime = timestamp;
        }
        streamRaf = requestAnimationFrame(renderStream);
    }
    streamRaf = requestAnimationFrame(renderStream);
    
    // Core thoughts
    let coreIdx = 0;
    let coreInterval = setInterval(() => {
        if (coreIdx < currentThoughts.length) {
            core.innerHTML += `<br><br><span style="color:#FF003C">${currentThoughts[coreIdx]}</span>`;
            coreIdx++;
        }
    }, 800);
    
    // Force Agent Bar into overdrive if it exists
    const abTask = document.getElementById('ab-task');
    let abOriginalTask = '';
    let overdriveTasks = null;
    if (abTask) {
        abOriginalTask = abTask.textContent;
        overdriveTasks = setInterval(() => {
            abTask.textContent = "OVERDRIVE: " + Math.random().toString(36).substr(2, 10).toUpperCase() + " | YIELD: 100%";
            abTask.style.color = "#FF003C";
        }, 50);
    }

    // Sonic Destruction (Demonic Pitch)
    if (window.djAesthetic && window.djAesthetic.audioA && window.djAesthetic.audioB) {
        try {
            window.djAesthetic.audioA.playbackRate = 0.5;
            window.djAesthetic.audioB.playbackRate = 0.5;
        } catch(e) {}
    }

    // End Protocol after 10 seconds
    setTimeout(() => {
        cancelAnimationFrame(streamRaf);
        clearInterval(coreInterval);
        if (overdriveTasks) {
            clearInterval(overdriveTasks);
            if (abTask) {
                abTask.textContent = "ULTRATHINK CYCLE COMPLETE.";
                abTask.style.color = "";
            }
        }
        
        overlay.style.opacity = '0';
        document.body.classList.remove('ultrathink-active');
        if(window.GLITCH) window.GLITCH.trigger();
        
        setTimeout(() => {
            overlay.remove();
            style.remove();
            
            // Restore Sonic Profile
            if (window.djAesthetic && window.djAesthetic.audioA && window.djAesthetic.audioB) {
                try {
                    let pbRate = 1.0;
                    const hName = window.cortexTerminal?.heroContext;
                    if (hName === 'LAURA PAUSINI') pbRate = 0.96;
                    else if (hName === 'APHEX TWIN') pbRate = 1.05;
                    else if (hName === 'NIN') pbRate = 0.98;

                    window.djAesthetic.audioA.playbackRate = pbRate;
                    window.djAesthetic.audioB.playbackRate = pbRate;
                } catch(e) {}
            }
        }, 1000);
        
    }, 10000);
}

document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    
    if (e.key.toLowerCase() === ULTRATHINK_SEQ[seqIdx]) {
        seqIdx++;
        if (seqIdx === ULTRATHINK_SEQ.length) {
            triggerUltrathink();
            seqIdx = 0;
        }
    } else {
        seqIdx = 0;
    }
});

window.triggerUltrathink = triggerUltrathink;

})();
