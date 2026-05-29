#!/usr/bin/env python3
"""
GON Y EL INTERVALO PROHIBIDO — Versión Subnormal Definitiva
=============================================================
Voces muy divertidas. Un tío de Cuenca con acento gallego.
Color mierda parda. El más subnormal es el más listo.
"""

import subprocess
import os
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample

SR = 44100
OUT_DIR = "/Users/borjafernandezangulo/Desktop"
SCRATCH = "/tmp/gon_v2"
os.makedirs(SCRATCH, exist_ok=True)

# === VOICE ASSIGNMENTS ===
# Narrator: Mónica normal
# Gon: Reed lento y plano (subnormal sabio)  
# Txema: Rocko España rápido (nervioso)
# Vecino 3B: Eddy rápido (histérico)
# Operadora: Flo normal
# Ertzaina: Eddy España (seco)
# Manolo (Cuenca-gallego): Rocko México (acento raro + texto gallego)
# Ramoncín: Grandpa lentísimo (mandíbula dormida)
# Koldo: Rocko muy lento (grave, enorme)
# Ane: Flo rápido (cabreada)
# Jokin: Sandy muy rápido (no ha dormido)
# Gato: Shelley lento (inquietante)
# Begoña: Grandma (presidenta comunidad)
# Madre Gon: Grandma México
# Opositor: Eddy México (desesperado)

NARRATOR = "Mónica"
GON = "Reed (Español (España))"
TXEMA = "Rocko (Español (España))"
VECINO = "Eddy (Español (España))"
OPERADORA = "Flo (Español (España))"
ERTZAINA = "Eddy (Español (España))"
MANOLO = "Rocko (Español (México))"   # Cuenca con acento gallego = voz mexica para sonar raro
RAMONC = "Grandpa (Español (España))"
KOLDO = "Rocko (Español (España))"
ANE = "Flo (Español (España))"
JOKIN = "Sandy (Español (España))"
GATO = "Shelley (Español (España))"
BEGONA = "Grandma (Español (España))"
MADRE = "Grandma (Español (México))"
OPOSITOR = "Eddy (Español (México))"

# (voice, rate, text, pause_after)
SCRIPT = [
    # === INTRO ===
    (NARRATOR, 175, "Gon y el Intervalo Prohibido. Versión definitiva. Color mierda parda.", 2.0),

    # === COLOR FAVORITO ===
    (NARRATOR, 190, "Lo primero que tienes que entender sobre Gon es que su color favorito es el marrón caca.", 1.0),
    (NARRATOR, 190, "No marrón chocolate. No marrón tierra. No marrón cálido ni tostado ni ninguna de esas mierdas que inventan en los catálogos de Ikea para vender estanterías. Marrón mierda. Parda. El color exacto de una deposición humana a las 72 horas de haber comido alubias con sacramentos.", 1.0),
    (NARRATOR, 190, "Gon lo llama pardo fecal cuando quiere sonar técnico. Y color caca cuando habla con su madre, que es siempre.", 0.8),
    (MADRE, 170, "Hijo, todos los colores del mundo y tú vas y eliges el de la mierda.", 0.8),
    (GON, 145, "Es el único color honesto, ama. Todos los demás están intentando ser otra cosa.", 1.0),
    (NARRATOR, 190, "Su madre llamó a un primo que era psicólogo en Barakaldo.", 0.6),
    (TXEMA, 200, "Eso o es un genio o es subnormal.", 0.6),
    (NARRATOR, 190, "La respuesta correcta era las dos cosas.", 2.0),

    # === LA COPISTERÍA ===
    (NARRATOR, 190, "Gon trabajaba en una copistería de Indautxu. Hacía fotocopias. No bien. No rápido. Las hacía con una lentitud litúrgica, como si cada copia fuera un acto sagrado.", 0.8),
    (NARRATOR, 190, "Un opositor le pidió 200 copias del temario de auxiliar administrativo. Gon hizo 200 copias. Todas estaban al revés.", 0.8),
    (OPOSITOR, 190, "Están al revés.", 0.5),
    (GON, 140, "No. Estaban bien. Es el temario el que está al revés.", 0.6),
    (OPOSITOR, 195, "¿Qué?", 0.4),
    (GON, 140, "El temario. Empieza por el principio. Eso no tiene sentido. Si empiezas por el principio nunca entiendes por qué importa el final. Hay que leerlo al revés.", 0.8),
    (OPOSITOR, 195, "Tío, son las bases del concurso oposición de la Diputación Foral de Bizkaia.", 0.6),
    (GON, 140, "Ya. Por eso nadie aprueba.", 1.5),
    (NARRATOR, 190, "El opositor suspendió por séptima vez en noviembre.", 2.0),

    # === FLIPAR DE NO FLIPAR ===
    (NARRATOR, 190, "Txema le preguntó un día en la copistería.", 0.6),
    (TXEMA, 200, "Tío, ¿nunca te duele la cabeza?", 0.4),
    (GON, 140, "No.", 0.4),
    (TXEMA, 200, "¿Nunca nunca?", 0.4),
    (GON, 140, "Nunca.", 0.5),
    (TXEMA, 200, "Eso no es normal.", 0.4),
    (GON, 140, "Ya.", 0.8),
    (GON, 145, "¿Sabes qué es lo que más me flipa?", 0.5),
    (TXEMA, 195, "¿Qué?", 0.4),
    (GON, 150, "Que no me flipa nada. En serio. ¿No te parece flipante que no me flipe nada? Debería fliparme. He leído sobre agujeros negros. Sobre la 2 C B. Sobre cómo los pulpos tienen tres corazones. Tres corazones, Txema. Y no me flipa. Leo eso y pienso... vale. ¿No es eso lo más flipante del mundo? Que lo más flipante del mundo no me haga flipar.", 1.5),
    (NARRATOR, 190, "Txema se fue al baño a replantearse varias cosas.", 2.0),

    # === 21-EDO ===
    (NARRATOR, 190, "Gon tocaba el saxo por las noches en Lehendakari Aguirre. Un saxo tenor al que le había soldado tres llaves extra.", 0.6),
    (NARRATOR, 190, "Alguien le preguntó por qué no tocaba normal.", 0.6),
    (GON, 145, "¿Normal? ¿12 notas? ¿En serio? Hay infinitas frecuencias entre un Do y un Re, y los europeos del siglo dieciocho decidieron que solo existían doce. Y os lo habéis tragado durante 300 años. Es como si alguien te dijera que solo existen siete colores y tú dijeras vale.", 1.0),
    (TXEMA, 200, "¿Pero suena bien?", 0.4),
    (GON, 140, "No.", 0.4),
    (TXEMA, 200, "¿Entonces?", 0.4),
    (GON, 145, "Que suene bien es propaganda. Suena bien significa suena a lo que estás acostumbrado. La heroína también sienta bien. No la meto.", 0.8),
    (NARRATOR, 190, "Esto lo dijo un tío que se había metido 2 C B la noche anterior. Pero la contradicción no le molestaba. Las contradicciones no le molestaban porque no las veía como contradicciones. Las veía como la misma cosa vista desde dos ángulos que los demás no son capaces de sostener simultáneamente porque les duele la cabeza.", 1.0),
    (NARRATOR, 190, "A Gon no le dolía la cabeza. Nunca.", 2.0),

    # === MANOLO DE CUENCA (CON ACENTO GALLEGO) ===
    (NARRATOR, 190, "Y entonces apareció Manolo.", 0.8),
    (NARRATOR, 190, "Manolo decía ser de Cuenca. Lo decía mucho. Lo decía constantemente. Lo decía cada vez que alguien le preguntaba algo, aunque la pregunta no tuviera nada que ver.", 0.8),
    (TXEMA, 200, "Manolo, ¿tienes hora?", 0.4),
    (MANOLO, 165, "Home, pois claro que teño hora, que soy de Cuenca, rapaz, alá en Cuenca siempre sabemos la hora porque los relojes de la catedral dan las campañadas que se oyen hasta Tragacete, ¿sabes?", 1.0),
    (NARRATOR, 190, "Manolo decía ser de Cuenca, pero hablaba con un acento gallego tan cerrado que parecía que estaba traduciendo simultáneamente desde otro idioma que solo existía dentro de su cabeza.", 0.8),
    (NARRATOR, 190, "Nadie sabía si Manolo era de Cuenca. Nadie sabía si era gallego. Nadie sabía si era una persona o un fenómeno meteorológico con DNI.", 0.6),
    (VECINO, 195, "Manolo, tú no eres de Cuenca.", 0.5),
    (MANOLO, 165, "¡Home, claro que soy de Cuenca, coño! ¿Non ves que teño el acento? ¡El acento conquense de toda la vida! ¡Mi abuelo era de Cuenca y mi abuela era de Cuenca y el perro era de Cuenca!", 0.8),
    (VECINO, 195, "Manolo, eso es acento gallego.", 0.5),
    (MANOLO, 170, "Non señor. Eso é acento de Cuenca. O que pasa é que a xente non coñece o verdadeiro acento conquense porque nunca foi a Cuenca. E se foron, foron á parte turística, non á parte auténtica onde falamos así.", 0.8),
    (NARRATOR, 190, "Nadie había ido jamás a la parte auténtica de Cuenca. Nadie estaba seguro de que existiera. Pero Manolo hablaba de ella con una convicción tan absoluta que era más fácil aceptarlo que discutirlo.", 1.0),
    (NARRATOR, 190, "Manolo apareció en Lehendakari Aguirre la tercera semana. Se plantó delante de Gon a las 3 de la mañana con un bocadillo de tortilla y una manta de cuadros.", 0.8),
    (MANOLO, 165, "Home, rapaz, eso que tocas é moi bonito. En Cuenca temos unha tradición de música así, ¿sabes? Os pastores tocaban frautas cun sistema de 21 notas xa no século catorce. Pero claro, eso non vo lo contan.", 0.8),
    (GON, 140, "Eso es mentira.", 0.5),
    (MANOLO, 170, "Home, claro que é mentira. Pero é unha mentira bonita, ¿non? E as mentiras bonitas son máis útiles que as verdades feas. En Cuenca sabemos eso.", 1.0),
    (NARRATOR, 190, "Gon se quedó mirándole. Era la primera vez en su vida que algo le parecía interesante.", 0.6),
    (GON, 145, "Eso que acabas de decir es lo más inteligente que he oído nunca.", 0.6),
    (MANOLO, 165, "Normal, rapaz. Soy de Cuenca.", 1.5),
    (NARRATOR, 190, "Gon no flipó. Pero casi. Y ese casi le flipó.", 2.0),

    # === ERTZAINTZA ===
    (NARRATOR, 190, "El primer vecino que llamó a la Ertzaintza fue el del tercero B.", 0.6),
    (VECINO, 200, "Hay un tío ahí abajo tocando algo que no es música y otro con acento gallego que dice que es de Cuenca comiéndose un bocadillo de tortilla.", 0.6),
    (OPERADORA, 180, "¿Ha consumido alguna sustancia?", 0.4),
    (VECINO, 200, "Una Alhambra. ¿Eso cuenta?", 1.0),
    (NARRATOR, 190, "La patrulla llegó a las 4 y 12.", 0.6),
    (ERTZAINA, 180, "¿Tiene permiso para esto?", 0.4),
    (GON, 140, "¿Permiso para qué?", 0.4),
    (ERTZAINA, 180, "Para eso.", 0.4),
    (GON, 140, "Es un saxofón.", 0.4),
    (ERTZAINA, 180, "Ya, pero lo que sale de ahí no es un saxofón. Mi compañero se ha mareado.", 0.5),
    (MANOLO, 165, "Home, agente, en Cuenca esto é completamente legal. Alá temos unha ordenanza municipal que permite a música microtonal entre as tres e as cinco da mañá. Artigo 47 bis.", 0.8),
    (ERTZAINA, 180, "Esto no es Cuenca.", 0.4),
    (MANOLO, 165, "¿Está usted seguro? Porque este barrio ten unha distribución urbanística moi similar á de Cuenca. Os edificios, as farolas, o asfalto mollado. Eu diría que esto é Cuenca.", 0.8),
    (ERTZAINA, 180, "Esto es Lehendakari Aguirre. Bilbao.", 0.4),
    (MANOLO, 170, "Home, pois será Bilbao. Pero ten alma de Cuenca.", 1.0),
    (NARRATOR, 190, "El ertzaina se fue. No porque le convencieran. Sino porque el concepto de que un barrio de Bilbao tenga alma de Cuenca le provocó un cortocircuito existencial del que no se recuperó hasta el viernes.", 2.0),

    # === RAMONCÍN ===
    (NARRATOR, 190, "Lo de Ramoncín pasó la segunda semana. Venía del dentista. Un dentista clandestino de Deusto que hacía endodoncias a las 2 de la mañana por 300 euros y sin preguntas.", 1.0),
    (NARRATOR, 190, "Iba andando con media cara hinchada de la anestesia, babeando por el lado izquierdo, cuando escuchó a Gon.", 0.8),
    (RAMONC, 140, "Etho eth punf.", 0.8),
    (GON, 140, "No es punk. Es microtonalismo.", 0.5),
    (RAMONC, 140, "Me da iguaf. Eth la hoztia. Yo en el zethenta y ziete hacía lo mizmo pero con trez acordez y una nabaja.", 1.0),
    (MANOLO, 165, "Home, ¿usted é Ramoncín? En Cuenca é usted moi famoso. Mi abuela tiña un poster suyo no cuarto de baño.", 0.6),
    (RAMONC, 140, "¿Eze tío é gallego?", 0.4),
    (GON, 140, "Dice que es de Cuenca.", 0.4),
    (RAMONC, 140, "Pues habla como mi cuñao de Ourenze.", 0.4),
    (MANOLO, 170, "Non señor, é acento conquense auténtico. O que pasa é que Ourense e Cuenca teñen as mesmas raíces fonéticas celtas. Pouca xente sabe eso.", 0.8),
    (RAMONC, 140, "Ezte tío me cae bien.", 1.5),
    (NARRATOR, 190, "Ramoncín se sentó en el banco de Manolo. Manolo le dio medio bocadillo de tortilla. Ramoncín babeó sobre el bocadillo. Manolo dijo que en Cuenca la tortilla se come así, con babas. Nadie le creyó. Pero nadie le contradijo.", 2.0),

    # === EL PERRO ===
    (NARRATOR, 190, "Lo del perro pasó la cuarta semana. Era un perro enorme. Blanco. Con escamas o caspa. Nadie se acercó lo suficiente para comprobarlo.", 0.8),
    (JOKIN, 210, "Eso es Fújur.", 0.4),
    (GON, 140, "Fújur es un dragón.", 0.4),
    (JOKIN, 215, "Fújur es un perro enorme al que Alemania le puso alas y le llamó dragón de la suerte. Es la mayor estafa visual del cine europeo.", 0.6),
    (MANOLO, 165, "Home, en Cuenca temos un animal así. Chámase o Can da Serranía. É un perro enorme que aparece nas noites de lúa chea e come queso manchego. Pero eso non vo lo contan.", 0.8),
    (JOKIN, 210, "Manolo, los manchegos van a venir a por ti.", 0.5),
    (MANOLO, 165, "Non me importa. En Cuenca non temos medo.", 1.5),

    # === KOLDO ===
    (NARRATOR, 190, "La comunidad de vecinos convocó una junta extraordinaria. Begoña, la presidenta, mandó bajar a Koldo. Koldo pesaba 111 kilos y una vez había echado a un yonki del portal usando exclusivamente la mirada y un tenedor.", 1.0),
    (NARRATOR, 190, "Koldo volvió a los 20 minutos. Se sentó. Pidió una tila. Y dijo.", 0.8),
    (KOLDO, 150, "Le he escuchado tocar un solo de 4 minutos y he entendido por qué mi padre nunca me dijo que me quería. No voy a echarle.", 1.5),
    (BEGONA, 185, "Joder, Koldo.", 0.8),
    (KOLDO, 150, "Sí. Joder.", 0.8),
    (MANOLO, 165, "Home, en Cuenca os pais sempre din que queren ós fillos. É tradición conquense.", 0.5),
    (KOLDO, 150, "Manolo, cierra la boca o te la cierro yo.", 0.5),
    (MANOLO, 165, "Entendido, rapaz. En Cuenca tamén sabemos calar.", 1.0),
    (NARRATOR, 190, "Fue la primera vez que Manolo se calló. Duró 11 segundos. Un récord.", 2.0),

    # === ANE — LA PORTERA ===
    (NARRATOR, 190, "Lo de la portera del Athletic Femenino pasó la quinta semana. Se llamaba Ane. Medía 1 78. Tenía las manos más grandes del fútbol femenino vasco. Y vivía en el cuarto A del portal 47.", 1.0),
    (NARRATOR, 190, "El domingo anterior, un disparo de Nerea Eizagirre desde 25 metros. Un misil a la escuadra. Ane saltó. Rozó el balón. El balón pegó en el larguero. CLONC.", 0.8),
    (NARRATOR, 190, "Pero no podía dormir. Porque cada noche, Gon tocaba una nota que sonaba exactamente igual que el larguero.", 0.8),
    (NARRATOR, 190, "Ane bajó la quinta noche. En pijama del Athletic. Con el escudo y todo.", 0.8),
    (ANE, 185, "Eres tú.", 0.4),
    (GON, 140, "¿Yo qué?", 0.4),
    (ANE, 185, "La nota. La del larguero.", 0.4),
    (GON, 140, "Es un 7 cuartos de tono por encima del Mi natural.", 0.5),
    (ANE, 210, "¡Me da igual cómo se llame! Es EL LARGUERO. Y cada vez que la tocas yo revivo el minuto 93 y no puedo dormir y mañana tengo entreno a las 8 y si no duermo no paro y si no paro nos meten 5 y si nos meten 5 bajo a Segunda y si bajo a Segunda mi padre me dice te dije que hicieras la oposición y NO VOY A HACER LA PUTA OPOSICIÓN, ¿ME OYES?", 1.5),
    (NARRATOR, 190, "Hubo un silencio.", 0.8),
    (MANOLO, 165, "Home, en Cuenca as porteras non teñen ese problema porque os largueiros son de madeira de pino e non resoan.", 0.8),
    (ANE, 210, "¿QUIÉN COÑO ES ESTE Y POR QUÉ HABLA EN GALLEGO?", 0.6),
    (MANOLO, 165, "Non é gallego, señora. É acento conquense.", 0.5),
    (ANE, 200, "Me da igual de dónde seas. CÁLLATE.", 0.5),
    (MANOLO, 165, "En Cuenca as mulleres tamén teñen moito carácter. Por eso nos gustan.", 0.5),
    (KOLDO, 150, "Eso ha sido precioso.", 0.5),
    (ANE, 200, "Cállate, Koldo.", 0.4),
    (KOLDO, 150, "Me callo.", 2.0),

    # === EL GATO Y GON ===
    (NARRATOR, 190, "Gon dejó de tocar esa noche. No por Ane. Porque Ane le había hecho ver que la nota del larguero y la nota prohibida eran la misma.", 1.0),
    (NARRATOR, 190, "El universo no era un compilador. Era un larguero. Y toda la realidad era un disparo a escuadra que alguien ejecutaba continuamente.", 1.0),
    (GON, 140, "Joder.", 0.8),
    (GATO, 130, "Joder.", 0.8),
    (GON, 140, "¿Has vuelto a hablar?", 0.5),
    (GATO, 130, "No.", 1.5),
    (MANOLO, 165, "Home, en Cuenca os gatos falan. É normal. O meu gato de Cuenca falaba e todo. Dicía cousas moi profundas. Unha vez díxome: Manolo, non es de Cuenca.", 0.8),
    (NARRATOR, 190, "Hubo otro silencio. Este era diferente. Este era el silencio de seis personas y un perro mitológico mirando a un hombre que acababa de admitir que su propio gato le había dicho que no era de Cuenca.", 1.5),
    (GON, 145, "Manolo.", 0.4),
    (MANOLO, 165, "¿Sí, rapaz?", 0.4),
    (GON, 145, "¿De dónde eres realmente?", 0.6),
    (MANOLO, 160, "Home... pois... a verdade... a verdade é que non o sei.", 0.8),
    (NARRATOR, 190, "Y por primera vez, Manolo no sonreía. Y por primera vez, Gon flipó.", 0.6),
    (NARRATOR, 190, "No flipó por los agujeros negros. No flipó por los tres corazones de los pulpos. No flipó por la 21 EDO ni por el larguero ni por el gato que hablaba. Flipó por un hombre que había construido toda su identidad alrededor de un sitio que quizá no era el suyo, y que era lo bastante honesto para admitirlo delante de un perro con caspa a las 4 de la mañana.", 1.5),
    (GON, 145, "Eso... eso sí que me flipa.", 0.8),
    (MANOLO, 160, "¿O qué?", 0.4),
    (GON, 145, "Que no sepas de dónde eres y sigas aquí. Comiendo tortilla. A las 4 de la mañana. En un sitio que dices que es Cuenca y que todos sabemos que no lo es. Y que te dé igual. Eso es lo más valiente que he visto.", 1.5),
    (MANOLO, 165, "Home, rapaz... grazas.", 0.6),
    (GON, 145, "¿Cuál es tu color favorito?", 0.5),
    (MANOLO, 160, "Pardo.", 0.5),
    (GON, 140, "¿Pardo como de qué?", 0.4),
    (MANOLO, 160, "Pardo fecal. Como o color da terra de Cuenca despois da choiva.", 0.8),
    (NARRATOR, 190, "Gon sonrió. Era la segunda vez que sonreía en su vida. La primera fue cuando su madre le dijo de pequeño que podía ser lo que quisiera, y él dijo fotocopiador.", 2.0),

    # === EPÍLOGO ===
    (NARRATOR, 175, "Gon sigue tocando cada noche en Lehendakari Aguirre.", 1.0),
    (NARRATOR, 175, "Manolo sigue diciendo que es de Cuenca. Nadie le cree. A nadie le importa. Le dejan quedarse porque trae tortilla.", 1.0),
    (NARRATOR, 175, "Ane paró un penalti el domingo siguiente. Dijo que oyó la frecuencia del balón antes del disparo. Su entrenador apuntó comillas, intuición, cerrar comillas.", 1.0),
    (NARRATOR, 175, "Ramoncín sacó un EP de 3 temas. Se llama Endodonzia Punk. Suena a un hombre de 70 años con la mandíbula dormida que ha visto la verdad.", 1.0),
    (NARRATOR, 175, "Jokin publicó su paper. Se titula: Efectos psicoacústicos de intervalos no temperados en la activación de electrodomésticos residenciales. Un estudio de campo en el Gran Bilbao. Tiene 6 citas. 4 son suyas.", 1.0),
    (NARRATOR, 175, "El perro sigue ahí. Come txistorra con la dignidad de quien ha volado sobre Fantasía y ha decidido que Lehendakari Aguirre es mejor porque aquí la txistorra es real.", 1.5),
    (NARRATOR, 175, "Y la farola del portal 47 sigue fundida.", 1.5),
    (NARRATOR, 170, "Pero algunas noches, si pasas por ahí a las 3 47 y el aire está lo bastante húmedo, puedes oír a un saxo tocando una nota que no está en ningún afinador. Y a un hombre comiendo tortilla diciendo que eso en Cuenca es completamente normal.", 2.5),
    (NARRATOR, 160, "Mañana puede que suene distinta.", 1.0),
    (MANOLO, 155, "Home, en Cuenca sempre soa distinta.", 2.0),
]


def generate_segment(voice, rate, text, index):
    """Generate a single TTS segment."""
    aiff_path = f"{SCRATCH}/seg_{index:03d}.aiff"
    wav_path = f"{SCRATCH}/seg_{index:03d}.wav"
    
    subprocess.run([
        "say", "-v", voice, "-r", str(rate),
        "-o", aiff_path, text
    ], check=True)
    
    subprocess.run([
        "afconvert", "-f", "WAVE", "-d", "LEI16@44100",
        aiff_path, wav_path
    ], check=True)
    
    return wav_path


def load_wav_mono(path):
    """Load WAV mono float."""
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        rate, data = wavfile.read(path)
    if data.dtype == np.int16:
        data = data.astype(np.float64) / 32768.0
    elif data.dtype == np.int32:
        data = data.astype(np.float64) / 2147483648.0
    if len(data.shape) > 1:
        data = data.mean(axis=1)
    if rate != SR:
        n_samples = int(len(data) * SR / rate)
        data = resample(data, n_samples)
    return data


def main():
    print("=" * 60)
    print("GON Y EL INTERVALO PROHIBIDO — v2 SUBNORMAL")
    print("Con Manolo de Cuenca (acento gallego)")
    print("=" * 60)
    
    segments = []
    for i, (voice, rate, text, pause) in enumerate(SCRIPT):
        char = voice.split("(")[0].strip() if "(" in voice else voice
        short = text[:55].replace('\n', ' ')
        print(f"  [{i+1:02d}/{len(SCRIPT)}] {char}: {short}...")
        wav_path = generate_segment(voice, rate, text, i)
        audio = load_wav_mono(wav_path)
        segments.append((audio, pause))
    
    print("\nConcatenating...")
    all_audio = []
    for audio, pause in segments:
        all_audio.append(audio)
        all_audio.append(np.zeros(int(pause * SR)))
    
    narration = np.concatenate(all_audio)
    narration = narration / np.max(np.abs(narration)) * 0.85
    
    output_path = f"{OUT_DIR}/gon_v2_subnormal.wav"
    audio_16bit = (narration * 32767).astype(np.int16)
    wavfile.write(output_path, SR, audio_16bit)
    
    duration = len(narration) / SR
    print(f"\nOutput: {output_path}")
    print(f"Duration: {duration:.0f}s ({duration/60:.1f} min)")
    print(f"Size: {len(audio_16bit) * 2 / 1024 / 1024:.1f} MB")
    print(f"Segments: {len(SCRIPT)}")
    print("\n∴ 'Home, en Cuenca sempre soa distinta.' — Manolo")


if __name__ == "__main__":
    main()
