/**
 * Sovereign Web Audio Engine for Borja Moskv Reel-to-Reel Deck
 * Provides analog tape filtering, harmonic saturation, V6 Autonomous Tape Loop
 * (7.5 IPS Generative Sub-Harmonic Drone + 11-Track Dual-Deck Crossfade Archive Radio),
 * Cognitive Reading Ducking (2.8 kHz lowpass), and Sonic Footnote synthesis.
 */

export type TapeLoopMode = 'OFF' | 'DRONE' | 'ARCHIVE';

export interface ArchiveTrackCue {
  title: string;
  catalogRef: string;
  url: string;
}

export interface SonicCueOptions {
  label?: string;
  audioUrl?: string;
  seekSeconds?: number;
  binauralHz?: [number, number];
  durationMs?: number;
}

export const ARCHIVE_POOL: ArchiveTrackCue[] = [
  { catalogRef: 'BM-01', title: '15 STEP (GRANULAR REWORK)', url: '/audio/bandcamp/this_was_in_rainbows_15_step.mp3' },
  { catalogRef: 'BM-02', title: 'CACTUSES // PEYOTE', url: '/audio/bandcamp/cactuses_peyote.mp3' },
  { catalogRef: 'BM-03', title: 'MIARMA // SILENCE ALSO DANCE', url: '/audio/bandcamp/miarma_silence_also_dance.mp3' },
  { catalogRef: 'BM-04', title: 'LO INMANENTE (SUITE)', url: '/audio/bandcamp/lo_inmanente_title.mp3' },
  { catalogRef: 'BM-05', title: '[B]UTWHATTHEFUCK', url: '/audio/bandcamp/album_b_butwhatthefuck.mp3' },
  { catalogRef: 'BM-06', title: 'FARÁNDULA // QUÉ PUTA!', url: '/audio/bandcamp/farandula_que_puta.mp3' },
  { catalogRef: 'BM-07A', title: 'ANTES DE LAS GUERRAS', url: '/audio/antes_de_las_guerras.mp3' },
  { catalogRef: 'BM-07B', title: 'GLITCH IN THE MIRROR (ARCHIVE)', url: '/audio/glitch_in_the_mirror.mp3' },
  { catalogRef: 'BM-07C', title: 'PATADAS EN LA BOCA (ARCHIVE)', url: '/audio/patadas.mp3' },
  { catalogRef: 'BM-08', title: 'HEIMATFLUG // ECOS DEL COSMOS', url: '/audio/ecos_del_cosmos.mp3' },
  { catalogRef: 'BM-10', title: 'BLAC // JAR TO THE SYSTEM', url: '/audio/jar_to_the_system.mp3' },
];

export class AudioEngine {
  private ctx: AudioContext | null = null;

  // Dual-Deck HTMLAudioElements for gapless V6 ARCHIVE crossfades
  private audioEl: HTMLAudioElement;
  private auxAudioEl: HTMLAudioElement;
  private sourceNodeA: MediaElementAudioSourceNode | null = null;
  private sourceNodeB: MediaElementAudioSourceNode | null = null;
  private deckGainA: GainNode | null = null;
  private deckGainB: GainNode | null = null;
  private activeDeck: 'A' | 'B' = 'A';
  private isCrossfading: boolean = false;

  // Tape physics & Cognitive Reading Ducking nodes
  private analyser: AnalyserNode | null = null;
  private tapeFilter: BiquadFilterNode | null = null;
  private tapeShaper: WaveShaperNode | null = null;
  private readingFilter: BiquadFilterNode | null = null;
  private readingDuckGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  // Wow & Flutter analog modulation nodes
  private wowDelay: DelayNode | null = null;
  private wowOsc: OscillatorNode | null = null;
  private flutterOsc: OscillatorNode | null = null;
  private wowGain: GainNode | null = null;
  private flutterGain: GainNode | null = null;
  private isWowFlutter: boolean = true;

  // Generative 7.5 IPS sub-harmonic synth bus
  private synthOscA: OscillatorNode | null = null;
  private synthOscB: OscillatorNode | null = null;
  private synthOscSub: OscillatorNode | null = null;
  private synthLfo: OscillatorNode | null = null;
  private synthNoise: AudioBufferSourceNode | null = null;
  private synthGain: GainNode | null = null;
  private isSynthesizing: boolean = false;

  // Ephemeral Sonic Footnote binaural nodes
  private cueNodes: AudioNode[] = [];
  private cueTimerId: number = 0;

  // V6 Autonomous Tape Loop & Reading Focus state
  private loopMode: TapeLoopMode = 'OFF';
  private archiveQueue: ArchiveTrackCue[] = [];
  private archiveCursor: number = 0;
  private currentArchiveCue: ArchiveTrackCue | null = null;
  private isReadingFocused: boolean = false;
  private isReadingDuckBypassed: boolean = false;

  private isPlaying: boolean = false;
  private isSaturated: boolean = true;
  private currentTrackUrl: string | null = null;
  private volume: number = 0.85;
  private isMuted: boolean = false;

  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onPlayStateChange?: (isPlaying: boolean) => void;
  public onTrackEnd?: () => void;
  public onLoopModeChange?: (mode: TapeLoopMode, cueLabel: string) => void;
  public onReadingDuckChange?: (isDucked: boolean, isBypassed: boolean) => void;

  constructor() {
    this.audioEl = new Audio();
    this.audioEl.preload = 'auto';

    this.auxAudioEl = new Audio();
    this.auxAudioEl.preload = 'auto';

    this.attachDeckListeners('A', this.audioEl);
    this.attachDeckListeners('B', this.auxAudioEl);
    this.rebuildArchiveQueue();
  }

  private attachDeckListeners(deckId: 'A' | 'B', el: HTMLAudioElement) {
    el.addEventListener('timeupdate', () => {
      if (this.activeDeck !== deckId) return;
      const cur = el.currentTime || 0;
      const dur = el.duration || 0;
      if (this.onTimeUpdate) {
        this.onTimeUpdate(cur, dur);
      }
      // Trigger smooth 3.5s crossfade before track ends in V6 ARCHIVE mode
      if (
        this.loopMode === 'ARCHIVE' &&
        this.isPlaying &&
        !this.isCrossfading &&
        dur > 8 &&
        dur - cur <= 4.0
      ) {
        this.crossfadeToNextArchiveTrack();
      }
    });

    el.addEventListener('ended', () => {
      if (this.activeDeck !== deckId) return;
      if (this.loopMode === 'ARCHIVE') {
        if (!this.isCrossfading) {
          this.crossfadeToNextArchiveTrack();
        }
        return;
      }
      this.isPlaying = false;
      if (this.onPlayStateChange) this.onPlayStateChange(false);
      if (this.onTrackEnd) this.onTrackEnd();
    });

    el.addEventListener('error', () => {
      if (this.activeDeck !== deckId || !this.isPlaying) return;
      if (this.loopMode === 'ARCHIVE') {
        this.crossfadeToNextArchiveTrack();
      } else {
        this.startDroneSynthesis();
      }
    });
  }

  private rebuildArchiveQueue() {
    const copy = [...ARCHIVE_POOL];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    this.archiveQueue = copy;
    this.archiveCursor = 0;
  }

  private nextArchiveCue(): ArchiveTrackCue {
    if (this.archiveCursor >= this.archiveQueue.length) {
      this.rebuildArchiveQueue();
    }
    const cue = this.archiveQueue[this.archiveCursor];
    this.archiveCursor += 1;
    this.currentArchiveCue = cue;
    return cue;
  }

  private getActiveAudioElement(): HTMLAudioElement {
    return this.activeDeck === 'A' ? this.audioEl : this.auxAudioEl;
  }

  private initContext() {
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Dual-Deck MediaElement sources & dedicated crossfade gains
    this.sourceNodeA = this.ctx.createMediaElementSource(this.audioEl);
    this.sourceNodeB = this.ctx.createMediaElementSource(this.auxAudioEl);
    this.deckGainA = this.ctx.createGain();
    this.deckGainB = this.ctx.createGain();
    this.deckGainA.gain.value = 1.0;
    this.deckGainB.gain.value = 0.0001;

    // High frequency tape roll-off filter (warm vintage 16.5kHz top end)
    this.tapeFilter = this.ctx.createBiquadFilter();
    this.tapeFilter.type = 'lowpass';
    this.tapeFilter.frequency.value = 16500;
    this.tapeFilter.Q.value = 0.707;

    // Wow & Flutter delay line
    this.wowDelay = this.ctx.createDelay(0.05);
    this.wowDelay.delayTime.value = 0.005;

    // Wow LFO (0.45 Hz) & Flutter LFO (4.8 Hz)
    this.wowOsc = this.ctx.createOscillator();
    this.wowOsc.frequency.value = 0.45;
    this.wowGain = this.ctx.createGain();
    this.wowGain.gain.value = this.isWowFlutter ? 0.0007 : 0.00001;

    this.flutterOsc = this.ctx.createOscillator();
    this.flutterOsc.frequency.value = 4.8;
    this.flutterGain = this.ctx.createGain();
    this.flutterGain.gain.value = this.isWowFlutter ? 0.00025 : 0.00001;

    this.wowOsc.connect(this.wowGain);
    this.flutterOsc.connect(this.flutterGain);
    this.wowGain.connect(this.wowDelay.delayTime);
    this.flutterGain.connect(this.wowDelay.delayTime);

    this.wowOsc.start();
    this.flutterOsc.start();

    // Harmonic wave shaper for magnetic tape saturation
    this.tapeShaper = this.ctx.createWaveShaper();
    this.updateShaperCurve(this.isSaturated);

    // Cognitive Reading Ducking stage (placed pre-analyser for authentic VU/RTA physics)
    this.readingFilter = this.ctx.createBiquadFilter();
    this.readingFilter.type = 'lowpass';
    this.readingFilter.frequency.value = 20000;
    this.readingFilter.Q.value = 0.65;

    this.readingDuckGain = this.ctx.createGain();
    this.readingDuckGain.gain.value = 1.0;

    // Analyser node for fast ballistics VU meters, 24-band RTA & Lissajous Scope
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.6;

    // Master volume gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;

    // Signal Chain:
    // [DeckA + DeckB] -> tapeFilter -> wowDelay -> tapeShaper -> readingFilter -> readingDuckGain -> analyser -> masterGain -> destination
    this.sourceNodeA.connect(this.deckGainA);
    this.sourceNodeB.connect(this.deckGainB);
    this.deckGainA.connect(this.tapeFilter);
    this.deckGainB.connect(this.tapeFilter);

    this.tapeFilter.connect(this.wowDelay);
    this.wowDelay.connect(this.tapeShaper);
    this.tapeShaper.connect(this.readingFilter);
    this.readingFilter.connect(this.readingDuckGain);
    this.readingDuckGain.connect(this.analyser);
    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.applyReadingDuckEnvelope();
  }

  private updateShaperCurve(saturated: boolean) {
    if (!this.tapeShaper || !this.ctx) return;
    const k = saturated ? 12 : 2;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    this.tapeShaper.curve = curve;
  }

  public loadTrack(url?: string) {
    // Preserve continuous background installation loop when browsing works
    if (this.loopMode !== 'OFF' && this.isPlaying) {
      this.currentTrackUrl = url || null;
      return;
    }

    this.stop();
    this.activeDeck = 'A';
    if (this.deckGainA && this.deckGainB && this.ctx) {
      this.deckGainA.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.deckGainB.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    }
    this.currentTrackUrl = url || null;
    if (url) {
      this.audioEl.src = url;
      this.audioEl.load();
    } else {
      this.audioEl.removeAttribute('src');
    }
  }

  public async play() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(Math.max(0.001, this.masterGain.gain.value), this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(
        this.isMuted ? 0.0001 : this.volume,
        this.ctx.currentTime + 0.05
      );
    }

    if (this.loopMode === 'DRONE') {
      this.pauseHtmlDecks();
      this.startDroneSynthesis();
      return;
    }

    if (this.loopMode === 'ARCHIVE') {
      this.stopDroneSynthesis();
      const activeEl = this.getActiveAudioElement();
      if (!activeEl.src) {
        const cue = this.nextArchiveCue();
        activeEl.src = cue.url;
        activeEl.load();
        if (this.onLoopModeChange) {
          this.onLoopModeChange('ARCHIVE', `${cue.catalogRef} · ${cue.title}`);
        }
      }
      try {
        await activeEl.play();
        this.isPlaying = true;
        this.isSynthesizing = false;
        if (this.onPlayStateChange) this.onPlayStateChange(true);
      } catch {
        this.startDroneSynthesis();
      }
      return;
    }

    const activeEl = this.getActiveAudioElement();
    if (this.currentTrackUrl) {
      if (!activeEl.src || !activeEl.src.endsWith(this.currentTrackUrl)) {
        activeEl.src = this.currentTrackUrl;
        activeEl.load();
      }
      try {
        await activeEl.play();
        this.isPlaying = true;
        this.isSynthesizing = false;
        if (this.onPlayStateChange) this.onPlayStateChange(true);
      } catch (err) {
        console.warn('Playback intercepted, falling back to analog synthesis drone:', err);
        this.startDroneSynthesis();
      }
    } else {
      this.startDroneSynthesis();
    }
  }

  private pauseHtmlDecks() {
    this.audioEl.pause();
    this.auxAudioEl.pause();
    this.isCrossfading = false;
  }

  public pause() {
    this.stopSonicCueNodes();
    if (this.isSynthesizing) {
      this.stopDroneSynthesis();
    } else {
      if (this.masterGain && this.ctx) {
        try {
          this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
          this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), this.ctx.currentTime);
          this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.025);
        } catch {
          // Safe fallback
        }
      }
      setTimeout(() => {
        this.pauseHtmlDecks();
      }, 30);
    }
    this.isPlaying = false;
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  public stop() {
    this.pause();
    if (this.audioEl.src) this.audioEl.currentTime = 0;
    if (this.auxAudioEl.src) this.auxAudioEl.currentTime = 0;
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * V6 Autonomous Tape Loop Mode Cycling: OFF -> DRONE (7.5 IPS) -> ARCHIVE (11-Track Crossfade) -> OFF
   */
  public cycleLoopMode(): TapeLoopMode {
    const next: TapeLoopMode =
      this.loopMode === 'OFF' ? 'DRONE' : this.loopMode === 'DRONE' ? 'ARCHIVE' : 'OFF';
    this.setLoopMode(next);
    return next;
  }

  public async setLoopMode(mode: TapeLoopMode) {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.loopMode = mode;
    this.isCrossfading = false;

    if (mode === 'DRONE') {
      this.pauseHtmlDecks();
      this.startDroneSynthesis();
      if (this.onLoopModeChange) {
        this.onLoopModeChange('DRONE', '7.5 IPS SUB-HARMONIC TAPE DRONE (55 Hz / 82.5 Hz)');
      }
      return;
    }

    if (mode === 'ARCHIVE') {
      this.stopDroneSynthesis();
      const cue = this.nextArchiveCue();
      this.activeDeck = 'A';
      if (this.deckGainA && this.deckGainB && this.ctx) {
        this.deckGainA.gain.cancelScheduledValues(this.ctx.currentTime);
        this.deckGainB.gain.cancelScheduledValues(this.ctx.currentTime);
        this.deckGainA.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.deckGainB.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      }
      this.auxAudioEl.pause();
      this.audioEl.src = cue.url;
      this.audioEl.load();
      if (this.onLoopModeChange) {
        this.onLoopModeChange('ARCHIVE', `${cue.catalogRef} · ${cue.title}`);
      }
      await this.play();
      return;
    }

    // mode === 'OFF'
    this.stopDroneSynthesis();
    this.pauseHtmlDecks();
    this.activeDeck = 'A';
    if (this.deckGainA && this.deckGainB && this.ctx) {
      this.deckGainA.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.deckGainB.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    }
    if (this.currentTrackUrl) {
      this.audioEl.src = this.currentTrackUrl;
      this.audioEl.load();
    } else {
      this.audioEl.removeAttribute('src');
    }
    this.isPlaying = false;
    if (this.onPlayStateChange) this.onPlayStateChange(false);
    if (this.onLoopModeChange) {
      this.onLoopModeChange('OFF', 'STANDARD 15 IPS MASTER TRANSPORT');
    }
  }

  public getLoopMode(): TapeLoopMode {
    return this.loopMode;
  }

  public getCurrentLoopLabel(): string {
    if (this.loopMode === 'DRONE') {
      return 'INSTALLATION // 7.5 IPS GENERATIVE DRONE';
    }
    if (this.loopMode === 'ARCHIVE') {
      return this.currentArchiveCue
        ? `ARCHIVE ∞ // ${this.currentArchiveCue.catalogRef} ${this.currentArchiveCue.title}`
        : 'ARCHIVE ∞ // CONTINUOUS MASTER LOOP';
    }
    return 'STANDARD 15 IPS TRANSPORT';
  }

  /**
   * Gapless 3.5-second exponential crossfade between Deck A and Deck B
   */
  public async crossfadeToNextArchiveTrack() {
    if (!this.ctx || !this.deckGainA || !this.deckGainB || this.isCrossfading) return;
    this.isCrossfading = true;

    const cue = this.nextArchiveCue();
    const incomingDeck: 'A' | 'B' = this.activeDeck === 'A' ? 'B' : 'A';
    const outgoingEl = incomingDeck === 'B' ? this.audioEl : this.auxAudioEl;
    const incomingEl = incomingDeck === 'B' ? this.auxAudioEl : this.audioEl;
    const outgoingGain = incomingDeck === 'B' ? this.deckGainA : this.deckGainB;
    const incomingGain = incomingDeck === 'B' ? this.deckGainB : this.deckGainA;

    incomingEl.src = cue.url;
    incomingEl.currentTime = 0;
    incomingEl.load();

    const now = this.ctx.currentTime;
    const fadeSec = 3.5;

    incomingGain.gain.cancelScheduledValues(now);
    outgoingGain.gain.cancelScheduledValues(now);
    incomingGain.gain.setValueAtTime(0.0001, now);
    outgoingGain.gain.setValueAtTime(Math.max(0.0001, outgoingGain.gain.value), now);

    try {
      await incomingEl.play();
      incomingGain.gain.exponentialRampToValueAtTime(1.0, now + fadeSec);
      outgoingGain.gain.exponentialRampToValueAtTime(0.0001, now + fadeSec);
      this.activeDeck = incomingDeck;
      this.isPlaying = true;

      if (this.onLoopModeChange) {
        this.onLoopModeChange('ARCHIVE', `${cue.catalogRef} · ${cue.title}`);
      }

      window.setTimeout(() => {
        outgoingEl.pause();
        this.isCrossfading = false;
      }, fadeSec * 1000 + 120);
    } catch {
      this.isCrossfading = false;
      this.startDroneSynthesis();
    }
  }

  /**
   * Cognitive Reading Ducking: attenuates gain (-9.5 dB) & rolls off above 2.8 kHz
   * so background tape music breathes beneath reading without vocal interference.
   */
  public setReadingFocus(focused: boolean) {
    this.isReadingFocused = focused;
    this.applyReadingDuckEnvelope();
  }

  public toggleReadingDuckBypass(): boolean {
    this.isReadingDuckBypassed = !this.isReadingDuckBypassed;
    this.applyReadingDuckEnvelope();
    return this.isReadingDuckBypassed;
  }

  public getReadingDuckState(): { isDucked: boolean; isBypassed: boolean } {
    return {
      isDucked: this.isReadingFocused && !this.isReadingDuckBypassed,
      isBypassed: this.isReadingDuckBypassed,
    };
  }

  private applyReadingDuckEnvelope() {
    const shouldDuck = this.isReadingFocused && !this.isReadingDuckBypassed;
    if (this.ctx && this.readingFilter && this.readingDuckGain) {
      const now = this.ctx.currentTime;
      const targetFreq = shouldDuck ? 2800 : 20000;
      const targetGain = shouldDuck ? 0.34 : 1.0;

      this.readingFilter.frequency.cancelScheduledValues(now);
      this.readingFilter.frequency.setValueAtTime(
        Math.max(200, this.readingFilter.frequency.value),
        now
      );
      this.readingFilter.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.42);

      this.readingDuckGain.gain.cancelScheduledValues(now);
      this.readingDuckGain.gain.setValueAtTime(
        Math.max(0.001, this.readingDuckGain.gain.value),
        now
      );
      this.readingDuckGain.gain.exponentialRampToValueAtTime(targetGain, now + 0.42);
    }

    if (this.onReadingDuckChange) {
      this.onReadingDuckChange(shouldDuck, this.isReadingDuckBypassed);
    }
  }

  /**
   * Executes an inline Sonic Footnote from a V5 Codex Essay:
   * Either synthesizes a stereo binaural/phase differential proof or mounts & seeks a master tape cut.
   */
  public async triggerSonicCue(cue: SonicCueOptions): Promise<string> {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.stopSonicCueNodes();

    if (cue.binauralHz && this.ctx) {
      const [leftHz, rightHz] = cue.binauralHz;
      const durSec = (cue.durationMs || 6500) / 1000;
      const now = this.ctx.currentTime;

      const oscL = this.ctx.createOscillator();
      const oscR = this.ctx.createOscillator();
      oscL.type = 'sine';
      oscR.type = 'sine';
      oscL.frequency.setValueAtTime(leftHz, now);
      oscR.frequency.setValueAtTime(rightHz, now);

      const merger = this.ctx.createChannelMerger(2);
      const envGain = this.ctx.createGain();
      envGain.gain.setValueAtTime(0.0001, now);
      envGain.gain.exponentialRampToValueAtTime(0.32, now + 0.35);
      envGain.gain.setValueAtTime(0.32, now + Math.max(0.5, durSec - 0.6));
      envGain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(envGain);

      if (this.analyser) {
        envGain.connect(this.analyser);
      } else {
        envGain.connect(this.ctx.destination);
      }

      oscL.start(now);
      oscR.start(now);
      oscL.stop(now + durSec + 0.05);
      oscR.stop(now + durSec + 0.05);

      this.cueNodes = [oscL, oscR, merger, envGain];
      this.cueTimerId = window.setTimeout(() => {
        this.stopSonicCueNodes();
      }, durSec * 1000 + 150);

      const beat = Math.abs(rightHz - leftHz).toFixed(1);
      return `SYNTH PROOF // ${leftHz} Hz (L) × ${rightHz} Hz (R) [Δf = ${beat} Hz]`;
    }

    if (cue.audioUrl) {
      if (this.loopMode !== 'OFF') {
        this.loopMode = 'OFF';
        if (this.onLoopModeChange) {
          this.onLoopModeChange('OFF', 'SONIC FOOTNOTE OVERRIDE (15 IPS)');
        }
      }
      this.stopDroneSynthesis();
      this.pauseHtmlDecks();
      this.activeDeck = 'A';
      if (this.deckGainA && this.deckGainB && this.ctx) {
        this.deckGainA.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.deckGainB.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      }

      this.currentTrackUrl = cue.audioUrl;
      this.audioEl.src = cue.audioUrl;
      this.audioEl.load();

      const targetSeek = cue.seekSeconds || 0;
      const applySeek = () => {
        if (targetSeek > 0 && this.audioEl.duration > targetSeek) {
          this.audioEl.currentTime = targetSeek;
        }
        this.audioEl.removeEventListener('loadedmetadata', applySeek);
      };
      this.audioEl.addEventListener('loadedmetadata', applySeek);

      await this.play();
      if (targetSeek > 0 && this.audioEl.readyState >= 1) {
        this.audioEl.currentTime = targetSeek;
      }
      return cue.label || `MOUNTED // ${cue.audioUrl}`;
    }

    return 'SONIC CUE READY';
  }

  private stopSonicCueNodes() {
    if (this.cueTimerId) {
      clearTimeout(this.cueTimerId);
      this.cueTimerId = 0;
    }
    for (const node of this.cueNodes) {
      try {
        if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // Safe cleanup
      }
    }
    this.cueNodes = [];
  }

  public seek(seconds: number) {
    const el = this.getActiveAudioElement();
    if (el.duration && !this.isSynthesizing) {
      el.currentTime = Math.max(0, Math.min(seconds, el.duration));
    }
  }

  public seekRelative(deltaSeconds: number) {
    const el = this.getActiveAudioElement();
    if (el.duration && !this.isSynthesizing) {
      this.seek(el.currentTime + deltaSeconds);
    }
  }

  public setSaturation(enabled: boolean) {
    this.isSaturated = enabled;
    this.updateShaperCurve(enabled);
    if (this.tapeFilter) {
      this.tapeFilter.frequency.value = enabled ? 14500 : 20000;
    }
  }

  public getSaturation(): boolean {
    return this.isSaturated;
  }

  public setWowFlutter(enabled: boolean) {
    this.isWowFlutter = enabled;
    if (this.wowGain && this.flutterGain) {
      this.wowGain.gain.value = enabled ? 0.0007 : 0.000001;
      this.flutterGain.gain.value = enabled ? 0.00025 : 0.000001;
    }
  }

  public getWowFlutter(): boolean {
    return this.isWowFlutter;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0.0001 : this.volume;
      this.masterGain.gain.setValueAtTime(target, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Real-time multi-band spectrum FFT data
   */
  public getSpectrumData(bands: number = 24): Float32Array {
    if (!this.analyser || (!this.isPlaying && this.cueNodes.length === 0)) {
      return new Float32Array(bands);
    }
    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(freqData);

    const out = new Float32Array(bands);
    const step = Math.max(1, Math.floor(freqData.length / bands));
    for (let i = 0; i < bands; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += freqData[i * step + j] / 255;
      }
      out[i] = Math.min(1.0, (sum / step) * 1.25);
    }
    return out;
  }

  /**
   * Real-time time-domain waveform data for goniometer phase scope
   */
  public getTimeDomainData(): Uint8Array {
    if (!this.analyser || (!this.isPlaying && this.cueNodes.length === 0)) {
      return new Uint8Array(0);
    }
    const data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  public getPlaybackState(): { isPlaying: boolean; currentTime: number; duration: number } {
    if (this.isSynthesizing) {
      const virtualSec = this.ctx ? this.ctx.currentTime % 120 : 0;
      return { isPlaying: this.isPlaying, currentTime: virtualSec, duration: 120 };
    }
    const el = this.getActiveAudioElement();
    return {
      isPlaying: this.isPlaying,
      currentTime: el.currentTime || 0,
      duration: el.duration || 0,
    };
  }

  /**
   * Fast peak & RMS telemetry for needle VU meters
   */
  public getVUMeterLevels(): { left: number; right: number } {
    if (!this.analyser || (!this.isPlaying && this.cueNodes.length === 0)) {
      return { left: 0, right: 0 };
    }

    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);

    let sumSquares = 0;
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const val = (data[i] - 128) / 128;
      const absVal = Math.abs(val);
      if (absVal > peak) peak = absVal;
      sumSquares += val * val;
    }
    const rms = Math.sqrt(sumSquares / data.length);

    const leftLevel = Math.min(1.0, rms * 1.8 + peak * 0.3);
    const rightLevel = Math.min(1.0, rms * 1.7 + peak * 0.35 * 0.95);

    return { left: leftLevel, right: rightLevel };
  }

  /**
   * Continuous 7.5 IPS warm analog drone synthesis with slow 0.037 Hz LFO filter breathing
   */
  private startDroneSynthesis() {
    if (!this.ctx || this.isSynthesizing) return;
    this.isSynthesizing = true;
    this.isPlaying = true;

    // Root sawtooth (55 Hz A1)
    this.synthOscA = this.ctx.createOscillator();
    this.synthOscA.type = 'sawtooth';
    this.synthOscA.frequency.value = 55;

    // Deep sub-octave anchor (27.5 Hz A0)
    this.synthOscSub = this.ctx.createOscillator();
    this.synthOscSub.type = 'sine';
    this.synthOscSub.frequency.value = 27.5;

    // Just fifth harmonic (82.5 Hz E2)
    this.synthOscB = this.ctx.createOscillator();
    this.synthOscB.type = 'triangle';
    this.synthOscB.frequency.value = 82.5;

    // Resonant lowpass filter modulated by ultra-slow 27-second breath cycle
    const synthFilter = this.ctx.createBiquadFilter();
    synthFilter.type = 'lowpass';
    synthFilter.frequency.value = 260;
    synthFilter.Q.value = 2.2;

    this.synthLfo = this.ctx.createOscillator();
    this.synthLfo.type = 'sine';
    this.synthLfo.frequency.value = 0.037;
    const lfoDepth = this.ctx.createGain();
    lfoDepth.gain.value = 120;
    this.synthLfo.connect(lfoDepth);
    lfoDepth.connect(synthFilter.frequency);

    // Generative ferric oxide tape hiss buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.014;
    }
    this.synthNoise = this.ctx.createBufferSource();
    this.synthNoise.buffer = noiseBuffer;
    this.synthNoise.loop = true;

    this.synthGain = this.ctx.createGain();
    this.synthGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.synthGain.gain.exponentialRampToValueAtTime(0.42, this.ctx.currentTime + 1.4);

    this.synthOscA.connect(synthFilter);
    this.synthOscSub.connect(synthFilter);
    this.synthOscB.connect(synthFilter);
    this.synthNoise.connect(synthFilter);
    synthFilter.connect(this.synthGain);

    // Route through tape bus so Wow/Flutter, Saturation, Reading Ducking & VU meters engage
    if (this.tapeFilter) {
      this.synthGain.connect(this.tapeFilter);
    } else if (this.analyser) {
      this.synthGain.connect(this.analyser);
    } else {
      this.synthGain.connect(this.ctx.destination);
    }

    this.synthOscA.start();
    this.synthOscSub.start();
    this.synthOscB.start();
    this.synthLfo.start();
    this.synthNoise.start();

    if (this.onPlayStateChange) this.onPlayStateChange(true);
  }

  private stopDroneSynthesis() {
    if (!this.isSynthesizing) return;
    if (this.synthGain && this.ctx) {
      try {
        this.synthGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.synthGain.gain.setValueAtTime(Math.max(0.0001, this.synthGain.gain.value), this.ctx.currentTime);
        this.synthGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.28);
      } catch {
        // Safe fail
      }
    }
    const oscA = this.synthOscA;
    const oscSub = this.synthOscSub;
    const oscB = this.synthOscB;
    const lfo = this.synthLfo;
    const noise = this.synthNoise;

    this.synthOscA = null;
    this.synthOscSub = null;
    this.synthOscB = null;
    this.synthLfo = null;
    this.synthNoise = null;
    this.isSynthesizing = false;

    setTimeout(() => {
      for (const n of [oscA, oscSub, oscB, lfo, noise]) {
        if (n) {
          try {
            n.stop();
            n.disconnect();
          } catch {
            /* pass */
          }
        }
      }
    }, 320);
  }
}
