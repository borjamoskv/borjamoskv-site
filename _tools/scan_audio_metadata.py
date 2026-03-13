import librosa
import numpy as np
import os
import json
import warnings

warnings.filterwarnings('ignore')

audio_dir = 'audio'
output_file = 'audio_metadata.json'
metadata = {}

if os.path.exists(output_file):
    with open(output_file, 'r') as f:
        try:
            metadata = json.load(f)
        except json.JSONDecodeError:
            metadata = {}

for filename in os.listdir(audio_dir):
    if filename.endswith('.webm'):
        track_id = filename.replace('.webm', '')
        if track_id in metadata and 'bpm' in metadata[track_id]:
            print(f"Skipping {track_id}, already analyzed.")
            continue
            
        print(f"Analyzing {filename}...")
        try:
            # We don't need full sample rate, 22050 is fine for BPM and spectral centroid
            y, sr = librosa.load(os.path.join(audio_dir, filename), sr=22050, mono=True)
            
            # 1. Exact BPM
            tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
            bpm = float(tempo[0] if isinstance(tempo, np.ndarray) else tempo)
            if bpm == 0:
                bpm = 120.0 # fallback
                
            # 2. Spectral Energy (RMS Mean)
            rms = librosa.feature.rms(y=y)[0]
            energy = float(np.mean(rms))
            # Normalize energy to 1-10 roughly (RMS usually 0 to 1)
            # A dense techno track might have rms mean around 0.2 - 0.3
            normalized_energy = min(10.0, max(1.0, (energy * 10 / 0.3)))
            
            # 3. Key Detection (Simple Chromagram approximation)
            chroma = librosa.feature.chroma_stft(y=y, sr=sr)
            chroma_mean = np.mean(chroma, axis=1)
            notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            estimated_key = notes[np.argmax(chroma_mean)]
            
            print(f" -> BPM: {bpm:.1f}, Energy: {normalized_energy:.1f}, Key: {estimated_key}")
            
            metadata[track_id] = {
                'bpm': round(bpm, 2),
                'energy_raw': float(energy),
                'energy_level': round(normalized_energy, 2),
                'key': estimated_key
            }
            
            # Save progressively
            with open(output_file, 'w') as f:
                json.dump(metadata, f, indent=2)
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")

print("Analysis complete.")
