/**
 * Tactical Brutalist HUD Toast for Borja Moskv Sovereign Deck
 * Flashes non-intrusive feedback when transport or navigation keys are activated.
 */

export class HUDToast {
  private el: HTMLElement;
  private timeoutId: number = 0;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'fixed bottom-4 right-4 z-50 pointer-events-none transition-all duration-200 opacity-0 translate-y-2 font-mono text-[11px] px-3 py-1.5 rounded bg-black/90 text-amber-400 border border-amber-500/40 shadow-2xl backdrop-blur-md select-none flex items-center gap-2';
    document.body.appendChild(this.el);
  }

  public show(message: string, durationMs: number = 1600) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.el.innerHTML = `
      <span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
      <span class="font-bold tracking-widest uppercase">${message}</span>
    `;

    this.el.classList.remove('opacity-0', 'translate-y-2');
    this.el.classList.add('opacity-100', 'translate-y-0');

    this.timeoutId = window.setTimeout(() => {
      this.el.classList.remove('opacity-100', 'translate-y-0');
      this.el.classList.add('opacity-0', 'translate-y-2');
    }, durationMs);
  }
}
