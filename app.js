/* ═══════════════════════════════════════════
   BORJAMOSKV.COM — SOVEREIGN ENGINE 2026
   WebGL (OGL) + GSAP ScrollTrigger
   ═══════════════════════════════════════════ */

class MoskvSovereignEngine {
    constructor() {
        this.initCursor();
        this.initGSAP();
        this.initWebGL();
        this.initReveals();
        this.handleHeader();
        this.handleCounters();
        this.handleMagneticButtons();
        this.initSwarmVisualizer();
        this.initSiliconTelemetry();
    }

    // ─── CUSTOM CURSOR ───
    initCursor() {
        const cursor = document.getElementById('custom-cursor');
        const dot = cursor.querySelector('.cursor-dot');
        const ring = cursor.querySelector('.cursor-ring');

        if (!cursor) return;

        window.addEventListener('mousemove', (e) => {
            gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.1 });
            gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.3, ease: "power2.out" });
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

    // ─── WEBGL SIMULATION (Tinte YInMn) ───
    initWebGL() {
        const canvas = document.getElementById('gl-canvas');
        if (!canvas) return;

        // Pulso de color soberano para el fondo
        gsap.to(canvas, {
            opacity: 0.4,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    // ─── REVEAL ON SCROLL ───
    initReveals() {
        const revealElements = document.querySelectorAll('.reveal-up, .genre-bar, #valence-fill');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    
                    // Lógica específica para elementos de datos
                    if (entry.target.id === 'valence-fill') {
                        entry.target.style.width = '49.8%';
                    }
                    
                    if (entry.target.classList.contains('genre-bar')) {
                        const fill = entry.target.querySelector('.genre-bar__fill');
                        if (fill) {
                            const width = fill.dataset.width || '0%';
                            fill.style.transform = `scaleX(${parseInt(width)/100})`;
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

        // Initialize 64 Agent Nodes
        this.agents = [];
        for (let i = 0; i < 64; i++) {
            const node = document.createElement('div');
            node.className = 'agent-node';
            node.innerHTML = `
                <div class="agent-id">${String(i).padStart(2, '0')}</div>
                <div class="agent-pulse"></div>
            `;
            grid.appendChild(node);
            this.agents.push(node);
        }

        // Live Mock Telemetry Loop (60FPS Target)
        const oracleState = document.getElementById('oracle-state');
        const oracleHash = document.getElementById('oracle-hash');
        const verificationGate = document.getElementById('verification-gate');
        
        let lastNotarization = Date.now();
        let isCrystallizing = false;

        // Removed requestAnimationFrame(updateSwarm) as we now use real telemetry triggers
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
            const eventSource = new EventSource(`${apiBase}/v1/events/stream`);

            eventSource.addEventListener('silicon_telemetry', (e) => {
                const data = JSON.parse(e.data).payload;
                
                // Update Global Stats
                if (exergyEl) exergyEl.innerText = data.exergy_yield.toFixed(1);
                if (entropyEl) entropyEl.innerText = data.entropy_level.toFixed(1);
                if (latencyEl) latencyEl.innerText = (10 + Math.random() * 5).toFixed(1) + ' ms';

                // Update Oracle UI
                if (oracleState) oracleState.innerText = data.state;
                if (oracleHash && data.last_notarized_hash) {
                    oracleHash.innerText = data.last_notarized_hash.substring(0, 18) + "...";
                }

                // Update Verification Gate
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

                // Update Swarm Nodes with real exergy modulation
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

        connect();
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    window.engine = new MoskvSovereignEngine();
});
