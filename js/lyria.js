/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | LYRIA REALTIME MODULE
 * Real-time music generation via Google Lyria.
 * ═══════════════════════════════════════════════════════════════════
 */

window.MOSKV = window.MOSKV || {};

MOSKV.lyria = (() => {
    'use strict';

    // --- Configuration ---
    const LOCAL_WS_URL = 'ws://localhost:8000/ws/generate';
    const SAMPLE_RATE = 24000; // Lyria default
    const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

    const getConfiguredWsUrl = () => {
        const runtime = globalThis.MOSKV_RUNTIME || globalThis.__BORJA_RUNTIME__ || null;
        const configured = runtime?.lyriaWsUrl;
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
    
    // Nodes for effects
    let mainGain = null;
    let distortionNode = null;
    let reverbNode = null;
    
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
        
        // Distortion
        distortionNode = audioCtx.createWaveShaper();
        distortionNode.curve = makeDistortionCurve(0);
        distortionNode.oversample = '4x';
        
        // Reverb placeholder (simple delay for now, can be expanded)
        reverbNode = audioCtx.createDelay(1.0);
        reverbNode.delayTime.value = 0;
        
        distortionNode.connect(reverbNode);
        reverbNode.connect(mainGain);
        
        nextStartTime = audioCtx.currentTime;
    };

    const makeDistortionCurve = (amount) => {
        const k = typeof amount === 'number' ? amount : 50;
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
        if (!ui.statusText) return;
        if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) {
            return;
        }

        const wsUrl = resolveWsUrl();
        if (!wsUrl) {
            log('Lyria queda en modo local opcional. No hay engine configurado para este entorno.', 'warn');
            ui.statusText.textContent = 'STATUS: LOCAL ONLY';
            ui.statusText.classList.remove('neon-green');
            return;
        }
        
        socket = new WebSocket(wsUrl);
        socket.binaryType = 'arraybuffer';

        socket.onopen = () => {
            log('Connected to Lyria Neural Engine', 'success');
            ui.statusText.textContent = 'STATUS: CONNECTED';
            ui.statusText.classList.add('neon-green');
        };

        socket.onmessage = (event) => {
            if (typeof event.data === 'string') {
                const msg = JSON.parse(event.data);
                if (msg.type === 'status') {
                    log(`Lyria: ${msg.message}`);
                }
            } else {
                // Binary PCM data
                const pcmData = new Int16Array(event.data);
                playChunk(pcmData);
            }
        };

        socket.onclose = () => {
            log('Disconnected from Lyria', 'warn');
            ui.statusText.textContent = 'STATUS: DISCONNECTED';
            ui.statusText.classList.remove('neon-green');
            stopGeneration();
        };

        socket.onerror = (err) => {
            log('Connection Error', 'error');
            console.error(err);
        };
    };

    const startGeneration = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            connect();
            if (!socket || socket.readyState !== WebSocket.CONNECTING) {
                return;
            }
            setTimeout(startGeneration, 500);
            return;
        }

        initAudio();
        isPlaying = true;
        nextStartTime = audioCtx.currentTime;
        if (ui.stopBtn) ui.stopBtn.disabled = false;
        if (ui.summonBtn) ui.summonBtn.disabled = true;
        if (ui.statusText) ui.statusText.textContent = 'STATUS: SUMMONING';
        
        const payload = {
            prompt: ui.promptPrimary.value || 'atmospheric industrial drone',
            prompt_secondary: ui.promptSecondary.value || 'cybernetic pulses',
            morph_weight: parseFloat(ui.morphSlider.value)
        };

        socket.send(JSON.stringify(payload));
        log('Summoning sonic artifacts...', 'info');
        
        // Notify sovereign audio to duck
        globalThis.lyriaActive = true;
        globalThis.MOSKV?.audioFocus?.claim?.('lyria', {
            reason: 'lyria-start',
            resume: false
        });
    };

    const stopGeneration = ({ releaseFocus = true } = {}) => {
        isPlaying = false;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'stop' }));
        }
        
        scheduledNodes.forEach(node => {
            try { node.stop(); } catch(e) {}
        });
        scheduledNodes = [];
        
        log('Session terminated.', 'info');
        if (ui.stopBtn) ui.stopBtn.disabled = true;
        if (ui.summonBtn) ui.summonBtn.disabled = false;
        if (ui.statusText) {
            ui.statusText.textContent = 'STATUS: STANDBY';
            ui.statusText.classList.remove('neon-green');
        }
        
        // Restore sovereign audio
        globalThis.lyriaActive = false;
        if (releaseFocus) {
            globalThis.MOSKV?.audioFocus?.release?.('lyria', {
                reason: 'lyria-stop'
            });
        }
    };

    const init = () => {
        ui.window = document.getElementById('lyria-window');
        if (!ui.window) return;

        ui.promptPrimary = document.getElementById('lyria-prompt');
        ui.promptSecondary = document.getElementById('lyria-prompt-secondary');
        ui.morphSlider = document.getElementById('lyria-weight');
        ui.summonBtn = document.getElementById('lyria-summon');
        ui.stopBtn = document.getElementById('lyria-stop');
        ui.statusText = document.getElementById('lyria-status');
        ui.logContainer = ui.window.querySelector('.lyria-log');

        if (!ui.promptPrimary || !ui.promptSecondary || !ui.morphSlider || !ui.summonBtn || !ui.stopBtn || !ui.statusText) {
            return;
        }

        ui.summonBtn.addEventListener('click', startGeneration);
        ui.stopBtn.addEventListener('click', stopGeneration);

        const weightValue = document.getElementById('lyria-weight-val');
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

        const card = document.getElementById('lyria-lab-trigger');
        if (card) {
            card.addEventListener('click', (event) => {
                event.preventDefault();
                ui.window.style.display = 'block';
                // Bring to front
                document.querySelectorAll('.drag-window').forEach(w => w.style.zIndex = 10);
                ui.window.style.zIndex = 20;
            });
        }
        
        log('Lyria Module Initialized', 'info');
    };

    globalThis.MOSKV?.audioFocus?.register?.('lyria', {
        resume: () => {},
        suspend: () => {
            if (isPlaying) stopGeneration({ releaseFocus: false });
        },
        restorable: false
    });

    return { init, stop: stopGeneration };
})();

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    if (MOSKV.lyria) MOSKV.lyria.init();
});
