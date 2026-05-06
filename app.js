// RITUAL ENGINE v8.2 — SOVEREIGN SCIENTIFIC EDITION
// 1. BOOT SEQUENCE PRELOADER
// 2. SOVEREIGN SOUND ENGINE (WEBAUDIO PROGRAMMATIC SYNTH)
// 3. OGL WEBGL BACKGROUND ENGINE (WITH SHADER SPECTROMETER MODE)
// 4. GSAP SCROLL REVEALS
// 5. MOLTBOOK SLIDER
// 6. TERMINAL OVERLAY LOGS
// 7. MAGNETIC CONNECT BUTTONS & FOOTER CLOCK
// 8. INTERACTIVE CUSTOM CURSOR

// =====================================================================
// SOVEREIGN SOUND ENGINE (WebAudio Synthesizer)
// =====================================================================
class SovereignSoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.compressor = null;
        this.enabled = false;
        this.lastTickAt = 0;

        this.btn = document.getElementById('toggle-sound');

        try {
            this.enabled = localStorage.getItem('sovereign_sound') === 'on';
        } catch (_) {}

        this.updateBtn();

        if (this.btn) {
            this.btn.addEventListener('click', () => this.toggle());
        }
    }

    ensureContext() {
        if (this.ctx) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;

        this.ctx = new AC();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.enabled ? 0.35 : 0.0001;

        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -14;
        this.compressor.knee.value = 10;
        this.compressor.ratio.value = 6;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.12;

        this.masterGain.connect(this.compressor).connect(this.ctx.destination);
    }

    async toggle() {
        this.ensureContext();
        if (!this.ctx) return;

        if (this.ctx.state === 'suspended') {
            try { await this.ctx.resume(); } catch (_) {}
        }

        this.enabled = !this.enabled;
        try { localStorage.setItem('sovereign_sound', this.enabled ? 'on' : 'off'); } catch (_) {}

        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(
            this.enabled ? 0.35 : 0.0001,
            now + 0.25
        );

        this.updateBtn();

        if (this.enabled) this.spectrometerOn(0.7);
        else              this.spectrometerOff(0.5);
    }

    updateBtn() {
        if (this.btn) {
            this.btn.innerText = this.enabled ? "ON" : "OFF";
            this.btn.classList.toggle('active', this.enabled);
        }
    }

    _now() { return this.ctx ? this.ctx.currentTime : 0; }

    _envelope(gainNode, t0, peak, attack, release) {
        gainNode.gain.cancelScheduledValues(t0);
        gainNode.gain.setValueAtTime(0.0001, t0);
        gainNode.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + attack);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + release);
    }

    _noise(duration) {
        const sr = this.ctx.sampleRate;
        const len = Math.max(1, Math.floor(sr * duration));
        const buffer = this.ctx.createBuffer(1, len, sr);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        return src;
    }

    signalTick(freq = 1400, dur = 0.04, peak = 0.14) {
        if (!this.enabled || !this.ctx) return;
        const now = performance.now();
        if (now - this.lastTickAt < 28) return;
        this.lastTickAt = now;

        const t = this._now();
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        this._envelope(g, t, peak, 0.004, dur);
        osc.connect(g).connect(this.masterGain);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }

    cardHover() {
        if (!this.enabled || !this.ctx) return;
        this.signalTick(1500, 0.06, 0.12);
        setTimeout(() => this.signalTick(2250, 0.045, 0.08), 32);
    }

    pulseClick() {
        if (!this.enabled || !this.ctx) return;
        const t = this._now();

        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.14);

        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1200;
        lp.Q.value = 4;

        const g = this.ctx.createGain();
        this._envelope(g, t, 0.22, 0.005, 0.18);

        osc.connect(lp).connect(g).connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.22);

        const air = this._noise(0.06);
        const airHP = this.ctx.createBiquadFilter();
        airHP.type = 'highpass';
        airHP.frequency.value = 1800;
        const airG = this.ctx.createGain();
        this._envelope(airG, t, 0.10, 0.002, 0.06);
        air.connect(airHP).connect(airG).connect(this.masterGain);
        air.start(t);
        air.stop(t + 0.08);
    }

    spectrometerOn(scale = 1) {
        if (!this.enabled || !this.ctx) return;
        const t = this._now();
        const dur = 0.45 * scale;

        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 110;

        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.Q.value = 9;
        lp.frequency.setValueAtTime(180, t);
        lp.frequency.exponentialRampToValueAtTime(4200, t + dur);

        const g = this.ctx.createGain();
        this._envelope(g, t, 0.13 * scale, 0.04, dur);

        osc.connect(lp).connect(g).connect(this.masterGain);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }

    spectrometerOff(scale = 1) {
        if (!this.enabled || !this.ctx) return;
        const t = this._now();
        const dur = 0.38 * scale;

        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 110;

        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.Q.value = 7;
        lp.frequency.setValueAtTime(4000, t);
        lp.frequency.exponentialRampToValueAtTime(200, t + dur);

        const g = this.ctx.createGain();
        this._envelope(g, t, 0.10 * scale, 0.025, dur);

        osc.connect(lp).connect(g).connect(this.masterGain);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }

    terminalOpen() {
        if (!this.enabled || !this.ctx) return;
        const t = this._now();

        const air = this._noise(0.18);
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1400;
        bp.Q.value = 0.8;
        const airG = this.ctx.createGain();
        this._envelope(airG, t, 0.18, 0.005, 0.18);
        air.connect(bp).connect(airG).connect(this.masterGain);
        air.start(t);
        air.stop(t + 0.2);

        const drone = this.ctx.createOscillator();
        drone.type = 'triangle';
        drone.frequency.value = 60;
        const dG = this.ctx.createGain();
        dG.gain.setValueAtTime(0.0001, t);
        dG.gain.exponentialRampToValueAtTime(0.09, t + 0.4);
        dG.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
        drone.connect(dG).connect(this.masterGain);
        drone.start(t);
        drone.stop(t + 1.35);
    }

    terminalClose() {
        if (!this.enabled || !this.ctx) return;
        const t = this._now();

        const air = this._noise(0.08);
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2400;
        const g = this.ctx.createGain();
        this._envelope(g, t, 0.12, 0.002, 0.08);
        air.connect(lp).connect(g).connect(this.masterGain);
        air.start(t);
        air.stop(t + 0.1);
    }

    logLine() {
        if (!this.enabled || !this.ctx) return;
        const t = this._now();
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 2400;
        const g = this.ctx.createGain();
        this._envelope(g, t, 0.06, 0.001, 0.014);
        osc.connect(g).connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.025);
    }
}

// =====================================================================
// MAIN SITE ENGINE
// =====================================================================
class MoskvSovereignEngine {
    constructor() {
        this.sound = new SovereignSoundEngine();
        this.spectrometerBtn = document.getElementById('toggle-spectrometer');
        this.spectrometerActive = false;
        
        this.initPreloader();
        this.initWebGL();
        this.initCustomCursor();
        this.initGSAPAnimations();
        this.initMoltbookSlider();
        this.initTerminal();
        this.initUIListeners();
        this.initFooterClock();
    }

    // 1. BOOT SEQUENCE PRELOADER
    initPreloader() {
        const preloader = document.getElementById('preloader');
        const fill = document.querySelector('.preloader-fill');
        const status = document.querySelector('.preloader-status');
        const log = document.querySelector('.preloader-log');
        
        const messages = [
            "mapping file_dependencies...",
            "loading core_styles...",
            "mounting webgl_surface...",
            "initializing sound_engine...",
            "crystallizing sovereign_state..."
        ];

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 4;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                fill.style.width = `100%`;
                status.innerText = `100%`;
                setTimeout(() => {
                    preloader.classList.add('fade-out');
                    this.revealHero();
                }, 400);
            } else {
                fill.style.width = `${progress}%`;
                status.innerText = `${progress}%`;
                if (progress % 20 === 0) {
                    log.innerText = messages[Math.floor(progress / 20) - 1] || "loading...";
                }
            }
        }, 80);
    }

    revealHero() {
        document.querySelectorAll('.hero-title__line, .hero-sub, .hero-tagline, .scroll-indicator').forEach(el => {
            el.classList.add('reveal');
        });
    }

    // 2. WEBGL BACKGROUND via OGL
    initWebGL() {
        const canvas = document.getElementById('gl-canvas');
        if (!canvas) return;

        const { Renderer, Program, Mesh, Triangle } = ogl;
        const renderer = new Renderer({ canvas, dpr: 2 });
        const gl = renderer.gl;

        const vertex = `
            attribute vec2 position;
            attribute vec2 uv;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 0, 1);
            }
        `;

        const fragment = `
            precision highp float;
            uniform float uTime;
            uniform vec2 uMouse;
            uniform vec2 uResolution;
            uniform float uScroll;
            uniform float uSpectrometer;
            varying vec2 vUv;

            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            void main() {
                vec2 st = gl_FragCoord.xy / uResolution.xy;

                // Color Palette
                vec3 colorBlue = vec3(0.10, 0.23, 0.90); // YInMn Blue
                vec3 colorMagenta = vec3(0.83, 0.0, 0.33); // Chromium Magenta
                vec3 colorDark = vec3(0.02, 0.02, 0.03); // True Dark Accent

                if (uSpectrometer > 0.5) {
                    st.x += random(st.yy + uTime) * 0.005;
                    colorBlue.r += 0.4;
                }

                float noise = random(st + uTime * 0.05);
                float dist = distance(st, uMouse);
                float strength = smoothstep(0.5, 0.0, dist);

                float grain = mix(0.01, 0.12, strength) * noise;

                vec3 finalColor = mix(colorDark, colorBlue, 0.03 + uScroll * 0.0001);

                if (uSpectrometer > 0.5) {
                    finalColor = mix(finalColor, colorMagenta, 0.08 * sin(uTime));
                }

                finalColor += grain;
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        const geometry = new Triangle(gl);
        this.program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: [0.5, 0.5] },
                uResolution: { value: [window.innerWidth, window.innerHeight] },
                uScroll: { value: 0 },
                uSpectrometer: { value: 0 }
            }
        });

        const mesh = new Mesh(gl, { geometry, program: this.program });

        const resize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            this.program.uniforms.uResolution.value = [window.innerWidth, window.innerHeight];
        };
        window.addEventListener('resize', resize);
        resize();

        window.addEventListener('mousemove', (e) => {
            this.program.uniforms.uMouse.value = [e.clientX / window.innerWidth, 1.0 - (e.clientY / window.innerHeight)];
        });

        window.addEventListener('scroll', () => {
            this.program.uniforms.uScroll.value = window.scrollY;
            
            // Header scroll effect
            const header = document.getElementById('site-header');
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });

        const update = (t) => {
            requestAnimationFrame(update);
            this.program.uniforms.uTime.value = t * 0.001;
            renderer.render({ scene: mesh });
        };
        requestAnimationFrame(update);

        // Spectrometer Trigger
        if (this.spectrometerBtn) {
            this.spectrometerBtn.addEventListener('click', () => {
                this.spectrometerActive = !this.spectrometerActive;
                this.spectrometerBtn.innerText = this.spectrometerActive ? "ON" : "OFF";
                this.spectrometerBtn.classList.toggle('active', this.spectrometerActive);
                this.program.uniforms.uSpectrometer.value = this.spectrometerActive ? 1.0 : 0.0;

                this.sound.ensureContext();
                if (this.spectrometerActive) {
                    this.sound.spectrometerOn();
                } else {
                    this.sound.spectrometerOff();
                }
            });
        }
    }

    // 3. INTERACTIVE CUSTOM CURSOR
    initCustomCursor() {
        const cursor = document.getElementById('custom-cursor');
        const dot = cursor.querySelector('.cursor-dot');
        const ring = cursor.querySelector('.cursor-ring');

        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
        });

        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            
            ring.style.left = `${ringX}px`;
            ring.style.top = `${ringY}px`;
            
            requestAnimationFrame(animateRing);
        };
        animateRing();

        // Hover expansions
        document.querySelectorAll('a, button, .magnetic-btn, .glass-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hovering');
                this.sound.cardHover();
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('hovering');
            });
            el.addEventListener('click', () => {
                this.sound.pulseClick();
            });
        });
    }

    // 4. GSAP SCROLL REVEALS
    initGSAPAnimations() {
        gsap.registerPlugin(ScrollTrigger);

        // Smooth section transitions
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.fromTo(title, 
                { opacity: 0.1, y: 50 },
                { 
                    opacity: 1, y: 0, duration: 1.2, ease: "power4.out",
                    scrollTrigger: {
                        trigger: title,
                        start: "top bottom-=100",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Trigger chart animation
        ScrollTrigger.create({
            trigger: '.genre-chart',
            start: "top bottom-=100",
            onEnter: () => {
                document.querySelectorAll('.genre-bar').forEach(el => el.classList.add('visible'));
                document.querySelector('.valence-meter')?.classList.add('visible');
            }
        });
    }

    // 5. MOLTBOOK SLIDER
    initMoltbookSlider() {
        const slides = document.querySelectorAll('.molt-slide');
        const dots = document.querySelectorAll('.molt-dots .dot');
        const prevBtn = document.getElementById('molt-prev');
        const nextBtn = document.getElementById('molt-next');
        let activeIdx = 0;

        const updateSlides = (idx) => {
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));

            activeIdx = idx;
            slides[activeIdx].classList.add('active');
            dots[activeIdx].classList.add('active');

            this.sound.signalTick(1200 - activeIdx * 100, 0.05, 0.1);
        };

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                let idx = (activeIdx + 1) % slides.length;
                updateSlides(idx);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                let idx = (activeIdx - 1 + slides.length) % slides.length;
                updateSlides(idx);
            });
        }

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => updateSlides(idx));
        });
    }

    // 6. TERMINAL OVERLAY LOGS
    initTerminal() {
        const term = document.getElementById('terminal-overlay');
        const termLog = document.getElementById('terminal-log');
        const closeBtn = document.getElementById('close-term-btn');

        const toggleTerminal = () => {
            this.sound.ensureContext();
            const isOpen = term.classList.toggle('active');
            if (isOpen) {
                this.sound.terminalOpen();
                this.addLogLine("session_started: node_0x2026");
            } else {
                this.sound.terminalClose();
            }
        };

        window.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                e.preventDefault();
                toggleTerminal();
            }
            if (e.key === 'Escape' && term.classList.contains('active')) {
                toggleTerminal();
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleTerminal();
            });
        }

        // Loop periodic logs
        setInterval(() => {
            if (term.classList.contains('active')) {
                const lines = [
                    "swarm: evaluating dynamic system spectrum...",
                    "signals: exergy levels reading 98.4%",
                    "audio: programmatically synthesizing acoustic tick...",
                    "platform: system_core optimized and stable"
                ];
                this.addLogLine(lines[Math.floor(Math.random() * lines.length)]);
            }
        }, 4000);
    }

    addLogLine(text) {
        const termLog = document.getElementById('terminal-log');
        if (!termLog) return;

        const line = document.createElement('div');
        line.className = 'log-line';
        line.innerText = `${new Date().toLocaleTimeString()} // ${text}`;
        termLog.prepend(line);

        if (termLog.children.length > 18) {
            termLog.removeChild(termLog.lastChild);
        }
        this.sound.logLine();
    }

    // 7. MAGNETIC CONNECT BUTTONS & FOOTER CLOCK
    initUIListeners() {
        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            const halo = btn.querySelector('.connect-btn__halo');
            
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                halo.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(43, 59, 229, 0.25) 0%, transparent 70%)`;
                
                // Magnetic structural shift
                const shiftX = (x - rect.width / 2) * 0.2;
                const shiftY = (y - rect.height / 2) * 0.2;
                btn.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0px, 0px)';
            });
        });
    }

    initFooterClock() {
        const clock = document.getElementById('local-clock');
        if (!clock) return;

        const updateClock = () => {
            const now = new Date();
            clock.innerText = now.toLocaleTimeString();
        };
        setInterval(updateClock, 1000);
        updateClock();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MoskvSovereignEngine();
});
