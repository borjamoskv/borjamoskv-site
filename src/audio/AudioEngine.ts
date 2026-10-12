/**
 * Sovereign Web Audio Engine for Borja Moskv Reel-to-Reel Deck
 * Provides analog tape filtering, harmonic saturation, generative drone fallback,
 * and high-resolution AnalyserNode for needle VU meters.
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioEl: HTMLAudioElement;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private tapeFilter: BiquadFilterNode | null = null;
  private tapeShaper: WaveShaperNode | null = null;
  private masterGain: GainNode | null = null;
  
  // Generative synth fallback for items without explicit audio files
  private synthOscA: OscillatorNode | null = null;
  private synthOscB: OscillatorNode | null = null;
  private synthNoise: AudioBufferSourceNode | null = null;
  private synthGain: GainNode | null = null;
  private isSynthesizing: boolean = false;

  private isPlaying: boolean = false;
  private isSaturated: boolean = true;
  private currentTrackUrl: string | null = null;

  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onPlayStateChange?: (isPlaying: boolean) => void;
  public onTrackEnd?: () => void;

  constructor() {
    this.audioEl = new Audio();
    this.audioEl.preload = 'auto';

    this.audioEl.addEventListener('timeupdate', () => {
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.audioEl.currentTime, this.audioEl.duration || 0);
      }
    });

    this.audioEl.addEventListener('ended', () => {
      this.isPlaying = false;
      if (this.onPlayStateChange) this.onPlayStateChange(false);
      if (this.onTrackEnd) this.onTrackEnd();
    });

    this.audioEl.addEventListener('error', () => {
      // If audio file fails, fallback gracefully to analog drone synthesis
      if (this.isPlaying) {
        this.startDroneSynthesis();
      }
    });
  }

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Source from HTML audio
    this.sourceNode = this.ctx.createMediaElementSource(this.audioEl);

    // High frequency tape roll-off filter (warm vintage 15kHz top end)
    this.tapeFilter = this.ctx.createBiquadFilter();
    this.tapeFilter.type = 'lowpass';
    this.tapeFilter.frequency.value = 16500;
    this.tapeFilter.Q.value = 0.707;

    // Harmonic wave shaper for tape saturation
    this.tapeShaper = this.ctx.createWaveShaper();
    this.updateShaperCurve(this.isSaturated);

    // Analyser node for fast ballistics VU meters
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.6;

    // Master volume gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;

    // Connect audio element graph:
    // audioEl -> sourceNode -> tapeFilter -> tapeShaper -> analyser -> masterGain -> destination
    this.sourceNode.connect(this.tapeFilter);
    this.tapeFilter.connect(this.tapeShaper);
    this.tapeShaper.connect(this.analyser);
    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
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
    this.stop();
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

    if (this.currentTrackUrl) {
      try {
        await this.audioEl.play();
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

  public pause() {
    if (this.isSynthesizing) {
      this.stopDroneSynthesis();
    } else {
      this.audioEl.pause();
    }
    this.isPlaying = false;
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  public stop() {
    this.pause();
    if (this.audioEl.src) {
      this.audioEl.currentTime = 0;
    }
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    if (this.audioEl.duration && !this.isSynthesizing) {
      this.audioEl.currentTime = Math.max(0, Math.min(seconds, this.audioEl.duration));
    }
  }

  public seekRelative(deltaSeconds: number) {
    if (this.audioEl.duration && !this.isSynthesizing) {
      this.seek(this.audioEl.currentTime + deltaSeconds);
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

  public getPlaybackState(): { isPlaying: boolean; currentTime: number; duration: number } {
    if (this.isSynthesizing) {
      return { isPlaying: this.isPlaying, currentTime: 0, duration: 60 };
    }
    return {
      isPlaying: this.isPlaying,
      currentTime: this.audioEl.currentTime || 0,
      duration: this.audioEl.duration || 0,
    };
  }

  /**
   * Fast peak & RMS telemetry for needle VU meters
   */
  public getVUMeterLevels(): { left: number; right: number } {
    if (!this.analyser || !this.isPlaying) {
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

    // Ballistics with minor stereo divergence
    const leftLevel = Math.min(1.0, rms * 1.8 + peak * 0.3);
    const rightLevel = Math.min(1.0, rms * 1.7 + peak * 0.35 * 0.95);

    return { left: leftLevel, right: rightLevel };
  }

  /**
   * Continuous warm analog drone synthesis when no track file is linked
   */
  private startDroneSynthesis() {
    if (!this.ctx || this.isSynthesizing) return;
    this.isSynthesizing = true;
    this.isPlaying = true;

    // Sub oscillator (55Hz A1 root)
    this.synthOscA = this.ctx.createOscillator();
    this.synthOscA.type = 'sawtooth';
    this.synthOscA.frequency.value = 55;

    // Sub-harmonic fifth (82.5Hz)
    this.synthOscB = this.ctx.createOscillator();
    this.synthOscB.type = 'sine';
    this.synthOscB.frequency.value = 82.5;

    // Filter for deep warm purr
    const synthFilter = this.ctx.createBiquadFilter();
    synthFilter.type = 'lowpass';
    synthFilter.frequency.value = 240;

    // Generative subtle tape hiss buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.015;
    }
    this.synthNoise = this.ctx.createBufferSource();
    this.synthNoise.buffer = noiseBuffer;
    this.synthNoise.loop = true;

    this.synthGain = this.ctx.createGain();
    this.synthGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.synthGain.gain.exponentialRampToValueAtTime(0.45, this.ctx.currentTime + 1.2);

    this.synthOscA.connect(synthFilter);
    this.synthOscB.connect(synthFilter);
    this.synthNoise.connect(synthFilter);

    if (this.analyser && this.masterGain) {
      synthFilter.connect(this.analyser);
    } else {
      synthFilter.connect(this.ctx.destination);
    }

    this.synthOscA.start();
    this.synthOscB.start();
    this.synthNoise.start();

    if (this.onPlayStateChange) this.onPlayStateChange(true);
  }

  private stopDroneSynthesis() {
    if (this.synthGain && this.ctx) {
      try {
        this.synthGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      } catch {
        // Safe fail
      }
    }
    setTimeout(() => {
      if (this.synthOscA) {
        try { this.synthOscA.stop(); } catch { /* pass */ }
        this.synthOscA = null;
      }
      if (this.synthOscB) {
        try { this.synthOscB.stop(); } catch { /* pass */ }
        this.synthOscB = null;
      }
      if (this.synthNoise) {
        try { this.synthNoise.stop(); } catch { /* pass */ }
        this.synthNoise = null;
      }
      this.isSynthesizing = false;
    }, 350);
  }
}
