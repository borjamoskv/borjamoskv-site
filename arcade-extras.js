/**
 * ARCADE EXTRAS — Konami Code, Time Theme, Scroll Counter, Click Combo
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

// ═══ 1. KONAMI CODE ═══
// ↑↑↓↓←→←→BA → unlocks secret mode
const KONAMI = [38,38,40,40,37,39,37,39,66,65];
let konamiIdx = 0;

function konamiUnlock() {
    document.body.classList.add('konami-unlocked');
    if (window.GLITCH) window.GLITCH.trigger();
    
    // Matrix Rain Overlay
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99998;pointer-events:none;opacity:0.85;mix-blend-mode:color-dodge;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~'.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    let lastDrawTime = 0;
    let matrixRaf;
    function draw(timestamp) {
        if (!lastDrawTime) lastDrawTime = timestamp;
        const delta = timestamp - lastDrawTime;
        
        // Cap at ~30fps equivalent for the classic matrix feel, but synced to paint
        if (delta > 33) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FF003C'; // CORTEX Red
            ctx.font = fontSize + 'px monospace';
            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
            lastDrawTime = timestamp;
        }
        matrixRaf = requestAnimationFrame(draw);
    }
    matrixRaf = requestAnimationFrame(draw);
    
    setTimeout(() => {
        cancelAnimationFrame(matrixRaf);
        canvas.style.transition = 'opacity 2s';
        canvas.style.opacity = '0';
        setTimeout(() => canvas.remove(), 2000);
    }, 8000);

    // Leave a permanent secret badge
        const badge = document.createElement('div');
        badge.style.cssText = `
            position:fixed; top:8px; right:8px; z-index:99999;
            background:rgba(43,59,229,0.9); color:#fff;
            padding:4px 10px; border-radius:4px; font-size:10px;
            font-family:monospace; pointer-events:none;
            animation: fadeInUp 0.5s ease;
        `;
        badge.textContent = '🎮 KONAMI UNLOCKED';
        document.body.appendChild(badge);
        setTimeout(() => badge.style.opacity = '0.3', 3000);

    // Trigger chiquito if available
    if (window.triggerChiquito) window.triggerChiquito();
}

document.addEventListener('keydown', (e) => {
    if (e.keyCode === KONAMI[konamiIdx]) {
        konamiIdx++;
        if (konamiIdx === KONAMI.length) {
            konamiUnlock();
            konamiIdx = 0;
        }
    } else {
        konamiIdx = 0;
    }
});

// ═══ 2. TIME-OF-DAY THEME ═══
function applyTimeTheme() {
    const hour = new Date().getHours();
    const root = document.documentElement;
    
    if (hour >= 6 && hour < 12) {
        // Morning — cool blue
        root.style.setProperty('--time-hue', '220');
        root.style.setProperty('--time-overlay', 'rgba(43, 59, 229, 0.03)');
    } else if (hour >= 12 && hour < 18) {
        // Afternoon — warm
        root.style.setProperty('--time-hue', '30');
        root.style.setProperty('--time-overlay', 'rgba(229, 150, 43, 0.02)');
    } else if (hour >= 18 && hour < 22) {
        // Evening — purple
        root.style.setProperty('--time-hue', '280');
        root.style.setProperty('--time-overlay', 'rgba(150, 43, 229, 0.03)');
    } else {
        // Night — deep dark, pure noir
        root.style.setProperty('--time-hue', '240');
        root.style.setProperty('--time-overlay', 'rgba(0, 0, 0, 0.1)');
    }
}
applyTimeTheme();
setInterval(applyTimeTheme, 60000); // Update every minute

// ═══ 3. SCROLL COUNTER (Speedometer) ═══
let totalScrolled = parseFloat(localStorage.getItem('moskv-scroll-km') || '0');
let lastScroll = window.scrollY;
let scrollSpeed = 0;
let scrollMeter = null;

function initScrollCounter() {
    scrollMeter = document.createElement('div');
    scrollMeter.id = 'scroll-speedometer';
    scrollMeter.style.cssText = `
        position:fixed; bottom:48px; right:12px; z-index:9999;
        font-family:'JetBrains Mono',monospace; font-size:9px;
        color:rgba(43,59,229,0.6); pointer-events:none;
        text-align:right; line-height:1.4;
    `;
    document.body.appendChild(scrollMeter);

    window.addEventListener('scroll', () => {
        const delta = Math.abs(window.scrollY - lastScroll);
        totalScrolled += delta / 1000; // Convert px to "meters"
        scrollSpeed = delta;
        lastScroll = window.scrollY;
        localStorage.setItem('moskv-scroll-km', totalScrolled.toFixed(1));

        // Earthquake Mode on high velocity
        if (delta > 150 && !document.body.classList.contains('mode-zen')) {
            const intensity = Math.min((delta - 150) / 10, 15);
            document.body.style.transform = `translate(${Math.random()*intensity - intensity/2}px, ${Math.random()*intensity - intensity/2}px)`;
            if(window.shakeTimeout) clearTimeout(window.shakeTimeout);
            window.shakeTimeout = setTimeout(() => { document.body.style.transform = ''; }, 50);
        }
    }, { passive: true });

    function updateMeter() {
        if (scrollMeter) {
            const km = (totalScrolled / 1000).toFixed(2);
            scrollMeter.innerHTML = `${km} km<br>${Math.min(scrollSpeed, 999).toFixed(0)} px/s`;
        }
        scrollSpeed *= 0.9;
        requestAnimationFrame(updateMeter);
    }
    updateMeter();
}

// ═══ 4. CLICK COMBO SYSTEM ═══
let comboCount = 0;
let comboTimer = null;
let comboDisplay = null;

function initClickCombo() {
    comboDisplay = document.createElement('div');
    comboDisplay.id = 'click-combo';
    comboDisplay.style.cssText = `
        position:fixed; top:50%; left:50%; z-index:99997;
        transform:translate(-50%,-50%) scale(0);
        font-family:'Outfit',sans-serif; font-weight:800;
        font-size:48px; color:#2B3BE5; pointer-events:none;
        text-shadow:0 0 20px rgba(43,59,229,0.5);
        transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s;
        opacity:0;
    `;
    document.body.appendChild(comboDisplay);

    document.addEventListener('click', (e) => {
        // Don't count on interactive elements
        if (e.target.closest('a, button, input, iframe, .swarm-dashboard')) return;

        comboCount++;
        clearTimeout(comboTimer);

        if (comboCount >= 2) {
            comboDisplay.textContent = `x${comboCount}`;
            comboDisplay.style.transform = `translate(-50%,-50%) scale(${Math.min(1 + comboCount * 0.1, 2)})`;
            comboDisplay.style.opacity = '1';
            
            // Color escalation
            if (comboCount >= 10) {
                comboDisplay.style.color = '#FF003C';
                if (window.GLITCH) window.GLITCH.trigger();
            } else if (comboCount >= 5) {
                comboDisplay.style.color = '#E52B8D';
            } else {
                comboDisplay.style.color = '#2B3BE5';
            }

            // Haptic
            if ('vibrate' in navigator) navigator.vibrate(Math.min(comboCount * 10, 100));
        }

        comboTimer = setTimeout(() => {
            comboCount = 0;
            comboDisplay.style.transform = 'translate(-50%,-50%) scale(0)';
            comboDisplay.style.opacity = '0';
        }, 800);
    });
}

// ═══ 5. GRAVITATIONAL TEXT ═══
function initGravitationalText() {
    const headings = document.querySelectorAll('.section-heading, .hero-title');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                // Leaving viewport — apply gravity fall
                const el = entry.target;
                el.style.transition = 'transform 0.6s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.4s';
                el.style.transform = 'translateY(40px) rotate(-2deg)';
                el.style.opacity = '0.3';
            } else {
                // Entering — reset
                const el = entry.target;
                el.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s';
                el.style.transform = 'translateY(0) rotate(0)';
                el.style.opacity = '1';
            }
        });
    }, { threshold: 0.05 });

    headings.forEach(h => observer.observe(h));
}

// ═══ 6. MORSE CODE SOS ═══
// S-O-S keys
const MORSE_SOS = ['s', 'o', 's'];
let morseIdx = 0;
let morseTimer = null;

document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    
    if (e.key.toLowerCase() === MORSE_SOS[morseIdx]) {
        morseIdx++;
        clearTimeout(morseTimer);
        
        if (morseIdx === MORSE_SOS.length) {
            morseIdx = 0;
            // Trigger distress signal
            if (window.GLITCH) {
                window.GLITCH.trigger();
                setTimeout(() => window.GLITCH.trigger(), 200);
                setTimeout(() => window.GLITCH.trigger(), 400);
            }
            document.body.style.filter = 'sepia(1) hue-rotate(-50deg) saturate(3)';
            setTimeout(() => document.body.style.filter = '', 1000);
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
            console.warn("CORTEX EMERGENCY OVERRIDE INITIATED (SOS RECEIVED)");
        } else {
            morseTimer = setTimeout(() => { morseIdx = 0; }, 1000);
        }
    } else {
        morseIdx = 0;
    }
});

// ═══ INIT ═══
function init() {
    initScrollCounter();
    initClickCombo();
    initGravitationalText();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
