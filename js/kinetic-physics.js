/**
 * KINETIC-PHYSICS-Ω
 * 120Hz Spring Kinematics for CORTEX/Aesthetic-Foundry-Omega
 * Replaces standard CSS hover/transitions with immediate physical mass.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure GSAP is available
  if (typeof gsap === 'undefined') {
    console.warn('GSAP is missing. Kinetic Physics halted.');
    return;
  }

  // Find all elements marked for kinetic interventions
  const thermalSelector = '.kinetic-surface, [data-kinetic="true"], button, a.cta-primary, a.cta-secondary, .terminal-trigger-btn, .nav-toggle, .lyria-btn-primary, .lyria-btn-secondary, .jes-btn-primary, .jes-btn-secondary, .chatquito-open-btn, .chatquito-close, .gambitero-trigger-btn';
  const kineticSurfaces = document.querySelectorAll(thermalSelector);

  kineticSurfaces.forEach(el => {
    // Suppress default focus/select behaviors
    el.style.userSelect = 'none';
    el.style.WebkitTapHighlightColor = 'transparent';
    el.style.outline = 'none';
    
    // Add physics mass on PRESS (Tensión Térmica)
    el.addEventListener('mousedown', () => {
      gsap.to(el, {
        scale: 0.94,
        duration: 0.15,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });

    el.addEventListener('touchstart', () => {
      gsap.to(el, {
        scale: 0.94,
        duration: 0.15,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    });

    // Release kinetic energy (Rebote físico)
    const releasePhysics = () => {
      gsap.to(el, {
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1.2, 0.4)',
        overwrite: 'auto'
      });
    };

    el.addEventListener('mouseup', releasePhysics);
    el.addEventListener('mouseleave', releasePhysics);
    el.addEventListener('touchend', releasePhysics);

    // Minor physics on HOVER
    el.addEventListener('mouseenter', () => {
      gsap.to(el, {
        scale: 1.02,
        duration: 0.3,
        ease: 'power1.out',
        overwrite: 'auto'
      });
    });
  });

  console.log('[AESTHETIC-FOUNDRY] 120Hz Spring Kinematics injected on ' + kineticSurfaces.length + ' surfaces.');
});
