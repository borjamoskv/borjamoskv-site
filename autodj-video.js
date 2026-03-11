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
    this.isBackgroundPausedByEmbed = false;
    
    // Harmony & Timing
    this.fadeDurationMs = 3000; 
    this.masterBPM = 125; // Default master tempo

    // Simulated BPM database for known tracks (fallback to 120-130 if unknown)
    this.bpmCache = {};

    // Inject YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Global callback required by YT API
    window.onYouTubeIframeAPIReady = () => this.initPlayers();
    
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

  initPlayers() {
    if (!window.DATA || !window.DATA.videoThumbnails) return;
    
    const startVidA = window.DATA.videoThumbnails[Math.floor(Math.random() * window.DATA.videoThumbnails.length)];
    const startVidB = window.DATA.videoThumbnails[Math.floor(Math.random() * window.DATA.videoThumbnails.length)];

    this.masterBPM = this.getTrackBPM(startVidA);

    const commonParams = {
      autoplay: 1, controls: 0, disablekb: 1, fs: 0, 
      iv_load_policy: 3, loop: 1, modestbranding: 1, playsinline: 1, rel: 0
    };

    this.deckA = new YT.Player('bg-video-a', {
      videoId: startVidA,
      playerVars: { ...commonParams, playlist: startVidA },
      events: { 'onReady': (e) => this.onPlayerReady(e, 'a') }
    });

    this.deckB = new YT.Player('bg-video-b', {
      videoId: startVidB,
      playerVars: { ...commonParams, playlist: startVidB },
      events: { 'onReady': (e) => this.onPlayerReady(e, 'b') }
    });
  }

  onPlayerReady(event, deckId) {
    if (this.globalMuted) {
      event.target.mute();
    } else {
      event.target.unMute();
    }
    
    if (deckId === 'a') {
      event.target.setVolume(100);
      event.target.setPlaybackRate(1.0); // Native speed initially
      document.getElementById('bg-video-a').style.opacity = 1;
      event.target.playVideo();
    } else {
      event.target.setVolume(0);
      document.getElementById('bg-video-b').style.opacity = 0;
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

  toggleGlobalMute() {
    this.globalMuted = !this.globalMuted;
    const activePlayer = this.activeDeck === 'a' ? this.deckA : this.deckB;
    
    if (this.globalMuted) {
      if(this.deckA && typeof this.deckA.mute === 'function') this.deckA.mute();
      if(this.deckB && typeof this.deckB.mute === 'function') this.deckB.mute();
    } else {
      if(activePlayer && typeof activePlayer.unMute === 'function') activePlayer.unMute();
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
      const activePlayer = this.activeDeck === 'a' ? this.deckA : this.deckB;
      if (activePlayer && typeof activePlayer.unMute === 'function') {
        if (!this.globalMuted) {
            activePlayer.unMute();
            activePlayer.setVolume(100);
        }
      }
    };

    ['click', 'touchstart', 'keydown'].forEach(evt => 
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
  }

  triggerCrossfade() {
    if (this.isCrossfading || !this.deckA || !this.deckB) return;
    if (typeof this.deckA.getPlayerState !== 'function' || typeof this.deckB.getPlayerState !== 'function') return;

    this.isCrossfading = true;

    const fromDeckId = this.activeDeck;
    const toDeckId = this.activeDeck === 'a' ? 'b' : 'a';
    
    const fromPlayer = fromDeckId === 'a' ? this.deckA : this.deckB;
    const toPlayer = toDeckId === 'a' ? this.deckA : this.deckB;

    const fromEl = document.getElementById(`bg-video-${fromDeckId}`);
    const toEl = document.getElementById(`bg-video-${toDeckId}`);

    const availableTracks = window.DATA.videoThumbnails;
    const nextTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
    
    const nextBPM = this.getTrackBPM(nextTrack);
    console.log(`[CORTEX Auto-DJ] Syncing BPM: Master(${this.masterBPM}) <- Target(${nextBPM})`);
    
    // Calculate pitch/time-stretch ratio to match master tempo
    // YouTube API limits playback rates to certain floating points, but accepts generic numbers.
    // E.g., if Master is 130 and Next is 120, rate needs to be 130/120 = 1.083x
    const syncRate = Math.max(0.5, Math.min(2.0, this.masterBPM / nextBPM));

    toPlayer.mute();
    toPlayer.loadVideoById({videoId: nextTrack, startSeconds: 0});
    // Apply Harmonic Pitch & Rhythm Sync
    setTimeout(() => {
        if(typeof toPlayer.setPlaybackRate === 'function') {
           toPlayer.setPlaybackRate(syncRate);
        }
    }, 500);

    toPlayer.setVolume(0);
    toPlayer.playVideo();

    if (typeof gsap !== 'undefined') {
      setTimeout(() => {
        // Visual fade
        gsap.to(fromEl, { opacity: 0, duration: this.fadeDurationMs / 1000, ease: "power2.inOut" });
        gsap.to(toEl, { opacity: 1, duration: this.fadeDurationMs / 1000, ease: "power2.inOut" });
        
        // Audio fade
        if (!this.globalMuted) {
          toPlayer.unMute();
          const volProxy = { from: 100, to: 0 };
          gsap.to(volProxy, {
            from: 0,
            to: 100,
            duration: this.fadeDurationMs / 1000,
            ease: "none",
            onUpdate: () => {
              fromPlayer.setVolume(volProxy.from);
              toPlayer.setVolume(volProxy.to);
            },
            onComplete: () => {
              fromPlayer.pauseVideo();
              this.activeDeck = toDeckId;
              this.isCrossfading = false;
            }
          });
        } else {
          setTimeout(() => {
            fromPlayer.pauseVideo();
            this.activeDeck = toDeckId;
            this.isCrossfading = false;
          }, this.fadeDurationMs);
        }
      }, 1000); // Allow buffering and rate-setting
    }
  }

  bindEmbedListeners() {
    window.addEventListener('blur', () => {
      setTimeout(() => {
        if (document.activeElement instanceof HTMLIFrameElement) {
          const iframe = document.activeElement;
          
          if (!iframe.id.includes('bg-video')) {
            console.log("[CORTEX] External Embed engaged. Pausing background A/V.");
            this.pauseBackgroundMusic();
          }
        }
      }, 100);
    });
    
    window.addEventListener('focus', () => {
       console.log("[CORTEX] Focus returned home. Checking resumption.");
       this.resumeBackgroundMusic();
    });
    
    const labs = document.querySelectorAll('.lab-card-content, .player-wrapper');
    labs.forEach(el => {
      el.addEventListener('click', () => {
        this.pauseBackgroundMusic();
      });
    });
  }

  pauseBackgroundMusic() {
    if (this.isBackgroundPausedByEmbed) return;
    this.isBackgroundPausedByEmbed = true;
    
    const activePlayer = this.activeDeck === 'a' ? this.deckA : this.deckB;
    if (activePlayer && typeof activePlayer.pauseVideo === 'function') {
      activePlayer.pauseVideo();
    }
  }

  resumeBackgroundMusic() {
    if (!this.isBackgroundPausedByEmbed) return;
    this.isBackgroundPausedByEmbed = false;
    
    if (!this.globalMuted) {
      const activePlayer = this.activeDeck === 'a' ? this.deckA : this.deckB;
      if (activePlayer && typeof activePlayer.playVideo === 'function') {
        activePlayer.playVideo();
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.autoDJAesthetic = new AutoDJAesthetic();
});
