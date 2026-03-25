/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | PARTICLES MODULE
 * Sovereign Swarm — particle canvas, Node class, connections,
 * collective memory API, NoTocar jumpscare.
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
        const config = {
            count: globalThis.innerWidth > 768 ? 120 : 60,
            maxDistance: 120,
            mouseRadius: 150,
            baseSpeed: 0.4,
            pulseForce: 5
        };
        
        let mouse = { x: -1000, y: -1000, pressed: false };
        let isPulsing = false;

        const resize = () => {
            width = canvas.width = globalThis.innerWidth;
            height = canvas.height = globalThis.innerHeight;
        };

        globalThis.addEventListener('resize', resize);
        resize();

        // ── NO TOCAR JUMPSCARE ──
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
        });

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

        const loadMemory = async () => {
            try {
                const raw = localStorage.getItem(MARKS_STORAGE_KEY);
                const marks = raw ? JSON.parse(raw) : [];
                if (Array.isArray(marks)) {
                    historicalNodes = marks.filter(m => typeof m.x === 'number' && typeof m.y === 'number');
                }
            } catch (e) {
                console.warn("[CORTEX] Collective Memory storage not available.", e);
            }
            initNodes();
        };

        const initNodes = () => {
            particles = [];
            
            const baseCount = globalThis.innerWidth > 768 ? 40 : 20;
            for (let i = 0; i < baseCount; i++) {
                particles.push(new Node());
            }

            historicalNodes.forEach(mark => {
                const xPos = (mark.x / 100) * width;
                const yPos = (mark.y / 100) * height;
                particles.push(new Node(xPos, yPos));
            });
        };

        class Node {
            constructor(startX = null, startY = null) {
                this.x = startX === null ? Math.random() * width : startX;
                this.y = startY === null ? Math.random() * height : startY;
                this.isMemory = startX !== null;
                
                const speedMult = this.isMemory ? (config.baseSpeed * 0.4) : config.baseSpeed;
                this.vx = (Math.random() - 0.5) * speedMult;
                this.vy = (Math.random() - 0.5) * speedMult;
                
                this.baseSize = Math.random() * 1.5 + 0.5;
                if (this.isMemory) this.baseSize += 1.2;
                this.size = this.baseSize;
                this.mass = this.isMemory ? this.size * 2 : this.size;
            }

            pulse(force) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < config.mouseRadius * 1.5) {
                    const angle = Math.atan2(dy, dx);
                    const massFriction = this.isMemory ? 0.4 : 1; 
                    this.vx += Math.cos(angle) * force * (1 / (dist * 0.05 + 1)) * massFriction;
                    this.vy += Math.sin(angle) * force * (1 / (dist * 0.05 + 1)) * massFriction;
                }
            }

            applyMouseAttraction() {
                if (mouse.x > 0 && mouse.y > 0) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < config.mouseRadius && !mouse.pressed) {
                        const force = (config.mouseRadius - dist) / config.mouseRadius;
                        const angle = Math.atan2(dy, dx);
                        const pullFactor = this.isMemory ? 0.01 : 0.03;
                        this.vx += Math.cos(angle) * force * pullFactor;
                        this.vy += Math.sin(angle) * force * pullFactor;
                    }
                }
            }

            applyPhysics(rawEnergy, rawBass) {
                if (rawBass > 0.8 && Math.random() < 0.1) {
                    this.vx += (Math.random() - 0.5) * rawBass * 2;
                    this.vy += (Math.random() - 0.5) * rawBass * 2;
                }
                this.x += this.vx * (1 + rawEnergy * 0.5);
                this.y += this.vy * (1 + rawEnergy * 0.5);
                this.vx *= this.isMemory ? 0.94 : 0.98;
                this.vy *= this.isMemory ? 0.94 : 0.98;

                const speed = Math.hypot(this.vx, this.vy);
                const minSpeed = this.isMemory ? (config.baseSpeed * 0.3) : config.baseSpeed;
                
                if (speed < minSpeed) {
                    const angle = Math.atan2(this.vy, this.vx) + (Math.random() - 0.5) * 0.5;
                    this.vx = Math.cos(angle) * minSpeed;
                    this.vy = Math.sin(angle) * minSpeed;
                }
            }

            update() {
                this.applyMouseAttraction();

                const root = document.documentElement;
                const rawEnergy = Number.parseFloat(root.style.getPropertyValue('--spatial-energy-raw')) || 0;
                const rawBass = Number.parseFloat(root.style.getPropertyValue('--spatial-bass-raw')) || 0;
                
                let currentSize = this.size + (rawBass * 2.5);
                
                this.applyPhysics(rawEnergy, rawBass);

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
                
                this.reactiveSize = currentSize;
            }

            draw() {
                let color;
                if (isPulsing) {
                    color = 'rgba(255, 255, 255, 0.9)';
                } else if (this.isMemory) {
                    color = `rgba(204, 255, 0, ${0.7 + (this.reactiveSize * 0.1)})`;
                } else {
                    color = `rgba(204, 255, 0, ${0.3 + (this.reactiveSize * 0.1)})`;
                }
                
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.reactiveSize, 0, Math.PI * 2);
                ctx.fill();
                
                if (this.isMemory && !isPulsing) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.reactiveSize * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        loadMemory();

        // ── MEMORY HUD ──
        const memoryHud = document.createElement('div');
        memoryHud.style.cssText = 'position:fixed;bottom:20px;left:20px;color:var(--accent-primary);font-family:var(--font-mono);font-size:10px;letter-spacing:1px;z-index:1000;pointer-events:none;opacity:0.5;text-transform:uppercase;';
        document.body.appendChild(memoryHud);

        const updateHud = () => {
            const memoryCount = particles.filter(p => p.isMemory).length;
            memoryHud.textContent = `Ω_COLLECTIVE_MEMORY: ${memoryCount} NODES`;
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
                    p.vx += Math.cos(angle) * (config.pulseForce * 0.5) * (1 / (dist * 0.05 + 1));
                    p.vy += Math.sin(angle) * (config.pulseForce * 0.5) * (1 / (dist * 0.05 + 1));
                }
            });
        };

        function drawConnections() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.hypot(dx, dy);

                    if (distance < config.maxDistance) {
                        let opacity = 1 - (distance / config.maxDistance);
                        let color = isPulsing ? `rgba(255, 255, 255, ${opacity * 0.6})` : `rgba(204, 255, 0, ${opacity * 0.15})`;
                        
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        const animate = () => {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
            ctx.fillRect(0, 0, width, height);
            
            drawConnections();
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            requestAnimationFrame(animate);
        };

        animate();
    };

    return { init };
})();
