/* ═══════════════════════════════════════════
   BORJAMOSKV.COM — SOVEREIGN ENGINE 2026
   WebGL (OGL) + GSAP ScrollTrigger
   ═══════════════════════════════════════════ */

class MoskvSovereignEngine {
    constructor() {
        this.initCursor();
        this.initWebGL();
        this.initReveals();
        this.handleHeader();
        this.handleCounters();
        this.handleMagneticButtons();
        this.initSwarmVisualizer();
        this.initSiliconTelemetry();
        
        // Empezar Boot Sequence
        this.initPreloader();
    }

    // ─── CUSTOM CURSOR ───
    initCursor() {
        const cursor = document.getElementById('custom-cursor');
        const dot = cursor?.querySelector('.cursor-dot');
        const ring = cursor?.querySelector('.cursor-ring');

        if (!cursor) return;

        window.addEventListener('mousemove', (e) => {
            gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.1 });
            gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.3, ease: "power2.out" });
        });
    }

    // ─── PRELOADER (BOOT SEQUENCE) ───
    initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) {
            this.initGSAP();
            return;
        }

        const fill = document.getElementById('preloader-fill');
        const status = document.getElementById('preloader-status');
        const log = document.getElementById('preloader-log');

        const logs = [
            "CORTEX BOOT SEQUENCE INITIATED...",
            "INITIALIZING NEURAL PATHWAYS...",
            "LOADING MOSKVLOGIA ARCHIVE...",
            "ESTABLISHING SILICON BRIDGE...",
            "SYSTEM READY."
        ];

        let progress = { value: 0 };
        let logIndex = 0;

        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(preloader, {
                    opacity: 0,
                    duration: 1,
                    ease: "power2.inOut",
                    onComplete: () => {
                        preloader.style.display = 'none';
                        this.initGSAP(); // Iniciar animación Hero
                    }
                });
            }
        });

        tl.to(progress, {
            value: 100,
            duration: 3,
            ease: "expo.inOut",
            onUpdate: () => {
                fill.style.width = progress.value + '%';
                status.innerText = Math.floor(progress.value) + '%';
                
                // Cambiar log strings según progreso
                let newIndex = Math.floor((progress.value / 100) * (logs.length - 1));
                if (newIndex !== logIndex) {
                    logIndex = newIndex;
                    log.innerText = logs[logIndex];
                }
            }
        });
    }

    // ─── GSAP & SCROLL ───
    initGSAP() {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Reveal
        const heroTl = gsap.timeline();
        heroTl.to('.hero-title__line', { 
            opacity: 1, 
            y: 0, 
            duration: 1.8, 
            stagger: 0.2, 
            ease: "expo.out" 
        })
        .to('.hero-sub, .hero-tagline', { 
            opacity: 1, 
            y: 0, 
            duration: 1.2, 
            ease: "power2.out" 
        }, "-=1.2")
        .to('.scroll-indicator', { 
            opacity: 1, 
            duration: 1 
        }, "-=0.8");

        // Section Titles Parallax
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                scrollTrigger: {
                    trigger: title,
                    start: "top 95%",
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
        });
    }

    // ─── WEBGL SIMULATION (Real Shader via OGL) ───
    initWebGL() {
        const canvas = document.getElementById('gl-canvas');
        if (!canvas || !window.ogl) return;

        const { Renderer, Camera, Program, Mesh, Triangle } = window.ogl;
        
        const renderer = new Renderer({ canvas, dpr: window.devicePixelRatio, alpha: true });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);

        const camera = new Camera(gl);
        camera.position.z = 1;

        const geometry = new Triangle(gl);

        const vertex = `
            attribute vec2 uv;
            attribute vec2 position;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 0, 1);
            }
        `;

        const fragment = `
            precision highp float;
            uniform float uTime;
            uniform vec2 uResolution;
            varying vec2 vUv;

            // Simple noise function
            float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
            float noise(vec2 x) {
                vec2 i = floor(x);
                vec2 f = fract(x);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            void main() {
                vec2 pos = vUv * 3.0;
                float n = noise(pos + uTime * 0.2);
                n += 0.5 * noise(pos * 2.0 - uTime * 0.1);
                
                // Industrial Noir colors: very dark with subtle YinMn Blue glows
                vec3 baseColor = vec3(0.03, 0.03, 0.03);
                vec3 glowColor = vec3(0.17, 0.23, 0.9); // YinMn Blue #2B3BE5
                
                vec3 finalColor = mix(baseColor, glowColor, n * 0.18);
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: [window.innerWidth, window.innerHeight] }
            }
        });

        const mesh = new Mesh(gl, { geometry, program });

        const resize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            program.uniforms.uResolution.value = [window.innerWidth, window.innerHeight];
        };
        window.addEventListener('resize', resize, false);
        resize();

        const update = (t) => {
            requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001;
            renderer.render({ scene: mesh, camera });
        };
        requestAnimationFrame(update);
    }

    // ─── REVEAL ON SCROLL ───
    initReveals() {
        const revealElements = document.querySelectorAll('.reveal-up, .genre-bar, #valence-fill');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    
                    if (entry.target.id === 'valence-fill') {
                        entry.target.style.width = '49.8%';
                    }
                    
                    if (entry.target.classList.contains('genre-bar')) {
                        const fill = entry.target.querySelector('.genre-bar__fill');
                        if (fill) {
                            const width = fill.dataset.width || '0%';
                            fill.style.transform = \`scaleX(\${parseInt(width)/100})\`;
                        }
                    }
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => observer.observe(el));
    }

    // ─── HEADER & SCROLL UI ───
    handleHeader() {
        const header = document.querySelector('header');
        const scrollBtn = document.querySelector('.scroll-to-top');
        
        window.addEventListener('scroll', () => {
            const isScrolled = window.scrollY > 100;
            header?.classList.toggle('scrolled', isScrolled);
            scrollBtn?.classList.toggle('visible', isScrolled);
        });

        scrollBtn?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─── DATA COUNTERS ───
    handleCounters() {
        const counters = document.querySelectorAll('.stat-card__number');
        
        counters.forEach(counter => {
            const finalValue = parseInt(counter.innerText.replace(',', ''));
            counter.innerText = '0';

            ScrollTrigger.create({
                trigger: counter,
                start: "top 90%",
                onEnter: () => {
                    gsap.to(counter, {
                        innerText: finalValue,
                        duration: 2.5,
                        snap: { innerText: 1 },
                        ease: "expo.out",
                        onUpdate: function() {
                            if (finalValue > 1000) {
                                counter.innerText = Math.floor(this.targets()[0].innerText).toLocaleString();
                            }
                        }
                    });
                }
            });
        });
    }

    // ─── MAGNETIC EFFECTS ───
    handleMagneticButtons() {
        const magneticEls = document.querySelectorAll('.connect-btn, .booking-btn');
        
        magneticEls.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(el, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.4,
                    ease: "power2.out"
                });
            });
            
            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }

    // ─── SWARM VISUALIZER (60FPS OMEGA) ───
    initSwarmVisualizer() {
        const grid = document.getElementById('swarm-grid');
        if (!grid) return;

        this.agents = [];
        for (let i = 0; i < 64; i++) {
            const node = document.createElement('div');
            node.className = 'agent-node';
            node.innerHTML = \`
                <div class="agent-id">\${String(i).padStart(2, '0')}</div>
                <div class="agent-pulse"></div>
            \`;
            grid.appendChild(node);
            this.agents.push(node);
        }
    }

    // ─── SILICON TELEMETRY (C5-REAL BRIDGE) ───
    initSiliconTelemetry() {
        const oracleState = document.getElementById('oracle-state');
        const oracleHash = document.getElementById('oracle-hash');
        const verificationGate = document.getElementById('verification-gate');
        const exergyEl = document.getElementById('swarm-total-exergy');
        const entropyEl = document.getElementById('swarm-total-entropy');
        const latencyEl = document.getElementById('swarm-avg-latency');

        const connect = () => {
            const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:8000' : '';
            const eventSource = new EventSource(\`\${apiBase}/v1/events/stream\`);

            eventSource.addEventListener('silicon_telemetry', (e) => {
                const data = JSON.parse(e.data).payload;
                
                if (exergyEl) exergyEl.innerText = data.exergy_yield.toFixed(1);
                if (entropyEl) entropyEl.innerText = data.entropy_level.toFixed(1);
                if (latencyEl) latencyEl.innerText = (10 + Math.random() * 5).toFixed(1) + ' ms';

                if (oracleState) oracleState.innerText = data.state;
                if (oracleHash && data.last_notarized_hash) {
                    oracleHash.innerText = data.last_notarized_hash.substring(0, 18) + "...";
                }

                if (verificationGate) {
                    if (data.state === 'COMMITTED' || data.state === 'AUTHENTICATED') {
                        verificationGate.innerText = "GATE OPEN";
                        verificationGate.classList.add('open');
                    } else if (data.state === 'BREACH') {
                        verificationGate.innerText = "SYSTEM LOCK";
                        verificationGate.classList.remove('open');
                        verificationGate.style.color = "#ff3e3e";
                    } else {
                        verificationGate.innerText = data.state === 'THINKING' ? "THINKING..." : "GATE CLOSED";
                        verificationGate.classList.remove('open');
                        verificationGate.style.color = "";
                    }
                }

                this.agents.forEach((node, i) => {
                    const pulse = node.querySelector('.agent-pulse');
                    const individualExergy = (data.exergy_yield / 64) * (0.8 + Math.random() * 0.4);
                    const opacity = Math.min(1, individualExergy / 10);
                    
                    if (pulse) {
                        pulse.style.opacity = opacity;
                        if (data.state === 'BREACH') {
                            pulse.style.backgroundColor = 'var(--accent-red)';
                        } else {
                            pulse.style.backgroundColor = 'var(--accent-blue)';
                        }
                    }
                    node.classList.toggle('breach', data.entropy_level > 2500 && Math.random() > 0.7);
                });
            });

            eventSource.onerror = () => {
                console.warn("SSE Connection lost. Reconnecting in 5s...");
                eventSource.close();
                setTimeout(connect, 5000);
            };
        };

        // Attempt connection (will gracefully fail/retry if no backend)
        connect();
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    window.engine = new MoskvSovereignEngine();
});
