/**
 * ═══════════════════════════════════════════════════════════════════
 * AUTO-DJ A/V ENGINE (INVISIBLE)
 * Dual-deck YouTube Crossfader + Mutual Exclusion + BPM Sync
 * ═══════════════════════════════════════════════════════════════════
 */

class AutoDJAesthetic {
  constructor() {
    this.deckA = null;
    this.deckB = null;
    this.activeDeck = 'a';
    this.isCrossfading = false;
    this.globalMuted = false;
    this.mixCount = 0;
    this.trackStartTime = Date.now();
    this.elapsedTimer = null;
    this.isBackgroundPausedByEmbed = false;
    this.pauseReasons = new Set();
    this.singleSourceAudio = true;
    
    // Harmony & Timing
    this.fadeDurationMs = 3000; 
    this.masterBPM = 125; // Default master tempo

    // Automated DJ Sequence Configuration
    this.autoMixTimer = null;
    this.heroVisualId = globalThis.DATA?.heroBackground?.id || 'b9ktVQN48OU';
    this.currentVideoId = this.heroVisualId;
    // Curated initial sequence, driven from data.js so the background deck stays easy to tune.
    this.mixSequence = [...(globalThis.DATA?.backgroundVisuals || ['x8E9HInpzE4', 'b9ktVQN48OU', 'hsdOCzJpUMg'])];
    this.mixIntervalMs = 40000; // Default fallback (dynamic phrases used instead)

    // Real BPM mapping for known tracks to perfectly beatmatch
    this.bpmCache = {
      'b9ktVQN48OU': 128, // LES BUKO
      'Otvpn9vfXOE': 130, // ME CAIGO Y ME LEVANTO
      'Yr5CMXrJgIo': 118, // LINDSTROM
      'NYhOQTcNLkA': 120, // ECOS
      'x8E9HInpzE4': 125, // GLITCH
      'ZB13zY5h4bc': 128, // EL CIGALA
      'rmzKC8AYkVw': 126, // 32 ELEC TRACKS
      '0S43IwBF0uM': 127, // STAR GUITAR
      'UrX4mqXmapE': 105  // CHACARRON
    };

    // ═══════════════════════════════════════════
    // CAMELOT WHEEL — Harmonic Key Mixing System
    // ═══════════════════════════════════════════
    // Maps tracks to Camelot keys. Compatible keys:
    // Same number (8A->8A), ±1 number (8A->7A, 9A), inner/outer (8A->8B)
    this.keyCache = {
      'b9ktVQN48OU': '8A',  // LES BUKO (Am)
      'Otvpn9vfXOE': '5A',  // ME CAIGO (Fm)
      'Yr5CMXrJgIo': '10B', // LINDSTROM (Gb)
      'NYhOQTcNLkA': '11A', // ECOS (F#m)
      'x8E9HInpzE4': '8B',  // GLITCH (C)
      'ZB13zY5h4bc': '7A',  // CIGALA (Gm)
      'rmzKC8AYkVw': '9A',  // 32 ELEC (Bm)
      '0S43IwBF0uM': '8A',  // STAR GUITAR (Am)
      'UrX4mqXmapE': '8A'   // CHACARRON (Am)
    };

    // ═══════════════════════════════════════════
    // ENERGY ARC — Professional Set Progression
    // ═══════════════════════════════════════════
    // Like a real DJ set: start ambient, build to peak, cool down
    this.energyPhase = 'warmup'; // warmup -> buildup -> peak -> cooldown
    this.setStartTime = Date.now();

    // ═══════════════════════════════════════════
    // HOT CUES — Avoid 0:00 direct intros
    // ═══════════════════════════════════════════
    this.cueCache = {
      'b9ktVQN48OU': 5,   // LES BUKO
      'hY0G0Zxf_uo': 5,   // 32 Y PICO
      'Otvpn9vfXOE': 10,  // ME CAIGO
      'Yr5CMXrJgIo': 30,  // LINDSTROM (Long intro)
      'NYhOQTcNLkA': 15,  // ECOS
      'x8E9HInpzE4': 20,  // GLITCH
      'ZB13zY5h4bc': 5,   // CIGALA
      'rmzKC8AYkVw': 10,  // 32 ELEC
      '0S43IwBF0uM': 22,  // STAR GUITAR (Skip blank intro)
      'UrX4mqXmapE': 14   // CHACARRON (Direct into vocals)
    };

    // 🎤 Spotify-style DJ Voice & Mood System
    this.currentMood = localStorage.getItem('moskv_dj_mood') || 'original';
    this.playedTracks = JSON.parse(localStorage.getItem('moskv_dj_history') || '[]');
    this.voiceEnabled = false; // Voice-off by default; keep the mix silent unless explicitly re-enabled later.

    // 💾 Persistent User Memory (TikTok-style)
    this.userProfile = JSON.parse(localStorage.getItem('moskv_user') || '{}');
    this.userProfile.visits = (this.userProfile.visits || 0) + 1;
    this.userProfile.firstSeen = this.userProfile.firstSeen || new Date().toISOString();
    this.userProfile.lastSeen = new Date().toISOString();
    this.userProfile.totalListenSec = this.userProfile.totalListenSec || 0;
    localStorage.setItem('moskv_user', JSON.stringify(this.userProfile));

    // ─── WEB AUDIO INDEPENDENT DUAL DECK ───
    this.audioA = new Audio();
    this.audioB = new Audio();
    this.audioA.crossOrigin = "anonymous";
    this.audioB.crossOrigin = "anonymous";
    this.audioA.loop = true;
    this.audioB.loop = true;
    this.audioContext = null;
    this.gainA = null;
    this.gainB = null;
    this.eqA = null;
    this.eqB = null;
    this.analyser = null;

    // 📦 TikTok Prefetch Queue (next 2 tracks pre-selected)
    this.prefetchQueue = [];

    // Inject YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Global callback required by YT API
    globalThis.onYouTubeIframeAPIReady = () => this.initPlayers();

    globalThis.MOSKV?.audioFocus?.register?.('autodj', {
      resume: () => this.resumeBackgroundMusic('focus'),
      suspend: () => this.pauseBackgroundMusic('focus'),
      restorable: true
    });
    globalThis.MOSKV?.audioFocus?.register?.('external-embed', {
      resume: () => {},
      suspend: () => {},
      restorable: false
    });

    requestAnimationFrame(() => this._renderVideoReel());
    
    // Start listening to clicks
    this.bindClickEvents();
    this.bindEmbedListeners();
  }

  // Harmonic approximation: Assigns a persistent random BPM to unknown tracks
  getTrackBPM(videoId) {
    if (this.bpmCache[videoId]) return this.bpmCache[videoId];
    // Assign a synthetic BPM between 110 and 135 to simulate DJ environments
    const bpm = 110 + Math.floor(Math.random() * 25);
    this.bpmCache[videoId] = bpm;
    return bpm;
  }

  _claimFocus(reason = 'autodj-active', options = {}) {
    if (this.globalMuted || !this.audioUnlocked) return;
    globalThis.MOSKV?.audioFocus?.claim?.('autodj', {
      reason,
      resume: false,
      ...options
    });
  }

  _releaseFocus(reason = 'autodj-idle') {
    globalThis.MOSKV?.audioFocus?.release?.('autodj', { reason });
  }

  _getBackgroundVisuals() {
    const visualPool = globalThis.DATA?.backgroundVisuals || globalThis.DATA?.bgVideos || [];
    return [...new Set(visualPool.filter(Boolean))];
  }

  initPlayers() {
    const visualPool = this._getBackgroundVisuals();
    if (visualPool.length === 0) return;
    
    // [EXPERT DJ] Abrimos con visuales más cinematográficos y mantenemos el segundo deck preparado
    const startVidA = visualPool.includes(this.heroVisualId) ? this.heroVisualId : visualPool[0];
    const secondaryPool = visualPool.filter(id => id !== startVidA);
    const startVidB = secondaryPool[Math.floor(Math.random() * secondaryPool.length)] || startVidA;
    const startCueA = this.cueCache[startVidA] || 0;
    const startCueB = this.cueCache[startVidB] || 0;
    this.currentVideoId = startVidA;
    this._updateVideoIdentity(startVidA, true);
    this._setDeckPoster('a', startVidA);
    this._setDeckPoster('b', startVidB);
    this._showDeckPoster('a');
    this._showDeckPoster('b');
    this._renderVideoReel();

    this.masterBPM = this.getTrackBPM(startVidA);
    this.audioA.src = `audio/${startVidA}.webm`;
    this.audioB.src = `audio/${startVidB}.webm`;

    const commonParams = {
      autoplay: 1, mute: 1, controls: 0, disablekb: 1, fs: 0,
      iv_load_policy: 3, loop: 1, modestbranding: 1, playsinline: 1, rel: 0,
      vq: 'highres', origin: window.location.origin
    };

    this.deckA = new YT.Player('bg-video-a', {
      videoId: startVidA,
      playerVars: { ...commonParams, playlist: startVidA, start: startCueA },
      events: {
        'onReady': (e) => this.onPlayerReady(e, 'a'),
        'onStateChange': (e) => this.onPlayerStateChange(e, 'a')
      }
    });

    this.deckB = new YT.Player('bg-video-b', {
      videoId: startVidB,
      playerVars: { ...commonParams, playlist: startVidB, start: startCueB },
      events: {
        'onReady': (e) => this.onPlayerReady(e, 'b'),
        'onStateChange': (e) => this.onPlayerStateChange(e, 'b')
      }
    });
  }

  onPlayerReady(event, deckId) {
    // ALWAYS MUTE YOUTUBE VIDEOS. We use standalone Audio context for DJing.
    event.target.mute();
    if (typeof event.target.setPlaybackQuality === 'function') {
      event.target.setPlaybackQuality('highres');
      setTimeout(() => event.target.setPlaybackQuality('highres'), 800);
      setTimeout(() => event.target.setPlaybackQuality('hd1080'), 1600);
    }
    
    if (deckId === 'a') {
      const cuePoint = this.cueCache[this.currentVideoId] || 0;
      event.target.setPlaybackRate(1.0); // Native speed initially
      document.getElementById('video-deck-a').style.opacity = 1;
      event.target.playVideo();
      if (cuePoint > 0 && typeof event.target.seekTo === 'function') {
        setTimeout(() => event.target.seekTo(cuePoint, true), 250);
      }
    } else {
      document.getElementById('video-deck-b').style.opacity = 0;
      event.target.pauseVideo();
    }

    const soundToggle = document.getElementById('heroSoundToggle');
    if (soundToggle && !soundToggle.dataset.autodjBound) {
      soundToggle.dataset.autodjBound = 'true';
      const newToggle = soundToggle.cloneNode(true);
      soundToggle.parentNode.replaceChild(newToggle, soundToggle);
      
      newToggle.addEventListener('click', (e) => {
         e.stopPropagation();
         this.toggleGlobalMute();
      });
    }
  }

  onPlayerStateChange(event, deckId) {
    if (typeof YT === 'undefined' || !YT.PlayerState) return;

    if (event.data === YT.PlayerState.PLAYING) {
      setTimeout(() => this._hideDeckPoster(deckId), 4500);
    }
  }

  _getPosterUrl(videoId) {
    return [
      `url("https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp")`,
      `url("https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg")`,
      `url("https://i.ytimg.com/vi/${videoId}/hqdefault.jpg")`
    ].join(', ');
  }

  _setDeckPoster(deckId, videoId) {
    const poster = document.getElementById(`video-poster-${deckId}`);
    if (!poster) return;
    poster.style.backgroundImage = this._getPosterUrl(videoId);
  }

  _showDeckPoster(deckId) {
    const poster = document.getElementById(`video-poster-${deckId}`);
    if (!poster) return;
    poster.classList.remove('is-hidden');
  }

  _hideDeckPoster(deckId) {
    const poster = document.getElementById(`video-poster-${deckId}`);
    if (!poster) return;
    poster.classList.add('is-hidden');
  }

  toggleGlobalMute() {
    this.globalMuted = !this.globalMuted;
    
    // Mute/Unmute active Web Audio deck
    if (this.audioContext) {
        const activeGain = this.activeDeck === 'a' ? this.gainA : this.gainB;
        activeGain.gain.setValueAtTime(this.globalMuted ? 0 : 1, this.audioContext.currentTime);
    }

    if (this.globalMuted) {
      this.pauseBackgroundMusic('manual-mute');
      this._releaseFocus('autodj-muted');
    } else {
      this.resumeBackgroundMusic('manual-mute');
      this._claimFocus('autodj-unmuted');
    }
    
    const iconUnmute = document.querySelector('.icon-unmute');
    const iconMute = document.querySelector('.icon-mute');
    if (this.globalMuted) {
      if (iconUnmute) iconUnmute.style.display = 'block';
      if (iconMute) iconMute.style.display = 'none';
    } else {
      if (iconUnmute) iconUnmute.style.display = 'none';
      if (iconMute) iconMute.style.display = 'block';
    }
  }

  bindClickEvents() {
    this.audioUnlocked = false;

    // First global interaction to unlock audio policies
    const unlockAudio = () => {
      if (this.audioUnlocked) return;
      this.audioUnlocked = true;
      
      // Initialize Web Audio Engine Context on user interaction
      if (!this.audioContext) {
          this.audioContext = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
          
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 128; // Small size for punchy bass detection
          
          const createEQ = () => {
              const low = this.audioContext.createBiquadFilter();
              low.type = 'lowshelf'; low.frequency.value = 250;
              const mid = this.audioContext.createBiquadFilter();
              mid.type = 'peaking'; mid.frequency.value = 1000; mid.Q.value = 1;
              const high = this.audioContext.createBiquadFilter();
              high.type = 'highshelf'; high.frequency.value = 4000;
              
              // 🎛️ HPF (High-Pass Filter) for DJ Sweeps
              const hpf = this.audioContext.createBiquadFilter();
              hpf.type = 'highpass'; 
              hpf.frequency.value = 0; // Inactive by default
              hpf.Q.value = 2.0;       // Resonance for that classic Pioneer filter sound
              
              low.connect(mid).connect(high).connect(hpf);
              return { low, mid, high, hpf, input: low, output: hpf };
          };

          // 🎛️ DUB ECHO FX BUS (Global auxiliary send)
          this.echoDelay = this.audioContext.createDelay();
          this.echoDelay.delayTime.value = (60 / this.masterBPM) * 0.75; // 3/4 beat delay
          this.echoFeedback = this.audioContext.createGain();
          this.echoFeedback.gain.value = 0.6; // 60% feedback loop
          this.echoFilter = this.audioContext.createBiquadFilter();
          this.echoFilter.type = 'highpass';
          this.echoFilter.frequency.value = 500; // Wash out the lows in the echo
          
          this.echoDelay.connect(this.echoFeedback);
          this.echoFeedback.connect(this.echoFilter);
          this.echoFilter.connect(this.echoDelay);
          // Echo return to main mix (will connect to compressor later)
          this.echoReturn = this.audioContext.createGain();
          this.echoDelay.connect(this.echoReturn);

          const sourceA = this.audioContext.createMediaElementSource(this.audioA);
          this.eqA = createEQ();
          this.gainA = this.audioContext.createGain();
          this.gainA.gain.value = this.activeDeck === 'a' ? (this.globalMuted ? 0 : 1) : 0;
          sourceA.connect(this.eqA.input);
          this.eqA.output.connect(this.gainA);
          
          // Aux sends to Echo
          this.auxA = this.audioContext.createGain();
          this.auxA.gain.value = 0;
          this.eqA.output.connect(this.auxA);
          this.auxA.connect(this.echoDelay);

          const sourceB = this.audioContext.createMediaElementSource(this.audioB);
          this.eqB = createEQ();
          this.gainB = this.audioContext.createGain();
          this.gainB.gain.value = this.activeDeck === 'b' ? (this.globalMuted ? 0 : 1) : 0;
          sourceB.connect(this.eqB.input);
          this.eqB.output.connect(this.gainB);
          
          // Aux sends to Echo
          this.auxB = this.audioContext.createGain();
          this.auxB.gain.value = 0;
          this.eqB.output.connect(this.auxB);
          this.auxB.connect(this.echoDelay);
          
          // ═══════════════════════════════════════════
          // MASTER BUS: Compressor -> Analyser -> Output
          // ═══════════════════════════════════════════
          // Prevents clipping during dual-deck crossfades and normalizes loudness
          this.compressor = this.audioContext.createDynamicsCompressor();
          this.compressor.threshold.value = -24; // Start compressing at -24dB
          this.compressor.knee.value = 12;        // Smooth curve
          this.compressor.ratio.value = 4;         // 4:1 ratio (gentle squeeze)
          this.compressor.attack.value = 0.003;    // Fast attack for transients
          this.compressor.release.value = 0.15;    // Medium release for groove
          
          // Master Limiter (Brick wall at -1dB)
          this.limiter = this.audioContext.createDynamicsCompressor();
          this.limiter.threshold.value = -1;
          this.limiter.knee.value = 0;
          this.limiter.ratio.value = 20;
          this.limiter.attack.value = 0.001;
          this.limiter.release.value = 0.01;
          
          // Route: GainA/B -> Compressor -> Limiter -> Analyser -> Speakers
          this.gainA.connect(this.compressor);
          this.gainB.connect(this.compressor);
          this.echoReturn.connect(this.compressor); // Route echo into master comp
          this.compressor.connect(this.limiter);
          this.limiter.connect(this.analyser);
          this.analyser.connect(this.audioContext.destination);
          
          this._startAudioReactivity();
      }
      
      if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
      }
      
      if (this.activeDeck === 'a') {
          this.audioA.play().catch(e => console.warn(e));
      } else {
          this.audioB.play().catch(e => console.warn(e));
      }

      if (!this.globalMuted) {
        this._claimFocus('autodj-unlock');
      }

      // Start the automated DJ setlist loop once audio is unblocked
      console.log("[CORTEX AutoDJ] Starting Automated Mix Sequence (40s intervals)");
      this.initAgentUI();
      this.scheduleNextMix();
      
      // Remove mousemove/scroll listeners once unlocked to save perf
      globalThis.removeEventListener('mousemove', unlockAudio, { capture: true });
      globalThis.removeEventListener('scroll', unlockAudio, { capture: true });
    };

    ['click', 'touchstart', 'keydown', 'mousemove', 'scroll', 'wheel'].forEach(evt => 
      document.addEventListener(evt, unlockAudio, { once: true, capture: true })
    );

    document.addEventListener('click', (e) => {
      const isInteractive = e.target.closest('a, button, input, iframe, .filter-btn, .spatial-audio-btn, #chiquito-overlay');
      if (isInteractive) return;
      if (this.isBackgroundPausedByEmbed) return;
      
      // If audio wasn't unlocked until this exact click, don't crossfade yet!
      // We check if it JUST got unlocked. Actually, since unlockAudio is in 'capture' 
      // and this is bubble, it's already true. Let's use a flag to skip the first click crossfade.
      if (!this.firstCrossfadeReady) {
         this.firstCrossfadeReady = true;
         return; // Skip crossfade on first click so user hears the initial track.
      }

      this.triggerCrossfade();
    });

    const backgroundTrigger = document.getElementById('av-trigger');
    if (backgroundTrigger && !backgroundTrigger.dataset.autodjBound) {
      backgroundTrigger.dataset.autodjBound = 'true';
      const activateBackgroundMix = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (this.isBackgroundPausedByEmbed || this.isCrossfading) return;
        this.firstCrossfadeReady = true;
        this.triggerCrossfade();
      };

      backgroundTrigger.addEventListener('click', activateBackgroundMix);
      backgroundTrigger.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        activateBackgroundMix(event);
      });
    }
  }

  initAgentUI() {
    this.agentUI = document.createElement('div');
    this.agentUI.className = 'moskv-dj-hud idle';
    this.agentUI.innerHTML = `
        <div class="dj-header">
            <div><span class="dj-live-dot"></span> MOSKV-1 AUTODJ</div>
            <div class="dj-header-right">
                <span id="dj-mix-count" class="dj-mix-count">MIX #0</span>
                <span id="dj-bpm-master">130 BPM</span>
            </div>
        </div>
        <div class="dj-decks">
            <div class="dj-deck active" id="dj-deck-a-ui">
                <span>DK-A ▶</span>
                <span id="dj-track-a">LOADING...</span>
            </div>
            <div class="dj-deck" id="dj-deck-b-ui">
                <span>DK-B ⏸</span>
                <span id="dj-track-b">STANDBY</span>
            </div>
        </div>
        <div class="dj-waveform" id="dj-waveform">
            ${Array.from({length: 32}, () => `<div class="wv-bar"></div>`).join('')}
        </div>
        <div class="dj-progress-row">
            <span id="dj-elapsed">00:00</span>
            <div class="dj-progress-bar"><div class="dj-progress-fill" id="dj-progress-fill"></div></div>
            <span id="dj-next-in">--:--</span>
        </div>
        <div class="dj-eq">
            <div class="eq-bar" id="eq-low"></div><div class="eq-bar" id="eq-mid"></div><div class="eq-bar" id="eq-high"></div>
        </div>
        <div class="dj-mood-row" id="dj-mood-row">
            <button class="dj-mood-btn ${this.currentMood === 'all' ? 'active' : ''}" data-mood="all">ALL</button>
            <button class="dj-mood-btn ${this.currentMood === 'ambient' ? 'active' : ''}" data-mood="ambient">AMBIENT</button>
            <button class="dj-mood-btn ${this.currentMood === 'techno' ? 'active' : ''}" data-mood="techno">TECHNO</button>
            <button class="dj-mood-btn ${this.currentMood === 'experimental' ? 'active' : ''}" data-mood="experimental">EXP</button>
            <button class="dj-mood-btn ${this.currentMood === 'electronic' ? 'active' : ''}" data-mood="electronic">ELEC</button>
        </div>
        <div class="dj-prefetch" id="dj-prefetch">
            <span class="dj-prefetch-label">NEXT UP ▸</span>
            <span id="dj-prefetch-1">---</span>
            <span id="dj-prefetch-2">---</span>
        </div>
        <div class="dj-status" id="dj-status-text">INITIALIZING CORE...</div>
        <div class="dj-sensors" id="dj-sensors">
            <div class="dj-sensor-item"><span class="sensor-icon">🔋</span> <span class="dj-sensor-value" id="sensor-battery">--</span></div>
            <div class="dj-sensor-item"><span class="sensor-icon">🌐</span> <span class="dj-sensor-value" id="sensor-location">--</span></div>
            <div class="dj-sensor-item"><span class="sensor-icon">📡</span> <span class="dj-sensor-value" id="sensor-network">--</span></div>
            <div class="dj-sensor-item"><span class="sensor-icon">🧠</span> <span class="dj-sensor-value" id="sensor-memory">--</span></div>
            <div class="dj-sensor-item"><span class="sensor-icon">🕓</span> <span class="dj-sensor-value" id="sensor-time-mood">--</span></div>
        </div>
        <div class="dj-visits" id="dj-visits">VISIT #${this.userProfile.visits}</div>
    `;
    document.body.appendChild(this.agentUI);

    this.glitchOverlay = document.createElement('div');
    this.glitchOverlay.className = 'dj-glitch-overlay';
    document.body.appendChild(this.glitchOverlay);

    // Animate waveform bars randomly
    this.waveformBars = document.querySelectorAll('.wv-bar');
    this._animateWaveform();

    // 🚀 SCI-FI SENSORS INITIALIZATION
    this._initSensors();

    // Elapsed timer
    this.trackStartTime = Date.now();
    this.elapsedTimer = setInterval(() => this._updateElapsed(), 1000);

    setTimeout(() => {
        const titleA = this._getTrackTitle(this.currentVideoId);
        document.getElementById('dj-track-a').innerText = titleA.substring(0,18);
        document.getElementById('dj-status-text').innerText = 'LIVE';
        document.getElementById('dj-bpm-master').innerText = `${this.masterBPM} BPM`;
        // Prefetch first queue
        this._prefetchNext();
        // Welcome back message for returning users
        if (this.userProfile.visits > 1) {
            this._djSpeak(`Welcome back. Visit number ${this.userProfile.visits}. Let's go.`);
        }
    }, 2500);

    // Mood button click handlers
    this.agentUI.querySelectorAll('.dj-mood-btn').forEach(btn => {
        btn.style.pointerEvents = 'auto';
        // Auto-select starting mood
        if (btn.dataset.mood === this.currentMood) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
        
        btn.addEventListener('click', (e) => {
            this.currentMood = e.target.dataset.mood;
            localStorage.setItem('moskv_dj_mood', this.currentMood);
            this.agentUI.querySelectorAll('.dj-mood-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById('dj-status-text').innerText = `MOOD: ${this.currentMood.toUpperCase()}`;
            this._prefetchNext();
            this._djSpeak(`Mood set to ${this.currentMood}. Filtering tracks.`);
        });
    });

    // Persist listen time every 10s
    setInterval(() => {
        this.userProfile.totalListenSec += 10;
        localStorage.setItem('moskv_user', JSON.stringify(this.userProfile));
    }, 10000);
  }

  // 🚀 CIENCIA FICCIÓN: Hardware & Environment Sensors
  _initSensors() {
    // 🔋 BATTERY API
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const update = () => {
                const pct = Math.round(battery.level * 100);
                const el = document.getElementById('sensor-battery');
                if (el) el.innerText = `${pct}%${battery.charging ? '⚡' : ''}`;
                // Low battery DJ commentary
                if (pct < 15 && !this._lowBatteryWarned) {
                    this._lowBatteryWarned = true;
                    this._djSpeak('Warning. Device battery critical. Switching to power save ambient mode.');
                    // Auto-switch to ambient for lower CPU usage
                    if (this.currentMood !== 'ambient') {
                        this.currentMood = 'ambient';
                        this.agentUI?.querySelectorAll('.dj-mood-btn').forEach(b => {
                            b.classList.toggle('active', b.dataset.mood === 'ambient');
                        });
                    }
                }
            };
            update();
            battery.addEventListener('levelchange', update);
            battery.addEventListener('chargingchange', update);
        });
    }

    // 🌐 GEOLOCATION (reverse geocode via free API)
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            const el = document.getElementById('sensor-location');
            // Reverse geocode
            fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`)
                .then(r => r.json())
                .then(data => {
                    const city = data?.address?.city || data?.address?.town || data?.address?.village || '??';
                    const country = data?.address?.country_code?.toUpperCase() || '';
                    if (el) el.innerText = `${city}, ${country}`;
                    this.userProfile.lastCity = city;
                    localStorage.setItem('moskv_user', JSON.stringify(this.userProfile));
                    this._djSpeak(`Broadcasting from ${city}. Let's go.`);
                })
                .catch(() => {
                    if (el) el.innerText = `${latitude.toFixed(1)}°, ${longitude.toFixed(1)}°`;
                });
        }, () => {
            const el = document.getElementById('sensor-location');
            if (el) el.innerText = 'DENIED';
        });
    }

    // 📡 NETWORK INFORMATION API
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
        const updateNet = () => {
            const el = document.getElementById('sensor-network');
            if (el) el.innerText = `${conn.effectiveType || '??'} ${conn.downlink ? conn.downlink + 'Mb' : ''}`;
        };
        updateNet();
        conn.addEventListener('change', updateNet);
    }

    // 🧠 DEVICE MEMORY API
    if (navigator.deviceMemory) {
        const el = document.getElementById('sensor-memory');
        if (el) el.innerText = `${navigator.deviceMemory}GB RAM`;
    }

    // 🕓 TIME-AWARE AUTO-MOOD
    const hour = new Date().getHours();
    let timeMood = 'electronic';
    let timeLabel = '';
    if (hour >= 0 && hour < 6) {
        timeMood = 'techno'; timeLabel = 'NIGHT OWL';
    } else if (hour >= 6 && hour < 10) {
        timeMood = 'ambient'; timeLabel = 'SUNRISE';
    } else if (hour >= 10 && hour < 14) {
        timeMood = 'electronic'; timeLabel = 'MIDDAY';
    } else if (hour >= 14 && hour < 18) {
        timeMood = 'experimental'; timeLabel = 'AFTERNOON';
    } else if (hour >= 18 && hour < 22) {
        timeMood = 'electronic'; timeLabel = 'GOLDEN HOUR';
    } else {
        timeMood = 'techno'; timeLabel = 'LATE NIGHT';
    }
    const tmEl = document.getElementById('sensor-time-mood');
    if (tmEl) tmEl.innerText = timeLabel;

    // Auto-set mood based on time if user hasn't manually chosen
    if (!localStorage.getItem('moskv_dj_mood')) {
        this.currentMood = globalThis.DATA?.heroBackground?.mood || timeMood;
        this.agentUI?.querySelectorAll('.dj-mood-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mood === this.currentMood);
        });
    }

    // 📱 DEVICE ORIENTATION (Waveform tilt effect on mobile)
    if ('DeviceOrientationEvent' in window) {
        globalThis.addEventListener('deviceorientation', (e) => {
            if (e.gamma !== null && this.waveformBars) {
                const tilt = Math.abs(e.gamma) / 90; // 0-1 normalized
                this.waveformBars.forEach((bar, i) => {
                    const offset = (i / this.waveformBars.length) * tilt * 60;
                    bar.style.transform = `translateY(${offset}px)`;
                });
            }
        });
    }
  }

  // 📦 TIKTOK PREFETCH: Pre-select next 2 tracks
  _prefetchNext() {
    const pool = this._getTracksForMood();
    this.prefetchQueue = [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(2, shuffled.length); i++) {
        this.prefetchQueue.push(shuffled[i]);
    }
    // Update UI
    for (let i = 0; i < 2; i++) {
        const el = document.getElementById(`dj-prefetch-${i+1}`);
        if (el && this.prefetchQueue[i]) {
            const title = globalThis.DATA?.works?.find(w => w.id === this.prefetchQueue[i])?.title || this.prefetchQueue[i];
            el.innerText = title.substring(0, 12);
        } else if (el) {
            el.innerText = '---';
        }
    }
    // Pre-cue first prefetch on standby deck
    const standbyDeck = this.activeDeck === 'a' ? this.deckB : this.deckA;
    if (standbyDeck && this.prefetchQueue[0] && typeof standbyDeck.cueVideoById === 'function') {
        standbyDeck.cueVideoById(this.prefetchQueue[0]);
        console.log(`[MOSKV DJ] Prefetched: ${this.prefetchQueue[0]}`);
    }
  }

  _startAudioReactivity() {
    if (!this.analyser) return;
    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    
    let lastPulse = 0;
    const animate = () => {
        if (!this.globalMuted && !this.isBackgroundPausedByEmbed) {
            this.analyser.getByteFrequencyData(freqData);
            
            // Render Waveform UI (Visualizer)
            if (this.waveformBars) {
                const step = Math.floor(freqData.length / this.waveformBars.length);
                this.waveformBars.forEach((bar, i) => {
                    const val = freqData[i * step] || 0;
                    bar.style.height = `${(val / 255) * 100}%`;
                });
            }

            // Real-time Bass detection for Audio-Reactive World Effect (Pulse) + Star Guitar
            const bassAvg = (freqData[0] + freqData[1] + freqData[2] + freqData[3]) / 4;
            // Snare/Clap detection (Mids/Highs)
            const snareAvg = (freqData[20] + freqData[21] + freqData[22]) / 3;
            
            const vContainer = document.querySelector('.video-container');
            if (vContainer) {
                const reactiveEnergy = Math.max(0, Math.min(1, bassAvg / 255));
                vContainer.style.setProperty('--video-reactive-energy', reactiveEnergy.toFixed(3));
            }
            
            // 2026 Trend: Liquid Glass / Performance Inmersivo. Throttle kicks to 400ms max.
            if (bassAvg > 220 && Date.now() - lastPulse > 400) {
                if (vContainer) {
                    gsap.killTweensOf(vContainer);
                    gsap.to(vContainer, { scale: 1.015, filter: 'contrast(1.1) saturate(1.2)', duration: 0.05, ease: "power1.out", yoyo: true, repeat: 1 });
                }
                
                lastPulse = Date.now();
                
                // Glow effect on active deck UI (Dopamine hit)
                const activeUI = document.getElementById(`dj-deck-${this.activeDeck}-ui`);
                if (activeUI) {
                    gsap.to(activeUI, { color: '#ffffff', textShadow: '0 0 15px #ccff00', duration: 0.1, yoyo: true, repeat: 1 });
                }

                // --- 🚄 STAR GUITAR EFFECT (Spawn landscape objects on Kicks) ---
                this._spawnStarGuitarObject('kick');
            }
            
            // Spawn secondary objects on Snares
            if (snareAvg > 150 && Math.random() > 0.7) {
                 this._spawnStarGuitarObject('snare');
            }
        } else {
             // Fake idle animation if muted
             if (this.waveformBars) {
                this.waveformBars.forEach(bar => {
                    bar.style.height = `${5 + Math.random() * 10}%`;
                });
             }
        }
        
        requestAnimationFrame(animate);
    };
    animate();
  }

  // 🚄 STAR GUITAR PHYSICS ENGINE (60fps DOM spawner)
  _spawnStarGuitarObject(type) {
      if (typeof gsap === 'undefined') return;
      
      let overlay = document.getElementById('sg-overlay');
      if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'sg-overlay';
          overlay.className = 'star-guitar-overlay';
          document.body.appendChild(overlay);
      }
      
      const obj = document.createElement('div');
      obj.className = 'sg-object';
      
      // Determine physical properties based on sound type
      // Dopamine aesthetics: stark geometry, blurred silhouettes
      let width, height, bottom, bg, duration, blur;
      if (type === 'kick') {
          // Pillars / large structures (foreground, fast)
          width = 20 + Math.random() * 80 + 'vw';
          height = 40 + Math.random() * 60 + 'vh';
          bottom = '0px';
          bg = `rgba(5, 5, 5, ${0.7 + Math.random() * 0.3})`;
          duration = 1.5 + Math.random() * 1.5; // Relies on master BPM theoretically, but random looks ok
          blur = `blur(${2 + Math.random() * 5}px)`;
      } else {
          // Snares / secondary beats: passing lights, distant buildings (background, slower)
          width = 5 + Math.random() * 20 + 'vw';
          height = 5 + Math.random() * 10 + 'vh';
          bottom = 10 + Math.random() * 40 + 'vh';
          bg = `rgba(204, 255, 0, ${0.1 + Math.random() * 0.4})`; // Cyber Lime highlights
          duration = 3 + Math.random() * 2;
          blur = `blur(${8 + Math.random() * 10}px)`;
      }
      
      obj.style.width = width;
      obj.style.height = height;
      obj.style.bottom = bottom;
      obj.style.background = bg;
      obj.style.backdropFilter = blur;
      overlay.appendChild(obj);
      
      // Hardware-accelerated GPU 60fps translation across the screen
      gsap.fromTo(obj, 
          { x: '100vw' }, 
          { 
              x: '-150vw', 
              duration: duration, 
              ease: "none", 
              onComplete: () => {
                  if (obj.parentNode) obj.parentNode.removeChild(obj);
              }
          }
      );
  }

  _animateWaveform() {
      // Stub: Real audio reactivity overrides this once unlocked.
      if (!this.waveformBars) return;
      this.waveformBars.forEach(bar => bar.style.height = '5%');
  }

  _updateElapsed() {
    const elapsed = Math.floor((Date.now() - this.trackStartTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    const el = document.getElementById('dj-elapsed');
    if (el) el.innerText = `${mins}:${secs}`;

    // Progress bar (based on 40s mix interval)
    const progress = Math.min(100, (elapsed / (this.mixIntervalMs / 1000)) * 100);
    const fill = document.getElementById('dj-progress-fill');
    if (fill) fill.style.width = `${progress}%`;

    // Next In countdown
    const remaining = Math.max(0, Math.floor(this.mixIntervalMs / 1000) - elapsed);
    const rMins = String(Math.floor(remaining / 60)).padStart(2, '0');
    const rSecs = String(remaining % 60).padStart(2, '0');
    const nextEl = document.getElementById('dj-next-in');
    if (nextEl) nextEl.innerText = `${rMins}:${rSecs}`;
  }

  // 🎤 MICA STITCH AI VOICE (Agéntica - EUSKERA)
  _djSpeak(text) {
    if (!this.voiceEnabled) return;
    try {
        globalThis.speechSynthesis.cancel();
        // MICA Stitch is a high-tech synthesized persona
        const formattedText = text.replace(/BPM/g, "B. P. M.");
        const utter = new SpeechSynthesisUtterance(formattedText);
        utter.rate = 1.05; // Fast, computational
        utter.pitch = 0.4; // Low, assertive, synthetic
        utter.volume = 0.6; // Not too loud, sits in the mix
        
        const voices = globalThis.speechSynthesis.getVoices();
        // Prefer Basque (eu-ES) if available, otherwise Spanish (es-ES) for acceptable pronunciation of Euskera
        const djVoice = voices.find(v => v.lang.startsWith('eu')) 
                      || voices.find(v => v.name.includes('Monica'))
                      || voices.find(v => v.lang.startsWith('es'))
                      || voices[0];
        if (djVoice) utter.voice = djVoice;
        
        // Add minimal echo effect if possible (Web Audio API hack)
        globalThis.speechSynthesis.speak(utter);
        
        console.log(`[🎤 MICA STITCH]: "${text}"`);
    } catch(e) {
        console.warn('[MICA STITCH] Speech synthesis failed:', e);
    }
  }

  _getTrackTitle(videoId) {
    if (videoId === this.heroVisualId && globalThis.DATA?.heroBackground?.title) {
      return globalThis.DATA.heroBackground.title;
    }
    return globalThis.DATA?.works?.find(work => work.id === videoId)?.title || videoId || 'UNKNOWN';
  }

  _getTrackUrl(videoId) {
    if (videoId === this.heroVisualId && globalThis.DATA?.heroBackground?.url) {
      return globalThis.DATA.heroBackground.url;
    }
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  _getTrackMeta(videoId) {
    const work = globalThis.DATA?.works?.find((entry) => entry.id === videoId);
    const categories = work?.categories || [];
    let badge = 'YT';
    if (categories.includes('8k')) badge = '8K';
    else if (categories.includes('4k')) badge = '4K';
    else if (categories.includes('ambient')) badge = 'AMB';
    else if (categories.includes('experimental')) badge = 'EXP';

    return {
      title: this._getTrackTitle(videoId),
      badge
    };
  }

  _renderVideoReel() {
    const reel = document.getElementById('videoReel');
    if (!reel) return;

    const visuals = this._getBackgroundVisuals();
    reel.innerHTML = visuals.map((videoId) => {
      const meta = this._getTrackMeta(videoId);
      const activeClass = videoId === this.currentVideoId ? ' is-active' : '';
      const pressed = videoId === this.currentVideoId ? 'true' : 'false';
      return `
        <button class="video-reel-btn${activeClass}" type="button" data-video-id="${videoId}" aria-pressed="${pressed}">
          <span class="video-reel-btn-label">${meta.badge}</span>
          <strong>${meta.title}</strong>
        </button>
      `;
    }).join('');

    reel.querySelectorAll('.video-reel-btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const nextVideoId = button.dataset.videoId;
        if (!nextVideoId || nextVideoId === this.currentVideoId) {
          this._syncVideoReel(this.currentVideoId);
          return;
        }
        this.triggerCrossfade(nextVideoId);
      });
    });

    this._syncVideoReel(this.currentVideoId);
  }

  _syncVideoReel(activeVideoId) {
    document.querySelectorAll('.video-reel-btn').forEach((button) => {
      const isActive = button.dataset.videoId === activeVideoId;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  _updateVideoIdentity(videoId, isHeroLaunch = false) {
    this.currentVideoId = videoId;
    const identityEl = document.getElementById('videoIdentity');
    const labelEl = document.getElementById('videoIdentityLabel');
    const titleEl = document.getElementById('videoIdentityTitle');
    const heroLabel = globalThis.DATA?.heroBackground?.label || 'EMBEDDED BACKGROUND REEL';

    if (identityEl && identityEl.tagName === 'A') {
      const trackTitle = this._getTrackTitle(videoId);
      identityEl.href = this._getTrackUrl(videoId);
      identityEl.setAttribute('aria-label', `Abrir ${trackTitle} en reproductor embebido`);
      identityEl.title = `${trackTitle} · Borja Moskv en el reproductor embebido`;
    }

    if (labelEl) {
      labelEl.innerText = isHeroLaunch || videoId === this.heroVisualId ? heroLabel : 'NOW PLAYING BACKGROUND';
    }

    if (titleEl) {
      titleEl.innerText = this._getTrackTitle(videoId);
    }

    this._syncVideoReel(videoId);
  }

  // 🎵 MOOD FILTER — Get tracks matching current mood
  _getTracksForMood() {
    const backgroundIds = globalThis.DATA?.backgroundVisuals || globalThis.DATA?.videoThumbnails || [];
    if (!globalThis.DATA?.works) return backgroundIds;

    let pool = globalThis.DATA.works.filter(work => backgroundIds.includes(work.id));
    if (pool.length === 0) {
        pool = globalThis.DATA.works;
    }
    if (this.currentMood !== 'all') {
        pool = pool.filter(w => w.categories && w.categories.includes(this.currentMood));
        
        // Keep the curated background deck available even when the mood filter is narrow.
        backgroundIds.forEach(priorityId => {
            const track = globalThis.DATA.works.find(w => w.id === priorityId);
            if (track && !pool.some(w => w.id === priorityId)) {
                pool.push(track);
            }
        });
    }
    // Filter out recently played (avoid repeats)
    const ids = pool.map(w => w.id).filter(id => !this.playedTracks.includes(id));
    const heroIndex = ids.indexOf(this.heroVisualId);
    if (heroIndex > 0) {
        ids.unshift(ids.splice(heroIndex, 1)[0]);
    }
    
    // If all played, reset history
    if (ids.length === 0) {
        this.playedTracks = [];
        localStorage.setItem('moskv_dj_history', '[]');
        return pool.map(w => w.id);
    }
    return ids;
  }

  // 📊 Record played track
  _recordTrack(trackId) {
    if (!this.playedTracks.includes(trackId)) {
        this.playedTracks.push(trackId);
        // Keep last 20 max
        if (this.playedTracks.length > 20) this.playedTracks.shift();
        localStorage.setItem('moskv_dj_history', JSON.stringify(this.playedTracks));
    }
  }

  // ═══════════════════════════════════════════
  // CAMELOT HARMONIC SELECTION
  // ═══════════════════════════════════════════
  // Returns compatible Camelot keys for mixing
  _getCompatibleKeys(key) {
      if (!key) return [];
      const num = parseInt(key);
      const letter = key.replace(/[0-9]/g, '');
      const otherLetter = letter === 'A' ? 'B' : 'A';
      const compatible = [
          key,                                          // Same key
          `${((num) % 12) + 1}${letter}`,               // +1
          `${((num - 2 + 12) % 12) + 1}${letter}`,      // -1
          `${num}${otherLetter}`                         // Inner/Outer
      ];
      return compatible;
  }

  // Filters tracks that are harmonically compatible with the current one
  _getHarmonicTracks(pool) {
      const currentTrackId = this.activeDeck === 'a' 
          ? this.audioA.src.split('/').pop()?.replace('.webm', '')
          : this.audioB.src.split('/').pop()?.replace('.webm', '');
      
      const currentKey = this.keyCache[currentTrackId];
      if (!currentKey) return pool; // No key data, return unfiltered
      
      const compatibleKeys = this._getCompatibleKeys(currentKey);
      const harmonicPool = pool.filter(id => {
          const trackKey = this.keyCache[id];
          return trackKey && compatibleKeys.includes(trackKey);
      });
      
      // If no harmonic matches, return full pool (fallback)
      return harmonicPool.length > 0 ? harmonicPool : pool;
  }

  // ═══════════════════════════════════════════
  // ENERGY ARC PROGRESSION
  // ═══════════════════════════════════════════
  _updateEnergyPhase() {
      const elapsedMin = (Date.now() - this.setStartTime) / 60000;
      if (elapsedMin < 3) {
          this.energyPhase = 'warmup';
      } else if (elapsedMin < 8) {
          this.energyPhase = 'buildup';
      } else if (elapsedMin < 15) {
          this.energyPhase = 'peak';
      } else {
          this.energyPhase = 'cooldown';
      }
      return this.energyPhase;
  }

  // MICA STITCH CONTEXTUAL INSIGHT (fires every 3rd mix)
  _stitchInsight() {
      if (this.mixCount % 3 !== 0) return;
      
      const phase = this._updateEnergyPhase();
      const listenMin = Math.round((Date.now() - this.setStartTime) / 60000);
      const totalListenHrs = Math.round((this.userProfile.totalListenSec || 0) / 3600 * 10) / 10;
      
      const insights = {
          warmup: [
              `Berotzen. ${listenMin} minutu igaro dira. Tentsioa igotzen.`,
              `Lehen fasea. Energia baxuko inguratzailea detektatuta. Igoera prestatzen.`,
              `Saioa ${this.userProfile.visits}. Ongi etorri berriro. Maiztasun-eskanerra hasieratzen.`
          ],
          buildup: [
              `Energia igotzen. BPM altuagoko barrutira aldatzen.`,
              `Dopamina-kurba gorantz. ${this.mixCount} nahasketa sakon.`,
              `Momentua hartzen. ${totalListenHrs} ordu sistema osoan.`
          ],
          peak: [
              `Energia maximoa. Sistema guztiak potentzia gorenean.`,
              `${this.mixCount} nahasketa. Hau da gailurra. Eutsi goiari.`,
              `Potentzia osoa. Konpromiso neurala masa kritikoan.`
          ],
          cooldown: [
              `Jaitsiera hasten. ${listenMin} minutu. Dezelerazio mailakatua.`,
              `Hoztea hasita. BPM inguratzailea murrizten.`,
              `Saioa amaitzen ari da. ${this.mixCount} nahasketa burututa.`
          ]
      };
      
      const pool = insights[phase] || insights.warmup;
      const msg = pool[Math.floor(Math.random() * pool.length)];
      this._djSpeak(msg);
      console.log(`[🧠 MICA STITCH INSIGHT] Phase: ${phase} | "${msg}"`);
  }

  scheduleNextMix() {
    if (this.autoMixTimer) clearTimeout(this.autoMixTimer);
    
    // [EXPERT DJ] Dynamic phrase-based interval calculation
    const msPerBeat = (60 / this.masterBPM) * 1000;
    const msPerPhrase = msPerBeat * 32;
    // Decide to mix between 4 and 8 phrases (typically 1 to 2.5 minutes depending on BPM)
    const phrasesToWait = Math.floor(Math.random() * 5) + 4;
    const dynamicIntervalMs = msPerPhrase * phrasesToWait;
    
    console.log(`[🎧 EXPERTO DJ] Decidí mantener la tensión durante ${phrasesToWait} frases musicales (${Math.round(dynamicIntervalMs/1000)}s)...`);

    this.autoMixTimer = setTimeout(() => {
        if (this.isBackgroundPausedByEmbed) {
            // Check again shortly if paused by embed
            this.scheduleNextMix();
            return;
        }
        
        console.log("[CORTEX AutoDJ] Automated Phrase Interval Reached. Initiating transition.");
        let nextTrack = null;
        if (this.mixSequence.length > 0) {
            nextTrack = this.mixSequence.shift();
        }
        this.triggerCrossfade(nextTrack);
    }, dynamicIntervalMs);
  }

  triggerCrossfade(forcedNextTrack = null) {
    if (this.isCrossfading || !this.deckA || !this.deckB) return;
    if (typeof this.deckA.getPlayerState !== 'function' || typeof this.deckB.getPlayerState !== 'function') return;
    if (forcedNextTrack && forcedNextTrack === this.currentVideoId) {
      this._syncVideoReel(this.currentVideoId);
      return;
    }

    if (this.autoMixTimer) clearTimeout(this.autoMixTimer);
    document.querySelector('.video-container')?.classList.add('is-transitioning');
    
    // Trigger Awwwards morph shader overlay
    if (typeof globalThis.triggerGlobalMorph === 'function') {
        globalThis.triggerGlobalMorph(3000); // 3 seconds transition
    }

    // ==========================================
    // CORTEX V5 STRUCTURAL MIXING (PHRASE SYNC)
    // ==========================================
    // A professional DJ mixes on 32-beat phrases.
    // We calculate how many beats have passed since track start.
    const now = Date.now();
    const elapsedMs = now - this.trackStartTime;
    const msPerBeat = (60 / this.masterBPM) * 1000;
    const msPerPhrase = msPerBeat * 32;
    
    // We don't phrase sync before 30 seconds have passed (to avoid instant skips)
    if (elapsedMs > 30000 && this.agentUI) {
        const nextPhraseTimeMs = Math.ceil(elapsedMs / msPerPhrase) * msPerPhrase;
        let waitTimeMs = nextPhraseTimeMs - elapsedMs;

        // If the drop is less than 2s away, it's too late to cue, wait for the NEXT phrase (+32 beats)
        if (waitTimeMs < 2000) {
            waitTimeMs += msPerPhrase;
        }

        console.log(`[CORTEX AutoDJ] Cued mix for next 32-beat drop. Waiting ${waitTimeMs}ms...`);
        this.isCrossfading = true; // Block other clicks while cueing

        if (this.agentUI) {
            this.agentUI.classList.remove('idle');
            this.agentUI.classList.add('syncing');
            document.getElementById('dj-status-text').innerText = `SYNCING PHRASES... WAITING FOR DROP`;
        }

        setTimeout(() => {
            this._executeCrossfade(forcedNextTrack);
        }, waitTimeMs);

    } else {
        // Immediate crossfade (e.g. forced or first minute)
        this.isCrossfading = true;
        this._executeCrossfade(forcedNextTrack);
    }
  }

  _executeCrossfade(forcedNextTrack) {

    const fromDeckId = this.activeDeck;
    const toDeckId = this.activeDeck === 'a' ? 'b' : 'a';
    
    const fromPlayer = fromDeckId === 'a' ? this.deckA : this.deckB;
    const toPlayer = toDeckId === 'a' ? this.deckA : this.deckB;

    const fromEl = document.getElementById(`video-deck-${fromDeckId}`);
    const toEl = document.getElementById(`video-deck-${toDeckId}`);

    const availableTracks = globalThis.DATA.backgroundVisuals || globalThis.DATA.videoThumbnails;
    const moodPool = this._getTracksForMood();
    // ═══ HARMONIC FILTERING (Camelot Wheel) ═══
    const harmonicPool = this._getHarmonicTracks(moodPool);
    // Use prefetch queue if available (TikTok-style)
    let nextTrack;
    if (forcedNextTrack) {
        nextTrack = forcedNextTrack;
    } else if (this.prefetchQueue.length > 0) {
        nextTrack = this.prefetchQueue.shift();
    } else {
        nextTrack = harmonicPool[Math.floor(Math.random() * harmonicPool.length)] || availableTracks[Math.floor(Math.random() * availableTracks.length)];
    }
    this._recordTrack(nextTrack);
    this._updateVideoIdentity(nextTrack);
    // Immediately refill prefetch queue for NEXT transition
    this._prefetchNext();
    
    const nextBPM = this.getTrackBPM(nextTrack);
    console.log(`[CORTEX Auto-DJ] Syncing BPM: Master(${this.masterBPM}) <- Target(${nextBPM})`);

    // Dynamic Fade Time based on Energy
    if (this.energyPhase === 'peak') this.fadeDurationMs = 1500;
    else if (this.energyPhase === 'warmup') this.fadeDurationMs = 5000;
    else this.fadeDurationMs = 3000;
    
    // ═══════════════════════════════════════════
    // DYNAMIC FADE DURATION (Long Blends - Pro DJ)
    // ═══════════════════════════════════════════
    // A real DJ blends compatible tracks over 16-32 beats. At 125BPM, 32 beats is ~15 seconds.
    // Instead of cutting directly (direct mix), we do progressive blends.
    const bpmDelta = Math.abs(this.masterBPM - nextBPM);
    if (bpmDelta > 10) {
        this.fadeDurationMs = 6000; // Big gap -> Still smooth but safer
    } else if (bpmDelta > 5) {
        this.fadeDurationMs = 8000; // Medium gap -> 8 sec blend
    } else {
        this.fadeDurationMs = 12000; // Perfect match -> 12 second deep progressive blend!
    }
    
    // Calculate pitch/time-stretch ratio to match master tempo
    // YouTube API limits playback rates to certain floating points, but accepts generic numbers.
    // E.g., if Master is 130 and Next is 120, rate needs to be 130/120 = 1.083x
    const syncRate = Math.max(0.5, Math.min(2.0, this.masterBPM / nextBPM));

    // Increment mix counter & reset timer
    this.mixCount++;
    this.trackStartTime = Date.now();

    if (this.agentUI) {
        this.agentUI.classList.remove('idle');
        this.agentUI.classList.add('syncing');
        document.getElementById('dj-status-text').innerText = `BEATMATCHING → ${nextBPM} BPM`;
        document.getElementById('dj-mix-count').innerText = `MIX #${this.mixCount}`;
        
        const trackTitle = globalThis.DATA?.works?.find(w => w.id === nextTrack)?.title || "INCOMING";
        document.getElementById(`dj-deck-${toDeckId}-ui`).querySelector('span:last-child').innerText = trackTitle.substring(0, 18);
        document.getElementById(`dj-deck-${toDeckId}-ui`).querySelector('span:first-child').innerText = `DK-${toDeckId.toUpperCase()} ▶`;
        document.getElementById(`dj-deck-${toDeckId}-ui`).classList.add('active');
        document.getElementById(`dj-deck-${fromDeckId}-ui`).querySelector('span:first-child').innerText = `DK-${fromDeckId.toUpperCase()} ⏸`;
        document.getElementById(`dj-deck-${fromDeckId}-ui`).classList.remove('active');
        
        // GSAP Wow: Glitch + Screen Shake + Hue Rotate
        if (typeof gsap !== 'undefined') {
             gsap.to(this.glitchOverlay, { opacity: 0.8, duration: 0.1, yoyo: true, repeat: 5 });
             gsap.to(document.body, { filter: 'hue-rotate(90deg)', duration: 0.15, yoyo: true, repeat: 2 });
             // Screen shake
             gsap.to('.video-container', { x: 5, duration: 0.05, yoyo: true, repeat: 8, ease: 'none',
                 onComplete: () => gsap.set('.video-container', { x: 0 })
             });
        }
        
        // 🎤 DJ Voice Announcement (Euskera)
        const moodLabel = this.currentMood === 'all' ? '' : ` ${this.currentMood} giroa.`;
        const keyLabel = this.keyCache[nextTrack] ? ` ${this.keyCache[nextTrack]} tonuan.` : '';
        this._djSpeak(`Sartzen. ${trackTitle}. ${nextBPM} BPM.${keyLabel}${moodLabel} Sinkronizatzen orain.`);
        
        // Fire MICA Stitch contextual insight (every 3rd mix)
        this._stitchInsight();
    }

    toPlayer.mute();
    const cuePoint = this.cueCache[nextTrack] || 0;
    this._setDeckPoster(toDeckId, nextTrack);
    this._showDeckPoster(toDeckId);
    toPlayer.loadVideoById({videoId: nextTrack, startSeconds: cuePoint});
    
    // Sync external audio too
    const toAudio = toDeckId === 'a' ? this.audioA : this.audioB;
    const fromAudio = fromDeckId === 'a' ? this.audioA : this.audioB;
    toAudio.src = `audio/${nextTrack}.webm`;
    // We can't practically cue HTML5 audio over network exactly without seeking,
    // but we can set currentTime when it buffers.
    toAudio.onloadeddata = () => {
        toAudio.currentTime = cuePoint;
    };
    
    // Apply Harmonic Pitch & Rhythm Sync
    setTimeout(() => {
        if(typeof toPlayer.setPlaybackRate === 'function') {
           toPlayer.setPlaybackRate(syncRate);
        }
        toAudio.playbackRate = syncRate;
        toAudio.preservesPitch = false; // Vinyl feel
    }, 500);

    toPlayer.playVideo();

    if (typeof gsap !== 'undefined') {
      setTimeout(() => {
        // Remotion-Inspired Visual Transitions
        const transitionTypes = ['fade', 'kenburns', 'iris', 'swipe', 'glitch'];
        const tType = transitionTypes[Math.floor(Math.random() * transitionTypes.length)];
        console.log(`[CORTEX AutoDJ] Visual Transition: ${tType.toUpperCase()}`);
        
        // Reset base styles just in case
        gsap.set(toEl, { clipPath: 'none', scale: 1, filter: 'none', opacity: 0 });
        gsap.set(fromEl, { clipPath: 'none', scale: 1, filter: 'none' });

        const dur = this.fadeDurationMs / 1000;

        switch(tType) {
            case 'kenburns':
                gsap.set(toEl, { scale: 1.1, opacity: 0 });
                gsap.to(toEl, { opacity: 1, scale: 1, duration: dur, ease: "power2.out" });
                gsap.to(fromEl, { opacity: 0, scale: 1.05, duration: dur, ease: "power2.in" });
                break;
            case 'iris':
                gsap.set(toEl, { opacity: 1, clipPath: 'circle(0% at 50% 50%)' });
                gsap.to(toEl, { clipPath: 'circle(150% at 50% 50%)', duration: dur, ease: "power3.inOut" });
                gsap.to(fromEl, { opacity: 0, duration: dur, ease: "power3.inOut" });
                break;
            case 'swipe':
                // Swipe from left to right using inset
                gsap.set(toEl, { opacity: 1, clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' });
                gsap.to(toEl, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: dur, ease: "power4.inOut" });
                gsap.to(fromEl, { opacity: 0, duration: dur, delay: dur * 0.5 });
                break;
            case 'glitch':
                gsap.set(toEl, { opacity: 0 });
                const tl = gsap.timeline();
                tl.to(toEl, { opacity: 1, duration: 0.1 })
                  .to(toEl, { opacity: 0, duration: 0.1 })
                  .to(toEl, { opacity: 1, duration: 0.1 })
                  .to(toEl, { opacity: 0, duration: 0.2 })
                  .to(toEl, { opacity: 1, duration: dur - 0.5, ease: "power2.out" });
                gsap.to(fromEl, { opacity: 0, duration: dur, ease: "steps(4)" });
                break;
            default: // fade
                gsap.to(fromEl, { opacity: 0, duration: dur, ease: "power3.inOut" });
                gsap.to(toEl, { opacity: 1, duration: dur, ease: "power3.inOut" });
                break;
        }
        
        // Single-source audio switch: visuals can blend, but the sound never overlaps.
        if (!this.globalMuted && this.audioContext) {
            const activeGain = toDeckId === 'a' ? this.gainA : this.gainB;
            const prevGain = toDeckId === 'a' ? this.gainB : this.gainA;
            const now = this.audioContext.currentTime;
            const activeEQ = toDeckId === 'a' ? this.eqA : this.eqB;
            const prevEQ = toDeckId === 'a' ? this.eqB : this.eqA;

            fromAudio.pause();
            fromAudio.currentTime = 0;

            activeGain.gain.cancelScheduledValues(now);
            activeGain.gain.setValueAtTime(0, now);
            prevGain.gain.cancelScheduledValues(now);
            prevGain.gain.setValueAtTime(0, now);
            activeGain.gain.linearRampToValueAtTime(1, now + 0.12);

            if (activeEQ) {
                activeEQ.low.gain.setValueAtTime(0, now);
                activeEQ.high.gain.setValueAtTime(0, now);
                activeEQ.hpf.frequency.setValueAtTime(0, now);
            }
            if (prevEQ) {
                prevEQ.low.gain.setValueAtTime(0, now);
                prevEQ.high.gain.setValueAtTime(0, now);
                prevEQ.hpf.frequency.setValueAtTime(0, now);
            }

            toAudio.play().catch(e => console.warn(e));
        }
        
        // Cleanup visuals and inactive decks after crossfade
        setTimeout(() => {
            fromPlayer.pauseVideo();
            fromAudio.pause();
            this.activeDeck = toDeckId;
            this.isCrossfading = false;
            document.querySelector('.video-container')?.classList.remove('is-transitioning');
            // Record new track start time NOW (when the drop hit) to align the new phrase
            this.trackStartTime = Date.now();
            
            if (this.agentUI) {
                this.agentUI.classList.remove('syncing');
                document.getElementById('dj-status-text').innerText = 'MIXING COMPLETE';
                setTimeout(() => {
                    if (!this.isCrossfading) {
                        this.agentUI.classList.add('idle');
                        document.getElementById('dj-status-text').innerText = 'READY / IDLE';
                    }
                }, 3000);
            }
            this.scheduleNextMix();
        }, this.fadeDurationMs + 100);
        
      }, 1000); // Allow buffering and rate-setting
    }
  }

  bindEmbedListeners() {
    // ═══════════════════════════════════════════
    // SOVEREIGN CORTEX V5: NEVER PAUSE MUSIC
    // ═══════════════════════════════════════════
    // Auto-pause logic has been eradicated to ensure continuous immersive playback.
    
    this.mouseX = 0;
    this.mouseY = 0;
    
    globalThis.addEventListener('mousemove', (e) => {
        this.mouseX = (e.clientX / globalThis.innerWidth - 0.5) * 30; // Max 15px movement
        this.mouseY = (e.clientY / globalThis.innerHeight - 0.5) * 30;
        this._updateParallax();
    });

    globalThis.addEventListener('scroll', () => {
        this._updateParallax();
    }, { passive: true });

    const audioEmbeds = document.querySelectorAll([
      '.manifesto-iframe-wrapper iframe',
      '.player-card iframe',
      '.drag-window iframe'
    ].join(','));

    audioEmbeds.forEach((embed) => {
      embed.addEventListener('pointerdown', () => {
        globalThis.MOSKV?.audioFocus?.claim?.('external-embed', {
          reason: 'external-embed',
          resume: false
        });
      });
    });

    document.addEventListener('pointerdown', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.matches('iframe')) return;
      if (!target.closest('.manifesto-iframe-wrapper, .player-card, .drag-window')) return;
      globalThis.MOSKV?.audioFocus?.claim?.('external-embed', {
        reason: 'external-embed',
        resume: false
      });
    }, true);
  }

  _updateParallax() {
      const scrolled = globalThis.scrollY || 0;
      const container = document.querySelector('.video-container');
      if (container) {
          globalThis.requestAnimationFrame(() => {
              container.style.transform = `translate3d(${this.mouseX || 0}px, ${(this.mouseY || 0) + (scrolled * 0.25)}px, 0) scale(1.05)`;
          });
      }
  }

  getLowFrequencyData() {
    if (!this.analyser) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Average lower frequencies (first 10 bins represent bass)
    let sum = 0;
    const binsToAverage = 10;
    for (let i = 0; i < binsToAverage; i++) {
        sum += dataArray[i];
    }
    return sum / binsToAverage / 255.0; // Normalized 0-1
  }

  pauseBackgroundMusic(reason = 'external') {
    const alreadyPaused = this.pauseReasons.size > 0;
    this.pauseReasons.add(reason);
    this.isBackgroundPausedByEmbed = this.pauseReasons.size > 0;
    if (alreadyPaused) return;
    
    // Pause both Video & new Audio engines
    const activePlayer = this.activeDeck === 'a' ? this.deckA : this.deckB;
    if (activePlayer && typeof activePlayer.pauseVideo === 'function') {
      activePlayer.pauseVideo();
    }
    const activeAudio = this.activeDeck === 'a' ? this.audioA : this.audioB;
    if (activeAudio) activeAudio.pause();
  }

  resumeBackgroundMusic(reason = 'external') {
    this.pauseReasons.delete(reason);
    this.isBackgroundPausedByEmbed = this.pauseReasons.size > 0;
    if (this.isBackgroundPausedByEmbed) return;
    
    const activePlayer = this.activeDeck === 'a' ? this.deckA : this.deckB;
    const activeAudio = this.activeDeck === 'a' ? this.audioA : this.audioB;
    
    if (activePlayer && typeof activePlayer.playVideo === 'function') {
      activePlayer.playVideo();
    }
    
    if (!this.globalMuted && activeAudio) {
        activeAudio.play().catch(e => console.warn(e));
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  globalThis.autoDJAesthetic = new AutoDJAesthetic();
});
