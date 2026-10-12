export class BookViewerModal {
  private overlay: HTMLElement;
  private currentPdfUrl: string = '/ciencia_friccion_libro.pdf';

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 opacity-0 pointer-events-none transition-opacity duration-300 font-mono';
    this.buildDOM();
    document.body.appendChild(this.overlay);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  private buildDOM() {
    this.overlay.innerHTML = `
      <div class="relative w-full max-w-6xl h-[92vh] bg-[#0c0c0c] border border-neutral-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        <!-- Reader Header -->
        <div class="p-3 sm:p-4 border-b border-neutral-800 flex items-center justify-between bg-[#121212]">
          <div class="flex items-center gap-3">
            <span class="text-amber-500 font-bold text-xs sm:text-sm tracking-widest">[TREATISE READER // BM-13]</span>
            <span class="text-neutral-400 text-xs hidden md:inline">THE SCIENCE OF FRICTION (480 PAGES · CANONICAL MONOGRAPH)</span>
          </div>
          <div class="flex items-center gap-2">
            <a href="${this.currentPdfUrl}" download="ciencia_friccion_libro.pdf" class="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded transition-colors">
              ⬇ DOWNLOAD PDF [3.5MB]
            </a>
            <button id="close-book-btn" class="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs uppercase tracking-wider text-neutral-300 rounded transition-colors">
              [ESC // CLOSE]
            </button>
          </div>
        </div>

        <!-- PDF Reader Frame -->
        <div class="flex-1 w-full bg-[#181818] relative overflow-hidden">
          <iframe 
            id="book-iframe" 
            src="${this.currentPdfUrl}#toolbar=1&navpanes=0&scrollbar=1" 
            class="w-full h-full border-none"
            title="The Science of Friction Book Viewer"
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

  public open(pdfUrl?: string) {
    if (pdfUrl) {
      this.currentPdfUrl = pdfUrl;
      const iframe = this.overlay.querySelector<HTMLIFrameElement>('#book-iframe');
      if (iframe) {
        iframe.src = `${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`;
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
