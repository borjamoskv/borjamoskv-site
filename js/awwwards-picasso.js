/* 
 * AWWWARDS-PICASSO-Ω: Tensión Heroica y Deconstrucción GSAP
 * Se inyecta rotación 3D y skew a la Hero-Shell basado en el Scroll.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Only run if GSAP and ScrollTrigger are available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // 1. Shatter the Hero on Scroll
        const heroShell = document.querySelector('.hero-shell');
        if (heroShell) {
            gsap.to(heroShell, {
                scrollTrigger: {
                    trigger: "#hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: 1 // Link animation to scroll bar with 1s smoothing
                },
                rotationX: -10,
                rotationZ: 2,
                skewY: 3,
                y: 150,
                opacity: 0.2,
                ease: "power1.inOut",
                transformPerspective: 1000
            });
        }

        // 2. Fragment the Signal Grid Elements
        const signalCards = document.querySelectorAll('.hero-signal-card');
        if (signalCards.length > 0) {
            signalCards.forEach((card, index) => {
                gsap.to(card, {
                    scrollTrigger: {
                        trigger: "#hero",
                        start: "top top",
                        end: "bottom top",
                        scrub: 0.5 + (index * 0.2)
                    },
                    y: -50 * (index + 1),
                    rotation: (index % 2 === 0 ? 5 : -5),
                    z: 50 * index,
                    ease: "none"
                });
            });
        }
        
        // 3. Main Nav Magnetic Reaction to Scroll
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) {
            ScrollTrigger.create({
                start: "top -50",
                end: 99999,
                toggleClass: {className: 'scrolled', targets: '.main-nav'}
            });
        }
    }
});
