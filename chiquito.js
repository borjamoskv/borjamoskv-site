document.addEventListener('DOMContentLoaded', () => {
    // Inject the HTML for the easter egg
    const overlay = document.createElement('div');
    overlay.id = 'chiquito-overlay';
    overlay.innerHTML = `
        <div class="chiquito-content">
            <img src="borjarl.jpg" alt="Borjarl" class="borjarl-img">
            <div class="chiquito-text">"ESTO NO ES UNA WEB" ES UN SENTIMIENTO::: NO PUEDOOOr PARaaaar</div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.innerHTML = `
        #chiquito-overlay {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(204, 0, 0, 0.9);
            z-index: 999999;
            display: none;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            pointer-events: none;
            mix-blend-mode: difference;
        }
        .chiquito-content {
            text-align: center;
            transform: scale(0.1) rotate(-180deg);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        #chiquito-overlay.active {
            display: flex;
            pointer-events: all;
            animation: strobe 0.1s infinite;
        }
        #chiquito-overlay.active .chiquito-content {
            transform: scale(1.5) rotate(5deg);
            opacity: 1;
            animation: borjarlGlitch 0.1s infinite alternate;
        }
        .borjarl-img {
            max-width: 90vw;
            max-height: 70vh;
            margin-bottom: -40px;
            filter: contrast(200%) hue-rotate(180deg) saturate(500%) invert(1);
            mix-blend-mode: hard-light;
            border-radius: 5px;
            box-shadow: 0 0 50px red;
        }
        .chiquito-text {
            font-family: 'Courier New', Courier, monospace;
            font-size: 4rem;
            color: #fff;
            text-shadow: 0 0 20px #ccff00, 5px 5px 0px #000;
            text-transform: uppercase;
            font-weight: 900;
            letter-spacing: -2px;
            padding: 0 20px;
            line-height: 1;
        }
        @keyframes borjarlGlitch {
            0% { transform: scale(1.55) translate(10px, -10px) skewX(5deg); filter: hue-rotate(0deg); }
            100% { transform: scale(1.45) translate(-10px, 10px) skewX(-5deg); filter: hue-rotate(90deg); }
        }
        @keyframes strobe {
            0% { background: rgba(204, 0, 0, 0.9); }
            50% { background: rgba(0, 0, 0, 0.9); }
            100% { background: rgba(255, 255, 255, 0.9); }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    function triggerChiquito() {
        if(overlay.classList.contains('active')) return;
        
        // Visual
        overlay.classList.add('active');
        
        // Ensure sound is allowed or warn
        if(window.AutoDJ && window.AutoDJ.globalMuted) {
            console.warn("Audio is muted, Chiquito cannot scream.");
        }
        
        // Audio synthesis (Chiquito voice)
        const utterance = new SpeechSynthesisUtterance("Jarllll!! No puedo, no puedoooooooorl");
        utterance.lang = "es-ES";
        utterance.pitch = 0.5; // Demonic low pitch
        utterance.rate = 1.8;  // Fast panic
        window.speechSynthesis.speak(utterance);

        // Hide after some time
        setTimeout(() => {
            overlay.classList.remove('active');
            window.speechSynthesis.cancel();
        }, 2000); // Shorter, more aggressive burst
    }

    // Trigger randomly roughly every 45-60 secs, but ONLY sometimes
    setInterval(() => {
        // 5% chance to appear every check (rarer but crazier)
        if(Math.random() > 0.95) {
            triggerChiquito();
        }
    }, 45000);
    
    // Check if user is typing the konami code or secret word
    let secretCode = '';
    document.addEventListener('keydown', (e) => {
        secretCode += e.key.toLowerCase();
        if (secretCode.length > 10) secretCode = secretCode.substring(1);
        if (secretCode.includes('puedoor')) {
            triggerChiquito();
            secretCode = '';
        }
    });

    // Expose for debugging or manual trigger
    window.triggerChiquito = triggerChiquito;
});
