/**
 * ═══════════════════════════════════════════════════════════════════
 * EL GAMBITERO — Aventura Gráfica (20 Pantallas)
 * Point & Click · Decisiones · Ranking Arcade 3 Letras
 * Música borjamoskv · Estética Industrial Noir
 * ═══════════════════════════════════════════════════════════════════
 */

class ElGambitero {
  constructor() {
    this.currentScene = 0;
    this.score = 0;
    this.inventory = [];
    this.decisions = {};
    this.path = [];
    this.isActive = false;
    this.overlay = null;
    this.uiMode = 'boot';
    this.slotReturnScene = null;
    this.focusedChoiceIndex = 0;
    this.combo = 0;
    this.flow = 54;
    this.currentObjective = '';
    this.saveKey = 'gambitero_save';
    this.metaKey = 'gambitero_meta';
    this.boundKeyHandler = this._handleKeyDown.bind(this);

    // 🏆 Arcade Rankings
    this.rankings = JSON.parse(localStorage.getItem('gambitero_rankings') || '[]');

    // 🎵 Background music (borjamoskv)
    this.musicTracks = ['b9ktVQN48OU','x8E9HInpzE4','tMorCDfedf8','hsdOCzJpUMg','4Cb-Iu8DnJM'];
    this.chipAudioContext = null;
    this.chipMasterGain = null;
    this.chipMusicTimer = null;
    this.chipMusicPlaying = false;
    this.chipMusicStep = 0;
    this.chipTempo = 132;
    this.chipRootHz = 130.81;
    this.chipPatterns = this._createChipPatterns();
    this.chipTrackLabel = 'LYRIA 3 · LOCRIO LOOP';

    // 🎬 20 ESCENAS — Aventura Gráfica
    this.scenes = [
      {
        id: 0, title: "DESPERTAR ANGUSTIOSO",
        art: `<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_despertar.png" style="max-width:100%; border: 3px dashed #FF00A0; border-radius: 10px; max-height:250px;" alt="Nano Despierta">
        </div>`,
        text: "<strong>[ DISEÑA TU AVENTURA 2 ]</strong><br><br>Son las 12:00. Abres los ojos en Bilbao. Empieza el reloj de arena. Empieza el MÁXIMO CORTOCIRCUITO MENTAL: no tienes ni un gramo. Empieza el periplo agonizante de 11 horas en busca del escurridizo <strong>COSTO DE AGOSTO</strong> en Alonsotegi.",
        choices: [
          { text: "🛏️ Salir de la cama hiperventilando", next: 1, score: 10, item: null },
          { text: "😭 Morder la almohada y llorar", next: 0, score: -5, item: null }
        ]
      },
      {
        id: 1, title: "13:00 - PRIMEROS CONTACTOS",
        art: `
     ╔══════════════════════════════════╗
     ║  📱 NOKIA A LADRILLO             ║
     ║  > Contacto_7: "No hay ná"       ║
     ║  > Contacto_9: "Todo seco bro"   ║
     ║                                  ║
     ║               📞                 ║
     ╚══════════════════════════════════╝`,
        text: "Llevas una hora llamando a la vieja escuela. Todo el mundo está seco. La paranoia sube. El 'Costo de Agosto', secado bajo el sol del verano, parece un mito. ¿Qué haces?",
        choices: [
          { text: "🚇 Ir al Casco Viejo a preguntar a desconocidos", next: 2, score: 10, item: "Ansiedad_Nivel_1" },
          { text: "🚶 Tirarse en un banco a reflexionar", next: 3, score: -5, item: null }
        ]
      },
      {
        id: 2, title: "15:00 - LA TENTACIÓN PORTUGUESA",
        art: `<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_portugueses.png" style="max-width:100%; border: 3px dashed #FF5E00; border-radius: 10px; max-height:250px;" alt="Portugueses Casco Viejo">
        </div>`,
        text: "En un callejón oscuro del Casco Viejo, unos portugueses turbios te arrinconan. Te enseñan una cosa marrón que parece serrín de hámster mezclado con orégano. 'Es bellota pura de Lisboa, irmão'.",
        choices: [
          { text: "🏃 ¡Escapar! Eso es cáncer de pulmón", next: 4, score: 15, item: null },
          { text: "💵 Comprar el rastrojo por desesperación", next: 5, score: -50, item: "Rastrojo_Portugues" }
        ]
      },
      {
        id: 3, title: "EL BANCO DEL DESÁNIMO",
        art: `
     ╔══════════════════════════════════╗
     ║  🪑 BANCO DE MADERA              ║
     ║                                  ║
     ║   (Tu mente proyecta plumas      ║
     ║    de humo que se desvanecen)    ║
     ╚══════════════════════════════════╝`,
        text: "Pasan dos horas. La vida no tiene sentido sin polen. Ves a la gente caminar feliz, ignorantes del suplicio interior por el que estás pasando.",
        choices: [
          { text: "💪 Levantarse y luchar por el Costo", next: 2, score: 5, item: null },
          { text: "🎰 Bajar al pachinko clandestino a despejarte", next: 20, score: 0, item: null }
        ]
      },
      {
        id: 4, title: "17:00 - CANSANCIO EXTREMO",
        art: `<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_pulco_limon.png" style="max-width:100%; border: 3px dashed #FFF000; border-radius: 10px; max-height:250px;" alt="Bebiendo Pulco">
        </div>`,
        text: "Tus piernas pesan toneladas tras 5 horas de lluvia. Consigues robar una rancia botella de PULCO Limón concentrado. Te lo bebes a morro soltando lágrimas de puro ácido. Estás en la mierda.",
        choices: [
          { text: "🚶 Seguir pateando hacia Moyúa con el estómago revuelto", next: 6, score: 10, item: "Ansiedad_Nivel_2" },
          { text: "😭 Cruzar el túnel prohibido", next: 21, score: -5, item: null }
        ]
      },
      {
        id: 5, title: "INTOXICACIÓN LUSITANA",
        art: `
     ╔══════════════════════════════════╗
     ║  🤮 PULMONES DESTRUIDOS          ║
     ║                                  ║
     ║  El rastrojo sabe a asfalto.     ║
     ║  Has arruinado tu garganta       ║
     ║  sin colocarte.                  ║
     ╚══════════════════════════════════╝`,
        text: "Fumas la porquería que te han vendido. Tos severa, asma, odio infinito. Era perejil con grasa de patinete eléctrico. ¡Menudo timo! Te juras no volver a ceder.",
        choices: [
          { text: "😠 Tirarlo a la ría y seguir buscando la Verdad", next: 4, score: 5, item: null }
        ]
      },
      {
        id: 6, title: "18:30 - EL MILAGRO (O NO)",
        art: `<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_porro_perfecto.png" style="max-width:100%; border: 3px dashed #00FF33; border-radius: 10px; max-height:250px;" alt="El Porro Perfecto">
        </div>`,
        text: "En Abando te cruzas a un colega legendario. Al verte la cara de cadáver, te regala un cañón magistral. Lo coges. Lo miras con devoción. Es tu salvación extrema... pero... <strong>ES TAN BONITO</strong>. Una reliquia cónica impecable.",
        choices: [
          { text: "😰 ¡Me da TANTA PENA fumarlo! (Lo guardas como oro)", next: 8, score: 30, item: "Porro_Intacto" },
          { text: "🔥 Encenderlo como un animal sin control", next: 7, score: -20, item: null }
        ]
      },
      {
        id: 7, title: "FUEGO IMPÍO",
        art: `
     ╔══════════════════════════════════╗
     ║  😭 EL ARREPENTIMIENTO           ║
     ║                                  ║
     ║  Te lo has fumado.               ║
     ║  Has destruido la belleza.       ║
     ║  Y el mono volverá en 1 hora.    ║
     ╚══════════════════════════════════╝`,
        text: "Lo destruyes a pulmón lleno. Satisfaces al bicho media hora, pero has quemado una obra de arte inigualable y tu odisea hacia el <strong>Costo de Agosto</strong> en Alonsotegi aún no ha terminado.",
        choices: [
          { text: "🚶 Caminar deprimido hacia Zorrozaurre", next: 9, score: 5, item: "Ansiedad_Nivel_3" }
        ]
      },
      {
        id: 8, title: "19:00 - EL TÓTEM DE MARÍA",
        art: `
     ╔══════════════════════════════════╗
     ║  💎 EL TÓTEM INTACTO            ║
     ║                                  ║
     ║   Lo contemplas.                 ║
     ║   Su sola existencia te calma.   ║
     ╚══════════════════════════════════╝`,
        text: "Has decidido no fumarlo. Te da excesiva pena estropearlo. Te consuelas oliéndolo suavemente como un sumiller. El colega te grita al irse: <em>'¡Cuidado en Alonsotegi, el Costo de Agosto sólo se lo dan a los puros de corazón!'</em>",
        choices: [
          { text: "🌉 Cruzar el puente hacia Zorroza con determinación", next: 9, score: 20, item: null },
          { text: "🎰 Bajar al Pachinko a echar una moneda para bendecirlo", next: 20, score: 0, item: null }
        ]
      },
      {
        id: 9, title: "20:00 - SED DESCONTROLADA",
        art: `<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_tanga_limon.png" style="max-width:100%; border: 3px dashed #FFF000; border-radius: 10px; max-height:250px;" alt="Tanga Limon">
        </div>`,
        text: "Bilbao oscurece bajo un sirimiri frío y asqueroso. De repente sientes la boca seca como el cartón. Rasgas un sobre vintage de <strong>TANGA LIMÓN</strong> y te comes el polvo efervescente directamente. Te quema la lengua, pero te revive.",
        choices: [
          { text: "🛤️ Caminar por las vías oscuras (Atajo)", next: 22, score: 15, item: null },
          { text: "🚗 Intentar hacer autostop a la desesperada", next: 10, score: -5, item: null },
          { text: "🌀 Entrar al Callejón de las Ilusiones (SCROLL)", next: 25, score: 20, item: null }
        ]
      },
      {
        id: 10, title: "EL KAMIKAZE DEL TECHNO",
        art: `
<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_kamikaze_techno.png" style="max-width:100%; border: 3px dashed #FF00A0; border-radius: 10px; max-height:250px;" alt="Corsa Neon Kamikaze">
        </div>`,
        text: "Te subes al coche de un flipado del techno que conduce fatal bajo la lluvia. Casi os estrelláis contra la estatua de Don Diego. Te suelta en medio de un polígono, mareado y peor que antes.",
        choices: [
          { text: "🏃 Correr vomitando por el polígono hasta la vía", next: 22, score: 5, item: null }
        ]
      },
      {
        id: 11, title: "21:30 - FRONTERA ALONSOTEGI",
        art: `
<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_alonsotegi_monte.png" style="max-width:100%; border: 3px dashed #00FF33; border-radius: 10px; max-height:250px;" alt="Frontera Alonsotegi">
        </div>`,
        text: "El gigantesco letrero reza 'Alonsotegi'. La caminata maratoniana de 9 horas y media te ha traído a la Meca del humo del norte. Dicen que el Costo de Agosto está en lo alto, cuidado por El Patrón.",
        choices: [
          { text: "⛰️ Empezar el ascenso al monte oscuro", next: 12, score: 20, item: null }
        ]
      },
      {
        id: 12, title: "22:15 - VUELVEN LOS PORTUGUESES",
        art: `<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_portugueses.png" style="max-width:100%; border: 3px dashed #FF5E00; border-radius: 10px; max-height:250px;" alt="Portugueses en la montaña">
        </div>`,
        text: "¡INACETABLE! Los asquerosos portugueses de Casco Viejo te han seguido a la montaña. Bajo la niebla, quieren venderte su serrín orégano porque conocen tus 10 horas de monazo asfixiante.",
        choices: [
          { text: "🔪 Engañarlos diciéndoles que eres la secreta de élite", next: 13, score: 30, item: null },
          { text: "🏃‍♂️ Empujarles ladera abajo y correr como un galgo", next: 13, score: 10, item: null },
          { text: "🤬 Enfrentarte sucio a ellos defendiendo a Pulco", next: 13, score: 15, item: null }
        ]
      },
      {
        id: 13, title: "22:45 - EL PATRÓN DE LA MONTAÑA",
        art: `
     ╔══════════════════════════════════╗
     ║  🧙‍♂️ EL PATRÓN EN LA NIEBLA      ║
     ║                                  ║
     ║  "Sólo los que controlan el      ║
     ║   deseo puro, verán agosto."     ║
     ╚══════════════════════════════════╝`,
        text: "Sobrevives al ataque lusitano. Al final del sendero, el legendario Patrón de Alonsotegi te bloquea el paso junto a una garita que parece mitad santuario, mitad oficina de Hacienda rural. Lleva una linterna, una carpeta con gomas y una autoridad absurda. <em>'Mortal. Has andado 10 horas y tres cuartos. Presenta justificante de pureza espiritual o vuelve a Bilbao por ventanilla B.'</em>",
        choices: [
          { text: "💎 Mostrarle que NO FUMASTE el Cañón Perfecto", requiresItem: "Porro_Intacto", next: 15, score: 100, item: "El_Costo_de_Agosto" },
          { text: "🤥 Mentorar sobre tu historial intachable", next: 14, score: -10, item: null }
        ]
      },
      {
        id: 14, title: "LA DECEPCIÓN DEL PATRÓN",
        art: `
     ╔══════════════════════════════════╗
     ║  😠 FALSO Y DÉBIL               ║
     ║                                  ║
     ║  El Patrón lee tu alma manchada  ║
     ║  y desesperada.                  ║
     ╚══════════════════════════════════╝`,
        text: "El Patrón huele tu ropa. Tu aura emite vibraciones de ansiedad, rastrojo y Pólvora Tanga Limón. No eres digno de rozar el material mítico. La barrera desciende frente a ti. Estás excomulgado de Alonsotegi.",
        choices: [
          { text: "😭 BAJAR A LLORAR AL CADAGUA (Game Over)", next: 19, score: -20, item: null }
        ]
      },
      {
        id: 15, title: "22:55 - LA REVELACIÓN MÁGICA",
        art: `<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_bilbao_greenhair.png" style="max-width:100%; border: 3px dashed #00FF33; border-radius: 10px; max-height:250px;" alt="El Costo de Agosto en Alonsotegi">
        </div>`,
        text: "<em>'Amaste más la belleza formal del porro que la vulgaridad de quemarlo impulsivamente... Has trascendido.'</em> El Patrón abre una nevera industrial enterrada en la roca. Dentro, flotando en luz verde y burocracia sagrada, reposa un lingote vegetal que zumba como si lo hubieran masterizado los dioses. <strong>EL COSTO DE AGOSTO.</strong> La montaña se inclina. La noche te reconoce.",
        choices: [
          { text: "🥺 Abrazar el bloque con lágrimas de polvo Tanga", next: 23, score: 30, item: null },
          { text: "🎰 Celebrarlo con una partida al pachinko montañés", next: 20, score: 0, item: null }
        ]
      },
      {
        id: 16, title: "23:00 !!! EL GRAN TRANCE",
        art: `
     ╔══════════════════════════════════╗
     ║  ⏰ 23:00                       ║
     ║                                  ║
     ║  RADIOHEAD ESPERA...             ║
     ║                                  ║
     ╚══════════════════════════════════╝`,
        text: "Exactamente a las 23:00 llegas a tu batcueva en Bilbao. Después de 11 horas horripilantes, asaltos gitanos, rastrojos, sed ácida y lluvia, el legendario Bloque reposa en tu mesa como si fuera un Emmy vegetal. Todo conduce a un último gesto. Si lo haces bien, la cuenta se cerrará en una cifra limpia y mesiánica: <strong>50</strong>.",
        choices: [
          { text: "📺 Preparar el Aliño Sagrado y conectar a Yorke", next: 17, score: 50, item: null }
        ]
      },
      {
        id: 17, title: "IN RAINBOWS FROM THE BASEMENT",
        art: `
<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_in_rainbows.png" style="max-width:100%; border: 3px dashed #FFF000; border-radius: 10px; max-height:250px;" alt="In Rainbows From The Basement">
        </div>`,
        text: "Te enciendes el cañón divino. Entras en YouTube y pones <em>In Rainbows: From the Basement</em>. A los primeros acordes de guitarra en el Sótano, Bilbao deja de ser una ciudad y pasa a ser un decorado cósmico. Se te recolocan los órganos, la lluvia pide perdón y cada minuto miserable del día se recompone como si un comité celestial de montaje hubiera decidido salvarte a última hora.",
        choices: [
          { text: "🎉 CERRAR LA CUENTA A 50 Y GRABAR TU GLORIA (FINAL 1: TRASCENDENCIA)", next: -1, score: 50, item: null }
        ]
      },
      {
        id: 19, title: "11 HORAS PARA LA NADA",
        art: `
     ╔══════════════════════════════════╗
     ║                                  ║
     ║      S I N     H U M O           ║
     ║                                  ║
     ║          00:00 AM                ║
     ╚══════════════════════════════════╝`,
        text: "Media noche. Sonaron las doce campanas. Tu odisea fue un fracaso humillante. Estás en la parada de Alonsotegi, bajo la lluvia, temblando de mono, el alma corrompida y recordando el asqueroso sabor del rastrojo.",
        choices: [
          { text: "😞 VER RANKING DEL FRACASO ABSOLUTO (FINAL 2: DERROTA MÁXIMA)", next: -1, score: 0, item: null }
        ]
      },
      // === SLOT MACHINE ===
      {
        id: 20, title: "🔥 SUPER MÁQUINA DE KANJIS 🔥",
        art: `<div id="gamb-slot-machine-mount"></div>`,
        text: "En medio de las náuseas, un neón parpadea: un Pachinko clandestino homologado por el Ministerio de la Mala Idea. La máquina promete regular tu destino mediante símbolos, ruido y deuda emocional. Jugar calma la ansiedad durante seis segundos pero te roba dignidad de carrera. Si sale pleno, igual no te salva la vida, pero al menos te da material para un spin-off.",
        choices: [
          { text: "🏃 VOLVER AL DRAMA PRINCIPAL COMO SI FUESE TU TRABAJO", next: 4, score: 0, item: null },
          { text: "🏁 ENTREGAR TU ALMA AL PACHINKO Y A LA DERIVA", next: -1, score: 0, item: null }
        ]
      },
      // === NANO SCRATCHING PEPON NIETO ===
      {
        id: 22, title: "21:00 - SCRATCHING SURREALISTA",
        art: `<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_bilbao_greenhair.png" style="max-width:100%; border: 5px dashed #00F0FF; border-radius: 10px; max-height:250px; animation: gamberro-shake 0.2s infinite;" alt="Nano Scratching">
        </div>`,
        text: "Llegas a un descampado a las 21:00. De repente, Nano (El Niño del Colacao) aparece levitando, haciendo scratching frenético sobre unos CDJs invisibles. De los altavoces imaginarios retumba la voz distorsionada de <strong>PEPÓN NIETO</strong> leyendo actas de comunidad, pequeñas humillaciones de oficina y frases de cuñado existencial a 160 BPM. Es una rave administrativa. Es un milagro cutre. Tu cerebro empieza a derretirse por la presión estética y funcionarial.",
        choices: [
          { text: "🎧 Bailar frenéticamente para invocar el Costo", next: 11, score: 50, item: "Locura_Audiovisual" },
          { text: "🏃‍♂️ Huir tapándote los oídos por el exceso de BPMs", next: 11, score: -10, item: null }
        ]
      },
      // === LA REVELACIÓN DE FRAN PEREA ===
      {
        id: 23, title: "23:00 !!! LA PINTADA DEL MURO",
        art: `<div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 2.5rem; color: #00FF33; border: 8px solid #FF00A0; padding: 20px; font-family: 'Bangers', cursive; transform: rotate(-4deg); box-shadow: 15px 15px 0px #FFF000; background: #000; display: inline-block; animation: ascii-pulse 0.5s infinite alternate;">
              FRAN PEREA<br>EL QUE LO LEA
            </div>
        </div>`,
        text: "Son las 23:00 exactas. Te das la vuelta con el sagrado bloque de Costo en las manos. En un muro desconchado, iluminado por una farola parpadeante, lees una pintada en spray rosa neón. En ese instante, la barrera invisible entre la ficción y el espectador colapsa como una persiana municipal. <strong>El juego acaba de romper la cuarta pared y pedirte el DNI.</strong> Una voz gutural te susurra al oído desde los auriculares de tu Mac: <em>'Tú eres Fran Perea... siempre lo fuiste'.</em> Las gaviotas aplauden. Una concejala imaginaria toma notas. El universo espera tu respuesta.",
        choices: [
          { text: "😳 Aceptar que eres Fran Perea y cantar 1+1 SON 7", next: 24, score: 100, item: "Identidad_Perea" },
          { text: "😱 ¡CERRAR LOS OJOS! Y volver al Plan Original", next: 16, score: -15, item: null }
        ]
      },
      {
        id: 24, title: "1 + 1 SON 7",
        art: `
     ╔══════════════════════════════════╗
     ║                                  ║
     ║  💥 T O D O  E S  S U E Ñ O 💥  ║
     ║                                  ║
     ║  Fran Perea despierta en el sofá.║
     ║                                  ║
     ║   🎮 DISEÑA TU AVENTURA 2        ║
     ║       D E S T R U I D A          ║
     ╚══════════════════════════════════╝`,
        text: "¡Abres los ojos en Bilbao de golpe! Todo ha sido un sueño hiperrealista. Te habías fumado un mañanero monumental y te quedaste K.O. tras llevar solo 20 minutos despierto. Miras a la mesa... ¡ESTÁ A REBOSAR! Hay porros, snacks, agua fría y una serenidad de sitcom imposible. No había que ir a Alonsotegi. Tu sufrimiento ha sido un piloto carísimo. ERES FRAN PEREA. ERES EL PROTAGONISTA. Y LA TEMPORADA CIERRA EN ALTO.",
        choices: [
          { text: "🎸 CANTAR 1+1 SON 7 Y CERRAR LA CUENTA A 50 (FINAL 3: FELICIDAD ABSOLUTA)", next: -1, score: 50, item: null }
        ]
      },
      // === GITANO ROBA BUEN HUMOR ===
      {
        id: 21, title: "EL TÚNEL TÓXICO",
        art: `<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_gitano_humor.png" style="max-width:100%; border: 3px dashed #00F0FF; border-radius: 10px; max-height:250px;" alt="El Gitano Vampiro">
        </div>`,
        text: "Tratas de acortar por un túnel lúgubre, pero un GITANO VAMPIRO con camisa desabrochada intercepta tu paso. 'Dame tu buena vibra, primo'. Lentamente, sientes cómo succiona literalmente la energía y el buen humor fuera de tu cuerpo.",
        choices: [
          { text: "🥶 Caer debilitado y desanimado... huir llorando (FINAL 2: FRACASO)", next: 19, score: -25, item: "Sin_Buen_Humor" },
          { text: "💥 Lanzarle Tanga de Limón a los ojos para cegarlo", next: 6, score: 50, item: null }
        ]
      },
      // === SCROLL LATERAL (SCENE 25) ===
      {
        id: 25, title: "EL CALLEJÓN DE LAS ILUSIONES",
        art: `<div class="gamb-horizontal-scroll">
          <div class="gamb-scroll-item">
            <img src="img/nano_despertar.png" alt="Ilusion 1">
            <p>EL PASADO<br><span>La Cama</span></p>
          </div>
          <div class="gamb-scroll-item">
            <img src="img/nano_portugueses.png" alt="Ilusion 2">
            <p>EL SUFRIMIENTO<br><span>Casco Viejo</span></p>
          </div>
          <div class="gamb-scroll-item">
            <img src="img/nano_pulco_limon.png" alt="Ilusion 3">
            <p>LA SED<br><span>Ácido Puro</span></p>
          </div>
          <div class="gamb-scroll-item winner-scroll">
            <img src="img/nano_alonsotegi_monte.png" alt="Ilusion 4">
            <p>LA VERDAD<br><span>Alonsotegi ➔</span></p>
          </div>
        </div>`,
        text: "La fatiga te hace alucinar. Te encuentras en un pasillo distorsionado donde el espacio se pliega. Tienes que hacer <strong>SCROLL LATERAL</strong> por los ecos de tu mente para encontrar el verdadero camino, o te quedarás atrapado aquí para siempre.",
        choices: [
          { text: "🚪 Entrar al Eco del Pasado", next: 0, score: -20, item: null },
          { text: "🚪 Entrar por la Puerta de la Verdad", next: 11, score: 40, item: "Claridad_Mental" },
          { text: "🎰 Bajar al Casino Subconsciente", next: 20, score: 0, item: null }
        ]
      }
    ];

    // 🎰 Slot Machine Config
    this.slotSymbols = ['🧠','⚡','🔑','💀','🎵','🎰','🔥','👁️','⛓️','🌀'];
    this.slotPayouts = {
      '🧠🧠🧠': { points: 200, msg: 'CORTEX JACKPOT — ¡Superinteligencia desbloqueada!', reward: { label: '🧠 ABRIR CORTEX', url: 'https://cortexpersist.dev' } },
      '⚡⚡⚡': { points: 150, msg: 'SINGULARIDAD — ¡El servidor arde!' },
      '🔑🔑🔑': { points: 300, msg: 'TRIPLE LLAVE — ¡Acceso VIP desbloqueado!', reward: { label: '🎧 ESCUCHAR EN SPOTIFY', url: 'https://open.spotify.com/artist/borjamoskv' } },
      '💀💀💀': { points: -200, msg: 'MUERTE DIGITAL — El Gambitero se ríe...' },
      '🎵🎵🎵': { points: 250, msg: 'ARMONÍA TOTAL — Track exclusivo desbloqueado.', reward: { label: '▶ TRACK EXCLUSIVO', url: 'https://www.youtube.com/@borjamoskv' } },
      '🎰🎰🎰': { points: 500, msg: '¡¡¡MEGA JACKPOT!!! — BANDCAMP FREE CODE.', reward: { label: '🎁 IR A BANDCAMP', url: 'https://borjamoskv.bandcamp.com' } },
      '🔥🔥🔥': { points: 100, msg: 'FUEGO — Todo arde. En el buen sentido.', reward: { label: '🔥 VER EN SOUNDCLOUD', url: 'https://soundcloud.com/borjamoskv' } },
    };
    this.unlockedRewards = JSON.parse(localStorage.getItem('gambitero_rewards') || '[]');
    this.meta = this._normalizeMeta(JSON.parse(localStorage.getItem(this.metaKey) || '{}'));
    this.stats = this._createBaseStats();
    this._publishTestingHooks();
  }

  _createBaseStats() {
    return { cuerpo: 72, lucidez: 56, destino: 18 };
  }

  _normalizeMeta(meta = {}) {
    return {
      totalRuns: Number.isFinite(meta.totalRuns) ? meta.totalRuns : 0,
      bestScore: Number.isFinite(meta.bestScore) ? meta.bestScore : 0,
      endings: Array.isArray(meta.endings) ? meta.endings : [],
      relics: Array.isArray(meta.relics) ? meta.relics : [],
      lastTitle: meta.lastTitle || 'SIN HISTORIAL',
      lastScore: Number.isFinite(meta.lastScore) ? meta.lastScore : 0
    };
  }

  _saveMeta() {
    localStorage.setItem(this.metaKey, JSON.stringify(this.meta));
  }

  _getSavedRun() {
    try {
      const raw = localStorage.getItem(this.saveKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  _saveRun() {
    if (!this.isActive || (this.uiMode !== 'run' && this.uiMode !== 'slot')) return;
    localStorage.setItem(this.saveKey, JSON.stringify({
      currentScene: this.currentScene,
      score: this.score,
      inventory: this.inventory,
      decisions: this.decisions,
      path: this.path,
      stats: this.stats,
      slotReturnScene: this.slotReturnScene
    }));
  }

  _clearSavedRun() {
    localStorage.removeItem(this.saveKey);
  }

  _clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  _getScene(id) {
    return this.scenes.find((scene) => scene.id === id) || null;
  }

  _recordSceneVisit(id) {
    if (this.path[this.path.length - 1] !== id) {
      this.path.push(id);
    }
  }

  _getEndingKey() {
    if (this.currentScene === 17) return 'transcendencia';
    if (this.currentScene === 19 || this.currentScene === 21) return 'derrota-maxima';
    if (this.currentScene === 24) return 'fran-perea';
    return 'ruta-secreta';
  }

  _getEndingLabel(key) {
    const labels = {
      'transcendencia': 'FINAL 1 · TRASCENDENCIA',
      'derrota-maxima': 'FINAL 2 · DERROTA MÁXIMA',
      'fran-perea': 'FINAL 3 · FELICIDAD ABSOLUTA',
      'ruta-secreta': 'FINAL DESCONOCIDO'
    };
    return labels[key] || key;
  }

  _getSceneFrame(id) {
    const sceneIndex = this.scenes.findIndex((scene) => scene.id === id);
    const episode = `EP ${String(Math.max(sceneIndex + 1, 1)).padStart(2, '0')}/20`;

    if ([0, 1, 2, 3, 4, 5].includes(id)) {
      return {
        kicker: 'ACTO I · BILBAO SECO',
        episode,
        tone: 'Costumbrismo ansioso',
        objective: 'Encontrar una senal util antes de que la ciudad te convierta en serrin emocional.'
      };
    }

    if ([6, 7, 8, 9, 10, 20, 21, 22, 25].includes(id)) {
      return {
        kicker: 'ACTO II · DERIVA Y VISIONES',
        episode,
        tone: 'Blackout castizo',
        objective: 'Cruzar la ciudad sin romperte, elegir bien tus reliquias y sobrevivir al absurdo.'
      };
    }

    return {
      kicker: 'ACTO III · ALONSOTEGI O COLAPSO',
      episode,
      tone: 'Epica burocratica',
      objective: 'Llegar al umbral, pasar la prueba del Patron y cerrar la noche con una cifra memorable.'
    };
  }

  _getEndingSeal() {
    if (this.currentScene === 17) {
      return 'CUENTA CERRADA · 50/50 · ALONSOTEGI CERTIFICA LA TRASCENDENCIA';
    }
    if (this.currentScene === 24) {
      return 'CUENTA CERRADA · 50/50 · LA SITCOM COSMICA QUEDA APROBADA';
    }
    return 'CUENTA ABIERTA · 0/50 · EL COSTO SE QUEDA MIRANDOTE DESDE LA NIEBLA';
  }

  _getEndingEpilogue() {
    if (this.currentScene === 17) {
      return 'La odisea deja de ser mono y se convierte en leyenda local. No era solo humo: era montaje, fe y resistencia de barrio con final de culto.';
    }
    if (this.currentScene === 24) {
      return 'El relato se pliega sobre si mismo y remata en comedia metafisica. Lo que parecia miseria deviene canon absurdo, pop y profundamente televisivo.';
    }
    return 'La noche no te concede redencion ni spin-off. Solo una lluvia hostil, una leccion amarga y la certeza de que Bilbao sabe humillar con metodo.';
  }

  _createChipPatterns() {
    return {
      lead: [1, 3, 5, 6, 5, 3, 1, 3, 5, 6, 8, 6, 5, 3, 1, 8],
      bass: [6, 8, 10, 8, 6, 8, 10, 8, 5, 6, 8, 6, 5, 6, 8, 10],
      drums: [1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1]
    };
  }

  _ensureChipAudio() {
    if (this.chipAudioContext) return;

    this.chipAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    const filter = this.chipAudioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2200;
    filter.Q.value = 0.8;

    this.chipMasterGain = this.chipAudioContext.createGain();
    this.chipMasterGain.gain.value = 0.07;

    // Swarm Worklet & Analysers
    this.masterAnalyser = this.chipAudioContext.createAnalyser(); 
    this.masterAnalyser.fftSize = 1024;
    this.bassAnalyser = this.chipAudioContext.createAnalyser(); 
    this.bassAnalyser.fftSize = 64;
    
    filter.connect(this.chipMasterGain);
    this.chipMasterGain.connect(this.masterAnalyser);
    this.chipMasterGain.connect(this.bassAnalyser);
    
    // Attempt to load Worklet
    const swarmWorkletCode = `
    class SwarmProcessor extends AudioWorkletProcessor {
      constructor() { super(); this.p = new Float32Array(100); }
      process(inputs, outputs) {
        if (!inputs[0] || !outputs[0] || !inputs[0].length) return true;
        for (let ch = 0; ch < outputs[0].length; ++ch) {
          const out = outputs[0][ch];
          const inp = inputs[0][ch] || new Float32Array(128);
          for (let i = 0; i < out.length; ++i) {
            let swarmVal = 0;
            for(let g=0; g<5; g++) {
              this.p[g] = (this.p[g] + 0.005*g) % 1;
              swarmVal += Math.sin(this.p[g] * Math.PI * 2) * 0.05;
            }
            out[i] = Math.tanh((inp[i] + swarmVal) * 2.5);
          }
        }
        return true;
      }
    }
    registerProcessor('swarm-processor', SwarmProcessor);`;
    
    const blob = new Blob([swarmWorkletCode], {type: 'application/javascript'});
    this.chipAudioContext.audioWorklet.addModule(URL.createObjectURL(blob)).then(() => {
      this.swarmNode = new AudioWorkletNode(this.chipAudioContext, 'swarm-processor');
      this.chipMasterGain.disconnect();
      this.chipMasterGain.connect(this.swarmNode);
      this.swarmNode.connect(this.masterAnalyser);
      this.swarmNode.connect(this.bassAnalyser);
      this.swarmNode.connect(this.chipAudioContext.destination);
    }).catch(e => {
      this.chipMasterGain.connect(this.chipAudioContext.destination);
    });

    this.chipFilter = filter;
  }

  _frequencyFromOffset(offset, octaveShift = 0) {
    return this.chipRootHz * Math.pow(2, (offset + (octaveShift * 12)) / 12);
  }

  _playChipVoice({ offset, duration, type = 'square', gain = 0.04, octaveShift = 0, detune = 0 }) {
    if (!this.chipAudioContext || !this.chipMasterGain) return;

    const now = this.chipAudioContext.currentTime;
    const osc = this.chipAudioContext.createOscillator();
    const amp = this.chipAudioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(this._frequencyFromOffset(offset, octaveShift), now);
    if (detune) osc.detune.setValueAtTime(detune, now);

    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(amp).connect(this.chipFilter || this.chipMasterGain);
    osc.start(now);
    osc.stop(now + duration + 0.04);
  }

  _updateChipMusicCard(step) {
    if (this.chipStatusEl) {
      this.chipStatusEl.textContent = `LOOP INFINITO · PASO ${String(step + 1).padStart(2, '0')}`;
    }

    if (!this.chipBarsEl) return;
    const bars = Array.from(this.chipBarsEl.querySelectorAll('.gamb-chip-bar'));
    bars.forEach((bar, index) => {
      bar.classList.toggle('is-active', index === (step % bars.length));
      bar.classList.toggle('is-secondary', index === ((step + 4) % bars.length));
    });
  }

  _scheduleChipStep() {
    if (!this.chipMusicPlaying || !this.chipAudioContext) return;

    const { lead, bass, drums } = this.chipPatterns;
    const step = this.chipMusicStep % lead.length;
    const stepDuration = 60 / this.chipTempo / 4;

    this._playChipVoice({
      offset: lead[step],
      duration: stepDuration * 0.9,
      type: 'square',
      gain: 0.045,
      octaveShift: 1,
      detune: step % 2 === 0 ? -5 : 5
    });

    this._playChipVoice({
      offset: bass[step],
      duration: stepDuration * 1.15,
      type: 'triangle',
      gain: 0.03,
      octaveShift: -1,
      detune: 0
    });

    if (drums[step]) {
      this._playChipVoice({
        offset: 10,
        duration: stepDuration * 0.45,
        type: 'sawtooth',
        gain: 0.02,
        octaveShift: -2,
        detune: -12
      });
    }

    this._updateChipMusicCard(step);
    this.chipMusicStep = (step + 1) % lead.length;
    this.chipMusicTimer = window.setTimeout(() => this._scheduleChipStep(), stepDuration * 1000);
  }

  _toggleMusicPlayback() {
    if (!this.chipAudioContext) return;

    if (this.chipMusicPlaying) {
      this.chipMusicPlaying = false;
      if (this.chipMusicTimer) {
        window.clearTimeout(this.chipMusicTimer);
        this.chipMusicTimer = null;
      }
      if (this.chipToggleBtn) this.chipToggleBtn.textContent = 'REANUDAR';
      if (this.chipStatusEl) this.chipStatusEl.textContent = 'PAUSA ACTIVA';
      return;
    }

    this.chipMusicPlaying = true;
    if (this.chipToggleBtn) this.chipToggleBtn.textContent = 'PAUSAR';
    if (this.chipAudioContext.state === 'suspended') {
      this.chipAudioContext.resume().catch(() => {});
    }
    this._scheduleChipStep();
  }

  _stopMusic() {
    this.chipMusicPlaying = false;
    if (this.chipMusicTimer) {
      window.clearTimeout(this.chipMusicTimer);
      this.chipMusicTimer = null;
    }

    if (this.chipAudioContext) {
      try {
        this.chipAudioContext.close();
      } catch {
        // ignore teardown errors
      }
    }

    this.chipAudioContext = null;
    this.chipMasterGain = null;
    this.chipFilter = null;
    this.chipStatusEl = null;
    this.chipToggleBtn = null;
    this.chipBarsEl = null;
  }

  _normalizeChoice(choice) {
    return {
      ...choice,
      requiresItem: choice.requiresItem || choice.requires || choice.req || null,
      requiresScore: Number.isFinite(choice.requiresScore) ? choice.requiresScore : null,
      requiresStats: choice.requiresStats || null,
      requiresScene: Number.isFinite(choice.requiresScene) ? choice.requiresScene : null,
      hint: choice.hint || null
    };
  }

  _choiceIsUnlocked(choice) {
    if (choice.requiresItem && !this.inventory.includes(choice.requiresItem)) return false;
    if (choice.requiresScore !== null && this.score < choice.requiresScore) return false;
    if (choice.requiresScene !== null && !this.path.includes(choice.requiresScene)) return false;
    if (choice.requiresStats) {
      const failed = Object.entries(choice.requiresStats).some(([stat, min]) => (this.stats[stat] || 0) < min);
      if (failed) return false;
    }
    return true;
  }

  _requirementHint(choice) {
    if (choice.hint) return choice.hint;
    if (choice.requiresItem) return `Necesitas: ${choice.requiresItem}`;
    if (choice.requiresScore !== null) return `Necesitas ${choice.requiresScore} puntos`;
    if (choice.requiresStats) {
      const [stat, min] = Object.entries(choice.requiresStats)[0];
      return `Necesitas ${stat} ${min}+`;
    }
    return 'Ruta bloqueada';
  }

  _applyChoiceOutcome(choice, scene) {
    this.score += (choice.score || 0);

    if (choice.item && !this.inventory.includes(choice.item)) {
      this.inventory.push(choice.item);
    }

    this.decisions[scene.id] = choice.text;

    const scoreSwing = choice.score || 0;
    const itemName = choice.item || '';
    const bodyShift = scoreSwing >= 0 ? -4 : -8;
    const clarityShift = Math.round(scoreSwing / 6);
    const omenShift = scoreSwing < 0 ? 8 : 4;

    this.stats.cuerpo = this._clamp(this.stats.cuerpo + bodyShift, 0, 100);
    this.stats.lucidez = this._clamp(this.stats.lucidez + clarityShift, 0, 100);
    this.stats.destino = this._clamp(this.stats.destino + omenShift, 0, 100);

    if (/Ansiedad|Rastrojo|Sin_Buen_Humor/.test(itemName)) {
      this.stats.cuerpo = this._clamp(this.stats.cuerpo - 8, 0, 100);
      this.stats.lucidez = this._clamp(this.stats.lucidez - 10, 0, 100);
      this.stats.destino = this._clamp(this.stats.destino + 12, 0, 100);
    }

    if (/Porro_Intacto|El_Costo_de_Agosto|Claridad|Identidad_Perea/.test(itemName)) {
      this.stats.cuerpo = this._clamp(this.stats.cuerpo + 6, 0, 100);
      this.stats.lucidez = this._clamp(this.stats.lucidez + 12, 0, 100);
      this.stats.destino = this._clamp(this.stats.destino + 6, 0, 100);
    }

    if (scene.id === 20 || choice.next === 20) {
      this.stats.cuerpo = this._clamp(this.stats.cuerpo - 4, 0, 100);
      this.stats.destino = this._clamp(this.stats.destino + 10, 0, 100);
    }
  }

  _renderStatBar(label, value, tone = 'cyan') {
    return `
      <div class="gamb-stat-row">
        <div class="gamb-stat-top">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
        <div class="gamb-stat-bar">
          <span class="gamb-stat-fill ${tone}" style="width:${value}%"></span>
        </div>
      </div>
    `;
  }

  _renderScenePanels(scene) {
    const recentPath = this.path.slice(-5).map((id) => this._getScene(id)?.title || `ESCENA ${id}`);
    const recentChoices = Object.entries(this.decisions).slice(-3).map(([, text]) => text);
    const inventory = this.inventory.length > 0
      ? this.inventory.map((item) => `<span class="gamb-inv-item">${item}</span>`).join('')
      : '<span class="gamb-empty-state">Sin reliquias todavía</span>';

    return `
      <aside class="gamb-side-panels">
        <section class="gamb-panel">
          <div class="gamb-panel-title">ESTADO</div>
          ${this._renderStatBar('CUERPO', this.stats.cuerpo, 'pink')}
          ${this._renderStatBar('LUCIDEZ', this.stats.lucidez, 'cyan')}
          ${this._renderStatBar('DESTINO', this.stats.destino, 'lime')}
        </section>
        <section class="gamb-panel">
          <div class="gamb-panel-title">CRONOLOGÍA</div>
          <div class="gamb-route-list">
            ${recentPath.map((step, idx) => `<div class="gamb-route-step"><span>${this.path.length - recentPath.length + idx + 1}</span><strong>${step}</strong></div>`).join('')}
          </div>
        </section>
        <section class="gamb-panel">
          <div class="gamb-panel-title">RELIQUIAS</div>
          <div class="gamb-panel-tags">${inventory}</div>
        </section>
        <section class="gamb-panel">
          <div class="gamb-panel-title">ÚLTIMAS DECISIONES</div>
          <div class="gamb-echo-list">
            ${recentChoices.length > 0 ? recentChoices.map((entry) => `<div class="gamb-echo-item">${entry}</div>`).join('') : '<span class="gamb-empty-state">Aún no has elegido nada</span>'}
          </div>
          <div class="gamb-controls-help">Teclas: <kbd>↑↓</kbd> moverte · <kbd>Enter</kbd> elegir · <kbd>1-9</kbd> acceso rápido · <kbd>Esc</kbd> salir</div>
        </section>
      </aside>
    `;
  }

  _renderMenu() {
    this.uiMode = 'menu';
    const stage = document.getElementById('gamb-stage');
    if (!stage) return;

    const save = this._getSavedRun();
    const topRanks = this.rankings.slice(0, 5);
    const endings = this.meta.endings.length > 0
      ? this.meta.endings.map((ending) => `<span class="gamb-badge">${this._getEndingLabel(ending)}</span>`).join('')
      : '<span class="gamb-empty-state">Ningún final desbloqueado</span>';
    const relics = this.meta.relics.length > 0
      ? this.meta.relics.slice(-6).map((relic) => `<span class="gamb-inv-item">${relic}</span>`).join('')
      : '<span class="gamb-empty-state">Todavía no has dejado huella</span>';

    stage.innerHTML = `
      <div class="gamb-menu-screen">
        <div class="gamb-menu-hero">
          <div class="gamb-menu-kicker">GAMBITER</div>
          <h2 class="gamb-menu-title">BILBAO ODYSSEY DELUXE</h2>
          <p class="gamb-menu-text">Tres actos, veinte pantallas, tres finales y una sola mision ridicula: sobrevivir a Bilbao, llegar a Alonsotegi y salir del delirio con gloria o con verguenza historica.</p>
        </div>
        <div class="gamb-menu-actions">
          <button class="gamb-choice" data-menu-action="new">1. NUEVA ODISEA</button>
          <button class="gamb-choice" data-menu-action="continue" ${save ? '' : 'disabled'}>${save ? '2. CONTINUAR RUN' : '2. CONTINUAR RUN 🔒'}</button>
          <button class="gamb-choice" data-menu-action="archive">3. VER ARCHIVO</button>
          <button class="gamb-choice" data-menu-action="exit">ESC. SALIR</button>
        </div>
        <div class="gamb-menu-grid">
          <section class="gamb-panel">
            <div class="gamb-panel-title">META</div>
            <div class="gamb-meta-line"><span>Runs</span><strong>${this.meta.totalRuns}</strong></div>
            <div class="gamb-meta-line"><span>Mejor score</span><strong>${this.meta.bestScore}</strong></div>
            <div class="gamb-meta-line"><span>Último rango</span><strong>${this.meta.lastTitle}</strong></div>
            <div class="gamb-meta-line"><span>Finales</span><strong>${this.meta.endings.length}</strong></div>
            ${save ? `<div class="gamb-menu-save">RUN EN CURSO: <strong>${this._getScene(save.currentScene)?.title || 'ESCENA DESCONOCIDA'}</strong></div>` : '<div class="gamb-menu-save">No hay run guardada</div>'}
          </section>
          <section class="gamb-panel">
            <div class="gamb-panel-title">FINALES DESCUBIERTOS</div>
            <div class="gamb-panel-tags">${endings}</div>
          </section>
          <section class="gamb-panel">
            <div class="gamb-panel-title">RELIQUIAS DE CARRERA</div>
            <div class="gamb-panel-tags">${relics}</div>
          </section>
          <section class="gamb-panel">
            <div class="gamb-panel-title">TOP ARCADE</div>
            <div class="gamb-route-list">
              ${topRanks.length > 0 ? topRanks.map((rank, idx) => `<div class="gamb-route-step"><span>${idx + 1}</span><strong>${rank.name}</strong><em>${rank.score} PTS</em></div>`).join('') : '<span class="gamb-empty-state">Aún no hay marcas</span>'}
            </div>
          </section>
        </div>
      </div>
    `;

    stage.querySelector('[data-menu-action="new"]')?.addEventListener('click', () => this.startNewRun());
    stage.querySelector('[data-menu-action="continue"]')?.addEventListener('click', () => this.resumeRun());
    stage.querySelector('[data-menu-action="archive"]')?.addEventListener('click', () => this._renderArchive());
    stage.querySelector('[data-menu-action="exit"]')?.addEventListener('click', () => this.exit());
    this._syncChoiceFocus(0);
  }

  _renderArchive() {
    this.uiMode = 'archive';
    const stage = document.getElementById('gamb-stage');
    if (!stage) return;

    const rewards = this.unlockedRewards.length > 0
      ? this.unlockedRewards.map((reward) => `<span class="gamb-badge">${reward}</span>`).join('')
      : '<span class="gamb-empty-state">La máquina aún no te debe favores</span>';

    stage.innerHTML = `
      <div class="gamb-menu-screen gamb-archive-screen">
        <div class="gamb-menu-hero">
          <div class="gamb-menu-kicker">ARCHIVO</div>
          <h2 class="gamb-menu-title">MEMORIA DEL GAMBITER</h2>
          <p class="gamb-menu-text">Aqui vive la biblia de tus runs: finales abiertos, reliquias absurdas, premios de la maquina y las marcas que han sobrevivido al monazo narrativo.</p>
        </div>
        <div class="gamb-menu-grid">
          <section class="gamb-panel">
            <div class="gamb-panel-title">FINALES</div>
            <div class="gamb-panel-tags">${this.meta.endings.length ? this.meta.endings.map((ending) => `<span class="gamb-badge">${this._getEndingLabel(ending)}</span>`).join('') : '<span class="gamb-empty-state">Nada todavía</span>'}</div>
          </section>
          <section class="gamb-panel">
            <div class="gamb-panel-title">PREMIOS DE TRAGAPERRAS</div>
            <div class="gamb-panel-tags">${rewards}</div>
          </section>
          <section class="gamb-panel">
            <div class="gamb-panel-title">TOP 10</div>
            ${this.rankings.length ? this.rankings.map((rank, idx) => `<div class="gamb-route-step"><span>${idx + 1}</span><strong>${rank.name}</strong><em>${rank.score} PTS</em></div>`).join('') : '<span class="gamb-empty-state">Arcade vacío</span>'}
          </section>
          <section class="gamb-panel">
            <div class="gamb-panel-title">ÚLTIMO ECO</div>
            <div class="gamb-meta-line"><span>Título</span><strong>${this.meta.lastTitle}</strong></div>
            <div class="gamb-meta-line"><span>Score</span><strong>${this.meta.lastScore}</strong></div>
            <div class="gamb-meta-line"><span>Runs totales</span><strong>${this.meta.totalRuns}</strong></div>
            <div class="gamb-meta-line"><span>Mejor score</span><strong>${this.meta.bestScore}</strong></div>
          </section>
        </div>
        <div class="gamb-menu-actions">
          <button class="gamb-choice" data-menu-action="back">1. VOLVER AL MENÚ</button>
          <button class="gamb-choice" data-menu-action="new">2. NUEVA ODISEA</button>
        </div>
      </div>
    `;

    stage.querySelector('[data-menu-action="back"]')?.addEventListener('click', () => this._renderMenu());
    stage.querySelector('[data-menu-action="new"]')?.addEventListener('click', () => this.startNewRun());
    this._syncChoiceFocus(0);
  }

  _handleKeyDown(event) {
    if (!this.overlay || !this.isActive) return;
    const tag = document.activeElement?.tagName;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.exit();
      return;
    }

    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      this._moveChoiceFocus(1);
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this._moveChoiceFocus(-1);
      return;
    }

    if (event.key === 'Enter' || event.code === 'Space') {
      if (event.code === 'Space') {
        event.preventDefault();
      }
      this._getFocusableChoices()[this.focusedChoiceIndex]?.click();
      return;
    }

    if (this.uiMode === 'menu') {
      if (event.key === '1') this.overlay.querySelector('[data-menu-action="new"]')?.click();
      if (event.key === '2') this.overlay.querySelector('[data-menu-action="continue"]')?.click();
      if (event.key === '3') this.overlay.querySelector('[data-menu-action="archive"]')?.click();
      return;
    }

    if (this.uiMode === 'archive') {
      if (event.key === '1') this.overlay.querySelector('[data-menu-action="back"]')?.click();
      if (event.key === '2') this.overlay.querySelector('[data-menu-action="new"]')?.click();
      return;
    }

    const choiceIndex = Number.parseInt(event.key, 10);
    if (!Number.isNaN(choiceIndex) && choiceIndex > 0) {
      const choices = Array.from(this.overlay.querySelectorAll('.gamb-choice:not(.locked):not([disabled])'));
      choices[choiceIndex - 1]?.click();
    }
  }

  _publishTestingHooks() {
    window.render_game_to_text = () => this.renderGameToText();
    window.advanceTime = (ms = 16) => {
      void ms;
      return this.renderGameToText();
    };
  }

  renderGameToText() {
    const currentScene = this._getScene(this.currentScene);
    const visibleChoices = Array.from(document.querySelectorAll('#gamb-stage .gamb-choice')).map((button, index) => ({
      index: index + 1,
      text: button.textContent.trim(),
      disabled: button.disabled || button.classList.contains('locked')
    }));

    return JSON.stringify({
      active: this.isActive,
      mode: this.uiMode,
      currentScene: currentScene ? { id: currentScene.id, title: currentScene.title } : null,
      score: this.score,
      stats: this.stats,
      inventory: this.inventory,
      path: this.path.slice(-6).map((id) => this._getScene(id)?.title || `ESCENA ${id}`),
      endings: this.meta.endings,
      choices: visibleChoices,
      canContinue: Boolean(this._getSavedRun()),
      music: {
        label: this.chipTrackLabel,
        playing: this.chipMusicPlaying,
        step: this.chipMusicStep
      }
    });
  }

  _getFocusableChoices() {
    return Array.from(this.overlay?.querySelectorAll('.gamb-choice:not(.locked):not([disabled])') || []);
  }

  _syncChoiceFocus(index = 0) {
    const choices = this._getFocusableChoices();
    if (choices.length === 0) {
      this.focusedChoiceIndex = 0;
      return;
    }

    const normalizedIndex = ((index % choices.length) + choices.length) % choices.length;
    this.focusedChoiceIndex = normalizedIndex;

    choices.forEach((choice, choiceIndex) => {
      const isFocused = choiceIndex === normalizedIndex;
      choice.classList.toggle('is-focused', isFocused);
      if (isFocused) {
        choice.focus({ preventScroll: true });
      }
    });
  }

  _moveChoiceFocus(delta) {
    const choices = this._getFocusableChoices();
    if (choices.length === 0) return;
    this._syncChoiceFocus(this.focusedChoiceIndex + delta);
  }

  startNewRun() {
    this.currentScene = 0;
    this.score = 0;
    this.inventory = [];
    this.decisions = {};
    this.path = [];
    this.stats = this._createBaseStats();
    this.slotReturnScene = null;
    this.uiMode = 'run';
    this._clearSavedRun();
    this.renderScene(0);
  }

  resumeRun() {
    const savedRun = this._getSavedRun();
    if (!savedRun) {
      this._renderMenu();
      return;
    }

    this.currentScene = savedRun.currentScene || 0;
    this.score = savedRun.score || 0;
    this.inventory = Array.isArray(savedRun.inventory) ? savedRun.inventory : [];
    this.decisions = savedRun.decisions && typeof savedRun.decisions === 'object' ? savedRun.decisions : {};
    this.path = Array.isArray(savedRun.path) ? savedRun.path : [];
    this.stats = savedRun.stats && typeof savedRun.stats === 'object'
      ? { ...this._createBaseStats(), ...savedRun.stats }
      : this._createBaseStats();
    this.slotReturnScene = Number.isFinite(savedRun.slotReturnScene) ? savedRun.slotReturnScene : null;
    this.uiMode = 'run';
    this.renderScene(this.currentScene);
  }

  // 🎮 LAUNCH
  launch() {
    if (this.isActive && this.overlay?.isConnected) {
      this._renderMenu();
      return;
    }

    this.isActive = true;
    this.uiMode = 'menu';

    this.overlay = document.createElement('div');
    this.overlay.id = 'gambitero-overlay';
    this.overlay.innerHTML = '<canvas id="gamb-viz" style="position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-1; pointer-events:none; mix-blend-mode:screen;"></canvas><div class="gambitero-container"><div class="gamb-crt"></div><div id="gamb-stage"></div></div>';
    document.body.appendChild(this.overlay);
    requestAnimationFrame(() => {
      this.overlay.classList.add('active');
      this._initSwarmVisuals();
    });

    document.addEventListener('keydown', this.boundKeyHandler);
    globalThis.MOSKV?.audioFocus?.claim?.('gambitero', {
      reason: 'gambitero-open',
      resume: false
    });

    this._startMusic();
    this._renderMenu();
  }

  // 🎵 MUSIC (8-BIT LOCRIO LOOP)
  _startMusic() {
    const bars = Array.from({ length: 8 }, (_, index) => {
      const active = index === 0 ? ' is-active' : '';
      return `<span class="gamb-chip-bar${active}"></span>`;
    }).join('');

    const el = document.createElement('div');
    el.id = 'gambitero-music';
    el.className = 'gamb-chip-player';
    el.innerHTML = `
      <div class="gamb-chip-shell">
        <div class="gamb-chip-head">
          <span class="gamb-chip-kicker">${this.chipTrackLabel}</span>
          <strong class="gamb-chip-title">8-BIT INFINITO</strong>
        </div>
        <div class="gamb-chip-status" id="gamb-chip-status">LOOP INFINITO · PASO 01</div>
        <div class="gamb-chip-bars" aria-hidden="true">${bars}</div>
        <div class="gamb-chip-actions">
          <button class="gamb-chip-toggle" id="gamb-chip-toggle" type="button">PAUSAR</button>
          <span class="gamb-chip-note">SQ · TRI · NOISE</span>
        </div>
      </div>
    `;

    this.chipStatusEl = el.querySelector('#gamb-chip-status');
    this.chipToggleBtn = el.querySelector('#gamb-chip-toggle');
    this.chipBarsEl = el.querySelector('.gamb-chip-bars');
    this.chipToggleBtn?.addEventListener('click', () => this._toggleMusicPlayback());
    
    if (this.overlay) {
      this.overlay.appendChild(el);
    } else {
      document.body.appendChild(el);
    }

    this._ensureChipAudio();
    if (this.chipAudioContext?.state === 'suspended') {
      this.chipAudioContext.resume().catch(() => {});
    }
    this.chipMusicPlaying = true;
    this.chipMusicStep = 0;
    this._scheduleChipStep();
  }

  _applyVisualStorytelling() {
    if (!this.overlay) return;
    const container = this.overlay.querySelector('.gambitero-container');
    if (!container) return;

    container.classList.remove(
      'gamb-state-tired',
      'gamb-state-exhausted',
      'gamb-state-confused',
      'gamb-state-delirious',
      'gamb-state-doomed'
    );

    if (this.stats.destino >= 78 && this.stats.lucidez >= 68) {
      container.classList.add('gamb-state-delirious');
    } else if (this.stats.lucidez <= 34) {
      container.classList.add('gamb-state-confused');
    } else if (this.stats.destino >= 64) {
      container.classList.add('gamb-state-doomed');
    } else if (this.stats.cuerpo <= 24) {
      container.classList.add('gamb-state-exhausted');
    } else if (this.stats.cuerpo <= 45) {
      container.classList.add('gamb-state-tired');
    }
  }

  // 🎬 RENDER SCENE
  renderScene(id) {
    if (id === 20) {
      this.renderSlotMachine();
      return;
    }

    const scene = this._getScene(id);
    if (!scene) { this.endGame(); return; }
    const frame = this._getSceneFrame(id);

    this.currentScene = id;
    this.uiMode = 'run';
    this._recordSceneVisit(id);
    this._applyVisualStorytelling();
    const stage = document.getElementById('gamb-stage');
    if (!stage) return;

    const choicesHTML = scene.choices.map((choice, i) => {
      const normalized = this._normalizeChoice(choice);
      const unlocked = this._choiceIsUnlocked(normalized);
      const hint = unlocked ? '' : this._requirementHint(normalized);
      return `
        <button
          class="gamb-choice ${unlocked ? '' : 'locked'}"
          data-idx="${i}"
          ${unlocked ? '' : `disabled title="${hint}"`}
        >
          <span class="gamb-choice-index">${i + 1}.</span> ${normalized.text}${unlocked ? '' : ' 🔒'}
        </button>
        ${unlocked ? '' : `<div class="gamb-choice-hint">${hint}</div>`}
      `;
    }).join('');

    stage.innerHTML = `
      <div class="gamb-scene gamb-scene-grid gamb-shake-active" onanimationend="this.classList.remove('gamb-shake-active')">
        <div class="gamb-hud">
          <span class="gamb-hud-score">💰 ${this.score} PTS</span>
          <span class="gamb-hud-scene">${scene.title}</span>
          <button class="gamb-exit-btn" id="gamb-exit-btn">✕</button>
        </div>
        <div class="gamb-main-column">
          <div class="gamb-scene-kicker">${frame.kicker}</div>
          <div class="gamb-scene-structure">
            <span class="gamb-scene-chip">${frame.episode}</span>
            <span class="gamb-scene-chip">${frame.tone}</span>
          </div>
          <div class="gamb-scene-objective"><strong>Objetivo:</strong> ${frame.objective}</div>
          <div class="gamb-art">${scene.art}</div>
          <div class="gamb-text">${scene.text}</div>
          <div class="gamb-choices">${choicesHTML}</div>
        </div>
        ${this._renderScenePanels(scene)}
      </div>
    `;

    stage.querySelectorAll('.gamb-choice:not(.locked)').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const choice = this._normalizeChoice(scene.choices[idx]);

        this._applyChoiceOutcome(choice, scene);

        if (choice.next === 20 || choice.next === 'SLOT') {
          this.slotReturnScene = scene.id;
          this.renderSlotMachine();
          return;
        }

        if (choice.next === -1) {
          this.endGame();
        } else {
          stage.style.opacity = '0';
          setTimeout(() => {
            this.renderScene(choice.next);
            stage.style.opacity = '1';
          }, 300);
        }
      });
    });

    document.getElementById('gamb-exit-btn')?.addEventListener('click', () => this.exit());
    this._saveRun();
    this._syncChoiceFocus(0);

    if (typeof gsap !== 'undefined') {
      gsap.from('.gamb-art', { opacity: 0, y: -20, duration: 0.4 });
      gsap.from('.gamb-text', { opacity: 0, y: 20, duration: 0.5, delay: 0.12 });
      gsap.from('.gamb-side-panels .gamb-panel', { opacity: 0, x: 18, duration: 0.35, stagger: 0.06, delay: 0.18 });
      gsap.from('.gamb-choices', { opacity: 0, y: 20, duration: 0.4, delay: 0.28 });
    }
  }

  _getRankTitle() {
    if (this.score >= 300) return 'LEYENDA DEL SERVIDOR';
    if (this.score >= 200) return 'GAMBITER SUPREMO';
    if (this.score >= 150) return 'EXPLORADOR SOBERANO';
    if (this.score >= 100) return 'HACKER NOVATO';
    if (this.score >= 50) return 'TURISTA DEL CÓDIGO';
    return 'PARDILLO DIGITAL';
  }

  // 🏁 END GAME
  endGame() {
    this.uiMode = 'end';
    const stage = document.getElementById('gamb-stage');
    if (!stage) return;

    const title = this._getRankTitle();
    const endingKey = this._getEndingKey();
    const endingLabel = this._getEndingLabel(endingKey);
    const endingSeal = this._getEndingSeal();
    const endingEpilogue = this._getEndingEpilogue();
    let endingHTML = '';
    if (this.currentScene === 17) {
      endingHTML = '<div class="gamb-ending-text gamb-ending-1">★ FINAL 1: TRASCENDENCIA ★</div>';
    } else if (this.currentScene === 19 || this.currentScene === 21) {
      endingHTML = '<div class="gamb-ending-text gamb-ending-2">☠️ FINAL 2: DERROTA MÁXIMA ☠️</div>';
    } else if (this.currentScene === 24) {
      endingHTML = '<div class="gamb-ending-text gamb-ending-3">🌀 FINAL 3: FELICIDAD ABSOLUTA 🌀<br><span style="font-size:1.2rem; color:#D4D4D4;">(SIEMPRE FUI FRAN PEREA)</span></div>';
    } else {
      endingHTML = `<div class="gamb-ending-text gamb-ending-1">${endingLabel}</div>`;
    }

    this.meta.totalRuns += 1;
    this.meta.bestScore = Math.max(this.meta.bestScore, this.score);
    this.meta.lastTitle = title;
    this.meta.lastScore = this.score;
    if (!this.meta.endings.includes(endingKey)) {
      this.meta.endings.push(endingKey);
    }
    this.inventory.forEach((item) => {
      if (!this.meta.relics.includes(item)) {
        this.meta.relics.push(item);
      }
    });
    this._saveMeta();
    this._clearSavedRun();

    const visitedScenes = [...new Set(this.path)].length;
    const relics = this.inventory.length > 0
      ? this.inventory.map((item) => `<span class="gamb-inv-item">${item}</span>`).join('')
      : '<span class="gamb-empty-state">Ninguna reliquia</span>';

    stage.innerHTML = `
      <div class="gamb-end">
        <div class="gamb-end-title">🏆 ${title} 🏆</div>
        <div class="gamb-subtitle">DISEÑA TU AVENTURA 2</div>
        ${endingHTML}
        <div class="gamb-end-seal">${endingSeal}</div>
        <div class="gamb-end-score">${this.score} PUNTOS</div>
        <div class="gamb-end-meta">
          <div class="gamb-meta-line"><span>Ruta</span><strong>${visitedScenes} escenas</strong></div>
          <div class="gamb-meta-line"><span>Archivo</span><strong>${this.meta.totalRuns} runs</strong></div>
          <div class="gamb-meta-line"><span>Mejor marca</span><strong>${this.meta.bestScore}</strong></div>
        </div>
        <p class="gamb-ending-epilogue">${endingEpilogue}</p>
        <div class="gamb-end-items gamb-panel-tags">${relics}</div>
        <div class="gamb-initials">
          <p>TUS INICIALES (3 LETRAS):</p>
          <div class="gamb-initial-inputs">
            <input type="text" maxlength="1" class="gamb-letter" id="gl1" autofocus>
            <input type="text" maxlength="1" class="gamb-letter" id="gl2">
            <input type="text" maxlength="1" class="gamb-letter" id="gl3">
          </div>
          <button class="gamb-choice gamb-save-btn" id="gamb-save">💾 GUARDAR</button>
        </div>
        <div id="gamb-rankings"></div>
        <div class="gamb-menu-actions">
          <button class="gamb-choice" id="gamb-menu-return">1. VOLVER AL MENÚ</button>
          <button class="gamb-choice" id="gamb-replay">2. NUEVA RUN</button>
          <button class="gamb-choice" id="gamb-quit">ESC. SALIR</button>
        </div>
      </div>
    `;

    const inputs = [document.getElementById('gl1'), document.getElementById('gl2'), document.getElementById('gl3')];
    inputs.forEach((inp, i) => {
      inp?.addEventListener('input', () => {
        inp.value = inp.value.toUpperCase().replace(/[^A-Z]/g, '');
        if (inp.value && i < 2) inputs[i + 1]?.focus();
      });
    });

    document.getElementById('gamb-save')?.addEventListener('click', () => {
      const name = inputs.map(i => i?.value || '_').join('');
      this.rankings.push({ name, score: this.score, date: new Date().toISOString().split('T')[0], items: this.inventory.length });
      this.rankings.sort((a, b) => b.score - a.score);
      this.rankings = this.rankings.slice(0, 10);
      localStorage.setItem('gambitero_rankings', JSON.stringify(this.rankings));
      this._renderRankings();
      document.getElementById('gamb-save').disabled = true;
      document.getElementById('gamb-save').innerText = '✅ GUARDADO';
    });

    document.getElementById('gamb-menu-return')?.addEventListener('click', () => this._renderMenu());
    document.getElementById('gamb-replay')?.addEventListener('click', () => this.startNewRun());
    document.getElementById('gamb-quit')?.addEventListener('click', () => this.exit());

    this._renderRankings();
    this._syncChoiceFocus(0);
  }

  _renderRankings() {
    const el = document.getElementById('gamb-rankings');
    if (!el) return;
    if (this.rankings.length === 0) {
      el.innerHTML = '<p style="opacity:0.5">SIN RECORDS AÚN</p>';
      return;
    }
    el.innerHTML = '<div class="gamb-rank-title">🏆 HALL OF FAME 🏆</div>' +
      this.rankings.map((r, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        return `<div class="gamb-rank-row ${i < 3 ? 'top' : ''}">${medal} <span>${r.name}</span> <span>${r.score} PTS</span> <span>${r.date}</span></div>`;
      }).join('');
  }

  // 🚪 EXIT
  exit() {
    if ((this.uiMode === 'run' || this.uiMode === 'slot') && this.isActive) {
      this._saveRun();
    }
    this.isActive = false;
    this.uiMode = 'boot';
    document.removeEventListener('keydown', this.boundKeyHandler);
    globalThis.MOSKV?.audioFocus?.release?.('gambitero', { reason: 'gambitero-close' });
    this._stopMusic();
    document.getElementById('gambitero-music')?.remove();
    if (this._resizeSwarm) window.removeEventListener('resize', this._resizeSwarm);
    if (this.swarmFrameIdx) cancelAnimationFrame(this.swarmFrameIdx);
    
    if (this.overlay) {
      this.overlay.classList.remove('active');
      setTimeout(() => this.overlay?.remove(), 400);
    }
    this.overlay = null;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🎰 SLOT MACHINE RENDERER
  // ═══════════════════════════════════════════════════════════════════
  renderSlotMachine() {
    this.currentScene = 20;
    this.uiMode = 'slot';
    const stage = document.getElementById('gamb-stage');
    if (!stage) return;
    const symbols = this.slotSymbols;
    const returnScene = this.slotReturnScene ?? 11;
    const returnTitle = this._getScene(returnScene)?.title || 'LA RUTA';

    const reelHTML = (id) => {
      const items = [];
      for (let i = 0; i < 3; i++) {
        items.push(`<div class="gamb-slot-symbol">${symbols[Math.floor(Math.random() * symbols.length)]}</div>`);
      }
      return `<div class="gamb-slot-reel" id="reel-${id}"><div class="gamb-slot-reel-inner" id="reel-inner-${id}">${items.join('')}</div></div>`;
    };

    stage.innerHTML = `
      <div class="gamb-scene gamb-shake-active" onanimationend="this.classList.remove(\'gamb-shake-active\')">
        <div class="gamb-hud">
          <span class="gamb-hud-score">💰 ${this.score} PTS</span>
          <span class="gamb-hud-scene">🎰 SLOT MACHINE</span>
          <button class="gamb-exit-btn" id="gamb-exit-btn">✕</button>
        </div>
        <pre class="gamb-art">
     ╔══════════════════════════════════╗
     ║  🎰 E L   G A M B I T E R O  🎰║
     ║  ┌────────┐ ┌────────┐ ┌────────┐
     ║  │        │ │        │ │        │
     ║  │  SPIN  │ │  SPIN  │ │  SPIN  │
     ║  │        │ │        │ │        │
     ║  └────────┘ └────────┘ └────────┘
     ║    ═══════════════════════════   ║
     ╚══════════════════════════════════╝</pre>
        <div class="gamb-slot-container">
          <div class="gamb-slot-meta">
            <span>Entrada desde: <strong>${returnTitle}</strong></span>
            <span>Cada tirada cuesta <strong>10 PTS</strong></span>
          </div>
          <div class="gamb-slot-reels">
            ${reelHTML(0)}
            ${reelHTML(1)}
            ${reelHTML(2)}
          </div>
          <div id="gamb-slot-result" class="gamb-slot-result"></div>
        </div>
        <div class="gamb-choices">
          <button class="gamb-choice gamb-spin-action" id="gamb-spin-btn">🎰 ¡TIRA! (-10 PTS)</button>
          <button class="gamb-choice" id="gamb-slot-back">🚶 Volver a ${returnTitle}</button>
          <button class="gamb-choice" id="gamb-slot-quit">☠️ RENDIRSE</button>
        </div>
      </div>
    `;

    document.getElementById('gamb-exit-btn')?.addEventListener('click', () => this.exit());
    document.getElementById('gamb-slot-back')?.addEventListener('click', () => {
      stage.style.opacity = '0';
      setTimeout(() => {
        this.renderScene(returnScene);
        stage.style.opacity = '1';
      }, 300);
    });
    document.getElementById('gamb-slot-quit')?.addEventListener('click', () => {
      this.currentScene = 19;
      this.endGame();
    });

    const spinBtn = document.getElementById('gamb-spin-btn');
    spinBtn?.addEventListener('click', () => this._executeSlotSpin());
    if (this.score < 10 && spinBtn) {
      spinBtn.disabled = true;
      spinBtn.textContent = '💸 SIN CRÉDITOS';
    }

    this._saveRun();
    this._syncChoiceFocus(0);

    if (typeof gsap !== 'undefined') {
      gsap.from('.gamb-slot-container', { opacity: 0, scale: 0.8, duration: 0.5 });
    }
  }

  _executeSlotSpin() {
    if (this.score < 10) {
      const result = document.getElementById('gamb-slot-result');
      if (result) { result.innerHTML = '<span style="color:#8c2c20;">⚠️ NO TIENES CRÉDITOS, ILLO</span>'; }
      return;
    }
    this.score -= 10;
    this._saveRun();

    const spinBtn = document.getElementById('gamb-spin-btn');
    if (spinBtn) spinBtn.disabled = true;

    const symbols = this.slotSymbols;
    const reels = [0, 1, 2];
    const finalSymbols = reels.map(() => symbols[Math.floor(Math.random() * symbols.length)]);

    // Sound effect via Web Audio
    this._playSlotSound();

    // Animate each reel with staggered timing
    reels.forEach((reelIdx, i) => {
      const reelInner = document.getElementById(`reel-inner-${reelIdx}`);
      if (!reelInner) return;

      let spinCount = 0;
      const totalSpins = 15 + (i * 8); // Staggered stop
      const spinInterval = setInterval(() => {
        // Randomize visible symbols during spin
        const randomSym = symbols[Math.floor(Math.random() * symbols.length)];
        reelInner.innerHTML = `
          <div class="gamb-slot-symbol dim">${symbols[Math.floor(Math.random() * symbols.length)]}</div>
          <div class="gamb-slot-symbol">${randomSym}</div>
          <div class="gamb-slot-symbol dim">${symbols[Math.floor(Math.random() * symbols.length)]}</div>
        `;
        spinCount++;

        if (spinCount >= totalSpins) {
          clearInterval(spinInterval);
          // Land on final symbol
          reelInner.innerHTML = `
            <div class="gamb-slot-symbol dim">${symbols[Math.floor(Math.random() * symbols.length)]}</div>
            <div class="gamb-slot-symbol final">${finalSymbols[reelIdx]}</div>
            <div class="gamb-slot-symbol dim">${symbols[Math.floor(Math.random() * symbols.length)]}</div>
          `;
          // Play stop click
          this._playStopSound();

          // Check if all reels stopped
          if (reelIdx === 2) {
            setTimeout(() => this._resolveSlotResult(finalSymbols), 400);
          }
        }
      }, 60 + (i * 10)); // Slightly different speeds
    });
  }

  _resolveSlotResult(finalSymbols) {
    const combo = finalSymbols.join('');
    const resultEl = document.getElementById('gamb-slot-result');
    const scoreEl = document.querySelector('.gamb-hud-score');
    const spinBtn = document.getElementById('gamb-spin-btn');

    // Check for triple match
    const payout = this.slotPayouts[combo];
    let html = '';

    if (payout) {
      // JACKPOT!
      this.score += payout.points;
      
      // TRIGGER FRONTERA x10 SENSORY OVERLOAD
      if (typeof window.triggerCortexFronteraX10 === 'function') {
        window.triggerCortexFronteraX10();
      }

      const sign = payout.points > 0 ? '+' : '';
      let rewardHtml = '';
      if (payout.reward) {
        // Track unlocked reward
        if (!this.unlockedRewards.includes(combo)) {
          this.unlockedRewards.push(combo);
          localStorage.setItem('gambitero_rewards', JSON.stringify(this.unlockedRewards));
        }
        rewardHtml = `<br><a href="${payout.reward.url}" target="_blank" rel="noopener" class="gamb-choice gamb-reward-link">${payout.reward.label}</a>`;
      }
      html = `<div class="gamb-slot-win">${finalSymbols.join(' ')}<br><strong>${sign}${payout.points} PTS</strong><br>${payout.msg}${rewardHtml}</div>`;
      this._playJackpotSound();
    } else if (finalSymbols[0] === finalSymbols[1] || finalSymbols[1] === finalSymbols[2]) {
      // Partial match (2 of 3)
      this.score += 25;
      html = `<div class="gamb-slot-partial">${finalSymbols.join(' ')}<br><strong>+25 PTS</strong><br>Casi... dos iguales. El Gambitero asiente.</div>`;
    } else {
      // No match
      html = `<div class="gamb-slot-miss">${finalSymbols.join(' ')}<br><em>Nada. El Gambitero se encoge de hombros.</em></div>`;
    }

    if (resultEl) resultEl.innerHTML = html;
    if (scoreEl) scoreEl.innerHTML = `💰 ${this.score} PTS`;
    if (spinBtn) {
      spinBtn.disabled = false;
      spinBtn.textContent = this.score >= 10 ? '🎰 ¡OTRA VEZ! (-10 PTS)' : '💸 SIN CRÉDITOS';
      if (this.score < 10) spinBtn.disabled = true;
    }
    this._saveRun();
  }

  _playSlotSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    } catch(e) { /* silent */ }
  }

  _playStopSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch(e) { /* silent */ }
  }

  _playJackpotSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.3);
      });
    } catch(e) { /* silent */ }
  }

  // ─── LEGION-10K WEBGL VISUALS ──────────────────────────────
  _initSwarmVisuals() {
    const canvas = document.getElementById('gamb-viz');
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;
    this.gl = gl;

    const vsSource = `attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;
    const fsSource = `
      precision mediump float;
      uniform float u_time; uniform float u_bass; uniform float u_hf; uniform vec2 u_resolution;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        vec2 p = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;
        float l = length(p);
        float ang = atan(p.y, p.x) + u_time * 0.5 + (u_bass * 2.0 / (l + 0.1));
        vec2 pos = vec2(cos(ang)*l, sin(ang)*l);
        float n = hash(floor(pos * 50.0 + u_time * 10.0));
        float spark = smoothstep(0.9, 1.0, n + u_hf * 0.5);
        float voidMask = smoothstep(0.2 + u_bass*0.3, 0.25 + u_bass*0.3, l);
        vec3 col = vec3(0.0);
        float disk = smoothstep(0.3, 0.25, l) * voidMask;
        col += vec3(0.1, 0.1, 0.8) * disk * u_bass * 5.0; // Blue core
        col += vec3(0.9, 0.1, 0.1) * spark * voidMask * (1.0 + u_hf * 5.0); // Red swarm
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(prog); gl.useProgram(prog);

    const posLoc = gl.getAttribLocation(prog, "a_position");
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc); gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    this.uTime = gl.getUniformLocation(prog, "u_time");
    this.uBass = gl.getUniformLocation(prog, "u_bass");
    this.uHf = gl.getUniformLocation(prog, "u_hf");
    this.uRes = gl.getUniformLocation(prog, "u_resolution");

    this._resizeSwarm = () => {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(this.uRes, canvas.width, canvas.height);
    };
    window.addEventListener('resize', this._resizeSwarm);
    this._resizeSwarm();

    this.swarmStartTime = performance.now();
    this._renderSwarmFrame();
  }

  _renderSwarmFrame() {
    if (!this.isActive) return;
    let bass = 0, hf = 0;
    if (this.masterAnalyser && this.bassAnalyser) {
      const fData = new Uint8Array(this.masterAnalyser.frequencyBinCount); this.masterAnalyser.getByteFrequencyData(fData);
      const bData = new Uint8Array(this.bassAnalyser.frequencyBinCount); this.bassAnalyser.getByteFrequencyData(bData);
      for(let i=0; i<4; i++) bass += bData[i]; bass /= (4*255);
      for(let i=100; i<200; i++) hf += fData[i]; hf /= (100*255);
    }
    const t = (performance.now() - this.swarmStartTime) / 1000;
    this.gl.uniform1f(this.uTime, t);
    this.gl.uniform1f(this.uBass, bass);
    this.gl.uniform1f(this.uHf, hf);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.swarmFrameIdx = requestAnimationFrame(() => this._renderSwarmFrame());
  }
}

// GLOBAL
window.elGambitero = new ElGambitero();

function _initGambitero() {
  document.getElementById('gambitero-trigger')?.addEventListener('click', () => window.elGambitero.launch());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !window.elGambitero?.isActive) {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        window.elGambitero.launch();
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initGambitero);
} else {
  _initGambitero();
}
