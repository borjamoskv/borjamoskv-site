#!/usr/bin/env python3
"""
GON Y EL INTERVALO PROHIBIDO — Narrated Audio
===============================================
Generates narration using macOS TTS + mixes with the instrumental.
Multiple voices for characters.
"""

import subprocess
import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample

SR = 44100
OUT_DIR = "/Users/borjafernandezangulo/Desktop"
SCRATCH = "/tmp/gon_narration"
os.makedirs(SCRATCH, exist_ok=True)

# Voice assignments
NARRATOR = "Mónica"       # es_ES female — narrator
GON = "Reed (Español (España))"          # male, dry
VECINO = "Rocko (Español (España))"      # male, gruff — vecinos/Koldo
ERTZAINA = "Eddy (Español (España))"     # male — ertzaina
ANE = "Flo (Español (España))"           # female — Ane
RAMONC = "Grandpa (Español (España))"    # old male — Ramoncín
JOKIN = "Sandy (Español (España))"       # — Jokin
GATO = "Shelley (Español (España))"      # eerie — the cat
OPERADORA = "Flo (Español (España))"     # female

# Script: (voice, rate, text, pause_after_seconds)
SCRIPT = [
    # === INTRO ===
    (NARRATOR, 170, "Gon y el Intervalo Prohibido.", 1.5),
    (NARRATOR, 170, "Un relato de Lehendakari Aguirre.", 2.0),
    
    # === SECTION 1 ===
    (NARRATOR, 185, "Gon descubrió la nota prohibida un martes a las 3 47 de la mañana, con un cuarto de gramo de 2 C B disolviéndose lentamente en su corteza prefrontal.", 1.0),
    (NARRATOR, 185, "Esto es importante. No porque la droga le diera talento. Gon ya tenía talento, el tipo de talento que en Bilbao se expresa tocando un saxofón modificado debajo de una farola fundida, en vez de, por ejemplo, pagándote un máster.", 1.0),
    (NARRATOR, 185, "La 2 C B lo que hizo fue quitarle la última capa de respeto por el sistema tonal occidental.", 1.0),
    (NARRATOR, 185, "Le había dado la pastilla Txema, un colega de la copistería que las conseguía de un tipo de Barakaldo que decía ser bioquímico pero trabajaba en un Eroski.", 0.8),
    (VECINO, 175, "Esta es suave, bro. Es como ver el mundo en 4K pero con el audio en idiomas que no existen.", 1.0),
    (NARRATOR, 185, "Txema no era poeta. Pero a veces acertaba.", 2.0),
    
    # === SECTION 2 — La llamada ===
    (NARRATOR, 185, "El primer vecino que llamó a la Ertzaintza fue el del tercero B.", 0.8),
    (VECINO, 180, "Hay un tío ahí abajo tocando algo que no es música.", 0.6),
    (OPERADORA, 180, "¿Y qué es?", 0.5),
    (VECINO, 180, "No sé. Pero mi perro se ha puesto a andar en círculos, el microondas se ha encendido solo, y le juro por mi madre que he visto a mi Roomba dibujar la cara de Ramoncín en el suelo del salón.", 0.6),
    (OPERADORA, 180, "Señor, ¿ha consumido alguna sustancia?", 0.5),
    (VECINO, 180, "Una Alhambra. ¿Eso cuenta?", 1.5),
    
    # === SECTION 3 — Ertzaintza ===
    (NARRATOR, 185, "La patrulla llegó a las 4 y 12. El ertzaina más joven se acercó a Gon. El más viejo se quedó en el coche porque le quedaban tres meses para jubilarse y ya le daba igual todo, incluida la realidad.", 1.0),
    (ERTZAINA, 175, "¿Tiene permiso para esto?", 0.5),
    (GON, 170, "¿Permiso para qué?", 0.5),
    (ERTZAINA, 175, "Para... eso.", 0.5),
    (GON, 170, "Es un saxofón.", 0.5),
    (ERTZAINA, 175, "Ya, pero lo que sale de ahí no es saxofón. Es más como si alguien estuviera estrangulando una gaita dentro de una lavadora.", 0.6),
    (GON, 170, "Es 21 edo.", 0.5),
    (ERTZAINA, 175, "Me da igual que sea ETA.", 2.0),
    
    # === SECTION 4 — Ramoncín ===
    (NARRATOR, 185, "Lo de Ramoncín pasó la segunda semana.", 0.8),
    (NARRATOR, 185, "Ramoncín. El auténtico. Ramón José María Martínez de las Heras. El Rey del Pollo Frito. La Bestia Parduzca del Rock Nacional. Apareció en Lehendakari Aguirre a las 3 y 15 de una madrugada de miércoles.", 0.8),
    (NARRATOR, 185, "Venía del dentista. Un dentista clandestino de Deusto que hacía endodoncias a las 2 de la mañana por 300 euros y sin preguntas.", 1.0),
    (NARRATOR, 185, "Nadie sabe por qué Ramoncín estaba en Bilbao. La teoría más aceptada es que había venido a grabar un podcast sobre la nueva virilidad con un influencer de Algorta que tenía 14 mil seguidores y un aro en la ceja.", 1.0),
    (NARRATOR, 185, "Iba andando con media cara hinchada de la anestesia, babeando ligeramente por el lado izquierdo, cuando escuchó a Gon.", 0.8),
    (RAMONC, 155, "Etho eth punf.", 0.8),
    (GON, 170, "No es punk. Es microtonalismo.", 0.6),
    (RAMONC, 155, "Me da iguaf. Eth la hoztia. Yo en el zethenta y ziete hacía lo mizmo pero con trez acordez y una nabaja.", 1.5),
    (NARRATOR, 185, "Ramoncín se sentó en un banco y se quedó escuchando 40 minutos. A los 20 dejó de babear. A los 30 empezó a llorar. A los 40 se levantó, le dio a Gon un abrazo que olía a eugenol y a cuero sintético, y se fue andando hacia Deusto.", 1.0),
    (VECINO, 180, "Ramoncín no estuvo en Bilbao.", 0.5),
    (GON, 170, "Estuvo. Me abrazó. Olía a dentista.", 0.5),
    (VECINO, 180, "¿Y babeaba?", 0.4),
    (GON, 170, "Mucho.", 0.5),
    (VECINO, 180, "Entonces sí era Ramoncín.", 2.0),

    # === SECTION 5 — El perro ===
    (NARRATOR, 185, "Lo del perro pasó la cuarta semana.", 0.8),
    (NARRATOR, 185, "Apareció de la nada. Era un perro enorme. Blanco. Con escamas, o algo parecido a escamas, o puede que fuera caspa. Nadie se acercó lo suficiente para comprobarlo.", 1.0),
    (JOKIN, 180, "Eso es Fújur.", 0.5),
    (GON, 170, "Fújur es un dragón.", 0.5),
    (JOKIN, 180, "Fújur es un perro enorme al que Alemania le puso alas y le llamó dragón de la suerte. Es la mayor estafa visual del cine europeo. Mi madre me llevó al cine en el 84 a ver La Historia Interminable y lloré durante una hora porque el caballo se moría en el barro. ¿Sabes qué no lloré? Cuando apareció el perro gigante volador. Porque era un perro. Los perros no dan pena cuando vuelan. Dan pena cuando se mueren. Y Fújur no se moría. Ergo, Fújur es emocionalmente fraudulento.", 1.0),
    (GON, 170, "Jokin, ¿has dormido?", 0.5),
    (JOKIN, 180, "No desde el jueves.", 2.0),

    # === SECTION 6 — Koldo ===
    (NARRATOR, 185, "La comunidad de vecinos convocó una junta extraordinaria. Bajó Koldo, el del bajo, que pesaba 111 kilos y una vez había echado a un yonki del portal usando exclusivamente la mirada y un tenedor.", 1.0),
    (NARRATOR, 185, "Koldo volvió a los 20 minutos. Se sentó. Pidió una tila. Y dijo:", 0.8),
    (VECINO, 165, "Le he escuchado tocar un solo de 4 minutos y he entendido por qué mi padre nunca me dijo que me quería. No voy a echarle.", 1.5),
    (NARRATOR, 185, "Hubo un silencio largo.", 1.0),
    (OPERADORA, 175, "Joder, Koldo.", 0.8),
    (VECINO, 165, "Sí. Joder.", 2.0),

    # === SECTION 7 — Ane la portera ===
    (NARRATOR, 185, "Lo de la portera del Athletic Femenino pasó la quinta semana, y fue lo que casi destruyó todo.", 0.8),
    (NARRATOR, 185, "Se llamaba Ane. Jugaba de portera en el Athletic Club Women. Medía 1 78. Tenía las manos más grandes del fútbol femenino vasco, que no es poco. Y vivía en el cuarto A del portal 47.", 1.0),
    (NARRATOR, 185, "El domingo anterior, un disparo de Nerea Eizagirre desde 25 metros. Un misil a la escuadra. Ane saltó. Rozó el balón. El balón pegó en el larguero. CLONK. La vibración duró 4 coma 7 segundos.", 1.0),
    (NARRATOR, 185, "Pero no podía dormir. Porque cada noche, a las 3 47, ese tío del saxo tocaba una nota que sonaba exactamente igual que el larguero.", 1.0),
    (NARRATOR, 185, "Ane bajó la quinta noche. Iba en pijama. Uno del Athletic, evidentemente. Con el escudo y todo.", 0.8),
    (ANE, 180, "Eres tú.", 0.5),
    (GON, 170, "¿Yo qué?", 0.5),
    (ANE, 180, "La nota. La del larguero. La tocas cada noche a las 3 52 exactas.", 0.6),
    (GON, 170, "No sé de qué hablas.", 0.5),
    (ANE, 185, "Sí lo sabes. Es un Mi con algo. Un Mi raro. Un Mi que suena a aluminio golpeado a velocidad terminal por un balón de la temporada 2025 2026 de la Liga F.", 0.8),
    (GON, 170, "Es un 7 cuartos de tono por encima del Mi natural.", 0.6),
    (ANE, 195, "¡Me da igual cómo se llame! Es EL LARGUERO. Y cada vez que la tocas yo revivo el minuto 93 y no puedo dormir y mañana tengo entreno a las 8 y si no duermo no paro y si no paro nos meten 5 y si nos meten 5 bajo a Segunda y si bajo a Segunda mi padre me dice te dije que hicieras la oposición y NO VOY A HACER LA PUTA OPOSICIÓN, ¿ME OYES?", 1.5),
    (NARRATOR, 185, "Hubo un silencio.", 0.8),
    (VECINO, 165, "Eso ha sido precioso.", 0.6),
    (ANE, 180, "Cállate, Koldo.", 0.5),
    (VECINO, 165, "Me callo.", 2.5),

    # === SECTION 8 — El gato ===
    (NARRATOR, 185, "Gon dejó de tocar esa noche. Porque Ane le había hecho ver algo que no había calculado: la nota del larguero y la nota prohibida eran la misma.", 1.5),
    (NARRATOR, 185, "El universo no era un compilador. Era un larguero. Y toda la realidad era un disparo a escuadra que alguien estaba ejecutando continuamente, y lo único que separaba el gol de la salvación era una vibración microtonal que nadie había catalogado porque los físicos no ven fútbol femenino.", 1.5),
    (GON, 170, "Joder.", 0.8),
    (GATO, 160, "Joder.", 0.8),
    (GON, 170, "¿Has vuelto a hablar?", 0.5),
    (GATO, 160, "No.", 2.5),

    # === EPILOGUE ===
    (NARRATOR, 175, "Gon sigue tocando cada noche en Lehendakari Aguirre.", 1.0),
    (NARRATOR, 175, "Ane paró un penalti el domingo siguiente. Dijo que oyó la frecuencia del balón antes del disparo.", 1.0),
    (NARRATOR, 175, "Ramoncín sacó un EP de 3 temas grabados con un saxofonista anónimo de Bilbao. Se llama Endodonzia Punk.", 1.0),
    (NARRATOR, 175, "Jokin publicó su paper. Tiene 6 citas. 4 son suyas.", 1.0),
    (NARRATOR, 175, "El perro sigue ahí. Nadie lo reclama. Nadie lo alimenta, pero engorda. Algunos vecinos han empezado a dejarle txistorra en un plato fuera del portal. El perro come la txistorra con la dignidad de quien ha volado sobre Fantasía y ha decidido que Lehendakari Aguirre es mejor porque aquí la txistorra es real.", 2.0),
    (NARRATOR, 175, "Iñaki publicó su segundo poemario. Se llama Métricas de Tornillería Avanzada. Ha vendido 21 ejemplares. 19 los compró Koldo.", 1.5),
    (NARRATOR, 175, "Y la farola del portal 47 sigue fundida.", 1.5),
    (NARRATOR, 170, "Pero algunas noches, si pasas por ahí a las 3 47 exactas y el aire está lo bastante húmedo, puedes ver que parpadea. Un parpadeo brevísimo. Como si algo que estaba muerto quisiera escuchar un poco más antes de decidir si vuelve.", 3.0),
    
    (NARRATOR, 160, "Mañana puede que suene distinta.", 2.0),
]


def generate_segment(voice, rate, text, index):
    """Generate a single TTS segment as AIFF, convert to WAV."""
    aiff_path = f"{SCRATCH}/seg_{index:03d}.aiff"
    wav_path = f"{SCRATCH}/seg_{index:03d}.wav"
    
    subprocess.run([
        "say", "-v", voice, "-r", str(rate),
        "-o", aiff_path, text
    ], check=True)
    
    # Convert AIFF to WAV using afconvert
    subprocess.run([
        "afconvert", "-f", "WAVE", "-d", "LEI16@44100",
        aiff_path, wav_path
    ], check=True)
    
    return wav_path


def load_wav_mono(path):
    """Load WAV and ensure mono float array at SR."""
    rate, data = wavfile.read(path)
    if data.dtype == np.int16:
        data = data.astype(np.float64) / 32768.0
    elif data.dtype == np.int32:
        data = data.astype(np.float64) / 2147483648.0
    
    # If stereo, take mono mix
    if len(data.shape) > 1:
        data = data.mean(axis=1)
    
    # Resample if needed
    if rate != SR:
        n_samples = int(len(data) * SR / rate)
        data = resample(data, n_samples)
    
    return data


def main():
    print("=" * 60)
    print("GON Y EL INTERVALO PROHIBIDO — Narrated Audio")
    print("Generating voice segments...")
    print("=" * 60)
    
    segments = []
    
    for i, (voice, rate, text, pause) in enumerate(SCRIPT):
        char = voice.split("(")[0].strip() if "(" in voice else voice
        print(f"  [{i+1:02d}/{len(SCRIPT)}] {char}: {text[:50]}...")
        wav_path = generate_segment(voice, rate, text, i)
        audio = load_wav_mono(wav_path)
        segments.append((audio, pause))
    
    # Concatenate with pauses
    print("\nConcatenating segments...")
    all_audio = []
    for audio, pause in segments:
        all_audio.append(audio)
        all_audio.append(np.zeros(int(pause * SR)))
    
    narration = np.concatenate(all_audio)
    
    # Normalize
    narration = narration / np.max(np.abs(narration)) * 0.85
    
    # Save
    output_path = f"{OUT_DIR}/gon_narrado.wav"
    audio_16bit = (narration * 32767).astype(np.int16)
    wavfile.write(output_path, SR, audio_16bit)
    
    duration = len(narration) / SR
    size_mb = len(audio_16bit) * 2 / 1024 / 1024
    print(f"\nOutput: {output_path}")
    print(f"Duration: {duration:.0f}s ({duration/60:.1f} min)")
    print(f"Size: {size_mb:.1f} MB")
    print(f"Segments: {len(SCRIPT)}")
    print("\n∴ 'NO VOY A HACER LA PUTA OPOSICIÓN.' — Ane")


if __name__ == "__main__":
    main()
