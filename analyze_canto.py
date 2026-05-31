#!/usr/bin/env python3
import sys
import numpy as np
from scipy.io import wavfile

def get_21edo_nearest(freq, base_freq=220.0):
    if freq <= 0:
        return None, 0
    # step = 21 * log2(freq / base_freq)
    step_exact = 21.0 * np.log2(freq / base_freq)
    step_nearest = int(round(step_exact))
    
    # Calculate deviation in cents (1 step in 21-EDO is 1200 / 21 = 57.14 cents)
    expected_freq = base_freq * (2.0 ** (step_nearest / 21.0))
    cents_deviation = 1200.0 * np.log2(freq / expected_freq)
    return step_nearest, cents_deviation

def main():
    if len(sys.argv) < 2:
        print("Uso: python3 analyze_canto.py <ruta_wav>")
        sys.exit(1)
        
    wav_path = sys.argv[1]
    
    try:
        sr, data = wavfile.read(wav_path)
    except Exception as e:
        print(f"Error leyendo archivo audio: {e}")
        sys.exit(1)
        
    # Convert stereo to mono
    if len(data.shape) > 1:
        data = data.mean(axis=1)
        
    # Normalize
    data = data.astype(float)
    if np.max(np.abs(data)) > 0:
        data /= np.max(np.abs(data))
        
    print("=" * 60)
    print("ANALIZADOR DE CANTE MICROTONAL (C5-REAL)")
    print(f"Archivo: {wav_path}")
    print(f"Sample Rate: {sr} Hz | Muestras: {len(data)}")
    print("=" * 60)
    
    # Pitch detection using autocorrelation in window frames
    frame_size = int(0.05 * sr) # 50ms frames
    hop_size = int(0.025 * sr)  # 25ms overlap
    
    detected_pitches = []
    
    # Range of human voice pitches (approx 80Hz - 800Hz)
    min_lag = int(sr / 800.0)
    max_lag = int(sr / 80.0)
    
    for start in range(0, len(data) - frame_size, hop_size):
        frame = data[start:start+frame_size]
        if np.std(frame) < 0.05: # Skip silent frames
            continue
            
        # Autocorrelation
        corr = np.correlate(frame, frame, mode='full')
        corr = corr[len(corr)//2:]
        
        # Find peak in frequency range
        r_range = corr[min_lag:max_lag]
        if len(r_range) == 0:
            continue
        peak_lag = np.argmax(r_range) + min_lag
        
        freq = sr / float(peak_lag)
        
        # Simple threshold check
        if corr[peak_lag] > 0.3 * corr[0]:
            detected_pitches.append(freq)
            
    if not detected_pitches:
        print("No se ha detectado señal vocal clara o tono afinado.")
        sys.exit(0)
        
    print(f"Páginas de cante procesadas. Tonos estables detectados: {len(detected_pitches)}")
    print("\nMATRIZ DE ALINEACIÓN 21-EDO:")
    print("-" * 65)
    print(f"{'Frecuencia (Hz)':<18} | {'Paso 21-EDO':<12} | {'Desviación (Cents)':<20} | {'Alineación'}")
    print("-" * 65)
    
    # Sample every Nth pitch to keep output clean and high density
    step_samples = max(1, len(detected_pitches) // 15)
    sampled_pitches = detected_pitches[::step_samples][:15]
    
    deviations = []
    
    for f in sampled_pitches:
        step, dev = get_21edo_nearest(f)
        deviations.append(abs(dev))
        
        # Display deviation visual bar
        bar_len = min(10, int(abs(dev) / 5))
        bar_char = "●" if abs(dev) < 15 else "○"
        bar = (" " * (10 - bar_len)) + (bar_char * bar_len)
        
        print(f"{f:14.2f} Hz | {step:10d} | {dev:+18.1f} | {bar}")
        
    avg_dev = np.mean(deviations)
    exergy_rating = max(0, 100 - avg_dev)
    
    print("-" * 65)
    print(f"Desviación Media: {avg_dev:.2f} cents")
    print(f"Exergía de Afinación: {exergy_rating:.2f}%")
    print("=" * 60)
    print("∴ 'Que suene bien es propaganda. Que suene libre es cante.'")

if __name__ == "__main__":
    main()
