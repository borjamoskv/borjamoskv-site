/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | JES-EXTENDER HEAVY MODULE
 * Real-time heavy industrial music generation engine.
 * ═══════════════════════════════════════════════════════════════════
 */

window.MOSKV = window.MOSKV || {};

MOSKV.jesExtender = (() => {
    'use strict';

    // --- Configuration ---
    const LOCAL_WS_URL = 'ws://localhost:8001/ws/generate';
    const SAMPLE_RATE = 24000;
    const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

    const getConfiguredWsUrl = () => {
        const runtime = globalThis.MOSKV_RUNTIME || globalThis.__BORJA_RUNTIME__ || null;
        const configured = runtime?.jesExtenderWsUrl;
        return typeof configured === 'string' && configured.trim() ? configured.trim() : null;
    };

    const resolveWsUrl = () => getConfiguredWsUrl()
        || (LOCAL_HOSTS.has(globalThis.location.hostname) ? LOCAL_WS_URL : null);

    // --- State ---
    let socket = null;
    let audioCtx = null;
    let nextStartTime = 0;
    let isPlaying = false;
    let scheduledNodes = [];
    let currentStatus = 'STANDBY';
    let statusTone = 'idle';
    let pendingAutoStart = false;
    
    // Nodes for effects
    let mainGain = null;
    let distortionNode = null;
    let reverbNode = null;
    let compressorNode = null;
    
    // --- UI Elements ---
    let ui = {
        window: null,
        promptPrimary: null,
        promptSecondary: null,
        morphSlider: null,
        summonBtn: null,
        stopBtn: null,
        statusText: null,
        visualizer: null,
        logContainer: null
    };

    const emitState = () => {
        document.dispatchEvent(new CustomEvent('jes-extender:state', {
            detail: {
                status: currentStatus,
                tone: statusTone,
                isPlaying,
                socketReadyState: socket ? socket.readyState : WebSocket.CLOSED,
                wsUrl: resolveWsUrl()
            }
        }));
    };

    const setStatus = (nextStatus, { color = '', shadow = '', tone = 'idle' } = {}) => {
        currentStatus = nextStatus;
        statusTone = tone;

        if (ui.statusText) {
            ui.statusText.textContent = `STATUS: ${nextStatus}`;
            ui.statusText.style.color = color;
            ui.statusText.style.textShadow = shadow;
        }

        emitState();
    };

    const log = (msg, type = 'info') => {
        if (!ui.logContainer) return;
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        ui.logContainer.prepend(entry);
        if (ui.logContainer.children.length > 20) {
            ui.logContainer.lastChild.remove();
        }
    };

    const initAudio = () => {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: SAMPLE_RATE
        });
        
        mainGain = audioCtx.createGain();
        mainGain.connect(audioCtx.destination);
        
        // Heavy Compressor for industrial sound
        compressorNode = audioCtx.createDynamicsCompressor();
        compressorNode.threshold.value = -24;
        compressorNode.knee.value = 10;
        compressorNode.ratio.value = 12;
        compressorNode.attack.value = 0.003;
        compressorNode.release.value = 0.1;
        compressorNode.connect(mainGain);

        // Extreme Distortion
        distortionNode = audioCtx.createWaveShaper();
        distortionNode.curve = makeDistortionCurve(150); // Heavier distortion
        distortionNode.oversample = '4x';
        
        // Industrial Reverb
        reverbNode = audioCtx.createDelay(1.0);
        reverbNode.delayTime.value = 0.05; // Short metallic delay
        
        distortionNode.connect(reverbNode);
        reverbNode.connect(compressorNode);
        
        nextStartTime = audioCtx.currentTime;
    };

    const makeDistortionCurve = (amount) => {
        const k = typeof amount === 'number' ? amount : 150;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    };

    const playChunk = (pcmData) => {
        if (!audioCtx || !isPlaying) return;

        const buffer = audioCtx.createBuffer(1, pcmData.length, SAMPLE_RATE);
        const channelData = buffer.getChannelData(0);
        
        // Convert Int16 to Float32
        for (let i = 0; i < pcmData.length; i++) {
            channelData[i] = pcmData[i] / 32768.0;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(distortionNode);

        const startTime = Math.max(nextStartTime, audioCtx.currentTime + 0.05);
        source.start(startTime);
        nextStartTime = startTime + buffer.duration;
        
        scheduledNodes.push(source);
        
        // Cleanup old nodes
        if (scheduledNodes.length > 50) {
            scheduledNodes.shift();
        }
    };

    const connect = () => {
        if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) {
            return;
        }
        if (!ui.statusText) return;
        
        const wsUrl = resolveWsUrl();
        if (!wsUrl) {
            pendingAutoStart = false;
            log('Jes-Extender funciona en modo local opcional. No hay bridge configurado en este entorno.', 'warn');
            setStatus('LOCAL ONLY', {
                color: 'rgba(255, 196, 85, 0.92)',
                shadow: '0 0 10px rgba(255, 196, 85, 0.35)',
                tone: 'idle'
            });
            return;
        }

        setStatus('CONNECTING', {
            color: 'rgba(255, 196, 85, 0.92)',
            shadow: '0 0 10px rgba(255, 196, 85, 0.45)',
            tone: 'connecting'
        });
        
        socket = new WebSocket(wsUrl);
        socket.binaryType = 'arraybuffer';

        socket.onopen = () => {
            log('Connected to Jes-Extender Engine', 'success');
            setStatus('CONNECTED', {
                color: 'var(--accent-red)',
                shadow: '0 0 10px var(--accent-red)',
                tone: 'connected'
            });

            if (pendingAutoStart) {
                pendingAutoStart = false;
                startGeneration();
            }
        };

        socket.onmessage = (event) => {
            if (typeof event.data === 'string') {
                const msg = JSON.parse(event.data);
                if (msg.type === 'status') {
                    log(`Extender: ${msg.message}`);
                }
            } else {
                // Binary PCM data
                const pcmData = new Int16Array(event.data);
                playChunk(pcmData);
            }
        };

        socket.onclose = () => {
            log('Disconnected from Jes-Extender', 'warn');
            const wasPlaying = isPlaying;
            const nextStatus = currentStatus === 'ENGINE OFFLINE'
                ? 'ENGINE OFFLINE'
                : (wasPlaying ? 'ENGINE OFFLINE' : 'DISCONNECTED');
            socket = null;
            pendingAutoStart = false;
            stopGeneration({
                nextStatus,
                releaseFocus: wasPlaying
            });
        };

        socket.onerror = (err) => {
            log('Connection Error', 'error');
            setStatus('ENGINE OFFLINE', {
                color: '#ff8f73',
                shadow: '0 0 12px rgba(255, 143, 115, 0.42)',
                tone: 'offline'
            });
            console.error(err);
        };
    };

    const startGeneration = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            pendingAutoStart = true;
            connect();
            return;
        }

        initAudio();
        isPlaying = true;
        pendingAutoStart = false;
        nextStartTime = audioCtx.currentTime;
        if (ui.stopBtn) ui.stopBtn.disabled = false;
        if (ui.summonBtn) ui.summonBtn.disabled = true;
        setStatus('EXTRACTING', {
            color: 'var(--accent-red)',
            shadow: '0 0 10px var(--accent-red)',
            tone: 'active'
        });
        
        const payload = {
            prompt: ui.promptPrimary.value || 'industrial techno heavy',
            prompt_secondary: ui.promptSecondary.value || 'distorted bass',
            morph_weight: parseFloat(ui.morphSlider.value)
        };

        socket.send(JSON.stringify(payload));
        log('Extracting dense sonic matters...', 'info');
        
        globalThis.jesActive = true;
        globalThis.MOSKV?.audioFocus?.claim?.('jes', {
            reason: 'jes-start',
            resume: false
        });
    };

    const stopGeneration = ({ releaseFocus = true, nextStatus = 'STANDBY' } = {}) => {
        isPlaying = false;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'stop' }));
        }
        
        scheduledNodes.forEach(node => {
            try { node.stop(); } catch(e) {}
        });
        scheduledNodes = [];
        
        log('Extraction halted.', 'info');
        if (ui.stopBtn) ui.stopBtn.disabled = true;
        if (ui.summonBtn) ui.summonBtn.disabled = false;
        if (nextStatus === 'ENGINE OFFLINE') {
            setStatus(nextStatus, {
                color: '#ff8f73',
                shadow: '0 0 12px rgba(255, 143, 115, 0.42)',
                tone: 'offline'
            });
        } else if (nextStatus === 'DISCONNECTED') {
            setStatus(nextStatus, {
                color: 'rgba(255, 196, 85, 0.92)',
                shadow: '0 0 10px rgba(255, 196, 85, 0.35)',
                tone: 'disconnected'
            });
        } else {
            setStatus(nextStatus, {
                color: '',
                shadow: '',
                tone: 'idle'
            });
        }
        
        globalThis.jesActive = false;
        if (releaseFocus) {
            globalThis.MOSKV?.audioFocus?.release?.('jes', {
                reason: 'jes-stop'
            });
        }
    };

    const init = () => {
        ui.window = document.getElementById('jes-extender-window');
        if (!ui.window) return;

        ui.promptPrimary = document.getElementById('jes-extender-prompt');
        ui.promptSecondary = document.getElementById('jes-extender-prompt-secondary');
        ui.morphSlider = document.getElementById('jes-extender-weight');
        ui.summonBtn = document.getElementById('jes-extender-summon');
        ui.stopBtn = document.getElementById('jes-extender-stop');
        ui.statusText = document.getElementById('jes-extender-status');
        ui.logContainer = ui.window.querySelector('.jes-log'); // We will add jes-log class to CSS if not available

        if (!ui.promptPrimary || !ui.promptSecondary || !ui.morphSlider || !ui.summonBtn || !ui.stopBtn || !ui.statusText) {
            return;
        }

        setStatus(currentStatus, { tone: statusTone });

        ui.summonBtn.addEventListener('click', startGeneration);
        ui.stopBtn.addEventListener('click', stopGeneration);

        const weightValue = document.getElementById('jes-extender-weight-val');
        ui.morphSlider.addEventListener('input', (e) => {
            if (weightValue) {
                weightValue.textContent = `${e.target.value}%`;
            }
            if (socket && socket.readyState === WebSocket.OPEN && isPlaying) {
                socket.send(JSON.stringify({
                    type: 'update',
                    morph_weight: parseFloat(e.target.value)
                }));
            }
        });

        const card = document.getElementById('jes-extender-lab-trigger');
        if (card) {
            card.addEventListener('click', (event) => {
                event.preventDefault();
                ui.window.style.display = 'block';
                // Bring to front
                document.querySelectorAll('.drag-window').forEach(w => w.style.zIndex = 10);
                ui.window.style.zIndex = 20;
            });
        }
        
        log('Jes-Extender Heavy Module Initialized', 'info');
    };

    globalThis.MOSKV?.audioFocus?.register?.('jes', {
        resume: () => {},
        suspend: () => {
            if (isPlaying) stopGeneration({ releaseFocus: false });
        },
        restorable: false
    });

    return {
        init,
        start: startGeneration,
        stop: stopGeneration,
        connect,
        getState: () => ({
            status: currentStatus,
            tone: statusTone,
            isPlaying,
            socketReadyState: socket ? socket.readyState : WebSocket.CLOSED
        }),
        getWsUrl: () => resolveWsUrl()
    };
})();

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    if (MOSKV.jesExtender) MOSKV.jesExtender.init();
});
