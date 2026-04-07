/**
 * KINETIC-PHYSICS-Ω v2.1
 * 120Hz Spring & Magnetic Kinematics — DESKTOP ONLY.
 * Mobile devices get zero kinetic overhead (pointer: coarse bailout).
 */

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const kineticSections = document.querySelectorAll('section:not([data-kinetic-skip="true"])');
  kineticSections.forEach((section) => section.classList.add('fx-kinetic-section'));

  const DEBUG_KEY = 'moskv_fx_debug';
  let debugBadge = null;
  let debugTimer = 0;

  const isDebugEnabled = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('fxdebug') === '1' || window.localStorage.getItem(DEBUG_KEY) === '1';
  };

  const setDebugEnabled = (enabled) => {
    window.localStorage.setItem(DEBUG_KEY, enabled ? '1' : '0');
  };

  const updateDebugBadge = () => {
    if (!debugBadge) return;
    const styles = getComputedStyle(root);
    const phase = root.dataset.energyPhase || 'warmup';
    const gravity = styles.getPropertyValue('--cortex-gravity').trim() || '9.8';
    const viscosity = styles.getPropertyValue('--cortex-viscosity').trim() || '0.3';
    debugBadge.textContent = `FX ${phase.toUpperCase()} | g=${gravity} | mu=${viscosity} | sections=${kineticSections.length}`;
  };

  const mountDebugBadge = () => {
    if (debugBadge) return;
    debugBadge = document.createElement('div');
    debugBadge.className = 'fx-debug-badge';
    document.body.appendChild(debugBadge);
    updateDebugBadge();
    debugTimer = window.setInterval(updateDebugBadge, 200);
  };

  const unmountDebugBadge = () => {
    if (debugTimer) {
      window.clearInterval(debugTimer);
      debugTimer = 0;
    }
    if (debugBadge) {
      debugBadge.remove();
      debugBadge = null;
    }
  };

  if (isDebugEnabled()) {
    mountDebugBadge();
  }

  document.addEventListener('keydown', (event) => {
    if (!event.altKey || event.key.toLowerCase() !== 'g') return;
    const nextEnabled = !isDebugEnabled();
    setDebugEnabled(nextEnabled);
    if (nextEnabled) {
      mountDebugBadge();
    } else {
      unmountDebugBadge();
    }
  });

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

  console.log(`[AESTHETIC-FOUNDRY] 120Hz Magnetic Kinematics injected on ${kineticSurfaces.length} surfaces. Section physics owner: ${kineticSections.length} fx-kinetic sections.`);
});
