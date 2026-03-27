/**
 * ═══════════════════════════════════════════════════════════════════
 * AUTO-DJ A/V ENGINE (INVISIBLE)
 * Dual-deck YouTube Crossfader + Mutual Exclusion + BPM Sync
 * ═══════════════════════════════════════════════════════════════════
 */

class AutoDJAesthetic {
  constructor() {
    this._ensureHTML();
    this.deckA = null;
    this.deckB = null;
    this.nativeDeckA = document.getElementById('bg-native-a');
    this.nativeDeckB = document.getElementById('bg-native-b');
    this.deckVisuals = { a: null, b: null };
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
    this.audioTrackIds = new Set(globalThis.DATA?.audioTrackIds || []);
    this.audioMissingWarnings = new Set();

    // Automated DJ Sequence Configuration
    this.autoMixTimer = null;
    this.heroVisualId = globalThis.DATA?.heroBackground?.id || 'b9ktVQN48OU';
    this.currentVideoId = this.heroVisualId;
    // Curated initial sequence, narrowed to tracks with real local audio when available.
    this.mixSequence = this._buildMixSequence();
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
    this.playedTracks = JSON.parse(localStorage.getItem('moskv_dj_history')) || [];
    this.keyCache = {
      ...this.keyCache,
      ...(globalThis.DATA?.keyCache || {})
    };

    // ==========================================
    // AUDIO FOCUS INTEGRATION
    // ==========================================
    if (globalThis.MOSKV?.audioFocus) {
      globalThis.MOSKV.audioFocus.register('autodj', {
        resume: (ctx) => {
          console.log('[CORTEX AutoDJ] Focus Resumed. Resuming playback.', ctx);
          this.isBackgroundPausedByEmbed = false;
          this.globalMuted = false;
          if (this.activeDeck === 'a') {
              this.deckA?.playVideo();
              this.audioA?.play();
          } else {
              this.deckB?.playVideo();
              this.audioB?.play();
          }
          document.getElementById('dj-status-text').innerText = 'FOCUS RESTORED';
          // Sync UI
          document.querySelectorAll('.dj-deck').forEach(d => d.classList.toggle('active', d.id === `dj-deck-${this.activeDeck}-ui`));
        },
        suspend: (ctx) => {
          console.log('[CORTEX AutoDJ] Focus Suspended by ' + (ctx.nextOwner || 'unknown'), ctx);
          this.isBackgroundPausedByEmbed = true;
          this.globalMuted = true;
          this.deckA?.pauseVideo();
          this.deckB?.pauseVideo();
          this.audioA?.pause();
          this.audioB?.pause();
          document.getElementById('dj-status-text').innerText = 'FOCUS SUSPENDED';
        }
      });
    }

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
    const visual = this._getVisualEntry(videoId);
    if (visual?.bpm) return visual.bpm;
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

  _getNativeDeck(deckId) {
    return deckId === 'a' ? this.nativeDeckA : this.nativeDeckB;
  }

  _getDeckPlayer(deckId) {
    return deckId === 'a' ? this.deckA : this.deckB;
  }

  _makeVisualId(entry, index = 0) {
    if (!entry || typeof entry !== 'object') return `visual-${index}`;
    const raw = entry.id || entry.videoId || entry.youtubeId || entry.src || entry.url || `visual-${index}`;
    return String(raw)
      .replace(/^https?:\/\//, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `visual-${index}`;
  }

  _normalizeVisualEntry(entry, index = 0) {
    if (!entry) return null;
    if (typeof entry === 'string') {
      return {
        id: entry,
        type: 'youtube',
        videoId: entry,
        poster: this._buildYouTubePoster(entry),
        url: `https://www.youtube.com/watch?v=${entry}`
      };
    }

    if (typeof entry !== 'object') return null;

    const type = entry.type === 'video' || entry.src ? 'video' : 'youtube';
    const id = this._makeVisualId(entry, index);
    const videoId = entry.videoId || entry.youtubeId || (type === 'youtube' ? id : null);
    const src = entry.src || (type === 'video' ? entry.url : null);

    return {
      ...entry,
      id,
      type,
      videoId,
      src,
      cuePoint: Number(entry.cuePoint ?? entry.start ?? 0) || 0,
      bpm: Number(entry.bpm || 0) || null,
      audioSrc: entry.audioSrc || null,
      poster: entry.poster || (type === 'youtube' && videoId ? this._buildYouTubePoster(videoId) : ''),
      url: entry.href || entry.watchUrl || (type === 'youtube' && videoId ? `https://www.youtube.com/watch?v=${videoId}` : src || '#'),
      badge: entry.badge || (type === 'video' ? 'VID' : 'YT')
    };
  }

  _getVisualEntry(trackRef) {
    if (!trackRef) return null;
    if (typeof trackRef === 'object') return this._normalizeVisualEntry(trackRef);

    const visuals = this._getBackgroundVisuals();
    return visuals.find((visual) => visual.id === trackRef || visual.videoId === trackRef) || this._normalizeVisualEntry(trackRef);
  }

  _buildYouTubePoster(videoId) {
    return [
      `url("https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp")`,
      `url("https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg")`,
      `url("https://i.ytimg.com/vi/${videoId}/hqdefault.jpg")`
    ].join(', ');
  }

  _getCuePoint(trackRef) {
    const visual = this._getVisualEntry(trackRef);
    if (!visual) return 0;
    return Number(visual.cuePoint ?? this.cueCache[visual.id] ?? this.cueCache[visual.videoId] ?? 0) || 0;
  }

  _buildMixSequence() {
    const mixableIds = this._getMixableTrackIds();
    if (mixableIds.length === 0) {
      return [...(globalThis.DATA?.backgroundVisuals || ['x8E9HInpzE4', 'b9ktVQN48OU', 'hsdOCzJpUMg'])];
    }

    const sequence = [...mixableIds];
    const heroIndex = sequence.indexOf(this.heroVisualId);
    if (heroIndex > 0) {
      sequence.unshift(sequence.splice(heroIndex, 1)[0]);
    }
    return sequence;
  }

  _hasTrackAudio(trackRef) {
    const visual = this._getVisualEntry(trackRef);
    if (!visual) return false;
    if (visual.audioSrc) return true;
    if (visual.type !== 'youtube') return Boolean(visual.src);
    if (this.audioTrackIds.size === 0) return true;
    return this.audioTrackIds.has(visual.id);
  }

  _getMixableTrackIds() {
    const visualIds = this._getBackgroundVisuals().map((visual) => visual.id);
    const mixableIds = visualIds.filter((id) => this._hasTrackAudio(id));
    return mixableIds.length > 0 ? mixableIds : visualIds;
  }

  _getTrackAudioSrc(trackRef) {
    const visual = this._getVisualEntry(trackRef);
    if (!visual) return null;
    if (visual.audioSrc) return visual.audioSrc;
    if (!this._hasTrackAudio(visual)) {
      if (!this.audioMissingWarnings.has(visual.id)) {
        console.info(
          `[CORTEX AutoDJ] Skipping local audio for ${visual.id}; no matching asset found.`
        );
        this.audioMissingWarnings.add(visual.id);
      }
      return null;
    }
    return visual.type === 'youtube' ? `audio/${visual.id}.webm` : null;
  }

  _getBackgroundVisuals() {
    const visualPool = globalThis.DATA?.backgroundVisuals || globalThis.DATA?.bgVideos || [];
    const uniqueVisuals = [];
    const seen = new Set();

    visualPool
      .map((entry, index) => this._normalizeVisualEntry(entry, index))
      .filter(Boolean)
      .forEach((visual) => {
        if (seen.has(visual.id)) return;
        seen.add(visual.id);
        uniqueVisuals.push(visual);
      });

    return uniqueVisuals;
  }

  initPlayers() {
    const visualPool = this._getBackgroundVisuals();
    if (visualPool.length === 0) return;
    
    // [EXPERT DJ] Abrimos con visuales más cinematográficos y mantenemos el segundo deck preparado
    const youtubeFallback = visualPool.find((visual) => visual.type === 'youtube') || this._normalizeVisualEntry('b9ktVQN48OU');
    const mixableIdSet = new Set(this._getMixableTrackIds());
    const preferredStartVisual = visualPool.find((visual) => visual.id === this.heroVisualId) || visualPool[0];
    const startVisualA = mixableIdSet.has(preferredStartVisual.id)
      ? preferredStartVisual
      : visualPool.find((visual) => mixableIdSet.has(visual.id)) || preferredStartVisual;
    const secondaryPool = visualPool.filter(
      (visual) => visual.id !== startVisualA.id && mixableIdSet.has(visual.id)
    );
    const startVisualB = secondaryPool[Math.floor(Math.random() * secondaryPool.length)]
      || visualPool.find((visual) => visual.id !== startVisualA.id)
      || startVisualA;
    const startCueA = this._getCuePoint(startVisualA.id);
    const startCueB = this._getCuePoint(startVisualB.id);
    this.currentVideoId = startVisualA.id;
    this.deckVisuals.a = startVisualA;
    this.deckVisuals.b = startVisualB;
    this._updateVideoIdentity(startVisualA.id, true);
    this._setDeckPoster('a', startVisualA.id);
    this._setDeckPoster('b', startVisualB.id);
    this._showDeckPoster('a');
    this._showDeckPoster('b');
    this._renderVideoReel();

    this.masterBPM = this.getTrackBPM(startVisualA.id);
    const startAudioA = this._getTrackAudioSrc(startVisualA.id);
    const startAudioB = this._getTrackAudioSrc(startVisualB.id);
    if (startAudioA) this.audioA.src = startAudioA;
    if (startAudioB) this.audioB.src = startAudioB;

    const commonParams = {
      autoplay: 1, mute: 1, controls: 0, disablekb: 1, fs: 0,
      iv_load_policy: 3, loop: 1, modestbranding: 1, playsinline: 1, rel: 0,
      vq: 'highres', origin: window.location.origin
    };

    this.deckA = new YT.Player('bg-video-a', {
      videoId: startVisualA.type === 'youtube' ? startVisualA.videoId : youtubeFallback.videoId,
      playerVars: {
        ...commonParams,
        playlist: startVisualA.type === 'youtube' ? startVisualA.videoId : youtubeFallback.videoId,
        start: startCueA
      },
      events: {
        'onReady': (e) => this.onPlayerReady(e, 'a'),
        'onStateChange': (e) => this.onPlayerStateChange(e, 'a')
      }
    });

    this.deckB = new YT.Player('bg-video-b', {
      videoId: startVisualB.type === 'youtube' ? startVisualB.videoId : youtubeFallback.videoId,
      playerVars: {
        ...commonParams,
        playlist: startVisualB.type === 'youtube' ? startVisualB.videoId : youtubeFallback.videoId,
        start: startCueB
      },
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
      setTimeout(() => event.target.setPlaybackQuality('highres'), 1600);
      setTimeout(() => event.target.setPlaybackQuality('highres'), 5000);
    }

    const deckVisual = this.deckVisuals[deckId];
    
    if (deckId === 'a') {
      event.target.setPlaybackRate(1.0); // Native speed initially
      document.getElementById('video-deck-a').style.opacity = 1;
      if (deckVisual?.type === 'video') {
        this._loadVisualIntoDeck('a', deckVisual, { autoplay: true });
      } else {
        const cuePoint = this._getCuePoint(this.currentVideoId);
        event.target.playVideo();
        if (cuePoint > 0 && typeof event.target.seekTo === 'function') {
          setTimeout(() => event.target.seekTo(cuePoint, true), 250);
        }
        // Fallback: if the YT state event arrives late, don't let the poster mask the whole hero.
        setTimeout(() => this._hideDeckPoster('a'), 1400);
      }
    } else {
      document.getElementById('video-deck-b').style.opacity = 0;
      if (deckVisual?.type === 'video') {
        this._loadVisualIntoDeck('b', deckVisual, { autoplay: false });
      } else {
        event.target.pauseVideo();
        setTimeout(() => this._hideDeckPoster('b'), 1400);
      }
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

  _getPosterUrl(trackRef) {
    const visual = this._getVisualEntry(trackRef);
    if (!visual) return '';
    if (visual.poster) return visual.poster;
    if (visual.type === 'youtube' && visual.videoId) {
      return this._buildYouTubePoster(visual.videoId);
    }
    return '';
  }

  _setDeckPoster(deckId, trackRef) {
    const poster = document.getElementById(`video-poster-${deckId}`);
    if (!poster) return;
    const posterUrl = this._getPosterUrl(trackRef);
    poster.style.backgroundImage = posterUrl;
    poster.style.display = posterUrl ? 'block' : 'none';
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

  _resetNativeDeck(deckId) {
    const nativeVideo = this._getNativeDeck(deckId);
    if (!nativeVideo) return;
    nativeVideo.pause();
    nativeVideo.classList.remove('is-active');
  }

  _pauseDeckVisual(deckId) {
    const visual = this.deckVisuals[deckId];
    const player = this._getDeckPlayer(deckId);
    const nativeVideo = this._getNativeDeck(deckId);

    if (visual?.type === 'video') {
      nativeVideo?.pause();
      return;
    }

    if (player && typeof player.pauseVideo === 'function') {
      player.pauseVideo();
    }
  }

  _playDeckVisual(deckId) {
    const visual = this.deckVisuals[deckId];
    const player = this._getDeckPlayer(deckId);
    const nativeVideo = this._getNativeDeck(deckId);

    if (visual?.type === 'video') {
      nativeVideo?.play().catch((error) => console.warn(error));
      return;
    }

    if (player && typeof player.playVideo === 'function') {
      player.playVideo();
    }
  }

  _setDeckPlaybackRate(deckId, rate) {
    const visual = this.deckVisuals[deckId];
    const player = this._getDeckPlayer(deckId);
    const nativeVideo = this._getNativeDeck(deckId);

    if (visual?.type === 'video') {
      if (nativeVideo) nativeVideo.playbackRate = rate;
      return;
    }

    if (player && typeof player.setPlaybackRate === 'function') {
      player.setPlaybackRate(rate);
    }
  }

  _loadVisualIntoDeck(deckId, trackRef, { autoplay = false } = {}) {
    const visual = this._getVisualEntry(trackRef);
    const player = this._getDeckPlayer(deckId);
    const nativeVideo = this._getNativeDeck(deckId);
    if (!visual) return;

    this.deckVisuals[deckId] = visual;
    this._setDeckPoster(deckId, visual.id);

    if (visual.type === 'video') {
      if (!nativeVideo || !visual.src) return;
      if (player && typeof player.pauseVideo === 'function') {
        player.pauseVideo();
      }

      nativeVideo.src = visual.src;
      nativeVideo.poster = visual.poster || '';
      nativeVideo.currentTime = 0;
      nativeVideo.classList.add('is-active');

      const cuePoint = this._getCuePoint(visual.id);
      const seekNative = () => {
        if (cuePoint <= 0) return;
        try {
          nativeVideo.currentTime = cuePoint;
        } catch (error) {
          console.warn(error);
        }
      };

      nativeVideo.onloadedmetadata = seekNative;
      nativeVideo.load();
      if (autoplay) {
        nativeVideo.play().catch((error) => console.warn(error));
        setTimeout(() => this._hideDeckPoster(deckId), 900);
      } else {
        nativeVideo.pause();
      }
      return;
    }

    if (nativeVideo) {
      nativeVideo.pause();
      nativeVideo.removeAttribute('src');
      nativeVideo.load();
      nativeVideo.classList.remove('is-active');
    }

    if (!player) return;

    const cuePoint = this._getCuePoint(visual.id);
    player.mute();
    if (autoplay && typeof player.loadVideoById === 'function') {
      player.loadVideoById({ videoId: visual.videoId, startSeconds: cuePoint });
    } else if (typeof player.cueVideoById === 'function') {
      player.cueVideoById({ videoId: visual.videoId, startSeconds: cuePoint });
    }
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
        this._claimFocus('unlock-interaction');
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

    // 🌐 LOCATION SENSOR (local-only; avoids brittle third-party reverse geocoding)
    {
        const el = document.getElementById('sensor-location');
        const metaPlace = document.querySelector('meta[name="geo.placename"]')?.content || '';
        const metaRegion = document.querySelector('meta[name="geo.region"]')?.content || '';
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const timeZoneCity = timeZone.split('/').pop()?.replace(/_/g, ' ') || '';
        let localeRegion = '';

        try {
            localeRegion = new Intl.Locale(navigator.language || 'es-ES').region || '';
        } catch (error) {
            localeRegion = (navigator.language || '').split('-')[1]?.toUpperCase() || '';
        }

        const city = timeZoneCity || this.userProfile.lastCity || metaPlace || 'LOCAL';
        const country = localeRegion || metaRegion.replace(/^.*-/, '') || '';
        const locationLabel = country ? `${city}, ${country}` : city;

        if (el) {
            el.innerText = locationLabel;
            if (timeZone) {
                el.title = timeZone;
            }
        }

        this.userProfile.lastCity = city;
        localStorage.setItem('moskv_user', JSON.stringify(this.userProfile));
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
            const title = this._getTrackTitle(this.prefetchQueue[i]);
            el.innerText = title.substring(0, 12);
        } else if (el) {
            el.innerText = '---';
        }
    }
    // Pre-cue first prefetch on standby deck
    const standbyDeck = this.activeDeck === 'a' ? this.deckB : this.deckA;
    const prefetchedVisual = this._getVisualEntry(this.prefetchQueue[0]);
    if (standbyDeck && prefetchedVisual?.type === 'youtube' && typeof standbyDeck.cueVideoById === 'function') {
        standbyDeck.cueVideoById(prefetchedVisual.videoId);
        console.log(`[MOSKV DJ] Prefetched: ${prefetchedVisual.id}`);
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
            
            const vContainer = document.querySelector('.video-background-system') || document.querySelector('.video-container');
            if (vContainer) {
                const reactiveEnergy = Math.max(0, Math.min(1, bassAvg / 255));
                const snareEnergy = Math.max(0, Math.min(1, snareAvg / 255));
                
                vContainer.style.setProperty('--video-reactive-energy', reactiveEnergy.toFixed(3));
                document.documentElement.style.setProperty('--dj-bass-energy', reactiveEnergy.toFixed(3));
                document.documentElement.style.setProperty('--dj-snare-energy', snareEnergy.toFixed(3));
                document.documentElement.style.setProperty('--dj-freq-avg', (bassAvg / 255).toFixed(3));
            }
            
            // 2026 Trend: Liquid Glass / Performance Inmersivo. Throttle kicks to 400ms max.
            if (bassAvg > 220 && Date.now() - lastPulse > 400) {
                if (vContainer) {
                    gsap.killTweensOf(vContainer);
                    gsap.to(vContainer, { scale: 1.015, filter: 'contrast(1.15) saturate(1.2) hue-rotate(3deg)', duration: 0.05, ease: "power1.out", yoyo: true, repeat: 1 });
                }
                
                // Chromatic aberration on UI elements
                const texts = document.querySelectorAll('.moskv-dj-hud');
                if (texts.length) {
                    gsap.killTweensOf(texts);
                    gsap.to(texts, { 
                        textShadow: '3px 0 rgba(255,0,0,0.9), -3px 0 rgba(0,255,255,0.9)', 
                        x: () => Math.random() * 4 - 2,
                        y: () => Math.random() * 4 - 2,
                        duration: 0.05, 
                        yoyo: true, 
                        repeat: 1, 
                        clearProps: 'all'
                    });
                }
                
                lastPulse = Date.now();
                
                // Glow effect on active deck UI (Dopamine hit)
                const activeUI = document.getElementById(`dj-deck-${this.activeDeck}-ui`);
                if (activeUI) {
                    gsap.killTweensOf(activeUI);
                    gsap.to(activeUI, { color: '#FFFFFF', textShadow: '0 0 20px var(--accent-primary)', scale: 1.05, duration: 0.1, yoyo: true, repeat: 1 });
                }
                
                // Matrix-like scramble of visit sensors or numbers
                const sensorValues = document.querySelectorAll('.dj-sensor-value');
                sensorValues.forEach(el => {
                    if (Math.random() > 0.5) {
                        const original = el.innerText;
                        el.innerText = Math.random().toString(16).substr(2, 4).toUpperCase();
                        setTimeout(() => el.innerText = original, 100);
                    }
                });

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
          bg = `rgba(5, 5, 5, ${0.5 + Math.random() * 0.4})`;
          duration = 1.0 + Math.random() * 1.5;
          blur = `blur(${2 + Math.random() * 5}px)`;
          
          if (Math.random() > 0.6) {
              const text = document.createElement('span');
              text.innerText = ['CORTEX', 'EXERGY', 'BPM', 'SYNC', 'MOSKV', 'ZERO-STATE'][Math.floor(Math.random() * 6)];
              text.style.color = 'rgba(242, 221, 51, 0.4)';
              text.style.fontFamily = 'var(--font-mono, monospace)';
              text.style.fontSize = (5 + Math.random() * 10) + 'vh';
              text.style.position = 'absolute';
              text.style.bottom = '10px';
              text.style.left = '10px';
              text.style.fontWeight = 'bold';
              text.style.letterSpacing = '-0.05em';
              obj.appendChild(text);
          }
      } else {
          // Snares / secondary beats: passing lights, distant buildings (background, slower)
          width = 5 + Math.random() * 20 + 'vw';
          height = 2 + Math.random() * 10 + 'vh';
          bottom = 10 + Math.random() * 60 + 'vh';
          bg = `rgba(43, 59, 229, ${0.1 + Math.random() * 0.4})`; // BlueYlb highlights
          duration = 2.5 + Math.random() * 2;
          blur = `blur(${4 + Math.random() * 10}px)`;
      }
      
      obj.style.width = width;
      obj.style.height = height;
      obj.style.bottom = bottom;
      obj.style.background = bg;
      obj.style.backdropFilter = blur;
      obj.style.border = type === 'kick' ? '1px solid rgba(220, 220, 220, 0.1)' : '1px solid rgba(43, 59, 229, 0.4)';
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
    const visual = this._getVisualEntry(videoId);
    if (videoId === this.heroVisualId && globalThis.DATA?.heroBackground?.title) {
      return globalThis.DATA.heroBackground.title;
    }
    return visual?.title || globalThis.DATA?.works?.find(work => work.id === videoId)?.title || 'BACKGROUND VISUAL';
  }

  _getTrackUrl(videoId) {
    const visual = this._getVisualEntry(videoId);
    if (videoId === this.heroVisualId && globalThis.DATA?.heroBackground?.url) {
      return globalThis.DATA.heroBackground.url;
    }
    return visual?.url || `https://www.youtube.com/watch?v=${videoId}`;
  }

  _getTrackMeta(videoId) {
    const visual = this._getVisualEntry(videoId);
    const work = globalThis.DATA?.works?.find((entry) => entry.id === videoId);
    const categories = work?.categories || [];
    let badge = visual?.badge || 'YT';
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
    reel.innerHTML = visuals.map((visual) => {
      const meta = this._getTrackMeta(visual.id);
      const activeClass = visual.id === this.currentVideoId ? ' is-active' : '';
      const pressed = visual.id === this.currentVideoId ? 'true' : 'false';
      return `
        <button class="video-reel-btn${activeClass}" type="button" data-video-id="${visual.id}" aria-pressed="${pressed}">
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
    const backgroundIds = this._getMixableTrackIds();
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
    backgroundIds.forEach((id) => {
        if (!ids.includes(id) && !this.playedTracks.includes(id)) {
            ids.push(id);
        }
    });
    const heroIndex = ids.indexOf(this.heroVisualId);
    if (heroIndex > 0) {
        ids.unshift(ids.splice(heroIndex, 1)[0]);
    }
    
    // If all played, reset history
    if (ids.length === 0) {
        this.playedTracks = [];
        localStorage.setItem('moskv_dj_history', '[]');
        return backgroundIds;
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
      const currentTrackId = this.currentVideoId;
      
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
      let newPhase = 'warmup';
      if (elapsedMin < 3) {
          newPhase = 'warmup';
      } else if (elapsedMin < 8) {
          newPhase = 'buildup';
      } else if (elapsedMin < 15) {
          newPhase = 'peak';
      } else {
          newPhase = 'cooldown';
      }

      // Trigger GPGPU Physics States based on phase changes
      if (typeof window !== 'undefined' && this.energyPhase !== newPhase) {
          document.documentElement.dataset.energyPhase = newPhase;
          this._choreographPhase(newPhase);
          if (newPhase === 'buildup') {
               // Activate Zero-G anomaly: DOM floats upwards
               document.documentElement.style.setProperty('--cortex-gravity', '-9.8');
               document.documentElement.style.setProperty('--cortex-viscosity', '0.05');
          } else if (newPhase === 'peak') {
               // Heavy gravity + turbulence
               document.documentElement.style.setProperty('--cortex-gravity', '18.5');
               document.documentElement.style.setProperty('--cortex-viscosity', '0.8');
          } else {
               // Normal resting state
               document.documentElement.style.setProperty('--cortex-gravity', '9.8');
               document.documentElement.style.setProperty('--cortex-viscosity', '0.3');
          }
      }

      this.energyPhase = newPhase;
      return this.energyPhase;
  }

  // GSAP Zero-G Choreography Engine (v3)
  // Stores active timelines/intervals for cleanup on phase switch
  _activeBreathingTL = null;
  _activeJoltInterval = null;

  _choreographPhase(phase) {
      if (typeof gsap === 'undefined') return;
      const windows = '.drag-window';
      const cards = '.player-card, .hero-signal-card';
      const marquee = '.marquee__inner';
      const rand = (min, max) => Math.random() * (max - min) + min;

      // Kill any running phase tweens + timelines
      gsap.killTweensOf(windows);
      gsap.killTweensOf(cards);
      gsap.killTweensOf('.hero-title');
      gsap.killTweensOf('.haiku-line');
      gsap.killTweensOf(marquee);
      if (this._activeBreathingTL) { this._activeBreathingTL.kill(); this._activeBreathingTL = null; }
      if (this._activeJoltInterval) { clearInterval(this._activeJoltInterval); this._activeJoltInterval = null; }

      if (phase === 'buildup') {
          // ── Continuous Breathing: elements oscillate in zero-G ──
          const winEls = document.querySelectorAll(windows);
          const cardEls = document.querySelectorAll(cards);
          const haikuEls = document.querySelectorAll('.haiku-line');

          this._activeBreathingTL = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } });

          // Each window gets a unique amplitude + duration for non-robotic drift
          winEls.forEach((el, i) => {
              const amp = rand(20, 55);
              const dur = rand(3, 5.5);
              const rot = rand(-2.5, 2.5);
              this._activeBreathingTL.to(el, {
                  y: -amp,
                  rotation: rot,
                  duration: dur,
              }, i * 0.15); // staggered start
          });

          cardEls.forEach((el, i) => {
              this._activeBreathingTL.to(el, {
                  y: -rand(10, 30),
                  rotation: rand(-1, 1),
                  duration: rand(2.8, 4.5),
              }, i * 0.08);
          });

          haikuEls.forEach((el, i) => {
              this._activeBreathingTL.to(el, {
                  y: -rand(6, 18),
                  duration: rand(4, 6),
              }, i * 0.25);
          });

          // Marquee: slow drift (weightless)
          gsap.to(marquee, { css: { animationDuration: '55s' }, duration: 3 });

      } else if (phase === 'peak') {
          // ── Gravity slam: snap down with elastic overshoot ──
          gsap.to(windows, {
              y: () => rand(3, 12),
              rotation: 0,
              duration: 0.3,
              ease: 'back.out(3)',
              stagger: { each: 0.03, from: 'random' }
          });
          gsap.to(cards, {
              y: () => rand(2, 8),
              rotation: 0,
              duration: 0.25,
              ease: 'back.out(4)',
              stagger: { each: 0.02, from: 'random' }
          });
          gsap.to('.haiku-line', {
              y: 0,
              duration: 0.2,
              ease: 'power4.out',
              stagger: 0.05
          });

          // Marquee: frantic acceleration
          gsap.to(marquee, { css: { animationDuration: '10s' }, duration: 0.5 });

          // ── Continuous micro-jolts during peak ──
          const joltTargets = [windows, cards, '.section-kicker', '.hero-title'];
          this._activeJoltInterval = setInterval(() => {
              const target = joltTargets[Math.floor(Math.random() * joltTargets.length)];
              const els = document.querySelectorAll(target);
              if (!els.length) return;
              const el = els[Math.floor(Math.random() * els.length)];
              gsap.to(el, {
                  x: rand(-5, 5),
                  y: rand(-3, 3),
                  duration: 0.12,
                  ease: 'power3.out',
                  onComplete: () => {
                      gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: 'elastic.out(1, 0.4)' });
                  }
              });
          }, rand(800, 1800));

      } else {
          // ── Warmup / Cooldown: gentle restoration ──
          gsap.to(windows, {
              y: 0,
              rotation: 0,
              duration: 2.5,
              ease: 'power2.out',
              stagger: { each: 0.1, from: 'start' }
          });
          gsap.to(cards, {
              y: 0,
              rotation: 0,
              duration: 2,
              ease: 'power2.out',
              stagger: { each: 0.06, from: 'start' }
          });
          gsap.to('.haiku-line', {
              y: 0,
              duration: 2,
              ease: 'power2.out',
              stagger: 0.15
          });

          // Marquee: restore normal
          gsap.to(marquee, { css: { animationDuration: '30s' }, duration: 2 });
      }
  }

  // MICA STITCH CONTEXTUAL INSIGHT (fires every 3rd mix)
  _stitchInsight() {
      if (this.mixCount % 3 !== 0) return;
      
      const phase = this._updateEnergyPhase();
      const listenMin = Math.round((Date.now() - this.setStartTime) / 60000);
      const totalListenHrs = Math.round((this.userProfile.totalListenSec || 0) / 3600 * 10) / 10;
      
      const insights = {
          warmup: [
              `MOSKV. Berotzen. ${listenMin} minutu igaro dira. Sistemak egonkor.`,
              `Lehen fasea. Energia baxuko inguratzailea detektatuta. Tentsioa igotzen.`,
              `Saioa ${this.userProfile.visits}. Ongi etorri. Objektiboak finkatzen.`
          ],
          buildup: [
              `Txanda azeleratua. Grabitate Zero (Zero-G) egitura. Exergia igotzen.`,
              `Dopamina-kurba gorantz. ${this.mixCount} nahasketa sakon. Físicas inestables.`,
              `Momentua hartzen. Sare neurala sinkronizatzen ari da.`
          ],
          peak: [
              `Energia maximoa. CORTEX sistema potentzia gorenean. Grabitate masiboa!`,
              `${this.mixCount} interakzio. Hau da gailurra. Kontrol absolutua.`,
              `Potentzia osoa. Termodinamika lehertzen. Murgildu.`
          ],
          cooldown: [
              `Atenuazio fasea. ${listenMin} minutu eboluzioan. Dezelerazio mailakatua.`,
              `Energia jaisten. Oihartzuna hozten.`,
              `Saioa erlaxatzen. Físicas restauradas. ${this.mixCount} trantsizio burututa.`
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

    const fromEl = document.getElementById(`video-deck-${fromDeckId}`);
    const toEl = document.getElementById(`video-deck-${toDeckId}`);

    const availableTracks = this._getMixableTrackIds();
    const moodPool = this._getTracksForMood();
    // ═══ HARMONIC FILTERING (Camelot Wheel) ═══
    const harmonicPool = this._getHarmonicTracks(moodPool);
    
    // ═══ INTELLIGENT ENERGY ARC (BPM Matching) ═══
    let intelligentPool = [...harmonicPool];
    if (intelligentPool.length > 2) {
        intelligentPool.sort((a, b) => this.getTrackBPM(a) - this.getTrackBPM(b));
        if (this.energyPhase === 'buildup') {
            intelligentPool = intelligentPool.slice(Math.floor(intelligentPool.length / 2));
        } else if (this.energyPhase === 'cooldown') {
            intelligentPool = intelligentPool.slice(0, Math.ceil(intelligentPool.length / 2));
        } else if (this.energyPhase === 'peak') {
            intelligentPool = intelligentPool.slice(Math.max(0, intelligentPool.length - 3));
        }
    }

    // Use prefetch queue if available (TikTok-style)
    let nextTrack;
    if (forcedNextTrack) {
        nextTrack = forcedNextTrack;
    } else if (this.prefetchQueue.length > 0) {
        nextTrack = this.prefetchQueue.shift();
    } else {
        nextTrack = intelligentPool[Math.floor(Math.random() * intelligentPool.length)] || availableTracks[Math.floor(Math.random() * availableTracks.length)];
    }
    const nextVisual = this._getVisualEntry(nextTrack);
    if (!nextVisual) {
        this.isCrossfading = false;
        document.querySelector('.video-container')?.classList.remove('is-transitioning');
        return;
    }
    nextTrack = nextVisual.id;
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
        
        const trackTitle = this._getTrackTitle(nextTrack) || "INCOMING";
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

    const cuePoint = this._getCuePoint(nextTrack);
    this._setDeckPoster(toDeckId, nextTrack);
    this._showDeckPoster(toDeckId);
    this._loadVisualIntoDeck(toDeckId, nextTrack, { autoplay: true });
    
    // Sync external audio too
    const toAudio = toDeckId === 'a' ? this.audioA : this.audioB;
    const fromAudio = fromDeckId === 'a' ? this.audioA : this.audioB;
    const audioSrc = this._getTrackAudioSrc(nextTrack);
    if (audioSrc) {
        toAudio.src = audioSrc;
        toAudio.onloadeddata = () => {
            toAudio.currentTime = cuePoint;
        };
    } else {
        toAudio.pause();
        toAudio.removeAttribute('src');
        toAudio.load();
        toAudio.onloadeddata = null;
    }
    
    // Apply Harmonic Pitch & Rhythm Sync
    setTimeout(() => {
        this._setDeckPlaybackRate(toDeckId, syncRate);
        if (audioSrc) {
            toAudio.playbackRate = syncRate;
            toAudio.preservesPitch = false; // Vinyl feel
        }
    }, 500);

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

            if (audioSrc) {
                toAudio.play().catch(e => console.warn(e));
            }
        }
        
        // Cleanup visuals and inactive decks after crossfade
        setTimeout(() => {
            this._pauseDeckVisual(fromDeckId);
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
      const container = document.querySelector('.video-container');
      if (container) {
          globalThis.requestAnimationFrame(() => {
              container.style.transform = `translate3d(${this.mouseX || 0}px, ${this.mouseY || 0}px, 0) scale(1.05)`;
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
    this._pauseDeckVisual(this.activeDeck);
    const activeAudio = this.activeDeck === 'a' ? this.audioA : this.audioB;
    if (activeAudio) activeAudio.pause();
  }

  resumeBackgroundMusic(reason = 'external') {
    this.pauseReasons.delete(reason);
    this.isBackgroundPausedByEmbed = this.pauseReasons.size > 0;
    if (this.isBackgroundPausedByEmbed) return;
    
    const activeAudio = this.activeDeck === 'a' ? this.audioA : this.audioB;
    
    this._playDeckVisual(this.activeDeck);
    
    if (!this.globalMuted && activeAudio) {
        activeAudio.play().catch(e => console.warn(e));
    }
  }

  triggerEruptionTransition(profile = 'default') {
    if (this.globalMuted || !this.audioContext) return;

    const now = this.audioContext.currentTime;
    const activeGain = this.activeDeck === 'a' ? this.gainA : this.gainB;
    const activeEQ = this.activeDeck === 'a' ? this.eqA : this.eqB;
    const activeAux = this.activeDeck === 'a' ? this.auxA : this.auxB;

    if (!activeGain || !activeEQ) return;

    const profiles = {
      chiquito: { duck: 0.72, peak: 920, echo: 0.22, bodyClass: 'eruption-chiquito' },
      bertin: { duck: 0.68, peak: 760, echo: 0.18, bodyClass: 'eruption-bertin' },
      carlton: { duck: 0.64, peak: 1180, echo: 0.28, bodyClass: 'eruption-carlton' },
      arevalo: { duck: 0.7, peak: 640, echo: 0.16, bodyClass: 'eruption-arevalo' },
      default: { duck: 0.7, peak: 840, echo: 0.2, bodyClass: 'eruption-default' }
    };

    const settings = profiles[profile] || profiles.default;
    const activeTarget = 1;

    activeGain.gain.cancelScheduledValues(now);
    activeGain.gain.setValueAtTime(Math.max(0.0001, activeGain.gain.value), now);
    activeGain.gain.linearRampToValueAtTime(settings.duck, now + 0.08);
    activeGain.gain.linearRampToValueAtTime(activeTarget, now + 0.66);

    activeEQ.low.gain.cancelScheduledValues(now);
    activeEQ.mid.gain.cancelScheduledValues(now);
    activeEQ.high.gain.cancelScheduledValues(now);
    activeEQ.hpf.frequency.cancelScheduledValues(now);

    activeEQ.low.gain.setValueAtTime(0, now);
    activeEQ.mid.gain.setValueAtTime(0, now);
    activeEQ.high.gain.setValueAtTime(0, now);
    activeEQ.hpf.frequency.setValueAtTime(0, now);

    activeEQ.low.gain.linearRampToValueAtTime(-4.5, now + 0.12);
    activeEQ.low.gain.linearRampToValueAtTime(0, now + 0.58);
    activeEQ.mid.gain.linearRampToValueAtTime(1.8, now + 0.18);
    activeEQ.mid.gain.linearRampToValueAtTime(0, now + 0.62);
    activeEQ.high.gain.linearRampToValueAtTime(3.8, now + 0.12);
    activeEQ.high.gain.linearRampToValueAtTime(0, now + 0.62);
    activeEQ.hpf.frequency.linearRampToValueAtTime(settings.peak, now + 0.16);
    activeEQ.hpf.frequency.exponentialRampToValueAtTime(1, now + 0.7);

    if (activeAux) {
      activeAux.gain.cancelScheduledValues(now);
      activeAux.gain.setValueAtTime(0, now);
      activeAux.gain.linearRampToValueAtTime(settings.echo, now + 0.08);
      activeAux.gain.linearRampToValueAtTime(0, now + 0.72);
    }

    const root = document.documentElement;
    root.classList.remove(
      'eruption-chiquito',
      'eruption-bertin',
      'eruption-carlton',
      'eruption-arevalo',
      'eruption-default'
    );
    root.classList.add(settings.bodyClass);
    document.querySelector('.video-container')?.classList.add('is-transitioning');

    window.clearTimeout(this.eruptionFxTimer);
    this.eruptionFxTimer = window.setTimeout(() => {
      root.classList.remove(settings.bodyClass);
      if (!this.isCrossfading) {
        document.querySelector('.video-container')?.classList.remove('is-transitioning');
      }
    }, 820);
  }

  _ensureHTML() {
    // Check if system already exists in DOM
    if (document.getElementById('av-trigger')) return;

    console.log('[CORTEX] Injecting Video Background System HTML');
    const div = document.createElement('div');
    div.className = 'video-background-system';
    div.id = 'av-trigger';
    div.innerHTML = `
      <div class="video-deck-wrap" id="video-deck-a">
        <div id="bg-video-a"></div>
        <div class="video-poster" id="video-poster-a"></div>
        <div class="deck-ui" id="dj-deck-a-ui">
            <span>DK-A ⏸</span>
            <span>INITIALIZING...</span>
        </div>
      </div>
      <div class="video-deck-wrap" id="video-deck-b">
        <div id="bg-video-b"></div>
        <div class="video-poster" id="video-poster-b"></div>
        <div class="deck-ui" id="dj-deck-b-ui">
            <span>DK-B ⏸</span>
            <span>STANDBY</span>
        </div>
      </div>
      <div class="video-overlay"></div>
      <div class="video-identity-wrap" id="videoIdentity">
          <span class="video-identity-label" id="videoIdentityLabel">BACKGROUND REEL</span>
          <strong class="video-identity-title" id="videoIdentityTitle">BORJA MOSKV — SIGNAL</strong>
      </div>
    `;
    
    // Attempt to prepend to body
    if (document.body) {
      document.body.prepend(div);
    } else {
      document.addEventListener('DOMContentLoaded', () => document.body.prepend(div));
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  globalThis.autoDJAesthetic = new AutoDJAesthetic();
});
