/**
 * LAZY LOADER — Dynamic Script Loading for Non-Critical Features
 * Reduces initial page weight by ~700KB (Three.js + Gambitero)
 * 
 * Strategy:
 * - Three.js + morph-shader: loaded on first triggerGlobalMorph() call
 * - Gambitero: loaded on gambitero-trigger button click
 */

(function() {
  'use strict';

  const loaded = new Set();

  function loadScript(src) {
    if (loaded.has(src)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => { loaded.add(src); resolve(); };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadCSS(href) {
    if (loaded.has(href)) return;
    loaded.add(href);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  // ═══ THREE.JS + MORPH SHADER ═══
  // Intercept triggerGlobalMorph — load Three.js only when needed
  let morphLoading = false;
  let morphQueue = [];

  globalThis.triggerGlobalMorph = function(durationMs = 2000) {
    if (typeof THREE !== 'undefined' && globalThis._morphReady) {
      // Already loaded — call the real function
      globalThis._triggerGlobalMorphReal(durationMs);
      return;
    }

    // Queue the call while loading
    morphQueue.push(durationMs);

    if (morphLoading) return;
    morphLoading = true;

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
      .then(() => loadScript('js/morph-shader.js'))
      .then(() => {
        // morph-shader.js sets globalThis.triggerGlobalMorph — save it
        globalThis._triggerGlobalMorphReal = globalThis.triggerGlobalMorph;
        globalThis._morphReady = true;
        // Flush queued calls
        morphQueue.forEach(ms => globalThis._triggerGlobalMorphReal(ms));
        morphQueue = [];
      })
      .catch(err => console.warn('[LAZY] Morph shader load failed:', err));
  };

  // ═══ EL GAMBITERO ═══
  const gambiteroBtn = document.getElementById('gambitero-trigger');
  if (gambiteroBtn) {
    let gambiteroLoaded = false;

    gambiteroBtn.addEventListener('click', function handler(e) {
      if (gambiteroLoaded) return; // Already loaded, gambitero.js handles clicks itself
      gambiteroLoaded = true;
      e.stopImmediatePropagation(); // Prevent this click from being lost

      // Load CSS + JS — gambitero.js self-initializes and binds its own handlers
      loadCSS('gambitero.css');
      loadScript('gambitero.js')
        .then(() => {
          // gambitero.js has self-initialized. Trigger the launch directly.
          if (globalThis.elGambitero) {
            globalThis.elGambitero.launch();
          }
          // Remove our handler — gambitero.js now owns the button
          gambiteroBtn.removeEventListener('click', handler);
        })
        .catch(err => console.warn('[LAZY] Gambitero load failed:', err));
    });
  }
})();
