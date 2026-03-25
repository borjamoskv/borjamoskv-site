(function() {
  'use strict';

  let overlay = null;
  let closeTimer = null;

  function isYouTubeVideoUrl(url) {
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return true;
    if (!host.includes('youtube.com')) return false;
    return url.pathname.includes('/watch') || url.pathname.includes('/shorts/') || url.pathname.includes('/embed/');
  }

  function extractVideoId(href) {
    try {
      const url = new URL(href, window.location.href);
      if (!isYouTubeVideoUrl(url)) return null;
      if (url.hostname.replace(/^www\./, '') === 'youtu.be') {
        return url.pathname.split('/').filter(Boolean)[0] || null;
      }
      const searchId = url.searchParams.get('v');
      if (searchId) return searchId;
      const parts = url.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex !== -1 && parts[embedIndex + 1]) return parts[embedIndex + 1];
      const shortsIndex = parts.indexOf('shorts');
      if (shortsIndex !== -1 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];
      return null;
    } catch {
      return null;
    }
  }

  function buildEmbedUrl(videoId) {
    const params = new URLSearchParams({
      autoplay: '1',
      controls: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      iv_load_policy: '3'
    });
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  }

  function unlockFocus() {
    globalThis.MOSKV?.audioFocus?.claim?.('external-embed', {
      reason: 'inpage-video-open',
      resume: false
    });
  }

  function releaseFocus() {
    globalThis.MOSKV?.audioFocus?.release?.('external-embed', {
      reason: 'inpage-video-close',
      resumePrevious: true
    });
  }

  function closeVideoModal() {
    if (!overlay) return;

    window.clearTimeout(closeTimer);
    overlay.classList.remove('is-visible');
    overlay.classList.add('is-exiting');
    document.documentElement.classList.remove('inpage-video-open');

    const frame = overlay.querySelector('iframe');
    if (frame) frame.src = 'about:blank';

    releaseFocus();

    closeTimer = window.setTimeout(() => {
      overlay?.remove();
      overlay = null;
    }, 240);
  }

  function openVideoModal(linkEl) {
    const videoId = extractVideoId(linkEl.getAttribute('href') || '');
    if (!videoId) return;

    closeVideoModal();

    overlay = document.createElement('div');
    overlay.className = 'inpage-video-modal';
    overlay.innerHTML = `
      <div class="inpage-video-backdrop"></div>
      <div class="inpage-video-shell" role="dialog" aria-modal="true" aria-label="Reproductor de vídeo embebido">
        <div class="inpage-video-topline">
          <span class="inpage-video-kicker">REPRODUCCIÓN EMBEBIDA</span>
          <button type="button" class="inpage-video-close" aria-label="Cerrar vídeo">Cerrar</button>
        </div>
        <div class="inpage-video-meta">
          <strong class="inpage-video-title"></strong>
          <span class="inpage-video-note">sin salir de la web · escape para cerrar</span>
        </div>
        <div class="inpage-video-frame-wrap">
          <iframe
            class="inpage-video-frame"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowfullscreen
            loading="eager"
            referrerpolicy="strict-origin-when-cross-origin"
            title="Vídeo embebido"
          ></iframe>
        </div>
      </div>
    `;

    const title = (linkEl.textContent || linkEl.getAttribute('aria-label') || 'Vídeo').replace(/\s+/g, ' ').trim();
    overlay.querySelector('.inpage-video-title').textContent = title;
    overlay.querySelector('.inpage-video-frame').src = buildEmbedUrl(videoId);

    document.body.appendChild(overlay);
    document.documentElement.classList.add('inpage-video-open');
    unlockFocus();

    const closeBtn = overlay.querySelector('.inpage-video-close');
    closeBtn?.addEventListener('click', closeVideoModal);
    overlay.querySelector('.inpage-video-backdrop')?.addEventListener('click', closeVideoModal);
    overlay.querySelector('.inpage-video-shell')?.addEventListener('click', (event) => event.stopPropagation());

    requestAnimationFrame(() => overlay?.classList.add('is-visible'));
  }

  function onKeyDown(event) {
    if (event.key === 'Escape' && overlay) {
      closeVideoModal();
    }
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    const url = new URL(href, window.location.href);
    if (!isYouTubeVideoUrl(url)) return;

    event.preventDefault();
    openVideoModal(link);
  }, true);

  document.addEventListener('keydown', onKeyDown);
})();
