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


    // ── CURSOR PAINT TRAIL ──
    const initCursorTrail = () => {
        const canvas = document.getElementById('cursorTrail');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;
        let points = [];
        const maxPoints = 50;
        
        function resize() {
            width = globalThis.innerWidth;
            height = globalThis.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        
        globalThis.addEventListener('resize', resize);
        resize();
        
        document.addEventListener('mousemove', (e) => {
            points.push({ x: e.clientX, y: e.clientY, age: 0 });
            if (points.length > maxPoints) points.shift();
        }, { passive: true });
        
        function drawTrail() {
            ctx.clearRect(0, 0, width, height);
            if (points.length < 2) {
                requestAnimationFrame(drawTrail);
                return;
            }
            
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            
            for (let i = 1; i < points.length; i++) {
                const pt = points[i];
                const prevPt = points[i - 1];
                const xc = (pt.x + prevPt.x) / 2;
                const yc = (pt.y + prevPt.y) / 2;
                ctx.quadraticCurveTo(prevPt.x, prevPt.y, xc, yc);
                pt.age++;
            }
            
            ctx.lineTo(points.at(-1).x, points.at(-1).y);
            
            ctx.strokeStyle = `rgba(204, 255, 0, 0.4)`;
            ctx.lineWidth = 15;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#CCFF00';
            ctx.stroke();
            
            points = points.filter(p => p.age < 25);
            requestAnimationFrame(drawTrail);
        }
        drawTrail();
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
                gsap.to(placeholder, { color: '#fff', borderColor: '#fff', duration: 0.2 });
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

    // ── MASTER INIT ──
    const init = () => {
        initPuntazos();

        initCursorTrail();
        init3DHoverTilt();
        initRandomGlitch();
        setTimeout(initStitchEgg, 500);
        initDJAutomata();
    };

    return { init };
})();
