/**
 * CORTEX ENGINE
 * Handling Void Mirror, Scroll Entropy and Inertial Cursor.
 */

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------------------------
    // CORTEX VOID MIRROR PROTOCOL (Refined for Index)
    // ----------------------------------------------------------------------
    const initVoidMirror = () => {
        const btn = document.createElement("button");
        btn.innerHTML = "VOID_MIRROR [CORTEX]";
        btn.id = "cortexVoidMirrorBtn";
        
        // Use styled classes instead of massive inline hardcodes (or keep minimal inline if no class)
        // We'll use JS styling for absolute isolation so it doesn't break if css is missing.
        Object.assign(btn.style, {
            position: "fixed", bottom: "40px", left: "40px", zIndex: "999999",
            background: "transparent", color: "#ff003c", border: "1px solid rgba(255, 0, 60, 0.3)",
            padding: "8px 24px", fontFamily: "var(--font-mono, monospace)",
            fontWeight: "100", letterSpacing: "0.2em", cursor: "pointer", fontSize: "0.75rem",
            textTransform: "uppercase", backdropFilter: "blur(4px)",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        });
        
        btn.onmouseover = () => { 
            btn.style.border = "1px solid rgba(255, 0, 60, 0.8)";
            btn.style.textShadow = "0 0 8px rgba(255,0,60,0.5)";
            btn.style.background = "rgba(255, 0, 60, 0.05)";
        };
        btn.onmouseout = () => { 
            btn.style.border = "1px solid rgba(255, 0, 60, 0.3)";
            btn.style.textShadow = "none";
            btn.style.background = "transparent";
        };
        document.body.appendChild(btn);

        let active = false;

        btn.addEventListener("click", async () => {
            if (active) return;
            btn.innerHTML = "INITIALIZING SINGULARITY...";
            btn.style.pointerEvents = "none";
            
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 180, height: 100 } });
                active = true;
                btn.innerHTML = "MIRROR LOG ACTIVE";
                
                // 1. Audio Drone (Industrial Noir Vibe)
                const actx = new (window.AudioContext || window.webkitAudioContext)();
                if (actx.state === 'suspended') await actx.resume();
                
                const osc1 = actx.createOscillator();
                const osc2 = actx.createOscillator();
                const lfo = actx.createOscillator();
                const gain = actx.createGain();
                const filter = actx.createBiquadFilter();

                osc1.type = "sawtooth";
                osc2.type = "square";
                osc1.frequency.value = 55; // Deep sub bass
                osc2.frequency.value = 54.5; // Slight detune for phasing
                
                lfo.type = "sine";
                lfo.frequency.value = 0.2;
                const lfoGain = actx.createGain();
                lfoGain.gain.value = 400;
                lfo.connect(lfoGain);
                lfoGain.connect(filter.frequency);

                filter.type = "lowpass";
                filter.frequency.value = 200;
                filter.Q.value = 15;

                osc1.connect(filter);
                osc2.connect(filter);
                filter.connect(gain);
                gain.connect(actx.destination);
                gain.gain.value = 0;
                gain.gain.linearRampToValueAtTime(0.4, actx.currentTime + 8); // Slowly fade in

                osc1.start();
                osc2.start();
                lfo.start();

                // 2. Translucent UI Collapse (Ultrathin tension)
                document.body.style.transition = "background-color 4s, color 4s";
                document.body.style.backgroundColor = "transparent";
                document.documentElement.style.backgroundColor = "#020202";
                
                document.querySelectorAll('section, article, nav, .hero-shell, .players-grid, .video-background-system, footer, .chatquito, .drag-window').forEach(el => {
                    el.style.transition = "all 4s ease";
                    el.style.backgroundColor = "transparent";
                    el.style.backdropFilter = "blur(1px)";
                    el.style.boxShadow = "none";
                    el.style.border = "1px solid rgba(255, 0, 60, 0.1)";
                    el.style.borderRadius = "0";
                    // Also affect neon borders if present
                    if(el.classList.contains('cortex-container') || el.classList.contains('ultrathin-card')) {
                        el.style.boxShadow = "0 0 10px rgba(255,0,60,0.1), inset 0 0 20px rgba(255,0,60,0.02)";
                    }
                });
                
                document.querySelectorAll('h1, h2, h3, p, span, a').forEach(el => {
                    el.style.transition = "color 4s ease, text-shadow 4s ease";
                    el.style.fontWeight = "100";
                    el.style.color = "rgba(255, 255, 255, 0.6)";
                });

                // 3. Destructive GSAP physics
                if(window.gsap) {
                    gsap.to(".player-card, .drag-window, .mid-scroll-card, .ultrathin-card", {
                        rotationZ: () => (Math.random()-0.5) * 2,
                        y: () => (Math.random()-0.5) * 15,
                        duration: 8,
                        ease: "sine.inOut",
                        yoyo: true,
                        repeat: -1
                    });
                }

                // 4. Webcam ASCII Background - Ultrathin Edition
                const video = document.createElement("video");
                video.setAttribute("playsinline", "");
                video.setAttribute("autoplay", "");
                video.style.display = "none";
                video.srcObject = stream;

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                
                const display = document.createElement("pre");
                Object.assign(display.style, {
                    position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
                    zIndex: "-999", margin: "0", overflow: "hidden", pointerEvents: "none",
                    background: "#020202", color: "rgba(255, 0, 60, 0.5)", fontFamily: "var(--font-mono, monospace)",
                    fontSize: "8px", lineHeight: "8px", letterSpacing: "0.2em", fontWeight: "100",
                    whiteSpace: "pre", display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: "0", transition: "opacity 8s ease-in"
                });
                document.body.appendChild(display);
                
                requestAnimationFrame(() => {
                    display.style.opacity = "0.85";
                });

                // ASCII density map injected with CORTEX lore
                // ▓█ are used for dark/dense, ·- for light (inverted for dark mode)
                const chars = " ·-:=+*#%@▓█";
                const w = 180;
                const h = 100;
                canvas.width = w;
                canvas.height = h;

                const draw = () => {
                    if (video.readyState === video.HAVE_ENOUGH_DATA) {
                        ctx.save();
                        ctx.translate(w, 0);
                        ctx.scale(-1, 1); // Mirror horizontal
                        ctx.drawImage(video, 0, 0, w, h);
                        ctx.restore();
                        
                        const data = ctx.getImageData(0, 0, w, h).data;
                        let ascii = "";
                        for (let y = 0; y < h; y++) {
                            for (let x = 0; x < w; x++) {
                                const i = (y * w + x) * 4;
                                const r = data[i];
                                const g = data[i + 1];
                                const b = data[i + 2];
                                const brightness = (r + g + b) / 3;
                                const charIdx = Math.floor((brightness / 255) * (chars.length - 1));
                                ascii += chars[charIdx] || " ";
                            }
                            ascii += "\n";
                        }
                        display.innerHTML = ascii;
                    }
                    requestAnimationFrame(draw);
                };
                video.addEventListener('play', () => requestAnimationFrame(draw));

            } catch(e) {
                console.error(e);
                btn.innerHTML = "OS_DENIED";
                btn.style.borderColor = "rgba(255, 0, 0, 0.3)";
                btn.style.color = "rgba(255, 0, 0, 0.8)";
            }
        });
    };

    // ----------------------------------------------------------------------
    // CORTEX SCROLL ENTROPY ENGINE
    // ----------------------------------------------------------------------
    const initScrollEntropy = () => {
        let lastScrollY = window.scrollY;
        let skewContent = document.querySelector("body");
        let ticking = false;
        let crackOverlay = null;

        crackOverlay = document.createElement("div");
        Object.assign(crackOverlay.style, {
            position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
            pointerEvents: "none", zIndex: "999998", opacity: "0",
            background: "url('data:image/svg+xml;utf8,<svg width=\"100%\" height=\"100%\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M50,0 L60,30 L45,50 L70,80 L55,120 L80,100%\" stroke=\"%23ff003c\" fill=\"none\" stroke-width=\"2\"/></svg>')",
            backgroundSize: "cover", mixBlendMode: "difference", transition: "opacity 0.1s"
        });
        document.body.appendChild(crackOverlay);

        const updateScrollEntropy = () => {
            const currentScrollY = window.scrollY;
            const velocity = currentScrollY - lastScrollY;
            const absVelocity = Math.abs(velocity);
            
            // Limit velocity
            const clamper = Math.min(absVelocity, 150);
            
            // 1. Chromatic Aberration & Skew
            if (absVelocity > 5) {
                const skewY = velocity * -0.05; 
                const rgbSplit = clamper * 0.15;
                
                document.documentElement.style.setProperty('--scroll-skew', `${skewY}deg`);
                document.documentElement.style.filter = `drop-shadow(${rgbSplit}px 0px 0px rgba(255, 0, 60, 0.8)) drop-shadow(-${rgbSplit}px 0px 0px rgba(0, 255, 255, 0.8))`;
            } else {
                document.documentElement.style.filter = "none";
            }

            // 2. Structural Fracture
            if (absVelocity > 80) {
                crackOverlay.style.opacity = Math.min(absVelocity / 150 + 0.5, 1);
                crackOverlay.style.transform = `scale(${1 + Math.random()*0.1}) translate(${Math.random()*10 - 5}px, ${Math.random()*10 - 5}px)`;
            } else {
                crackOverlay.style.opacity = "0";
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener("scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollEntropy);
                ticking = true;
            }
        }, { passive: true });

        // Physics reset loop
        setInterval(() => {
            if (Math.abs(window.scrollY - lastScrollY) < 2) {
                document.documentElement.style.filter = "none";
                crackOverlay.style.opacity = "0";
            }
        }, 150);
    };

    // ----------------------------------------------------------------------
    // CORTEX INERTIAL CURSOR ENGINE
    // ----------------------------------------------------------------------
    const initInertialCursor = () => {
        const dot = document.querySelector('.cortex-cursor-dot');
        const halo = document.querySelector('.cortex-cursor-halo');
        if (!dot || !halo) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let haloX = mouseX;
        let haloY = mouseY;
        let ticking = false;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if(!ticking) {
                requestAnimationFrame(() => {
                    dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
                    ticking = false;
                });
                ticking = true;
            }

            // Magnetic induction over nodes
            const t = e.target.closest('a, button, input, .drag-window, .player-card, .ultrathin-card, .cortex-link-minimal');
            if (t) {
                document.body.classList.add('cortex-cursor-hover');
            } else {
                document.body.classList.remove('cortex-cursor-hover');
            }
        });

        const renderCursor = () => {
            haloX += (mouseX - haloX) * 0.15;
            haloY += (mouseY - haloY) * 0.15;
            halo.style.transform = `translate(calc(${haloX}px - 50%), calc(${haloY}px - 50%))`;
            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);
    };

    // ----------------------------------------------------------------------
    // CORTEX FRONTERA x10 PROTOCOL (Global Override)
    // ----------------------------------------------------------------------
    window.triggerCortexFronteraX10 = async () => {
        const body = document.body;
        const html = document.documentElement;
        
        // 1. Structural Chaos
        body.classList.add('singularity-active', 'cterm-apocalypse-mode', 'cterm-shake-x100');
        
        // 2. Filter Overload
        const originalFilter = body.style.filter;
        body.style.filter = 'contrast(3) saturate(0) invert(1) brightness(0.5)';
        
        // 3. Glitch Injections
        for(let i = 0; i < 50; i++) {
            const g = document.createElement('div');
            g.className = 'cterm-glitch-severe';
            Object.assign(g.style, {
                position: 'fixed',
                top: Math.random() * 100 + 'vh',
                left: Math.random() * 100 + 'vw',
                width: Math.random() * 300 + 'px',
                height: '2px',
                background: '#fff',
                zIndex: '1000000',
                pointerEvents: 'none'
            });
            body.appendChild(g);
            setTimeout(() => g.remove(), 200 + Math.random() * 800);
        }

        // 4. Reset sequence
        setTimeout(() => {
            body.classList.remove('singularity-active', 'cterm-apocalypse-mode', 'cterm-shake-x100');
            body.style.filter = originalFilter;
        }, 12000);
        
        return "FRONTERA_X10_ACTIVE";
    };

    // Initialize all sub-engines
    initVoidMirror();
    initScrollEntropy();
    initInertialCursor();
});
