/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | INTERACTIONS MODULE
 * Puntazos, Multilingual Morph, Cursor Trail, 3D Tilt,
 * Random Glitch, Stitch Egg, DJ Automata controller.
 * ═══════════════════════════════════════════════════════════════════
 */

MOSKV.interactions = (() => {
    'use strict';

    const MARKS_STORAGE_KEY = 'moskv_marks';

    const readStoredMarks = () => {
        try {
            const raw = localStorage.getItem(MARKS_STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.debug('[CORTEX] Marks storage unavailable.', error);
            return [];
        }
    };

    const writeStoredMarks = (marks) => {
        try {
            localStorage.setItem(MARKS_STORAGE_KEY, JSON.stringify(marks.slice(-160)));
        } catch (error) {
            console.debug('[CORTEX] Could not persist marks.', error);
        }
    };

    // ── PUNTAZOS (PERMANENT MARKS) & ARTISTIC INSULTS ──
    const initPuntazos = async () => {
        let markCount = 0;
        const INSULT_THRESHOLD = 15;
        const FIBONACCI_SEQ = new Set([5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]);
        
        const insults = [
            "Tranquilo, Pollock. La pantalla se limpia sola, pero tu neurosis no.",
            "Has dejado más manchas que narrativa. Suficiente.",
            "Axioma 7: El exceso de interacción denota pánico sistémico. Para.",
            "No estás creando arte, estás ensuciando el viewport.",
            "Tanta energía cinética desperdiciada en el vacío digital.",
            "¿Te pagan por hacer clic o es solo ansiedad no resuelta?",
            "Esa urgencia táctil... Háztelo mirar."
        ];

        const modalHtml = `
            <div id="insultModal" class="artistic-insult-modal">
                <div class="artistic-insult-content">
                    <div id="insultText" class="insult-text"></div>
                    <div class="insult-sub">SISTEMA SATURADO. ACCESO TEMPORALMENTE RESTRINGIDO.</div>
                    <button id="closeInsult" class="btn-insult-close">ENTENDIDO</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = document.getElementById('insultModal');
        const insultText = document.getElementById('insultText');
        const closeBtn = document.getElementById('closeInsult');
        const jumpscareOverlay = document.getElementById('jumpscareOverlay');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                markCount = 0;
            });
        }

        document.addEventListener('click', async (e) => {
            const isInteractive = e.target.closest('a, button, input, textarea, select, .hero-sound-toggle, .custom-cursor, .cursor-text, .artistic-insult-modal, .puntazo');
            if (isInteractive) return;

            const scrollWidth = document.documentElement.scrollWidth || globalThis.innerWidth;
            const scrollHeight = document.documentElement.scrollHeight || globalThis.innerHeight;
            
            const xPct = (e.pageX / scrollWidth) * 100;
            const yPct = (e.pageY / scrollHeight) * 100;

            if (typeof globalThis.addSwarmNode === 'function') {
                globalThis.addSwarmNode(e.pageX, e.pageY);
            }
            markCount++;

            // Fibonacci Jumpscare
            if (FIBONACCI_SEQ.has(markCount) && jumpscareOverlay) {
                jumpscareOverlay.classList.add('active');
                
                const glitchWords = ['OBEY', 'ENTROPIA', 'VACÍO', 'CORTEX', 'PANIC'];
                const content = jumpscareOverlay.querySelector('.jumpscare-content');
                if (content) {
                    const txt = glitchWords[Math.floor(Math.random() * glitchWords.length)];
                    content.textContent = txt;
                    content.dataset.text = txt;
                }

                if (markCount > 21) {
                    jumpscareOverlay.style.background = 'white';
                    jumpscareOverlay.style.color = 'black';
                } else {
                    jumpscareOverlay.style.background = 'red';
                    jumpscareOverlay.style.color = 'white';
                }

                setTimeout(() => {
                    jumpscareOverlay.classList.remove('active');
                }, 150 + Math.random() * 100);
            }

            const marks = readStoredMarks();
            marks.push({ x: xPct, y: yPct, ts: Date.now() });
            writeStoredMarks(marks);

            // Insult on spam
            if (markCount >= INSULT_THRESHOLD && !FIBONACCI_SEQ.has(markCount) && modal) {
                if (!modal.classList.contains('active')) {
                    const randomInsult = insults[Math.floor(Math.random() * insults.length)];
                    insultText.textContent = randomInsult;
                    modal.classList.add('active');
                }
            }
        });
    };


    // ── CURSOR PAINT TRAIL (Lightweight — heavy FX deferred to cursor.js distortion ring) ──
    const initCursorTrail = () => {
        const canvas = document.getElementById('cursorTrail');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;
        let points = [];
        const maxPoints = 32;
        
        function resize() {
            width = globalThis.innerWidth;
            height = globalThis.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        
        globalThis.addEventListener('resize', resize);
        resize();
        
        document.addEventListener('mousemove', (e) => {
            points.push({ x: e.clientX, y: e.clientY, age: 0, t: performance.now() });
            if (points.length > maxPoints) points.shift();
        }, { passive: true });
        
        function drawTrail() {
            ctx.clearRect(0, 0, width, height);
            if (points.length < 3) {
                requestAnimationFrame(drawTrail);
                return;
            }
            
            // Draw fading bezier segments
            for (let i = 2; i < points.length; i++) {
                const p0 = points[i - 2];
                const p1 = points[i - 1];
                const p2 = points[i];
                
                const progress = i / points.length;
                const alpha = progress * 0.35;
                const lineW = progress * 8 + 1;
                
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                const xc = (p1.x + p2.x) / 2;
                const yc = (p1.y + p2.y) / 2;
                ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
                
                ctx.strokeStyle = `rgba(204, 255, 0, ${alpha})`;
                ctx.lineWidth = lineW;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
                
                p2.age++;
            }
            
            // Glow on head
            if (points.length > 0) {
                const head = points.at(-1);
                ctx.beginPath();
                ctx.arc(head.x, head.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(204, 255, 0, 0.5)';
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#CCFF00';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            
            points = points.filter(p => p.age < 20);
            requestAnimationFrame(drawTrail);
        }
        drawTrail();
    };

    // ── SCROLL REVEAL (IntersectionObserver) ──
    const initScrollReveal = () => {
        const targets = document.querySelectorAll(
            '.reveal-on-scroll, section, .player-container, .haiku-line, .drag-window'
        );
        if (!targets.length) return;

        // Add the class for CSS animation setup
        targets.forEach(el => {
            if (!el.classList.contains('reveal-on-scroll')) {
                el.classList.add('reveal-on-scroll');
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Stagger children if they exist
                    const children = entry.target.querySelectorAll('.reveal-child');
                    if (children.length && typeof gsap !== 'undefined') {
                        gsap.to(children, {
                            opacity: 1,
                            y: 0,
                            stagger: 0.08,
                            duration: 0.6,
                            ease: 'power3.out',
                            delay: 0.1
                        });
                    }
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        targets.forEach(el => observer.observe(el));
    };

    // ── 3D HOVER TILT ──
    const init3DHoverTilt = () => {
        if (typeof gsap === 'undefined') return;
        const cards = document.querySelectorAll('.player-container, .drag-window, .nav-logo, .haiku-line');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -15;
                const rotateY = ((x - centerX) / centerX) * 15;
                
                gsap.to(card, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    transformPerspective: 1000,
                    ease: "power2.out",
                    duration: 0.5
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationX: 0,
                    rotationY: 0,
                    ease: "elastic.out(1, 0.3)",
                    duration: 1
                });
            });
        });
    };

    // ── RANDOM GLITCH TEXT ──
    const initRandomGlitch = () => {
        if (typeof gsap === 'undefined') return;
        const glitchElements = document.querySelectorAll('.glitch-mega, .glitch-text, .nav-bizarre');
        
        const applyGlitch = (el) => {
            const originalColor = globalThis.getComputedStyle(el).color;
            gsap.to(el, {
                duration: 0.1,
                x: () => Math.random() * 10 - 5,
                y: () => Math.random() * 10 - 5,
                skewX: () => Math.random() * 20 - 10,
                color: Math.random() > 0.5 ? '#CCFF00' : '#FF2A2A',
                yoyo: true,
                repeat: 3,
                onComplete: () => {
                    gsap.to(el, { x: 0, y: 0, skewX: 0, color: originalColor, duration: 0.1, clearProps: "color" });
                }
            });
        };

        glitchElements.forEach(el => {
            setInterval(() => applyGlitch(el), Math.random() * 5000 + 4000);
        });
    };

    // ── STITCH EASTER EGG ──
    const initStitchEgg = () => {
        const stitchEgg = document.getElementById('stitchEgg');
        if (!stitchEgg || typeof Draggable === 'undefined') return;

        Draggable.create(stitchEgg, {
            type: "x,y",
            bounds: "body",
            inertia: true,
            onPress: function() {
                gsap.to(this.target, { scale: 0.9, duration: 0.2 });
            },
            onRelease: function() {
                gsap.to(this.target, { scale: 1, duration: 0.2, ease: "back.out(1.7)" });
            }
        });

        const placeholder = stitchEgg.querySelector('.stitch-placeholder');
        if (placeholder) {
            placeholder.textContent = '{ W E N }';
            
            stitchEgg.addEventListener('mouseenter', () => {
                placeholder.textContent = '{ W E B }';
                gsap.to(placeholder, { color: '#D4D4D4', borderColor: '#D4D4D4', duration: 0.2 });
            });
            stitchEgg.addEventListener('mouseleave', () => {
                placeholder.textContent = '{ W E N }';
                gsap.to(placeholder, { color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)', duration: 0.2 });
            });
        }

        setTimeout(() => {
            gsap.to(stitchEgg, {
                opacity: 0.8,
                duration: 0.1,
                yoyo: true,
                repeat: 5,
                onComplete: () => {
                    gsap.to(stitchEgg, { opacity: 1, duration: 1, ease: "power2.out" });
                }
            });
            
            gsap.to(stitchEgg, {
                y: "-=20",
                rotation: 5,
                duration: 2,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });
        }, 5000);
    };

    // ── DJ AUTOMATA CONTROLLER ──
    const initDJAutomata = () => {
        const djBtn = document.getElementById('btn-dj-automata');
        if (!djBtn) return;

        djBtn.addEventListener('click', (e) => {
            e.preventDefault();

            MOSKV.scroll?.scrollToTarget?.('hero');

            if (!globalThis.autoDJAesthetic) {
                return;
            }

            const hud = document.querySelector('.moskv-dj-hud');
            if (!hud) return;

            const willShow = !hud.classList.contains('visible');
            hud.classList.toggle('visible', willShow);
            djBtn.classList.toggle('active', willShow);
            djBtn.setAttribute('aria-pressed', String(willShow));

            if (willShow && !globalThis.autoDJAesthetic.audioUnlocked) {
                document.dispatchEvent(new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: globalThis
                }));
            }
        });
    };

    // ── STELLAR APPARITIONS (RANDOM 4-WAY FLASHES) ──
    const initStellarApparitions = () => {
        const apparitions = [
            {
                id: 'chiquito',
                className: 'stellar-apparition--chiquito',
                kicker: 'stellar glitch',
                title: 'CHIQUITO',
                sub: 'entra / corta / desaparece'
            },
            {
                id: 'bertin',
                className: 'stellar-apparition--bertin',
                kicker: 'orbital crooner',
                title: 'BERTIN OSBORNE',
                sub: 'flash dorado / paso lateral'
            },
            {
                id: 'carlton',
                className: 'stellar-apparition--carlton',
                kicker: 'dance anomaly',
                title: 'CARLTON BANKS',
                sub: 'swing / neón / fuga'
            },
            {
                id: 'arevalo',
                className: 'stellar-apparition--arevalo',
                kicker: 'comet talk',
                title: 'AREVALO',
                sub: 'humo / foco / corte'
            }
        ];

        const shell = document.createElement('div');
        shell.className = 'stellar-apparition-shell';
        shell.setAttribute('aria-hidden', 'true');
        document.body.appendChild(shell);

        let timer = 0;
        let hideTimer = 0;
        let lastId = '';

        const buildMarkup = (item) => `
            <div class="stellar-apparition-card ${item.className}">
                <span class="stellar-apparition-kicker">${item.kicker}</span>
                <strong class="stellar-apparition-title">${item.title}</strong>
                <span class="stellar-apparition-sub">${item.sub}</span>
                <div class="stellar-apparition-stars" aria-hidden="true">
                    <span></span><span></span><span></span><span></span><span></span>
                </div>
            </div>
        `;

        const pickApparition = () => {
            const pool = apparitions.filter((item) => item.id !== lastId);
            return pool[Math.floor(Math.random() * pool.length)] || apparitions[0];
        };

        const scheduleNext = (delay = 47000 + Math.random() * 26000) => {
            window.clearTimeout(timer);
            timer = window.setTimeout(triggerRandomApparition, delay);
        };

        const clearApparition = () => {
            shell.classList.remove('is-visible');
            window.clearTimeout(hideTimer);
            hideTimer = window.setTimeout(() => {
                shell.innerHTML = '';
            }, 260);
        };

        const triggerRandomApparition = (forcedId = '') => {
            if (document.hidden) {
                scheduleNext(12000 + Math.random() * 8000);
                return;
            }

            const item = forcedId
                ? apparitions.find((entry) => entry.id === forcedId) || pickApparition()
                : pickApparition();

            lastId = item.id;
            shell.innerHTML = buildMarkup(item);
            shell.classList.add('is-visible');

            globalThis.autoDJAesthetic?.triggerEruptionTransition?.(item.id);

            window.clearTimeout(hideTimer);
            hideTimer = window.setTimeout(() => {
                clearApparition();
                scheduleNext();
            }, 760);
        };

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !shell.classList.contains('is-visible')) {
                scheduleNext(14000 + Math.random() * 9000);
            }
        });

        globalThis.triggerStellarApparition = triggerRandomApparition;
        scheduleNext(26000 + Math.random() * 9000);
    };

    // ── MASTER INIT ──
    const init = () => {
        initPuntazos();

        initCursorTrail();
        initScrollReveal();
        init3DHoverTilt();
        initRandomGlitch();
        setTimeout(initStitchEgg, 500);
        initDJAutomata();
        initStellarApparitions();
    };

    return { init };
})();
