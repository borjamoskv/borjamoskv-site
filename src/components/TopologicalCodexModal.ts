import { AudioEngine } from '../audio/AudioEngine';
import {
  AttractorAxis,
  CODEX_NODES,
  CodexDensity,
  CodexNode,
  getCodexNodeBySlug,
} from '../data/codexGraph';
import { WORKS, WorkItem } from '../data/works';

export class TopologicalCodexModal {
  private overlay: HTMLElement;
  private audioEngine: AudioEngine;
  private onSelectWork: (work: WorkItem) => void;
  private onOpenDocument: (url: string, title: string, badge: string) => void;
  private onToast: (msg: string) => void;
  private onHashUpdate: (hash: string) => void;

  private activeNode: CodexNode | null = null;
  private densityFilter: CodexDensity | 'ALL' = 'ALL';
  private axisFilter: AttractorAxis | 'ALL' = 'ALL';
  private searchQuery: string = '';
  private isFormalismMode: boolean = true;

  constructor(
    audioEngine: AudioEngine,
    onSelectWork: (work: WorkItem) => void,
    onOpenDocument: (url: string, title: string, badge: string) => void,
    onToast: (msg: string) => void,
    onHashUpdate: (hash: string) => void
  ) {
    this.audioEngine = audioEngine;
    this.onSelectWork = onSelectWork;
    this.onOpenDocument = onOpenDocument;
    this.onToast = onToast;
    this.onHashUpdate = onHashUpdate;

    this.overlay = document.createElement('div');
    this.overlay.className =
      'fixed inset-0 z-40 bg-black/92 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 opacity-0 pointer-events-none transition-opacity duration-200 font-mono';
    document.body.appendChild(this.overlay);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        // Defer closing if BookViewerModal (z-50) is sitting above us
        const topViewer = document.querySelector('#book-iframe')?.closest('.opacity-100');
        if (topViewer) return;
        this.close();
      }
    });

    this.render();
  }

  public isOpen(): boolean {
    return this.overlay.classList.contains('opacity-100');
  }

  public openIndex() {
    this.activeNode = null;
    this.audioEngine.setReadingFocus(false);
    this.showOverlay();
    this.render();
    this.onHashUpdate('#codex');
  }

  public openNodeBySlug(slug: string): boolean {
    const found = getCodexNodeBySlug(slug);
    if (!found) {
      this.openIndex();
      return false;
    }
    this.activeNode = found;
    this.audioEngine.setReadingFocus(true);
    this.showOverlay();
    this.render();
    this.onHashUpdate(`#codex/${found.slug}`);
    return true;
  }

  private showOverlay() {
    this.overlay.classList.remove('opacity-0', 'pointer-events-none');
    this.overlay.classList.add('opacity-100', 'pointer-events-auto');
  }

  public close(silentHash: boolean = false) {
    if (!this.isOpen()) return;
    this.audioEngine.setReadingFocus(false);
    this.overlay.classList.remove('opacity-100', 'pointer-events-auto');
    this.overlay.classList.add('opacity-0', 'pointer-events-none');
    if (!silentHash && window.location.hash.startsWith('#codex')) {
      this.onHashUpdate('');
    }
  }

  public refreshAudioHeader() {
    if (this.isOpen()) {
      this.render();
    }
  }

  private render() {
    const loopMode = this.audioEngine.getLoopMode();
    const duckState = this.audioEngine.getReadingDuckState();
    const isPlaying = this.audioEngine.getPlaybackState().isPlaying;

    const loopBadgeClass =
      loopMode === 'ARCHIVE'
        ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-300'
        : loopMode === 'DRONE'
          ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300'
          : 'border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-neutral-200';

    this.overlay.innerHTML = `
      <div class="relative w-full max-w-5xl h-[92vh] bg-[#0b0b0b] border border-neutral-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        <!-- Top Bar -->
        <div class="px-4 sm:px-6 py-3.5 border-b border-neutral-800 bg-[#111111] flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="text-amber-500 font-bold text-xs sm:text-sm tracking-widest">[CODEX // TOPOLOGICAL BLOG]</span>
            <span class="text-neutral-600 hidden md:inline">//</span>
            <span class="text-neutral-400 text-[11px] hidden md:inline tracking-wider">FISHER-RAO KNOWLEDGE MANIFOLD · ZERO CHRONOLOGY</span>
          </div>
          <div class="flex items-center gap-2">
            <button id="codex-loop-btn" class="px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider transition-colors ${loopBadgeClass}" title="Cycle V6 Autonomous Tape Installation (Shortcut: L)">
              ∞ LOOP: [${loopMode === 'OFF' ? 'OFF' : loopMode === 'DRONE' ? 'DRONE 7.5' : 'ARCHIVE ∞'}]
            </button>
            <button id="codex-close-btn" class="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs uppercase tracking-wider text-neutral-300 rounded transition-colors">
              [ESC // CLOSE]
            </button>
          </div>
        </div>

        ${this.activeNode ? this.renderArticleView(this.activeNode, duckState.isDucked, duckState.isBypassed, isPlaying) : this.renderMatrixView()}

        <!-- Footer -->
        <div class="px-4 sm:px-6 py-2.5 border-t border-neutral-800/90 bg-[#0f0f0f] text-[10px] text-neutral-500 flex flex-wrap justify-between items-center gap-2">
          <span>BORJA FERNÁNDEZ ANGULO // EXECUTABLE LINER ESSAYS & APHORISMS</span>
          <span class="text-amber-500/80">${this.audioEngine.getCurrentLoopLabel()}</span>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderMatrixView(): string {
    const axes: (AttractorAxis | 'ALL')[] = [
      'ALL',
      'ACOUSTIC PHYSICS',
      'INFORMATION GEOMETRY',
      'WETWARE & 2E',
      'RING-0 & SOVEREIGNTY',
    ];

    const filtered = CODEX_NODES.filter((n) => {
      const matchDensity = this.densityFilter === 'ALL' || n.density === this.densityFilter;
      const matchAxis = this.axisFilter === 'ALL' || n.axis === this.axisFilter;
      const q = this.searchQuery;
      const matchQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.subtitle.toLowerCase().includes(q) ||
        n.code.toLowerCase().includes(q) ||
        n.axis.toLowerCase().includes(q) ||
        n.linkedWorkIds.some((id) => id.toLowerCase().includes(q));
      return matchDensity && matchAxis && matchQuery;
    });

    return `
      <!-- Filter Matrix Controls -->
      <div class="px-4 sm:px-6 py-3.5 border-b border-neutral-800/80 bg-[#141414] flex flex-col gap-3">
        <div class="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <!-- Density Compression Tabs -->
          <div class="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <button data-density="ALL" class="codex-density-btn px-2.5 py-1 rounded border ${this.densityFilter === 'ALL' ? 'border-amber-500 bg-amber-500/20 text-amber-400 font-bold' : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'}">ALL [${CODEX_NODES.length}]</button>
            <button data-density="APHORISM" class="codex-density-btn px-2.5 py-1 rounded border ${this.densityFilter === 'APHORISM' ? 'border-amber-500 bg-amber-500/20 text-amber-400 font-bold' : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'}">APHORISMS [1-3M]</button>
            <button data-density="ESSAY" class="codex-density-btn px-2.5 py-1 rounded border ${this.densityFilter === 'ESSAY' ? 'border-amber-500 bg-amber-500/20 text-amber-400 font-bold' : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'}">ESSAYS [5-6M]</button>
            <button data-density="TREATISE" class="codex-density-btn px-2.5 py-1 rounded border ${this.densityFilter === 'TREATISE' ? 'border-amber-500 bg-amber-500/20 text-amber-400 font-bold' : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'}">TREATISES [PDF]</button>
          </div>

          <!-- Search Box -->
          <div class="relative min-w-[230px]">
            <input id="codex-search-input" type="text" value="${this.escapeAttr(this.searchQuery)}" placeholder="SEARCH CONCEPT / AXIS / BM-ID..." class="w-full bg-[#090909] border border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono" />
          </div>
        </div>

        <!-- Attractor Axis Coordinates -->
        <div class="flex items-center gap-1.5 overflow-x-auto text-[10px]">
          <span class="text-neutral-500 uppercase tracking-widest mr-1 shrink-0">ATTRACTOR:</span>
          ${axes
            .map(
              (ax) => `
            <button data-axis="${ax}" class="codex-axis-btn px-2 py-0.5 rounded border shrink-0 uppercase tracking-wider transition-colors ${
              this.axisFilter === ax
                ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 font-bold'
                : 'border-neutral-800 bg-[#0e0e0e] text-neutral-400 hover:text-neutral-200'
            }">
              ${ax === 'ALL' ? 'ALL COORDINATES' : ax}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
        ${
          filtered.length === 0
            ? `<div class="col-span-full py-16 text-center text-neutral-500 text-xs">NO TOPOLOGICAL CRYSTALS MATCH FILTER [${this.escapeHtml(this.searchQuery)}]</div>`
            : filtered.map((node) => this.renderNodeCard(node)).join('')
        }
      </div>
    `;
  }

  private renderNodeCard(node: CodexNode): string {
    const linkedWorks = node.linkedWorkIds
      .map((id) => WORKS.find((w) => w.id === id))
      .filter((w): w is WorkItem => Boolean(w));

    const densityColor =
      node.density === 'TREATISE'
        ? 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10'
        : node.density === 'ESSAY'
          ? 'text-amber-300 border-amber-500/40 bg-amber-500/10'
          : 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10';

    return `
      <article data-open-slug="${node.slug}" class="codex-card group p-4 sm:p-5 bg-[#131313] hover:bg-[#181818] border border-neutral-800 hover:border-amber-500/60 rounded transition-all cursor-pointer flex flex-col justify-between gap-4">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <div class="flex items-center gap-2">
              <span class="text-amber-400 font-bold text-xs tracking-widest">${node.code}</span>
              <span class="text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${densityColor}">${node.density} · ${node.readingTime}</span>
            </div>
            <span class="text-[10px] text-neutral-500 uppercase tracking-wider truncate">${node.axis}</span>
          </div>

          <h3 class="text-neutral-100 font-black font-sans text-base sm:text-lg leading-snug uppercase tracking-tight mb-1.5 group-hover:text-amber-400 transition-colors">
            ${node.title}
          </h3>
          <p class="text-neutral-400 text-xs font-sans leading-relaxed line-clamp-2">
            ${node.subtitle}
          </p>
        </div>

        <div class="space-y-2.5 pt-3 border-t border-neutral-800/80">
          <!-- Coupled Works Edges -->
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-[9px] text-neutral-500 uppercase tracking-widest mr-0.5">EDGES:</span>
            ${linkedWorks
              .map(
                (w) => `
              <button data-jump-work="${w.id}" class="px-1.5 py-0.5 rounded bg-neutral-900 hover:bg-amber-500/20 border border-neutral-700/80 hover:border-amber-500/50 text-[10px] text-neutral-300 hover:text-amber-300 transition-colors" title="Mount ${w.title} on Studer Deck">
                ${w.catalogNumber} · ${w.title.length > 18 ? w.title.slice(0, 18) + '…' : w.title}
              </button>
            `
              )
              .join('')}
          </div>

          <div class="flex items-center justify-between text-[11px]">
            <div class="flex items-center gap-2 text-neutral-400">
              <span class="text-emerald-400/90">▶ ${node.sonicFootnotes.length} SONIC ${node.sonicFootnotes.length === 1 ? 'PROOF' : 'PROOFS'}</span>
              ${node.pdfUrl ? `<span class="text-cyan-400/90">· PDF</span>` : ''}
              ${node.interactiveUrl ? `<span class="text-amber-400/90">· 125-NODE SIM</span>` : ''}
            </div>
            <span class="text-amber-400 font-bold tracking-wider group-hover:underline">READ CRYSTAL ➔</span>
          </div>
        </div>
      </article>
    `;
  }

  private renderArticleView(
    node: CodexNode,
    isDucked: boolean,
    isBypassed: boolean,
    isPlaying: boolean
  ): string {
    const linkedWorks = node.linkedWorkIds
      .map((id) => WORKS.find((w) => w.id === id))
      .filter((w): w is WorkItem => Boolean(w));

    const adjacentNodes = node.linkedNodeSlugs
      .map((slug) => getCodexNodeBySlug(slug))
      .filter((n): n is CodexNode => Boolean(n));

    return `
      <!-- Tactical Reader Toolbar -->
      <div class="px-4 sm:px-6 py-2.5 border-b border-neutral-800 bg-[#151515] flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <button id="codex-back-btn" class="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-neutral-200 uppercase tracking-wider transition-colors">
          ◀ [MATRIX INDEX]
        </button>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Bimodal Toggle: Bare Scene vs. Full Formalism -->
          <button id="codex-bimodal-btn" class="px-2.5 py-1 rounded border uppercase tracking-wider transition-colors ${
            this.isFormalismMode
              ? 'border-amber-500/60 bg-amber-500/15 text-amber-300 font-bold'
              : 'border-neutral-700 bg-neutral-900 text-neutral-300'
          }" title="Toggle mathematical and topological formalism blocks">
            MODE: [${this.isFormalismMode ? 'FULL FORMALISM' : 'BARE SCENE'}]
          </button>

          <!-- V6 Cognitive Reading Ducking Control -->
          ${
            isPlaying
              ? `
            <button id="codex-duck-btn" class="px-2.5 py-1 rounded border uppercase tracking-wider transition-colors ${
              isDucked
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/50 bg-amber-500/10 text-amber-300'
            }" title="Toggle 2.8 kHz lowpass reading ducking on active tape audio">
              ${isDucked && !isBypassed ? 'TAPE DUCKED: [-10dB @ 2.8kHz]' : 'TAPE LEVEL: [FULL BYPASS]'}
            </button>
          `
              : `
            <button id="codex-start-ambient-btn" class="px-2.5 py-1 rounded border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 uppercase tracking-wider transition-colors">
              ▶ AMBIENT READING DRONE
            </button>
          `
          }

          <!-- Shareable Deep-Link Copy -->
          <button id="codex-share-btn" class="px-2.5 py-1 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 uppercase tracking-wider transition-colors">
            🔗 COPY #LINK
          </button>
        </div>
      </div>

      <!-- Scrollable Lithographic Essay Body -->
      <div class="flex-1 overflow-y-auto px-5 sm:px-12 py-8">
        <div class="max-w-3xl mx-auto space-y-8">
          
          <!-- Editorial Metadata & Title -->
          <header class="space-y-4 border-b border-neutral-800 pb-6">
            <div class="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <span class="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-400 font-bold tracking-widest">${node.code}</span>
              <span>//</span>
              <span class="uppercase tracking-widest text-emerald-400/90">${node.axis}</span>
              <span>//</span>
              <span>${node.density} · ${node.readingTime}</span>
            </div>

            <h1 class="text-2xl sm:text-4xl font-black font-sans text-white uppercase tracking-tight leading-tight">
              ${node.title}
            </h1>

            <p class="text-sm sm:text-base text-neutral-300 font-serif italic leading-relaxed">
              ${node.subtitle}
            </p>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-neutral-400">
              <div>
                <span class="text-neutral-200 font-bold">${node.author}</span>
                <span class="text-neutral-600 mx-1.5">·</span>
                <span>${node.role}</span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                ${
                  node.pdfUrl
                    ? `
                  <button data-open-doc="${node.pdfUrl}" data-doc-title="${this.escapeAttr(node.title)}" data-doc-badge="[MONOGRAPH // ${node.code}]" class="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] uppercase tracking-wider transition-colors">
                    📖 ${node.pdfLabel || 'OPEN INLINE PDF'}
                  </button>
                `
                    : ''
                }
                ${
                  node.interactiveUrl
                    ? `
                  <button data-open-doc="${node.interactiveUrl}" data-doc-title="ELIGE TU TRASTORNO — 125-NODE SIMULATOR" data-doc-badge="[SIMULATOR // ${node.code}]" class="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] uppercase tracking-wider transition-colors">
                    ${node.interactiveLabel || '⚡ LAUNCH SIMULATOR'}
                  </button>
                `
                    : ''
                }
              </div>
            </div>
          </header>

          <!-- Studer A800 Sonic Footnotes Rack -->
          <section class="p-4 rounded bg-[#121212] border border-neutral-800 space-y-3">
            <div class="flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-400">
              <span class="text-amber-400 font-bold">STUDER A-60 // EXECUTABLE SONIC PROOFS</span>
              <span>CLICK TO TRANSDUCE WHILE READING</span>
            </div>
            <div class="grid grid-cols-1 gap-2">
              ${node.sonicFootnotes
                .map(
                  (cue) => `
                <button data-sonic-cue="${cue.id}" class="text-left p-2.5 rounded bg-[#0c0c0c] hover:bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <span class="text-xs font-bold text-amber-400 group-hover:text-amber-300 tracking-wide">${cue.label}</span>
                  <span class="text-[11px] text-neutral-400 font-sans">${cue.caption}</span>
                </button>
              `
                )
                .join('')}
            </div>
          </section>

          <!-- Main Essay Sections -->
          <div class="space-y-8 font-sans text-sm sm:text-[15px] leading-relaxed text-neutral-200">
            ${node.sections
              .map(
                (sec) => `
              <section class="space-y-3.5">
                <h2 class="font-mono text-xs sm:text-sm uppercase tracking-widest text-amber-400 font-bold border-l-2 border-amber-500 pl-3">
                  ${sec.heading}
                </h2>
                ${sec.paragraphs.map((p) => `<p class="text-neutral-300 leading-7">${p}</p>`).join('')}
                ${
                  sec.formalBlock && this.isFormalismMode
                    ? `
                  <pre class="p-3.5 rounded bg-[#0e0e0e] border border-amber-500/30 text-[11px] sm:text-xs font-mono text-amber-200/95 overflow-x-auto leading-relaxed">${this.escapeHtml(sec.formalBlock)}</pre>
                `
                    : ''
                }
              </section>
            `
              )
              .join('')}
          </div>

          <!-- Topological Neighborhood: Coupled Musical/Visual Works & Adjacent Nodes -->
          <footer class="pt-8 border-t border-neutral-800 space-y-5">
            <div>
              <h3 class="text-[11px] uppercase tracking-widest text-neutral-400 font-bold mb-3">
                COUPLED WORKS IN THE CODEX // MOUNT ON MAIN SPLIT-SCREEN
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                ${linkedWorks
                  .map(
                    (w) => `
                  <button data-jump-work="${w.id}" class="text-left p-3 rounded bg-[#131313] hover:bg-[#1a1a1a] border border-neutral-800 hover:border-amber-500/60 transition-all">
                    <div class="text-[10px] text-amber-400 font-bold tracking-widest mb-1">${w.catalogNumber} // ${w.section}</div>
                    <div class="text-xs font-bold text-neutral-100 truncate">${w.title}</div>
                    <div class="text-[10px] text-neutral-500 truncate mt-1">${w.discipline}</div>
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>

            ${
              adjacentNodes.length > 0
                ? `
              <div>
                <h3 class="text-[11px] uppercase tracking-widest text-neutral-400 font-bold mb-3">
                  ADJACENT TOPOLOGICAL CRYSTALS // CONTINUE TRAVERSAL
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  ${adjacentNodes
                    .map(
                      (adj) => `
                    <button data-open-slug="${adj.slug}" class="text-left p-3 rounded bg-[#111111] hover:bg-[#181818] border border-neutral-800 hover:border-emerald-500/50 transition-all">
                      <div class="text-[10px] text-emerald-400 font-bold tracking-widest mb-1">${adj.code} · ${adj.axis}</div>
                      <div class="text-xs font-bold text-neutral-100 line-clamp-1">${adj.title}</div>
                    </button>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                : ''
            }
          </footer>

        </div>
      </div>
    `;
  }

  private bindEvents() {
    this.overlay.querySelector('#codex-close-btn')?.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.overlay.querySelector('#codex-loop-btn')?.addEventListener('click', () => {
      const next = this.audioEngine.cycleLoopMode();
      if (this.activeNode && next !== 'OFF') {
        this.audioEngine.setReadingFocus(true);
      }
      this.onToast(`V6 INSTALLATION // LOOP [${next}]`);
      this.render();
    });

    // Matrix Filters
    this.overlay.querySelectorAll<HTMLButtonElement>('.codex-density-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.densityFilter = btn.getAttribute('data-density') as CodexDensity | 'ALL';
        this.render();
      });
    });

    this.overlay.querySelectorAll<HTMLButtonElement>('.codex-axis-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.axisFilter = btn.getAttribute('data-axis') as AttractorAxis | 'ALL';
        this.render();
      });
    });

    const searchInput = this.overlay.querySelector<HTMLInputElement>('#codex-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const cursorPos = searchInput.selectionStart || 0;
        this.searchQuery = searchInput.value.toLowerCase();
        this.render();
        const nextInput = this.overlay.querySelector<HTMLInputElement>('#codex-search-input');
        if (nextInput) {
          nextInput.focus();
          nextInput.setSelectionRange(cursorPos, cursorPos);
        }
      });
    }

    // Jump to Coupled Work (stops propagation so card click doesn't override)
    this.overlay.querySelectorAll<HTMLButtonElement>('[data-jump-work]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const workId = btn.getAttribute('data-jump-work');
        const work = WORKS.find((w) => w.id === workId);
        if (work) {
          this.close(true);
          this.onSelectWork(work);
        }
      });
    });

    // Open Essay Crystal
    this.overlay.querySelectorAll<HTMLElement>('[data-open-slug]').forEach((el) => {
      el.addEventListener('click', () => {
        const slug = el.getAttribute('data-open-slug');
        if (slug) {
          this.openNodeBySlug(slug);
        }
      });
    });

    // Reader Toolbar Actions
    this.overlay.querySelector('#codex-back-btn')?.addEventListener('click', () => {
      this.openIndex();
    });

    this.overlay.querySelector('#codex-bimodal-btn')?.addEventListener('click', () => {
      this.isFormalismMode = !this.isFormalismMode;
      this.onToast(
        this.isFormalismMode ? 'READER // FULL FORMALISM ENABLED' : 'READER // BARE SCENE MODE'
      );
      this.render();
    });

    this.overlay.querySelector('#codex-duck-btn')?.addEventListener('click', () => {
      const bypassed = this.audioEngine.toggleReadingDuckBypass();
      this.onToast(
        bypassed ? 'AUDIO // FULL TAPE LEVEL (DUCK BYPASSED)' : 'AUDIO // READING DUCK (-10dB @ 2.8kHz)'
      );
      this.render();
    });

    this.overlay.querySelector('#codex-start-ambient-btn')?.addEventListener('click', async () => {
      await this.audioEngine.setLoopMode('DRONE');
      this.audioEngine.setReadingFocus(true);
      this.onToast('V6 // 7.5 IPS AMBIENT READING DRONE ENGAGED');
      this.render();
    });

    this.overlay.querySelector('#codex-share-btn')?.addEventListener('click', () => {
      if (!this.activeNode) return;
      const url = `${window.location.origin}${window.location.pathname}#codex/${this.activeNode.slug}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).catch(() => {});
      }
      this.onToast(`COPIED // #codex/${this.activeNode.slug}`);
    });

    // Open PDF or Interactive 125-Node Simulator in BookViewerModal
    this.overlay.querySelectorAll<HTMLButtonElement>('[data-open-doc]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-open-doc');
        const title = btn.getAttribute('data-doc-title') || '';
        const badge = btn.getAttribute('data-doc-badge') || '';
        if (url) {
          this.onOpenDocument(url, title, badge);
        }
      });
    });

    // Trigger Sonic Footnotes
    this.overlay.querySelectorAll<HTMLButtonElement>('[data-sonic-cue]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!this.activeNode) return;
        const cueId = btn.getAttribute('data-sonic-cue');
        const cue = this.activeNode.sonicFootnotes.find((c) => c.id === cueId);
        if (cue) {
          // Temporarily lift ducking when auditioning an explicit sonic footnote if it's a master cut
          const msg = await this.audioEngine.triggerSonicCue({
            label: cue.label,
            audioUrl: cue.audioUrl,
            seekSeconds: cue.seekSeconds,
            binauralHz: cue.binauralHz,
          });
          this.onToast(msg);
          this.render();
        }
      });
    });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private escapeAttr(str: string): string {
    return this.escapeHtml(str).replace(/"/g, '&quot;');
  }
}
