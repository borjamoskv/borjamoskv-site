import { SectionType, WorkItem, WORKS } from '../data/works';

export class CatalogueModal {
  private overlay: HTMLElement;
  private onSelectWork: (work: WorkItem) => void;
  private activeFilter: SectionType | 'ALL' = 'ALL';
  private searchQuery: string = '';

  constructor(onSelectWork: (work: WorkItem) => void) {
    this.onSelectWork = onSelectWork;
    this.overlay = document.createElement('div');
    this.overlay.className = 'fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300 font-mono';
    this.buildDOM();
    document.body.appendChild(this.overlay);

    // Escape key to close
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  private buildDOM() {
    this.overlay.innerHTML = `
      <div class="relative w-full max-w-4xl max-h-[90vh] bg-[#0d0d0d] border border-neutral-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        <!-- Modal Header -->
        <div class="p-4 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-[#121212]">
          <div class="flex items-center gap-3">
            <span class="text-amber-500 font-bold text-sm tracking-widest">[BM // CATALOGUE]</span>
            <span class="text-neutral-500 text-xs hidden sm:inline">COMPLETE CANONICAL CODEX (01 - ${String(WORKS.length).padStart(2, '0')})</span>
          </div>
          <button id="close-cat-btn" class="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs uppercase tracking-wider text-neutral-300 rounded transition-colors">
            [ESC // CLOSE]
          </button>
        </div>

        <!-- Filter and Search Toolbar -->
        <div class="p-4 border-b border-neutral-800/80 bg-[#161616] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button data-filter="ALL" class="filter-tab px-3 py-1.5 rounded border border-amber-500 bg-amber-500/20 text-amber-400 font-bold">ALL [${WORKS.length}]</button>
            <button data-filter="MUSIC" class="filter-tab px-3 py-1.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200">MUSIC [${WORKS.filter(w => w.section === 'MUSIC').length}]</button>
            <button data-filter="ART" class="filter-tab px-3 py-1.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200">ART [${WORKS.filter(w => w.section === 'ART').length}]</button>
            <button data-filter="COMPLEX SYSTEMS" class="filter-tab px-3 py-1.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200">COMPLEX SYSTEMS [${WORKS.filter(w => w.section === 'COMPLEX SYSTEMS').length}]</button>
          </div>
          <div class="relative min-w-[200px]">
            <input id="cat-search-input" type="text" placeholder="SEARCH TITLE / SPECS..." class="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono" />
          </div>
        </div>

        <!-- Scrollable Grid of Works -->
        <div id="cat-works-grid" class="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Rendered dynamically -->
        </div>

        <!-- Footer Bar -->
        <div class="p-3 border-t border-neutral-800/80 bg-[#101010] text-[10px] text-neutral-500 flex justify-between items-center">
          <span>HIGH EXERGY SOVEREIGN ARCHIVE // HOSTED ON MAC SILICON M3 PRO</span>
          <span class="text-amber-500/80 font-mono">AUTONOMOUS DISPATCH</span>
        </div>
      </div>
    `;

    // Bind Close
    this.overlay.querySelector('#close-cat-btn')!.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Filter Buttons
    const filterTabs = this.overlay.querySelectorAll<HTMLButtonElement>('.filter-tab');
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.forEach((t) => {
          t.className = 'filter-tab px-3 py-1.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200';
        });
        tab.className = 'filter-tab px-3 py-1.5 rounded border border-amber-500 bg-amber-500/20 text-amber-400 font-bold';
        this.activeFilter = tab.getAttribute('data-filter') as SectionType | 'ALL';
        this.renderWorks();
      });
    });

    // Search Input
    const searchInput = this.overlay.querySelector<HTMLInputElement>('#cat-search-input')!;
    searchInput.addEventListener('input', () => {
      this.searchQuery = searchInput.value.toLowerCase().trim();
      this.renderWorks();
    });

    this.renderWorks();
  }

  private renderWorks() {
    const grid = this.overlay.querySelector('#cat-works-grid')!;
    grid.innerHTML = '';

    const filtered = WORKS.filter((w) => {
      const matchesFilter = this.activeFilter === 'ALL' || w.section === this.activeFilter;
      const matchesSearch =
        !this.searchQuery ||
        w.title.toLowerCase().includes(this.searchQuery) ||
        w.catalogNumber.toLowerCase().includes(this.searchQuery) ||
        w.discipline.toLowerCase().includes(this.searchQuery) ||
        w.section.toLowerCase().includes(this.searchQuery);
      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-neutral-600 font-mono text-sm">NO CANONICAL ENTRIES MATCH QUERY [${this.searchQuery}]</div>`;
      return;
    }

    filtered.forEach((work) => {
      const card = document.createElement('div');
      card.className = 'group p-4 bg-[#141414] hover:bg-[#1a1a1a] border border-neutral-800 hover:border-amber-500/50 rounded transition-all cursor-pointer flex flex-col justify-between';
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-amber-500 font-bold text-xs tracking-wider">${work.catalogNumber}</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 uppercase tracking-widest">${work.section}</span>
          </div>
          <h4 class="text-neutral-100 font-bold text-sm tracking-wide mb-1 group-hover:text-amber-400 transition-colors">${work.title}</h4>
          <p class="text-neutral-400 text-xs mb-3 font-sans line-clamp-2">${work.discipline} · ${work.year}</p>
        </div>
        <div class="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
          <span class="text-neutral-500 font-mono text-[11px]">${work.duration || work.format}</span>
          <span class="text-amber-400/90 text-[11px] font-bold tracking-wider group-hover:underline">MOUNT ON DECK ➔</span>
        </div>
      `;
      card.addEventListener('click', () => {
        this.onSelectWork(work);
        this.close();
      });
      grid.appendChild(card);
    });
  }

  public open() {
    this.overlay.classList.remove('opacity-0', 'pointer-events-none');
    this.overlay.classList.add('opacity-100', 'pointer-events-auto');
  }

  public close() {
    this.overlay.classList.remove('opacity-100', 'pointer-events-auto');
    this.overlay.classList.add('opacity-0', 'pointer-events-none');
  }
}
