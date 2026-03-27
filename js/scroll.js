/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | SCROLL MODULE
 * Lenis smooth scroll, GSAP ScrollTrigger, h-scroll universe,
 * entrance choreography, velocity skew, parallax headings.
 * ═══════════════════════════════════════════════════════════════════
 */

MOSKV.scroll = (() => {
    'use strict';

    let lenisInstance = null;
    let horizontalScrollTrigger = null;
    let navigationBound = false;
    let atmosphereBound = false;
    let infiniteRailsBound = false;

    const getNavOffset = () => {
        const nav = document.getElementById('mainNav');
        if (!nav) return 96;
        return Math.ceil(nav.getBoundingClientRect().height) + 12;
    };

    const scrollToTarget = (targetRef, options = {}) => {
        const id = String(targetRef || '').replace(/^#/, '');
        if (!id) return false;

        const target = document.getElementById(id);
        if (!target) return false;

        const horizontalContainer = document.querySelector('.h-scroll-container');
        const horizontalTrack = document.querySelector('.h-scroll-track');
        const targetPanel = target.closest('.h-panel');

        if (targetPanel && horizontalContainer && horizontalTrack) {
            const horizontalPanels = Array.from(horizontalTrack.querySelectorAll('.h-panel'));
            const panelIndex = Math.max(0, horizontalPanels.indexOf(targetPanel));
            const triggerStart = horizontalScrollTrigger?.start ?? (horizontalContainer.getBoundingClientRect().top + globalThis.scrollY);
            const triggerEnd = horizontalScrollTrigger?.end ?? triggerStart;
            const snapStep = horizontalPanels.length > 1 ? (triggerEnd - triggerStart) / (horizontalPanels.length - 1) : 0;
            const targetY = triggerStart + (snapStep * panelIndex);

            globalThis.scrollTo({ top: targetY, behavior: 'smooth' });
        } else {
            const targetY = target.getBoundingClientRect().top + globalThis.scrollY - getNavOffset();
            if (lenisInstance) {
                lenisInstance.scrollTo(targetY, { duration: 1.1 });
            } else {
                globalThis.scrollTo({ top: targetY, behavior: 'smooth' });
            }
        }

        if (options.updateHash !== false) {
            globalThis.history.replaceState(null, '', `#${id}`);
        }

        return true;
    };

    const initInPageNavigation = () => {
        if (navigationBound) return;
        navigationBound = true;

        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href^="#"]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            if (scrollToTarget(href)) {
                event.preventDefault();
            }
        });

        if (globalThis.location.hash) {
            const initialHash = globalThis.location.hash;
            globalThis.history.replaceState(null, '', globalThis.location.pathname + globalThis.location.search);
            globalThis.setTimeout(() => {
                scrollToTarget(initialHash);
            }, 450);
        }
    };

    const initAtmosphereParallax = () => {
        if (atmosphereBound) return;
        atmosphereBound = true;

        const root = document.documentElement;
        const updatePointerVars = (event) => {
            if (!event) return;
            const x = Math.max(0, Math.min(100, (event.clientX / globalThis.innerWidth) * 100));
            const y = Math.max(0, Math.min(100, (event.clientY / globalThis.innerHeight) * 100));
            root.style.setProperty('--mouse-x', `${x}%`);
            root.style.setProperty('--mouse-y', `${y}%`);
        };

        document.addEventListener('pointermove', updatePointerVars, { passive: true });

        const parallaxTargets = gsap.utils.toArray(
            '.hero-signal-card, .mid-scroll-card, .moltbook-clip-card, .bloga-empty-card, .glass-card, .contact-item'
        );

        parallaxTargets.forEach((card, index) => {
            const depth = 1 + ((index % 4) * 0.22);
            const thumb = card.querySelector('.mid-scroll-thumb, .moltbook-clip-thumb');
            gsap.fromTo(card,
                {
                    y: 28 * depth,
                    x: index % 2 === 0 ? -14 * depth : 14 * depth,
                    rotateX: 6 * depth,
                    rotateY: index % 2 === 0 ? -4 * depth : 4 * depth,
                    scale: 0.98
                },
                {
                    y: -18 * depth,
                    x: 0,
                    rotateX: 0,
                    rotateY: 0,
                    scale: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 88%',
                        end: 'bottom 12%',
                        scrub: 1.1
                    }
                }
            );

            if (thumb) {
                gsap.fromTo(thumb,
                    {
                        y: -10 * depth,
                        scale: 1.08
                    },
                    {
                        y: 10 * depth,
                        scale: 1.16,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 92%',
                            end: 'bottom 8%',
                            scrub: 1.25
                        }
                    }
                );
            }
        });
    };

    const initInfiniteRail = (rail, {
        speed = 0.18,
        wheelFactor = 0.9,
        direction = 1
    } = {}) => {
        if (!rail || rail.dataset.infiniteRail === 'true') return;
        const originals = Array.from(rail.children);
        if (originals.length === 0) return;

        rail.dataset.infiniteRail = 'true';
        rail.style.setProperty('--rail-direction', String(direction));

        const clones = originals.map((child) => {
            const clone = child.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.dataset.railClone = 'true';
            return clone;
        });
        clones.forEach((clone) => rail.appendChild(clone));

        let cycleWidth = 0;
        let paused = false;
        let visible = true;
        let frameId = 0;
        let momentum = 0;
        let velocity = speed * direction;
        let pausedUntil = 0;
        let lastScrollLeft = 0;

        const cards = () => Array.from(rail.querySelectorAll('.mid-scroll-card, .moltbook-clip-card'));

        const measure = () => {
            cycleWidth = rail.scrollWidth / 2;
            if (cycleWidth > 0 && rail.scrollLeft === 0) {
                rail.scrollLeft = cycleWidth * 0.02;
            }
            updateCardDepth();
        };

        const wrap = () => {
            if (!cycleWidth) return;
            if (rail.scrollLeft >= cycleWidth) {
                rail.scrollLeft -= cycleWidth;
            } else if (rail.scrollLeft < 0) {
                rail.scrollLeft += cycleWidth;
            }
        };

        const updateCardDepth = () => {
            const viewportCenter = rail.scrollLeft + (rail.clientWidth / 2);
            const cardList = cards();
            if (cardList.length === 0) return;

            cardList.forEach((card) => {
                const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
                const distance = (cardCenter - viewportCenter) / Math.max(rail.clientWidth, 1);
                const clamped = Math.max(-1.15, Math.min(1.15, distance));
                const focus = 1 - Math.min(1, Math.abs(clamped));
                card.style.setProperty('--rail-offset', clamped.toFixed(3));
                card.style.setProperty('--rail-focus', focus.toFixed(3));
                card.style.setProperty('--thumb-pan', `${Math.round(clamped * 28)}px`);
                card.style.setProperty('--thumb-rise', `${Math.round((focus - 0.5) * -8)}px`);
            });
        };

        const onWheel = (event) => {
            const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
            rail.scrollLeft += dominantDelta * wheelFactor;
            momentum += dominantDelta * 0.0035;
            momentum = Math.max(-3.4, Math.min(3.4, momentum));
            pausedUntil = performance.now() + 1450;
            wrap();
            updateCardDepth();
            event.preventDefault();
        };

        const tick = () => {
            const now = performance.now();
            const autoVelocity = speed * direction;

            if (!paused && visible && cycleWidth > 0) {
                const targetVelocity = now < pausedUntil ? momentum * 0.16 : autoVelocity + momentum;
                velocity += (targetVelocity - velocity) * 0.065;
                rail.scrollLeft += velocity;
                wrap();
                if (Math.abs(rail.scrollLeft - lastScrollLeft) > 0.1) {
                    updateCardDepth();
                    lastScrollLeft = rail.scrollLeft;
                }
            }

            momentum *= 0.94;
            if (Math.abs(momentum) < 0.001) momentum = 0;
            frameId = globalThis.requestAnimationFrame(tick);
        };

        const observer = new IntersectionObserver((entries) => {
            visible = entries.some((entry) => entry.isIntersecting);
        }, {
            threshold: 0.35
        });

        observer.observe(rail);
        rail.addEventListener('wheel', onWheel, { passive: false });
        rail.addEventListener('mouseenter', () => { paused = true; });
        rail.addEventListener('focusin', () => { paused = true; });
        rail.addEventListener('pointerdown', () => { paused = true; });
        rail.addEventListener('touchstart', () => { paused = true; }, { passive: true });
        rail.addEventListener('mouseleave', () => {
            paused = false;
            pausedUntil = performance.now() + 520;
        });
        rail.addEventListener('focusout', () => {
            paused = false;
            pausedUntil = performance.now() + 520;
        });
        rail.addEventListener('scroll', () => {
            wrap();
            updateCardDepth();
        }, { passive: true });
        globalThis.addEventListener('pointerup', () => {
            paused = false;
            pausedUntil = performance.now() + 720;
        }, { passive: true });
        globalThis.addEventListener('resize', measure, { passive: true });

        measure();
        tick();

        rail._moskvInfiniteRail = {
            destroy() {
                globalThis.cancelAnimationFrame(frameId);
                observer.disconnect();
            }
        };
    };

    const initInfiniteRails = () => {
        if (infiniteRailsBound) return;
        infiniteRailsBound = true;

        const midRails = document.querySelectorAll('.mid-scroll-track, .moltbook-clip-rail');
        midRails.forEach((rail, index) => {
            initInfiniteRail(rail, {
                speed: index === 0 ? 0.22 : 0.16,
                wheelFactor: index === 0 ? 0.82 : 0.88,
                direction: index === 0 ? 1 : -1
            });
        });
    };

    const initChoreography = () => {
        // Hero title glitch
        gsap.fromTo('.hero-title', 
            { y: 50, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1.5, ease: 'power4.out', delay: 0.1 }
        );

        // Haiku per-line staggered reveal
        const haikuLines = document.querySelectorAll('.haiku-line');
        if (haikuLines.length > 0) {
            gsap.fromTo(haikuLines,
                { y: 30, opacity: 0, filter: 'blur(10px)' },
                { 
                    y: 0, 
                    opacity: 1, 
                    filter: 'blur(0px)',
                    duration: 1.2, 
                    stagger: 0.8,
                    ease: 'power3.out', 
                    delay: 0.8 
                }
            );
        }

        // Secondary text & CTAs
        gsap.fromTo('.hero-axiom', 
            { y: 30, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 3.2 }
        );

        gsap.fromTo('.hero-ctas a', 
            { y: 20, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 3.5 }
        );

        // Sections Fade Up
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

        // Transmisión Directa (Embeds) Stagger
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

            // Buko Cursor for players section
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

        // Sets Stagger
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

        // H-SCROLL 360
        const hContainer = document.querySelector('.h-scroll-container');
        const hTrack = document.querySelector('.h-scroll-track');
        const hPanels = gsap.utils.toArray('.h-panel');

        if (hContainer && hTrack && hPanels.length > 0) {
            const progressBar = document.createElement('div');
            progressBar.className = 'h-scroll-progress';
            progressBar.id = 'hScrollProgress';
            document.body.appendChild(progressBar);

            const scrollTween = gsap.to(hTrack, {
                x: () => -(hTrack.scrollWidth - globalThis.innerWidth),
                ease: "none",
                scrollTrigger: {
                    trigger: hContainer,
                    pin: true,
                    scrub: 1.2,
                    start: "top top",
                    end: () => "+=" + (hTrack.scrollWidth - globalThis.innerWidth),
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        progressBar.style.width = `${self.progress * 100}%`;
                    }
                }
            });
            horizontalScrollTrigger = scrollTween.scrollTrigger;

            // Velocity Skew
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

            // Panel Reveal Animations
            hPanels.forEach((panel, i) => {
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

            // Parallax Headings
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

        initAtmosphereParallax();
        initInfiniteRails();
    };

    const initAwwwardsScroll = () => {
        if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        });
        lenisInstance = lenis;
        globalThis.MOSKVLenis = lenis;

        lenis.on('scroll', ScrollTrigger.update);
        
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

        initChoreography();
        initInPageNavigation();
    };

    return { initAwwwardsScroll, scrollToTarget };
})();
