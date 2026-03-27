/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | AUDIO MUTUAL EXCLUSION (SOVEREIGN SILENCE)
 * "nunca dos fuentes de audio distintas sonando a la vez"
 * ═══════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';
  
    let activeIframe = null;
  
    // Listen for iframe focus changes
    window.addEventListener('blur', () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (active && active.tagName === 'IFRAME') {
          if (activeIframe !== active) {
            
            // Reclamar el foco de audio general del sistema CORTEX
            if (globalThis.MOSKV && globalThis.MOSKV.audioFocus) {
                globalThis.MOSKV.audioFocus.claim('iframe-click', { reason: 'iframe-focus' });
            }

            // Silenciar o resetear los otros iframes
            document.querySelectorAll('iframe').forEach(iframe => {
              if (iframe !== active) {
                try {
                  // Intentar APIs suaves primero
                  iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                  iframe.contentWindow?.postMessage('{"method":"pause"}', '*');
  
                  // Para Spotify, Bandcamp y Mixcloud no hay una forma suave sin SDK, 
                  // la forma de abortar el audio es repintar el src.
                  const src = iframe.src || '';
                  if (src.includes('spotify.com') || src.includes('bandcamp.com') || src.includes('mixcloud.com')) {
                      // Solo resetear si están activos para evitar parpadeos en toda la página
                      // Pero si no sabemos si suenan, debemos matar.
                      const clone = iframe.cloneNode(true);
                      iframe.parentNode.replaceChild(clone, iframe);
                  }
                } catch(e) { /* ignore cross-origin frame errors */ }
              }
            });
            activeIframe = active; // Update ref to newly active iframe
          }
        }
      }, 100);
    });

    // Support para cuando el audioFocus se reclama internamente (Lyria, Sovereign Audio, videos en página)
    document.addEventListener('moskv:audio-focus-change', (e) => {
        const owner = e.detail?.activeOwner;
        if (owner && owner !== 'iframe-click') {
            // El sistema CORTEX pide audio (ej. el player in-page). 
            // Cortar iframes externos.
            document.querySelectorAll('iframe').forEach(iframe => {
                try {
                    iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    iframe.contentWindow?.postMessage('{"method":"pause"}', '*');
                    
                    const src = iframe.src || '';
                    if (src.includes('spotify.com') || src.includes('bandcamp.com') || src.includes('mixcloud.com')) {
                        const clone = iframe.cloneNode(true);
                        iframe.parentNode.replaceChild(clone, iframe);
                    }
                } catch(err) {}
            });
            activeIframe = null;
        }
    });
  
  })();
