/**
 * SOVEREIGN AUDIO — Dub Techno Drone Engine
 * Scroll-reactive, ducking-aware ambient audio for borjamoskv.com
 * Extracted from inline <script> for CSP compatibility.
 */

(function() {
  'use strict';

  let audioInitialized = false;
  let wakeOverlayTimer = null;
  let bodyClickHandler = null;

  const WAKE_GLYPHS = ['⟡', '⧉', '◈', '⌬', '▒', '░', '▣', '▦', '✦', '✧', '⟁', '⟠'];

  function prefersReducedMotion() {
    return !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  function launchWakeSequence(initBtn, event, reducedMotion) {
    const existingOverlay = document.querySelector('.sovereign-wake-overlay');
    existingOverlay?.remove();

    const overlay = document.createElement('div');
    overlay.className = 'sovereign-wake-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const backdrop = document.createElement('div');
    backdrop.className = 'sovereign-wake-backdrop';

    const pulse = document.createElement('div');
    pulse.className = 'sovereign-wake-pulse';

    const panel = document.createElement('div');
    panel.className = 'sovereign-wake-panel';
    panel.innerHTML = [
      '<span class="sovereign-wake-kicker">[ + ] MATRIX SIGNAL</span>',
      '<strong class="sovereign-wake-title">AUDIO ONLINE</strong>',
      '<span class="sovereign-wake-subtitle">single-source mode · neon lock engaged</span>'
    ].join('');

    const glyphs = document.createElement('div');
    glyphs.className = 'sovereign-wake-glyphs';

    const rect = initBtn?.getBoundingClientRect?.();
    const originX = event?.clientX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
    const originY = event?.clientY ?? (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);
    overlay.style.setProperty('--wake-x', `${originX}px`);
    overlay.style.setProperty('--wake-y', `${originY}px`);

    const glyphCount = reducedMotion ? 6 : 18;
    const spread = reducedMotion ? 140 : 320;
    for (let index = 0; index < glyphCount; index += 1) {
      const glyph = document.createElement('span');
      glyph.className = 'sovereign-wake-glyph';
      glyph.textContent = WAKE_GLYPHS[index % WAKE_GLYPHS.length];
      const angle = Math.random() * Math.PI * 2;
      const distance = spread * (0.25 + Math.random() * 0.75);
      const x = originX + Math.cos(angle) * distance;
      const y = originY + Math.sin(angle) * distance;
      glyph.style.left = `${x}px`;
      glyph.style.top = `${y}px`;
      glyph.style.setProperty('--wake-delay', `${(index * 0.035).toFixed(3)}s`);
      glyph.style.setProperty('--wake-rotate', `${Math.round((Math.random() * 2 - 1) * 28)}deg`);
      glyph.style.setProperty('--wake-scale', `${(0.85 + Math.random() * 0.65).toFixed(2)}`);
      glyphs.appendChild(glyph);
    }

    overlay.append(backdrop, pulse, panel, glyphs);
    document.body.appendChild(overlay);

    document.documentElement.classList.add('sovereign-wake-active');
    requestAnimationFrame(() => overlay.classList.add('is-visible'));

    if (initBtn) {
      initBtn.classList.add('is-booting');
      initBtn.classList.add('is-awake');
      initBtn.setAttribute('aria-pressed', 'true');
      initBtn.setAttribute('aria-busy', 'true');
      initBtn.textContent = '[ ✓ ] MATRIX ONLINE';
    }

    const activeDuration = reducedMotion ? 1200 : 2200;
    const teardownDelay = reducedMotion ? 160 : 900;

    window.clearTimeout(wakeOverlayTimer);
    wakeOverlayTimer = window.setTimeout(() => {
      overlay.classList.add('is-exiting');
      initBtn?.classList.remove('is-booting');
      window.setTimeout(() => {
        overlay.remove();
        document.documentElement.classList.remove('sovereign-wake-active');
      }, teardownDelay);
    }, activeDuration);
  }

  function bootstrapSovereignAudio(event) {
    if (audioInitialized) return;
    audioInitialized = true;

    if (bodyClickHandler) {
      document.body.removeEventListener('click', bodyClickHandler);
    }

    const audioFocus = globalThis.MOSKV?.audioFocus;
    const initBtn = document.getElementById('sovereign-audio-init');
    const reducedMotion = prefersReducedMotion();

    if (initBtn) {
      initBtn.classList.add('is-booting');
      initBtn.setAttribute('aria-busy', 'true');
    }

    launchWakeSequence(initBtn, event, reducedMotion);

    const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    // ═══ MASTER CHAIN ═══
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -12;
    compressor.knee.value = 10;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.05;
    compressor.release.value = 0.25;

    masterGain.connect(compressor);
    compressor.connect(ctx.destination);

    // ═══ 1. DEEP DUB TECHNO SUB-BASS (Porter Ricks Style) ═══
    const subOsc = ctx.createOscillator();
    const subOsc2 = ctx.createOscillator();
    const subFilter = ctx.createBiquadFilter();
    const subGain = ctx.createGain();

    subOsc.type = 'sine';
    subOsc2.type = 'triangle';
    subOsc.frequency.value = 41.2;
    subOsc2.frequency.value = 41.2;

    subFilter.type = 'lowpass';
    subFilter.frequency.value = 80;
    subFilter.Q.value = 2;

    const subLfo = ctx.createOscillator();
    const subLfoGain = ctx.createGain();
    subLfo.type = 'sine';
    subLfo.frequency.value = 0.03;
    subLfoGain.gain.value = 20;
    subLfo.connect(subLfoGain);
    subLfoGain.connect(subFilter.frequency);
    subLfo.start();

    subOsc.connect(subFilter);
    subOsc2.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start();
    subOsc2.start();

    // ═══ 2. RHYTHMIC NOISE / DUB CHORDS DELAY NETWORK ═══
    const noiseBufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let index = 0; index < noiseBufferSize; index += 1) {
      output[index] = Math.random() * 2 - 1;
    }

    const delayNode = ctx.createDelay(5);
    delayNode.delayTime.value = 0.75;
    const feedbackGain = ctx.createGain();
    feedbackGain.gain.value = 0.65;
    const delayFilter = ctx.createBiquadFilter();
    delayFilter.type = 'bandpass';
    delayFilter.frequency.value = 800;
    delayFilter.Q.value = 1.5;

    delayNode.connect(feedbackGain);
    feedbackGain.connect(delayFilter);
    delayFilter.connect(delayNode);
    delayNode.connect(masterGain);

    function triggerNoiseChord() {
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;
      const arpFilter = ctx.createBiquadFilter();
      arpFilter.type = 'bandpass';
      arpFilter.frequency.value = 1200 + (Math.random() * 1000 - 500);
      arpFilter.Q.value = 8;
      const envGain = ctx.createGain();
      envGain.gain.setValueAtTime(0, ctx.currentTime);
      envGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      envGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      noiseSrc.connect(arpFilter);
      arpFilter.connect(envGain);
      envGain.connect(masterGain);
      envGain.connect(delayNode);
      noiseSrc.start(ctx.currentTime);
      noiseSrc.stop(ctx.currentTime + 0.5);
    }

    const noiseTimer = window.setInterval(() => {
      if (Math.random() > 0.4) {
        triggerNoiseChord();
        if (Math.random() > 0.7) {
          window.setTimeout(triggerNoiseChord, 375);
        }
      }
    }, 3000);

    // ═══ 3. SCROLL-REACTIVE MODULATION ═══
    let targetVolume = 0.35;
    const BASE_VOL = 0.15;
    const MAX_VOL = 0.6;
    const BASE_FILTER = 80;
    const MAX_FILTER = 200;

    function onScrollModulate() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPct = maxScroll > 0 ? window.scrollY / maxScroll : 0;

      targetVolume = BASE_VOL + (scrollPct * (MAX_VOL - BASE_VOL));

      const filterTarget = BASE_FILTER + (scrollPct * (MAX_FILTER - BASE_FILTER));
      subFilter.frequency.setTargetAtTime(filterTarget, ctx.currentTime, 0.3);

      const fbTarget = 0.55 + (scrollPct * 0.25);
      feedbackGain.gain.setTargetAtTime(fbTarget, ctx.currentTime, 0.5);
    }
    window.addEventListener('scroll', onScrollModulate, { passive: true });
    onScrollModulate();

    // ═══ 4. AUDIO COORDINATION — Duck when others are active ═══
    let isDucked = false;

    function coordinationLoop() {
      const autoDJ = globalThis.autoDJAesthetic;
      const autoDJPlaying = autoDJ && !autoDJ.globalMuted && autoDJ.audioUnlocked;
      const spatialActive = typeof SpatialAudio !== 'undefined' && SpatialAudio.isActive;
      const heroVideo = !!globalThis.heroVideoUnmuted;
      const shouldDuck = autoDJPlaying || spatialActive || !!globalThis.lyriaActive || heroVideo;

      if (shouldDuck && !isDucked) {
        isDucked = true;
        masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      } else if (!shouldDuck && isDucked) {
        isDucked = false;
        masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 1.2);
      } else if (!shouldDuck && !isDucked) {
        masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.5);
      }
    }

    const coordinationTimer = window.setInterval(coordinationLoop, 500);

    audioFocus?.register?.('dub-drone', {
      resume: () => {
        isDucked = false;
        masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 1.2);
      },
      suspend: () => {
        isDucked = true;
        masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      },
      restorable: true
    });

    if (!audioFocus?.getActiveOwner?.()) {
      audioFocus?.claim?.('dub-drone', {
        reason: 'dub-drone-init',
        resume: false
      });
      masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime + 0.1, 2);
    }

    document.addEventListener('moskv:audio-focus-change', (focusEvent) => {
      if (!audioFocus) return;
      if (!focusEvent.detail?.activeOwner) {
        audioFocus.claim('dub-drone', {
          reason: 'dub-drone-fallback',
          resume: true
        });
      }
    });

    const duckForWake = () => {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(Math.min(0.48, targetVolume + 0.12), ctx.currentTime + 0.15);
      masterGain.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 1.8);
    };
    duckForWake();

    // ═══ EXPOSE GLOBAL HANDLE ═══
    globalThis.dubDrone = {
      ctx,
      masterGain,
      subFilter,
      feedbackGain,
      mute: () => masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.3),
      unmute: () => masterGain.gain.setTargetAtTime(targetVolume, ctx.currentTime, 1),
      get isDucked() { return isDucked; }
    };

    window.addEventListener('beforeunload', () => {
      window.clearInterval(noiseTimer);
      window.clearInterval(coordinationTimer);
      window.removeEventListener('scroll', onScrollModulate);
    }, { once: true });
  }

  function attachWakeListeners() {
    const initBtn = document.getElementById('sovereign-audio-init');

    if (initBtn) {
      initBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        bootstrapSovereignAudio(event);
      }, { once: true });
    }

    bodyClickHandler = (event) => {
      if (audioInitialized) return;
      const target = event.target;
      if (target instanceof Element && target.closest('#sovereign-audio-init')) return;
      bootstrapSovereignAudio(event);
    };

    document.body.addEventListener('click', bodyClickHandler);
  }

  attachWakeListeners();
})();
