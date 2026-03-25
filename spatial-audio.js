/**
 * ═══════════════════════════════════════════════════════════════════
 * SPATIAL AUDIO ENGINE 8K — BORJA MOSKV · Industrial Noir Immersive
 * ═══════════════════════════════════════════════════════════════════
 * 
 * IMMERSIVE EDITION v4.0
 * 12-source HRTF ambisonics field. Binaural brainwave entrainment.
 * Granular noise + procedural rain/wind. Schumann resonance.
 * Harmonic overtone series that evolve over time.
 * Stereo chorus/phaser depth. Orbital spiral panner movement.
 * Audio-reactive visuals → CSS custom properties + DOM manipulation.
 * Mouse/gyroscope/scroll reactive. USE HEADPHONES.
 */

const SpatialAudio = (() => {
  let ctx = null;
  let isActive = false;
  let masterGain = null;
  let analyser = null;
  let freqData = null;
  let nodes = { oscillators: [], panners: [], filters: [], grains: [], schedulers: [] };
  let mouseX = 0, mouseY = 0, scrollY = 0;
  let animFrame = null;
  let evolutionPhase = 0;
  let breathPhase = 0;

  // ─── IMMERSIVE CONFIG ───
  const C = {
    masterVol: 0.16,
    // 12 voices: initial setup (will be modified by binaural states)
    voices: [
      { freq: 36.71, type: 'sine',     gain: 0.055, x:  0, y: -2, z: -3 }, // 0: Base sub
      { freq: 40.71, type: 'sine',     gain: 0.050, x:  0, y: -2, z: -3 }, // 1: Binaural sub (Theta: +4Hz)
      { freq: 55,    type: 'sine',     gain: 0.045, x: -5, y:  0, z: -2 }, // 2: Base low
      { freq: 55.15, type: 'sine',     gain: 0.045, x:  5, y:  0, z: -2 }, // 3: Binaural low (Detune)
      // Harmonic series (evolving)
      { freq: 82.41, type: 'triangle', gain: 0.035, x: -3, y:  2, z: -4 },
      { freq: 110,   type: 'sine',     gain: 0.025, x:  3, y:  2, z: -4 },
      { freq: 164.81,type: 'triangle', gain: 0.018, x: -4, y: -1, z: -6 },
      { freq: 220,   type: 'sine',     gain: 0.014, x:  4, y: -1, z: -6 },
      // High ethereal shimmer
      { freq: 329.63,type: 'sine',     gain: 0.007, x:  0, y:  4, z: -8 },
      { freq: 339.63,type: 'sine',     gain: 0.007, x:  0, y:  4, z: -8 },  
      // Crystalline overtones
      { freq: 440,   type: 'sine',     gain: 0.004, x: -2, y:  3, z: -10 },
      { freq: 659.25,type: 'sine',     gain: 0.002, x:  2, y:  3, z: -12 },
    ],
    noiseBands: [
      // Rumble
      { freq: 60,   Q: 0.15, gain: 0.015, x: -6, y:  0, z: -2 },
      // Warmth
      { freq: 200,  Q: 0.3,  gain: 0.010, x:  6, y:  0, z: -3 },
      // Body
      { freq: 800,  Q: 0.5,  gain: 0.006, x: -3, y:  3, z: -5 },
      // Presence / air
      { freq: 2500, Q: 0.7,  gain: 0.004, x:  3, y:  3, z: -6 },
      // Ultra-high shimmer (rain-like)
      { freq: 6000, Q: 1.2,  gain: 0.003, x:  0, y:  5, z: -8 },
      // Sub-rumble (earth)
      { freq: 30,   Q: 0.1,  gain: 0.012, x:  0, y: -4, z: -1 },
    ],
    lfoRates: [0.017, 0.023, 0.03, 0.05, 0.07, 0.11, 0.13, 0.037, 0.019, 0.041, 0.029, 0.053],
    detuneDepth: [3, 3, 5, 5, 8, 6, 10, 12, 7, 7, 15, 20],
    reverbDecay: 7.0,
    reverbWet: 0.40,
    filterBase: 500,
    // Evolution: harmonic series changes over time
    evolutionCycleMs: 45000,  // Full cycle every 45 seconds
    // Breathing: synced to ~6 breaths per minute
    breathRate: 0.1,  // Hz (6 per minute)
  };

  // ─── PINK NOISE BUFFER (high quality, long) ───
  function createNoiseBuffer(seconds) {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    }
    return buf;
  }

  // ─── PROCEDURAL RAIN BUFFER ───
  function createRainBuffer(seconds) {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let env = 0;
      for (let i = 0; i < len; i++) {
        // Random droplets: occasional sharp transients
        if (Math.random() < 0.0003) {
          env = 0.6 + Math.random() * 0.4; // New droplet
        }
        env *= 0.9997; // Fast exponential decay
        const noise = (Math.random() * 2 - 1) * env;
        // Layer with continuous gentle noise
        const continuous = (Math.random() * 2 - 1) * 0.02;
        d[i] = noise + continuous;
      }
    }
    return buf;
  }

  // ─── REVERB IMPULSE (cathedral-like) ───
  function createReverb() {
    const len = ctx.sampleRate * C.reverbDecay;
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        // Early reflections (first 120ms denser)
        const early = (i < ctx.sampleRate * 0.12) ? 0.65 : 1;
        // Exponential decay with slight modulation for natural feel
        const mod = 1 + 0.1 * Math.sin(2 * Math.PI * t * 3);
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.8) * early * mod;
      }
    }
    const conv = ctx.createConvolver();
    conv.buffer = impulse;
    return conv;
  }

  // ─── PANNER FACTORY (HRTF) ───
  function makePanner(x, y, z) {
    const p = ctx.createPanner();
    p.panningModel = 'HRTF';
    p.distanceModel = 'inverse';
    p.refDistance = 1;
    p.maxDistance = 25;
    p.rolloffFactor = 1.0;
    p.coneInnerAngle = 360;
    p.coneOuterAngle = 360;
    p.positionX.value = x;
    p.positionY.value = y;
    p.positionZ.value = z;
    return p;
  }

  // ─── BINAURAL STATE CONTROL ───
  function setBinauralState(state) {
      if (!isActive || nodes.oscillators.length < 13) return; // Ensure enough oscillators are created
      
      // state can be 'theta' (4Hz), 'alpha' (10Hz), 'delta' (2Hz)
      const baseFreqSub = C.voices[0].freq;
      const baseFreqLow = C.voices[2].freq;
      let diffSub = +4.0;
      let diffLow = +0.15;
      
      switch(state) {
          case 'delta':
              diffSub = 2.0; // Deep sleep / detachment
              diffLow = 0.5;
              break;
          case 'alpha':
              diffSub = 10.0; // Focus / relaxation
              diffLow = 2.0;
              break;
          case 'theta':
          default:
              diffSub = 4.0; // Deep meditation / creativity
              diffLow = 0.15;
              break;
      }
      
      const now = ctx.currentTime;
      // Smoothly transition frequencies over 2 seconds
      // Voice 1 (index 4 in nodes.oscillators) is the binaural sub
      nodes.oscillators[4].frequency.linearRampToValueAtTime(baseFreqSub + diffSub, now + 2);
      // Voice 3 (index 12 in nodes.oscillators) is the binaural low
      nodes.oscillators[12].frequency.linearRampToValueAtTime(baseFreqLow + diffLow, now + 2);
      
      console.log(`[CORTEX Spatial Audio] Switched to ${state.toUpperCase()} state.`);
  }

  // ─── INIT ───
  function init() {
    if (ctx) return;
    ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();

    // Master chain
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;

    // Analyser for audio-reactive visuals
    analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.82;
    freqData = new Uint8Array(analyser.frequencyBinCount);

    // Compressor
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 10;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.12;

    // Limiter
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -2;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.01;

    // Reverb
    const reverb = createReverb();
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = C.reverbWet;
    const dryGain = ctx.createGain();
    dryGain.gain.value = 1 - C.reverbWet;

    const preDelay = ctx.createDelay(0.5);
    preDelay.delayTime.value = 0.04;

    // ── STEREO CHORUS (adds width and depth) ──
    const chorusDelay = ctx.createDelay(0.1);
    chorusDelay.delayTime.value = 0.012;
    const chorusLfo = ctx.createOscillator();
    chorusLfo.type = 'sine';
    chorusLfo.frequency.value = 0.3;
    const chorusLfoGain = ctx.createGain();
    chorusLfoGain.gain.value = 0.004;
    chorusLfo.connect(chorusLfoGain);
    chorusLfoGain.connect(chorusDelay.delayTime);
    chorusLfo.start();
    nodes.oscillators.push(chorusLfo);

    const chorusGain = ctx.createGain();
    chorusGain.gain.value = 0.3;

    // Routing: master → analyser → dry + wet + chorus → compressor → limiter → dest
    masterGain.connect(analyser);
    analyser.connect(dryGain);
    analyser.connect(preDelay);
    analyser.connect(chorusDelay);
    preDelay.connect(reverb);
    reverb.connect(reverbGain);
    chorusDelay.connect(chorusGain);
    dryGain.connect(compressor);
    reverbGain.connect(compressor);
    chorusGain.connect(compressor);
    compressor.connect(limiter);
    limiter.connect(ctx.destination);

    // ── 12 DRONE VOICES ──
    C.voices.forEach((v, i) => {
      const osc = ctx.createOscillator();
      osc.type = v.type;
      osc.frequency.value = v.freq;

      // Detune LFO (slow pitch drift for organic feel)
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = C.lfoRates[i] || 0.03;
      const lfoG = ctx.createGain();
      lfoG.gain.value = C.detuneDepth[i] || 5;
      lfo.connect(lfoG);
      lfoG.connect(osc.detune);
      lfo.start();

      // Amplitude LFO (slow breathing)
      const ampLfo = ctx.createOscillator();
      ampLfo.type = 'sine';
      ampLfo.frequency.value = (C.lfoRates[i] || 0.03) * 0.4;
      const ampG = ctx.createGain();
      ampG.gain.value = v.gain * 0.35;
      ampLfo.connect(ampG);
      ampLfo.start();

      const voiceGain = ctx.createGain();
      voiceGain.gain.value = v.gain;
      ampG.connect(voiceGain.gain);

      // Dark filter with slow sweep
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = C.filterBase + (i * 60);
      filter.Q.value = 0.6;

      const fLfo = ctx.createOscillator();
      fLfo.type = 'sine';
      fLfo.frequency.value = 0.015 + (i * 0.004);
      const fLfoG = ctx.createGain();
      fLfoG.gain.value = 180 + (i * 40);
      fLfo.connect(fLfoG);
      fLfoG.connect(filter.frequency);
      fLfo.start();

      const panner = makePanner(v.x, v.y, v.z);

      osc.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(panner);
      panner.connect(masterGain);
      osc.start();

      nodes.oscillators.push(osc, lfo, ampLfo, fLfo);
      nodes.panners.push(panner);
      nodes.filters.push(filter);
    });

    // ── GRANULAR NOISE (6 bands) ──
    const noiseBuf = createNoiseBuffer(8);
    C.noiseBands.forEach((band, i) => {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;
      src.playbackRate.value = 0.9 + (i * 0.04);

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = band.freq;
      bp.Q.value = band.Q;

      // Noise frequency LFO (wandering filter)
      const nLfo = ctx.createOscillator();
      nLfo.type = 'sine';
      nLfo.frequency.value = 0.01 + (i * 0.006);
      const nLfoG = ctx.createGain();
      nLfoG.gain.value = band.freq * 0.35;
      nLfo.connect(nLfoG);
      nLfoG.connect(bp.frequency);
      nLfo.start();

      const gain = ctx.createGain();
      gain.gain.value = band.gain;
      const panner = makePanner(band.x, band.y, band.z);

      src.connect(bp);
      bp.connect(gain);
      gain.connect(panner);
      panner.connect(masterGain);
      src.start();

      nodes.grains.push(src);
      nodes.oscillators.push(nLfo);
      nodes.panners.push(panner);
    });

    // ── PROCEDURAL RAIN LAYER ──
    const rainBuf = createRainBuffer(10);
    const rainSrc = ctx.createBufferSource();
    rainSrc.buffer = rainBuf;
    rainSrc.loop = true;
    rainSrc.playbackRate.value = 1.0;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'highpass';
    rainFilter.frequency.value = 3000;
    rainFilter.Q.value = 0.3;

    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.025;

    const rainPannerL = makePanner(-8, 3, -5);
    const rainPannerR = makePanner(8, 3, -5);

    // Split rain to two panners for width
    rainSrc.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(rainPannerL);
    rainGain.connect(rainPannerR);
    rainPannerL.connect(masterGain);
    rainPannerR.connect(masterGain);
    rainSrc.start();

    nodes.grains.push(rainSrc);
    nodes.panners.push(rainPannerL, rainPannerR);

    // ── WIND SYNTHESIS (very low filtered noise with slow amplitude) ──
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = noiseBuf;
    windSrc.loop = true;
    windSrc.playbackRate.value = 0.5;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 300;
    windFilter.Q.value = 0.2;

    // Wind amplitude LFO (gusts)
    const windLfo = ctx.createOscillator();
    windLfo.type = 'sine';
    windLfo.frequency.value = 0.08;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 0.015;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.01;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windGain.gain);
    windLfo.start();

    const windPanner = makePanner(-6, 1, -3);
    windSrc.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(windPanner);
    windPanner.connect(masterGain);
    windSrc.start();

    nodes.grains.push(windSrc);
    nodes.oscillators.push(windLfo);
    nodes.panners.push(windPanner);

    // ── METALLIC RESONANCE (industrial texture) ──
    const metallicFreqs = [1337, 2741, 4177];
    metallicFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      // Very slow random detune
      const mLfo = ctx.createOscillator();
      mLfo.type = 'sine';
      mLfo.frequency.value = 0.007 + i * 0.003;
      const mLfoG = ctx.createGain();
      mLfoG.gain.value = freq * 0.01;
      mLfo.connect(mLfoG);
      mLfoG.connect(osc.frequency);
      mLfo.start();

      const mGain = ctx.createGain();
      mGain.gain.value = 0.001; // Very subtle
      const mPanner = makePanner(
        (i - 1) * 5,
        -2 + i,
        -7 - i * 2
      );

      osc.connect(mGain);
      mGain.connect(mPanner);
      mPanner.connect(masterGain);
      osc.start();

      nodes.oscillators.push(osc, mLfo);
      nodes.panners.push(mPanner);
    });

    // ── SCHUMANN RESONANCE (7.83 Hz + harmonics) ──
    [7.83, 14.3, 20.8].forEach((freq, i) => {
      const sch = ctx.createOscillator();
      sch.type = 'sine';
      sch.frequency.value = freq;
      const schG = ctx.createGain();
      schG.gain.value = 0.012 / (i + 1);
      const schF = ctx.createBiquadFilter();
      schF.type = 'lowpass';
      schF.frequency.value = 50;
      const schP = makePanner(0, -3 - i, -2 - i);
      sch.connect(schF);
      schF.connect(schG);
      schG.connect(schP);
      schP.connect(masterGain);
      sch.start();
      nodes.oscillators.push(sch);
      nodes.panners.push(schP);
    });

    // Fade in (slow, like emerging from silence)
    masterGain.gain.setTargetAtTime(C.masterVol, ctx.currentTime + 0.2, 3.0);

    isActive = true;
    startTracking();

    // ── HARMONIC EVOLUTION SCHEDULER ──
    // Slowly modulate voice gains to create an evolving soundscape
    const evolve = () => {
      if (!isActive || !ctx) return;
      evolutionPhase += 0.02;
      
      nodes.filters.forEach((f, i) => {
        if (i < C.voices.length) {
          const base = C.filterBase + (i * 60);
          const evolveAmount = Math.sin(evolutionPhase + i * 0.5) * 0.3 + 0.7;
          f.frequency.setTargetAtTime(base * evolveAmount, ctx.currentTime, 2.0);
        }
      });
      
      setTimeout(evolve, 3000);
    };
    evolve();
  }

  // ─── FREQUENCY BAND HELPERS ───
  function getBand(low, high) {
    if (!freqData || !analyser) return 0;
    const nyquist = ctx.sampleRate / 2;
    const binCount = analyser.frequencyBinCount;
    const lowBin = Math.floor(low / nyquist * binCount);
    const highBin = Math.min(Math.ceil(high / nyquist * binCount), binCount - 1);
    let sum = 0;
    let count = 0;
    for (let i = lowBin; i <= highBin; i++) {
      sum += freqData[i];
      count++;
    }
    return count > 0 ? (sum / count) / 255 : 0;
  }

  // ─── AUDIO-REACTIVE VISUALS (enhanced) ───
  function updateVisuals() {
    if (!analyser || !freqData) return;
    analyser.getByteFrequencyData(freqData);

    const bass    = getBand(20, 100);
    const lowMid  = getBand(100, 400);
    const mid     = getBand(400, 2000);
    const highMid = getBand(2000, 6000);
    const high    = getBand(6000, 16000);
    const energy  = (bass + lowMid + mid) / 3;

    const root = document.documentElement;
    root.style.setProperty('--audio-bass', bass.toFixed(3));
    root.style.setProperty('--audio-mid', mid.toFixed(3));
    root.style.setProperty('--audio-high', high.toFixed(3));
    root.style.setProperty('--audio-energy', energy.toFixed(3));
    
    // EXPORT FOR SWARM REACTIVITY
    root.style.setProperty('--spatial-energy-raw', energy.toFixed(4));
    root.style.setProperty('--spatial-bass-raw', bass.toFixed(4));

    // ── HERO TITLE: scale + glow pulsing with bass ──
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      const scale = 1 + bass * 0.05;
      const glow = bass * 40;
      heroTitle.style.transform = `scale(${scale})`;
      heroTitle.style.textShadow = `0 0 ${glow}px rgba(204, 255, 0, ${bass * 0.7})`;
    }

    // ── MARQUEE: speed modulation on energy ──
    const marquee = document.querySelector('.marquee__inner');
    if (marquee) {
      const speed = 20 - (bass * 10);
      marquee.style.animationDuration = `${Math.max(6, speed)}s`;
    }

    // ── AFORISMO BORDERS: glow intensity on mid ──
    const aforismos = document.querySelectorAll('.aforismo-box');
    aforismos.forEach((el) => {
      const glowIntensity = mid * 25;
      el.style.borderLeftColor = `rgba(204, 255, 0, ${0.3 + mid * 0.7})`;
      el.style.boxShadow = `inset 0 0 ${glowIntensity}px rgba(204, 255, 0, ${mid * 0.2})`;
    });

    // ── PHI WORDS: opacity + micro-motion ──
    const words = document.querySelectorAll('.manifesto-content .word');
    words.forEach((w, i) => {
      const bands = [bass, lowMid, mid, highMid, high, bass];
      const band = bands[i % bands.length];
      w.style.opacity = (0.4 + band * 0.6).toFixed(2);
      w.style.transform = `translateY(${-band * 4}px)`;
    });

    // ── SECTION HEADINGS: hue shift on high frequencies ──
    const headings = document.querySelectorAll('.section-heading');
    headings.forEach(h => {
      const hue = 66 + high * 40;
      h.style.color = `hsl(${hue}, 100%, ${70 + high * 15}%)`;
    });

    // ── GLASS CARDS: backdrop blur reactivity ──
    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach(card => {
      const blur = 6 + lowMid * 16;
      card.style.backdropFilter = `blur(${blur}px)`;
      card.style.webkitBackdropFilter = `blur(${blur}px)`;
    });

    // ── NAV: border pulse on bass ──
    const nav = document.querySelector('.site-nav');
    if (nav) {
      nav.style.borderBottomColor = `rgba(204, 255, 0, ${bass * 0.5})`;
    }

    // ── CHATBOT BUTTON: glow on high ──
    const chatBtn = document.querySelector('.chatquito-open-btn');
    if (chatBtn) {
      chatBtn.style.boxShadow = `0 0 ${high * 20}px rgba(204, 255, 0, ${high * 0.35})`;
    }

    // ── BODY: subtle vignette/glow on bass hits ──
    if (bass > 0.5) {
      root.style.setProperty('--spatial-vignette', `rgba(204, 255, 0, ${(bass - 0.5) * 0.08})`);
    } else {
      root.style.setProperty('--spatial-vignette', 'rgba(204, 255, 0, 0)');
    }

    // ── BREATHING INDICATOR: update the spatial button ──
    breathPhase += 0.016; // ~60fps
    const breathVal = Math.sin(breathPhase * C.breathRate * Math.PI * 2) * 0.5 + 0.5;
    const spatialBtn = document.getElementById('spatialAudioToggle');
    if (spatialBtn && isActive) {
      const breathGlow = 8 + breathVal * 20;
      const breathOpacity = 0.3 + breathVal * 0.5;
      spatialBtn.style.boxShadow = `0 0 ${breathGlow}px rgba(204, 255, 0, ${breathOpacity}), inset 0 0 ${breathGlow * 0.5}px rgba(204, 255, 0, ${breathOpacity * 0.3})`;
    }

    // ── PARTICLE FIELD: inject CSS energy var for particles ──
    root.style.setProperty('--spatial-energy-raw', energy.toFixed(4));
    root.style.setProperty('--spatial-bass-raw', bass.toFixed(4));
  }

  // ─── RESET VISUALS ───
  function resetVisuals() {
    const root = document.documentElement;
    ['--audio-bass', '--audio-mid', '--audio-high', '--audio-energy',
     '--spatial-vignette', '--spatial-energy-raw', '--spatial-bass-raw'].forEach(p => {
      root.style.removeProperty(p);
    });

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      heroTitle.style.transform = '';
      heroTitle.style.textShadow = '';
    }
    const marquee = document.querySelector('.marquee__inner');
    if (marquee) marquee.style.animationDuration = '';

    document.querySelectorAll('.aforismo-box').forEach(el => {
      el.style.borderLeftColor = '';
      el.style.boxShadow = '';
    });
    document.querySelectorAll('.manifesto-content .word').forEach(w => {
      w.style.opacity = '';
      w.style.transform = '';
    });
    document.querySelectorAll('.section-heading').forEach(h => { h.style.color = ''; });
    document.querySelectorAll('.glass-card').forEach(c => {
      c.style.backdropFilter = '';
      c.style.webkitBackdropFilter = '';
    });
    const nav = document.querySelector('.site-nav');
    if (nav) nav.style.borderBottomColor = '';
    const chatBtn = document.querySelector('.chatquito-open-btn');
    if (chatBtn) chatBtn.style.boxShadow = '';
    const spatialBtn = document.getElementById('spatialAudioToggle');
    if (spatialBtn) spatialBtn.style.boxShadow = '';
  }

  // ─── 3D TRACKING + VISUAL UPDATE LOOP ───
  function startTracking() {
    document.addEventListener('mousemove', onMouse);
    document.addEventListener('scroll', onScroll);
    if (globalThis.DeviceOrientationEvent) {
      globalThis.addEventListener('deviceorientation', onGyro);
    }

    function updateFrame() {
      if (!isActive || !ctx) return;

      const t = ctx.currentTime;
      const total = nodes.panners.length;

      // ── ORBITAL SPIRAL panner movement ──
      nodes.panners.forEach((panner, i) => {
        const angle = (i / total) * Math.PI * 2;
        const speed = 0.03 + (i * 0.005);
        // Spiral: radius oscillates while angle rotates
        const radius = 2.5 + Math.sin(t * 0.02 + i * 0.7) * 2.0;
        // 3D Lissajous-like orbits for each voice
        const phaseShift = i * 0.618; // Golden ratio offset for organic distribution

        const baseX = Math.cos(t * speed + angle) * radius;
        const baseY = Math.sin(t * speed * 0.618 + angle + phaseShift) * (radius * 0.7);
        const baseZ = -3 + Math.sin(t * 0.015 + angle * 2) * 4;

        // Mouse/scroll influence (closer voices react more to user)
        const proximity = 1 - (i / total) * 0.6;
        const x = baseX + mouseX * 7 * proximity;
        const y = baseY - mouseY * 5 * proximity;
        const z = baseZ - scrollY * 6;

        panner.positionX.setTargetAtTime(x, t, 0.06);
        panner.positionY.setTargetAtTime(y, t, 0.06);
        panner.positionZ.setTargetAtTime(z, t, 0.06);
      });

      // Listener orientation follows mouse
      if (ctx.listener.forwardX) {
        ctx.listener.forwardX.setTargetAtTime(-mouseX * 0.25, t, 0.12);
        ctx.listener.forwardY.setTargetAtTime(-mouseY * 0.15, t, 0.12);
        ctx.listener.forwardZ.setTargetAtTime(-1, t, 0.12);
        ctx.listener.upX.setTargetAtTime(0, t, 0.12);
        ctx.listener.upY.setTargetAtTime(1, t, 0.12);
        ctx.listener.upZ.setTargetAtTime(0, t, 0.12);
      }

      // Scroll → filter darkness (deeper scroll = darker sound)
      nodes.filters.forEach((f, i) => {
        if (i >= C.voices.length) return;
        const base = C.filterBase + (i * 60);
        const scrollDarken = 1 - scrollY * 0.5;
        f.frequency.setTargetAtTime(base * Math.max(0.2, scrollDarken), t, 0.4);
      });

      // Audio-reactive visuals
      updateVisuals();

      animFrame = requestAnimationFrame(updateFrame);
    }

    updateFrame();
  }

  function onMouse(e) {
    mouseX = (e.clientX / globalThis.innerWidth) * 2 - 1;
    mouseY = (e.clientY / globalThis.innerHeight) * 2 - 1;
  }
  function onScroll() {
    const max = document.documentElement.scrollHeight - globalThis.innerHeight;
    scrollY = max > 0 ? globalThis.scrollY / max : 0;
  }
  function onGyro(e) {
    if (e.gamma !== null) mouseX = Math.max(-1, Math.min(1, e.gamma / 35));
    if (e.beta !== null) mouseY = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
  }

  function activateFromFocus() {
    if (!ctx) init();
    if (isActive) return true;
    masterGain.gain.setTargetAtTime(C.masterVol, ctx.currentTime, 2.0);
    isActive = true;
    startTracking();
    if (window.dubDrone) window.dubDrone.mute();
    return true;
  }

  function deactivateFromFocus() {
    if (!ctx || !isActive) return false;
    masterGain.gain.setTargetAtTime(0, ctx.currentTime, 1.2);
    isActive = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    setTimeout(resetVisuals, 400);
    if (window.dubDrone) window.dubDrone.unmute();
    return false;
  }

  // ─── TOGGLE ───
  function toggle() {
    if (isActive) {
      deactivateFromFocus();
      globalThis.MOSKV?.audioFocus?.release?.('spatial', { reason: 'spatial-toggle' });
      return false;
    }
    globalThis.MOSKV?.audioFocus?.claim?.('spatial', {
      reason: 'spatial-toggle',
      resume: false
    });
    return activateFromFocus();
  }

  // ─── BINAURAL STATE CONTROL ───
  function setBinauralState(state) {
    if (!ctx || nodes.oscillators.length < 4) return;
    
    // States defines the Hz offset for the binaural beat
    // sub base is 36.71, low base is 55.0
    let offset1 = 4; // Default Theta
    let offset2 = 0.15;

    if (state === 'delta') {
      offset1 = 2; // Deep sleep / detachment
      offset2 = 1.5;
    } else if (state === 'theta') {
      offset1 = 4; // Meditation / creativity
      offset2 = 5;
    } else if (state === 'alpha') {
      offset1 = 10; // Relaxed focus
      offset2 = 8;
    }

    // Smooth transition to new binaural frequencies
    const t = ctx.currentTime;
    nodes.oscillators[1].frequency.setTargetAtTime(C.voices[0].freq + offset1, t, 2.0); // Sub pair
    nodes.oscillators[3].frequency.setTargetAtTime(C.voices[2].freq + offset2, t, 2.0); // Low pair
    
    // Adjust colors globally for the mood
    const root = document.documentElement;
    if (state === 'delta') {
      root.style.setProperty('--accent-primary', '#0044FF');
      root.style.setProperty('--color-cyber-lime', '#0044FF');
    } else if (state === 'theta') {
      root.style.setProperty('--accent-primary', '#CCFF00');
      root.style.setProperty('--color-cyber-lime', '#CCFF00');
    } else if (state === 'alpha') {
      root.style.setProperty('--accent-primary', '#FF0055');
      root.style.setProperty('--color-cyber-lime', '#FF0055');
    }
  }

  // ─── DESTROY ───
  function destroy() {
    globalThis.MOSKV?.audioFocus?.release?.('spatial', {
      reason: 'spatial-destroy',
      resumePrevious: false
    });
    if (animFrame) cancelAnimationFrame(animFrame);
    nodes.oscillators.forEach(s => { try { s.stop(); } catch(ex) { /* */ } });
    nodes.grains.forEach(s => { try { s.stop(); } catch(ex) { /* */ } });
    if (ctx) ctx.close();
    ctx = null;
    isActive = false;
    nodes = { oscillators: [], panners: [], filters: [], grains: [], schedulers: [] };
    resetVisuals();
    if (window.dubDrone) window.dubDrone.unmute();
  }

  globalThis.MOSKV?.audioFocus?.register?.('spatial', {
    resume: () => activateFromFocus(),
    suspend: () => deactivateFromFocus(),
    restorable: true
  });

  return { init, toggle, destroy, setBinauralState, get isActive() { return isActive; }, get energy() { return getBand(20, 2000); }, get bass() { return getBand(20, 100); } };
})();

// ─── IMMERSIVE UI ───
document.addEventListener('DOMContentLoaded', () => {
  const container = document.createElement('div');
  container.className = 'spatial-control-container';
  container.innerHTML = `
    <button id="spatialAudioToggle" class="spatial-audio-btn" aria-label="Activar audio espacial inmersivo 8K">
      <span class="spatial-icon">🎧</span>
      <span class="spatial-label">INMERSIÓN 8K</span>
      <i class="spatial-subtitle">PARA UNA EXPERIENCIA MEJOR, MÉTASE UNO POR DETROIT</i>
    </button>
    <div class="spatial-binaural-controls" style="display:none;">
      <button data-state="delta" title="2Hz - Deep Sleep / Detachment">DELTA</button>
      <button data-state="theta" class="active" title="4Hz - Meditation / Creativity">THETA</button>
      <button data-state="alpha" title="10Hz - Relaxed Focus">ALPHA</button>
    </div>
  `;
  document.body.appendChild(container);

  const btn = document.getElementById('spatialAudioToggle');
  const controls = container.querySelector('.spatial-binaural-controls');
  const stateBtns = controls.querySelectorAll('button');

  btn.addEventListener('click', () => {
    const on = SpatialAudio.toggle();
    btn.classList.toggle('active', on);
    if (on) {
      btn.innerHTML = `<span class="spatial-icon">🎧</span><span class="spatial-label">8K ■ LIVE</span><span class="spatial-subtitle">inmersión activa</span>`;
      controls.style.display = 'flex';
    } else {
      btn.innerHTML = `<span class="spatial-icon">🎧</span><span class="spatial-label">INMERSIÓN 8K</span><i class="spatial-subtitle">PARA UNA EXPERIENCIA MEJOR, MÉTASE UNO POR DETROIT</i>`;
      controls.style.display = 'none';
    }
  });

  stateBtns.forEach(b => {
    b.addEventListener('click', (e) => {
      // update active class
      stateBtns.forEach(xb => xb.classList.remove('active'));
      e.target.classList.add('active');
      // set state
      SpatialAudio.setBinauralState(e.target.dataset.state);
    });
  });
});
