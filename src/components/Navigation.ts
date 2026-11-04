import { TapeLoopMode } from '../audio/AudioEngine';
import { CODEX_TOTAL_COUNT } from '../data/codexEdges';
import { SectionType } from '../data/works';

export class Navigation {
  private container: HTMLElement;
  private onSectionSelect: (section: SectionType | 'ALL') => void;
  private onOpenCodex: () => void;
  private onOpenCatalogue: () => void;
  private onOpenManifesto: () => void;
  private onCycleLoop: () => void;
  private currentSection: SectionType | 'ALL' = 'ALL';
  private loopMode: TapeLoopMode = 'OFF';
  private clockEl!: HTMLElement;
  private timerId: number = 0;

  constructor(
    container: HTMLElement,
    onSectionSelect: (section: SectionType | 'ALL') => void,
    onOpenCodex: () => void,
    onOpenCatalogue: () => void,
    onOpenManifesto: () => void,
    onCycleLoop: () => void
  ) {
    this.container = container;
    this.onSectionSelect = onSectionSelect;
    this.onOpenCodex = onOpenCodex;
    this.onOpenCatalogue = onOpenCatalogue;
    this.onOpenManifesto = onOpenManifesto;
    this.onCycleLoop = onCycleLoop;

    this.render();
    this.startClock();
  }

  public setSection(section: SectionType | 'ALL') {
    this.currentSection = section;
    this.updateButtons();
  }

  public setLoopStatus(mode: TapeLoopMode) {
    this.loopMode = mode;
    const loopPill = this.container.querySelector<HTMLButtonElement>('#btn-nav-loop');
    if (!loopPill) return;

    if (mode === 'ARCHIVE') {
      loopPill.textContent = '∞ RADIO: ARCHIVE';
      loopPill.className =
        'hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/15 text-cyan-300 border border-cyan-500/50 rounded text-[10px] font-bold tracking-wider uppercase transition-colors';
    } else if (mode === 'DRONE') {
      loopPill.textContent = '∞ RADIO: DRONE 7.5';
      loopPill.className =
        'hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/50 rounded text-[10px] font-bold tracking-wider uppercase transition-colors';
    } else {
      loopPill.textContent = '∞ RADIO: OFF';
      loopPill.className =
        'hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded text-[10px] tracking-wider uppercase transition-colors';
    }
  }

  private render() {
    this.container.innerHTML = `
      <header class="w-full bg-[#0a0a0a] border-b border-neutral-800 text-neutral-200 px-4 sm:px-8 py-3.5 flex items-center justify-between font-mono text-xs select-none sticky top-0 z-30">
        <!-- Logo / Artist Identity -->
        <div class="flex items-center gap-4">
          <a href="#" id="nav-brand" class="font-black text-sm tracking-widest text-white hover:text-amber-400 transition-colors uppercase font-sans">
            BORJA MOSKV
          </a>
          <span class="text-neutral-600 hidden sm:inline">//</span>
          <span class="text-neutral-400 text-[11px] hidden xl:inline tracking-wider">
            AVANT-GARDE ART & SYSTEMS RESEARCH
          </span>
        </div>

        <!-- Section Navigation Filter -->
        <nav class="flex items-center gap-1 sm:gap-1.5">
          <button data-sec="ALL" class="nav-sec-btn px-2 sm:px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-colors ${this.currentSection === 'ALL' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-neutral-400 hover:text-white'}">
            ALL
          </button>
          <button data-sec="MUSIC" class="nav-sec-btn px-2 sm:px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-colors ${this.currentSection === 'MUSIC' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-neutral-400 hover:text-white'}">
            MUSIC
          </button>
          <button data-sec="ART" class="nav-sec-btn px-2 sm:px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-colors ${this.currentSection === 'ART' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-neutral-400 hover:text-white'}">
            ART
          </button>
          <button data-sec="COMPLEX SYSTEMS" class="nav-sec-btn hidden sm:inline-block px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-colors ${this.currentSection === 'COMPLEX SYSTEMS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-neutral-400 hover:text-white'}">
            SYSTEMS
          </button>
        </nav>

        <!-- Right Side: V5 Topological Blog, V6 Radio Loop, Catalogue, Manifesto & UTC Clock -->
        <div class="flex items-center gap-2">
          <button id="btn-open-codex" class="px-2.5 sm:px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/50 rounded text-[11px] font-bold tracking-wider uppercase transition-colors" title="Open V5 Topological Codex & Blog (Shortcuts: T or ⌘K)">
            [CODEX // BLOG · ${CODEX_TOTAL_COUNT}]
          </button>
          <button id="btn-nav-loop" class="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded text-[10px] tracking-wider uppercase transition-colors" title="Cycle V6 Autonomous Tape Loop Installation (Shortcut: L)">
            ∞ RADIO: OFF
          </button>
          <button id="btn-open-cat" class="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 rounded text-[11px] tracking-wider uppercase transition-colors" title="Open Catalogue Drawer (Shortcut: C)">
            [CATALOGUE]
          </button>
          <button id="btn-open-man" class="hidden lg:inline-block px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 rounded text-[11px] tracking-wider uppercase transition-colors" title="Open C5-REAL Manifesto (Shortcut: M)">
            [MANIFESTO]
          </button>
          <div id="live-utc-clock" class="hidden xl:block text-neutral-500 text-[10px] tracking-widest pl-2 border-l border-neutral-800">
            --:--:-- UTC
          </div>
        </div>
      </header>
    `;

    this.clockEl = this.container.querySelector('#live-utc-clock')!;
    this.setLoopStatus(this.loopMode);

    this.container.querySelector('#nav-brand')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.onSectionSelect('ALL');
    });

    const secBtns = this.container.querySelectorAll<HTMLButtonElement>('.nav-sec-btn');
    secBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const sec = btn.getAttribute('data-sec') as SectionType | 'ALL';
        this.currentSection = sec;
        this.updateButtons();
        this.onSectionSelect(sec);
      });
    });

    this.container.querySelector('#btn-open-codex')?.addEventListener('click', () => this.onOpenCodex());
    this.container.querySelector('#btn-nav-loop')?.addEventListener('click', () => this.onCycleLoop());
    this.container.querySelector('#btn-open-cat')?.addEventListener('click', () => this.onOpenCatalogue());
    this.container.querySelector('#btn-open-man')?.addEventListener('click', () => this.onOpenManifesto());
  }

  private updateButtons() {
    const secBtns = this.container.querySelectorAll<HTMLButtonElement>('.nav-sec-btn');
    secBtns.forEach((btn) => {
      const sec = btn.getAttribute('data-sec');
      const hiddenSm = sec === 'COMPLEX SYSTEMS' ? 'hidden sm:inline-block ' : '';
      if (sec === this.currentSection) {
        btn.className = `${hiddenSm}nav-sec-btn px-2 sm:px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-colors bg-amber-500/20 text-amber-400 border border-amber-500/50`;
      } else {
        btn.className = `${hiddenSm}nav-sec-btn px-2 sm:px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-colors text-neutral-400 hover:text-white`;
      }
    });
  }

  private startClock() {
    const tick = () => {
      const now = new Date();
      const h = now.getUTCHours().toString().padStart(2, '0');
      const m = now.getUTCMinutes().toString().padStart(2, '0');
      const s = now.getUTCSeconds().toString().padStart(2, '0');
      if (this.clockEl) {
        this.clockEl.textContent = `${h}:${m}:${s} UTC`;
      }
    };
    tick();
    this.timerId = window.setInterval(tick, 1000);
  }

  public destroy() {
    if (this.timerId) clearInterval(this.timerId);
  }
}
