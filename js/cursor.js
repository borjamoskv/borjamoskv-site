/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | CURSOR MODULE
 * Magnetic cursor with lerp tracking and GSAP hover effects.
 * ═══════════════════════════════════════════════════════════════════
 */

MOSKV.cursor = (() => {
    'use strict';

    class MagneticCursor {
        constructor() {
            this.cursor = document.querySelector('.cursor');
            this.magneticCursor = document.querySelector('.magnetic-cursor');
            this.primaryCursor = this.magneticCursor || this.cursor;
            if (!this.primaryCursor) return;
            
            this.pos = { x: globalThis.innerWidth / 2, y: globalThis.innerHeight / 2 };
            this.target = { x: globalThis.innerWidth / 2, y: globalThis.innerHeight / 2 };
            this.lerp = 0.15;
            this.magnetStrength = 0.18;
            this.isHovering = false;

            document.addEventListener('pointermove', (e) => {
                this.target.x = e.clientX;
                this.target.y = e.clientY;
            });

            document.addEventListener('pointerleave', () => this.onLeave());

            this.initTargets();
            this.raf();
        }

        initTargets() {
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
            if (typeof gsap !== 'undefined') {
                gsap.to(el, {
                    x: x * this.magnetStrength,
                    y: y * this.magnetStrength,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            }
        }

        onEnter() {
            this.isHovering = true;
            if (typeof gsap !== 'undefined' && this.primaryCursor) {
                gsap.to(this.primaryCursor, {
                    scale: 1.08,
                    opacity: 1,
                    duration: 0.25
                });
            }
        }

        onLeave(el) {
            this.isHovering = false;
            if (typeof gsap !== 'undefined') {
                if (el) {
                    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
                }
                if (this.primaryCursor) {
                    gsap.to(this.primaryCursor, {
                        scale: 1,
                        opacity: 0.96,
                        duration: 0.25
                    });
                }
            }
        }

        raf() {
            this.pos.x += (this.target.x - this.pos.x) * this.lerp;
            this.pos.y += (this.target.y - this.pos.y) * this.lerp;
            
            if (typeof gsap === 'undefined') {
                if (this.cursor) {
                    this.cursor.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%)`;
                }
                if (this.magneticCursor) {
                    this.magneticCursor.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%)`;
                }
            } else {
                if (this.primaryCursor) {
                    gsap.set(this.primaryCursor, {
                        x: this.pos.x,
                        y: this.pos.y
                    });
                }
            }
            
            requestAnimationFrame(() => this.raf());
        }
    }

    const init = () => {
        globalThis.magneticCursor = new MagneticCursor();
    };

    return { init };
})();
