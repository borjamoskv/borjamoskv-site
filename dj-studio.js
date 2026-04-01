/**
 * CORTEX DJ STUDIO — TRUE DJ MODE
 * Wired to REAL Web Audio API pipeline from AutoDJ engine
 * Real-time waveforms from analyser nodes. Real EQ/Filter/Crossfade.
 * Toggle: [D] key
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

let visible = false;
let overlay = null;
let animFrame = null;

function getDJ() { return window.djAesthetic; }

function createStudio() {
    overlay = document.createElement('div');
    overlay.id = 'dj-studio';
    overlay.className = 'dj-studio';
    overlay.innerHTML = `
        <div class="djs-header">
            <span class="djs-title">MOSKV-1 DJ STUDIO</span>
            <span class="djs-status" id="djs-mix-status">STANDBY</span>
            <span class="djs-close">[ESC] / [D]</span>
        </div>
        <div class="djs-body">
            <div class="djs-deck" id="djs-deck-a">
                <div class="djs-deck-header">
                    <span class="djs-deck-label">DECK A</span>
                    <span class="djs-deck-track" id="djs-track-a">—</span>
                    <span class="djs-deck-status" id="djs-status-a">●</span>
                </div>
                <canvas class="djs-waveform" id="djs-wave-a" height="80"></canvas>
                <div class="djs-eq">
                    <label>LOW<input type="range" min="-24" max="12" value="0" class="djs-knob" data-eq="low" data-deck="a"></label>
                    <label>MID<input type="range" min="-24" max="12" value="0" class="djs-knob" data-eq="mid" data-deck="a"></label>
                    <label>HIGH<input type="range" min="-24" max="12" value="0" class="djs-knob" data-eq="high" data-deck="a"></label>
                    <label>HPF<input type="range" min="0" max="4000" value="0" class="djs-knob" data-eq="hpf" data-deck="a"></label>
                </div>
                <div class="djs-controls">
                    <button class="djs-btn" id="djs-echo-a">ECHO OFF</button>
                    <button class="djs-btn djs-btn-kill" id="djs-kill-a">KILL EQ</button>
                </div>
            </div>

            <div class="djs-mixer">
                <div class="djs-camelot">
                    <span class="djs-camelot-label">HARMONIC</span>
                    <span class="djs-camelot-val" id="djs-camelot">—</span>
                </div>
                <div class="djs-master-vu">
                    <canvas id="djs-vu-master" width="80" height="200"></canvas>
                </div>
                <div class="djs-xfader-wrap">
                    <span>A</span>
                    <input type="range" min="0" max="100" value="50" class="djs-xfader" id="djs-xfader">
                    <span>B</span>
                </div>
                <button class="djs-btn djs-btn-master" id="djs-washout">◉ WASH OUT</button>
                <button class="djs-btn" id="djs-random">⚡ RANDOM MIX</button>
                <div class="djs-bpm-display">
                    <span class="djs-bpm-label">BPM</span>
                    <span class="djs-bpm-val" id="djs-bpm">125.0</span>
                </div>
                <div class="djs-phase-display">
                    <span id="djs-phase">WARMUP</span>
                </div>
            </div>

            <div class="djs-deck" id="djs-deck-b">
                <div class="djs-deck-header">
                    <span class="djs-deck-label">DECK B</span>
                    <span class="djs-deck-track" id="djs-track-b">—</span>
                    <span class="djs-deck-status" id="djs-status-b">●</span>
                </div>
                <canvas class="djs-waveform" id="djs-wave-b" height="80"></canvas>
                <div class="djs-eq">
                    <label>LOW<input type="range" min="-24" max="12" value="0" class="djs-knob" data-eq="low" data-deck="b"></label>
                    <label>MID<input type="range" min="-24" max="12" value="0" class="djs-knob" data-eq="mid" data-deck="b"></label>
                    <label>HIGH<input type="range" min="-24" max="12" value="0" class="djs-knob" data-eq="high" data-deck="b"></label>
                    <label>HPF<input type="range" min="0" max="4000" value="0" class="djs-knob" data-eq="hpf" data-deck="b"></label>
                </div>
                <div class="djs-controls">
                    <button class="djs-btn" id="djs-echo-b">ECHO OFF</button>
                    <button class="djs-btn djs-btn-kill" id="djs-kill-b">KILL EQ</button>
                </div>
            </div>
        </div>
        <div class="djs-footer">
            <span class="djs-slogan">EL ARTE NO TE DEBE NADA</span>
        </div>
    `;
    document.body.appendChild(overlay);

    // ═══ WIRE EQ KNOBS TO REAL AUDIO NODES ═══
    overlay.querySelectorAll('.djs-knob').forEach(knob => {
        knob.addEventListener('input', (e) => {
            const dj = getDJ();
            if (!dj || !dj.audioContext) return;
            const deck = e.target.dataset.deck;
            const band = e.target.dataset.eq;
            const val = parseFloat(e.target.value);
            const eq = deck === 'a' ? dj.eqA : dj.eqB;
            if (!eq) return;

            if (band === 'hpf') {
                eq.hpf.frequency.linearRampToValueAtTime(val, dj.audioContext.currentTime + 0.05);
            } else {
                eq[band].gain.linearRampToValueAtTime(val, dj.audioContext.currentTime + 0.05);
            }
        });
    });

    // ═══ CROSSFADER → REAL GAIN ═══
    document.getElementById('djs-xfader').addEventListener('input', (e) => {
        const dj = getDJ();
        if (!dj || !dj.audioContext) return;
        const val = parseInt(e.target.value) / 100; // 0=A, 1=B
        // Equal power crossfade
        const gainA = Math.cos(val * Math.PI / 2);
        const gainB = Math.sin(val * Math.PI / 2);
        dj.gainA.gain.linearRampToValueAtTime(gainA, dj.audioContext.currentTime + 0.05);
        dj.gainB.gain.linearRampToValueAtTime(gainB, dj.audioContext.currentTime + 0.05);
    });

    // ═══ WASH OUT → REAL CROSSFADE ═══
    document.getElementById('djs-washout').addEventListener('click', () => {
        const dj = getDJ();
        if (dj && dj._crossfadeNow) {
            dj._crossfadeNow();
            flash('#2B3BE5');
            if ('vibrate' in navigator) navigator.vibrate([30, 50, 30, 50, 100]);
            if (window.MOSKV_ARCADE) window.MOSKV_ARCADE.onTransition();
        }
    });

    // ═══ RANDOM MIX ═══
    document.getElementById('djs-random').addEventListener('click', () => {
        const dj = getDJ();
        if (dj && dj.mixSequence) {
            const seq = dj.mixSequence;
            for (let i = seq.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [seq[i], seq[j]] = [seq[j], seq[i]];
            }
            if (dj._crossfadeNow) dj._crossfadeNow();
            flash('#D4620A');
        }
    });

    // ═══ ECHO SEND TOGGLE ═══
    ['a', 'b'].forEach(deck => {
        let echoOn = false;
        document.getElementById(`djs-echo-${deck}`).addEventListener('click', (e) => {
            const dj = getDJ();
            if (!dj || !dj.audioContext) return;
            echoOn = !echoOn;
            const aux = deck === 'a' ? dj.auxA : dj.auxB;
            if (aux) {
                aux.gain.linearRampToValueAtTime(echoOn ? 0.4 : 0, dj.audioContext.currentTime + 0.1);
            }
            e.target.textContent = echoOn ? 'ECHO ON' : 'ECHO OFF';
            e.target.classList.toggle('djs-btn-active', echoOn);
            flash(echoOn ? '#2B3BE5' : '#333');
        });

        // ═══ KILL EQ ═══
        document.getElementById(`djs-kill-${deck}`).addEventListener('click', () => {
            const dj = getDJ();
            if (!dj || !dj.audioContext) return;
            const eq = deck === 'a' ? dj.eqA : dj.eqB;
            if (!eq) return;
            const now = dj.audioContext.currentTime;
            eq.low.gain.linearRampToValueAtTime(-24, now + 0.05);
            eq.mid.gain.linearRampToValueAtTime(-24, now + 0.05);
            eq.high.gain.linearRampToValueAtTime(-24, now + 0.05);
            // Reset knobs
            overlay.querySelectorAll(`.djs-knob[data-deck="${deck}"]`).forEach(k => {
                if (k.dataset.eq !== 'hpf') k.value = -24;
            });
            flash('#ff0022');
            // Restore after 2s
            setTimeout(() => {
                const now2 = dj.audioContext.currentTime;
                eq.low.gain.linearRampToValueAtTime(0, now2 + 0.5);
                eq.mid.gain.linearRampToValueAtTime(0, now2 + 0.5);
                eq.high.gain.linearRampToValueAtTime(0, now2 + 0.5);
                overlay.querySelectorAll(`.djs-knob[data-deck="${deck}"]`).forEach(k => {
                    if (k.dataset.eq !== 'hpf') k.value = 0;
                });
            }, 2000);
        });
    });
}

// ═══ REAL-TIME WAVEFORM FROM ANALYSER ═══
function drawRealWaveform(canvasId, analyser, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(43, 59, 229, 0.08)';
    ctx.lineWidth = 0.5;
    for (let y = 0; y < H; y += 10) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(43, 59, 229, 0.05)';
    for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }

    if (analyser && analyser.frequencyBinCount) {
        const bufLen = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufLen);
        analyser.getByteTimeDomainData(dataArray);

        // Time-domain waveform
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 6;
        ctx.shadowColor = color;
        ctx.beginPath();
        const sliceW = W / bufLen;
        for (let i = 0; i < bufLen; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * (H / 2);
            i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * sliceW, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Fill
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
        ctx.fillStyle = color.replace('1)', '0.04)');
        ctx.fill();
    } else {
        // Idle state — flat line
        ctx.strokeStyle = 'rgba(43, 59, 229, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
    }
}

// ═══ REAL VU METER ═══
function drawVU() {
    const canvas = document.getElementById('djs-vu-master');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const dj = getDJ();
    const analyser = dj ? dj.analyser : null;
    let dataArray = null;

    if (analyser && analyser.frequencyBinCount) {
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
    }

    const barCount = 24;
    const barH = (H / barCount) - 1;
    for (let i = 0; i < barCount; i++) {
        const val = dataArray
            ? dataArray[Math.floor(i * dataArray.length / barCount)] / 255
            : 0;
        const barW = val * W;
        const y = H - (i + 1) * (barH + 1);
        // Color gradient: blue bottom, orange mid, red top
        const hue = i > 20 ? 0 : (i > 16 ? 30 : 230);
        ctx.fillStyle = `hsla(${hue}, 60%, ${45 + val * 35}%, ${0.4 + val * 0.6})`;
        ctx.fillRect(0, y, barW, barH);
    }
}

function updateInfo() {
    const dj = getDJ();
    if (!dj) return;

    const bpmEl = document.getElementById('djs-bpm');
    const phaseEl = document.getElementById('djs-phase');
    const statusEl = document.getElementById('djs-mix-status');
    const camelotEl = document.getElementById('djs-camelot');
    const statusA = document.getElementById('djs-status-a');
    const statusB = document.getElementById('djs-status-b');
    const trackA = document.getElementById('djs-track-a');
    const trackB = document.getElementById('djs-track-b');

    if (bpmEl) bpmEl.textContent = (dj.masterBPM || 125).toFixed(1);
    if (phaseEl) phaseEl.textContent = (dj.energyPhase || 'WARMUP').toUpperCase();
    if (statusEl) statusEl.textContent = dj.globalMuted ? 'MUTED' : (dj.isCrossfading ? 'CROSSFADING' : 'LIVE');

    // Active deck highlight
    if (statusA) statusA.style.color = dj.activeDeck === 'a' ? '#2B3BE5' : '#555';
    if (statusB) statusB.style.color = dj.activeDeck === 'b' ? '#2B3BE5' : '#555';

    // Track names from DATA
    if (window.DATA && window.DATA.works) {
        const currentId = dj.currentTrackId || dj.mixSequence?.[0];
        const nextId = dj.mixSequence?.[1];
        if (currentId && trackA) {
            const w = window.DATA.works.find(v => v.id === currentId);
            if (w) trackA.textContent = w.title;
        }
        if (nextId && trackB) {
            const w = window.DATA.works.find(v => v.id === nextId);
            if (w) trackB.textContent = w.title;
        }
        // Camelot
        if (camelotEl && currentId) {
            const key = dj.keyCache?.[currentId] || '?';
            camelotEl.textContent = key;
        }
    }
}

function renderLoop() {
    if (!visible) return;

    const dj = getDJ();
    // Resize canvases on first frame
    ['djs-wave-a', 'djs-wave-b'].forEach(id => {
        const c = document.getElementById(id);
        if (c && c.width < 100) c.width = c.parentElement.clientWidth || 400;
    });

    // Draw REAL waveforms from the actual audio analyser
    drawRealWaveform('djs-wave-a', dj?.analyser, 'rgba(43, 59, 229, 1)');
    drawRealWaveform('djs-wave-b', dj?.analyser, 'rgba(126, 184, 218, 1)');
    drawVU();
    updateInfo();

    animFrame = requestAnimationFrame(renderLoop);
}

function flash(color) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;inset:0;background:${color};opacity:0;pointer-events:none;z-index:99999;mix-blend-mode:screen;`;
    document.body.appendChild(el);
    el.animate([{opacity: 0.25}, {opacity: 0}], {duration: 300}).onfinish = () => el.remove();
}

function show() {
    if (!overlay) createStudio();
    visible = true;
    overlay.classList.add('djs-visible');
    renderLoop();
}

function hide() {
    visible = false;
    if (overlay) overlay.classList.remove('djs-visible');
    if (animFrame) cancelAnimationFrame(animFrame);
}

function toggle() { visible ? hide() : show(); }

window.DJS = { show, hide, toggle };

})();
