/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | SOVEREIGN JS ARCHITECTURE
 * Axiom 5: Antifragile Operations & 60fps compliance
 * ═══════════════════════════════════════════════════════════════════
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // SYSTEM INITIALIZED
    console.log("%c SYSTEM ONLINE %c v1.0 ", "background:#CCFF00; color:#0A0A0A; font-weight:bold;", "background:#0A0A0A; color:#CCFF00;");

    // 1. LOADER & INITIALIZATION (Sovereign Fast Boot)
    const initSystem = () => {
        try {
            const progress = document.querySelector('.loader-progress');
            if (!progress) return;
            
            let width = 0;
            const interval = setInterval(() => {
                width += Math.random() * 25; // Faster boot
                if (width >= 100) {
                    width = 100;
                    clearInterval(interval);
                    requestAnimationFrame(() => {
                        progress.style.width = width + '%';
                    });
                    
                    setTimeout(() => {
                        document.body.classList.add('loaded');
                        initAwwwardsScroll(); // Init advanced scroll after boot
                    }, 200); // Snappier delay
                } else {
                    requestAnimationFrame(() => {
                        progress.style.width = width + '%';
                    });
                }
            }, 30);
        } catch (e) {
            console.error("[CORTEX] Initialization failure:", e);
            document.body.classList.add('loaded'); // Fallback to unblock UX
            initAwwwardsScroll();
        }
    };

    // 1.5 MUTATION PROTOCOL (CORTEX V5)
    // Axiom Ω_Chaos: The web is a living entity, its layout and colors mutate per visit.
    const initWebMutator = () => {
        // 1. Color Mutation
        const PALETTES = [
            { primary: "#CCFF00", bg: "#0A0A0A", name: "Cyber Lime (Noir Default)" },
            { primary: "#2E5090", bg: "#02040A", name: "YInMn Blue (Deep Void)" },
            { primary: "#FF003C", bg: "#0F0004", name: "Crimson Alert" },
            { primary: "#D4AF37", bg: "#080600", name: "Boney Gold (Enterprise)" },
            { primary: "#00F0FF", bg: "#000510", name: "Neo Chrome" }
        ];
        
        const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        
        // Override the specific CSS variables used in the static site
        document.documentElement.style.setProperty('--accent-primary', palette.primary);
        document.documentElement.style.setProperty('--color-cyber-lime', palette.primary);
        document.documentElement.style.setProperty('--bg-base', palette.bg);
        document.documentElement.style.setProperty('--color-abyssal-900', palette.bg);
        
        console.log(`[CORTEX] Theme Mutated: ${palette.name}`);

        // Set global skew
        const skewAmount = (Math.random() * 1.5 - 0.75).toFixed(2); 
        document.body.style.transform = `skewY(${skewAmount}deg)`;
        document.body.style.transformOrigin = 'center top';
        
        // Disable overlay scrollbar displacement caused by skew
        document.body.style.overflowX = 'hidden';

        // 2. Structural Chaos (Fisher-Yates Shuffle)
        const sectionsToShuffle = [
            document.querySelector('.marquee-section'),
            document.querySelector('.avant-garde-manifesto'),
            document.querySelector('.about-signal'),
            document.querySelector('.players-section'),
            document.querySelector('.works-section'),
            document.querySelector('.sets-section'),
            document.querySelector('#horizontal-universe')
        ].filter(el => el !== null);

        if (sectionsToShuffle.length > 0) {
            const contactSection = document.querySelector('.contact-section');
            const parent = contactSection ? contactSection.parentNode : document.body;
            
            // Fisher-Yates Shuffle Array
            for (let i = sectionsToShuffle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [sectionsToShuffle[i], sectionsToShuffle[j]] = [sectionsToShuffle[j], sectionsToShuffle[i]];
            }
            
            // Re-mount in new order before contact section
            sectionsToShuffle.forEach(sec => {
                if (contactSection) {
                    parent.insertBefore(sec, contactSection);
                } else {
                    parent.appendChild(sec);
                }
            });
            console.log(`[CORTEX] Structural Order Mutated.`);
        }
    };

    // 2. BACKGROUND VIDEO INITIALIZATION
    let currentVideoId = "";
    const initBackgroundVideo = () => {
        try {
            if (typeof DATA === 'undefined' || !DATA.bgVideos || DATA.bgVideos.length === 0) return;
            const iframe = document.getElementById('bg-video');
            if (!iframe) return;

            currentVideoId = DATA.bgVideos[Math.floor(Math.random() * DATA.bgVideos.length)];
            
            // Allow audio on autoplay since user requested video BACKGROUND MUSIC
            const src = `https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${currentVideoId}&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&vq=hd1080`;
            iframe.src = src;
        } catch (e) {
            console.error("[CORTEX] Background video injection failed:", e);
        }
    };

    initSystem();
    initWebMutator();
    initBackgroundVideo();

    // 2.5 EMPTY CLICKS TO ROTATE VIDEO
    // (Feature removed to prevent unexpected song changes on casual clicks)
    /*
    document.addEventListener('click', (e) => {
        // Prevent if clicking on interactive elements
        const isInteractive = e.target.closest('a, button, input, textarea, select, .hero-sound-toggle, .custom-cursor, .cursor-text');
        if (isInteractive) return;

        try {
            if (typeof DATA === 'undefined' || !DATA.bgVideos || DATA.bgVideos.length === 0) return;
            const iframe = document.getElementById('bg-video');
            if (!iframe) return;

            let nextVideoId = currentVideoId;
            // Pick a new one that isn't the current one (if possible)
            if (DATA.bgVideos.length > 1) {
                while (nextVideoId === currentVideoId) {
                    nextVideoId = DATA.bgVideos[Math.floor(Math.random() * DATA.bgVideos.length)];
                }
            } else {
                nextVideoId = DATA.bgVideos[0];
            }

            currentVideoId = nextVideoId;
            // When user clicks, we can safely play WITH sound natively
            const src = `https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${currentVideoId}&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&vq=hd1080`;
            iframe.src = src;
            
            console.log(`[CORTEX] Tactical shift to video: ${currentVideoId}`);

        } catch (err) {
            console.error("[CORTEX] Background swap failed:", err);
        }
    });
    */

    // 3. BACKGROUND VIDEO YOUTUBE API HANDLING (Mute/Unmute)
    const initVideoControls = () => {
        const soundToggle = document.getElementById('heroSoundToggle');
        if (!soundToggle) return;
        
        const iconUnmute = soundToggle.querySelector('.icon-unmute');
        const iconMute = soundToggle.querySelector('.icon-mute');
        const iframe = document.getElementById('bg-video');
        let isMuted = true;

        soundToggle.addEventListener('click', () => {
            isMuted = !isMuted;
            const command = isMuted ? 'mute' : 'unMute';
            
            if (iframe?.contentWindow) {
                iframe.contentWindow.postMessage(JSON.stringify({
                    event: 'command',
                    func: command,
                    args: []
                }), '*'); // Or replace '*' with target origin for better security
            }

            if (isMuted) {
                if (iconUnmute) iconUnmute.style.display = 'block';
                if (iconMute) iconMute.style.display = 'none';
            } else {
                if (iconUnmute) iconUnmute.style.display = 'none';
                if (iconMute) iconMute.style.display = 'block';
            }
        });
    };

    if (document.getElementById('heroSoundToggle')) {
        initVideoControls();
    }

    // 4. SECRET EGG (Logic & Teleportation)
    const initSecretEgg = () => {
        const egg = document.querySelector('.secret-egg');
        if (!egg) return;

        // --- 4.1 TELEPORTATION (Visit-based randomization) ---
        const potentialNests = [
            { selector: '.footer-bottom', position: 'beforeend' },
            { selector: '#newsletter', position: 'beforebegin' },
            { selector: '.marquee-section', position: 'beforeend' },
            { selector: '.hero-poetry', position: 'afterend' },
            { selector: '.substack-section', position: 'beforeend' }
        ];

        try {
            const nest = potentialNests[Math.floor(Math.random() * potentialNests.length)];
            const target = document.querySelector(nest.selector);
            if (target) {
                target.appendChild(egg);
                // Adjust position based on context if needed
                if (nest.selector === '.hero-poetry') {
                    egg.style.position = 'relative';
                    egg.style.marginTop = '2rem';
                } else {
                    egg.style.position = 'absolute';
                }
            }
        } catch (e) {
            console.warn("[CORTEX] Egg teleportation failed:", e);
        }

        // --- 4.2 INTERACTION ---
        // Intercept right click (context menu)
        egg.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent default browser menu
            // The egg is now an internal easter egg (no external link)
            egg.style.transform = 'scale(1.5) rotate(360deg)';
            egg.style.transition = 'all 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            // Also open the link
            window.open('https://naroa.online', '_blank');
        });
        
        // Allow left click to open the link directly and play the animation
        egg.addEventListener('click', (e) => {
            e.preventDefault();
            egg.style.transform = 'scale(1.5) rotate(720deg)';
            egg.style.transition = 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            setTimeout(() => {
                window.location.href = 'https://naroa.online';
            }, 1000);
        });
    };

    initSecretEgg();

    // 3. NAVIGATION (Mobile Toggle)
    const initNav = () => {
        const nav = document.getElementById('mainNav');
        const toggle = document.getElementById('navToggle');
        
        // Mobile menu
        if (toggle) {
            toggle.addEventListener('click', () => {
                nav.classList.toggle('menu-open');
            });
        }
    };

    initNav();

    // 3.5 AWWWARDS SMOOTH SCROLL (Lenis + GSAP)
    const initAwwwardsScroll = () => {
        if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        });

        lenis.on('scroll', ScrollTrigger.update);
        
        // Update nav on scroll (replacing old native listener)
        const nav = document.getElementById('mainNav');
        lenis.on('scroll', (e) => {
            if (e.scroll > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        // Entrance Choreography
        initChoreography();
    };

    // --- FLOATING COMPLETE LORE (Random Distribution) ---
    const COMPLETE_LORE = [
        { title: "I · AXIOMA DEL VACÍO", text: "La estática no es ruido, es memoria no resuelta." },
        { title: "II · GRAVEDAD INVERSA", text: "Componer no es encadenar lógica, es esculpir la gravedad hasta obligar a la máquina a respirar." },
        { title: "III · INSISTENCIA", text: "Me gustan las cosas que insisten más que las que impresionan." },
        { title: "IV · IMPERFECCIÓN SOBERANA", text: "Busco una base sólida pero abierta a la imperfección y las desviaciones no previstas." },
        { title: "V · BILBAO TERMINAL", text: "Producido íntegramente en Bilbao. Sin excusas, sin permisos." },
        { title: "Ω₁ · THALAMUS MEMBRANE", text: "Toda percepción debe atravesar el filtrado de entropía antes del procesamiento denso." },
        { title: "Ω₃ · BYZANTINE DEFAULT", text: "Confianza Cero. Toda ejecución requiere validación matemática previa." },
        { title: "THE LAST 10% DOCTRINE", text: "Construir el 90% es simple logística. Forjar el 10% final es imponer soberanía absoluta sobre la entropía." }
    ];

    const initFloatingLore = () => {
        const container = document.getElementById('loreContainer');
        if (!container || window.innerWidth <= 768) return; // Skip on mobile to avoid overlap mess

        // We wait a tick to ensure the document has reached its full expanded height 
        // after dynamic content (like Data.js injections) is parsed.
        setTimeout(() => {
            const pageHeight = document.body.scrollHeight;
            const startY = 800; // Start below hero
            const endY = pageHeight - 1000; // End before footer
            
            if (endY <= startY) return; // Not enough scroll space

            const verticalSlice = (endY - startY) / COMPLETE_LORE.length;

            COMPLETE_LORE.forEach((lore, index) => {
                const box = document.createElement('div');
                box.className = 'lore-floating-box glass';
                box.innerHTML = `
                    <span class="lore-floating-title">${lore.title}</span>
                    <p class="lore-floating-text">${lore.text}</p>
                `;

                // Calculate random positions
                // Alternate sides mostly to avoid bunching in the middle
                const isLeftEdge = Math.random() > 0.5;
                const randomLeft = isLeftEdge 
                    ? 5 + Math.random() * 20  // 5% to 25% (Left side)
                    : 60 + Math.random() * 25; // 60% to 85% (Right side)

                const baseTop = startY + (index * verticalSlice);
                const randomTop = baseTop + (Math.random() * (verticalSlice * 0.7)); // Variance within slice

                box.style.top = `${randomTop}px`;
                box.style.left = `${randomLeft}vw`;

                container.appendChild(box);

                // Add parallax scroll trigger for a floating feel
                gsap.to(box, {
                    y: -150 - (Math.random() * 200), // Random upward drift
                    rotation: -5 + (Math.random() * 10), // Slight tilt 
                    ease: "none",
                    scrollTrigger: {
                        trigger: box,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1 // smooth scrubbing
                    }
                });
            });
        }, 500); // Slight delay ensures layout calculation
    };

    const initChoreography = () => {
        // Hero title glitch
        gsap.fromTo('.hero-title', 
            { y: 50, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1.5, ease: 'power4.out', delay: 0.1 }
        );

        // Soul of the site: Haiku per-line staggered reveal
        const haikuLines = document.querySelectorAll('.haiku-line');
        if (haikuLines.length > 0) {
            gsap.fromTo(haikuLines,
                { y: 30, opacity: 0, filter: 'blur(10px)' },
                { 
                    y: 0, 
                    opacity: 1, 
                    filter: 'blur(0px)',
                    duration: 1.2, 
                    stagger: 0.8, // Slow, poetic 5-7-5 stagger
                    ease: 'power3.out', 
                    delay: 0.8 
                }
            );
        }

        // Secondary text & CTAs
        gsap.fromTo('.hero-axiom', 
            { y: 30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 3.2 } // After haiku completes
        );

        gsap.fromTo('.hero-ctas a', 
            { y: 20, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 3.5 }
        );

        // Sections Fade Up (General)
        const sections = document.querySelectorAll('section:not(#hero):not(#players):not(#sets)');
        sections.forEach(sec => {
            gsap.fromTo(sec, 
                { y: 80, opacity: 0 },
                { 
                    y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sec,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });

        // 🟢 Transmisión Directa (Embeds) Stagger
        const playerGrid = document.querySelector('.players-grid');
        if (playerGrid) {
            gsap.to('.player-card', {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '#players',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });

            // 🟢 CUSTOM CURSOR FOR PLAYERS SECTION (Buko Cursor)
            ScrollTrigger.create({
                trigger: '#players',
                start: 'top center',
                end: 'bottom center',
                onEnter: () => document.body.classList.add('buko-cursor-active'),
                onLeave: () => document.body.classList.remove('buko-cursor-active'),
                onEnterBack: () => document.body.classList.add('buko-cursor-active'),
                onLeaveBack: () => document.body.classList.remove('buko-cursor-active')
            });
        }

        // 🟢 Bakala de Troya (Sets) Stagger
        const setsList = document.querySelector('.sets-list');
        if (setsList) {
            gsap.to('.set-row', {
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '#sets',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // 🟢 HORIZONTAL SCROLL 360 (Awwwards Wow Effect)
        const hContainer = document.querySelector('.h-scroll-container');
        const hTrack = document.querySelector('.h-scroll-track');
        const hPanels = gsap.utils.toArray('.h-panel');

        if (hContainer && hTrack && hPanels.length > 0) {
            // 📏 Progress bar indicator
            const progressBar = document.createElement('div');
            progressBar.className = 'h-scroll-progress';
            progressBar.id = 'hScrollProgress';
            document.body.appendChild(progressBar);

            // Main GSAP tween for horizontal movement
            const scrollTween = gsap.to(hTrack, {
                x: () => -(hTrack.scrollWidth - window.innerWidth),
                ease: "none",
                scrollTrigger: {
                    trigger: hContainer,
                    pin: true,
                    scrub: 1.2,
                    start: "top top",
                    end: () => "+=" + (hTrack.scrollWidth - window.innerWidth),
                    invalidateOnRefresh: true,
                    snap: {
                        snapTo: 1 / (hPanels.length - 1),
                        duration: { min: 0.25, max: 0.6 },
                        delay: 0.1,
                        ease: "power1.inOut"
                    },
                    onUpdate: (self) => {
                        // Update progress bar width
                        progressBar.style.width = `${self.progress * 100}%`;
                    }
                }
            });

            // 🟢 VELOCITY SKEW (Thermodynamic Weight on drag/scroll)
            let proxy = { skew: 0 };
            const skewSetter = gsap.quickSetter(hPanels, "skewX", "deg");
            const clampSkew = gsap.utils.clamp(-12, 12); 

            ScrollTrigger.create({
                onUpdate: (self) => {
                    const targetSkew = clampSkew(self.getVelocity() / -150);
                    
                    if (Math.abs(targetSkew - proxy.skew) > 0.1) {
                        proxy.skew = targetSkew;
                        gsap.to(proxy, {
                            skew: 0,
                            duration: 0.8,
                            ease: "power3",
                            overwrite: true,
                            onUpdate: () => skewSetter(proxy.skew)
                        });
                    }
                }
            });

            // 🟢 PANEL REVEAL ANIMATIONS (Scale + Blur + Opacity)
            hPanels.forEach((panel, i) => {
                // Skip first panel (already visible)
                if (i === 0) return;

                gsap.fromTo(panel, 
                    { opacity: 0.3, scale: 0.92, filter: 'blur(8px)' },
                    { 
                        opacity: 1, scale: 1, filter: 'blur(0px)',
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: scrollTween,
                            start: "left 85%",
                            end: "left 40%",
                            scrub: true
                        }
                    }
                );
            });

            // 🟢 PARALLAX HEADINGS (Container Animation)
            hPanels.forEach(panel => {
                const heading = panel.querySelector('.section-heading');
                if (heading) {
                    gsap.fromTo(heading, 
                        { x: 100 }, 
                        { 
                            x: -60, ease: "none",
                            scrollTrigger: {
                                trigger: panel,
                                containerAnimation: scrollTween,
                                start: "left right",
                                end: "right left",
                                scrub: true
                            }
                        }
                    );
                }
            });
        }
    };

    // 4. BIZARRE MODE (Easter Egg)
    const bToggle = document.getElementById('bizarreToggle');
    if (bToggle) {
        bToggle.addEventListener('click', () => {
            document.body.classList.toggle('bizarre-mode');
        });
    }

    // 5. WORKS FILTERING (O(1) Data binding)
    const initWorks = () => {
        const filterBar = document.getElementById('filterBar');
        const worksGrid = document.getElementById('worksGrid');
        
        if (!filterBar || !worksGrid || typeof DATA === 'undefined') return;

        // Render Filters
        let filterHtml = '';
        DATA.categories.forEach((cat, index) => {
            const active = index === 0 ? 'active' : '';
            filterHtml += `<button class="filter-btn ${active}" data-filter="${cat.id}">${cat.label}</button>`;
        });
        filterBar.innerHTML = filterHtml;

        // Render Works
        const renderGrid = (filterId) => {
            worksGrid.innerHTML = '';
            let itemsToRender = DATA.works;
            
            if (filterId !== 'all') {
                itemsToRender = DATA.works.filter(w => w.categories.includes(filterId));
            }

            let gridHtml = '';
            itemsToRender.forEach(work => {
                // Guaranteed YouTube high-quality thumbnail (hqdefault vs maxresdefault)
                const thumbUrl = `https://img.youtube.com/vi/${work.id}/hqdefault.jpg`;
                const ytLink = `https://www.youtube.com/watch?v=${work.id}`;

                gridHtml += `
                    <div class="work-card">
                        <a href="${ytLink}" target="_blank" class="work-link" aria-label="${work.title}"></a>
                        <div class="work-thumb" style="background-image: url('${thumbUrl}')"></div>
                        <div class="work-info">
                            <h3 class="work-title">${work.title}</h3>
                            <div class="work-desc">${work.desc}</div>
                        </div>
                    </div>
                `;
            });
            worksGrid.innerHTML = gridHtml;
        };

        // Initial render
        renderGrid('all');

        // Filter events
        filterBar.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                // Remove active from all
                Array.from(filterBar.children).forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                renderGrid(e.target.getAttribute('data-filter'));
            }
        });
    };

    initWorks();

    // 6. CANVAS PARTICLES → SOVEREIGN SWARM (Enjambre IA)
    const initSwarm = () => {
        const canvas = document.getElementById('particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        const config = {
            count: window.innerWidth > 768 ? 120 : 60, // Less on mobile
            maxDistance: 120,    // Connection radius
            mouseRadius: 150,    // Attraction radius
            baseSpeed: 0.4,
            pulseForce: 5        // Click explosion force
        };
        
        // Track mouse position
        let mouse = { x: -1000, y: -1000, pressed: false };
        let isPulsing = false;

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            // Optionally, reinitialize the swarm here if needed
            // initSwarm(false); 
        };

        window.addEventListener('resize', resize);
        resize();

// =========================================================================
// NO TOCAR JUMPSCARE LOGIC
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const noTocarBtn = document.getElementById('no-tocar-btn');
    const elonOverlay = document.getElementById('elon-jumpscare-overlay');
    if (noTocarBtn && elonOverlay) {
        noTocarBtn.addEventListener('click', () => {
            elonOverlay.style.display = 'flex';
            elonOverlay.style.animation = 'elonShake 0.05s infinite';
            
            // Sonido infernal usando Web Audio API
            try {
                const ac = new (window.AudioContext || window.webkitAudioContext)();
                if (ac.state === 'suspended') ac.resume();
                
                const osc = ac.createOscillator();
                const fmOsc = ac.createOscillator();
                const fmGain = ac.createGain();
                const gainNode = ac.createGain();
                
                // FM Modulation for chaos
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
            } catch(e) { console.error('Audio failed:', e); }

            setTimeout(() => {
                elonOverlay.style.display = 'none';
                elonOverlay.style.animation = 'none';
            }, 2000);
        });
    }
});
        // Mouse Events
        document.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        document.addEventListener('mousedown', () => {
            mouse.pressed = true;
            isPulsing = true;
            // Pulse outward
            particles.forEach(p => p.pulse(config.pulseForce));
            setTimeout(() => isPulsing = false, 300); // Visual flash duration
        });

        document.addEventListener('mouseup', () => {
            mouse.pressed = false;
        });

        // Global memory nodes (fetched from KV backend)
        let historicalNodes = [];

        // Fetch long-term memory (Sovereign Swarm Collective Memory)
        const loadMemory = async () => {
            try {
                const res = await fetch('/api/marks');
                if (res.ok) {
                    const marks = await res.json();
                    if (Array.isArray(marks)) {
                        historicalNodes = marks.filter(m => typeof m.x === 'number' && typeof m.y === 'number');
                    }
                }
            } catch (e) {
                console.log("[CORTEX] Collective Memory API not available.");
            }

            // Init the swarm after fetching memory
            initNodes();
        };

        const initNodes = () => {
            particles = [];
            
            // 1. Base ambient nodes (for the void)
            const baseCount = window.innerWidth > 768 ? 40 : 20;
            for (let i = 0; i < baseCount; i++) {
                particles.push(new Node());
            }

            // 2. Memory nodes (visitors' footprints)
            historicalNodes.forEach(mark => {
                // marks are saved as percentages (0-100)
                const xPos = (mark.x / 100) * width;
                const yPos = (mark.y / 100) * height;
                particles.push(new Node(xPos, yPos));
            });
        };

        class Node {
            constructor(startX = null, startY = null) {
                this.x = startX !== null ? startX : Math.random() * width;
                this.y = startY !== null ? startY : Math.random() * height;
                this.isMemory = startX !== null;
                
                // Memory nodes are slower, ambient nodes flit around
                const speedMult = this.isMemory ? (config.baseSpeed * 0.4) : config.baseSpeed;
                this.vx = (Math.random() - 0.5) * speedMult;
                this.vy = (Math.random() - 0.5) * speedMult;
                
                this.baseSize = Math.random() * 1.5 + 0.5;
                if (this.isMemory) this.baseSize += 1.2; // Memory anchors are larger
                this.size = this.baseSize;
                this.mass = this.isMemory ? this.size * 2 : this.size; // Memory is heavier
            }

            pulse(force) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < config.mouseRadius * 1.5) {
                    const angle = Math.atan2(dy, dx);
                    // Heavy memory nodes get pushed less
                    const massFriction = this.isMemory ? 0.4 : 1.0; 
                    this.vx += Math.cos(angle) * force * (1 / (dist * 0.05 + 1)) * massFriction;
                    this.vy += Math.sin(angle) * force * (1 / (dist * 0.05 + 1)) * massFriction;
                }
            }

            update() {
                // Flocking / Mouse Attraction
                if (mouse.x > 0 && mouse.y > 0) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < config.mouseRadius && !mouse.pressed) {
                        const force = (config.mouseRadius - dist) / config.mouseRadius;
                        const angle = Math.atan2(dy, dx);
                        // Memory nodes are more stubborn, hard to pull
                        const pullFactor = this.isMemory ? 0.01 : 0.03;
                        this.vx += Math.cos(angle) * force * pullFactor;
                        this.vy += Math.sin(angle) * force * pullFactor;
                    }
                }

                // --- SPATIAL AUDIO REACTIVITY ---
                // Read CSS variables generated by spatial-audio.js
                const root = document.documentElement;
                const rawEnergy = parseFloat(root.style.getPropertyValue('--spatial-energy-raw')) || 0;
                const rawBass = parseFloat(root.style.getPropertyValue('--spatial-bass-raw')) || 0;
                
                // Enjambre "breathes" with the energy
                let currentSize = this.size + (rawBass * 2.5);
                
                // If it's a huge bass drop, add a tiny bit of random outward velocity
                if (rawBass > 0.8 && Math.random() < 0.1) {
                    this.vx += (Math.random() - 0.5) * rawBass * 2;
                    this.vy += (Math.random() - 0.5) * rawBass * 2;
                }

                // Apply velocity with damping (friction) - memory nodes have more friction (stop faster)
                this.x += this.vx * (1 + rawEnergy * 0.5); // Faster when there is energy
                this.y += this.vy * (1 + rawEnergy * 0.5);
                this.vx *= this.isMemory ? 0.94 : 0.98;
                this.vy *= this.isMemory ? 0.94 : 0.98;

                // Enforce minimum base wandering speed
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const minSpeed = this.isMemory ? (config.baseSpeed * 0.3) : config.baseSpeed;
                
                if (speed < minSpeed) {
                    const angle = Math.atan2(this.vy, this.vx) + (Math.random() - 0.5) * 0.5;
                    this.vx = Math.cos(angle) * minSpeed;
                    this.vy = Math.sin(angle) * minSpeed;
                }

                // Wrap smoothly
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
                
                // Store reactive size for rendering
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

        // Initialize by fetching memory first
        loadMemory();

        // Create a HUD for collective memory count
        const memoryHud = document.createElement('div');
        memoryHud.style.position = 'fixed';
        memoryHud.style.bottom = '20px';
        memoryHud.style.left = '20px';
        memoryHud.style.color = 'var(--accent-primary)';
        memoryHud.style.fontFamily = 'var(--font-mono)';
        memoryHud.style.fontSize = '10px';
        memoryHud.style.letterSpacing = '1px';
        memoryHud.style.zIndex = '1000';
        memoryHud.style.pointerEvents = 'none';
        memoryHud.style.opacity = '0.5';
        memoryHud.style.textTransform = 'uppercase';
        document.body.appendChild(memoryHud);

        const updateHud = () => {
            const memoryCount = particles.filter(p => p.isMemory).length;
            memoryHud.textContent = `Ω_COLLECTIVE_MEMORY: ${memoryCount} NODES`;
        };

        // Expose add node function globally for memory injection
        window.addSwarmNode = (x, y) => {
            particles.push(new Node(x, y));
            updateHud();
            
            // Trigger a mini pulse from the new node's origin
            particles.forEach(p => {
                const dx = p.x - x;
                const dy = p.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
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
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.maxDistance) {
                        // Opacity based on distance
                        let opacity = 1 - (distance / config.maxDistance);
                        // Make connections flash white during a pulse
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
            // Dark trail effect for motion blur
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

    initSwarm();

    // 7. CHATQUITO (Frontier AI mock)
    const initChat = () => {
        const chatquito = document.getElementById('chatquito');
        const closeBtn = document.getElementById('chatquitoClose');
        const openBtn = document.getElementById('chatquitoOpen');
        const input = document.getElementById('chatquitoInput');
        const body = document.getElementById('chatquitoBody');

        if (!chatquito) return;

        // Auto-show after some time
        setTimeout(() => {
            if (!chatquito.classList.contains('active')) {
                chatquito.classList.add('active');
                if (openBtn) openBtn.style.transform = 'scale(0)';
            }
        }, 5000);

        closeBtn.addEventListener('click', () => {
            chatquito.classList.remove('active');
            if (openBtn) openBtn.style.transform = 'scale(1)';
        });

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                chatquito.classList.add('active');
                openBtn.style.transform = 'scale(0)';
            });
        }

        const botResponses = [
            "Procesando tu solicitud. Dame un momento...",
            "Interesante. Continúa.",
            "Sincronizando datos...",
            "La conexión es estable. Te escucho.",
            "Error 404: Respuesta no encontrada, pero sigo intentándolo.",
            "Entendido. Ejecutando la consulta.",
            "Generando respuesta automática...",
            "El sistema está al máximo rendimiento.",
            "Interesante punto de vista.",
            "Procesando tokens de lenguaje natural..."
        ];

        // Simple echo response for now
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim() !== '') {
                const msg = input.value.trim();
                input.value = '';
                
                // Add user msg
                body.innerHTML += `<div class="chat-msg user">${msg}</div>`;
                body.scrollTop = body.scrollHeight;

                const typingId = 'typing-' + Date.now();
                body.innerHTML += `<div id="${typingId}" class="chat-msg bot" style="opacity: 0.5;">Escribiendo...</div>`;
                body.scrollTop = body.scrollHeight;

                // Serverless API call to Frontier AI (Gemini) Function
                fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: msg })
                })
                .then(r => r.json())
                .then(data => {
                    const typingEl = document.getElementById(typingId);
                    if (typingEl) typingEl.remove();

                    // If API is not configured or fails, fallback to hardcoded mock
                    if (data && data.reply) {
                        body.innerHTML += `<div class="chat-msg bot">${data.reply}</div>`;
                    } else {
                        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
                        body.innerHTML += `<div class="chat-msg bot">${randomResponse}</div>`;
                    }
                    body.scrollTop = body.scrollHeight;
                })
                .catch(err => {
                    // Fallback on network error
                    const typingEl = document.getElementById(typingId);
                    if (typingEl) typingEl.remove();
                    const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
                    body.innerHTML += `<div class="chat-msg bot">${randomResponse}</div>`;
                    body.scrollTop = body.scrollHeight;
                });
            }
        });
    };

    initChat();

    // 8. MAGNETIC CURSOR (Awwwards Standard)
    class MagneticCursor {
        constructor() {
            this.cursor = document.querySelector('.cursor');
            this.magneticCursor = document.querySelector('.magnetic-cursor');
            if (!this.cursor && !this.magneticCursor) return;
            
            this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            this.target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            this.lerp = 0.15; // Snappy lerp
            this.magnetStrength = 0.4;
            this.isHovering = false;

            document.addEventListener('mousemove', (e) => {
                this.target.x = e.clientX;
                this.target.y = e.clientY;
            });

            this.initTargets();
            this.raf();
        }

        initTargets() {
            // Apply magnetism to links and buttons
            const targets = document.querySelectorAll('a, button, .filter-btn');
            targets.forEach(el => {
                el.addEventListener('mouseenter', () => this.onEnter(el));
                el.addEventListener('mouseleave', () => this.onLeave(el));
                el.addEventListener('mousemove', (e) => this.onMove(e, el));
            });
        }

        onMove(e, el) {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            if(typeof gsap !== 'undefined') {
                gsap.to(el, {
                    x: x * this.magnetStrength,
                    y: y * this.magnetStrength,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            }
        }

        onEnter(el) {
            this.isHovering = true;
            if(typeof gsap !== 'undefined') {
                gsap.to(this.cursor, { 
                    scale: 2.5, 
                    duration: 0.3 
                });
            }
        }

        onLeave(el) {
            this.isHovering = false;
            if(typeof gsap !== 'undefined') {
                gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
                gsap.to(this.cursor, { 
                    scale: 1,
                    duration: 0.3 
                });
            }
        }

        raf() {
            this.pos.x += (this.target.x - this.pos.x) * this.lerp;
            this.pos.y += (this.target.y - this.pos.y) * this.lerp;
            
            if(typeof gsap !== 'undefined') {
                gsap.set(this.cursor, { 
                    x: this.pos.x - 16, // Center offset (width/2 of 32px)
                    y: this.pos.y - 16 
                });
            } else {
                if (this.cursor) {
                    this.cursor.style.transform = `translate3d(${this.pos.x - 16}px, ${this.pos.y - 16}px, 0)`;
                }
                if (this.magneticCursor) {
                    this.magneticCursor.style.transform = `translate3d(${this.pos.x - 10}px, ${this.pos.y - 10}px, 0)`;
                }
            };
            
            requestAnimationFrame(() => this.raf());
        }
    }

    // Initialize cursor if not on mobile
    if (window.innerWidth > 768) {
        window.magneticCursor = new MagneticCursor();
    }

    // 9. DRAGGABLE WINDOWS (Music Lab)
    const initDraggableWindows = () => {
        const windows = document.querySelectorAll('.drag-window');
        
        windows.forEach(win => {
            const header = win.querySelector('.drag-header');
            const closeBtn = win.querySelector('.drag-close');
            let isDragging = false;
            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            // Simple close functionality
            if(closeBtn) {
                closeBtn.addEventListener('click', () => {
                    win.style.display = 'none';
                });
            }

            if(header) {
                header.addEventListener('mousedown', dragStart);
                document.addEventListener('mouseup', dragEnd);
                document.addEventListener('mousemove', drag);
            }

            // Bring to front on mousedown
            win.addEventListener('mousedown', () => {
                windows.forEach(w => w.style.zIndex = 10);
                win.style.zIndex = 20;
            });

            function dragStart(e) {
                const rect = win.getBoundingClientRect();
                const parentRect = win.parentElement.getBoundingClientRect();
                
                // Get offset from transform if it exists, otherwise use top/left
                const style = window.getComputedStyle(win);
                const transform = style.getPropertyValue('transform');
                
                if (transform && transform !== 'none') {
                    const matrix = new DOMMatrixReadOnly(transform);
                    xOffset = matrix.m41;
                    yOffset = matrix.m42;
                } else {
                    xOffset = 0;
                    yOffset = 0;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || e.target.parentElement === header) {
                    isDragging = true;
                    document.body.classList.add('is-dragging-window');
                }
            }

            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                document.body.classList.remove('is-dragging-window');
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }
        });
    };

    initDraggableWindows();

    // ═══════════════════════════════════════════════════════════════════
    // 9.5 SOVEREIGN BRIDGES (Ω_BANDCAMP)
    // ═══════════════════════════════════════════════════════════════════
    const initSovereignBridges = () => {
        const workspace = document.getElementById('labWorkspace');
        if (!workspace || !DATA.bandcampPlayers) return;

        DATA.bandcampPlayers.forEach((player, index) => {
            const win = document.createElement('div');
            win.className = 'drag-window';
            win.id = `bc-bridge-${index}`;
            // Spread them out a bit
            const top = 100 + (index * 40);
            const left = 30 + (index * 5);
            win.style.top = `${top}px`;
            win.style.left = `${left}%`;
            win.style.zIndex = "15";

            win.innerHTML = `
                <div class="drag-header">
                    <span class="drag-title">Ω_BRIDGE_${player.slug.toUpperCase()}.SYS</span>
                    <span class="drag-close">✕</span>
                </div>
                <div class="drag-body" style="padding: 0; line-height: 0;">
                    <iframe title="Bandcamp Player" src="https://bandcamp.com/EmbeddedPlayer/album=${player.id}/size=large/bgcol=1a1a1a/linkcol=b4ff00/tracklist=false/transparent=true/" width="350" height="350" seamless allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
                </div>
            `;
            workspace.appendChild(win);
        });

        // Re-run draggable init to include new windows
        initDraggableWindows();
    };

    if (DATA.bandcampPlayers && DATA.bandcampPlayers.length > 0) {
        initSovereignBridges();
    }

    // 10. PUNTAZOS (PERMANENT MARKS) & ARTISTIC INSULTS
    const initPuntazos = async () => {
        let markCount = 0;
        const INSULT_THRESHOLD = 15;
        const FIBONACCI_SEQ = [5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
        
        // Insults array (Bizarre / Industrial Noir aesthetic)
        const insults = [
            "Tranquilo, Pollock. La pantalla se limpia sola, pero tu neurosis no.",
            "Has dejado más manchas que narrativa. Suficiente.",
            "Axioma 7: El exceso de interacción denota pánico sistémico. Para.",
            "No estás creando arte, estás ensuciando el viewport.",
            "Tanta energía cinética desperdiciada en el vacío digital.",
            "¿Te pagan por hacer clic o es solo ansiedad no resuelta?",
            "Esa urgencia táctil... Háztelo mirar."
        ];

        // Create Modal HTML
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

        if(closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                markCount = 0; // Reset counter
            });
        }

        // Listen to clicks to create new marks
        document.addEventListener('click', async (e) => {
            // Prevent if clicking on interactive elements
            const isInteractive = e.target.closest('a, button, input, textarea, select, .hero-sound-toggle, .custom-cursor, .cursor-text, .artistic-insult-modal, .puntazo');
            if (isInteractive) return;

            // Calculate percentage based on current document scroll dimensions
            const scrollWidth = document.documentElement.scrollWidth || window.innerWidth;
            const scrollHeight = document.documentElement.scrollHeight || window.innerHeight;
            
            const xPct = (e.pageX / scrollWidth) * 100;
            const yPct = (e.pageY / scrollHeight) * 100;

            // Render locally instantly in the Swarm
            if (typeof window.addSwarmNode === 'function') {
                window.addSwarmNode(e.pageX, e.pageY);
            }
            markCount++;

            // Trigger Golden Ratio (Fibonacci) Jumpscare
            if (FIBONACCI_SEQ.includes(markCount) && jumpscareOverlay) {
                jumpscareOverlay.classList.add('active');
                
                // Random glitch words
                const glitchWords = ['OBEY', 'ENTROPIA', 'VACÍO', 'CORTEX', 'PANIC'];
                const content = jumpscareOverlay.querySelector('.jumpscare-content');
                if(content) {
                    const txt = glitchWords[Math.floor(Math.random() * glitchWords.length)];
                    content.textContent = txt;
                    content.setAttribute('data-text', txt);
                }

                // Alternate background based on intensity
                if (markCount > 21) {
                    jumpscareOverlay.style.background = 'white';
                    jumpscareOverlay.style.color = 'black';
                } else {
                    jumpscareOverlay.style.background = 'red';
                    jumpscareOverlay.style.color = 'white';
                }

                // Remove after 150-250ms
                setTimeout(() => {
                    jumpscareOverlay.classList.remove('active');
                }, 150 + Math.random() * 100);
            }

            // Save to backend without blocking
            try {
                fetch('/api/marks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ x: xPct, y: yPct })
                });
            } catch(err) {}

            // Trigger insult if they spam clicks past threshold, and it's NOT a jumpscare turn
            if (markCount >= INSULT_THRESHOLD && !FIBONACCI_SEQ.includes(markCount) && modal) {
                if (!modal.classList.contains('active')) {
                    const randomInsult = insults[Math.floor(Math.random() * insults.length)];
                    insultText.textContent = randomInsult;
                    modal.classList.add('active');
                }
            }
        });
    };

    // Delay initialization slightly to prioritize core rendering
    setTimeout(initPuntazos, 1000);
    
    // ═══════════════════════════════════════════════════════════════════
    // MULTILINGUAL MORPHING TEXT (10 Languages)
    // ═══════════════════════════════════════════════════════════════════
    const initMultilingualMorph = () => {
        const textElement = document.getElementById('glitchMorphText');
        if (!textElement) return;

        const languages = [
            "borjamoskv.com evoluciona en 10 idiomas.",
            "borjamoskv.com evolves in 10 languages.",
            "borjamoskv.com 10 hizkuntzatan garatzen da.",
            "borjamoskv.com évolue en 10 langues.",
            "borjamoskv.com entwickelt sich in 10 Sprachen.",
            "borjamoskv.com si evolve in 10 lingue.",
            "borjamoskv.com evolui em 10 idiomas.",
            "borjamoskv.com 10の言語で進化します。",
            "borjamoskv.com развивается на 10 языках.",
            "borjamoskv.com 10 taalde inkişaf edir."
        ];

        let currentIndex = 0;
        textElement.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        
        setInterval(() => {
            currentIndex = (currentIndex + 1) % languages.length;
            const nextText = languages[currentIndex];
            
            // Glitch out
            textElement.style.opacity = 0;
            textElement.style.filter = 'blur(4px)';
            textElement.style.transform = 'translateY(10px) scale(0.98)';
            
            setTimeout(() => {
                textElement.textContent = nextText;
                
                // Morph in
                textElement.style.opacity = 1;
                textElement.style.filter = 'blur(0px)';
                textElement.style.transform = 'translateY(0) scale(1)';
            }, 600);
        }, 4500);
    };
    initMultilingualMorph();

    // ═══════════════════════════════════════════════════════════════════
    // AWWWARDS-GRADE VISUAL ENHANCEMENTS (PAINT TRAIL, 3D TILT, GLITCH)
    // ═══════════════════════════════════════════════════════════════════
    
    // 1. Ambient Cursor Paint Trail Effect
    const initCursorTrail = () => {
        const canvas = document.getElementById('cursorTrail');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height;
        let points = [];
        const maxPoints = 50;
        
        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }
        
        window.addEventListener('resize', resize);
        resize();
        
        document.addEventListener('mousemove', (e) => {
            points.push({ x: e.clientX, y: e.clientY, age: 0 });
            if (points.length > maxPoints) points.shift();
        }, {passive: true});
        
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
                const prevPt = points[i-1];
                const xc = (pt.x + prevPt.x) / 2;
                const yc = (pt.y + prevPt.y) / 2;
                ctx.quadraticCurveTo(prevPt.x, prevPt.y, xc, yc);
                pt.age++;
            }
            
            ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
            
            // Decaying brush stroke style
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
    initCursorTrail();

    // 2. 3D Hover Tilt Effect on Cards/Blocks
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
                
                const rotateX = ((y - centerY) / centerY) * -15; // Max 15 deg tilt
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
    init3DHoverTilt();

    // 3. Random Glitch Text Trigger
    const initRandomGlitch = () => {
        if (typeof gsap === 'undefined') return;
        const glitchElements = document.querySelectorAll('.glitch-mega, .glitch-text, .nav-bizarre');
        
        glitchElements.forEach(el => {
            setInterval(() => {
                const originalColor = window.getComputedStyle(el).color;
                gsap.to(el, {
                    duration: 0.1,
                    x: () => Math.random() * 10 - 5,
                    y: () => Math.random() * 10 - 5,
                    skewX: () => Math.random() * 20 - 10,
                    color: Math.random() > 0.5 ? '#CCFF00' : '#FF2A2A',
                    yoyo: true,
                    repeat: 3,
                    onComplete: () => {
                        // Reset to original state
                        gsap.to(el, { x: 0, y: 0, skewX: 0, color: originalColor, duration: 0.1, clearProps: "color" });
                    }
                });
            }, Math.random() * 5000 + 4000);
        });
    };
    initRandomGlitch();

});