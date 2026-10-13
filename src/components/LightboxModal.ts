export class LightboxModal {
  private overlay: HTMLElement;
  private mediaContainer: HTMLElement;
  private titleEl: HTMLElement;
  private metaEl: HTMLElement;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 opacity-0 pointer-events-none transition-opacity duration-300 font-mono';
    
    this.overlay.innerHTML = `
      <div class="w-full max-w-6xl flex items-center justify-between pb-3 border-b border-neutral-800 text-xs mb-4">
        <div class="flex items-center gap-3">
          <span id="lb-title" class="text-white font-bold tracking-wider uppercase font-sans text-sm"></span>
          <span id="lb-meta" class="text-neutral-500 font-mono text-[11px]"></span>
        </div>
        <button id="close-lb-btn" class="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs uppercase tracking-wider rounded">
          [ESC // CLOSE]
        </button>
      </div>
      <div id="lb-media-box" class="relative max-w-full max-h-[82vh] overflow-hidden rounded border border-neutral-800/80 shadow-2xl flex items-center justify-center bg-black">
        <img id="lb-img" src="" alt="" class="max-w-full max-h-[82vh] object-contain" />
      </div>
      <div class="w-full max-w-6xl pt-3 text-center text-neutral-600 text-[10px] tracking-widest uppercase">
        ASPECT RATIO 5:4 CINEMATIC STANDARD // SILVER HALIDE DENSITY // APFS DIGEST
      </div>
    `;

    document.body.appendChild(this.overlay);

    this.mediaContainer = this.overlay.querySelector('#lb-media-box')!;
    this.titleEl = this.overlay.querySelector('#lb-title')!;
    this.metaEl = this.overlay.querySelector('#lb-meta')!;

    this.overlay.querySelector('#close-lb-btn')!.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  public open(mediaUrl: string, title: string, meta: string, isVideo: boolean = false) {
    if (isVideo) {
      this.mediaContainer.innerHTML = `
        <video 
          src="${mediaUrl}" 
          controls 
          autoplay 
          loop 
          playsinline 
          class="max-w-full max-h-[82vh] object-contain"
        ></video>
      `;
    } else {
      this.mediaContainer.innerHTML = `
        <img id="lb-img" src="${mediaUrl}" alt="${title}" class="max-w-full max-h-[82vh] object-contain" />
      `;
    }
    this.titleEl.textContent = title;
    this.metaEl.textContent = meta;
    this.overlay.classList.remove('opacity-0', 'pointer-events-none');
    this.overlay.classList.add('opacity-100', 'pointer-events-auto');
  }

  public close() {
    this.overlay.classList.remove('opacity-100', 'pointer-events-auto');
    this.overlay.classList.add('opacity-0', 'pointer-events-none');
    const video = this.mediaContainer.querySelector('video');
    if (video) {
      video.pause();
    }
  }
}
