// RITUAL ENGINE v8.5 — SOVEREIGN MASTER EDITION (x10000)
// 1. BOOT SEQUENCE PRELOADER WITH SOUND EFFECTS
// 2. SOVEREIGN SOUND ENGINE (WEBAUDIO DELAY + GENERATIVE BACKING DRONE)
// 3. OGL WEBGL SHADER BACKGROUND (FLOW FIELD NOISE WAVEFORM)
// 4. GSAP SCROLL REVEALS & ELASTIC TRANSLATIONS
// 5. MOLTBOOK TEXT SLIDER
// 6. INTERACTIVE TERMINAL ENGINE
// 7. MAGNETIC GLOW LOOPS & SMOOTH CLOCKS
// 8. ACCURATE LAG-CURSOR

// =====================================================================
// SOVEREIGN SOUND ENGINE
// =====================================================================
class SovereignSoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.compressor = null;
        this.delay = null;
        this.delayFeedback = null;
        this.enabled = false;
        
        // Background Drone Nodes
        this.droneOsc1 = null;
        this.droneOsc2 = null;
        this.droneGain = null;
        this.droneFilter = null;
        
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

        // Pipeline Setup
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.enabled ? 0.30 : 0.0001;

        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -12;
        this.compressor.knee.value = 8;
        this.compressor.ratio.value = 4;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.15;

        // Warm Delay Effect
        this.delay = this.ctx.createDelay(1.0);
        this.delay.delayTime.value = 0.28; // Warm echoplex timing
        this.delayFeedback = this.ctx.createGain();
        this.delayFeedback.gain.value = 0.35; // Soft feedback loop

        // Connect Delay
        this.delay.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delay);

        // Routing: masterGain -> compressor -> destination
        this.masterGain.connect(this.compressor).connect(this.ctx.destination);

        // Start Ambient Backing Drone
        this.initAmbientDrone();
    }

    initAmbientDrone() {
        this.droneOsc1 = this.ctx.createOscillator();
        this.droneOsc2 = this.ctx.createOscillator();
        this.droneGain = this.ctx.createGain();
        this.droneFilter = this.ctx.createBiquadFilter();

        this.droneOsc1.type = 'sawtooth';
        this.droneOsc1.frequency.value = 55; // Low A1

        this.droneOsc2.type = 'triangle';
        this.droneOsc2.frequency.value = 55.4; // Slightly detuned for rich chorus

        this.droneFilter.type = 'lowpass';
        this.droneFilter.frequency.value = 140; // Soft low hum
        this.droneFilter.Q.value = 3;

        this.droneGain.gain.value = this.enabled ? 0.08 : 0.0001;

        this.droneOsc1.connect(this.droneFilter);
        this.droneOsc2.connect(this.droneFilter);
        this.droneFilter.connect(this.droneGain).connect(this.masterGain);

        this.droneOsc1.start();
        this.droneOsc2.start();
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
        
        // Crossfade Master
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.linearRampToValueAtTime(this.enabled ? 0.30 : 0.0001, now + 0.3);

        // Fade Drone
        if (this.droneGain) {
            this.droneGain.gain.cancelScheduledValues(now);
            this.droneGain.gain.linearRampToValueAtTime(this.enabled ? 0.08 : 0.0001, now + 0.5);
        }

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

    signalTick(freq = 1400, dur = 0.05, peak = 0.12) {
        if (!this.enabled || !this.ctx) return;
        const now = performance.now();
        if (now - this.lastTickAt < 25) return;
        this.lastTickAt = now;

        const t = this._now();
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        this._envelope(g, t, peak, 0.003, dur);
        
        osc.connect(g).connect(this.masterGain);
        
        // Feed into delay
        if (this.delay) g.connect(this.delay);

        osc.start(t);
        osc.stop(t + dur + 0.1);
    }

    cardHover() {
        if (!this.enabled || !this.ctx) return;
        this.signalTick(1600, 0.07, 0.1);
        setTimeout(() => this.signalTick(2400, 0.05, 0.06), 25);
    }

    pulseClick() {
        if (!this.enabled || !this.ctx) return;
        const t = this._now();

        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);

        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1000;
        lp.Q.value = 5;

        const g = this.ctx.createGain();
        this._envelope(g, t, 0.25, 0.004, 0.2);

        osc.connect(lp).connect(g).connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.22);

        const air = this._noise(0.08);
        const airHP = this.ctx.createBiquadFilter();
        airHP.type = 'highpass';
        airHP.frequency.value = 2200;
        const airG = this.ctx.createGain();
        this._envelope(airG, t, 0.08, 0.002, 0.08);
        air.connect(airHP).connect(airG).connect(this.masterGain);
        air.start(t);
        air.stop(t + 0.1);
    }

    spectrometerOn(scale = 1) {
        if (!this.enabled || !this.ctx) return;
        const t = this._now();
        const dur = 0.5 * scale;

        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 82.4; // Low E2

        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.Q.value = 10;
        lp.frequency.setValueAtTime(150, t);
        lp.frequency.exponentialRampToValueAtTime(4500, t + dur);

        const g = this.ctx.createGain();
        this._envelope(g, t, 0.12 * scale, 0.03, dur);

        osc.connect(lp).connect(g).connect(this.masterGain);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }

    spectrometerOff(scale = 1) {
        if (!this.enabled || !this.ctx) return;
        const t = this._now();
        const dur = 0.4 * scale;

        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 82.4;

        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.Q.value = 8;
        lp.frequency.setValueAtTime(4000, t);
        lp.frequency.exponentialRampToValueAtTime(150, t + dur);

        const g = this.ctx.createGain();
        this._envelope(g, t, 0.09 * scale, 0.02, dur);

        osc.connect(lp).connect(g).connect(this.masterGain);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }

    terminalOpen() {
        if (!this.enabled || !this.ctx) return;
        const t = this._now();

        const air = this._noise(0.22);
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1200;
        bp.Q.value = 1.0;
        const airG = this.ctx.createGain();
        this._envelope(airG, t, 0.15, 0.004, 0.22);
        air.connect(bp).connect(airG).connect(this.masterGain);
        air.start(t);
        air.stop(t + 0.25);
    }

    terminalClose() {
        if (!this.enabled || !this.ctx) return;
        const t = this._now();

        const air = this._noise(0.1);
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2000;
        const g = this.ctx.createGain();
        this._envelope(g, t, 0.1, 0.002, 0.1);
        air.connect(lp).connect(g).connect(this.masterGain);
        air.start(t);
        air.stop(t + 0.12);
    }

    logLine() {
        if (!this.enabled || !this.ctx) return;
        const t = this._now();
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 2200;
        const g = this.ctx.createGain();
        this._envelope(g, t, 0.05, 0.001, 0.015);
        osc.connect(g).connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.03);
    }

    updateDroneFrequency(scrollVal) {
        if (!this.enabled || !this.ctx || !this.droneFilter) return;
        const targetFreq = Math.min(140 + scrollVal * 0.15, 450);
        this.droneFilter.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
    }
}

// =====================================================================
// SOVEREIGN CORE ENGINE
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
                }, 450);
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

            // Simplex Noise algorithm
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v){
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0) ) + i.x + vec3(0.0, i1.x, 1.0) );
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 a0 = x - floor(x + 0.5);
                vec3 idx = h - floor(h + 0.5);
                vec3 g = idx * x12.xzxz + h * x12.yjyj;
                g += a0 * vec3(x0.y, x12.yw);
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 st = gl_FragCoord.xy / uResolution.xy;
                
                // Colors
                vec3 colorYInMn = vec3(0.117, 0.184, 0.835); // Sovereign YInMn Blue
                vec3 colorMagenta = vec3(0.83, 0.0, 0.33); // Chromium Magenta
                vec3 colorBase = vec3(0.011, 0.011, 0.015); // Obsidian Base

                // Vector Flow Field calculations
                vec2 flowUv = st * 3.0 + vec2(uTime * 0.06, uScroll * 0.0003);
                float noiseVal = snoise(flowUv);

                if (uSpectrometer > 0.5) {
                    st.x += noiseVal * 0.012;
                    colorYInMn.r += 0.35;
                }

                float dist = distance(st, uMouse);
                float glow = smoothstep(0.4, 0.0, dist);

                vec3 mixedWave = mix(colorBase, colorYInMn, 0.045 + noiseVal * 0.035 + uScroll * 0.00008);

                if (uSpectrometer > 0.5) {
                    mixedWave = mix(mixedWave, colorMagenta, 0.09 * sin(uTime * 1.5 + noiseVal));
                }

                mixedWave += glow * 0.04;
                gl_FragColor = vec4(mixedWave, 1.0);
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
            const scrollVal = window.scrollY;
            this.program.uniforms.uScroll.value = scrollVal;
            
            // Soft Drone modulation on scroll
            this.sound.updateDroneFrequency(scrollVal);

            const header = document.getElementById('site-header');
            if (scrollVal > 50) {
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

    // 3. LAG CUSTOM CURSOR
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
            ringX += (mouseX - ringX) * 0.12; // Increased lag for a premium heavy feel
            ringY += (mouseY - ringY) * 0.12;
            
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

    // 4. GSAP SCROLL REVEALS & ELASTIC TRANSLATIONS
    initGSAPAnimations() {
        gsap.registerPlugin(ScrollTrigger);

        // Smooth translation transitions
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.fromTo(title, 
                { opacity: 0.1, y: 70 },
                { 
                    opacity: 1, y: 0, duration: 1.4, ease: "power4.out",
                    scrollTrigger: {
                        trigger: title,
                        start: "top bottom-=100",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // Trigger chart visualizer reveal
        ScrollTrigger.create({
            trigger: '.genre-chart',
            start: "top bottom-=100",
            onEnter: () => {
                document.querySelectorAll('.genre-bar').forEach(el => el.classList.add('visible'));
                document.querySelector('.valence-meter')?.classList.add('visible');
            }
        });
    }

    // 5. MOLTBOOK TEXT SLIDER
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

            this.sound.signalTick(1300 - activeIdx * 120, 0.06, 0.1);
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

    // 6. INTERACTIVE TERMINAL ENGINE
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
                this.addLogLine("hardware: Direct-Silicon JIT synthesis active.");
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
                    "audio: warm echoplex delay loop synchronized.",
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

        if (termLog.children.length > 20) {
            termLog.removeChild(termLog.lastChild);
        }
        this.sound.logLine();
    }

    // 7. MAGNETIC GLOW LOOPS & SMOOTH CLOCKS
    initUIListeners() {
        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            const halo = btn.querySelector('.connect-btn__halo');
            
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                halo.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(30, 47, 213, 0.28) 0%, transparent 70%)`;
                
                // Magnetic structural shift
                const shiftX = (x - rect.width / 2) * 0.25;
                const shiftY = (y - rect.height / 2) * 0.25;
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
