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
    this.isActive = false;
    this.overlay = null;

    // 🏆 Arcade Rankings
    this.rankings = JSON.parse(localStorage.getItem('gambitero_rankings') || '[]');

    // 🎵 Background music (borjamoskv)
    this.musicTracks = ['b9ktVQN48OU','x8E9HInpzE4','tMorCDfedf8','hsdOCzJpUMg','4Cb-Iu8DnJM'];

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
        text: "Sobrevives al ataque lusitano. Al final del sendero, el legendario Patrón de Alonsotegi te bloquea el paso hacia el refugio divino. <em>'Mortal. Has andado 10 horas y tres cuartos. ¿Has sucumbido a la tentación?'</em>",
        choices: [
          { text: "💎 Mostrarle que NO FUMASTE el Cañón Perfecto", req: "Porro_Intacto", next: 15, score: 100, item: "El_Costo_de_Agosto" },
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
        text: "<em>'Amaste más la belleza formal del porro que la vulgaridad de quemarlo impulsivamente... Has trascendido.'</em> El Patrón te entrega un lingote que zumba radiactivo en la noche fotográfica. <strong>EL COSTO DE AGOSTO.</strong>",
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
        text: "Exactamente a las 23:00 llegas a tu batcueva en Bilbao. Después de 11 horas horripilantes, asaltos gitanos, rastrojos, sed ácida y lluvia, el legendario Bloque reposa en tu mesa. Entregas tu alma al ritual.",
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
        text: "Te enciendes el cañón divino. Entras en YouTube y pones <em>In Rainbows: From the Basement</em>. A los primeros acordes de guitarra en el Sótano, asciendes hacia otra dimensión, sanando cada dolor de las últimas 11 horas.",
        choices: [
          { text: "🎉 GRABAR TU GLORIA EN EL SALÓN ARCADE (FINAL 1: TRASCENDENCIA)", next: -1, score: 0, item: null }
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
        text: "En medio de las náuseas, un neón parpadea: un Pachinko clandestino. Jugar calma la ansiedad pero te roba energía vital (10 Puntos de Score). ¡Si sale pleno, resucitas!",
        choices: [
          { text: "🏃 CONTINUAR PATÉANDOTE BILBAO", next: 4, score: 0, item: null },
          { text: "🏁 RENDIRSE FRENTE A LA MÁQUINA", next: -1, score: 0, item: null }
        ]
      },
      // === NANO SCRATCHING PEPON NIETO ===
      {
        id: 22, title: "21:00 - SCRATCHING SURREALISTA",
        art: `<div style="text-align: center; margin: 10px 0;" class="gamb-glitch-img">
          <img src="img/nano_bilbao_greenhair.png" style="max-width:100%; border: 5px dashed #00F0FF; border-radius: 10px; max-height:250px; animation: gamberro-shake 0.2s infinite;" alt="Nano Scratching">
        </div>`,
        text: "Llegas a un descampado a las 21:00. De repente, Nano (El Niño del Colacao) aparece levitando, haciendo un scratching frenético sobre unos CDJs invisibles. De los altavoces imaginarios retumba la voz distorsionada de <strong>PEPÓN NIETO</strong> soltando anécdotas costumbristas a 160 BPM. Tu cerebro empieza a derretirse por la presión estética.",
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
        text: "Son las 23:00 exactas. Te das la vuelta con el sagrado bloque de Costo en las manos. En un muro desconchado, iluminado por una farola parpadeante, lees una pintada en spray rosa neón. En ese instante, la barrera invisible entre la ficción y el espectador colapsa. <strong>El juego acaba de romper la cuarta pared.</strong> Una voz gutural te susurra al oído desde los auriculares de tu Mac: <em>'Tú eres Fran Perea... siempre lo fuiste'.</em>",
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
        text: "¡Abres los ojos en Bilbao de golpe! Todo ha sido un sueño hiperrealista. Te habías fumado un 'mañanero' monumental y te quedaste K.O. tras llevar solo 20 minutos despierto. Miras a la mesa... ¡ESTÁ A REBOSAR! Tienes mogollón de porros. No hay que ir a Alonsotegi. Tu sufrimiento no fue real. ERES FRAN PEREA Y ERES PROFUNDAMENTE FELIZ.",
        choices: [
          { text: "🎸 CANTAR 1+1 SON 7 Y FUMAR OTRO (FINAL 3: FELICIDAD ABSOLUTA)", next: -1, score: 999, item: null }
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
  }

  // 🎮 LAUNCH
  launch() {
    this.currentScene = 0;
    this.score = 0;
    this.inventory = [];
    this.decisions = {};
    this.isActive = true;

    this.overlay = document.createElement('div');
    this.overlay.id = 'gambitero-overlay';
    this.overlay.innerHTML = '<div class="gambitero-container"><div class="gamb-crt"></div><div id="gamb-stage"></div></div>';
    document.body.appendChild(this.overlay);
    requestAnimationFrame(() => this.overlay.classList.add('active'));

    this._startMusic();
    this.renderScene(0);
  }

  // 🎵 MUSIC (INCREDIBLE CRISIS SPOTIFY)
  _startMusic() {
    const el = document.createElement('div');
    el.id = 'gambitero-music';
    // Estilo Incredible Crisis para el reproductor
    el.style.cssText = 'position:absolute; bottom:20px; right:20px; width:90%; max-width:320px; z-index:1000; box-shadow: 10px 10px 0px #FF00A0, -5px -5px 0px #00F0FF; border-radius:12px; transform: rotate(-3deg); transition: transform 0.2s;';
    
    // Añadir hover effect al vuelo
    el.onmouseover = () => el.style.transform = 'rotate(0deg) scale(1.02)';
    el.onmouseleave = () => el.style.transform = 'rotate(-3deg) scale(1)';

    el.innerHTML = `<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/playlist/6BAoy65EuilzdKV2ZTfg6V?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    
    if (this.overlay) {
      this.overlay.appendChild(el);
    } else {
      document.body.appendChild(el);
    }
  }

  // 🎬 RENDER SCENE
  renderScene(id) {
    const scene = this.scenes.find(s => s.id === id);
    if (!scene) { this.endGame(); return; }

    this.currentScene = id;
    const stage = document.getElementById('gamb-stage');

    // Build choices HTML with requirement checks
    const choicesHTML = scene.choices.map((c, i) => {
      const hasItem = !c.requires || this.inventory.includes(c.requires);
      const locked = c.requires && !hasItem;
      return `<button class="gamb-choice ${locked ? 'locked' : ''}" 
        data-idx="${i}" ${locked ? 'disabled title="Necesitas: '+c.requires+'"' : ''}>
        ${c.text}${locked ? ' 🔒' : ''}
      </button>`;
    }).join('');

    // Inventory display
    const invHTML = this.inventory.length > 0 
      ? `<div class="gamb-inventory">🎒 ${this.inventory.map(i => `<span class="gamb-inv-item">${i}</span>`).join(' ')}</div>`
      : '';

    stage.innerHTML = `
      <div class="gamb-scene gamb-shake-active" onanimationend="this.classList.remove(\'gamb-shake-active\')">
        <div class="gamb-hud">
          <span class="gamb-hud-score">💰 ${this.score} PTS</span>
          <span class="gamb-hud-scene">${scene.title}</span>
          <button class="gamb-exit-btn" id="gamb-exit-btn">✕</button>
        </div>
        <pre class="gamb-art">${scene.art}</pre>
        <div class="gamb-text">${scene.text}</div>
        ${invHTML}
        <div class="gamb-choices">${choicesHTML}</div>
      </div>
    `;

    // Bind choice clicks
    stage.querySelectorAll('.gamb-choice:not(.locked)').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const choice = scene.choices[idx];

        // Apply effects
        this.score += (choice.score || 0);
        if (choice.item && !this.inventory.includes(choice.item)) {
          this.inventory.push(choice.item);
        }
        this.decisions[scene.id] = idx;

        // Slot Machine special route
        if (choice.next === 'SLOT') {
          this.renderSlotMachine();
          return;
        }

        // Navigate
        if (choice.next === -1) {
          this.endGame();
        } else {
          // Transition effect
          stage.style.opacity = '0';
          setTimeout(() => {
            this.renderScene(choice.next);
            stage.style.opacity = '1';
          }, 300);
        }
      });
    });

    // Exit button
    document.getElementById('gamb-exit-btn')?.addEventListener('click', () => this.exit());

    // GSAP entrance
    if (typeof gsap !== 'undefined') {
      gsap.from('.gamb-art', { opacity: 0, y: -20, duration: 0.4 });
      gsap.from('.gamb-text', { opacity: 0, y: 20, duration: 0.5, delay: 0.2 });
      gsap.from('.gamb-choices', { opacity: 0, y: 20, duration: 0.4, delay: 0.4 });
    }
  }

  // 🏁 END GAME
  endGame() {
    this.isActive = false;
    const stage = document.getElementById('gamb-stage');

    let title = 'PARDILLO DIGITAL';
    if (this.score >= 300) title = 'LEYENDA DEL SERVIDOR';
    else if (this.score >= 200) title = 'GAMBITERO SUPREMO';
    else if (this.score >= 150) title = 'EXPLORADOR SOBERANO';
    else if (this.score >= 100) title = 'HACKER NOVATO';
    else if (this.score >= 50) title = 'TURISTA DEL CÓDIGO';

    let endingHTML = '';
    // Determine ending type based on precisely where the player came from
    if (this.currentScene === 17) {
      endingHTML = '<div class="gamb-ending-text gamb-ending-1">★ FINAL 1: TRASCENDENCIA ★</div>';
    } else if (this.currentScene === 19 || this.currentScene === 20 || this.currentScene === 21) {
      endingHTML = '<div class="gamb-ending-text gamb-ending-2">☠️ FINAL 2: DERROTA MÁXIMA ☠️</div>';
    } else if (this.currentScene === 24) {
      endingHTML = '<div class="gamb-ending-text gamb-ending-3">🌀 FINAL 3: FELICIDAD ABSOLUTA 🌀<br><span style="font-size:1.2rem; color:#fff;">(SIEMPRE FUI FRAN PEREA)</span></div>';
    }

    stage.innerHTML = `
      <div class="gamb-end">
        <div class="gamb-end-title">🏆 ${title} 🏆</div>
        <div class="gamb-subtitle">DISEÑA TU AVENTURA 2</div>
        ${endingHTML}
        <div class="gamb-end-score">${this.score} PUNTOS</div>
        <div class="gamb-end-items">Objetos: ${this.inventory.length > 0 ? this.inventory.join(', ') : 'ninguno'}</div>
        <div class="gamb-end-scenes">Escenas visitadas: ${Object.keys(this.decisions).length}/20</div>
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
        <button class="gamb-choice" id="gamb-replay">🎰 JUGAR DE NUEVO</button>
        <button class="gamb-choice" id="gamb-quit">✕ SALIR</button>
      </div>
    `;

    // Input auto-advance
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

    document.getElementById('gamb-replay')?.addEventListener('click', () => { this.exit(); setTimeout(() => this.launch(), 300); });
    document.getElementById('gamb-quit')?.addEventListener('click', () => this.exit());

    this._renderRankings();
  }

  _renderRankings() {
    const el = document.getElementById('gamb-rankings');
    if (!el) return;
    if (this.rankings.length === 0) { el.innerHTML = '<p style="opacity:0.5">SIN RECORDS AÚN</p>'; return; }
    el.innerHTML = '<div class="gamb-rank-title">🏆 HALL OF FAME 🏆</div>' +
      this.rankings.map((r, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        return `<div class="gamb-rank-row ${i < 3 ? 'top' : ''}">${medal} <span>${r.name}</span> <span>${r.score} PTS</span> <span>${r.date}</span></div>`;
      }).join('');
  }

  // 🚪 EXIT
  exit() {
    this.isActive = false;
    document.getElementById('gambitero-music')?.remove();
    if (this.overlay) { this.overlay.classList.remove('active'); setTimeout(() => this.overlay?.remove(), 400); }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 🎰 SLOT MACHINE RENDERER
  // ═══════════════════════════════════════════════════════════════════
  renderSlotMachine() {
    if (this.score < 10) {
      // Not enough points — bounce back to scene 20
      this.renderScene(20);
      return;
    }
    this.score -= 10; // Cost per spin

    const stage = document.getElementById('gamb-stage');
    const symbols = this.slotSymbols;

    // Build initial reels display
    const reelHTML = (id) => {
      // Show 3 visible symbols per reel
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
          <div class="gamb-slot-reels">
            ${reelHTML(0)}
            ${reelHTML(1)}
            ${reelHTML(2)}
          </div>
          <div id="gamb-slot-result" class="gamb-slot-result"></div>
        </div>
        <div class="gamb-choices">
          <button class="gamb-choice gamb-spin-action" id="gamb-spin-btn">🎰 ¡TIRA! (-10 PTS)</button>
          <button class="gamb-choice" id="gamb-slot-back">🚶 Basta de apostar</button>
        </div>
      </div>
    `;

    // Exit button
    document.getElementById('gamb-exit-btn')?.addEventListener('click', () => this.exit());

    // Back button → go to map
    document.getElementById('gamb-slot-back')?.addEventListener('click', () => {
      stage.style.opacity = '0';
      setTimeout(() => { this.renderScene(11); stage.style.opacity = '1'; }, 300);
    });

    // THE SPIN
    const spinBtn = document.getElementById('gamb-spin-btn');
    spinBtn?.addEventListener('click', () => this._executeSlotSpin());

    // GSAP entrance
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
