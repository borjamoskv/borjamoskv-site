/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | PARTICLES MODULE (AWWWARDS TIER S++)
 * Sovereign Swarm — Spatial-hashed particle canvas with GPU-style
 * rendering, curl noise perturbation, depth-of-field blur, and
 * audio-reactive force fields.
 * ═══════════════════════════════════════════════════════════════════
 */

MOSKV.particles = (() => {
    'use strict';

    const MARKS_STORAGE_KEY = 'moskv_marks';

    const init = () => {
        const canvas = document.getElementById('particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let isPulsing = false;
        let mouse = { x: -1000, y: -1000, pressed: false };

        const config = {
            baseCount: globalThis.innerWidth > 768 ? 50 : 25,
            maxDistance: 140,
            mouseRadius: 180,
            baseSpeed: 0.35,
            pulseForce: 6,
            cellSize: 150, // spatial hash cell
            depthLayers: 3  // z-depth simulation
        };

        // ── PHASE STATE (v3: phase-reactive physics) ──
        let currentPhase = 'warmup';
        let burstParticles = []; // temporary peak-burst particles

        const PHASE_GRAVITY = {
            warmup:  0.008,
            buildup: -0.04,   // anti-gravity: float upward
            peak:     0.12,   // heavy: slam down
            cooldown: 0.004   // micro-gravity: near-weightless
        };

        const PHASE_TRAIL_ALPHA = {
            warmup:  0.12,
            buildup: 0.05,    // longer trails = ghostly drift
            peak:    0.28,    // sharp clear = aggressive
            cooldown: 0.07
        };

        const PHASE_COLORS = {
            warmup:  { r: 204, g: 255, b: 0 },
            buildup: { r: 0,   g: 255, b: 255 },   // cyan
            peak:    { r: 255, g: 50,  b: 0 },      // red-orange
            cooldown:{ r: 140, g: 180, b: 20 }      // dimmed lime
        };

        // Observer: watch for phase changes on <html>
        const phaseObserver = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.attributeName === 'data-energy-phase') {
                    const prev = currentPhase;
                    currentPhase = document.documentElement.dataset.energyPhase || 'warmup';
                    if (currentPhase === 'peak' && prev !== 'peak') _spawnBurst();
                }
            }
        });
        phaseObserver.observe(document.documentElement, { attributes: true });

        // Peak burst: 15 particles from center, high outward velocity, auto-remove
        const _spawnBurst = () => {
            const cx = width * 0.5, cy = height * 0.5;
            for (let i = 0; i < 15; i++) {
                const angle = (Math.PI * 2 / 15) * i + (Math.random() - 0.5) * 0.4;
                const speed = 4 + Math.random() * 6;
                const p = new Node();
                p.x = cx + (Math.random() - 0.5) * 60;
                p.y = cy + (Math.random() - 0.5) * 60;
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                p.z = 0.7 + Math.random() * 0.3;
                p.depthScale = 0.4 + p.z * 0.6;
                p.baseSize = 2 + Math.random() * 2;
                p.size = p.baseSize;
                p.reactiveSize = p.baseSize;
                p.isBurst = true;
                burstParticles.push(p);
            }
            // Auto-remove burst particles after 3s
            setTimeout(() => { burstParticles = []; }, 3000);
        };

        // ── SPATIAL HASH for O(N) connections instead of O(N²) ──
        let grid = {};
        const cellKey = (x, y) => `${(x / config.cellSize) | 0}_${(y / config.cellSize) | 0}`;

        const buildGrid = () => {
            grid = {};
            for (let i = 0; i < particles.length; i++) {
                const key = cellKey(particles[i].x, particles[i].y);
                if (!grid[key]) grid[key] = [];
                grid[key].push(i);
            }
        };

        const getNeighborKeys = (x, y) => {
            const cx = (x / config.cellSize) | 0;
            const cy = (y / config.cellSize) | 0;
            const keys = [];
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    keys.push(`${cx + dx}_${cy + dy}`);
                }
            }
            return keys;
        };

        // ── CURL NOISE (simple 2D) ──
        const simplex2D = (x, y) => {
            // Fast hash-based noise approximation
            const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
            return n - Math.floor(n);
        };

        const curlNoise = (x, y, t) => {
            const eps = 0.01;
            const s = 0.003;
            const n1 = simplex2D(x * s, y * s + t);
            const n2 = simplex2D(x * s, (y + eps) * s + t);
            const n3 = simplex2D((x + eps) * s, y * s + t);
            // Curl: rotate gradient 90°
            return {
                x: (n2 - n1) / eps * 0.8,
                y: -(n3 - n1) / eps * 0.8
            };
        };

        let time = 0;

        const resize = () => {
            width = canvas.width = globalThis.innerWidth;
            height = canvas.height = globalThis.innerHeight;
        };
        globalThis.addEventListener('resize', resize);
        resize();

        // ── NO TOCAR JUMPSCARE (preserved) ──
        const noTocarBtn = document.getElementById('no-tocar-btn');
        const elonOverlay = document.getElementById('elon-jumpscare-overlay');
        if (noTocarBtn && elonOverlay) {
            noTocarBtn.addEventListener('click', () => {
                elonOverlay.style.display = 'flex';
                elonOverlay.style.animation = 'elonShake 0.05s infinite';

                try {
                    const ac = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
                    if (ac.state === 'suspended') ac.resume();

                    const osc = ac.createOscillator();
                    const fmOsc = ac.createOscillator();
                    const fmGain = ac.createGain();
                    const gainNode = ac.createGain();

                    fmOsc.type = 'square';
                    fmOsc.frequency.value = 400;
                    fmGain.gain.value = 500;
                    fmOsc.connect(fmGain);
                    fmGain.connect(osc.frequency);

                    osc.connect(gainNode);
                    gainNode.connect(ac.destination);
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(50, ac.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(800, ac.currentTime + 0.1);

                    gainNode.gain.setValueAtTime(0, ac.currentTime);
                    gainNode.gain.linearRampToValueAtTime(1, ac.currentTime + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 1.5);

                    fmOsc.start();
                    osc.start();
                    fmOsc.stop(ac.currentTime + 2);
                    osc.stop(ac.currentTime + 2);
                } catch(e) { console.warn('[CORTEX] Audio generation failed:', e); }

                setTimeout(() => {
                    elonOverlay.style.display = 'none';
                    elonOverlay.style.animation = 'none';
                }, 2000);
            });
        }

        // ── MOUSE EVENTS ──
        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }, { passive: true });

        document.addEventListener('mousedown', () => {
            mouse.pressed = true;
            isPulsing = true;
            particles.forEach(p => p.pulse(config.pulseForce));
            setTimeout(() => isPulsing = false, 300);
        });

        document.addEventListener('mouseup', () => {
            mouse.pressed = false;
        });

        // ── COLLECTIVE MEMORY ──
        let historicalNodes = [];

        const loadMemory = () => {
            try {
                const raw = localStorage.getItem(MARKS_STORAGE_KEY);
                const marks = raw ? JSON.parse(raw) : [];
                if (Array.isArray(marks)) {
                    historicalNodes = marks.filter(m =>
                        typeof m.x === 'number' && typeof m.y === 'number'
                    );
                }
            } catch (e) {
                console.warn("[CORTEX] Collective Memory storage not available.", e);
            }
            initNodes();
        };

        // ── NODE CLASS (upgraded with z-depth + curl noise) ──
        class Node {
            constructor(startX = null, startY = null) {
                this.x = startX === null ? Math.random() * width : startX;
                this.y = startY === null ? Math.random() * height : startY;
                this.isMemory = startX !== null;

                // Z-depth for parallax + DOF blur
                this.z = Math.random();
                this.depthScale = 0.4 + this.z * 0.6;

                const speedMult = this.isMemory
                    ? (config.baseSpeed * 0.35)
                    : config.baseSpeed;
                this.vx = (Math.random() - 0.5) * speedMult;
                this.vy = (Math.random() - 0.5) * speedMult;

                this.baseSize = Math.random() * 1.5 + 0.5;
                if (this.isMemory) this.baseSize += 1.4;
                this.size = this.baseSize;
                this.mass = this.isMemory ? this.size * 2 : this.size;
                this.reactiveSize = this.size;

                // Glow phase offset for shimmer
                this.phase = Math.random() * Math.PI * 2;
            }

            pulse(force) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < config.mouseRadius * 1.5) {
                    const angle = Math.atan2(dy, dx);
                    const massFriction = this.isMemory ? 0.4 : 1;
                    const f = force * (1 / (dist * 0.05 + 1)) * massFriction;
                    this.vx += Math.cos(angle) * f;
                    this.vy += Math.sin(angle) * f;
                }
            }

            update(t) {
                const root = document.documentElement;
                const rawEnergy = Number.parseFloat(
                    root.style.getPropertyValue('--spatial-energy-raw')
                ) || 0;
                const rawBass = Number.parseFloat(
                    root.style.getPropertyValue('--spatial-bass-raw')
                ) || 0;

                // ── PHASE-REACTIVE GRAVITY (v3) ──
                const gravity = PHASE_GRAVITY[currentPhase] || 0.008;
                this.vy += gravity * this.depthScale;

                // Buildup: add horizontal wander for weightless drift
                if (currentPhase === 'buildup') {
                    this.vx += Math.sin(t * 0.7 + this.phase) * 0.008;
                }

                // Mouse attraction
                if (mouse.x > 0 && mouse.y > 0) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < config.mouseRadius && !mouse.pressed) {
                        const force = (config.mouseRadius - dist) / config.mouseRadius;
                        const angle = Math.atan2(dy, dx);
                        const pull = this.isMemory ? 0.01 : 0.025;
                        this.vx += Math.cos(angle) * force * pull;
                        this.vy += Math.sin(angle) * force * pull;
                    }
                }

                // Curl noise perturbation (scaled by depth)
                const curlMult = currentPhase === 'buildup' ? 1.8 : 1;
                const curl = curlNoise(this.x, this.y, t * 0.5);
                this.vx += curl.x * this.depthScale * (0.3 + rawEnergy * 0.4) * curlMult;
                this.vy += curl.y * this.depthScale * (0.3 + rawEnergy * 0.4) * curlMult;

                // Bass impulse
                if (rawBass > 0.8 && Math.random() < 0.08) {
                    const bassMult = currentPhase === 'peak' ? 4 : 2.5;
                    this.vx += (Math.random() - 0.5) * rawBass * bassMult;
                    this.vy += (Math.random() - 0.5) * rawBass * bassMult;
                }

                // Velocity integration
                this.x += this.vx * (1 + rawEnergy * 0.5) * this.depthScale;
                this.y += this.vy * (1 + rawEnergy * 0.5) * this.depthScale;

                // Damping (phase-reactive: buildup = less drag = floatier)
                const baseDamping = this.isMemory ? 0.93 : 0.97;
                const phaseDamping = currentPhase === 'buildup' ? 0.992
                                   : currentPhase === 'peak' ? 0.94
                                   : baseDamping;
                this.vx *= phaseDamping;
                this.vy *= phaseDamping;

                // Minimum speed enforcement
                const speed = Math.hypot(this.vx, this.vy);
                const minSpeed = this.isMemory
                    ? config.baseSpeed * 0.25
                    : config.baseSpeed * 0.6;
                if (speed < minSpeed) {
                    const angle = Math.atan2(this.vy, this.vx) + (Math.random() - 0.5) * 0.5;
                    this.vx = Math.cos(angle) * minSpeed;
                    this.vy = Math.sin(angle) * minSpeed;
                }

                // Wrap
                if (this.x < -10) this.x = width + 10;
                if (this.x > width + 10) this.x = -10;
                if (this.y < -10) this.y = height + 10;
                if (this.y > height + 10) this.y = -10;

                // Reactive size with shimmer (peak = bigger pulsing)
                const shimmerSpeed = currentPhase === 'peak' ? 6 : 3;
                const shimmerAmp = currentPhase === 'peak' ? 0.6 : 0.3;
                const shimmer = Math.sin(t * shimmerSpeed + this.phase) * shimmerAmp;
                this.reactiveSize = (this.baseSize + rawBass * 2.5 + shimmer) * this.depthScale;
            }

            draw() {
                const alpha = isPulsing
                    ? 0.9
                    : this.isMemory
                        ? 0.6 + this.z * 0.3
                        : 0.2 + this.z * 0.25;

                // Phase-reactive color (v3)
                const pc = PHASE_COLORS[currentPhase] || PHASE_COLORS.warmup;
                const blurR = (1 - this.z) * 2; // DOF blur for far particles

                if (blurR > 0.5) {
                    ctx.save();
                    ctx.filter = `blur(${blurR}px)`;
                }

                // Glow halo (phase-colored)
                if (this.reactiveSize > 2 && !isPulsing) {
                    const haloR = currentPhase === 'peak' ? this.reactiveSize * 4 : this.reactiveSize * 3;
                    const grad = ctx.createRadialGradient(
                        this.x, this.y, 0,
                        this.x, this.y, haloR
                    );
                    grad.addColorStop(0, `rgba(${pc.r}, ${pc.g}, ${pc.b}, ${alpha * 0.3})`);
                    grad.addColorStop(1, `rgba(${pc.r}, ${pc.g}, ${pc.b}, 0)`);
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, haloR, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Core dot (phase-colored)
                const color = isPulsing
                    ? `rgba(212, 212, 212, ${alpha})`
                    : this.isMemory
                        ? `rgba(${pc.r}, ${pc.g}, ${pc.b}, ${alpha})`
                        : `rgba(${pc.r}, ${pc.g}, ${pc.b}, ${alpha * 0.8})`;

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, Math.max(this.reactiveSize, 0.5), 0, Math.PI * 2);
                ctx.fill();

                // Memory core highlight
                if (this.isMemory && !isPulsing) {
                    ctx.fillStyle = `rgba(212, 212, 212, ${alpha * 0.7})`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.reactiveSize * 0.35, 0, Math.PI * 2);
                    ctx.fill();
                }

                if (blurR > 0.5) {
                    ctx.restore();
                }
            }
        }

        const initNodes = () => {
            particles = [];
            for (let i = 0; i < config.baseCount; i++) {
                particles.push(new Node());
            }
            historicalNodes.forEach(mark => {
                const xPos = (mark.x / 100) * width;
                const yPos = (mark.y / 100) * height;
                particles.push(new Node(xPos, yPos));
            });
        };

        loadMemory();

        // ── MEMORY HUD ──
        const memoryHud = document.createElement('div');
        memoryHud.style.cssText = `
            position:fixed;bottom:20px;left:20px;
            color:var(--accent-primary);
            font-family:var(--font-mono);font-size:10px;
            letter-spacing:1px;z-index:1000;
            pointer-events:none;opacity:0.4;
            text-transform:uppercase;
        `;
        document.body.appendChild(memoryHud);

        const updateHud = () => {
            const memCount = particles.filter(p => p.isMemory).length;
            memoryHud.textContent = `Ω_COLLECTIVE_MEMORY: ${memCount} NODES`;
        };

        // ── GLOBAL API ──
        globalThis.addSwarmNode = (x, y) => {
            particles.push(new Node(x, y));
            updateHud();
            particles.forEach(p => {
                const dx = p.x - x;
                const dy = p.y - y;
                const dist = Math.hypot(dx, dy);
                if (dist < config.mouseRadius) {
                    const angle = Math.atan2(dy, dx);
                    const f = config.pulseForce * 0.5 * (1 / (dist * 0.05 + 1));
                    p.vx += Math.cos(angle) * f;
                    p.vy += Math.sin(angle) * f;
                }
            });
        };

        // ── CONNECTIONS (spatial-hashed O(N)) ──
        const drawConnections = () => {
            buildGrid();
            const drawn = new Set();

            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                const neighborKeys = getNeighborKeys(a.x, a.y);

                for (const key of neighborKeys) {
                    const cell = grid[key];
                    if (!cell) continue;
                    for (const j of cell) {
                        if (j <= i) continue;
                        const pairKey = i * 10000 + j;
                        if (drawn.has(pairKey)) continue;

                        const b = particles[j];
                        const dx = a.x - b.x;
                        const dy = a.y - b.y;
                        const dist = Math.hypot(dx, dy);

                        // Phase-reactive connection distance (v3: buildup = wider web)
                        const phaseMaxDist = currentPhase === 'buildup'
                            ? config.maxDistance * 2
                            : currentPhase === 'peak'
                                ? config.maxDistance * 0.7
                                : config.maxDistance;

                        if (dist < phaseMaxDist) {
                            drawn.add(pairKey);
                            const opacity = (1 - dist / phaseMaxDist);
                            const depthAlpha = (a.z + b.z) * 0.5;
                            const pc = PHASE_COLORS[currentPhase] || PHASE_COLORS.warmup;

                            const connAlpha = currentPhase === 'peak'
                                ? opacity * 0.25 * depthAlpha
                                : opacity * 0.12 * depthAlpha;

                            const color = isPulsing
                                ? `rgba(212, 212, 212, ${opacity * 0.5})`
                                : `rgba(${pc.r}, ${pc.g}, ${pc.b}, ${connAlpha})`;

                            ctx.strokeStyle = color;
                            ctx.lineWidth = opacity * 0.8 * depthAlpha;
                            ctx.beginPath();
                            ctx.moveTo(a.x, a.y);
                            ctx.lineTo(b.x, b.y);
                            ctx.stroke();
                        }
                    }
                }
            }
        };

        // ── ANIMATION LOOP (v3: phase-reactive trails + burst rendering) ──
        const animate = () => {
            time += 0.016;

            // Phase-reactive trail density (v3)
            const trailAlpha = PHASE_TRAIL_ALPHA[currentPhase] || 0.12;
            ctx.fillStyle = `rgba(10, 10, 10, ${trailAlpha})`;
            ctx.fillRect(0, 0, width, height);

            drawConnections();

            // Sort by z for proper depth ordering
            particles.sort((a, b) => a.z - b.z);

            for (const p of particles) {
                p.update(time);
                p.draw();
            }

            // Render burst particles (v3: peak explosion)
            for (const bp of burstParticles) {
                bp.update(time);
                bp.draw();
                // Extra damping for burst particles
                bp.vx *= 0.96;
                bp.vy *= 0.96;
                bp.baseSize *= 0.995; // shrink over time
            }

            requestAnimationFrame(animate);
        };

        animate();
    };

    return { init };
})();
