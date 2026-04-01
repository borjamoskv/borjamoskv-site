/**
 * KINETIC-PHYSICS-Ω
 * 120Hz Spring & Magnetic Kinematics for CORTEX/Aesthetic-Foundry-Omega.
 * Replaces standard CSS hover/transitions with immediate physical mass and magnetic pull.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') {
    console.warn('GSAP is missing. Kinetic Physics halted.');
    return;
  }

  // Updated selectors to include the new Frontier UI and general links
  const thermalSelector = '.kinetic-surface, [data-kinetic="true"], button, a.cta-primary, a.cta-secondary, .nav-toggle, .frontier-open-btn, .frontier-close, .gambitero-trigger-btn, .footer-link';
  const kineticSurfaces = document.querySelectorAll(thermalSelector);

  kineticSurfaces.forEach(el => {
    // Suppress default focus/select behaviors
    el.style.userSelect = 'none';
    el.style.WebkitTapHighlightColor = 'transparent';
    el.style.outline = 'none';
    
    // Magnetic Hover Tracking
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center (magnetic pull intensity)
      const moveX = (e.clientX - centerX);
      const moveY = (e.clientY - centerY);
      
      gsap.to(el, {
        x: moveX * 0.3, // 30% pull towards cursor
        y: moveY * 0.3,
        scale: 1.05,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // Inner parallax for child elements (e.g., text, icons)
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

    // Add physics mass on PRESS (Tensión Térmica)
    const pressDown = () => {
      gsap.to(el, {
        scale: 0.92,
        duration: 0.1,
        ease: 'power3.out',
        overwrite: 'auto'
      });
      if (el.children.length > 0) {
        gsap.to(el.children, { scale: 0.95, duration: 0.1, ease: 'power3.out' });
      }
    };
    el.addEventListener('mousedown', pressDown);
    el.addEventListener('touchstart', pressDown);

    // Release kinetic energy (Rebote físico + Reset Mágnetico)
    const releasePhysics = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'elastic.out(1.1, 0.4)',
        clearProps: "x,y", // Clean up after spring to prevent layout shifts
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
    el.addEventListener('touchend', releasePhysics);
  });

  console.log(`[AESTHETIC-FOUNDRY] 120Hz Magnetic Kinematics injected on ${kineticSurfaces.length} surfaces.`);
});
