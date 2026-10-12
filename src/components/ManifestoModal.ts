export class ManifestoModal {
  private overlay: HTMLElement;

  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300 font-mono';
    this.buildDOM();
    document.body.appendChild(this.overlay);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  private buildDOM() {
    this.overlay.innerHTML = `
      <div class="relative w-full max-w-3xl max-h-[88vh] bg-[#0c0c0c] border border-neutral-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        <!-- Header -->
        <div class="p-4 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-[#121212]">
          <div>
            <h3 class="text-amber-500 font-bold text-sm tracking-widest">[C5-REAL // MANIFESTO]</h3>
            <p class="text-neutral-500 text-xs mt-0.5">THE AXIOMS OF SOTERIC TRANSDUCTION & HIGH EXERGY</p>
          </div>
          <button id="close-man-btn" class="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs uppercase tracking-wider text-neutral-300 rounded transition-colors">
            [ESC // CLOSE]
          </button>
        </div>

        <!-- Manifesto Body -->
        <div class="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm font-sans leading-relaxed text-neutral-300">
          <div class="border-l-2 border-amber-500 pl-4 py-1 italic font-serif text-lg text-neutral-100">
            "Anything outside its original form is the worst state of its own existence."
          </div>

          <section class="space-y-3">
            <h4 class="font-mono font-bold text-xs uppercase tracking-widest text-amber-400">I. Transduction Over Invention</h4>
            <p class="text-neutral-300">
              Every "original idea" conceived purely by the conscious intellect is voluntary, derivative, and bounded by the ego’s prior map. True mastery emerges only when the conscious intent collides with material territory and collapses, allowing the physics of the substrate to occupy the channel.
            </p>
            <p class="text-neutral-300">
              The sovereign creator does not invent art: he operates as an antenna and biological transducer, tuning into an invariant that was already mathematically latent. If it is brilliant, it was not your idea.
            </p>
          </section>

          <section class="space-y-3">
            <h4 class="font-mono font-bold text-xs uppercase tracking-widest text-amber-400">II. The Five Epistemic Invariants</h4>
            <div class="space-y-3 font-mono text-xs text-neutral-400">
              <div class="p-3 bg-[#141414] border border-neutral-800 rounded">
                <span class="text-neutral-200 font-bold">1. Transform noise into concepts:</span> Intelligence is compression constrained by Chentsov’s geometric uniqueness. Any abstraction that departs from the Fisher Information Metric is mere confabulation.
              </div>
              <div class="p-3 bg-[#141414] border border-neutral-800 rounded">
                <span class="text-neutral-200 font-bold">2. Confuse map with territory:</span> Treating an abstraction as physical reality ignores unmodeled latent invariants, guaranteeing terminal collision with the substrate.
              </div>
              <div class="p-3 bg-[#141414] border border-neutral-800 rounded">
                <span class="text-neutral-200 font-bold">3. The attempted solution is the problem:</span> The compensatory feedback of a miscalibrated regulator acts as the primary power source sustaining the oscillation of systemic error.
              </div>
              <div class="p-3 bg-[#141414] border border-neutral-800 rounded">
                <span class="text-neutral-200 font-bold">4. Change occurs when the pain of staying exceeds that of changing:</span> Thermodynamic activation barriers govern state transitions. A system will not leave its attractor until accumulated entropic friction forces a topological bifurcation.
              </div>
              <div class="p-3 bg-[#141414] border border-neutral-800 rounded">
                <span class="text-neutral-200 font-bold">5. The voluntary is worth less than the involuntary:</span> Signals governed by conscious will carry high manipulation entropy. Involuntary biological and mechanical signals are anchored to unforgeable physical invariants.
              </div>
            </div>
          </section>

          <section class="space-y-3">
            <h4 class="font-mono font-bold text-xs uppercase tracking-widest text-amber-400">III. The Architecture of Creative Silence</h4>
            <p class="text-neutral-300">
              Art is an engineering discipline of extreme exergy. We reject superficial digital ornamentation, corporate engagement metrics, and social noise. The works in this codex exist in their pure physical state: uncompressed audio masters, large-format silver gelatin prints, and formally verified cybernetic systems.
            </p>
          </section>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-neutral-800 bg-[#121212] flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>BORJA MOSKV // SOVEREIGN MONOGRAPH</span>
          <span class="text-amber-500/80">C5-REAL STANDARDS</span>
        </div>
      </div>
    `;

    this.overlay.querySelector('#close-man-btn')!.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
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
