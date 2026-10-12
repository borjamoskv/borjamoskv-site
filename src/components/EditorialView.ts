import { WorkItem, WORKS } from '../data/works';
import { ReelPlayer } from './ReelPlayer';

export class EditorialView {
  private container: HTMLElement;
  private reelPlayer: ReelPlayer;
  private currentWorkIndex: number = 0;
  private onWorkChange: (work: WorkItem) => void;
  private onOpenBook?: (url: string) => void;
  private onOpenLightbox?: (imgUrl: string, title: string, meta: string) => void;

  constructor(
    container: HTMLElement,
    reelPlayer: ReelPlayer,
    onWorkChange: (work: WorkItem) => void,
    onOpenBook?: (url: string) => void,
    onOpenLightbox?: (imgUrl: string, title: string, meta: string) => void
  ) {
    this.container = container;
    this.reelPlayer = reelPlayer;
    this.onWorkChange = onWorkChange;
    this.onOpenBook = onOpenBook;
    this.onOpenLightbox = onOpenLightbox;

    this.render();
  }

  public setWorkByIndex(index: number) {
    if (index < 0 || index >= WORKS.length) return;
    this.currentWorkIndex = index;
    const work = WORKS[this.currentWorkIndex];
    this.reelPlayer.loadWork(work);
    this.render();
    this.onWorkChange(work);
  }

  public setWorkById(id: string) {
    const idx = WORKS.findIndex((w) => w.id === id);
    if (idx !== -1) {
      this.setWorkByIndex(idx);
    }
  }

  public nextWork() {
    const nextIdx = (this.currentWorkIndex + 1) % WORKS.length;
    this.setWorkByIndex(nextIdx);
  }

  public prevWork() {
    const prevIdx = (this.currentWorkIndex - 1 + WORKS.length) % WORKS.length;
    this.setWorkByIndex(prevIdx);
  }

  public getCurrentWork(): WorkItem {
    return WORKS[this.currentWorkIndex];
  }

  private render() {
    const work = WORKS[this.currentWorkIndex];
    const totalWorks = WORKS.length;
    const pageNumStr = (this.currentWorkIndex + 1).toString().padStart(2, '0');
    const totalStr = totalWorks.toString().padStart(2, '0');

    this.container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-64px)] w-full border-t border-neutral-800">
        
        <!-- LEFT COLUMN: EDITORIAL ESSAY & REEL-TO-REEL DECK (Cols 1-6) -->
        <div class="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-800 bg-[#0a0a0a] text-neutral-200">
          
          <div class="space-y-6">
            <!-- Work Metadata Header -->
            <div class="flex items-center justify-between border-b border-neutral-800/80 pb-4 text-xs font-mono">
              <div class="flex items-center gap-3">
                <span class="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold tracking-wider">
                  ${work.catalogNumber}
                </span>
                <span class="text-neutral-400 uppercase tracking-widest font-bold">
                  // SECTION: ${work.section}
                </span>
              </div>
              <div class="flex items-center gap-2 text-neutral-500">
                <span>YEAR: ${work.year}</span>
                <span class="text-neutral-700">|</span>
                <span class="text-amber-500/90 font-bold">[${pageNumStr} / ${totalStr}]</span>
              </div>
            </div>

            <!-- Title & Discipline -->
            <div>
              <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-sans leading-none mb-3">
                ${work.title}
              </h1>
              <p class="text-sm sm:text-base text-neutral-400 font-mono tracking-wide">
                ${work.discipline} · <span class="text-neutral-500">${work.format}</span>
              </p>
            </div>

            <!-- Curatorial Essay / Manifesto -->
            <div class="prose prose-invert max-w-none text-neutral-300 text-xs sm:text-sm leading-relaxed space-y-3 font-sans">
              <h3 class="font-mono text-xs uppercase tracking-widest text-amber-500 font-bold">
                ${work.essayTitle}
              </h3>
              ${work.essay.map((p) => `<p class="text-neutral-300/90">${p}</p>`).join('')}
            </div>

            <!-- Action Links: Read Online / PDF Download / Bandcamp Store -->
            <div class="flex flex-wrap items-center gap-3 pt-2">
              ${
                work.documentUrl
                  ? `
                <button id="btn-read-online" class="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-xs uppercase tracking-widest rounded shadow transition-all hover:scale-[1.01]">
                  <span>📖 READ ONLINE [INLINE PDF]</span>
                </button>
                <a href="${work.documentUrl}" download="ciencia_friccion_libro.pdf" class="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold font-mono text-xs uppercase tracking-widest rounded border border-neutral-700 shadow transition-all hover:scale-[1.01]">
                  <span>⬇ DOWNLOAD PDF [3.5 MB]</span>
                </a>
              `
                  : ''
              }
              ${
                work.bandcampUrl
                  ? `
                <a href="${work.bandcampUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 font-bold font-mono text-xs uppercase tracking-widest rounded border border-amber-500/40 shadow transition-all hover:scale-[1.01]">
                  <span>ACQUIRE ON BANDCAMP ➔</span>
                </a>
              `
                  : ''
              }
            </div>

            <!-- REEL-TO-REEL DECK COMPONENT CONTAINER -->
            <div id="reel-deck-mount-point" class="pt-2">
              <!-- ReelPlayer mounts here -->
            </div>

            <!-- Technical Specifications Table -->
            <div class="pt-3 border-t border-neutral-800/80">
              <h4 class="font-mono text-[11px] text-neutral-500 uppercase tracking-widest mb-2 font-bold">
                TECHNICAL SPECIFICATIONS // PHYSICAL TELEMETRY
              </h4>
              <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                ${work.specs
                  .map(
                    (s) => `
                  <div class="p-2 rounded bg-[#121212] border border-neutral-800/60 flex flex-col justify-between">
                    <span class="text-[10px] text-neutral-500 uppercase">${s.label}</span>
                    <span class="text-neutral-200 font-medium truncate">${s.value}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>

          <!-- Bottom Pagination Controls -->
          <div class="pt-8 mt-6 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
            <button id="btn-prev-work" class="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-neutral-200 border border-neutral-700/60 rounded uppercase tracking-wider flex items-center gap-2 transition-colors">
              <span>◀ [PREVIOUS]</span>
            </button>
            <span class="text-neutral-500 tracking-widest hidden sm:inline">USE ARROW KEYS [← / →] TO NAVIGATE</span>
            <button id="btn-next-work" class="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-neutral-200 border border-neutral-700/60 rounded uppercase tracking-wider flex items-center gap-2 transition-colors">
              <span>[NEXT] ▶</span>
            </button>
          </div>

        </div>

        <!-- RIGHT COLUMN: 5:4 CINEMATIC ARTWORK FRAME (Cols 7-12) -->
        <div class="lg:col-span-6 relative min-h-[450px] lg:min-h-full bg-neutral-950 overflow-hidden flex items-center justify-center p-4 sm:p-8">
          
          <!-- Background container with optical reticles -->
          <div class="relative w-full h-full max-h-[85vh] flex items-center justify-center">
            
            <!-- Registration / Reticle Marks (+) at 4 corners -->
            <span class="absolute top-2 left-2 text-neutral-600 font-mono text-sm select-none z-10">+</span>
            <span class="absolute top-2 right-2 text-neutral-600 font-mono text-sm select-none z-10">+</span>
            <span class="absolute bottom-2 left-2 text-neutral-600 font-mono text-sm select-none z-10">+</span>
            <span class="absolute bottom-2 right-2 text-neutral-600 font-mono text-sm select-none z-10">+</span>

            <!-- Main 5:4 Aspect Ratio Frame (1350x1080 standard) -->
            <div id="artwork-frame" class="relative overflow-hidden rounded border border-neutral-800/90 shadow-2xl w-full max-w-[620px] aspect-[5/4] bg-black cursor-zoom-in group/img" title="Click to open full-screen lightbox">
              <img 
                src="${work.imageUrl}" 
                alt="${work.title}" 
                class="w-full h-full object-cover filter contrast-110 saturate-[0.85] transition-transform duration-700 group-hover/img:scale-[1.03]"
              />
              
              <!-- Subtle vignette overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

              <!-- Top-Left 5:4 Cinematic Badge -->
              <div class="absolute top-4 left-4 z-10 font-mono text-[9px] text-amber-400/90 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-amber-500/30 uppercase tracking-widest">
                ASPECT RATIO 5:4
              </div>

              <!-- Top-right discipline pill -->
              <div class="absolute top-4 right-4 z-10 font-mono text-[10px] text-neutral-200 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded border border-neutral-700/70 uppercase tracking-widest">
                ${work.section}
              </div>

              <!-- Metadata Badge at bottom left -->
              <div class="absolute bottom-4 left-4 z-10 font-mono text-[11px] text-neutral-300 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded border border-neutral-700/70">
                <span class="text-amber-400 font-bold">${work.catalogNumber}</span> // 
                <span>${work.title}</span> // 
                <span class="text-neutral-400">${work.year}</span>
              </div>

              <!-- Bottom-right zoom icon cue -->
              <div class="absolute bottom-4 right-4 z-10 font-mono text-[10px] text-neutral-400 bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-neutral-800 group-hover/img:text-amber-400 transition-colors">
                [ZOOM ⊕]
              </div>
            </div>

          </div>

        </div>

      </div>
    `;

    // Mount ReelPlayer into its DOM slot
    const mountPoint = this.container.querySelector('#reel-deck-mount-point') as HTMLElement;
    if (mountPoint) {
      mountPoint.appendChild(this.reelPlayer['container']);
    }

    // Attach Prev/Next events
    this.container.querySelector('#btn-prev-work')?.addEventListener('click', () => this.prevWork());
    this.container.querySelector('#btn-next-work')?.addEventListener('click', () => this.nextWork());

    // Attach Read Online Book event
    this.container.querySelector('#btn-read-online')?.addEventListener('click', () => {
      if (this.onOpenBook && work.documentUrl) {
        this.onOpenBook(work.documentUrl);
      }
    });

    // Attach Lightbox event
    this.container.querySelector('#artwork-frame')?.addEventListener('click', () => {
      if (this.onOpenLightbox) {
        this.onOpenLightbox(work.imageUrl, work.title, `${work.catalogNumber} // ${work.section} // ${work.year}`);
      }
    });
  }
}
