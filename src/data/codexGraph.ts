/**
 * V5 Topological Knowledge Graph & Executable Liner Essays (CODEX // TEXTS)
 * Replaces chronological feeds with Fisher-Rao attractor coordinates, compression
 * densities, inline Studer A800 Sonic Footnotes, and bidirectional edges to BM-01..BM-17.
 */

export type CodexDensity = 'APHORISM' | 'ESSAY' | 'TREATISE';

export type AttractorAxis =
  | 'ACOUSTIC PHYSICS'
  | 'INFORMATION GEOMETRY'
  | 'WETWARE & 2E'
  | 'RING-0 & SOVEREIGNTY';

export interface SonicFootnote {
  id: string;
  label: string;
  caption: string;
  audioUrl?: string;
  seekSeconds?: number;
  binauralHz?: [number, number];
}

export interface CodexSection {
  heading: string;
  paragraphs: string[];
  formalBlock?: string;
}

export interface CodexNode {
  slug: string;
  code: string;
  title: string;
  subtitle: string;
  author: string;
  role: string;
  density: CodexDensity;
  readingTime: string;
  axis: AttractorAxis;
  linkedWorkIds: string[];
  linkedNodeSlugs: string[];
  pdfUrl?: string;
  pdfLabel?: string;
  interactiveUrl?: string;
  interactiveLabel?: string;
  sonicFootnotes: SonicFootnote[];
  sections: CodexSection[];
}

export const CODEX_NODES: CodexNode[] = [
  {
    slug: 'rubin-radiohead-coupling',
    code: 'CX-01',
    title: 'POR QUÉ RICK RUBIN NUNCA TRABAJÓ CON RADIOHEAD',
    subtitle: 'La Falacia del Acoplamiento, el Mito del Productor Chamán y la Ortogonalidad Topológica frente a Nigel Godrich',
    author: 'Borja Fernández Angulo',
    role: 'Investigador en Sistemas Complejos',
    density: 'ESSAY',
    readingTime: '6 MIN',
    axis: 'ACOUSTIC PHYSICS',
    linkedWorkIds: ['this-was-in-rainbows', 'instructions-for-flying', 'blac-cinema'],
    linkedNodeSlugs: ['pre-conflict-acoustics-broken-compas', 'lo-sutil-fisher-metrology'],
    sonicFootnotes: [
      {
        id: 'cue-15-step',
        label: '▶ MOUNT BM-01 // 15 STEP GRANULAR REWORK [00:32]',
        caption: 'Transducción no lineal de guitarra orgánica a micro-transitorios granulares y línea 303.',
        audioUrl: '/audio/bandcamp/this_was_in_rainbows_15_step.mp3',
        seekSeconds: 32,
      },
      {
        id: 'cue-orthogonal-phase',
        label: '▶ SYNTH PROOF // CANCELACIÓN DE FASE (110 Hz × 110.5 Hz)',
        caption: 'Batimiento destructivo de 0.5 Hz demostrando interferencia entre tensores desalineados.',
        binauralHz: [110, 110.5],
      },
    ],
    sections: [
      {
        heading: '1. La Falacia del Isomorfismo de Cartelera',
        paragraphs: [
          'En cualquier buscador o modelo lingüístico comercial, la sorpresa del consumidor promedio se repite intacta: «¿Rick Rubin nunca ha producido a Radiohead? Qué raro». La crítica musical rellena ese hueco con nata retórica: mística barata («guía espiritual»), psicologismo difuso («banda cerebral») y apelación al azar («química con Nigel Godrich»).',
          'Decir que esa ausencia es extraña revela incomprensión de la física del estudio. El pensamiento pop asume un modelo aditivo donde sumar notoriedades garantiza una obra maestra. En sistemas complejos, dos operadores no se acoplan por su masa mercantil, sino por la compatibilidad de sus tensores de transformación.',
        ],
        formalBlock:
          'FALACIA ADITIVA POP:   Notoriedad(Rubin) + Notoriedad(Radiohead) = Obra Maestra\nREALIDAD TOPOLÓGICA:   ⟨ Operador_Rubin | Operador_Radiohead ⟩ ──► 0 (Ortogonalidad Estricta)',
      },
      {
        heading: '2. El Operador Rubin vs. la ALU Externa de Godrich',
        paragraphs: [
          'Despojado del disfraz de chamán descalzo, Rick Rubin es un clasificador binario O(1) de baja impedancia en el dominio del tiempo («Subtraction beats Addition»). Exige que la canción exista cerrada en una guitarra acústica antes de pulsar REC, anula la convolución parásita fijando la respuesta impulsional a un delta seco h(t) = δ(t) (como en Reign in Blood a 240 BPM) y rescata el formante torácico humano entre 90 Hz y 250 Hz (Johnny Cash).',
          'Radiohead y Nigel Godrich operan sobre el axioma inverso: la canción no preexiste a la máquina; emerge del acoplamiento físico con ella. En Everything in Its Right Place, Idioteque o Climbing Up the Walls, la modulación de cinta de 2 pulgadas, el emborronamiento espectral, los clusters microtonales a lo Penderecki y el caos modular no son adornos sobre acordes pop: son la sustancia estructural de la obra.',
        ],
        formalBlock:
          'PROTOCOLO RUBIN:    [Multitrack] ──► [Escucha Pasiva sin DAW] ──► Filtro {KEEP, DROP} ──► Hueso Acústico\nPROTOCOLO GODRICH:  [Modular / Cinta 2"] ◄── Bucle de Fase Táctil ──► [Sala] ──► Emergencia Transductiva',
      },
      {
        heading: '3. La Confesión de Kid A y la Paradoja del Observador',
        paragraphs: [
          'El propio Rubin aportó la prueba definitiva al confesar que el día de lanzamiento de Kid A (octubre de 2000) compró el disco y lo odió, sintiéndose alienado porque su clasificador {KEEP, DROP} seguía calibrado para The Bends y OK Computer. Años después, Kid A se convirtió en su álbum favorito de la banda.',
          'El corolario termodinámico es demoledor: si Rick Rubin hubiera tenido el mando de la consola en 1999, habría ejecutado apoptosis sobre los sintetizadores modulares y los bucles de cinta, abortando Kid A. Rubin solo puede amar hoy ese disco porque estuvo confinado fuera de su Manta de Markov.',
        ],
      },
    ],
  },
  {
    slug: 'lo-sutil-fisher-metrology',
    code: 'CX-02',
    title: 'LO SUTIL: FÍSICA DEL RESIDUO Y COTA DE CRAMÉR-RAO',
    subtitle: 'Por qué «lo sutil» no es «lo blando»: metrología cuántica, curvatura de Fisher y el colapso del mapa consensuado',
    author: 'Borja Fernández Angulo',
    role: 'Investigador en Sistemas Complejos',
    density: 'TREATISE',
    readingTime: '7 MIN + PDF',
    axis: 'INFORMATION GEOMETRY',
    linkedWorkIds: ['lo-inmanente', 'science-of-friction-book', 'retratos-naroa'],
    linkedNodeSlugs: ['aforismos-152-punto-fijo-omega', 'rubin-radiohead-coupling'],
    pdfUrl: '/ciencia_friccion_libro.pdf',
    pdfLabel: 'OPEN TREATISE PDF // LA CIENCIA DE LA FRICCIÓN [3.5 MB]',
    sonicFootnotes: [
      {
        id: 'cue-inmanente',
        label: '▶ MOUNT BM-04 // LO INMANENTE — MICRO-DERIVA [00:45]',
        caption: 'Arqueología acústica de perturbaciones mínimas y coherencia binaural.',
        audioUrl: '/audio/bandcamp/lo_inmanente_title.mp3',
        seekSeconds: 45,
      },
      {
        id: 'cue-fisher-theta',
        label: '▶ SYNTH PROOF // DIFERENCIAL THETA 4.5 Hz (136.1 Hz × 140.6 Hz)',
        caption: 'Perturbación sutil Δf = 4.5 Hz perceptible solo por integración interhemisférica.',
        binauralHz: [136.1, 140.6],
      },
    ],
    sections: [
      {
        heading: '1. El Error Categorial: Reología vs. Geometría de la Información',
        paragraphs: [
          'Durante dos milenios de lectura superficial, la tradición gerencial y mística ha confundido «lo sutil» con «lo blando» o la docilidad moral. Se trata de una fractura de isomorfismo estricto. «Lo blando» pertenece a la mecánica de medios continuos: un módulo de Young bajo (E → 0) que alarga el tiempo de impacto (F = Δp / Δt) y degrada trabajo mecánico en calor por histéresis. Un alud de fango de quinientas toneladas es blando y completamente grosero.',
          '«Lo sutil», en cambio, habita en la variedad riemanniana parametrizada por la Métrica de Información de Fisher. Una microfisura de Griffith de cinco nanómetros en zafiro o el filo molecular de un bisturí de diamante son ultra-duros y ultra-sutiles: portan una perturbación de amplitud infinitesimal (ΔA → 0) capaz de fracturar el estado macroscópico.',
        ],
        formalBlock:
          '                 ▲ EJE METROLÓGICO (Lo Sutil · ΔA → 0 · Alta Fisher g_ij)\n   [DURO Y SUTIL]│[BLANDO Y SUTIL]  ──► Fisura de Griffith en zafiro | Canal iónico Piezo1\n ────────────────┼────────────────► EJE REOLÓGICO (Rigidez E ↑ vs. Complacencia E ↓)\n [DURO Y GROSERO]│[BLANDO Y GROSERO]──► Yunque de tungsteno          | Alud de lodo (500 t)',
      },
      {
        heading: '2. Cota de Cramér-Rao y Estados Apretados de Heisenberg',
        paragraphs: [
          'El observador burocrático del promedio redondea cualquier anomalía de baja energía a cero asumiendo ruido gaussiano. El operador de frontera inspecciona la segunda derivada del logaritmo de verosimilitud: cuando existe estructura invariante, la Información de Fisher g(θ) diverge y colapsa la incertidumbre mínima de Cramér-Rao.',
          'En metrología cuántica (Braunstein & Caves), vencer el ruido shot-noise no exige fuerza bruta (multiplicar fotones n̄), sino comprimir geométricamente la cuadratura del vacío (squeezed states), escalando la precisión cuadráticamente hasta el Límite de Heisenberg (Δθ ~ 1/n̄). El territorio jamás habla confirmando la media, sino a través del decimal no cuadrado que el consenso descarta.',
        ],
        formalBlock:
          'COTA DE CRAMÉR-RAO:     Var(θ) ≥ 1 / [ N · g(θ) ] ,   g(θ) = E[ (∂ ln p(X;θ) / ∂θ)² ]\nESCALADO CUÁNTICO QFI:  F_Q = 4n̄ + 8n̄²  ──►  Δθ_SQL ~ 1/√n̄   ⇒   Δθ_Heisenberg ~ 1/n̄',
      },
    ],
  },
  {
    slug: 'borjario-wetware-2e',
    code: 'CX-03',
    title: 'EL BORJARIO: WETWARE, TDAH/2E Y DESESCALADA SOMÁTICA',
    subtitle: 'Cibernética de la carne bajada al barro: Atasco de Kramers, Manual Override Trap y falsación de la inflación psiquiátrica',
    author: 'Borja Fernández Angulo',
    role: 'Investigador en Sistemas Complejos',
    density: 'APHORISM',
    readingTime: '3 MIN + SIM',
    axis: 'WETWARE & 2E',
    linkedWorkIds: ['comic-elige-trastorno', 'portada-cocodrilo', 'miarma'],
    linkedNodeSlugs: ['borjario-silicon-acreativo', 'aforismos-152-punto-fijo-omega'],
    interactiveUrl: '/simulador.html',
    interactiveLabel: '⚡ LAUNCH 125-NODE INTERACTIVE SIMULATOR [ELIGE TU TRASTORNO]',
    sonicFootnotes: [
      {
        id: 'cue-miarma-vagal',
        label: '▶ MOUNT BM-03 // MIARMA — PULSO HIPNÓTICO 122 BPM [01:00]',
        caption: 'Sub-grave respiratorio sin drops artificiales para regulación autonómica nocturna.',
        audioUrl: '/audio/bandcamp/miarma_silence_also_dance.mp3',
        seekSeconds: 60,
      },
      {
        id: 'cue-vagal-drift',
        label: '▶ SYNTH PROOF // BATIMIENTO LENTO DE DESESCALADA (82.5 Hz × 84.5 Hz)',
        caption: 'Oscilación de 2.0 Hz acoplada al sub-armónico de quinta del Studer A800.',
        binauralHz: [82.5, 84.5],
      },
    ],
    sections: [
      {
        heading: 'I. El Motor Neurodivergente (TDAH & Doble Excepcionalidad 2e)',
        paragraphs: [
          '01. LEY CERO DE LA NEURO-TERMODINÁMICA — El TDAH no es venir roto de fábrica: es un motor V8 atmosférico que exige alta energía libre para vencer la inercia de arranque, pero cuando entra en circuito opera en régimen laminar.',
          '02. ATASCO DE KRAMERS (La Falsa Pereza) — No es falta de voluntad: rellenar burocracia estéril no genera en la hendidura sináptica el gradiente dopaminérgico mínimo para cruzar la barrera de activación.',
          '03. DOBLE EXCEPCIONALIDAD (2e) — Operar al percentil 99 desarmando arquitecturas no lineales y bloquearse en seco frente a un formulario administrativo de un regulador descalibrado.',
        ],
        formalBlock:
          'TASA DE ESCAPE DE KRAMERS:  k ~ exp( -ΔU_activación / Φ_dopamina )\nSI Φ_dopamina → 0 (Burocracia Anérgica)  ⇒  Tiempo de Arranque τ → ∞ (Bloqueo Físico, no moral)',
      },
      {
        heading: 'II. Pánico, Freno del Cuerpo y Manual Override Trap',
        paragraphs: [
          '04. OPALESCENCIA CRÍTICA SOMÁTICA — El temblor y la taquicardia antes de una mutación vital no anuncian colapso: son las fluctuaciones críticas de varianza cuando el sistema abandona un atractor agotado.',
          '05. MANUAL OVERRIDE TRAP (La Trampa del Volante) — Intentar gobernar conscientemente el ritmo cardíaco con la corteza prefrontal es el Aforismo 3 puro: el regulador voluntario inyecta ganancia positiva al bucle simpático. Soltar el volante devuelve el canal al bulbo raquídeo.',
          '06. FALSACIÓN DE LA CULPA MÉDICA — Dejar de patologizar como «trastorno» la fricción mecánica inevitable entre un pura sangre y una carreta de bueyes.',
        ],
      },
    ],
  },
  {
    slug: 'borjario-silicon-acreativo',
    code: 'CX-04',
    title: 'EL BORJARIO DE SILICIO: MÉTODO ACREATIVO Y FORMA PRIMORDIAL',
    subtitle: 'Invariantes de anillo cero, sustracción de grasa semántica y arquitectura de transducción soberana',
    author: 'Borja Fernández Angulo',
    role: 'Investigador en Sistemas Complejos',
    density: 'APHORISM',
    readingTime: '3 MIN',
    axis: 'RING-0 & SOVEREIGNTY',
    linkedWorkIds: ['babylon-60-kernel', 'cactuses', 'blac-cinema'],
    linkedNodeSlugs: ['borjario-wetware-2e', 'aforismos-152-punto-fijo-omega'],
    sonicFootnotes: [
      {
        id: 'cue-cactuses-peyote',
        label: '▶ MOUNT BM-02 // CACTUSES (PEYOTE) — AUSTERIDAD XERÓFITA [00:24]',
        caption: 'Síntesis seca sin reverberación decorativa: conservación energética extrema.',
        audioUrl: '/audio/bandcamp/cactuses_peyote.mp3',
        seekSeconds: 24,
      },
      {
        id: 'cue-hidden-glitch',
        label: '▶ ARCHIVE MASTER // GLITCH IN THE MIRROR [00:50]',
        caption: 'Master inédito rescatado del archivo local (/audio/glitch_in_the_mirror.mp3).',
        audioUrl: '/audio/glitch_in_the_mirror.mp3',
        seekSeconds: 50,
      },
    ],
    sections: [
      {
        heading: 'I. Epistemología Acreativa y Transducción',
        paragraphs: [
          'MÉTODO ACREATIVO — Construir sustrayendo grasa: cuando una escultura, un kernel o una mezcla acústica pierden definición, no se les pega plastilina encima; se entra con cincel.',
          'EMERGENCIA TRANSDUCTIVA («Si es genial, no era tu idea») — Toda ocurrencia voluntaria del ego es derivativa y acotada por su mapa previo. La obra soberana emerge cuando el plan inicial colapsa contra la física del material y el autor opera como antena limpia de baja impedancia.',
          'FORMA PRIMORDIAL — Cualquier entidad forzada a vivir fuera de su forma original habita el peor estado de su propia existencia. Domesticar un transductor de alta capacidad produce máxima anergía térmica.',
        ],
        formalBlock:
          'OPERADOR ACREATIVO:   Ω(S) = S \\ { x ∈ S : ΔΦ_causal(x) ≤ 0 }\nPUNTO FIJO OMEGA:     Ω(S*) = S*  (Cero piezas ornamentales · Coherencia = 1)',
      },
      {
        heading: 'II. Primitivas de Silicio (Ring-0)',
        paragraphs: [
          'BABYLON-60 & KUDURRU-64 — Arquitectura de tres anillos con cerrojo Seqlock de 64 bytes alineado a línea de caché L1 en memoria unificada Apple Silicon: el metal verifica en sub-microsegundo; ningún agente externo contamina el estado sin recibo criptográfico.',
          'SURREALISMO DEL BUENO — La chispa de alta exergía que salta cuando la geometría diferencial más estricta choca de frente con el asfalto húmedo de la Ría del Nervión.',
        ],
      },
    ],
  },
  {
    slug: 'aforismos-152-punto-fijo-omega',
    code: 'CX-05',
    title: 'AFORISMOS SIN NATA: 152 INVARIANTES HACIA EL PUNTO FIJO Ω',
    subtitle: 'Los 5 detectores universales de error, la naturaleza física del misterio y el compendio íntegro en PDF',
    author: 'Borja Fernández Angulo',
    role: 'Investigador en Sistemas Complejos',
    density: 'TREATISE',
    readingTime: '4 MIN + PDF',
    axis: 'INFORMATION GEOMETRY',
    linkedWorkIds: ['the-five-aphorisms', 'autopoiesis-closure', 'science-of-friction-book'],
    linkedNodeSlugs: ['lo-sutil-fisher-metrology', 'borjario-silicon-acreativo'],
    pdfUrl: '/aforismos_152_omega.pdf',
    pdfLabel: 'OPEN MONOGRAPH PDF // 152 AFORISMOS PUNTO FIJO Ω [449 KB]',
    sonicFootnotes: [
      {
        id: 'cue-ecos-cosmos',
        label: '▶ MOUNT BM-08 // ECOS DEL COSMOS — CLAUSURA ORBITAL [01:15]',
        caption: 'Osciladores de onda lenta y deriva microtonal bajo envolvente cerrada.',
        audioUrl: '/audio/ecos_del_cosmos.mp3',
        seekSeconds: 75,
      },
    ],
    sections: [
      {
        heading: '1. Los Cinco Aforismos Fundacionales (Detectores de Confabulación)',
        paragraphs: [
          '1. Transformar ruido en conceptos: La inteligencia es compresión restringida por la unicidad geométrica de Chentsov. Toda abstracción que no preserve morfismos de Markov es confabulación.',
          '2. Confundir mapa con territorio: Tratar el modelo simbólico como realidad física ignora las variables latentes omitidas y garantiza la colisión contra el sustrato.',
          '3. La solución intentada es el problema: El regulador descalibrado alimenta con su propia corrección el modo de vibración que pretende apagar. Ante un canal agotado, la única maniobra válida es el Cambio 2 (salto topológico de atractor).',
          '4. El cambio surge cuando el dolor de permanecer igual supera al de cambiar: Ningún sistema abandona su pozo de potencial hasta que la fricción acumulada rebasa la barrera termodinámica de activación.',
          '5. Lo voluntario vale menos que lo involuntario: La retórica tiene coste de falsificación nulo; solo las señales involuntarias acopladas a coste físico e irreversible revelan la política causal real.',
        ],
        formalBlock:
          'COSTE DE FALSIFICACIÓN (AFORISMO 5):\nH_manipulación(Señal Voluntaria) ≫ 0   |   Costo_Landauer(Señal Involuntaria) ──► Invariante Física',
      },
      {
        heading: '2. La Naturaleza del Misterio y la Clausura de Markov',
        paragraphs: [
          'El «misterio» no es niebla esotérica: es la fricción medible en la interfaz entre nuestra compresión simbólica de bajo coste y las invariantes no negociables del territorio que desbordan la capacidad de bisimulación del ego. En el arte mayor y la maestría somática, la técnica voluntaria solo construye el andamio para retirarse cuando lo involuntario toma el canal.',
        ],
      },
    ],
  },
  {
    slug: 'pre-conflict-acoustics-broken-compas',
    code: 'CX-06',
    title: 'ACÚSTICA PRE-CONFLICTO: SUB-GRAVE AERODINÁMICO Y COMPÁS ROTO',
    subtitle: 'Ingeniería de rango dinámico, rasgueo seco de nylon, presión a 28 Hz y demolición del limitador industrial',
    author: 'Borja Fernández Angulo',
    role: 'Investigador en Sistemas Complejos',
    density: 'ESSAY',
    readingTime: '5 MIN',
    axis: 'ACOUSTIC PHYSICS',
    linkedWorkIds: ['instructions-for-flying', 'farandula', 'album-b', 'heimatflug'],
    linkedNodeSlugs: ['rubin-radiohead-coupling', 'borjario-silicon-acreativo'],
    sonicFootnotes: [
      {
        id: 'cue-antes-guerras',
        label: '▶ MOUNT BM-07 // ANTES DE LAS GUERRAS — 28 Hz & NYLON [00:40]',
        caption: 'Tensión acústica pre-conflicto: guitarra española seca contra sub-grave Moog Sub 37.',
        audioUrl: '/audio/antes_de_las_guerras.mp3',
        seekSeconds: 40,
      },
      {
        id: 'cue-patadas-archive',
        label: '▶ ARCHIVE MASTER // PATADAS EN LA BOCA [00:35]',
        caption: 'Corte crudo del archivo Instructions for Flying con percusión industrial sin aplastar.',
        audioUrl: '/audio/patadas.mp3',
        seekSeconds: 35,
      },
      {
        id: 'cue-farandula-compas',
        label: '▶ MOUNT BM-06 // FARÁNDULA (QUÉ PUTA!) — COMPÁS ROTO [00:20]',
        caption: 'Síncopa asimétrica a 128 BPM y sátira tímbrica sobre el espectáculo cultural.',
        audioUrl: '/audio/bandcamp/farandula_que_puta.mp3',
        seekSeconds: 20,
      },
    ],
    sections: [
      {
        heading: '1. Contra la Nata Sónica: Factor de Cresta y Magnetismo a 15 IPS',
        paragraphs: [
          'La producción comercial contemporánea sufre pánico al vacío: rellena cada octava con colchones sintéticos y aplasta el bus maestro contra un brickwall digital hasta reducir el Factor de Cresta (WCF) a una salchicha rectangular inerte. El oído humano deja de percibir impacto porque sin valle de silencio no existe gradiente de presión.',
          'En Instructions for Flying (BM-07), Farándula (BM-06) y [B] (BM-05), la arquitectura parte del vacío negro: transitorios secos de madera y cuerda de nylon cortados al microsegundo conviven con ondas fundamentales de 28 Hz a 45 Hz saturadas por histéresis magnética suave (355 nWb/m), conservando la pegada visceral sin fatiga timpánica.',
        ],
        formalBlock:
          'EXERGÍA ACÚSTICA:  WCF = Peak_dBFS - RMS_dBFS  (Objetivo Soberano: ≥ 10.5 dB de aire real)\nSATURACIÓN STUDER: y(x) = [(3 + k) · x · 20°] / [π + k · |x|]  ──► Armónicos pares cálidos sin clipping duro',
      },
      {
        heading: '2. Cyber-Flamenco y Fractura de la Cuantización 4/4',
        paragraphs: [
          'La rejilla 4/4 rígida del club estandarizado narcotiza la corteza motora por exceso de predicción. Introducir células de amalgama de doce tiempos (seguiriyas y bulerías quebradas) dentro de síntesis granular y electro oscuro obliga al cuerpo a recalibrar su modelo predictivo en cada compás: baile y vigilancia cognitiva fundidos en el mismo golpe.',
        ],
      },
    ],
  },
];

export function getCodexNodeBySlug(slug: string): CodexNode | undefined {
  return CODEX_NODES.find((n) => n.slug === slug);
}

export function getLinkedCodexNodesForWork(workId: string): CodexNode[] {
  return CODEX_NODES.filter((n) => n.linkedWorkIds.includes(workId));
}
