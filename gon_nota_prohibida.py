#!/usr/bin/env python3
"""
GON Y EL INTERVALO PROHIBIDO — Audio Synthesis
================================================
C5-REAL | La Nota Prohibida | 21-EDO | Lehendakari Aguirre 3:47 AM

Generates:
  1. The forbidden note: 7/4 tone above E natural in 21-EDO
  2. Saxophone-like timbre via additive synthesis
  3. 14.7 Hz sub-harmonic drone (the one that makes microwaves turn on)
  4. Larguero metallic resonance (aluminum crossbar at 87 km/h)
  5. Ambient night atmosphere
  
Output: gon_nota_prohibida.wav
"""

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter

SR = 44100  # sample rate
DURATION = 67  # seconds — long enough to feel it


def edo21_freq(base_freq: float, steps: int) -> float:
    """Calculate frequency N steps up in 21-EDO from base."""
    return base_freq * (2 ** (steps / 21))


def saxophone_timbre(freq: float, duration: float, sr: int = SR) -> np.ndarray:
    """
    Additive synthesis approximating a tenor saxophone timbre.
    Odd harmonics dominant, slight even harmonic presence,
    with formant-like emphasis around 1.5-3 kHz.
    """
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    
    # Harmonic amplitudes (saxophone-like spectrum)
    harmonics = [
        (1, 1.0),      # fundamental
        (2, 0.65),      # 2nd — present but weaker
        (3, 0.85),      # 3rd — strong (odd harmonic)
        (4, 0.40),      # 4th
        (5, 0.70),      # 5th — strong
        (6, 0.25),      # 6th
        (7, 0.55),      # 7th
        (8, 0.15),      # 8th
        (9, 0.40),      # 9th
        (10, 0.10),     # 10th
        (11, 0.30),     # 11th
        (12, 0.08),     # 12th
        (13, 0.20),     # 13th — microtonal shimmer
    ]
    
    signal = np.zeros_like(t)
    for n, amp in harmonics:
        h_freq = freq * n
        # Formant emphasis: boost 1.5-3 kHz range
        formant_boost = 1.0
        if 1500 < h_freq < 3000:
            formant_boost = 1.8
        elif 3000 < h_freq < 4500:
            formant_boost = 1.3
        
        # Slight random phase for natural feel
        phase = np.random.uniform(0, 2 * np.pi)
        # Subtle vibrato on each harmonic (different rates)
        vibrato = 1.0 + 0.003 * np.sin(2 * np.pi * (4.5 + n * 0.1) * t)
        signal += amp * formant_boost * np.sin(2 * np.pi * h_freq * vibrato * t + phase)
    
    # Breath noise component
    noise = np.random.randn(len(t)) * 0.02
    b, a = butter(4, [800 / (sr/2), 4000 / (sr/2)], btype='band')
    breath = lfilter(b, a, noise)
    
    signal += breath
    
    return signal / np.max(np.abs(signal))


def sub_harmonic_drone(freq: float, duration: float, sr: int = SR) -> np.ndarray:
    """
    14.7 Hz sub-audible drone.
    The one that makes the Roomba draw Ramoncín's face.
    You feel it in your chest, not your ears.
    """
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    
    # Pure sub-harmonic
    sub = np.sin(2 * np.pi * freq * t)
    
    # Add very slow amplitude modulation
    mod = 0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t)  # 0.07 Hz = ~14s cycle
    
    # Second sub-harmonic for thickness
    sub2 = 0.6 * np.sin(2 * np.pi * (freq * 1.5) * t + 0.3)
    
    signal = (sub + sub2) * mod
    return signal / np.max(np.abs(signal))


def larguero_resonance(duration: float, hit_time: float, sr: int = SR) -> np.ndarray:
    """
    The sound of a football hitting an aluminum crossbar at 87 km/h.
    Minute 93. Athletic Femenino vs Real Sociedad. 
    The note that is the same as the forbidden note.
    
    Metallic resonance: high-frequency ping with exponential decay,
    pitch-bending downward as the metal relaxes.
    """
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    signal = np.zeros_like(t)
    
    hit_sample = int(hit_time * sr)
    if hit_sample >= len(t):
        return signal
    
    t_local = t[hit_sample:] - t[hit_sample]
    
    # The CLONK: metallic attack
    # Multiple inharmonic partials (aluminum tube modes)
    freqs = [1247, 2089, 3351, 4217, 5683, 7129]  # aluminum resonant modes
    decays = [2.8, 1.9, 1.2, 0.8, 0.5, 0.3]       # decay times
    amps = [1.0, 0.7, 0.5, 0.35, 0.2, 0.12]
    
    metal = np.zeros(len(t_local))
    for f, d, amp in zip(freqs, decays, amps):
        # Slight pitch bend down as metal cools
        pitch_bend = f * (1.0 - 0.008 * (1 - np.exp(-t_local / 1.5)))
        env = amp * np.exp(-t_local / d)
        metal += env * np.sin(2 * np.pi * pitch_bend * t_local)
    
    # Impact transient
    impact_env = np.exp(-t_local / 0.003) * 0.8
    impact = impact_env * np.random.randn(len(t_local))
    
    hit_signal = metal + impact
    hit_signal = hit_signal / np.max(np.abs(hit_signal))
    
    signal[hit_sample:] = hit_signal
    
    return signal


def night_ambience(duration: float, sr: int = SR) -> np.ndarray:
    """
    Lehendakari Aguirre at 3:47 AM.
    Wet asphalt. Distant traffic on the A-8. A dog breathing.
    """
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    n_samples = len(t)
    
    # Low rumble — distant traffic
    noise = np.random.randn(n_samples) * 0.015
    b, a = butter(3, [20 / (sr/2), 120 / (sr/2)], btype='band')
    rumble = lfilter(b, a, noise)
    
    # Wind through Lehendakari Aguirre
    wind_noise = np.random.randn(n_samples) * 0.008
    b2, a2 = butter(2, [200 / (sr/2), 800 / (sr/2)], btype='band')
    wind = lfilter(b2, a2, wind_noise)
    # Slow wind gusts
    wind *= 0.5 + 0.5 * np.sin(2 * np.pi * 0.03 * t)
    
    return rumble + wind


def apply_envelope(signal: np.ndarray, attack: float, decay: float, 
                   sustain: float, release: float, sr: int = SR) -> np.ndarray:
    """ADSR envelope."""
    n = len(signal)
    env = np.ones(n)
    
    attack_samples = int(attack * sr)
    decay_samples = int(decay * sr)
    release_samples = int(release * sr)
    
    # Attack
    if attack_samples > 0:
        env[:attack_samples] = np.linspace(0, 1, attack_samples)
    
    # Decay
    d_start = attack_samples
    d_end = d_start + decay_samples
    if decay_samples > 0 and d_end <= n:
        env[d_start:d_end] = np.linspace(1, sustain, decay_samples)
    
    # Sustain (already at sustain level)
    if d_end < n - release_samples:
        env[d_end:n - release_samples] = sustain
    
    # Release
    if release_samples > 0:
        env[-release_samples:] = np.linspace(sustain, 0, release_samples)
    
    return signal * env


def build_composition() -> np.ndarray:
    """
    The complete audio piece:
    
    0:00 - 0:08   Night ambience alone (Lehendakari Aguirre settling)
    0:08 - 0:20   Sub-harmonic drone fades in (14.7 Hz — you feel it first)
    0:20 - 0:55   Saxophone enters with the forbidden note
    0:42 - 0:47   LARGUERO HIT (the CLONK — minute 93)
    0:47 - 0:55   Saxophone responds to the larguero
    0:55 - 1:07   Everything fades. The farola parpadea.
    """
    n_samples = int(DURATION * SR)
    
    # === E natural (E4) = 329.63 Hz ===
    E4 = 329.63
    
    # === The forbidden note: 7/4 tone above E in 21-EDO ===
    # In 21-EDO, 7 steps = 7/21 of an octave = 1/3 octave
    # But "7/4 de tono" = 7 quarter-tones = 3.5 semitones ≈ 7 steps in 21-EDO
    forbidden_note = edo21_freq(E4, 7)
    print(f"E4 = {E4:.2f} Hz")
    print(f"Forbidden note (E4 + 7 steps 21-EDO) = {forbidden_note:.2f} Hz")
    print(f"Ratio = {forbidden_note/E4:.6f}")
    print(f"Cents above E4 = {1200 * np.log2(forbidden_note/E4):.1f}")
    
    # === Layer 1: Night ambience (full duration) ===
    print("Synthesizing: Night ambience...")
    ambient = night_ambience(DURATION)
    ambient = ambient * 0.4
    
    # === Layer 2: Sub-harmonic drone (14.7 Hz) ===
    print("Synthesizing: 14.7 Hz sub-harmonic drone...")
    sub = sub_harmonic_drone(14.7, DURATION)
    # Fade in from 8s to 20s
    sub_env = np.zeros(n_samples)
    fade_start = int(8 * SR)
    fade_end = int(20 * SR)
    sub_env[fade_start:fade_end] = np.linspace(0, 1, fade_end - fade_start)
    sub_env[fade_end:int(55 * SR)] = 1.0
    # Fade out from 55s to end
    fade_out_start = int(55 * SR)
    sub_env[fade_out_start:] = np.linspace(1, 0, n_samples - fade_out_start)
    sub = sub * sub_env * 0.35
    
    # === Layer 3: Saxophone — the forbidden note ===
    print(f"Synthesizing: Saxophone at {forbidden_note:.2f} Hz...")
    sax_raw = saxophone_timbre(forbidden_note, DURATION)
    
    # Saxophone enters at 20s with slow attack, plays until 55s
    sax_env = np.zeros(n_samples)
    sax_start = int(20 * SR)
    sax_attack_end = int(26 * SR)
    sax_env[sax_start:sax_attack_end] = np.linspace(0, 1, sax_attack_end - sax_start)
    sax_env[sax_attack_end:int(50 * SR)] = 1.0
    # Subtle swell for expression
    t_full = np.linspace(0, DURATION, n_samples, endpoint=False)
    sax_expression = 0.85 + 0.15 * np.sin(2 * np.pi * 0.08 * t_full)
    sax_env *= sax_expression
    # Fade out
    sax_fade_start = int(50 * SR)
    sax_fade_end = int(58 * SR)
    sax_env[sax_fade_start:sax_fade_end] = np.linspace(1, 0, sax_fade_end - sax_fade_start) * sax_expression[sax_fade_start:sax_fade_end]
    sax_env[sax_fade_end:] = 0
    
    sax = sax_raw * sax_env * 0.55
    
    # === Layer 3b: Second saxophone voice — a 21-EDO fifth above ===
    # 21-EDO fifth = 12 steps (closest to 3:2 ratio)
    fifth_freq = edo21_freq(forbidden_note, 12)
    print(f"Synthesizing: Second voice at {fifth_freq:.2f} Hz (21-EDO fifth)...")
    sax2_raw = saxophone_timbre(fifth_freq, DURATION)
    sax2_env = np.zeros(n_samples)
    sax2_start = int(30 * SR)
    sax2_attack_end = int(36 * SR)
    sax2_env[sax2_start:sax2_attack_end] = np.linspace(0, 0.35, sax2_attack_end - sax2_start)
    sax2_env[sax2_attack_end:int(48 * SR)] = 0.35
    sax2_fade = int(48 * SR)
    sax2_env[sax2_fade:int(53 * SR)] = np.linspace(0.35, 0, int(53 * SR) - sax2_fade)
    sax2 = sax2_raw * sax2_env * 0.4
    
    # === Layer 4: LARGUERO HIT at 42s ===
    print("Synthesizing: LARGUERO (aluminum crossbar impact)...")
    larguero = larguero_resonance(DURATION, hit_time=42.0)
    larguero = larguero * 0.6
    
    # Second softer hit (echo/memory) at 45s
    larguero2 = larguero_resonance(DURATION, hit_time=45.0)
    larguero2 = larguero2 * 0.25
    
    # === Mix ===
    print("Mixing layers...")
    mix = ambient + sub + sax + sax2 + larguero + larguero2
    
    # Gentle compression
    threshold = 0.85
    mix = np.where(np.abs(mix) > threshold,
                   np.sign(mix) * (threshold + (1 - threshold) * np.tanh((np.abs(mix) - threshold) / (1 - threshold))),
                   mix)
    
    # Final fade out (last 8 seconds)
    final_fade_start = int((DURATION - 8) * SR)
    final_fade = np.ones(n_samples)
    final_fade[final_fade_start:] = np.linspace(1, 0, n_samples - final_fade_start)
    mix *= final_fade
    
    # Normalize to 16-bit range
    mix = mix / np.max(np.abs(mix)) * 0.9
    
    return mix


if __name__ == "__main__":
    print("=" * 60)
    print("GON Y EL INTERVALO PROHIBIDO — Audio Synthesis")
    print("Lehendakari Aguirre 47 | 3:47 AM | 21-EDO")
    print("=" * 60)
    
    audio = build_composition()
    
    # Convert to 16-bit PCM
    audio_16bit = (audio * 32767).astype(np.int16)
    
    output_path = "/Users/borjafernandezangulo/10_PROJECTS/borjamoskv-site/gon_nota_prohibida.wav"
    wavfile.write(output_path, SR, audio_16bit)
    
    print(f"\nOutput: {output_path}")
    print(f"Duration: {DURATION}s | Sample rate: {SR} Hz | 16-bit PCM mono")
    print(f"Size: {len(audio_16bit) * 2 / 1024 / 1024:.1f} MB")
    print("\n∴ 'Mañana puede que suene distinta.' — Gon")
