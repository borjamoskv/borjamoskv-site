// BEAST ENGINE v10.0 — ZERO TEXT / MAX EXERGY
class MoskvSovereignEngine {
    constructor() {
        this.spectrometerBtn = document.getElementById('toggle-spectrometer');
        this.customCursor = document.getElementById('custom-cursor');
        this.mouse = { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, vX: 0, vY: 0 };
        this.spectrometerActive = false;
        
        this.states = ["IDLE", "THINKING", "BREACH"];
        this.currentState = "IDLE";
        
        this.initGSAP();
        this.initWebGL();
        this.initSpectrometer();
        this.initCursor();
        this.initAudio();
        this.initTelemetry();
    }

    initTelemetry() {
        setInterval(() => {
            const r = Math.random();
            if (r > 0.95) this.currentState = "BREACH";
            else if (r > 0.8) this.currentState = "THINKING";
            else this.currentState = "IDLE";
            this.syncState();
        }, 3000);
    }

    syncState() {
        if (!this.program) return;
        const stateIdx = this.states.indexOf(this.currentState);
        gsap.to(this.program.uniforms.uState, { value: stateIdx, duration: 0.2, ease: "none" });

        if (this.currentState === "BREACH") {
            this.glitchFlash();
            if (this.industrialGain) gsap.to(this.industrialGain.gain, { value: 0.8, duration: 0.1 });
        } else {
            if (this.industrialGain) gsap.to(this.industrialGain.gain, { value: 0, duration: 1.0 });
        }
    }

    glitchFlash() {
        gsap.to(document.body, { filter: 'invert(1) contrast(2)', duration: 0.05, yoyo: true, repeat: 5 });
    }

    initSpectrometer() {
        this.spectrometerBtn.addEventListener('click', () => {
            this.spectrometerActive = !this.spectrometerActive;
            gsap.to(this.program.uniforms.uSpectrometer, { value: this.spectrometerActive ? 1.0 : 0.0, duration: 0.3 });
            if (this.noiseGain) gsap.to(this.noiseGain.gain, { value: this.spectrometerActive ? 0.1 : 0, duration: 0.3 });
        });
    }

    initWebGL() {
        const canvas = document.getElementById('gl-canvas');
        const { Renderer, Program, Mesh, Triangle } = ogl;
        const renderer = new Renderer({ canvas, dpr: 2 });
        const gl = renderer.gl;

        const fragment = `
            precision highp float;
            uniform float uTime;
            uniform vec2 uMouse;
            uniform float uVelocity;
            uniform vec2 uResolution;
            uniform float uSpectrometer;
            uniform float uState;
            varying vec2 vUv;

            float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }

            void main() {
                vec2 uv = gl_FragCoord.xy / uResolution.xy;
                
                // CHROMATIC DISPLACEMENT
                float shift = 0.01 * (uVelocity * 10.0 + uState * 5.0);
                if (uState > 1.5) shift += rand(vec2(uTime)) * 0.1; // BREACH GLITCH

                float r = texture2D(uTime > 0.0 ? vec4(0.0).xy : uv + vec2(shift, 0.0), uv + vec2(shift, 0.0)).r;
                float g = texture2D(uTime > 0.0 ? vec4(0.0).xy : uv, uv).g;
                float b = texture2D(uTime > 0.0 ? vec4(0.0).xy : uv - vec2(shift, 0.0), uv - vec2(shift, 0.0)).b;

                // Manual color reconstruction since we don't have textures, we use the Triad Logic
                vec3 colorBlue = vec3(0.0, 0.33, 1.0);
                vec3 colorMagenta = vec3(0.83, 0.0, 0.33);
                vec3 colorWhite = vec3(1.0, 1.0, 1.0);

                float dist = distance(uv, uMouse);
                float ripple = sin(dist * 30.0 - uTime * 10.0) * 0.02 * uVelocity;
                vec2 uvDist = uv + ripple;

                vec3 base = colorWhite;
                float mask = smoothstep(0.5, 0.0, dist);
                
                // BEAST CHROMATIC ABERRATION (Simulated via offset mask)
                float mR = smoothstep(0.5, 0.0, distance(uvDist + vec2(shift, 0.0), uMouse));
                float mG = smoothstep(0.5, 0.0, distance(uvDist, uMouse));
                float mB = smoothstep(0.5, 0.0, distance(uvDist - vec2(shift, 0.0), uMouse));

                vec3 final = mix(base, colorMagenta, mR * 0.2);
                final = mix(final, colorBlue, mB * 0.2);
                
                if (uSpectrometer > 0.1) {
                    float grid = step(0.95, fract(uvDist.x * 50.0)) + step(0.95, fract(uvDist.y * 50.0));
                    final = mix(final, colorMagenta, grid * 0.5);
                }

                if (uState > 1.5) final = mix(final, vec3(1.0, 0.0, 0.0), rand(uv + uTime) * 0.3);

                gl_FragColor = vec4(final + rand(uv + uTime)*0.03, 1.0);
            }
        `;

        this.program = new Program(gl, {
            vertex: `attribute vec2 position; attribute vec2 uv; varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 0, 1); }`,
            fragment,
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: [0.5, 0.5] },
                uVelocity: { value: 0 },
                uResolution: { value: [window.innerWidth, window.innerHeight] },
                uSpectrometer: { value: 0 },
                uState: { value: 0 }
            }
        });

        const mesh = new Mesh(gl, { geometry: new Triangle(gl), program: this.program });
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            this.program.uniforms.uResolution.value = [window.innerWidth, window.innerHeight];
        });
        renderer.setSize(window.innerWidth, window.innerHeight);

        window.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = 1.0 - (e.clientY / window.innerHeight);
            const vel = Math.min(Math.abs(x - this.mouse.x) + Math.abs(y - this.mouse.y), 0.2);
            gsap.to(this.program.uniforms.uMouse.value, { 0: x, 1: y, duration: 0.2 });
            gsap.to(this.program.uniforms.uVelocity, { value: vel, duration: 0.1 });
            this.mouse.x = x; this.mouse.y = y;
        });

        const update = (t) => {
            requestAnimationFrame(update);
            this.program.uniforms.uTime.value = t * 0.001;
            renderer.render({ scene: mesh });
        };
        requestAnimationFrame(update);
    }

    initGSAP() {
        gsap.registerPlugin(ScrollTrigger);
        const container = document.querySelector(".horizontal-container");
        const sections = gsap.utils.toArray('section');
        gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: container,
                pin: true,
                scrub: 0.5,
                end: () => "+=" + container.offsetWidth
            }
        });
    }

    initCursor() {
        window.addEventListener('mousemove', (e) => {
            gsap.to(this.customCursor, { x: e.clientX - 10, y: e.clientY - 10, duration: 0.05 });
        });
    }

    initAudio() {
        const start = async () => {
            if (this.audioCtx) return;
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // MASTER COMPRESSOR / LIMITER
            const limiter = this.audioCtx.createDynamicsCompressor();
            limiter.threshold.setValueAtTime(-10, this.audioCtx.currentTime);
            limiter.knee.setValueAtTime(40, this.audioCtx.currentTime);
            limiter.ratio.setValueAtTime(12, this.audioCtx.currentTime);
            limiter.attack.setValueAtTime(0, this.audioCtx.currentTime);
            limiter.release.setValueAtTime(0.25, this.audioCtx.currentTime);
            limiter.connect(this.audioCtx.destination);

            // DISTORTION NODE
            const distortion = this.audioCtx.createWaveShaper();
            distortion.curve = this.makeDistortionCurve(400);
            distortion.oversampling = '4x';
            distortion.connect(limiter);

            // AMBIENCE
            this.ambience = this.audioCtx.createOscillator();
            this.ambienceGain = this.audioCtx.createGain();
            this.ambience.type = 'sawtooth';
            this.ambience.frequency.setValueAtTime(40, this.audioCtx.currentTime);
            this.ambienceGain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
            this.ambience.connect(this.ambienceGain).connect(distortion);
            this.ambience.start();

            // DATA NOISE
            this.noiseGain = this.audioCtx.createGain();
            this.noiseGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
            const buf = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate, this.audioCtx.sampleRate);
            const d = buf.getChannelData(0);
            for(let i=0; i<buf.length; i++) d[i] = Math.random()*2-1;
            const n = this.audioCtx.createBufferSource();
            n.buffer = buf; n.loop = true; n.connect(this.noiseGain).connect(distortion);
            n.start();

            // BREACH LOOP
            try {
                const r = await fetch('assets/audio/breach_loop.wav');
                const ab = await r.arrayBuffer();
                const loop = await this.audioCtx.decodeAudioData(ab);
                this.industrialGain = this.audioCtx.createGain();
                this.industrialGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
                this.industrialGain.connect(limiter);
                const s = this.audioCtx.createBufferSource();
                s.buffer = loop; s.loop = true; s.connect(this.industrialGain);
                s.start();
            } catch(e) {}
        };
        window.addEventListener('click', start);
    }

    makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }
}
document.addEventListener('DOMContentLoaded', () => { new MoskvSovereignEngine(); });
