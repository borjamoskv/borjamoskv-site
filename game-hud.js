/**
 * CORTEX VIDEO GAME HUD ENGINE v3.1
 * 10 Awwwards-Picasso Cycles · Frontier · Ultra Think
 * + Featured Videoclips · Visual Controls · Vowel Rotation
 * + Haptic · Arcade Cabinet · Video Game Narrative
 * ═══════════════════════════════════════════════════════════
 * NO GENERATIVE AUDIO. ONLY REAL TRACKS VIA AUTODJ.
 */

(function() {
'use strict';

let systemExergy = 100.00;
let lastTrackId = null;
let cooldownActive = false;
let bootComplete = false;

const $ = id => document.getElementById(id);
const $q = s => document.querySelector(s);

function haptic(pattern) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
}

const FEATURED_CLIPS = [
    { id: 'x8E9HInpzE4', title: 'GLITCH IN THE MIRROR' },
    { id: 'b9ktVQN48OU', title: 'LES BUKO' },
    { id: 'NYhOQTcNLkA', title: 'ECOS DEL COSMOS' },
    { id: 'EP5s0yKZUKk', title: 'VOID CASCADE' },
    { id: 'hY0G0Zxf_uo', title: '32 Y PICO' },
    { id: '4Cb-Iu8DnJM', title: 'BLAC' },
];

const VIS_MODES = [
    { id: 'none', icon: '◯', label: 'CLEAN' },
    { id: 'vis-invert', icon: '◑', label: 'INVERT' },
    { id: 'vis-halftone', icon: '▦', label: 'HALFTONE' },
    { id: 'vis-thermal', icon: '◈', label: 'THERMAL' },
    { id: 'vis-noir', icon: '■', label: 'NOIR' },
];
let currentVisMode = 0;

const VOWELS = ['I', 'O', 'A'];
let vowelIdx = 0;

document.addEventListener('DOMContentLoaded', () => {
    const pressStartBtn = $('press-start-btn');
    const gameHud = $('game-hud');
    const vaultContainer = $('vault-grid-container');
    const hudBpm = $('hud-bpm');
    const hudPhase = $('hud-phase');
    const hudExergy = $q('.dj-telemetry .hud-value.neon-blue');
    const vuCanvas = $('hud-vu-meter');
    const playGenre = $('play-genre');
    const playDensity = $('play-density');
    const playVibe = $('play-vibe');

    if (vuCanvas) { vuCanvas.width = 200; vuCanvas.height = 40; }
    const vuCtx = vuCanvas ? vuCanvas.getContext('2d') : null;

    // ═══ INJECT UI ═══

    // Arcade Cabinet Bezel
    const bezel = document.createElement('div');
    bezel.className = 'arcade-bezel';
    bezel.innerHTML = `
        <div class="bezel-top"><span>MOSKV ARCADE SYSTEM</span></div>
        <div class="bezel-left"></div>
        <div class="bezel-right"></div>
        <div class="bezel-bottom"><span>EL ARTE NO TE DEBE NADA</span></div>
    `;
    document.body.appendChild(bezel);

    // Vowel Display
    const vowelEl = document.createElement('div');
    vowelEl.className = 'vowel-display';
    vowelEl.textContent = 'I';
    document.body.appendChild(vowelEl);

    // Featured Strip
    const strip = document.createElement('div');
    strip.className = 'featured-strip';
    strip.style.display = 'none';
    FEATURED_CLIPS.forEach(clip => {
        const chip = document.createElement('button');
        chip.className = 'featured-chip';
        chip.textContent = clip.title;
        chip.addEventListener('click', () => {
            haptic([30, 50, 30]);
            if (window.djAesthetic) {
                window.djAesthetic.mixSequence.unshift(clip.id);
                window.djAesthetic._crossfadeNow && window.djAesthetic._crossfadeNow();
                systemExergy = Math.max(0, systemExergy - 5);
                _showTrackTitle(clip.title, 'FEATURED VIDEOCLIP');
                _spawnParticleBurst(window.innerWidth / 2, window.innerHeight * 0.85, 25);
            }
            strip.querySelectorAll('.featured-chip').forEach(c => c.classList.remove('active-chip'));
            chip.classList.add('active-chip');
        });
        strip.appendChild(chip);
    });
    document.body.appendChild(strip);

    // Visual Controls
    const visCtrl = document.createElement('div');
    visCtrl.className = 'visual-controls';
    visCtrl.style.display = 'none';
    VIS_MODES.forEach((mode, idx) => {
        const btn = document.createElement('button');
        btn.className = 'vis-ctrl-btn';
        btn.textContent = mode.icon;
        btn.title = mode.label;
        btn.addEventListener('click', () => {
            haptic([15]);
            VIS_MODES.forEach(m => document.body.classList.remove(m.id));
            if (mode.id !== 'none') document.body.classList.add(mode.id);
            currentVisMode = idx;
            visCtrl.querySelectorAll('.vis-ctrl-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        if (idx === 0) btn.classList.add('active');
        visCtrl.appendChild(btn);
    });
    document.body.appendChild(visCtrl);

    // Keyboard Hints
    const kbHints = document.createElement('div');
    kbHints.className = 'kb-hints';
    kbHints.textContent = '[SPACE] MUTE · [N] NEXT · [V] VAULT · [F] FILTER · [A] AGENTS';
    kbHints.style.display = 'none';
    document.body.appendChild(kbHints);

    // ═══ VOWEL ROTATION (21s) ═══
    setInterval(() => {
        vowelIdx = (vowelIdx + 1) % VOWELS.length;
        vowelEl.textContent = VOWELS[vowelIdx];
        vowelEl.classList.add('vowel-flash');
        setTimeout(() => vowelEl.classList.remove('vowel-flash'), 2000);
    }, 21000);

    // ═══ BOOT SEQUENCE ═══
    if (pressStartBtn) {
        const bootLines = [
            '> CORTEX_v7.0 ARCADE BOOT...',
            '> AUTODJ ENGINE: ARMED',
            '> EXERGY: 100.00T',
            '> VISUAL_MODES: 5 ARMED',
            '> ZERO NOISE ENFORCED',
            '> "EL ARTE NO TE DEBE NADA"',
            ''
        ];
        const bootLog = document.createElement('div');
        bootLog.className = 'boot-log';
        pressStartBtn.parentElement.insertBefore(bootLog, pressStartBtn);

        let lineIdx = 0, charIdx = 0;
        function typeBoot() {
            if (lineIdx >= bootLines.length) return;
            const line = bootLines[lineIdx];
            if (charIdx <= line.length) {
                const lines = bootLog.innerHTML.split('<br>');
                lines[lines.length - 1] = line.substring(0, charIdx + 1);
                bootLog.innerHTML = lines.join('<br>');
                charIdx++;
                setTimeout(typeBoot, 12 + Math.random() * 20);
            } else {
                bootLog.innerHTML += '<br>';
                lineIdx++; charIdx = 0;
                setTimeout(typeBoot, 150);
            }
        }
        setTimeout(typeBoot, 400);

        pressStartBtn.addEventListener('click', () => {
            haptic([50, 100, 50, 100, 50]);

            // 100% IMMERSIVE MODE (Fullscreen)
            try {
                if (!document.fullscreenElement) {
                    if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen().catch(err => console.log('Fullscreen denied:', err));
                    } else if (document.documentElement.webkitRequestFullscreen) {
                        document.documentElement.webkitRequestFullscreen();
                    }
                }
            } catch(e) {}

            const loader = $('loader');
            _spawnParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 60);

            if (typeof gsap !== 'undefined' && loader) {
                gsap.to(loader, {
                    opacity: 0, scale: 1.1, filter: 'blur(20px)',
                    duration: 1.2, ease: 'power3.in',
                    onComplete: () => loader.style.display = 'none'
                });
            } else if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 1000);
            }

            document.body.classList.add('game-mode-active');

            // Arcade bezel text update
            const bezelBottom = $q('.bezel-bottom span');
            if (bezelBottom) bezelBottom.textContent = 'SIGNAL ACTIVE — PLAYING';

            if (typeof gsap !== 'undefined') {
                gameHud.classList.remove('hidden-boot');
                const tl = gsap.timeline({ defaults: { ease: 'power3.out' }});
                tl.from('.hud-top-bar', { y: -80, opacity: 0, duration: 0.8 })
                  .from('.hud-bottom-bar', { y: 80, opacity: 0, duration: 0.8 }, '-=0.5')
                  .from('#styleyzer', { x: -300, opacity: 0, duration: 1, ease: 'power4.out' }, '-=0.6')
                  .from('#playlyzer', { x: 300, opacity: 0, duration: 1, ease: 'power4.out' }, '-=0.8')
                  .from('.hud-element', { scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.5');
            } else {
                gameHud.classList.remove('hidden-boot');
            }

            strip.style.display = 'flex';
            visCtrl.style.display = 'flex';
            kbHints.style.display = 'block';

            if (window.djAesthetic) {
                window.djAesthetic.toggleGlobalMute();
                window.djAesthetic._crossfadeNow && window.djAesthetic._crossfadeNow();
            }

            bootComplete = true;

            // Init achievement & narrative engine
            if (window.MOSKV_ARCADE) window.MOSKV_ARCADE.init();
        });
    }

    // ═══ VAULT — 3D Tilt + Haptic ═══
    if (vaultContainer && window.DATA && window.DATA.works) {
        window.DATA.works.forEach((work, index) => {
            const el = document.createElement('div');
            el.className = 'vault-item';
            el.style.backgroundImage = `url(https://i.ytimg.com/vi/${work.id}/hqdefault.jpg)`;
            const catStr = (work.categories || []).slice(0, 2).join(' · ').toUpperCase();
            el.innerHTML = `
                <div class="vault-item-title">[LVL ${index + 1}] ${work.title}</div>
                <div class="vault-item-cat">${catStr}</div>`;

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                el.style.transform = `perspective(600px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg) scale(1.05)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'perspective(600px) rotateY(0) rotateX(0) scale(1)';
            });
            el.addEventListener('touchstart', () => haptic([20]), { passive: true });

            el.addEventListener('click', () => {
                haptic([30, 50, 30]);
                if (window.djAesthetic) {
                    window.djAesthetic.mixSequence.unshift(work.id);
                    window.djAesthetic._crossfadeNow && window.djAesthetic._crossfadeNow();
                    systemExergy = Math.max(0, systemExergy - 5);
                    _showTrackTitle(work.title, catStr);
                    _spawnParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 30);
                }
                document.body.classList.remove('vault-open');
                // Achievement hooks
                if (window.MOSKV_ARCADE) {
                    window.MOSKV_ARCADE.onTrackPlayed(work.id);
                    window.MOSKV_ARCADE.onTransition();
                }
            });
            vaultContainer.appendChild(el);
        });
    }

    // ═══ WAVEFORM ═══
    function drawWaveform() {
        if (!vuCtx) return;
        const W = vuCanvas.width, H = vuCanvas.height;
        vuCtx.clearRect(0, 0, W, H);
        let dataArray = null;
        if (window.djAesthetic && window.djAesthetic.audioContext) {
            const key = window.djAesthetic.activeDeck === 'a' ? 'analyserA' : 'analyserB';
            const analyser = window.djAesthetic[key];
            if (analyser && analyser.frequencyBinCount) {
                dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);
            }
        }
        const barCount = 32, barW = W / barCount - 1;
        for (let i = 0; i < barCount; i++) {
            const val = dataArray
                ? dataArray[Math.floor(i * dataArray.length / barCount)] / 255
                : (Math.sin(Date.now() / 200 + i * 0.5) * 0.15 + 0.2);
            const barH = val * H;
            const hue = cooldownActive ? 0 : (200 + i * 5);
            vuCtx.fillStyle = `hsla(${hue}, 55%, ${55 + val * 25}%, ${0.5 + val * 0.5})`;
            vuCtx.fillRect(i * (barW + 1), H - barH, barW, barH);
        }
    }

    // ═══ COOLDOWN ═══
    function checkCooldown() {
        if (systemExergy < 30 && !cooldownActive) {
            cooldownActive = true;
            document.body.classList.add('cooldown-active');
            if (hudPhase) hudPhase.innerText = 'COOLDOWN';
            haptic([100, 200, 100]);
            const regen = setInterval(() => {
                systemExergy = Math.min(100, systemExergy + 0.05);
                if (systemExergy >= 60) {
                    cooldownActive = false;
                    document.body.classList.remove('cooldown-active');
                    clearInterval(regen);
                }
            }, 100);
        }
    }

    // ═══ CINEMATIC TITLE ═══
    let titleOverlay = document.createElement('div');
    titleOverlay.className = 'track-title-overlay';
    titleOverlay.innerHTML = '<h2 class="track-title-main"></h2><span class="track-title-sub"></span>';
    document.body.appendChild(titleOverlay);

    function _showTrackTitle(title, sub) {
        titleOverlay.querySelector('.track-title-main').textContent = title;
        titleOverlay.querySelector('.track-title-sub').textContent = sub || '';
        if (typeof gsap !== 'undefined') {
            gsap.killTweensOf(titleOverlay);
            gsap.fromTo(titleOverlay,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
            );
            gsap.to(titleOverlay, { opacity: 0, y: -20, delay: 3.5, duration: 1, ease: 'power2.in' });
        }
    }

    // ═══ PARTICLES ═══
    function _spawnParticleBurst(cx, cy, count) {
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;';
        document.body.appendChild(container);
        const colors = ['#7EB8DA', '#E8B4B8', '#A8D5BA', '#2B3BE5', '#D4620A', '#fff'];
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const dist = 80 + Math.random() * 250;
            const size = 2 + Math.random() * 5;
            p.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;background:${colors[i % colors.length]};border-radius:50%;`;
            container.appendChild(p);
            if (typeof gsap !== 'undefined') {
                gsap.to(p, {
                    x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
                    opacity: 0, scale: 0,
                    duration: 0.6 + Math.random() * 0.8,
                    ease: 'power3.out', delay: Math.random() * 0.15
                });
            }
        }
        setTimeout(() => container.remove(), 2000);
    }

    // ═══ KEYBOARD ═══
    document.addEventListener('keydown', (e) => {
        if (!bootComplete) {
            if (pressStartBtn && !['F12','F5','F11'].includes(e.key)) pressStartBtn.click();
            return;
        }
        switch(e.key.toLowerCase()) {
            case ' ': case 'p':
                if (window.djAesthetic) window.djAesthetic.toggleGlobalMute();
                const muteBtn = $('hud-global-mute');
                if (muteBtn) muteBtn.innerText = window.djAesthetic?.globalMuted ? '[ MUTE ]' : '[ LIVE ]';
                haptic([20]); e.preventDefault(); break;
            case 'n': case 'arrowright': case 'd':
                if (window.djAesthetic?._crossfadeNow) {
                    window.djAesthetic._crossfadeNow();
                    systemExergy = Math.max(0, systemExergy - 3);
                    _spawnParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 20);
                    haptic([30]);
                } break;
            case 'v': case 'arrowup': case 'w':
                document.body.classList.toggle('vault-open'); haptic([15]);
                if (window.MOSKV_ARCADE) window.MOSKV_ARCADE.onVaultOpened();
                break;
            case 'escape':
                document.body.classList.remove('vault-open'); break;
            case 'f':
                currentVisMode = (currentVisMode + 1) % VIS_MODES.length;
                VIS_MODES.forEach(m => document.body.classList.remove(m.id));
                if (VIS_MODES[currentVisMode].id !== 'none') document.body.classList.add(VIS_MODES[currentVisMode].id);
                visCtrl.querySelectorAll('.vis-ctrl-btn').forEach((b, i) => b.classList.toggle('active', i === currentVisMode));
                haptic([15, 30]);
                if (window.MOSKV_ARCADE) window.MOSKV_ARCADE.onFilterUsed();
                break;
            case 'a':
                if (window.CORTEX_SWARM_UI) window.CORTEX_SWARM_UI.toggle();
                haptic([20, 40, 20]); break;
        }
    });

    // ═══ TELEMETRY (30fps) ═══
    let lastFrame = 0;
    function updateTelemetry(timestamp) {
        if (timestamp - lastFrame < 33) { requestAnimationFrame(updateTelemetry); return; }
        lastFrame = timestamp;
        if (window.djAesthetic) {
            if (hudBpm) hudBpm.innerText = (window.djAesthetic.masterBPM || 125.0).toFixed(1);
            if (hudPhase && !cooldownActive) hudPhase.innerText = (window.djAesthetic.energyPhase || 'WARMUP').toUpperCase();
            if (hudExergy) {
                const drain = window.djAesthetic.energyPhase === 'PEAK' ? 0.008 : 0.002;
                if (!cooldownActive) systemExergy = Math.max(0, systemExergy - drain);
                hudExergy.innerText = systemExergy.toFixed(1) + 'T';
                hudExergy.style.color = systemExergy < 30 ? '#ef4444' : '#2B3BE5';
                checkCooldown();
            }
            const currentTrack = window.djAesthetic.currentTrackId || window.djAesthetic.mixSequence?.[0];
            if (currentTrack && currentTrack !== lastTrackId) {
                lastTrackId = currentTrack;
                const work = window.DATA?.works?.find(w => w.id === currentTrack);
                if (work) {
                    if (playGenre) playGenre.innerText = `GENRE: ${((work.categories||[]).find(c => !['original','4k','8k'].includes(c)) || 'HYBRID').toUpperCase()}`;
                    if (playDensity) playDensity.innerText = `DENSITY: ${(work.categories||[]).length} VECTORS`;
                    if (playVibe) playVibe.innerText = `TRACK: ${work.title}`;
                    const sn = $q('#styleyzer .lyzer-data span:last-child');
                    if (sn) sn.innerText = `ENTROPY: ${(Math.random() * 0.4 + 0.1).toFixed(3)} nats`;
                    _showTrackTitle(work.title, (work.categories||[]).slice(0, 2).join(' · ').toUpperCase());
                    // Achievement: track played
                    if (window.MOSKV_ARCADE) window.MOSKV_ARCADE.onTrackPlayed(currentTrack);
                }
            }
            drawWaveform();
        }
        requestAnimationFrame(updateTelemetry);
    }
    requestAnimationFrame(updateTelemetry);

    // ═══ MUTE ═══
    const hudGlobalMute = $('hud-global-mute');
    if (hudGlobalMute) {
        hudGlobalMute.addEventListener('click', () => {
            haptic([20]);
            if (window.djAesthetic) {
                window.djAesthetic.toggleGlobalMute();
                hudGlobalMute.innerText = window.djAesthetic.globalMuted ? '[ MUTE ]' : '[ LIVE ]';
            }
        });
    }

    if (gameHud) {
        gameHud.style.willChange = 'opacity, transform';
        setTimeout(() => { gameHud.style.willChange = 'auto'; }, 3000);
    }
});
})();
