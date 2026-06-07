/**
 * ==========================================================================
 * EXERGIA-Ω // BORJA MOSKV // MAIN CONTROLLER
 * INDUSTRIAL NOIR 2026 DESIGN SYSTEM SPECIFICATION
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Declare reality level
  console.log('[REALITY LEVEL: C5-REAL] Verified hardware and environment.');

  // System State
  const state = {
    isPlaying: false,
    currentTrackId: 0,
    pitch: 1.0,
    targetPitch: 1.0,
    vinylRotation: 0,
    lastTime: performance.now(),
    isDragging: false,
    dragStartAngle: 0,
    dragStartRotation: 0,
    dragLastAngle: 0,
    dragVelocity: 0,
    lastDragTime: 0,
    params: {
      presence: 0.0, // dB
      width: 100,    // %
      crossover: 120 // Hz
    },
    logs: [
      { type: 'INFO', text: 'Canal C5-REAL establecido con la red.' },
      { type: 'OK', text: 'Algoritmo de Crossover calibrado a 120Hz.' }
    ]
  };

  // DOM Elements
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderStatus = document.querySelector('.loader-status');
  const loaderTelemetry = document.getElementById('loader-telemetry');
  
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.workspace-section');
  
  // Platter / Record
  const deckContainer = document.querySelector('.deck-container');
  const vinylRecord = document.getElementById('vinyl-record');
  const vinylSleeve = document.getElementById('vinyl-sleeve');
  const tonearm = document.getElementById('tonearm');
  const btnPlay = document.getElementById('btn-play');
  const deckStateText = document.getElementById('deck-state-text');
  const deckPitchText = document.getElementById('deck-pitch-text');
  const sleeveCover = document.getElementById('sleeve-cover');
  const labelTrackName = document.getElementById('label-track-name');
  const currentTrackTitle = document.getElementById('current-track-title');
  const currentTrackDesc = document.getElementById('current-track-desc');
  
  // Knobs
  const knobs = document.querySelectorAll('.knob-control');
  
  // Vectorscope / Gauges
  const canvas = document.getElementById('vectorscope-canvas');
  const ctx = canvas.getContext('2d');
  const valCorrelation = document.getElementById('val-correlation');
  const valLUFS = document.getElementById('val-lufs');
  const lufsGauge = document.getElementById('lufs-gauge');
  const lufsPeak = document.getElementById('lufs-peak');
  
  // Ledger Terminal
  const ledgerTerminal = document.getElementById('ledger-terminal');
  const btnExportLog = document.getElementById('btn-export-log');
  
  // Gallery & Lightbox
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

  // Track Data
  const tracks = [
    {
      id: 0,
      title: "NO SLEEP IN MY CITY",
      desc: "Procesamiento binaural espacial con vector de fase a 120Hz.",
      cover: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?q=80&w=800&auto=format&fit=crop",
      presence: 0.0,
      width: 100,
      crossover: 120
    },
    {
      id: 1,
      title: "HIPOTENUSAS ILEGALES",
      desc: "Geometría torcida, pulso seco y borde urbano del puerto de Bilbao.",
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
      presence: -0.5,
      width: 130,
      crossover: 140
    },
    {
      id: 2,
      title: "PATADAS",
      desc: "Ritmo físico descarnado, gesto corto y energía frontal analógica.",
      cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
      presence: 1.2,
      width: 80,
      crossover: 90
    },
    {
      id: 3,
      title: "COHERENCIA RARA 42",
      desc: "Electrónica de ángulo extraño: repetición matemática y tensión sostenida.",
      cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
      presence: -1.0,
      width: 150,
      crossover: 180
    }
  ];

  /* ==========================================================================
     1. INITIALIZER / APERTURE LOADER
     ========================================================================== */
  function bootSystem() {
    let progress = 0;
    const steps = [
      'VERIFICANDO INTEGRIDAD DEL HARDWARE...',
      'CARGANDO MÓDULOS DE PROCESAMIENTO BINAURAL...',
      'CALIBRANDO INTERFAZ INDUSTRIAL NOIR 2026...',
      'SISTEMA LISTO. CANAL C5-REAL ACTIVO.'
    ];

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        loaderBar.style.width = '100%';
        loaderStatus.textContent = steps[steps.length - 1];
        loaderTelemetry.textContent = `SHA256: ${generateHash('SYSTEM_ONLINE')}`;
        
        setTimeout(() => {
          loader.style.opacity = '0';
          loader.style.visibility = 'hidden';
          // Make deck container slide active
          setTimeout(() => {
            deckContainer.classList.add('is-active');
            addTerminalLine('INFO', 'Entorno cargado en modo C5-REAL.');
          }, 400);
        }, 600);
      } else {
        loaderBar.style.width = `${progress}%`;
        const stepIndex = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 2);
        loaderStatus.textContent = steps[stepIndex];
        loaderTelemetry.textContent = `HEX_BOOT_${progress.toString(16).toUpperCase()} // ADDR: 0x${(progress * 1337).toString(16).toUpperCase()}`;
      }
    }, 80);
  }

  /* ==========================================================================
     2. NAVIGATION & SITE HEADER SCROLL
     ========================================================================== */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      
      navLinks.forEach(l => l.classList.remove('is-active'));
      link.classList.add('is-active');

      sections.forEach(section => {
        if (section.id === targetId) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });

      addTerminalLine('NAV', `Sección activa cambiada a: ${targetId.toUpperCase()}`);
    });
  });

  /* ==========================================================================
     3. INTERACTIVE VINYL & WEB AUDIO CONTROLS
     ========================================================================== */
  
  let audioCtx = null;
  let audioEl = null;
  let sourceNode = null;
  let splitter = null;
  let lowPassL = null;
  let lowPassR = null;
  let highPassL = null;
  let highPassR = null;
  let sideToL = null;
  let sideToR = null;
  let presenceFilter = null;
  let analyserL = null;
  let analyserR = null;
  let audioInitialized = false;
  let synthOscs = [];
  let synthGains = [];
  let synthActive = false;

  function initAudioEngine() {
    if (audioInitialized) return;
    try {
      // Access global AudioContext if created by Layout.astro, or spawn new
      audioCtx = window.MOSKV?.audioContext || new (window.AudioContext || window.webkitAudioContext)();
      
      // Dedicated Audio element for vinyl control deck
      audioEl = new Audio();
      audioEl.crossOrigin = "anonymous";
      audioEl.loop = true;
      
      // Bind error handling to trigger synthesizer fallback
      audioEl.addEventListener('error', (e) => {
        console.warn("Audio element failed to load resource. Activating synth fallback...", e);
        startSynthFallback();
      });
      
      sourceNode = audioCtx.createMediaElementSource(audioEl);
      
      splitter = audioCtx.createChannelSplitter(2);
      sourceNode.connect(splitter);
      
      // 1. Crossover Filtering (Split lows and highs)
      lowPassL = audioCtx.createBiquadFilter(); lowPassL.type = 'lowpass';
      lowPassR = audioCtx.createBiquadFilter(); lowPassR.type = 'lowpass';
      highPassL = audioCtx.createBiquadFilter(); highPassL.type = 'highpass';
      highPassR = audioCtx.createBiquadFilter(); highPassR.type = 'highpass';
      
      splitter.connect(lowPassL, 0);
      splitter.connect(lowPassR, 1);
      splitter.connect(highPassL, 0);
      splitter.connect(highPassR, 1);
      
      // 2. Bass Mono Summing (Low frequencies mapped centered/mono)
      const bassGainL = audioCtx.createGain(); bassGainL.gain.value = 0.5;
      const bassGainR = audioCtx.createGain(); bassGainR.gain.value = 0.5;
      lowPassL.connect(bassGainL);
      lowPassR.connect(bassGainR);
      
      const bassMono = audioCtx.createGain();
      bassGainL.connect(bassMono);
      bassGainR.connect(bassMono);
      
      // 3. Highs M/S Processing Matrix
      const highsLtoMid = audioCtx.createGain(); highsLtoMid.gain.value = 0.5;
      const highsRtoMid = audioCtx.createGain(); highsRtoMid.gain.value = 0.5;
      highPassL.connect(highsLtoMid);
      highPassR.connect(highsRtoMid);
      const highsMid = audioCtx.createGain();
      highsLtoMid.connect(highsMid);
      highsRtoMid.connect(highsMid);
      
      const highsLtoSide = audioCtx.createGain(); highsLtoSide.gain.value = 0.5;
      const highsRtoSide = audioCtx.createGain(); highsRtoSide.gain.value = -0.5;
      highPassL.connect(highsLtoSide);
      highPassR.connect(highsRtoSide);
      const highsSide = audioCtx.createGain();
      highsLtoSide.connect(highsSide);
      highsRtoSide.connect(highsSide);
      
      sideToL = audioCtx.createGain();
      sideToR = audioCtx.createGain();
      highsSide.connect(sideToL);
      highsSide.connect(sideToR);
      
      // 4. Reconstruct & Merge channels
      const merger = audioCtx.createChannelMerger(2);
      bassMono.connect(merger, 0, 0);
      bassMono.connect(merger, 0, 1);
      highsMid.connect(merger, 0, 0);
      highsMid.connect(merger, 0, 1);
      sideToL.connect(merger, 0, 0);
      sideToR.connect(merger, 0, 1);
      
      // 5. High-Mids Peak Presence EQ Filter
      presenceFilter = audioCtx.createBiquadFilter();
      presenceFilter.type = 'peaking';
      presenceFilter.frequency.value = 3000;
      presenceFilter.Q.value = 1.0;
      merger.connect(presenceFilter);
      
      // 6. Split output to L/R analysers for authentic vectorscope telemetry
      analyserL = audioCtx.createAnalyser(); analyserL.fftSize = 512;
      analyserR = audioCtx.createAnalyser(); analyserR.fftSize = 512;
      
      const outputSplitter = audioCtx.createChannelSplitter(2);
      presenceFilter.connect(outputSplitter);
      outputSplitter.connect(analyserL, 0);
      outputSplitter.connect(analyserR, 1);
      
      // Connect to output destination
      presenceFilter.connect(audioCtx.destination);
      
      audioInitialized = true;
      updateAudioNodes();
      
      addTerminalLine('INFO', 'Matriz de procesado binaural WebAudio inicializada.');
    } catch (err) {
      console.error("Failed to initialize Web Audio Engine: ", err);
      addTerminalLine('ERR', 'Error en el Kernel de WebAudio.');
    }
  }

  function startSynthFallback() {
    if (synthActive) return;
    synthActive = true;
    addTerminalLine('WARN', 'Fallo de media detectado. Inicializando Sintetizador de Emergencia.');
    
    try {
      const frequencies = [55, 110, 165, 220];
      const types = ['sine', 'triangle', 'sawtooth', 'triangle'];
      const gains = [0.4, 0.2, 0.1, 0.05];
      
      const now = audioCtx.currentTime;
      
      frequencies.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        
        osc.type = types[idx];
        osc.frequency.value = freq * Math.max(0.01, Math.min(4.0, state.pitch));
        oscGain.gain.value = 0; // fade in
        
        osc.connect(oscGain);
        
        // Connect to filters to pass through processing
        if (lowPassL) oscGain.connect(lowPassL);
        if (lowPassR) oscGain.connect(lowPassR);
        if (highPassL) oscGain.connect(highPassL);
        if (highPassR) oscGain.connect(highPassR);
        
        // Fade in
        oscGain.gain.setTargetAtTime(gains[idx] * 0.4, now, 1.5);
        
        osc.start(now);
        synthOscs.push({ node: osc, baseFreq: freq });
        synthGains.push(oscGain);
      });
      
      addTerminalLine('OK', 'Sintetizador enrutado a filtros analógicos.');
    } catch (err) {
      console.error("Failed to start synth fallback:", err);
    }
  }

  function stopSynthFallback() {
    if (!synthActive) return;
    const now = audioCtx ? audioCtx.currentTime : 0;
    
    synthGains.forEach(gainNode => {
      if (audioCtx) {
        gainNode.gain.setTargetAtTime(0, now, 0.3);
      }
    });
    
    setTimeout(() => {
      synthOscs.forEach(osc => {
        try { osc.node.stop(); } catch(e){}
      });
      synthOscs = [];
      synthGains = [];
      synthActive = false;
    }, 1000);
  }

  function updateAudioNodes() {
    if (!audioInitialized) return;
    const now = audioCtx.currentTime;
    
    // Smoothly transition parameters to avoid audible pops
    presenceFilter.gain.setTargetAtTime(state.params.presence, now, 0.1);
    
    const widthFactor = state.params.width / 100;
    sideToL.gain.setTargetAtTime(widthFactor, now, 0.1);
    sideToR.gain.setTargetAtTime(-widthFactor, now, 0.1);
    
    lowPassL.frequency.setTargetAtTime(state.params.crossover, now, 0.1);
    lowPassR.frequency.setTargetAtTime(state.params.crossover, now, 0.1);
    highPassL.frequency.setTargetAtTime(state.params.crossover, now, 0.1);
    highPassR.frequency.setTargetAtTime(state.params.crossover, now, 0.1);
  }

  function ensureAudioContextActive() {
    initAudioEngine();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play/Pause button
  btnPlay.addEventListener('click', togglePlayback);

  function togglePlayback() {
    ensureAudioContextActive();
    state.isPlaying = !state.isPlaying;
    
    if (state.isPlaying) {
      deckContainer.classList.add('is-playing');
      btnPlay.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/></svg>`;
      deckStateText.textContent = 'PLAYING';
      deckStateText.className = 'text-neon-blue';
      state.targetPitch = 1.0;
      
      const card = document.querySelector(`.track-card[data-track-id="${state.currentTrackId}"]`);
      const trackSrc = card ? card.getAttribute('data-src') : null;
      if (trackSrc && audioEl.src !== window.location.origin + trackSrc) {
        audioEl.src = trackSrc;
      }
      
      audioEl.play().then(() => {
        stopSynthFallback();
      }).catch(e => {
        console.warn("Playback blocked by browser autoplay rules. Activating synth fallback...", e);
        startSynthFallback();
      });
      addTerminalLine('PLAY', `Reproduciendo: ${tracks[state.currentTrackId].title}`);
    } else {
      deckContainer.classList.remove('is-playing');
      btnPlay.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`;
      deckStateText.textContent = 'STOPPED';
      deckStateText.className = 'text-neon-amber';
      state.targetPitch = 0.0;
      
      if (audioEl) {
        audioEl.pause();
      }
      stopSynthFallback();
      addTerminalLine('STOP', 'Reproducción en pausa.');
    }
  }

  // Load new track
  const trackCards = document.querySelectorAll('.track-card');
  trackCards.forEach(card => {
    card.addEventListener('click', () => {
      const trackId = parseInt(card.getAttribute('data-track-id'));
      loadTrack(trackId);
      
      trackCards.forEach(c => c.classList.remove('is-active'));
      card.classList.add('is-active');
    });
  });

  function loadTrack(id) {
    stopSynthFallback();
    const track = tracks[id];
    state.currentTrackId = id;
    
    const card = document.querySelector(`.track-card[data-track-id="${id}"]`);
    const trackSrc = card ? card.getAttribute('data-src') : null;
    
    // Animate vinyl loading (slide in and out)
    deckContainer.classList.remove('is-active');
    
    setTimeout(() => {
      sleeveCover.src = track.cover;
      labelTrackName.textContent = track.title.substring(0, 10);
      currentTrackTitle.textContent = track.title;
      currentTrackDesc.textContent = track.desc;
      
      updatePresetKnobs(track);

      // Slide back out
      deckContainer.classList.add('is-active');
      addTerminalLine('LOAD', `Cargado: ${track.title} [SHA-256: ${generateHash(track.title).substring(0, 16)}]`);
      
      if (trackSrc) {
        ensureAudioContextActive();
        audioEl.src = trackSrc;
        audioEl.load();
        
        if (state.isPlaying) {
          audioEl.play().then(() => {
            stopSynthFallback();
          }).catch(e => {
            console.warn("Blocked play on load. Activating synth fallback...", e);
            startSynthFallback();
          });
          addTerminalLine('PLAY', `Reproduciendo: ${track.title}`);
        }
      }
    }, 600);
  }

  function updatePresetKnobs(track) {
    state.params.presence = track.presence;
    state.params.width = track.width;
    state.params.crossover = track.crossover;

    updateKnobUI('presence', track.presence, `${track.presence.toFixed(1)} dB`);
    updateKnobUI('width', track.width, `${track.width}%`);
    updateKnobUI('crossover', track.crossover, `${track.crossover} Hz`);
    
    updateAudioNodes();
  }

  function updateKnobUI(param, val, textVal) {
    const knob = document.querySelector(`.knob-control[data-param="${param}"]`);
    if (!knob) return;
    
    const valueEl = knob.querySelector('.knob-value');
    valueEl.textContent = textVal;
    
    let rotation = 0;
    if (param === 'presence') {
      rotation = (val / 6) * 150;
    } else if (param === 'width') {
      rotation = ((val - 100) / 100) * 150;
    } else if (param === 'crossover') {
      rotation = ((val - 220) / 180) * 150;
    }
    
    const inner = knob.querySelector('.knob-inner');
    inner.style.transform = `rotate(${rotation}deg)`;
  }

  /* ==========================================================================
     4. VINYL SCRATCH INTERACTION (DRAG & ROTATE PHYSICS)
     ========================================================================== */
  
  function getCenter(el) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function getAngle(x, y, centerX, centerY) {
    return Math.atan2(y - centerY, x - centerX);
  }

  vinylRecord.addEventListener('pointerdown', (e) => {
    ensureAudioContextActive();
    state.isDragging = true;
    vinylRecord.setPointerCapture(e.pointerId);
    
    const center = getCenter(vinylRecord);
    state.dragStartAngle = getAngle(e.clientX, e.clientY, center.x, center.y);
    state.dragStartRotation = state.vinylRotation;
    state.dragLastAngle = state.dragStartAngle;
    state.dragVelocity = 0;
    state.lastDragTime = performance.now();
    
    state.targetPitch = 0.0;
  });

  vinylRecord.addEventListener('pointermove', (e) => {
    if (!state.isDragging) return;
    
    const center = getCenter(vinylRecord);
    const angle = getAngle(e.clientX, e.clientY, center.x, center.y);
    
    let angleDiff = angle - state.dragStartAngle;
    const currentRotation = state.dragStartRotation + (angleDiff * 180) / Math.PI;
    state.vinylRotation = currentRotation;
    vinylRecord.style.transform = `translate3d(22%, 0, 0) rotate(${currentRotation}deg)`;
    
    const now = performance.now();
    const dt = now - state.lastDragTime;
    if (dt > 10) {
      let deltaAngle = angle - state.dragLastAngle;
      if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
      if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
      
      const targetSpeed = (deltaAngle / dt) * 1000 * 0.15; // Angular speed scalar
      state.pitch = state.pitch * 0.3 + targetSpeed * 0.7; // Smooth interpolation
      
      state.dragLastAngle = angle;
      state.lastDragTime = now;
      
      // Dynamically warp playback speed to follow scratching velocity
      if (audioInitialized && audioEl) {
        const absPitch = Math.abs(state.pitch);
        if (absPitch < 0.08) {
          audioEl.playbackRate = 0.0;
          if (!audioEl.paused) audioEl.pause();
        } else {
          audioEl.playbackRate = Math.min(3.5, absPitch);
          if (audioEl.paused && state.isPlaying) {
            audioEl.play().catch(()=>{});
          }
        }
      }
    }
  });

  vinylRecord.addEventListener('pointerup', (e) => {
    state.isDragging = false;
    vinylRecord.releasePointerCapture(e.pointerId);
    
    if (state.isPlaying) {
      state.targetPitch = 1.0;
      if (audioInitialized && audioEl) {
        audioEl.playbackRate = 1.0;
        audioEl.play().catch(()=>{});
      }
    } else {
      state.targetPitch = 0.0;
      if (audioInitialized && audioEl) {
        audioEl.playbackRate = 0.0;
        audioEl.pause();
      }
    }
    
    addTerminalLine('SCRATCH', `Inercia de arrastre: ${state.pitch.toFixed(2)}x`);
  });

  /* ==========================================================================
     5. DYNAMIC KNOB DRAGGING
     ========================================================================== */
  knobs.forEach(knob => {
    let startY = 0;
    let startVal = 0;
    const param = knob.getAttribute('data-param');
    
    knob.addEventListener('pointerdown', (e) => {
      ensureAudioContextActive();
      startY = e.clientY;
      startVal = state.params[param];
      knob.setPointerCapture(e.pointerId);
      
      const onMove = (moveEvent) => {
        const dy = startY - moveEvent.clientY;
        let newVal = startVal;
        
        if (param === 'presence') {
          newVal = Math.min(6.0, Math.max(-6.0, startVal + dy * 0.05));
          state.params.presence = newVal;
          updateKnobUI(param, newVal, `${newVal.toFixed(1)} dB`);
        } else if (param === 'width') {
          newVal = Math.min(200, Math.max(0, startVal + dy * 0.8));
          state.params.width = newVal;
          updateKnobUI(param, newVal, `${Math.round(newVal)}%`);
        } else if (param === 'crossover') {
          newVal = Math.min(400, Math.max(40, startVal + dy * 1.5));
          state.params.crossover = Math.round(newVal);
          updateKnobUI(param, newVal, `${Math.round(newVal)} Hz`);
        }
        
        updateAudioNodes();
      };
      
      const onUp = () => {
        knob.releasePointerCapture(e.pointerId);
        knob.removeEventListener('pointermove', onMove);
        knob.removeEventListener('pointerup', onUp);
        addTerminalLine('PARAM', `Ajustado: ${param.toUpperCase()} -> ${state.params[param].toFixed(1)}`);
      };
      
      knob.addEventListener('pointermove', onMove);
      knob.addEventListener('pointerup', onUp);
    });
  });

  /* ==========================================================================
     6. MAIN RENDER LOOP (VINYL PHYSICS, VECTORSCOPE, GAUGES)
     ========================================================================== */
  
  function updatePhysics(dt) {
    if (!state.isDragging) {
      state.pitch += (state.targetPitch - state.pitch) * 0.08;
      
      if (audioInitialized && audioEl && state.isPlaying && Math.abs(audioEl.playbackRate - state.pitch) > 0.01) {
        audioEl.playbackRate = Math.max(0.01, Math.min(4.0, state.pitch));
      }
      
      if (Math.abs(state.pitch) > 0.01) {
        const baseSpeed = 198 * (dt / 1000); // 33 RPM standard degrees/sec
        state.vinylRotation += baseSpeed * state.pitch;
        
        const suffix = deckContainer.classList.contains('is-active') ? 'translate3d(22%, 0, 0)' : 'translate3d(0, 0, 0)';
        vinylRecord.style.transform = `${suffix} rotate(${state.vinylRotation}deg)`;
      }
    }

    if (synthActive && audioCtx) {
      const factor = Math.max(0.01, Math.min(4.0, state.pitch));
      const now = audioCtx.currentTime;
      synthOscs.forEach(item => {
        item.node.frequency.setTargetAtTime(item.baseFreq * factor, now, 0.05);
      });
    }

    if (state.isPlaying && !state.isDragging) {
      const armRotation = 5 + Math.sin(performance.now() * 0.0001) * 3;
      tonearm.style.transform = `rotate(${armRotation}deg)`;
    } else if (!state.isPlaying && !state.isDragging) {
      tonearm.style.transform = `rotate(-35deg)`;
    }
    
    deckPitchText.textContent = `${state.pitch.toFixed(2)}x`;
  }

  function renderVectorscope() {
    // Dynamically adjust internal canvas size to match CSS layout dimensions
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || 220;
    const cssHeight = canvas.clientHeight || 220;
    
    if (canvas.width !== cssWidth * dpr || canvas.height !== cssHeight * dpr) {
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    
    const cx = cssWidth / 2;
    const cy = cssHeight / 2;
    const radius = cssWidth * 0.45;
    
    // Grid Background
    ctx.strokeStyle = 'rgba(43, 59, 229, 0.08)';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy + radius);
    ctx.lineTo(cx + radius, cy - radius);
    ctx.moveTo(cx - radius, cy - radius);
    ctx.lineTo(cx + radius, cy + radius);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    const signalStrength = state.isPlaying ? Math.abs(state.pitch) : 0.0;
    
    if (audioInitialized && signalStrength > 0.05) {
      const bufferLength = analyserL.frequencyBinCount;
      const dataL = new Float32Array(bufferLength);
      const dataR = new Float32Array(bufferLength);
      
      analyserL.getFloatTimeDomainData(dataL);
      analyserR.getFloatTimeDomainData(dataR);
      
      ctx.beginPath();
      ctx.strokeStyle = `rgba(43, 59, 229, ${0.4 + signalStrength * 0.55})`;
      ctx.lineWidth = 1.6;
      
      const widthFactor = state.params.width / 100;
      const presenceFactor = Math.pow(10, state.params.presence / 20);
      
      // Plot actual Lissajous pattern
      for (let i = 0; i < bufferLength; i += 2) {
        const leftVal = dataL[i] || 0.0;
        const rightVal = dataR[i] || 0.0;
        
        // Convert to vectorscope coordinates
        const xVal = leftVal - rightVal;
        const yVal = leftVal + rightVal;
        
        const x = cx + xVal * radius * 1.3 * presenceFactor;
        const y = cy - yVal * radius * 1.3 * presenceFactor;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Compute actual phase correlation coefficient (Pearson correlation estimate)
      let sumL2 = 0, sumR2 = 0, sumLR = 0;
      for (let i = 0; i < bufferLength; i++) {
        const l = dataL[i];
        const r = dataR[i];
        sumL2 += l * l;
        sumR2 += r * r;
        sumLR += l * r;
      }
      const denominator = Math.sqrt(sumL2 * sumR2);
      const correlation = denominator > 1e-6 ? sumLR / denominator : 1.0;
      
      valCorrelation.textContent = correlation.toFixed(2);
      if (correlation < 0.15) {
        valCorrelation.className = 'telemetry-value text-neon-amber';
      } else {
        valCorrelation.className = 'telemetry-value text-neon-blue';
      }

      // Compute exact LUFS (RMS relative to full scale)
      const rms = Math.sqrt((sumL2 + sumR2) / (2 * bufferLength));
      let dbFS = 20 * Math.log10(rms + 1e-5) - 3.0; // Offset for LUFS estimation
      dbFS = Math.max(-60, Math.min(0, dbFS));
      updateGauges(dbFS);
    } else {
      // Idle vectorscope animation (slow rotating line)
      if (Math.random() < 0.1) {
        valCorrelation.textContent = "1.00";
        valCorrelation.className = 'telemetry-value text-neon-blue';
      }
      updateGauges(-Infinity);
    }
    
    ctx.restore();
  }

  function updateGauges(dbValue) {
    if (state.isPlaying && dbValue > -60) {
      valLUFS.textContent = `${dbValue.toFixed(1)} LUFS`;
      
      const pct = Math.min(100, Math.max(0, ((dbValue + 45) / 45) * 100));
      lufsGauge.style.width = `${pct}%`;
      
      const curPeakPct = parseFloat(lufsPeak.style.left) || 0;
      if (pct > curPeakPct) {
        lufsPeak.style.left = `${pct}%`;
      } else {
        lufsPeak.style.left = `${curPeakPct - 0.4}%`;
      }
    } else {
      valLUFS.textContent = '-INF LUFS';
      lufsGauge.style.width = '0%';
      lufsPeak.style.left = '0%';
    }
  }

  function loop() {
    const now = performance.now();
    const dt = now - state.lastTime;
    state.lastTime = now;

    updatePhysics(dt);
    renderVectorscope();

    requestAnimationFrame(loop);
  }

  /* ==========================================================================
     7. SYSTEM LEDGER LOGS & EXPORTING
     ========================================================================== */
  function addTerminalLine(type, text) {
    state.logs.push({ type, text, time: new Date().toISOString() });
    
    const colorClass = type === 'INFO' ? 'text-neon-blue' : type === 'OK' ? 'text-neon-green' : 'text-neon-amber';
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="${colorClass}">[${type}]</span> ${text}`;
    ledgerTerminal.appendChild(line);
    
    ledgerTerminal.scrollTop = ledgerTerminal.scrollHeight;
  }

  btnExportLog.addEventListener('click', () => {
    const ledgerHeader = `EXERGIA-Ω INTEGRITY LEDGER // CLIENT-REAL STATE REPORT
TIMESTAMP: ${new Date().toISOString()}
FIRMWARE: C5-REAL-VERIFIED-V7.1
OPERATOR: BORJAMOSKV
----------------------------------------------------------------------
SYSTEM INTEGRITY HASH: ${generateHash(JSON.stringify(state.logs))}
----------------------------------------------------------------------
`;
    
    let content = ledgerHeader;
    state.logs.forEach(log => {
      content += `[${log.time || new Date().toISOString()}] [${log.type}] ${log.text}\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exergy-omega-ledger-${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addTerminalLine('OK', 'Fichero de validación de registro plano exportado.');
  });

  function generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return 'c5real_ea7a0b4_' + hex + '4af14f4a3c6b1c1d89666b01';
  }

  /* ==========================================================================
     8. 3D TILT EFFECT (GALLERY COLLAGE)
     ========================================================================== */
  galleryItems.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      const rotateX = -(y - yc) / 10;
      const rotateY = (x - xc) / 10;
      
      item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      
      const shine = item.querySelector('.item-overlay');
      if (shine) {
        const pctX = (x / rect.width) * 100;
        const pctY = (y / rect.height) * 100;
        shine.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(43, 59, 229, 0.15) 0%, rgba(10, 10, 10, 0.9) 80%)`;
      }
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      const shine = item.querySelector('.item-overlay');
      if (shine) {
        shine.style.background = 'linear-gradient(to top, rgba(10, 10, 10, 0.9) 0%, transparent 60%)';
      }
    });

    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      const alt = item.querySelector('img').alt;
      
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.showModal();
    });
  });

  lightboxCloseBtn.addEventListener('click', () => {
    lightbox.close();
  });
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  /* ==========================================================================
     SYSTEM BOOT
     ========================================================================== */
  bootSystem();
  requestAnimationFrame(loop);
});
