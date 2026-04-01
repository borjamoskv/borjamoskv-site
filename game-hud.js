/**
 * CORTEX VIDEO GAME HUD ENGINE
 * Handles "Press Start" sequence, Vault generation, and DJ/Listlyzer Telemetry sync
 */

document.addEventListener('DOMContentLoaded', () => {
    const pressStartBtn = document.getElementById('press-start-btn');
    const gameHud = document.getElementById('game-hud');
    const vaultContainer = document.getElementById('vault-grid-container');
    const hudBpm = document.getElementById('hud-bpm');
    const hudPhase = document.getElementById('hud-phase');
    const hudExergy = document.querySelector('.dj-telemetry .hud-value.neon-blue');
    const hudVuMeter = document.getElementById('hud-vu-meter');
    const playGenre = document.getElementById('play-genre');
    const vuCtx = hudVuMeter ? hudVuMeter.getContext('2d') : null;

    let systemExergy = 100.00; // Termodinamica (Ω2)
    let lastTrackId = null;

    // 1. BOOT SEQUENCE
    if (pressStartBtn) {
        pressStartBtn.addEventListener('click', () => {
            // Dismiss loader
            const loader = document.getElementById('loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 1000);
            }
            
            // Activate Game Mode
            document.body.classList.add('game-mode-active');
            gameHud.classList.remove('hidden-boot');

            // Force WebAudio initiation if AutoDJ is present
            if (window.djAesthetic) {
                 window.djAesthetic.toggleGlobalMute(); // Boot it up
                 window.djAesthetic._crossfadeNow(); 
            }
        });
    }

    // 2. VAULT GENERATION (Load all cleaned videos)
    if (vaultContainer && window.DATA && window.DATA.works) {
        // Find videos
        const originalWorks = window.DATA.works;

        originalWorks.forEach((work, index) => {
            const el = document.createElement('div');
            el.className = 'vault-item';
            
            // Generate poster URL from ID
            const posterUrl = `https://i.ytimg.com/vi/${work.id}/hqdefault.jpg`;
            el.style.backgroundImage = `url(${posterUrl})`;
            
            el.innerHTML = `<div class="vault-item-title">[LVL ${index + 1}] ${work.title}</div>`;

            // On Click -> Inject into AutoDJ sequence and transition immediately
            el.addEventListener('click', () => {
                if (window.djAesthetic) {
                    window.djAesthetic.mixSequence.unshift(work.id);
                    // Force crossfade
                    window.djAesthetic._crossfadeNow(); 
                    
                    // Drain exergy penalty for manual interaction
                    systemExergy = Math.max(0, systemExergy - 5);
                }
                document.body.classList.remove('vault-open');
            });

            vaultContainer.appendChild(el);
        });
    }

    // 3. TELEMETRY SYNC LOOP
    function updateTelemetry() {
        if (window.djAesthetic) {
            // Update BPM text
            if (hudBpm) {
                const bpmVal = window.djAesthetic.masterBPM || 125.0;
                hudBpm.innerText = bpmVal.toFixed(1);
            }

            // Update Phase text
            if (hudPhase) {
                hudPhase.innerText = (window.djAesthetic.energyPhase || 'WARMUP').toUpperCase();
            }

            // Update EXERGY (Thermodynamics Ω2)
            if (hudExergy) {
                // Slower drain based on phase
                const drainRate = window.djAesthetic.energyPhase === 'PEAK' ? 0.005 : 0.001;
                systemExergy = Math.max(0, systemExergy - drainRate);
                hudExergy.innerText = systemExergy.toFixed(2) + 'T';
                if (systemExergy < 30) hudExergy.style.color = '#ef4444';
                else hudExergy.style.color = '#2B3BE5';
            }

            // Update Playlyzer / Styleyzer on track change
            const currentTrackData = window.djAesthetic.mixSequence[0];
            if (currentTrackData !== lastTrackId) {
                lastTrackId = currentTrackData;
                const work = window.DATA?.works?.find(w => w.id === currentTrackData);
                if (work && playGenre) {
                     const isExp = work.categories.includes('experimental');
                     const isTech = work.categories.includes('techno');
                     let genreStr = 'HYBRID';
                     if (isExp) genreStr = 'EXPERIMENTAL';
                     if (isTech) genreStr = 'TECHNO';
                     playGenre.innerText = `GENRE: ${genreStr}`;
                     
                     const styleNoise = document.querySelector('#styleyzer .lyzer-data span:last-child');
                     if (styleNoise) styleNoise.innerText = `NOISE: ${Math.floor(Math.random() * 40) + 10}%`;
                }
            }

            // Draw fake VU meter for aesthetic
            if (vuCtx) {
                vuCtx.clearRect(0, 0, 100, 20);
                
                let vol = 1.0;
                if (window.djAesthetic.globalMuted) vol = 0.1;
                
                const bars = 10;
                const barWidth = 8;
                const gap = 2;
                
                const activeBars = Math.floor((Math.random() * 0.4 + 0.6) * bars * vol);
                
                for (let i = 0; i < bars; i++) {
                    vuCtx.fillStyle = i < activeBars ? '#2B3BE5' : 'rgba(43, 59, 229, 0.2)';
                    if (i > bars * 0.8 && i < activeBars) {
                        vuCtx.fillStyle = '#D4620A'; // Red Peak
                    }
                    vuCtx.fillRect(i * (barWidth + gap), 2, barWidth, 16);
                }
            }
        }
        
        requestAnimationFrame(updateTelemetry);
    }
    
        // Start telemetry loop
    updateTelemetry();
    
    // 4. MUTE BINDING
    const hudGlobalMute = document.getElementById('hud-global-mute');
    if (hudGlobalMute) {
        hudGlobalMute.addEventListener('click', () => {
            if (window.djAesthetic) {
                window.djAesthetic.toggleGlobalMute();
                hudGlobalMute.innerText = window.djAesthetic.globalMuted ? '[ AUDIO MUTE ]' : '[ AUDIO ON ]';
            }
        });
    }
});
