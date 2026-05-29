#!/usr/bin/env python3
"""
GON Y EL INTERVALO PROHIBIDO — Versión Musical Subnormal
=========================================================
C5-REAL | La narración se convierte en un musical continuo.
La música evoluciona según la escena, mezclándose con las voces de say.
"""

import subprocess
import os
import numpy as np
import warnings
from scipy.io import wavfile
from scipy.signal import resample, butter, lfilter

SR = 44100
OUT_DIR = "/Users/borjafernandezangulo/Desktop"
SCRATCH = "/tmp/gon_v2"
os.makedirs(SCRATCH, exist_ok=True)

# === VOICE ASSIGNMENTS ===
NARRATOR = "Mónica"
GON = "Reed (Español (España))"
TXEMA = "Rocko (Español (España))"
VECINO = "Eddy (Español (España))"
OPERADORA = "Flo (Español (España))"
ERTZAINA = "Eddy (Español (España))"
MANOLO = "Rocko (Español (México))"
RAMONC = "Grandpa (Español (España))"
KOLDO = "Rocko (Español (España))"
ANE = "Flo (Español (España))"
JOKIN = "Sandy (Español (España))"
GATO = "Shelley (Español (España))"
BEGONA = "Grandma (Español (España))"
MADRE = "Grandma (Español (México))"
OPOSITOR = "Eddy (Español (México))"

# ============================================================
# DIALOG SCRIPT DEFINITION
# ============================================================
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

# === SYNTHESIS UTILITIES ===

def night_ambience_mod(t):
    noise = np.random.randn(len(t)) * 0.01
    b, a = butter(2, 150 / (SR / 2), btype='low')
    rumble = lfilter(b, a, noise)
    
    wind_mod = 0.5 + 0.5 * np.sin(2 * np.pi * 0.05 * t)
    wind_noise = np.random.randn(len(t)) * 0.003 * wind_mod
    b_w, a_w = butter(2, [300 / (SR / 2), 800 / (SR / 2)], btype='band')
    wind = lfilter(b_w, a_w, wind_noise)
    
    return rumble + wind

def edo21_freq(base_freq, steps):
    return base_freq * (2 ** (steps / 21.0))

def saxophone_synth(freq, t_phase, expression):
    harmonics = [
        (1, 1.0),
        (2, 0.6),
        (3, 0.8),
        (4, 0.35),
        (5, 0.65),
        (6, 0.2),
        (7, 0.5),
    ]
    sig = np.zeros_like(t_phase)
    for n, amp in harmonics:
        h_freq = freq * n
        formant_boost = 1.6 if 1500 < h_freq < 3000 else 1.0
        vibrato = 1.0 + 0.004 * np.sin(2 * np.pi * (5.0 + n * 0.15) * t_phase)
        sig += amp * formant_boost * np.sin(2 * np.pi * h_freq * vibrato * t_phase)
    
    noise = np.random.randn(len(t_phase)) * 0.015 * expression
    b, a = butter(2, [800 / (SR/2), 3500 / (SR/2)], btype='band')
    breath = lfilter(b, a, noise)
    
    return (sig * expression) + breath

def larguero_resonance(t_local):
    freqs = [1247, 2089, 3351, 4217, 5683, 7129]
    decays = [2.5, 1.7, 1.1, 0.7, 0.4, 0.2]
    amps = [1.0, 0.65, 0.45, 0.3, 0.15, 0.08]
    
    metal = np.zeros_like(t_local)
    for f, d, amp in zip(freqs, decays, amps):
        env = amp * np.exp(-t_local / d)
        metal += env * np.sin(2 * np.pi * f * t_local)
        
    impact = np.exp(-t_local / 0.003) * 0.7 * np.random.randn(len(t_local))
    return metal + impact

def drum_sequencer(t, bpm, kick_pattern, snare_pattern, hat_pattern):
    """HI-SPEED step sequencer: precalculates unit drum hits to run in O(N)."""
    step_dur = 60.0 / (bpm * 4.0)
    samples_per_step = int(step_dur * SR)
    n_samples = len(t)
    
    kick_sig = np.zeros(n_samples)
    snare_sig = np.zeros(n_samples)
    hat_sig = np.zeros(n_samples)
    
    kick_len = int(0.4 * SR)
    snare_len = int(0.4 * SR)
    hat_len = int(0.08 * SR)
    
    # Pre-calculate Kick
    t_k = np.arange(kick_len) / SR
    freq_sweep = 140.0 * np.exp(-t_k / 0.08) + 45.0
    kick_hit = np.sin(2 * np.pi * freq_sweep * t_k) * np.exp(-t_k / 0.15)
    
    # Pre-calculate Snare
    t_s = np.arange(snare_len) / SR
    noise_s = np.random.randn(snare_len) * np.exp(-t_s / 0.18)
    b, a = butter(2, [300 / (SR/2), 2500 / (SR/2)], btype='band')
    snare_hit = lfilter(b, a, noise_s)
    snare_hit += np.sin(2 * np.pi * 180 * t_s) * np.exp(-t_s / 0.08) * 0.3
    
    # Pre-calculate Hat
    t_h = np.arange(hat_len) / SR
    noise_h = np.random.randn(hat_len) * np.exp(-t_h / 0.03) * 0.15
    b_h, a_h = butter(2, 6000 / (SR/2), btype='high')
    hat_hit = lfilter(b_h, a_h, noise_h)
    
    num_steps = int(t[-1] / step_dur) + 2
    for step_idx in range(num_steps):
        step_start_sample = int(step_idx * samples_per_step)
        if step_start_sample >= n_samples:
            break
            
        if kick_pattern[step_idx % len(kick_pattern)]:
            chunk_len = min(kick_len, n_samples - step_start_sample)
            kick_sig[step_start_sample:step_start_sample + chunk_len] = np.maximum(
                kick_sig[step_start_sample:step_start_sample + chunk_len],
                kick_hit[:chunk_len]
            )
            
        if snare_pattern[step_idx % len(snare_pattern)]:
            chunk_len = min(snare_len, n_samples - step_start_sample)
            snare_sig[step_start_sample:step_start_sample + chunk_len] = np.maximum(
                snare_sig[step_start_sample:step_start_sample + chunk_len],
                snare_hit[:chunk_len]
            )
            
        if hat_pattern[step_idx % len(hat_pattern)]:
            chunk_len = min(hat_len, n_samples - step_start_sample)
            hat_sig[step_start_sample:step_start_sample + chunk_len] = np.maximum(
                hat_sig[step_start_sample:step_start_sample + chunk_len],
                hat_hit[:chunk_len]
            )
            
    return kick_sig * 0.5 + snare_sig * 0.4 + hat_sig * 0.2

# === COMPOSITIONS PER PHASE ===

def get_musical_backing_track(phase_name, duration, start_offset):
    t = np.arange(int(duration * SR)) / SR
    E4 = 329.63
    pardo_steps = [0, 3, 7, 10, 12, 15, 18]
    
    if phase_name == 'title':
        amb = night_ambience_mod(t)
        sub = np.sin(2 * np.pi * 14.7 * t) * (0.3 + 0.1 * np.sin(2 * np.pi * 0.1 * t))
        return amb * 0.4 + sub * 0.3
        
    elif phase_name == 'intro':
        amb = night_ambience_mod(t)
        drums = drum_sequencer(t, 80, 
                               [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                               [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                               [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0])
        bar_len = 60.0 / 80.0 * 4.0
        bar_idx = int(start_offset / bar_len)
        chord_root = E4 / 8.0
        if bar_idx % 4 == 0: root_f = edo21_freq(chord_root, 0)
        elif bar_idx % 4 == 1: root_f = edo21_freq(chord_root, 3)
        elif bar_idx % 4 == 2: root_f = edo21_freq(chord_root, 7)
        else: root_f = edo21_freq(chord_root, 5)
        
        bass = np.sin(2 * np.pi * root_f * t) * 0.35
        sax = np.zeros_like(t)
        if duration > 10:
            sax_t = np.arange(int(min(8, duration) * SR)) / SR
            sax_freq = edo21_freq(E4, 7)
            sax_env = np.sin(np.pi * (sax_t / sax_t[-1])) * 0.25
            sax_note = saxophone_synth(sax_freq, sax_t, sax_env)
            sax_start = int(len(t) * 0.3)
            sax[sax_start:sax_start + len(sax_note)] = sax_note
            
        return (amb * 0.35 + drums * 0.3 + bass + sax) * 0.7
        
    elif phase_name == 'copisteria':
        drums = drum_sequencer(t, 92,
                               [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                               [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
                               [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
        step_dur = 60.0 / (92.0 * 2.0)
        bass = np.zeros_like(t)
        base_f = edo21_freq(E4 / 8.0, 3)
        for step in range(int(duration / step_dur) + 2):
            s_start = int(step * step_dur * SR)
            if s_start >= len(t): break
            t_loc = t[s_start:s_start + int(step_dur * SR)]
            f = base_f * 2.0 if step % 2 == 1 else base_f
            env = np.exp(-t_loc / 0.1) * 0.3
            bass[s_start:s_start + len(t_loc)] = np.sin(2 * np.pi * f * t_loc) * env
            
        laser = np.zeros_like(t)
        laser_interval = int(4.0 * SR)
        for idx in range(0, len(t), laser_interval):
            sweep_len = int(1.2 * SR)
            if idx + sweep_len >= len(t): break
            t_sweep = np.arange(sweep_len) / SR
            f_sweep = 1200.0 * np.exp(-t_sweep / 0.5) + 300.0
            sweep = np.sin(2 * np.pi * f_sweep * t_sweep) * np.exp(-t_sweep / 0.8) * 0.08
            laser[idx:idx + sweep_len] = sweep
            
        return (drums * 0.35 + bass * 0.45 + laser) * 0.75
        
    elif phase_name == 'flipar':
        drums = drum_sequencer(t, 75,
                               [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                               [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                               [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0])
        step_dur = 60.0 / 75.0 * 2.0
        bass = np.zeros_like(t)
        for step in range(int(duration / step_dur) + 2):
            s_start = int(step * step_dur * SR)
            if s_start >= len(t): break
            t_loc = t[s_start:s_start + int(step_dur * SR)]
            note_idx = pardo_steps[step % len(pardo_steps)]
            f = edo21_freq(E4 / 8.0, note_idx)
            bass[s_start:s_start + len(t_loc)] = np.sin(2 * np.pi * f * t_loc) * np.exp(-t_loc / 1.0) * 0.4
            
        return (drums * 0.3 + bass * 0.5) * 0.8
        
    elif phase_name == 'edo':
        backing = np.zeros_like(t)
        cluster = [0, 5, 7, 12, 19]
        for note in cluster:
            freq = edo21_freq(E4 / 2.0, note)
            vol_swell = 0.15 * np.sin(2 * np.pi * (0.05 + note*0.01) * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * t))
            backing += np.sin(2 * np.pi * freq * (1.0 + 0.005 * np.sin(2 * np.pi * 0.5 * t)) * t) * vol_swell
            
        return backing * 0.5
        
    elif phase_name == 'manolo':
        drums = drum_sequencer(t, 104,
                               [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
                               [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                               [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1])
        drone = np.sin(2 * np.pi * edo21_freq(E4 / 4.0, 5) * t) * 0.15
        drone += np.sin(2 * np.pi * edo21_freq(E4 / 2.0, 5) * t) * 0.08
        
        melody = np.zeros_like(t)
        step_dur = 60.0 / 104.0
        melody_notes = [5, 7, 10, 12, 10, 7, 5, 0, 3, 5, 7, 5, 3, 0, 3, 5]
        for step in range(int(duration / step_dur) + 2):
            s_start = int(step * step_dur * SR)
            if s_start >= len(t): break
            t_loc = t[s_start:s_start + int(step_dur * SR)]
            note = melody_notes[step % len(melody_notes)]
            f = edo21_freq(E4 * 1.5, note)
            env = np.sin(np.pi * (t_loc / step_dur)) * 0.12
            noise = np.random.randn(len(t_loc)) * 0.005
            whistle = np.sin(2 * np.pi * f * t_loc) * env + noise * env
            melody[s_start:s_start + len(t_loc)] = whistle
            
        return (drums * 0.35 + drone + melody) * 0.75
        
    elif phase_name == 'ertzaintza':
        drums = drum_sequencer(t, 120,
                               [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                               [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                               [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0])
        step_dur = 60.0 / (120.0 * 2.0)
        bass = np.zeros_like(t)
        for step in range(int(duration / step_dur) + 2):
            s_start = int(step * step_dur * SR)
            if s_start >= len(t): break
            t_loc = t[s_start:s_start + int(step_dur * SR)]
            note = 0 if (step // 4) % 2 == 0 else 3
            f = edo21_freq(E4 / 8.0, note)
            wave = np.sign(np.sin(2 * np.pi * f * t_loc)) * np.exp(-t_loc / 0.12) * 0.2
            bass[s_start:s_start + len(t_loc)] = wave
            
        siren_mod = np.sin(2 * np.pi * 0.4 * t)
        siren_freq = 600.0 + 300.0 * siren_mod
        siren = np.sin(2 * np.pi * siren_freq * t) * 0.03
        
        return (drums * 0.4 + bass + siren) * 0.7
        
    elif phase_name == 'ramonc':
        drums = drum_sequencer(t, 145,
                               [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                               [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                               [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
        step_dur = 60.0 / 145.0 * 2.0
        guitar = np.zeros_like(t)
        chord_prog = [0, 7, 3, 5]
        for step in range(int(duration / step_dur) + 2):
            s_start = int(step * step_dur * SR)
            if s_start >= len(t): break
            t_loc = t[s_start:s_start + int(step_dur * SR)]
            chord_root = E4 / 4.0
            root_step = chord_prog[step % len(chord_prog)]
            f1 = edo21_freq(chord_root, root_step)
            f2 = edo21_freq(chord_root, root_step + 12)
            
            saw1 = (t_loc * f1) % 1.0 - 0.5
            saw2 = (t_loc * f2) % 1.0 - 0.5
            ch = saw1 + saw2
            guitar_dist = np.tanh(ch * 15.0) * 0.15
            guitar[s_start:s_start + len(t_loc)] = guitar_dist
            
        return (drums * 0.35 + guitar) * 0.7
        
    elif phase_name == 'fujur':
        drums = drum_sequencer(t, 95,
                               [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                               [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
                               [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0])
        pad = np.zeros_like(t)
        chord_steps = [[0, 7, 12], [3, 10, 15], [5, 12, 17], [2, 9, 14]]
        step_dur = 60.0 / 95.0 * 4.0
        for bar in range(int(duration / step_dur) + 2):
            s_start = int(bar * step_dur * SR)
            if s_start >= len(t): break
            t_loc = t[s_start:s_start + int(step_dur * SR)]
            chord = chord_steps[bar % len(chord_steps)]
            
            bar_pad = np.zeros_like(t_loc)
            for note in chord:
                f = edo21_freq(E4 / 2.0, note)
                v1 = np.sin(2 * np.pi * f * (1.0 + 0.003 * np.sin(2 * np.pi * 6 * t_loc)) * t_loc)
                v2 = np.sin(2 * np.pi * (f * 1.01) * (1.0 + 0.002 * np.cos(2 * np.pi * 5.5 * t_loc)) * t_loc)
                bar_pad += v1 + v2
            env = np.sin(np.pi * (t_loc / step_dur)) * 0.12
            pad[s_start:s_start + len(t_loc)] = bar_pad * env
            
        return (drums * 0.3 + pad) * 0.75
        
    elif phase_name == 'koldo':
        drums = drum_sequencer(t, 78,
                               [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                               [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                               [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0])
        piano = np.zeros_like(t)
        step_dur = 60.0 / 78.0 * 2.0
        chord_prog = [[0, 7], [3, 10], [5, 12], [7, 14]]
        for step in range(int(duration / step_dur) + 2):
            s_start = int(step * step_dur * SR)
            if s_start >= len(t): break
            t_loc = t[s_start:s_start + int(step_dur * SR)]
            chord = chord_prog[step % len(chord_prog)]
            p_chord = np.zeros_like(t_loc)
            for note in chord:
                f = edo21_freq(E4 / 4.0, note)
                p_chord += np.sin(2 * np.pi * f * t_loc) * np.exp(-t_loc / 1.5)
            piano[s_start:s_start + len(t_loc)] = p_chord * 0.25
            
        return (drums * 0.3 + piano) * 0.8
        
    elif phase_name == 'ane':
        drone = np.sin(2 * np.pi * 14.7 * t) * 0.25
        amb = night_ambience_mod(t) * 0.35
        clonk = np.zeros_like(t)
        if len(t) > 0:
            clonk_t = np.arange(min(len(t), int(3.0 * SR))) / SR
            clonk[:len(clonk_t)] = larguero_resonance(clonk_t) * 0.3
            
        return drone + amb + clonk
        
    elif phase_name == 'ane_clonk':
        step_dur = 60.0 / 93.0
        drums = drum_sequencer(t, 93,
                               [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
                               [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                               [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
        
        clonks = np.zeros_like(t)
        samples_per_beat = int(step_dur * SR)
        for beat in range(int(duration / step_dur) + 2):
            if beat % 4 == 1 or beat % 4 == 3:
                s_start = int(beat * samples_per_beat)
                if s_start >= len(t): break
                t_loc = t[s_start:s_start + min(len(t) - s_start, int(2.5 * SR))]
                clonk_hit = larguero_resonance(t_loc) * 0.45
                clonks[s_start:s_start + len(t_loc)] = np.maximum(clonks[s_start:s_start + len(t_loc)], clonk_hit)
                
        g_drone = np.tanh(np.sin(2 * np.pi * edo21_freq(E4 / 8.0, 7) * t) * 6.0) * 0.15
        
        return (drums * 0.35 + clonks + g_drone) * 0.8
        
    elif phase_name == 'gato':
        drums = drum_sequencer(t, 88,
                               [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                               [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                               [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0])
        step_dur = 60.0 / (88.0 * 2.0)
        arp = np.zeros_like(t)
        scale = [0, 7, 12, 19, 12, 7]
        for step in range(int(duration / step_dur) + 2):
            s_start = int(step * step_dur * SR)
            if s_start >= len(t): break
            t_loc = t[s_start:s_start + int(step_dur * SR)]
            note = scale[step % len(scale)]
            f = edo21_freq(E4, note)
            filter_env = np.sin(np.pi * (t_loc / step_dur))
            sig = np.sin(2 * np.pi * f * t_loc) * filter_env * 0.15
            arp[s_start:s_start + len(t_loc)] = sig
            
        return (drums * 0.3 + arp) * 0.85
        
    elif phase_name == 'revelation':
        sig = np.zeros_like(t)
        slide_rate = 0.05
        for octave in [0.5, 1.0, 2.0]:
            f_slide = E4 * octave * (2.0 ** (slide_rate * t))
            sig += np.sin(2 * np.pi * f_slide * t) * 0.15
            
        sig += np.sin(2 * np.pi * (40.0 + 10.0 * t) * t) * 0.15
        noise = np.random.randn(len(t)) * 0.01
        
        return (sig + noise) * 0.7
        
    elif phase_name == 'pardo':
        t_phase = t
        sax_freq = edo21_freq(E4 / 2.0, 7)
        sax1 = saxophone_synth(sax_freq, t_phase, 0.25)
        
        fifth_freq = edo21_freq(sax_freq, 12)
        sax2 = saxophone_synth(fifth_freq, t_phase, 0.18)
        
        sub = np.sin(2 * np.pi * 14.7 * t) * 0.25
        
        return (sax1 + sax2 + sub) * 0.85
        
    elif phase_name == 'epilogue':
        amb = night_ambience_mod(t)
        drone = np.sin(2 * np.pi * E4 * t) * 0.15 * np.linspace(1, 0, len(t))
        return amb * 0.4 + drone
        
    else:
        return night_ambience_mod(t) * 0.15 * np.linspace(1, 0, len(t))


def main():
    print("=" * 60)
    print("GON Y EL INTERVALO PROHIBIDO — MUSICAL VERSION (C5-REAL)")
    print("Pre-calculated step sequencer (Fast execution)")
    print("=" * 60)
    
    print("Scanning voice segments...")
    segment_infos = []
    total_samples = 0
    
    phase_trig_indices = {
        0: 'title', 1: 'intro', 7: 'copisteria', 18: 'flipar', 31: 'edo',
        42: 'manolo', 63: 'ertzaintza', 81: 'ramonc', 95: 'fujur',
        103: 'koldo', 114: 'ane', 116: 'ane_clonk', 134: 'gato',
        143: 'revelation', 149: 'pardo', 151: 'epilogue'
    }
    
    phases_samples = []
    current_phase_name = 'title'
    current_phase_start = 0
    
    for i, (voice, rate, text, pause) in enumerate(SCRIPT):
        wav_path = f"{SCRATCH}/seg_{i:03d}.wav"
        
        if not os.path.exists(wav_path):
            char = voice.split("(")[0].strip() if "(" in voice else voice
            print(f"  [TTS] Generating missing voice {i}: {char}...")
            aiff_path = f"{SCRATCH}/seg_{i:03d}.aiff"
            subprocess.run(["say", "-v", voice, "-r", str(rate), "-o", aiff_path, text], check=True)
            subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@44100", aiff_path, wav_path], check=True)
            if os.path.exists(aiff_path):
                os.remove(aiff_path)
        
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            rate_wav, data = wavfile.read(wav_path)
        
        if len(data.shape) > 1:
            data = data.mean(axis=1)
        if rate_wav != SR:
            n_samples = int(len(data) * SR / rate_wav)
            data = resample(data, n_samples)
            
        duration_samples = len(data)
        pause_samples = int(pause * SR)
        
        start_sample = total_samples
        end_sample = start_sample + duration_samples
        
        segment_infos.append({
            'index': i,
            'audio': data / np.max(np.abs(data)) * 0.85 if np.max(np.abs(data)) > 0 else data,
            'start': start_sample,
            'end': end_sample,
            'pause_samples': pause_samples
        })
        
        total_samples = end_sample + pause_samples
        
        next_idx = i + 1
        if next_idx in phase_trig_indices:
            next_phase_name = phase_trig_indices[next_idx]
            phases_samples.append((current_phase_name, current_phase_start, total_samples))
            current_phase_name = next_phase_name
            current_phase_start = total_samples
            
    phases_samples.append((current_phase_name, current_phase_start, total_samples))
    
    print(f"\nTimeline established. Total duration: {total_samples / SR:.2f} seconds.")
    print("Synthesizing musical backing tracks...")
    
    full_backing = np.zeros(total_samples)
    for phase_name, start_s, end_s in phases_samples:
        duration_s = (end_s - start_s) / SR
        start_offset_s = start_s / SR
        print(f"  [backing] {phase_name.upper()} ({start_offset_s:.1f}s -> {end_s/SR:.1f}s, dur: {duration_s:.1f}s)...")
        backing_part = get_musical_backing_track(phase_name, duration_s, start_offset_s)
        
        limit_s = min(len(backing_part), end_s - start_s)
        full_backing[start_s:start_s + limit_s] = backing_part[:limit_s]
        
    print("\nMixing voice tracks on top of backing track...")
    mixed_audio = full_backing.copy()
    
    for seg in segment_infos:
        voice_audio = seg['audio']
        s_start = seg['start']
        s_end = seg['end']
        
        len_to_mix = min(len(voice_audio), len(mixed_audio) - s_start)
        
        # Superimpose voice with ducking (music down to 45%)
        mixed_audio[s_start:s_start + len_to_mix] = (
            mixed_audio[s_start:s_start + len_to_mix] * 0.45 +
            voice_audio[:len_to_mix] * 0.85
        )
        
    print("\nMastering final output...")
    mixed_audio = np.tanh(mixed_audio * 1.1)
    mixed_audio = mixed_audio / np.max(np.abs(mixed_audio)) * 0.9
    
    desktop_output = f"{OUT_DIR}/gon_v2_subnormal.wav"
    remotion_public_output = "/Users/borjafernandezangulo/Music/VISUALES/remotion-forge/public/gon_v2_subnormal.wav"
    
    audio_16bit = (mixed_audio * 32767).astype(np.int16)
    
    print(f"Saving to Desktop: {desktop_output}...")
    wavfile.write(desktop_output, SR, audio_16bit)
    
    print(f"Copying to Remotion public: {remotion_public_output}...")
    wavfile.write(remotion_public_output, SR, audio_16bit)
    
    print("\nSUCCESS! The musical soundtrack is completed and mixed.")
    print("∴ 'Home, en Cuenca sempre soa distinta.'")

if __name__ == "__main__":
    main()
