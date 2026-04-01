/**
 * AutoDJ Engine - Adaptación del dj-studio local para web
 * Maneja dos decks virtuales con Web Audio API para crossfades perfectos
 */
class AutoDJEngine {
    constructor() {
        this.audioContext = null;
        this.decks = {
            A: { gain: null, filter: null, analyser: null, source: null, bpm: 128, playing: false },
            B: { gain: null, filter: null, analyser: null, source: null, bpm: 128, playing: false }
        };
        this.activeDeck = 'A';
        this.energy = 0.0;
        this.crossfadeTime = 4; // segundos para transición suave
        this.isTransitioning = false;
        
        // Playlist de audio (ejemplos - sustituir por tus URLs)
        this.audioPlaylist = [
            { url: '/audio/track1.mp3', bpm: 128, key: 'Am' },
            { url: '/audio/track2.mp3', bpm: 126, key: 'Fm' },
            { url: '/audio/track3.mp3', bpm: 130, key: 'Dm' }
        ];
        this.currentTrackIndex = 0;
    }

    async init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Crear nodos de ganancia para cada deck (volumen)
        this.decks.A.gain = this.audioContext.createGain();
        this.decks.B.gain = this.audioContext.createGain();
        
        // Crear filtros Isolator (HPF)
        this.decks.A.filter = this.audioContext.createBiquadFilter();
        this.decks.A.filter.type = 'highpass';
        this.decks.A.filter.frequency.value = 20; // Plano inicial
        this.decks.B.filter = this.audioContext.createBiquadFilter();
        this.decks.B.filter.type = 'highpass';
        this.decks.B.filter.frequency.value = 20;
        
        // Analizadores para visualización RMS
        this.decks.A.analyser = this.audioContext.createAnalyser();
        this.decks.B.analyser = this.audioContext.createAnalyser();
        this.decks.A.analyser.fftSize = 256;
        this.decks.B.analyser.fftSize = 256;
        
        // Cadena: Filter -> Gain -> Analyser -> Destination
        this.decks.A.filter.connect(this.decks.A.gain);
        this.decks.B.filter.connect(this.decks.B.gain);
        
        this.decks.A.gain.connect(this.decks.A.analyser).connect(this.audioContext.destination);
        this.decks.B.gain.connect(this.decks.B.analyser).connect(this.audioContext.destination);
        
        // Inicialmente Deck A al 100%, Deck B al 0%
        this.decks.A.gain.gain.value = 1;
        this.decks.B.gain.gain.value = 0;
        
        // Arrancar Reactor de Energía
        this._startEnergyLoop();
        
        console.log('AutoDJ Engine inicializado');
    }

    async loadTrack(deck, trackUrl) {
        try {
            const response = await fetch(trackUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Detener reproducción anterior si existe
            if (this.decks[deck].source) {
                this.decks[deck].source.stop();
            }
            
            // Crear nuevo source
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true; // Loop para transiciones continuas
            
            // Conectar al filter del deck
            source.connect(this.decks[deck].filter);
            this.decks[deck].source = source;
            this.decks[deck].buffer = audioBuffer;
            
            return audioBuffer.duration;
        } catch (error) {
            console.error(`Error cargando track en Deck ${deck}:`, error);
            return null;
        }
    }

    playDeck(deck, offset = 0) {
        if (this.decks[deck].source) {
            this.decks[deck].source.start(0, offset);
            this.decks[deck].playing = true;
        }
    }

    /**
     * Transición suave entre decks (Crossfade)
     * Sincroniza exactamente con la transición de video
     */
    async crossfade() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        const nextDeck = this.activeDeck === 'A' ? 'B' : 'A';
        const currentDeck = this.activeDeck;
        
        // Cargar siguiente track si no está cargado
        if (!this.decks[nextDeck].buffer) {
            const nextTrack = this.audioPlaylist[this.currentTrackIndex + 1] || this.audioPlaylist[0];
            await this.loadTrack(nextDeck, nextTrack.url);
        }
        
        // Iniciar reproducción del deck entrante (silenciado inicialmente)
        this.playDeck(nextDeck);
        this.decks[nextDeck].gain.gain.value = 0;
        
        const now = this.audioContext.currentTime;
        const fadeTime = this.crossfadeTime;
        
        // Equal Power Crossfade Curve (Trigonometric DJ standard)
        // No loss of volume in the middle of the transition
        const curveLength = 4096;
        const curveA = new Float32Array(curveLength);
        const curveB = new Float32Array(curveLength);
        
        for (let i = 0; i < curveLength; i++) {
            const t = i / (curveLength - 1);
            // Deck A fades out using cos(t * pi/2)
            curveA[i] = Math.cos(t * 0.5 * Math.PI);
            // Deck B fades in using cos((1-t) * pi/2)
            curveB[i] = Math.cos((1.0 - t) * 0.5 * Math.PI);
        }
        
        this.decks[currentDeck].gain.gain.setValueCurveAtTime(curveA, now, fadeTime);
        this.decks[nextDeck].gain.gain.setValueCurveAtTime(curveB, now, fadeTime);
        
        // [ISOLATOR EQ]: Matar graves (Low Kill) del track saliente (20Hz -> 2000Hz)
        try {
            this.decks[currentDeck].filter.frequency.setValueAtTime(20, now);
            this.decks[currentDeck].filter.frequency.exponentialRampToValueAtTime(2000, now + fadeTime);
        } catch(e) { /* fallback if already scheduled */ }
        
        // Asegurarnos que el incoming track entra plano (full graves)
        try {
            this.decks[nextDeck].filter.frequency.cancelScheduledValues(now);
            this.decks[nextDeck].filter.frequency.setValueAtTime(20, now);
        } catch (e) {}
        
        // Actualizar deck activo después de la transición
        setTimeout(() => {
            this.activeDeck = nextDeck;
            this.isTransitioning = false;
            
            // Detener y resetear deck anterior para próximo uso
            setTimeout(() => {
                if (this.decks[currentDeck].source) {
                    this.decks[currentDeck].source.stop();
                    this.decks[currentDeck].playing = false;
                }
                // Resetear el filtro para la próxima vez que se use este deck
                try {
                    this.decks[currentDeck].filter.frequency.setValueAtTime(20, this.audioContext.currentTime);
                } catch(e) {}
            }, 1000);
            
        }, fadeTime * 1000);
        
        return { from: currentDeck, to: nextDeck, duration: fadeTime };
    }

    // Análisis básico de BPM (placeholder para tu lógica actual de dj-studio)
    analyzeBPM(audioBuffer) {
        // Aquí integrarías tu algoritmo actual de análisis de BPM
        // Por ahora retorna valor mock o el de la playlist
        return 128;
    }

    // Obtener datos de frecuencia para visualizadores
    getFrequencyData(deck) {
        const analyser = this.decks[deck].analyser;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }

    getVolume(deck) {
        return this.decks[deck].gain.gain.value;
    }
    
    // ═══ EFECTOS KINÉTICOS Y DJ ═══
    
    /** Vinyl Tape Stop dramático (bomba de vacío) */
    tapeStop(deck) {
        const d = deck || this.activeDeck;
        if (!this.decks[d].source || !this.decks[d].playing) return;
        
        const now = this.audioContext.currentTime;
        const param = this.decks[d].source.playbackRate;
        try {
            param.setValueAtTime(param.value, now);
            // Caída exponencial de velocidad (pitch) simulando frenada de disco
            param.exponentialRampToValueAtTime(0.01, now + 0.6); 
            setTimeout(() => {
                this.decks[d].source.stop();
                this.decks[d].playing = false;
            }, 600);
        } catch (e) { console.error("Vinyl stop failed", e); }
    }
    
    /** Reactor de Energía Constante (O(1) RMS loop) */
    _startEnergyLoop() {
        const loop = () => {
            if (!this.audioContext || this.audioContext.state === 'suspended') {
                requestAnimationFrame(loop);
                return;
            }
            
            // Array prealocado para performance (fftSize 256 = 128 bins de salida)
            if (!this._dataArray) this._dataArray = new Uint8Array(128); 
            
            const analyser = this.decks[this.activeDeck].analyser;
            if (analyser && this.decks[this.activeDeck].playing) {
                analyser.getByteFrequencyData(this._dataArray);
                
                // Calcular RMS de las frecuencias graves (bins 0 a 10) para extraer el bombo/bassline
                let sum = 0;
                const NUM_BASS_BINS = 10;
                for (let i = 0; i < NUM_BASS_BINS; i++) {
                    // Normalize to 0.0-1.0 and square
                    const val = this._dataArray[i] / 255.0; 
                    sum += val * val;
                }
                const rms = Math.sqrt(sum / NUM_BASS_BINS);
                
                // Suavizar la energía (decay factor para no tironear)
                this.energy = (this.energy * 0.7) + (rms * 0.3);
            } else {
                this.energy = this.energy * 0.9; // decay a 0
            }
            // Evitar oscilaciones ínfimas
            if (this.energy < 0.01) this.energy = 0;
            
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

// Exportar para uso global
window.AutoDJEngine = AutoDJEngine;
window.audioDJCore = new AutoDJEngine(); // Singleton para el Muro Cinético
