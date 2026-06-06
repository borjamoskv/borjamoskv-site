// ═══════════════════════════════════════════════════════════════════════════
// VOICE EFFECTS PIPELINE — Web Audio API Dry Vocal Processor
// Applies real-time studio-grade processing to dry 24-bit synthesized vocals.
// Implements: Presence EQ, Dynamics Compression, Procedural Spatial Reverb,
// BPM-Synced Delay, and Dynamic Panning.
// ═══════════════════════════════════════════════════════════════════════════

window.MOSKV = window.MOSKV || {};

class VoiceEffectsPipeline {
    /**
     * @param {AudioContext} [audioContext] — Option to share main page context.
     */
    constructor(audioContext = null) {
        this.isPrivateCtx = !audioContext && !window.MOSKV.audioContext;
        this.ctx = audioContext || window.MOSKV.audioContext || new (window.AudioContext || window.webkitAudioContext)();
        this.bpm = 125;
        this.isReady = false;

        // Core Nodes
        this.inputNode = null;
        this.lowCut = null;
        this.presenceEQ = null;
        this.compressor = null;
        this.panner = null;
        
        // Reverb Bus (Procedural)
        this.reverbNode = null;
        this.reverbGain = null;
        
        // Delay Bus (BPM-synced feedback delay)
        this.delayNode = null;
        this.delayFeedback = null;
        this.delayFilter = null;
        this.delayGain = null;

        // Output Gain
        this.outputGain = null;

        this._setupPipeline();
    }

    /**
     * Initialize the DSP graph nodes and routing.
     * @private
     */
    _setupPipeline() {
        // 1. Low Cut Filter (80Hz highpass to clean up rumble/plosives)
        this.lowCut = this.ctx.createBiquadFilter();
        this.lowCut.type = 'highpass';
        this.lowCut.frequency.value = 85;
        this.lowCut.Q.value = 0.707;

        // 2. Humanist Presence EQ (Peaking filter at 2.8kHz to enhance synthesized voice definition)
        this.presenceEQ = this.ctx.createBiquadFilter();
        this.presenceEQ.type = 'peaking';
        this.presenceEQ.frequency.value = 2800;
        this.presenceEQ.Q.value = 1.2;
        this.presenceEQ.gain.value = 4.0; // +4dB boost

        // 3. Dynamic vocal compressor (flattens volume peaks and boosts low syllables)
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -18; // Compress early
        this.compressor.knee.value = 6;         // Harder knee for vocal presence
        this.compressor.ratio.value = 4.0;      // 4:1 compression ratio
        this.compressor.attack.value = 0.003;   // Ultra-fast attack (3ms) to catch transits
        this.compressor.release.value = 0.08;   // Fast release (80ms) for natural tail

        // 4. Stereo Panner Node (Spatializes voice on screen based on interaction coordinates)
        this.panner = this.ctx.createStereoPanner();
        this.panner.pan.value = 0.0; // Centered by default

        // 5. Output Node
        this.outputGain = this.ctx.createGain();
        this.outputGain.gain.value = 0.85;

        // ═══════════════════════════════════════════
        // PROCEDURAL REVERB (Warehouse Simulator)
        // ═══════════════════════════════════════════
        this.reverbNode = this.ctx.createConvolver();
        this.reverbNode.buffer = this._generateWarehouseImpulseResponse(1.8, 2.5);
        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.12; // Subtle wet mix (12%)

        // ═══════════════════════════════════════════
        // DUB DELAY FX BUS (BPM-synced)
        // ═══════════════════════════════════════════
        this.delayNode = this.ctx.createDelay(2.0);
        this.delayNode.delayTime.value = this._calculateDelayTime();
        this.delayFeedback = this.ctx.createGain();
        this.delayFeedback.gain.value = 0.35; // Moderate echoes
        this.delayFilter = this.ctx.createBiquadFilter();
        this.delayFilter.type = 'lowpass';
        this.delayFilter.frequency.value = 1800; // Dampen delay high frequencies
        this.delayGain = this.ctx.createGain();
        this.delayGain.gain.value = 0.08; // Subtle delay wet mix

        // Connect FX feedback loop
        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayFilter);
        this.delayFilter.connect(this.delayNode);

        // Routing graph:
        // Input -> LowCut -> PresenceEQ -> Compressor -> Panner -> OutputGain -> Destination
        this.lowCut.connect(this.presenceEQ);
        this.presenceEQ.connect(this.compressor);
        this.compressor.connect(this.panner);
        this.panner.connect(this.outputGain);

        // Dry signal path splits to reverb and delay sends after compression:
        this.compressor.connect(this.reverbNode);
        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.outputGain);

        this.compressor.connect(this.delayNode);
        this.delayNode.connect(this.delayGain);
        this.delayGain.connect(this.outputGain);

        // Final Master Connection
        if (window.MOSKV && window.MOSKV.panner) {
            this.outputGain.connect(window.MOSKV.panner);
        } else {
            this.outputGain.connect(this.ctx.destination);
        }
        this.isReady = true;
    }

    /**
     * Generates a stereo warehouse room impulse response procedurally.
     * Prevents downloading heavy WAV files and ensures total signal purity.
     * @param {number} duration — time in seconds
     * @param {number} decay — decay speed coefficient
     * @returns {AudioBuffer}
     * @private
     */
    _generateWarehouseImpulseResponse(duration, decay) {
        const rate = this.ctx.sampleRate;
        const len = rate * duration;
        const buffer = this.ctx.createBuffer(2, len, rate);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < len; i++) {
            // Exponential decay envelope
            const pct = i / len;
            const decayEnvelope = Math.exp(-pct * decay);
            
            // Generate stereophonic split noise with micro-delays for width
            left[i] = (Math.random() * 2 - 1) * decayEnvelope;
            right[i] = (Math.random() * 2 - 1) * decayEnvelope * 0.85;
        }
        return buffer;
    }

    /**
     * Calculates delay time based on BPM (1/8 dotted delay for syncopation).
     * @returns {number}
     * @private
     */
    _calculateDelayTime() {
        const beatDuration = 60 / this.bpm;
        return beatDuration * 0.75; // 3/4 of a beat (dotted eighth note)
    }

    /**
     * Update tempo and dynamically adapt BPM-synced delay node.
     * @param {number} newBPM
     */
    setBPM(newBPM) {
        if (!newBPM || isNaN(newBPM)) return;
        this.bpm = newBPM;
        const targetDelay = this._calculateDelayTime();
        if (this.delayNode && this.ctx) {
            // Smoothly glide delay time over 500ms to avoid audio clicks
            this.delayNode.delayTime.setValueAtTime(this.delayNode.delayTime.value, this.ctx.currentTime);
            this.delayNode.delayTime.linearRampToValueAtTime(targetDelay, this.ctx.currentTime + 0.5);
        }
    }

    /**
     * Dynamically update the stereo field position (-1 = full left, 1 = full right).
     * @param {number} panValue
     */
    setPan(panValue) {
        if (this.panner && this.ctx) {
            const clamped = Math.max(-1, Math.min(1, panValue));
            this.panner.pan.setValueAtTime(clamped, this.ctx.currentTime);
        }
    }

    /**
     * Adjust dry-wet reverb mix.
     * @param {number} wetRatio — 0.0 to 1.0
     */
    setReverbWet(wetRatio) {
        if (this.reverbGain && this.ctx) {
            const val = Math.max(0, Math.min(1, wetRatio));
            this.reverbGain.gain.setValueAtTime(val * 0.35, this.ctx.currentTime); // Limit max reverb gain to 35%
        }
    }

    /**
     * Processes and plays a dry audio URL or Element through the pipeline.
     * @param {string|HTMLAudioElement} audioSource — URL path or HTML Audio object.
     * @returns {Promise<HTMLAudioElement>}
     */
    async processAndPlay(audioSource) {
        // Ensure AudioContext is running (browser autoplay lock bypass)
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }

        let audioEl;
        if (audioSource instanceof HTMLAudioElement) {
            audioEl = audioSource;
        } else {
            audioEl = new Audio(audioSource);
            audioEl.crossOrigin = "anonymous";
        }

        // Connect the media element source to our pipeline
        const source = this.ctx.createMediaElementSource(audioEl);
        source.connect(this.lowCut);

        // Play audio element
        await audioEl.play();
        return audioEl;
    }

    /**
     * Procedural Formant Vocal Synthesizer (Zero Phase Entropy, 24-bit Client-Side Dry Synth)
     * Synthesizes robotic speech by automating formant bandpass filters and carrier oscillators.
     * @param {string} text
     */
    speak(text) {
        if (!this.ctx) return;
        
        // Clean up any ongoing synthesis and pending timeouts
        this.stopSynthesis();

        // Resume context on user action if suspended
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const words = text.toLowerCase().split(/\s+/);
        let time = this.ctx.currentTime + 0.05;

        // Vowel formants table
        const formants = {
            'a': [730, 1090, 2440],
            'e': [530, 1840, 2480],
            'i': [270, 2290, 3010],
            'o': [570, 840, 2410],
            'u': [300, 870, 2240]
        };

        // Create carrier oscillator (vocal chords source)
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 82; // Low pitch (E2)

        const oscGain = this.ctx.createGain();
        oscGain.gain.value = 0;

        // Create sibilance/noise generator (consonants source)
        const noise = this.ctx.createBufferSource();
        noise.buffer = this._generateNoiseBuffer(0.5); // 0.5s white noise
        noise.loop = true;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.value = 0;

        // Create formant filters (three parallel bandpass filters)
        const f1 = this.ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 8;
        const f2 = this.ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 10;
        const f3 = this.ctx.createBiquadFilter(); f3.type = 'bandpass'; f3.Q.value = 10;

        // Connect sources to formant filters
        osc.connect(oscGain);
        oscGain.connect(f1); oscGain.connect(f2); oscGain.connect(f3);

        noise.connect(noiseGain);
        noiseGain.connect(f1); noiseGain.connect(f2); noiseGain.connect(f3);

        // Mix formants
        const vocalMix = this.ctx.createGain();
        vocalMix.gain.value = 0.3; // safe level
        f1.connect(vocalMix);
        f2.connect(vocalMix);
        f3.connect(vocalMix);

        // Connect vocal mixer into pipeline's first node
        vocalMix.connect(this.lowCut);

        // Store active sources for termination
        this.activeSynthSources = [osc, noise];

        // Start oscillators
        osc.start(time);
        noise.start(time);

        // Speech schedule loop
        words.forEach(word => {
            // Add a small pause between words
            time += 0.05;
            
            // Limit word processing length to prevent queue explosion
            const cleanWord = word.replace(/[^a-z]/g, '').substring(0, 10);
            if (!cleanWord) return;

            const charDuration = 0.075; // Speed of speaking (75ms per letter)
            
            for (let i = 0; i < cleanWord.length; i++) {
                const char = cleanWord[i];
                const end = time + charDuration;

                // Pitch modulation (gives human-like sentence intonation)
                const targetPitch = 82 + Math.sin(time * 3) * 6;
                osc.frequency.setValueAtTime(osc.frequency.value, time);
                osc.frequency.exponentialRampToValueAtTime(targetPitch, end);

                if (formants[char]) {
                    // VOICED SOUND (Vowel)
                    const [f1Freq, f2Freq, f3Freq] = formants[char];

                    oscGain.gain.setValueAtTime(oscGain.gain.value, time);
                    oscGain.gain.linearRampToValueAtTime(0.4, time + 0.01);
                    oscGain.gain.setValueAtTime(0.4, end - 0.01);
                    oscGain.gain.linearRampToValueAtTime(0, end);

                    noiseGain.gain.setValueAtTime(0, time);

                    // Formants transition
                    f1.frequency.setValueAtTime(f1.frequency.value, time);
                    f1.frequency.exponentialRampToValueAtTime(f1Freq, end);

                    f2.frequency.setValueAtTime(f2.frequency.value, time);
                    f2.frequency.exponentialRampToValueAtTime(f2Freq, end);

                    f3.frequency.setValueAtTime(f3.frequency.value, time);
                    f3.frequency.exponentialRampToValueAtTime(f3Freq, end);
                } else {
                    // UNVOICED SOUND (Consonant like s, f, t)
                    oscGain.gain.setValueAtTime(0, time);

                    noiseGain.gain.setValueAtTime(noiseGain.gain.value, time);
                    noiseGain.gain.linearRampToValueAtTime(0.18, time + 0.01);
                    noiseGain.gain.setValueAtTime(0.18, end - 0.01);
                    noiseGain.gain.linearRampToValueAtTime(0, end);

                    // Highpass noise formants for sibilance
                    f1.frequency.setValueAtTime(f1.frequency.value, time);
                    f1.frequency.exponentialRampToValueAtTime(4500, end);

                    f2.frequency.setValueAtTime(f2.frequency.value, time);
                    f2.frequency.exponentialRampToValueAtTime(6000, end);

                    f3.frequency.setValueAtTime(f3.frequency.value, time);
                    f3.frequency.exponentialRampToValueAtTime(7500, end);
                }

                time = end;
            }
        });

        // Stop sources at the end
        const endTime = time + 0.1;
        osc.stop(endTime);
        noise.stop(endTime);

        this._scheduleSuspend(endTime);
    }

    stopSynthesis() {
        if (this.activeSynthSources) {
            this.activeSynthSources.forEach(src => {
                try {
                    src.stop();
                } catch(e) {}
            });
            this.activeSynthSources = null;
        }
        if (this.suspendTimeout) {
            clearTimeout(this.suspendTimeout);
            this.suspendTimeout = null;
        }
    }

    _scheduleSuspend(endTime) {
        if (!this.isPrivateCtx) return;
        if (this.suspendTimeout) {
            clearTimeout(this.suspendTimeout);
        }
        const delay = (endTime - this.ctx.currentTime) * 1000 + 500; // 500ms safety tail
        if (delay > 0) {
            this.suspendTimeout = setTimeout(() => {
                if (this.ctx.state === 'running' && !this.activeSynthSources) {
                    this.ctx.suspend().then(() => {
                        console.log('Voice audio context suspended successfully to reclaim CPU cycles.');
                    });
                }
            }, delay);
        }
    }

    _generateNoiseBuffer(duration) {
        const rate = this.ctx.sampleRate;
        const len = rate * duration;
        const buffer = this.ctx.createBuffer(1, len, rate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < len; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }
}

window.MOSKV.VoiceEffectsPipeline = VoiceEffectsPipeline;
