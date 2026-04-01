/**
 * KINETIC-PHYSICS-Ω v2.1
 * 120Hz Spring & Magnetic Kinematics — DESKTOP ONLY.
 * Mobile devices get zero kinetic overhead (pointer: coarse bailout).
 */

document.addEventListener('DOMContentLoaded', () => {
  // P0: Bail on mobile/touch — zero overhead
  if (matchMedia('(pointer: coarse)').matches) {
    console.log('[KINETIC] Touch device detected. Physics disabled for performance.');
    return;
  }

  if (typeof gsap === 'undefined') {
    console.warn('GSAP is missing. Kinetic Physics halted.');
    return;
  }

  const thermalSelector = '.kinetic-surface, [data-kinetic="true"], button, a.cta-primary, a.cta-secondary, .nav-toggle, .frontier-open-btn, .frontier-close, .gambitero-trigger-btn, .footer-link';
  const kineticSurfaces = document.querySelectorAll(thermalSelector);

  kineticSurfaces.forEach(el => {
    el.style.userSelect = 'none';
    el.style.WebkitTapHighlightColor = 'transparent';
    el.style.outline = 'none';
    
    // Magnetic Hover Tracking
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const moveX = (e.clientX - centerX);
      const moveY = (e.clientY - centerY);
      
      gsap.to(el, {
        x: moveX * 0.3,
        y: moveY * 0.3,
        scale: 1.05,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      if (el.children.length > 0) {
        gsap.to(el.children, {
          x: moveX * 0.15,
          y: moveY * 0.15,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });

    // Press physics
    const pressDown = () => {
      gsap.to(el, { scale: 0.92, duration: 0.1, ease: 'power3.out', overwrite: 'auto' });
      if (el.children.length > 0) {
        gsap.to(el.children, { scale: 0.95, duration: 0.1, ease: 'power3.out' });
      }
    };
    el.addEventListener('mousedown', pressDown);

    // Release kinetic energy
    const releasePhysics = () => {
      gsap.to(el, {
        x: 0, y: 0, scale: 1,
        duration: 0.9,
        ease: 'elastic.out(1.1, 0.4)',
        clearProps: "x,y",
        overwrite: 'auto'
      });
      if (el.children.length > 0) {
        gsap.to(el.children, { 
          x: 0, y: 0, scale: 1, 
          duration: 0.6, 
          ease: 'power2.out',
          clearProps: "x,y,scale"
        });
      }
    };

    el.addEventListener('mouseup', releasePhysics);
    el.addEventListener('mouseleave', releasePhysics);
  });

  console.log(`[AESTHETIC-FOUNDRY] 120Hz Magnetic Kinematics injected on ${kineticSurfaces.length} surfaces.`);
});
