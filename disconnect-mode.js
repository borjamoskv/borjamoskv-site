/**
 * SILENCE PROTOCOL (Disconnect Mode)
 * Turns off the entire visual noise of the web, leaving only the music playing.
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

let btn = null;
let isSilent = false;

function toggleSilence() {
    isSilent = !isSilent;
    if (isSilent) {
        document.body.classList.add('silence-protocol-active');
        btn.textContent = 'RESTORE_NOISE';
        btn.style.color = '#FF003C';
        
        // Haptic pulse for shutting down
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 500]);
        if(window.GLITCH) window.GLITCH.trigger();
    } else {
        document.body.classList.remove('silence-protocol-active');
        btn.textContent = 'SILENCE.';
        btn.style.color = '#2B3BE5';
        
        // Haptic for booting up
        if ('vibrate' in navigator) navigator.vibrate(50);
        if(window.GLITCH) window.GLITCH.trigger();
    }
}

function init() {
    // Add Silence Button
    btn = document.createElement('button');
    btn.id = 'silence-btn';
    btn.textContent = 'SILENCE.';
    
    btn.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 9999999;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #2B3BE5;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        letter-spacing: 2px;
        padding: 8px 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
    `;
    
    btn.addEventListener('mouseenter', () => {
        btn.style.background = isSilent ? 'rgba(255, 0, 60, 0.1)' : 'rgba(43, 59, 229, 0.1)';
        btn.style.borderColor = isSilent ? '#FF003C' : '#2B3BE5';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.background = 'transparent';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });
    
    btn.addEventListener('click', toggleSilence);
    document.body.appendChild(btn);

    // CSS for Silence Protocol
    const style = document.createElement('style');
    style.textContent = `
        body.silence-protocol-active > *:not(#silence-btn):not(script):not(style) {
            opacity: 0 !important;
            pointer-events: none !important;
            transition: opacity 1.5s cubic-bezier(0.55, 0.055, 0.675, 0.19) !important;
        }
        
        /* The body itself becomes pitch black */
        body.silence-protocol-active {
            background-color: #000 !important;
            background-image: none !important;
        }

        /* Exceptions: Audio elements keep computing, they're just hidden. 
           BUT if we have an explicit visualizer we want to see, we would exclude it.
           We'll leave everything truly visually black to enforce "Silence". 
           Only the audio remains audible because opacity: 0 doesn't mute elements. */
    `;
    document.head.appendChild(style);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
