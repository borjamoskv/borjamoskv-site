export type SectionType = 'MUSIC' | 'ART' | 'COMPLEX SYSTEMS';

export interface WorkItem {
  id: string;
  catalogNumber: string;
  title: string;
  section: SectionType;
  year: string;
  discipline: string;
  duration?: string;
  format: string;
  audioUrl?: string;
  imageUrl: string;
  videoUrl?: string;
  documentUrl?: string;
  bandcampUrl?: string;
  essayTitle: string;
  essay: string[];
  specs: {
    label: string;
    value: string;
  }[];
}

export const WORKS: WorkItem[] = [
  // ==========================================
  // SECTION: MUSIC (BANDCAMP DISCOGRAPHY & SOVEREIGN MASTERS)
  // ==========================================
  {
    id: 'this-was-in-rainbows',
    catalogNumber: 'BM-01',
    title: 'THIS WAS IN RAINBOWS',
    section: 'MUSIC',
    year: '2024',
    discipline: 'IDM / Granular Radiohead Deconstruction',
    duration: '04:12',
    format: '10-Track LP // Digital & Master Tape',
    audioUrl: '/audio/bandcamp/this_was_in_rainbows_15_step.mp3',
    imageUrl: '/media/bandcamp/this_was_in_rainbows.jpg',
    bandcampUrl: 'https://borjamoskv.bandcamp.com/album/this-was-in-rainbows',
    essayTitle: 'Acoustic Autopsy: In Rainbows Reimagined as IDM',
    essay: [
      "A dark, uncompromising reinterpretation of Radiohead's iconic 'In Rainbows', dissected through the lens of IDM, acid-house, and granular synthesis.",
      'Every acoustic element of the original album is fragmented into micro-transients, re-pitched, and suspended within asynchronous delay lines. Organic guitar phrases collide with abrasive, mathematically precise rhythm beds.',
      'Featured Track: "15 Step (Borja Moskv Rework)". An inquiry into how rock songwriting can be transducted into modern kinetic electronic architecture without losing its emotional center.'
    ],
    specs: [
      { label: 'Release Type', value: '10-Track Long Play Album' },
      { label: 'Featured Track', value: '15 Step (Rework)' },
      { label: 'Synthesis', value: 'Granular Buffer Modulation & Acid 303' },
      { label: 'Bandcamp Store', value: 'borjamoskv.bandcamp.com' }
    ]
  },
  {
    id: 'cactuses',
    catalogNumber: 'BM-02',
    title: 'CACTUSES',
    section: 'MUSIC',
    year: '2023',
    discipline: 'Botanical Minimal Synth / Desert IDM',
    duration: '03:52',
    format: '23-Track Botanical Catalogue // Archival Master',
    audioUrl: '/audio/bandcamp/cactuses_peyote.mp3',
    imageUrl: '/media/bandcamp/cactuses.jpg',
    bandcampUrl: 'https://borjamoskv.bandcamp.com/album/cactuses-2',
    essayTitle: 'Xerophytic Resilience as an Informational Metaphor',
    essay: [
      'A 23-track botanical-electronic compendium where desert plant species serve as sonic blueprints for survival under severe thermodynamic friction.',
      'Each composition takes the scientific name of a succulent adapted to drought (Coryphantha, Geohintonia, Cholla, Peyote, Islaya minor). The audio mirrors this biological austerity: sparse textures, bone-dry synth transients, zero decorative reverb.',
      'Featured Track: "Peyote". A rhythmic meditation on enduring harsh environments through radical energetic conservation.'
    ],
    specs: [
      { label: 'Catalogue Scope', value: '23 Canonical Species Tracks' },
      { label: 'Featured Track', value: 'Peyote (Track 04)' },
      { label: 'Acoustic Model', value: 'Sub-bass Spine & Resonant Wood' },
      { label: 'Bandcamp Store', value: 'Available on Bandcamp' }
    ]
  },
  {
    id: 'miarma',
    catalogNumber: 'BM-03',
    title: 'MIARMA',
    section: 'MUSIC',
    year: '2023',
    discipline: 'Contemplative Club / Microhouse',
    duration: '04:58',
    format: '3-Track EP // 12-Inch Vinyl Cut',
    audioUrl: '/audio/bandcamp/miarma_silence_also_dance.mp3',
    imageUrl: '/media/bandcamp/miarma.jpg',
    bandcampUrl: 'https://borjamoskv.bandcamp.com/album/miarma',
    essayTitle: 'Silence Also Dances: The Slowness of the Night',
    essay: [
      'An introspective portrait of silence, slowness, and the inner dance floor. MIARMA exists at the exact intersection between monastic contemplation and somatic club resonance.',
      'Stillness transforms into rhythm, sub-bass into breath. The arrangements are stripped of frantic builds and drops, allowing the groove to breathe and unfold with patient hypnotic authority.',
      'Featured Track: "Silence Also Dance". Deep microhouse frequencies designed for late-night listening.'
    ],
    specs: [
      { label: 'Format', value: '3-Track Extended Play' },
      { label: 'Featured Track', value: 'Silence Also Dance' },
      { label: 'Tempo & Groove', value: '122 BPM Hypnotic Minimal' },
      { label: 'Mastering', value: 'Pure Tape Headroom (-14 LUFS)' }
    ]
  },
  {
    id: 'lo-inmanente',
    catalogNumber: 'BM-04',
    title: 'LO INMANENTE',
    section: 'MUSIC',
    year: '2023',
    discipline: 'Downtempo / Consciousness Archaeology',
    duration: '03:42',
    format: '4-Track Spatial Meditation // 24-bit',
    audioUrl: '/audio/bandcamp/lo_inmanente_title.mp3',
    imageUrl: '/media/bandcamp/lo_inmanente.jpg',
    bandcampUrl: 'https://borjamoskv.bandcamp.com/album/lo-inmanente',
    essayTitle: 'Recursive Interiority: When the Mystery Stares Back',
    essay: [
      'An intimate sonic expedition into the internal architecture of consciousness. Lo Inmanente maps the boundary where the ego dissolves into pure phenomenological perception.',
      'Featuring tracks such as "Dentro de mí", "Hyperdentro de mí", and "Me mira el misterio", the work constructs a sonic hall of mirrors using generative acoustic reverberations and pitch-shifted field recordings.',
      'Featured Track: "Lo inmanente". A haunting downtempo transmission from the core of subjective experience.'
    ],
    specs: [
      { label: 'Format', value: '4-Track Concept Suite' },
      { label: 'Featured Track', value: 'Lo inmanente (Title Track)' },
      { label: 'Psychoacoustics', value: 'Binaural Drift & Phase Coherence' },
      { label: 'Bandcamp Store', value: 'Direct Digital Acquisition' }
    ]
  },
  {
    id: 'album-b',
    catalogNumber: 'BM-05',
    title: '[B]',
    section: 'MUSIC',
    year: '2023',
    discipline: 'Dark Disco / Microhouse / Electronic Decay',
    duration: '04:15',
    format: '6-Track EP // Heavyweight Cassette',
    audioUrl: '/audio/bandcamp/album_b_butwhatthefuck.mp3',
    imageUrl: '/media/bandcamp/album_b.jpg',
    bandcampUrl: 'https://borjamoskv.bandcamp.com/album/b',
    essayTitle: 'Tenderness in the Electronic Rubble',
    essay: [
      'Suspended between wild nocturnal abandon and morning lucidity, [B] chronicles the vulnerability that surfaces once the strobe lights fade and the smoke settles.',
      'Dark disco basslines and microhouse drums meet linguistic satire and poetic vulnerability in Spanish: "[B]UTWHATTHEFUCKARETHOSESAYTHEY", "[B]alas de [B]randy", "[B]elleza que duele".',
      'Featured Track: "[B]UTWHATTHEFUCKARETHOSESAYTHEY". An infectious, gritty dancefloor excursion wrapped in warm tape saturation.'
    ],
    specs: [
      { label: 'Format', value: '6-Track Concept EP' },
      { label: 'Featured Track', value: '[B]UTWHATTHEFUCKARETHOSESAYTHEY' },
      { label: 'Vibe', value: 'Dark Disco meets Analog Microhouse' },
      { label: 'Tape Saturation', value: 'Harmonic 2nd Order Overdrive' }
    ]
  },
  {
    id: 'farandula',
    catalogNumber: 'BM-06',
    title: 'FARÁNDULA',
    section: 'MUSIC',
    year: '2024',
    discipline: 'Cultural Satire / Broken Flamenco / Glitch',
    duration: '03:30',
    format: '10-Track LP // Sovereign Web Release',
    audioUrl: '/audio/bandcamp/farandula_que_puta.mp3',
    imageUrl: '/media/bandcamp/farandula.jpg',
    bandcampUrl: 'https://borjamoskv.bandcamp.com/album/far-ndula',
    essayTitle: 'Demolishing the Spectacle: Acid Irony & Flamenco Noise',
    essay: [
      'A ferocious cultural critique directed at modern vanity, influencers, and intellectual complacency. FARÁNDULA takes scissors to cultural clichés, combining broken flamenco compases with glitch-hop and speech deconstruction.',
      'Tracks like "Qué puta!", "Ciclistas", "El método Nicolás", and "Cubista y Narcista" dissect public hysteria with razor-sharp black humor and uncompromising beatcraft.',
      'Featured Track: "Qué puta!". Raw energy, rapid syncopation, and sardonic brilliance.'
    ],
    specs: [
      { label: 'Format', value: '10-Track Full Album' },
      { label: 'Featured Track', value: 'Qué puta!' },
      { label: 'Rhythm Matrix', value: 'Asymmetric 128 BPM Syncopation' },
      { label: 'Bandcamp Store', value: 'Direct Bandcamp Acquisition' }
    ]
  },
  {
    id: 'instructions-for-flying',
    catalogNumber: 'BM-07',
    title: 'INSTRUCTIONS FOR FLYING',
    section: 'MUSIC',
    year: '2024',
    discipline: 'Aerodynamic Sub-Bass / Granular Electronics',
    duration: '04:50',
    format: 'Full LP // Master Tape & Vinyl Edition',
    audioUrl: '/audio/antes_de_las_guerras.mp3',
    imageUrl: '/media/works/06.webp',
    bandcampUrl: 'https://borjamoskv.bandcamp.com/album/instructions-for-flying',
    essayTitle: 'Aerodynamic Transduction: The Physics of Flight in Mechanical Sound',
    essay: [
      'A long-play concept album exploring the physical mechanics of aerodynamic lift, sub-bass pressure, and microtonal drift.',
      'Dissecting tracks such as "JAR TO THE SYSTEM", "Ecos del Cosmos", "Antes de las Guerras", "Glitch in the Mirror", and "Patadas en la Boca". Organic rasgueados and industrial synthesis anchor erratic rhythms into an inescapable mechanical grid.',
      'Featured Track: "Antes de las Guerras". Pre-conflict acoustic tension translated through bone-dry nylon guitar rasgueados and sub-bass operating down to 28Hz.'
    ],
    specs: [
      { label: 'Catalogue Code', value: 'MOSKV-LP01' },
      { label: 'Featured Track', value: 'Antes de las Guerras' },
      { label: 'Mastering', value: '44.1 kHz / 24-bit · -8.5 LUFS Integrated' },
      { label: 'Hardware Gear', value: 'Erica Synths Black System III, Elektron Octatrack, Moog Sub 37' }
    ]
  },
  {
    id: 'heimatflug',
    catalogNumber: 'BM-08',
    title: 'HEIMATFLUG',
    section: 'MUSIC',
    year: '2024',
    discipline: 'Dual Mix Electronics / Deep Resonance',
    duration: '06:15',
    format: 'Single // Dual Mix (FLAC & WAV 24-bit)',
    audioUrl: '/audio/ecos_del_cosmos.mp3',
    imageUrl: '/media/works/07.webp',
    bandcampUrl: 'https://soundcloud.com/borja-moskv',
    essayTitle: 'Bipolar Velocity: The Bouncy Morning & Organic Deep Mixes',
    essay: [
      'A dual-state production structured across complementary polarities: the driving kinetic traction of the Bouncy Morning Mix and the deep organic resonance of the Organic Deep Mix.',
      'Constructed with analog synthesizers, discrete basslines, and spatialized acoustic reflections, capturing the threshold between nocturnal velocity and dawn stillness.',
      'Featured Track: "Ecos del Cosmos". Orbital topology and deep space acoustic drifts rendered with slow-wave drone oscillators and microtonal modulation.'
    ],
    specs: [
      { label: 'Catalogue Code', value: 'MOSKV-SN02' },
      { label: 'Mix Structure', value: 'Dual Polarity: Bouncy (126 BPM) / Organic (122 BPM)' },
      { label: 'Mastering', value: 'Lossless 24-bit Full Dynamic Range' },
      { label: 'Synthesis', value: 'Discrete Analog Basslines & Spatial Reverberation' }
    ]
  },

  // ==========================================
  // SECTION: ART
  // ==========================================
  {
    id: 'moby-moncloa-54',
    catalogNumber: 'BM-09',
    title: 'MOBY MONCLOA: 5:4 CINEMATIC SURREALISM',
    section: 'ART',
    year: '2026',
    discipline: 'Sovereign Cinema / 5:4 Direct Film Gate',
    format: '1350×1080 Aspect // Continuous Video Loop',
    imageUrl: '/media/works/moby_moncloa_54_poster.jpg',
    videoUrl: '/media/works/moby_moncloa_54_loop.mp4',
    essayTitle: 'The Moncloa Surrealist Clash: Rajoy, Chiquito, Doraemon & E.T.',
    essay: [
      'A high-voltage kinetic surrealist collision of Spanish collective memory, political satire, and 90s big beat adrenaline, cut to Moby\'s "Bodyrock".',
      'Structured in four explosive acts: Act I captures Mariano Rajoy powerwalking past the Moncloa columns; Act II unleashes Chiquito de la Calzada in full robotic "fistro" footwork and rapid quiebros; Act III stages a synchronized B-boy windmill breakdance battle between Doraemon and Espinete; Act IV culminates in an E.T. boyband climax in a white suit.',
      'Rendered natively in strict 5:4 (1350×1080 px) aspect ratio using the Google Flow video synthesis pipeline to reject conventional horizontal cinematic complacency.'
    ],
    specs: [
      { label: 'Aspect Ratio', value: '5:4 Standard (1350 × 1080 px)' },
      { label: 'Soundtrack Source', value: 'Moby — Bodyrock (Big Beat)' },
      { label: 'Narrative Acts', value: 'Rajoy Powerwalk · Chiquito · Doraemon/Espinete · E.T.' },
      { label: 'Pipeline Engine', value: 'Google Flow Veo & Imagen (Sovereign Cinema)' }
    ]
  },
  {
    id: 'blac-cinema',
    catalogNumber: 'BM-10',
    title: 'BLAC: TEN KILOMETERS OF ELECTRIC INSOMNIA',
    section: 'ART',
    year: '2024',
    discipline: 'Brutalist CinemaScope / 4K Film Essay',
    format: '2.39:1 CinemaScope // 4K UHD Master',
    audioUrl: '/audio/jar_to_the_system.mp3',
    imageUrl: '/media/works/01.webp',
    essayTitle: 'Bilbao Nocturne: Damp Concrete on the Nervión',
    essay: [
      'A relentless rhythmic descent into the nocturnal pulse of the Nervión estuary. Ten kilometers of electric insomnia captured under sodium vapor illumination and analog 35mm grain.',
      'Brutalist concrete architecture, industrial docks, and wet asphalt become acoustic and visual resonators long after the city has fallen silent. Everything emits; nobody listens.',
      'Audio: "JAR TO THE SYSTEM" (WDF analog modeling, nonlinear FM, granular transient processing).'
    ],
    specs: [
      { label: 'Optics & Aspect', value: '2.39:1 Anamorphic CinemaScope' },
      { label: 'Location', value: 'Ría del Nervión / Bilbao Industrial Axis' },
      { label: 'Audio Synthesis', value: 'Wave Digital Filters (WDF) + Nonlinear FM' },
      { label: 'Film Archive', value: '4K Master (YouTube: 4Cb-Iu8DnJM)' }
    ]
  },
  {
    id: 'retratos-naroa',
    catalogNumber: 'BM-11',
    title: 'RETRATOS · NAROA GUTIÉRREZ GIL',
    section: 'ART',
    year: '2023',
    discipline: 'Cinematic Portraiture / Visual Documentary',
    format: 'Large-Format Moving Still // 4K UHD',
    imageUrl: '/media/works/08.webp',
    essayTitle: 'The Permeable Boundary: Human Flesh as an Open Sensor',
    essay: [
      'A moving visual study and intimate documentary portrait of artist and photographer Naroa Gutiérrez Gil. Studio lighting meets slow kinetic observation.',
      'Accompanied by an organic soundscape of prepared piano, reel tape flutter, and thermal noise. The human body is approached not as an object, but as a porous sensory gate through which all the noise of the world enters unfiltered.'
    ],
    specs: [
      { label: 'Subject', value: 'Naroa Gutiérrez Gil (Artist / Photographer)' },
      { label: 'Audio Texture', value: 'Prepared Piano & Studer Reel Flutter' },
      { label: 'Film Archive', value: 'YouTube: Zc8QEQ8y1f8' }
    ]
  },
  {
    id: 'portada-cocodrilo',
    catalogNumber: 'BM-12',
    title: 'COCODRILO: CHRONICLES OF VOLUNTARY ERROR',
    section: 'ART',
    year: '2025',
    discipline: 'Narrative Art / Illustrated Volume',
    format: 'Screenprinted Hardcover Edition',
    imageUrl: '/media/works/portada_cocodrilo.jpg',
    essayTitle: 'The Crocodile Trap: Bureaucracy as a Miscalibrated Regulator',
    essay: [
      'An allegorical graphic monograph on systemic capture. The predatory beast embodies the state regulatory apparatus: cold, reptilian, and thermodynamically inefficient.',
      'Through stark woodcut-inspired contrast and razor-sharp satire, the work exposes how attempted administrative solutions inevitably amplify the very friction they claim to soothe.'
    ],
    specs: [
      { label: 'Printing Technique', value: '4-Color Hand Screenprint' },
      { label: 'Substrate', value: 'Fedrigoni Materica Kraft 360g' },
      { label: 'Typographic Tone', value: 'Pre-Digital Grotesque Woodtype' }
    ]
  },
  {
    id: 'comic-elige-trastorno',
    catalogNumber: 'BM-13',
    title: 'CHOOSE YOUR DISORDER (SEQUENTIAL ART)',
    section: 'ART',
    year: '2024',
    discipline: 'Satirical Graphic Essay / Underground Comix',
    format: 'Lithographic Broadside Sheet (A2)',
    imageUrl: '/media/works/comic_elige_trastorno.jpg',
    essayTitle: 'The Industrialization of Human Divergence',
    essay: [
      'A sharp critique of contemporary psychiatric diagnostic inflation. The pharmaceutical-industrial complex converts existential and neurodivergent complexity into standardized consumption categories.',
      'Drawn in the raw style of 1970s underground comix, the narrative lays bare the Watzlawick feedback loop: treating symptoms with pharmacological patches while leaving systemic causes intact.'
    ],
    specs: [
      { label: 'Medium', value: 'India Ink on Bristol Vellum' },
      { label: 'Dimension', value: '420 × 594 mm (A2 Broadside)' },
      { label: 'Lettering', value: 'Hand-Cut Mechanical Transfer' }
    ]
  },

  // ==========================================
  // SECTION: COMPLEX SYSTEMS
  // ==========================================
  {
    id: 'science-of-friction-book',
    catalogNumber: 'BM-14',
    title: 'THE SCIENCE OF FRICTION (TREATISE)',
    section: 'COMPLEX SYSTEMS',
    year: '2026',
    discipline: 'Theoretical Physics & Information Geometry',
    format: 'Full Monograph (PDF Document) // 29 Pages · 34,230 Words',
    imageUrl: '/media/works/09.webp',
    documentUrl: '/ciencia_friccion_libro.pdf',
    essayTitle: 'A Mathematical and Somatic Foundation of Systemic Resistance',
    essay: [
      'The foundational treatise unifying Chentsov information geometry, Fisher information metrics, non-equilibrium thermodynamics, and institutional cybernetics.',
      'Written under strict Perec-style linguistic constraint: zero qualifying adjectives and zero adverbial -mente suffixes across the entire body of the text. Information lives strictly in nouns (entities) and verbs (operators).',
      'Includes primary legal and clinical dossiers on psychiatric iatrogenia (Study 329, Moncrieff 2022, Rosenhan experiment, Ashton manual). Click the reading button to inspect the unabridged 29-page treatise online.'
    ],
    specs: [
      { label: 'Page Count', value: '29 Pages (Canonical A5 Bound PDF)' },
      { label: 'Word Density', value: '34,230 Words (Zero Adjectives)' },
      { label: 'Mathematical Spine', value: 'Chentsov Uniqueness Theorem' },
      { label: 'Access', value: 'Direct PDF Reader & Download' }
    ]
  },
  {
    id: 'babylon-60-kernel',
    catalogNumber: 'BM-15',
    title: 'BABYLON-60 & SOVEREIGN EXERGY',
    section: 'COMPLEX SYSTEMS',
    year: '2026',
    discipline: 'Ring-0 Architecture & Autonomic Systems',
    format: 'Formally Verified Kernel Architecture',
    imageUrl: '/media/works/gflow_cyber_codex_54.jpg',
    essayTitle: 'Decoupling Machine Intelligence from Bureaucratic Decay',
    essay: [
      'A blueprint for Ring-0 software resilience. Built around lock-free SPMC circular queues (KUDURRU-64), zero-copy unified memory buffers on Apple Silicon, and deterministic 7-tuple decision verifiers.',
      'Babylon rejects the cloud SaaS middleman. Computation occurs strictly on bare-metal hardware, anchored to Secure Enclave hardware cryptography and irreversible state receipts.'
    ],
    specs: [
      { label: 'Latency Horizon', value: 'Sub-Microsecond Zero-Copy IPC' },
      { label: 'Concurrency Model', value: 'Lock-Free Seqlock Atomic CAS' },
      { label: 'Hardware Root', value: 'Apple Silicon UMA & Touch ID Gate' }
    ]
  },
  {
    id: 'the-five-aphorisms',
    catalogNumber: 'BM-16',
    title: 'THE FIVE FOUNDATIONAL APHORISMS',
    section: 'COMPLEX SYSTEMS',
    year: '2026',
    discipline: 'Epistemic Invariants & Dialectics',
    format: 'C5-REAL Constitution // High Exergy',
    imageUrl: '/media/works/11.webp',
    essayTitle: 'The Universal Detector of Cognitive and Structural Delusion',
    essay: [
      '1. Transform noise into concepts: Intelligence is compression constrained by Chentsov geometric uniqueness. Anything else is confabulation.',
      '2. Confuse map with territory: The false isomorphism fallacy. Treating mental abstractions as physical reality ensures terminal collision with the substrate.',
      '3. The attempted solution is the problem: Feedback loops of miscalibrated regulators feed the very error they seek to remedy.',
      '4. Change arises when the pain of staying the same exceeds that of changing: Thermodynamic activation barriers govern systemic mutations.',
      '5. The voluntary is worth less than the involuntary: Signals controlled by will carry high manipulation entropy; involuntary biological signals reveal the genuine causal policy.'
    ],
    specs: [
      { label: 'Epistemic Standard', value: 'C5-REAL Constitutional Axioms' },
      { label: 'Compression Yield', value: 'Maximum Kolmogorov Density' },
      { label: 'Classification', value: 'Universal Error Detectors' }
    ]
  },
  {
    id: 'autopoiesis-closure',
    catalogNumber: 'BM-17',
    title: 'AUTOPOIESIS & COGNITIVE CLOSURE',
    section: 'COMPLEX SYSTEMS',
    year: '2026',
    discipline: 'Cybernetics & Information Geometry',
    format: 'Topological Field Model',
    imageUrl: '/media/works/12.webp',
    essayTitle: 'Markov Blankets and the Physics of Sovereign Agency',
    essay: [
      'An agent exists solely by virtue of the boundary that separates its internal states from environmental fluctuations. Dissolve the Markov blanket, and the entity ceases to compute.',
      'By treating cognitive sovereignty as a thermodynamic closed loop, this work establishes mathematical limits on external surveillance, digital extraction, and societal domestication.'
    ],
    specs: [
      { label: 'Formalism', value: 'Friston Free Energy Principle' },
      { label: 'Substrate Affinity', value: 'Decoupled P2P Zero-Trust Nodes' },
      { label: 'Theoretical Climax', value: 'Fixed Point Omega Convergence' }
    ]
  }
];
