import math
import os

def calculate_shannon_entropy(filepath_or_data):
    if os.path.exists(filepath_or_data):
        with open(filepath_or_data, 'rb') as f:
            data = f.read()
    else:
        data = filepath_or_data.encode('utf-8') if isinstance(filepath_or_data, str) else filepath_or_data

    if not data:
        return 0.0

    length = len(data)
    frequencies = {}
    for byte in data:
        frequencies[byte] = frequencies.get(byte, 0) + 1

    entropy = 0.0
    for count in frequencies.values():
        p = count / length
        entropy -= p * math.log2(p)

    return entropy

def main():
    target_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Calculando Entropía de Shannon (bits por byte) en: {target_dir}\n")

    files_to_check = [
        "hal_finney_als_2010.es.srt",
        "caso_estudio_testimonios_algara.md",
        "exergy_audit_report.md"
    ]

    print(f"{'Nombre del Archivo':<40} | {'Tamaño (Bytes)':<15} | {'Entropía (bits/byte)':<20}")
    print("-" * 81)

    for filename in files_to_check:
        filepath = os.path.join(target_dir, filename)
        if os.path.exists(filepath):
            size = os.path.getsize(filepath)
            entropy = calculate_shannon_entropy(filepath)
            print(f"{filename:<40} | {size:<15} | {entropy:.6f}")
        else:
            print(f"{filename:<40} | {'No encontrado':<15} | {'N/A':<20}")

if __name__ == "__main__":
    main()
