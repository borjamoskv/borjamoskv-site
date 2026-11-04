export class BookViewerModal {
  private overlay: HTMLElement;
  private currentUrl: string = '/ciencia_friccion_libro.pdf';

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className =
      'fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 opacity-0 pointer-events-none transition-opacity duration-300 font-mono';
    this.buildDOM();
    document.body.appendChild(this.overlay);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  }

  public isOpen(): boolean {
    return this.overlay.classList.contains('opacity-100');
  }

  private buildDOM() {
    this.overlay.innerHTML = `
      <div class="relative w-full max-w-6xl h-[92vh] bg-[#0c0c0c] border border-neutral-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        <!-- Reader Header -->
        <div class="p-3 sm:p-4 border-b border-neutral-800 flex items-center justify-between bg-[#121212] gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <span id="book-badge" class="text-amber-500 font-bold text-xs sm:text-sm tracking-widest shrink-0">[TREATISE READER // BM-14]</span>
            <span id="book-subtitle" class="text-neutral-400 text-xs hidden md:inline truncate">THE SCIENCE OF FRICTION (CANONICAL MONOGRAPH)</span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <a id="book-action-link" href="${this.currentUrl}" download class="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors">
              ⬇ DOWNLOAD PDF
            </a>
            <button id="close-book-btn" class="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs uppercase tracking-wider text-neutral-300 rounded transition-colors">
              [ESC // CLOSE]
            </button>
          </div>
        </div>

        <!-- Document / Interactive Frame -->
        <div class="flex-1 w-full bg-[#181818] relative overflow-hidden">
          <iframe 
            id="book-iframe" 
            src="about:blank" 
            class="w-full h-full border-none"
            title="Sovereign Monograph & Simulator Viewer"
          ></iframe>
        </div>

        <!-- Reader Footer -->
        <div class="p-2.5 border-t border-neutral-800 bg-[#101010] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>CHENTSOV GEOMETRY // FISHER INFORMATION METRIC // NON-EQUILIBRIUM THERMODYNAMICS</span>
          <span class="text-amber-500/80">AUTHENTIC SILICON READOUT</span>
        </div>
      </div>
    `;

    this.overlay.querySelector('#close-book-btn')!.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  public open(url?: string, customTitle?: string, customBadge?: string) {
    const targetUrl = url || '/ciencia_friccion_libro.pdf';
    this.currentUrl = targetUrl;

    const iframe = this.overlay.querySelector<HTMLIFrameElement>('#book-iframe');
    const badgeEl = this.overlay.querySelector<HTMLElement>('#book-badge');
    const subtitleEl = this.overlay.querySelector<HTMLElement>('#book-subtitle');
    const actionLink = this.overlay.querySelector<HTMLAnchorElement>('#book-action-link');

    const isHtmlInteractive = targetUrl.endsWith('.html');

    if (iframe) {
      iframe.src = isHtmlInteractive
        ? targetUrl
        : `${targetUrl}#toolbar=1&navpanes=0&scrollbar=1`;
    }

    if (badgeEl) {
      badgeEl.textContent =
        customBadge ||
        (isHtmlInteractive
          ? '[INTERACTIVE TERMINAL // 125 NODES]'
          : targetUrl.includes('aforismos')
            ? '[MONOGRAPH READER // CX-05]'
            : '[TREATISE READER // BM-14]');
    }

    if (subtitleEl) {
      subtitleEl.textContent =
        customTitle ||
        (isHtmlInteractive
          ? 'ELIGE TU TRASTORNO — SIMULADOR C5-REAL'
          : targetUrl.includes('aforismos')
            ? '152 AFORISMOS SIN NATA · PUNTO FIJO Ω (449 KB)'
            : 'THE SCIENCE OF FRICTION (29 PAGES · 34,230 WORDS)');
    }

    if (actionLink) {
      actionLink.href = targetUrl;
      if (isHtmlInteractive) {
        actionLink.removeAttribute('download');
        actionLink.target = '_blank';
        actionLink.rel = 'noopener noreferrer';
        actionLink.textContent = '↗ OPEN FULL TAB';
      } else {
        const filename = targetUrl.split('/').pop() || 'monograph.pdf';
        actionLink.setAttribute('download', filename);
        actionLink.removeAttribute('target');
        actionLink.textContent = targetUrl.includes('aforismos')
          ? '⬇ DOWNLOAD PDF [449KB]'
          : '⬇ DOWNLOAD PDF [3.5MB]';
      }
    }

    this.overlay.classList.remove('opacity-0', 'pointer-events-none');
    this.overlay.classList.add('opacity-100', 'pointer-events-auto');
  }

  public close() {
    this.overlay.classList.remove('opacity-100', 'pointer-events-auto');
    this.overlay.classList.add('opacity-0', 'pointer-events-none');
  }
}
