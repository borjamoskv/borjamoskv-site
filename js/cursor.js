/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | CURSOR MODULE (AWWWARDS TIER S++)
 * Magnetic cursor + velocity-reactive distortion field + elastic physics.
 * Trail rendered as GPU-accelerated bezier with glow and afterimage.
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

            // Physics state
            this.pos = { x: globalThis.innerWidth / 2, y: globalThis.innerHeight / 2 };
            this.target = { x: globalThis.innerWidth / 2, y: globalThis.innerHeight / 2 };
            this.velocity = { x: 0, y: 0 };
            this.prevTarget = { x: globalThis.innerWidth / 2, y: globalThis.innerHeight / 2 };
            this.lerp = 0.12;
            this.magnetStrength = 0.22;
            this.isHovering = false;
            this.trail = [];
            this.maxTrail = 24;
            this.speed = 0;

            // Distortion ring element
            this.ring = document.createElement('div');
            this.ring.className = 'cursor-distortion-ring';
            this.ring.setAttribute('aria-hidden', 'true');
            document.body.appendChild(this.ring);

            // Velocity streak element
            this.streak = document.createElement('div');
            this.streak.className = 'cursor-velocity-streak';
            this.streak.setAttribute('aria-hidden', 'true');
            document.body.appendChild(this.streak);

            document.addEventListener('pointermove', (e) => {
                this.prevTarget.x = this.target.x;
                this.prevTarget.y = this.target.y;
                this.target.x = e.clientX;
                this.target.y = e.clientY;
            }, { passive: true });

            document.addEventListener('pointerleave', () => this.onLeave());

            this.initTargets();
            this.raf();
        }

        initTargets() {
            const targets = document.querySelectorAll('a, button, .filter-btn, .nav-link, .player-container');
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
            if (typeof gsap !== 'undefined') {
                if (this.primaryCursor) {
                    gsap.to(this.primaryCursor, {
                        scale: 1.6,
                        opacity: 1,
                        duration: 0.3,
                        ease: 'back.out(2)'
                    });
                }
                gsap.to(this.ring, {
                    scale: 2.5,
                    opacity: 0.6,
                    borderWidth: '1px',
                    duration: 0.4,
                    ease: 'power3.out'
                });
            }
        }

        onLeave(el) {
            this.isHovering = false;
            if (typeof gsap !== 'undefined') {
                if (el) {
                    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
                }
                if (this.primaryCursor) {
                    gsap.to(this.primaryCursor, {
                        scale: 1,
                        opacity: 0.96,
                        duration: 0.3
                    });
                }
                gsap.to(this.ring, {
                    scale: 1,
                    opacity: 0.3,
                    borderWidth: '1.5px',
                    duration: 0.5,
                    ease: 'power2.out'
                });
            }
        }

        raf() {
            // Physics integration
            const dx = this.target.x - this.pos.x;
            const dy = this.target.y - this.pos.y;
            this.velocity.x = dx * this.lerp;
            this.velocity.y = dy * this.lerp;
            this.pos.x += this.velocity.x;
            this.pos.y += this.velocity.y;

            this.speed = Math.hypot(this.velocity.x, this.velocity.y);

            // Trail buffer
            this.trail.push({ x: this.pos.x, y: this.pos.y, speed: this.speed });
            if (this.trail.length > this.maxTrail) this.trail.shift();

            // Position cursor
            if (typeof gsap !== 'undefined' && this.primaryCursor) {
                gsap.set(this.primaryCursor, { x: this.pos.x, y: this.pos.y });
            } else if (this.primaryCursor) {
                this.primaryCursor.style.transform =
                    `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%)`;
            }

            // Distortion ring: follows with more delay, scales with velocity
            const ringScale = 1 + Math.min(this.speed * 0.03, 1.5);
            const ringOpacity = Math.min(0.3 + this.speed * 0.02, 0.9);
            this.ring.style.transform =
                `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%) scale(${ringScale})`;
            this.ring.style.opacity = ringOpacity;

            // Velocity streak: rotation follows movement direction
            if (this.speed > 2) {
                const angle = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI);
                const streakWidth = Math.min(this.speed * 1.5, 80);
                this.streak.style.transform =
                    `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%) rotate(${angle}deg)`;
                this.streak.style.width = `${streakWidth}px`;
                this.streak.style.opacity = Math.min(this.speed * 0.015, 0.6);
            } else {
                this.streak.style.opacity = '0';
            }

            // Expose velocity to CSS for other reactive elements
            document.documentElement.style.setProperty(
                '--cursor-velocity',
                Math.min(this.speed, 30).toFixed(1)
            );

            requestAnimationFrame(() => this.raf());
        }
    }

    const init = () => {
        globalThis.magneticCursor = new MagneticCursor();
    };

    return { init };
})();
