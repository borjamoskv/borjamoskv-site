/**
 * CORTEX AMBIENT MICROTONAL ENGINE
 * Pleasant generative sine-only drones. Pentatonic-adjacent.
 * Brian Eno "Music for Airports" philosophy.
 * Auto-ducks when AutoDJ plays. Never overlaps.
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

let ctx = null;
let master = null;
let playing = false;
let duckGain = null;

const PLEASANT_FREQUENCIES = [
    // Just-intonation pentatonic in A (very consonant / pleasant)
    110.00,   // A2
    123.47,   // B2 (9/8)
    138.59,   // C#3 (5/4)
    164.81,   // E3 (3/2)
    185.00,   // F#3 (5/3 — sweet sixth)
    220.00,   // A3
    246.94,   // B3
    277.18,   // C#4
    329.63,   // E4
    369.99,   // F#4
    440.00,   // A4
];

function start() {
    if (playing) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Master chain: duck gain -> gentle lowpass -> compressor -> destination
    duckGain = ctx.createGain();
    duckGain.gain.value = 0.04; // Very subtle

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1200;
    lp.Q.value = 0.3;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -30;
    comp.ratio.value = 4;

    duckGain.connect(lp);
    lp.connect(comp);
    comp.connect(ctx.destination);

    playing = true;
    _spawnNote();

    // Auto-duck: check every 500ms
    const duckLoop = setInterval(() => {
        if (!playing) { clearInterval(duckLoop); return; }
        const djActive = window.djAesthetic && !window.djAesthetic.globalMuted;
        const target = djActive ? 0.008 : 0.04;
        duckGain.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.8);
    }, 500);
}

function _spawnNote() {
    if (!playing || !ctx) return;

    const freq = PLEASANT_FREQUENCIES[Math.floor(Math.random() * PLEASANT_FREQUENCIES.length)];
    // Slight microtonal shimmer (±5 cents max — barely perceptible, adds life)
    const detune = (Math.random() - 0.5) * 10;

    const osc = ctx.createOscillator();
    osc.type = 'sine'; // ONLY sine — zero harshness
    osc.frequency.value = freq;
    osc.detune.value = detune;

    const noteGain = ctx.createGain();
    const attack = 4 + Math.random() * 6;   // 4-10s attack (very slow)
    const hold = 6 + Math.random() * 12;    // 6-18s hold
    const release = 5 + Math.random() * 8;  // 5-13s release
    const now = ctx.currentTime;
    const peakVol = 0.02 + Math.random() * 0.03; // Very quiet

    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(peakVol, now + attack);
    noteGain.gain.setValueAtTime(peakVol, now + attack + hold);
    noteGain.gain.linearRampToValueAtTime(0, now + attack + hold + release);

    osc.connect(noteGain);
    noteGain.connect(duckGain);
    osc.start(now);
    osc.stop(now + attack + hold + release + 1);

    // Next note: staggered, overlapping gently
    const nextDelay = 3000 + Math.random() * 8000;
    setTimeout(_spawnNote, nextDelay);
}

function stop() {
    playing = false;
    if (ctx) { ctx.close().catch(() => {}); ctx = null; }
}

function isPlaying() { return playing; }

// Expose globally
window.CORTEX_AMBIENT = { start, stop, isPlaying };

})();
