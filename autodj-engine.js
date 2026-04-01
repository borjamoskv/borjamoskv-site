/**
 * AutoDJ Engine - Adaptación del dj-studio local para web
 * Maneja dos decks virtuales con Web Audio API para crossfades perfectos
 */
class AutoDJEngine {
    constructor() {
        this.audioContext = null;
        this.decks = {
            A: { gain: null, analyser: null, source: null, bpm: 128, playing: false },
            B: { gain: null, analyser: null, source: null, bpm: 128, playing: false }
        };
        this.activeDeck = 'A';
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
        
        // Analizadores para visualización/VU meters (opcional)
        this.decks.A.analyser = this.audioContext.createAnalyser();
        this.decks.B.analyser = this.audioContext.createAnalyser();
        
        // Conectar: Gain -> Analyser -> Destination (altavoces)
        this.decks.A.gain.connect(this.decks.A.analyser).connect(this.audioContext.destination);
        this.decks.B.gain.connect(this.decks.B.analyser).connect(this.audioContext.destination);
        
        // Inicialmente Deck A al 100%, Deck B al 0%
        this.decks.A.gain.gain.value = 1;
        this.decks.B.gain.gain.value = 0;
        
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
            
            // Conectar al gain del deck
            source.connect(this.decks[deck].gain);
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
}

// Exportar para uso global
window.AutoDJEngine = AutoDJEngine;
