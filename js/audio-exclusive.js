/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | AUDIO MUTUAL EXCLUSION (SOVEREIGN SILENCE)
 * "nunca dos fuentes de audio distintas sonando a la vez"
 * ═══════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';
  
    let activeIframe = null;
    let activeNativeMedia = null;
  
    const pauseAllIframes = (excludeIframe = null) => {
        document.querySelectorAll('iframe').forEach(iframe => {
            if (iframe !== excludeIframe) {
                try {
                    iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    iframe.contentWindow?.postMessage('{"method":"pause"}', '*');
                    const src = iframe.src || '';
                    if (src.includes('spotify.com') || src.includes('bandcamp.com') || src.includes('mixcloud.com')) {
                        const clone = iframe.cloneNode(true);
                        iframe.parentNode.replaceChild(clone, iframe);
                    }
                } catch(e) { /* ignore cross-origin frame errors */ }
            }
        });
    };

    const pauseAllNativeMedia = (excludeMedia = null) => {
        document.querySelectorAll('video, audio').forEach(media => {
            if (media !== excludeMedia && !media.paused && !media.muted) {
                media.pause();
            }
        });
    };

    // 1. Listen for iframe focus changes (Clicks inside YouTube/Spotify)
    window.addEventListener('blur', () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (active && active.tagName === 'IFRAME') {
          if (activeIframe !== active) {
            
            // Reclamar el foco de audio general del sistema CORTEX
            if (globalThis.MOSKV && globalThis.MOSKV.audioFocus) {
                globalThis.MOSKV.audioFocus.claim('iframe-click', { reason: 'iframe-focus' });
            }

            pauseAllIframes(active);
            pauseAllNativeMedia();
            
            activeIframe = active;
            activeNativeMedia = null;
          }
        }
      }, 100);
    });

    // 2. Listen for Native <video> or <audio> play events using Capture Phase
    document.addEventListener('play', (e) => {
        const target = e.target;
        if (target && (target.tagName === 'VIDEO' || target.tagName === 'AUDIO') && !target.muted) {
            
            if (globalThis.MOSKV && globalThis.MOSKV.audioFocus) {
                globalThis.MOSKV.audioFocus.claim('native-media', { reason: 'native-play' });
            }

            pauseAllIframes();
            pauseAllNativeMedia(target);

            activeNativeMedia = target;
            activeIframe = null;
        }
    }, true);

    // 3. Support for when audioFocus is claimed internally (Lyria, Sovereign Audio)
    document.addEventListener('moskv:audio-focus-change', (e) => {
        const owner = e.detail?.activeOwner;
        if (owner && owner !== 'iframe-click' && owner !== 'native-media') {
            // El sistema CORTEX pide audio (ej. el player in-page). 
            // Cortar todos los reproductores externos y nativos.
            pauseAllIframes();
            pauseAllNativeMedia();
            
            activeIframe = null;
            activeNativeMedia = null;
        }
    });
  
})();
