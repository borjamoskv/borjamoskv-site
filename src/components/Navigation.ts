import { SectionType } from '../data/works';

export class Navigation {
  private container: HTMLElement;
  private onSectionSelect: (section: SectionType | 'ALL') => void;
  private onOpenCatalogue: () => void;
  private onOpenManifesto: () => void;
  private currentSection: SectionType | 'ALL' = 'ALL';
  private clockEl!: HTMLElement;
  private timerId: number = 0;

  constructor(
    container: HTMLElement,
    onSectionSelect: (section: SectionType | 'ALL') => void,
    onOpenCatalogue: () => void,
    onOpenManifesto: () => void
  ) {
    this.container = container;
    this.onSectionSelect = onSectionSelect;
    this.onOpenCatalogue = onOpenCatalogue;
    this.onOpenManifesto = onOpenManifesto;

    this.render();
    this.startClock();
  }

  public setSection(section: SectionType | 'ALL') {
    this.currentSection = section;
    this.updateButtons();
  }

  private render() {
    this.container.innerHTML = `
      <header class="w-full bg-[#0a0a0a] border-b border-neutral-800 text-neutral-200 px-4 sm:px-8 py-3.5 flex items-center justify-between font-mono text-xs select-none sticky top-0 z-40">
        <!-- Logo / Artist Identity -->
        <div class="flex items-center gap-4">
          <a href="#" id="nav-brand" class="font-black text-sm tracking-widest text-white hover:text-amber-400 transition-colors uppercase font-sans">
            BORJA MOSKV
          </a>
          <span class="text-neutral-600 hidden sm:inline">//</span>
          <span class="text-neutral-400 text-[11px] hidden md:inline tracking-wider">
            AVANT-GARDE ART & SYSTEMS RESEARCH
          </span>
        </div>

        <!-- Section Navigation Filter -->
        <nav class="flex items-center gap-1 sm:gap-2">
          <button data-sec="ALL" class="nav-sec-btn px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-colors ${this.currentSection === 'ALL' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-neutral-400 hover:text-white'}">
            ALL
          </button>
          <button data-sec="MUSIC" class="nav-sec-btn px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-colors ${this.currentSection === 'MUSIC' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-neutral-400 hover:text-white'}">
            MUSIC
          </button>
          <button data-sec="ART" class="nav-sec-btn px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-colors ${this.currentSection === 'ART' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-neutral-400 hover:text-white'}">
            ART
          </button>
          <button data-sec="COMPLEX SYSTEMS" class="nav-sec-btn px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-colors ${this.currentSection === 'COMPLEX SYSTEMS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-neutral-400 hover:text-white'}">
            COMPLEX SYSTEMS
          </button>
        </nav>

        <!-- Right Side: Catalogue Drawer, Manifesto & Live UTC Clock -->
        <div class="flex items-center gap-3">
          <button id="btn-open-cat" class="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 rounded text-[11px] tracking-wider uppercase transition-colors">
            [CATALOGUE]
          </button>
          <button id="btn-open-man" class="hidden sm:inline-block px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-amber-400/90 border border-amber-500/40 rounded text-[11px] tracking-wider uppercase transition-colors">
            [MANIFESTO]
          </button>
          <div id="live-utc-clock" class="hidden lg:block text-neutral-500 text-[10px] tracking-widest pl-2 border-l border-neutral-800">
            --:--:-- UTC
          </div>
        </div>
      </header>
    `;

    this.clockEl = this.container.querySelector('#live-utc-clock')!;

    // Brand click resets to all
    this.container.querySelector('#nav-brand')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.onSectionSelect('ALL');
    });

    // Section buttons
    const secBtns = this.container.querySelectorAll<HTMLButtonElement>('.nav-sec-btn');
    secBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const sec = btn.getAttribute('data-sec') as SectionType | 'ALL';
        this.currentSection = sec;
        this.updateButtons();
        this.onSectionSelect(sec);
      });
    });

    // Open Catalogue & Manifesto
    this.container.querySelector('#btn-open-cat')?.addEventListener('click', () => this.onOpenCatalogue());
    this.container.querySelector('#btn-open-man')?.addEventListener('click', () => this.onOpenManifesto());
  }

  private updateButtons() {
    const secBtns = this.container.querySelectorAll<HTMLButtonElement>('.nav-sec-btn');
    secBtns.forEach((btn) => {
      const sec = btn.getAttribute('data-sec');
      if (sec === this.currentSection) {
        btn.className = 'nav-sec-btn px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-colors bg-amber-500/20 text-amber-400 border border-amber-500/50';
      } else {
        btn.className = 'nav-sec-btn px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-colors text-neutral-400 hover:text-white';
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
