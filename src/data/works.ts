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
  documentUrl?: string;
  essayTitle: string;
  essay: string[];
  specs: {
    label: string;
    value: string;
  }[];
}

export const WORKS: WorkItem[] = [
  // ==========================================
  // SECTION: MUSIC
  // ==========================================
  {
    id: 'antes-de-las-guerras',
    catalogNumber: 'BM-01',
    title: 'ANTES DE LAS GUERRAS',
    section: 'MUSIC',
    year: '2026',
    discipline: 'Dark Cyber-Flamenco / Sub-Bass',
    duration: '03:45',
    format: 'Analog 2-Track Master // 24-bit 48kHz',
    audioUrl: '/audio/antes_de_las_guerras.mp3',
    imageUrl: '/media/works/01.webp',
    essayTitle: 'Acoustic Transduction of the Pre-Conflict Threshold',
    essay: [
      'The composition examines the precise millisecond before kinetic collapse. Traditional nylon guitar rasgueados are recorded dry, devoid of digital reverb, and subjected to sharp nonlinear tape compression.',
      'The bassline operates at the limits of low-frequency audibility (28Hz - 55Hz), creating a physical displacement of air that anchors the erratic flamenco compás into an inescapable mechanical grid.',
      'Here, technique is not an exhibition of artistic vanity; it functions as an acoustic transducer of somatic tension.'
    ],
    specs: [
      { label: 'Tape Speed', value: '15 IPS (38.1 cm/s)' },
      { label: 'Harmonic Saturation', value: '2nd & 3rd Order Analog Curve' },
      { label: 'Dynamic Range', value: '14.2 LUFS Integrated' },
      { label: 'Tuning System', value: 'A=432Hz Xen-Derived Microtonal' }
    ]
  },
  {
    id: 'ecos-del-cosmos',
    catalogNumber: 'BM-02',
    title: 'ECOS DEL COSMOS',
    section: 'MUSIC',
    year: '2026',
    discipline: 'Deep Spatial Ambient / Drone Physics',
    duration: '05:12',
    format: 'Continuous Magnetic Tape Loop // 1/4 inch',
    audioUrl: '/audio/ecos_del_cosmos.mp3',
    imageUrl: '/media/works/02.webp',
    essayTitle: 'Acoustic Horizon & Psychoacoustic Masking',
    essay: [
      'Constructed from slow-evolving recursive feedback matrices and analog filter modulation. The spectral content is carved along the 24 Bark critical bands to stimulate bilateral neuroacoustic entrainment.',
      'Silence is treated as an active material, not merely the absence of signal. As the tape loops circulate across the magnetic heads, physical hiss and microscopic wow-and-flutter introduce entropy into the sonic architecture.'
    ],
    specs: [
      { label: 'Sub-bass Peak', value: '34.8 Hz Resonant Core' },
      { label: 'Stereo Coherence', value: '+0.88 Phase Correlation' },
      { label: 'Signal-to-Noise', value: 'Vintage Tape Saturation (-62dB)' },
      { label: 'Acoustic Space', value: 'Synthesized Convolved Room' }
    ]
  },
  {
    id: 'glitch-in-the-mirror',
    catalogNumber: 'BM-03',
    title: 'GLITCH IN THE MIRROR',
    section: 'MUSIC',
    year: '2026',
    discipline: 'Microtonal Deconstruction / Broken Beat',
    duration: '04:30',
    format: 'Multitrack Stems Direct // Pure Phase',
    audioUrl: '/audio/glitch_in_the_mirror.mp3',
    imageUrl: '/media/works/03.webp',
    essayTitle: 'Somatic Fracture and Markov State Transitions',
    essay: [
      'An audit of internal dissonance. The percussion sections avoid quantized loops, relying instead on causal groove humanization with asymmetric micro-delays modeled on biological motor tremor.',
      'High-frequency transient bursts rupture the harmonic drone, creating moments of sudden auditory awakening. The mirror is not a reflection of the ego, but a detector of structural breakdown.'
    ],
    specs: [
      { label: 'Tempo Metric', value: '124.00 BPM (Fluid Modulation)' },
      { label: 'Bark Bands Carved', value: 'Bands 3, 7, 14 Psychoacoustic EQ' },
      { label: 'Phase Inversion', value: 'Dynamic Mid/Side Matrix' },
      { label: 'Head Type', value: 'Amorphous Cobalt Heads' }
    ]
  },
  {
    id: 'jar-to-the-system',
    catalogNumber: 'BM-04',
    title: 'JAR TO THE SYSTEM',
    section: 'MUSIC',
    year: '2025',
    discipline: 'Kinetic Industrial / Volterra Kernels',
    duration: '03:15',
    format: 'Analog WDF Tape Master // 96kHz',
    audioUrl: '/audio/jar_to_the_system.mp3',
    imageUrl: '/media/works/04.webp',
    essayTitle: 'Mechanical Exergy & Transient Shockwaves',
    essay: [
      'A blunt-force exercise in energy conservation. Every transient is calculated to deliver maximum mechanical punch without engaging digital brickwall limiters.',
      'Distortion is achieved strictly through physical circuit emulation (Wave Digital Filters) and nonlinear tape bias overload, eliminating synthetic digital harshness in favor of thick, tactile low-end impact.'
    ],
    specs: [
      { label: 'Punch Ratio', value: '12.4 dB Crest Factor' },
      { label: 'Transient Attack', value: '1.2 ms Pre-Filter' },
      { label: 'Tape Flux', value: '355 nWb/m High-Output' },
      { label: 'Distortion Profile', value: 'Triode-Pentode Analog Cascade' }
    ]
  },
  {
    id: 'patadas',
    catalogNumber: 'BM-05',
    title: 'PATADAS',
    section: 'MUSIC',
    year: '2025',
    discipline: 'Avant Flamenco / Percussive Transduction',
    duration: '04:02',
    format: '12-Beat Compás Stem Reel',
    audioUrl: '/audio/patadas.mp3',
    imageUrl: '/media/works/05.webp',
    essayTitle: 'The Kinetic Impact: Footwork as Shock Oscillator',
    essay: [
      'The sonic signature of timber floorboards under the violent impact of flamenco boots (taconeo), filtered through granular delay buffers and micro-gated reverb.',
      'The polyrhythm shifts between 12-beat Bulería and 4/4 syncopation, demonstrating how ancestral folk tension and forward-looking synthesis share the identical mathematical root.'
    ],
    specs: [
      { label: 'Rhythm Engine', value: '12-Compás Generative Sequencer' },
      { label: 'Transient Sculpting', value: 'Multiband Envelope Shaper' },
      { label: 'Frequency Scope', value: '20 Hz - 22 kHz Uncompressed' },
      { label: 'Substrate', value: 'Pure Silicon Realtime Rendering' }
    ]
  },

  // ==========================================
  // SECTION: ART
  // ==========================================
  {
    id: 'industrial-phantom-sound',
    catalogNumber: 'BM-06',
    title: 'INDUSTRIAL REICH & PHANTOM SOUND',
    section: 'ART',
    year: '2026',
    discipline: 'Cinematic Essay / 35mm Grain Film',
    format: 'Archival Monochrome Print // 4K Negative',
    imageUrl: '/media/works/06.webp',
    essayTitle: 'Architectural Decay and the Archaeology of Noise',
    essay: [
      'Post-industrial monoliths captured during the blue hour. Heavy concrete slabs, oxidized iron pipes, and silent cooling towers become acoustic resonators long after human labor has ceased.',
      'The camera approaches each structure not as scenic photography, but as a forensic investigation into lost kinetic potential and the persistent reverberation of past energy.'
    ],
    specs: [
      { label: 'Film Stock', value: 'Kodak Double-X 5222 B&W 35mm' },
      { label: 'Optics', value: 'Anamorphic 40mm T2.1 Prime' },
      { label: 'Aspect Ratio', value: '2.39:1 CinemaScope' },
      { label: 'Grading', value: 'Silver Halide Photochemical Emulation' }
    ]
  },
  {
    id: 'displacement-of-form',
    catalogNumber: 'BM-07',
    title: 'THE DISPLACEMENT OF FORM',
    section: 'ART',
    year: '2026',
    discipline: 'Brutalist Photography / Spatial Mass',
    format: 'Large-Format Silver Gelatin Study',
    imageUrl: '/media/works/07.webp',
    essayTitle: 'Weight, Shadow, and the Elimination of Ornament',
    essay: [
      'An inquiry into geometric severity. When decorative flourishes are stripped away, space collapses into pure dialectics: light against dense matte black, volume against void.',
      'Inspired by the uncompromising ethos of Peter Saville and the architectural legacy of brutalist civil engineering. The form does not ask for permission to exist.'
    ],
    specs: [
      { label: 'Geometry', value: 'Strict Euclidean Planar Slices' },
      { label: 'Contrast Ratio', value: '1000:1 Dynamic Range' },
      { label: 'Paper Grain', value: 'Heavyweight Baryta Fiber' },
      { label: 'Curatorial State', value: 'Permanent Codex Edition' }
    ]
  },
  {
    id: 'archive-of-subtlety',
    catalogNumber: 'BM-08',
    title: 'THE ARCHIVE OF SUBTLETY',
    section: 'ART',
    year: '2025',
    discipline: 'Visual Codex / Lithographic Plates',
    format: 'Limited Monograph // Folio Box',
    imageUrl: '/media/works/08.webp',
    essayTitle: 'Micro-Topologies of Paper, Tape, and Rust',
    essay: [
      'Macrophotographic plates documenting physical deterioration. The oxidation of iron oxide on recording tape, the yellowing of acid-free cotton fibers, the erosion of granite.',
      'To observe decay is to measure the thermodynamic arrow of time. Entropy ceases to be an abstract equation and becomes visible texture.'
    ],
    specs: [
      { label: 'Resolution', value: '150 Megapixel Scan Matrix' },
      { label: 'Illumination', value: 'Grazing Cross-Polarized Light' },
      { label: 'Color Depth', value: '16-bit Linear Raw' },
      { label: 'Edition', value: '08 of 60 Canonical Copies' }
    ]
  },
  {
    id: 'portada-cocodrilo',
    catalogNumber: 'BM-09',
    title: 'COCODRILO: CHRONICLES OF VOLUNTARY ERROR',
    section: 'ART',
    year: '2025',
    discipline: 'Narrative Art / Illustrated Volume',
    format: 'Screenprinted Hardcover Edition',
    imageUrl: '/media/portada_cocodrilo.jpg',
    essayTitle: 'The Crocodile Trap: Bureaucracy as a Miscalibrated Regulator',
    essay: [
      'An allegorical graphic monograph on systemic capture. The predatory beast embodies the state regulatory apparatus: cold, reptilian, and thermodynamically inefficient.',
      'Through stark woodcut-inspired contrast and razor-sharp satire, the work exposes how attempted administrative solutions inevitably amplify the very friction they claim to soothe.'
    ],
    specs: [
      { label: 'Printing Technique', value: '4-Color Hand Screenprint' },
      { label: 'Substrate', value: 'Fedrigoni Materica Kraft 360g' },
      { label: 'Typographic Tone', value: 'Pre-Digital Grotesque Woodtype' },
      { label: 'Status', value: 'Private Press Archival Record' }
    ]
  },
  {
    id: 'comic-elige-trastorno',
    catalogNumber: 'BM-10',
    title: 'CHOOSE YOUR DISORDER (SEQUENTIAL ART)',
    section: 'ART',
    year: '2024',
    discipline: 'Satirical Graphic Essay',
    format: 'Lithographic Broadside Sheet',
    imageUrl: '/media/comic_elige_trastorno.jpg',
    essayTitle: 'The Industrialization of Human Divergence',
    essay: [
      'A sharp critique of contemporary psychiatric diagnostic inflation. The pharmaceutical-industrial complex converts existential and neurodivergent complexity into standardized consumption categories.',
      'Drawn in the raw style of 1970s underground comix, the narrative lays bare the Watzlawick feedback loop: treating symptoms with pharmacological patches while leaving systemic causes intact.'
    ],
    specs: [
      { label: 'Medium', value: 'India Ink on Bristol Vellum' },
      { label: 'Dimension', value: '420 × 594 mm (A2 Broadside)' },
      { label: 'Lettering', value: 'Hand-Cut Mechanical Transfer' },
      { label: 'Discourse Filter', value: 'Popperian Falsification Level 3' }
    ]
  },

  // ==========================================
  // SECTION: COMPLEX SYSTEMS
  // ==========================================
  {
    id: 'science-of-friction-book',
    catalogNumber: 'BM-11',
    title: 'THE SCIENCE OF FRICTION (TREATISE)',
    section: 'COMPLEX SYSTEMS',
    year: '2026',
    discipline: 'Theoretical Physics & Information Theory',
    format: 'Full Monograph (PDF Document) // 480 Pages',
    imageUrl: '/media/works/09.webp',
    documentUrl: '/ciencia_friccion_libro.pdf',
    essayTitle: 'A Mathematical and Somatic Foundation of Systemic Resistance',
    essay: [
      'The magnum opus unifying Chentsov information geometry, Fisher information metrics, non-equilibrium thermodynamics, and institutional cybernetics.',
      'Friction is not a nuisance to be eliminated; it is the physical cost of causal mutation. Systems that suppress natural friction inevitably suffer catastrophic collapse when confronted with territory anomalies.',
      'Click the download button below to access the complete unabridged theoretical treatise.'
    ],
    specs: [
      { label: 'Document Type', value: 'Canonical Research Monograph' },
      { label: 'Mathematical Spine', value: 'Chentsov Uniqueness Theorem' },
      { label: 'Page Count', value: 'Complete Bound Manuscript' },
      { label: 'Open Access', value: 'Direct Download via Sovereign Vault' }
    ]
  },
  {
    id: 'babylon-60-kernel',
    catalogNumber: 'BM-12',
    title: 'BABYLON-60 & SOVEREIGN EXERGY',
    section: 'COMPLEX SYSTEMS',
    year: '2026',
    discipline: 'Ring-0 Architecture & Autonomic Systems',
    format: 'Formally Verified Kernel Architecture',
    imageUrl: '/media/works/10.webp',
    essayTitle: 'Decoupling Machine Intelligence from Bureaucratic Decay',
    essay: [
      'A blueprint for Ring-0 software resilience. Built around lock-free SPMC circular queues (KUDURRU-64), zero-copy unified memory buffers on Apple Silicon, and deterministic 7-tuple decision verifiers.',
      'Babylon rejects the cloud SaaS middleman. Computation occurs strictly on bare-metal hardware, anchored to Secure Enclave hardware cryptography and irreversible state receipts.'
    ],
    specs: [
      { label: 'Latency Horizon', value: 'Sub-Microsecond Zero-Copy IPC' },
      { label: 'Concurrency Model', value: 'Lock-Free Seqlock Atomic CAS' },
      { label: 'Hardware Root', value: 'Apple Silicon UMA & Touch ID Gate' },
      { label: 'Failure Strategy', value: 'Fail-Closed Deterministic DROP' }
    ]
  },
  {
    id: 'the-five-aphorisms',
    catalogNumber: 'BM-13',
    title: 'THE FIVE FOUNDATIONAL APHORISMS',
    section: 'COMPLEX SYSTEMS',
    year: '2026',
    discipline: 'Epistemic Invariants & Dialectics',
    format: 'C5-REAL Constitution // High Exergy',
    imageUrl: '/media/works/11.webp',
    essayTitle: 'The Detector of Cognitive and Structural Delusion',
    essay: [
      '1. Transform noise into concepts: Intelligence is compression constrained by Chentsov geometric uniqueness. Anything else is confabulation.',
      '2. Confuse map with territory: The false isomorphism fallacy. Treating mental models as physical reality ensures terminal collision with the substrate.',
      '3. The attempted solution is the problem: Feedback loops of miscalibrated regulators feed the very error they seek to remedy.',
      '4. Change arises when the pain of staying the same exceeds that of changing: Thermodynamic activation barriers govern systemic mutations.',
      '5. The voluntary is worth less than the involuntary: Signals controlled by will carry high manipulation entropy; involuntary biological signals reveal the genuine causal policy.'
    ],
    specs: [
      { label: 'Epistemic Standard', value: 'C5-REAL Constitutional Axioms' },
      { label: 'Falsification Gate', value: 'Strict Popperian Null-Hypothesis' },
      { label: 'Compression Yield', value: 'Maximum Kolmogorov Density' },
      { label: 'Classification', value: 'Universal Error Detectors' }
    ]
  },
  {
    id: 'autopoiesis-closure',
    catalogNumber: 'BM-14',
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
      { label: 'Boundary Geometry', value: 'Stochastic Markov Cloak' },
      { label: 'Substrate Affinity', value: 'Decoupled P2P Zero-Trust Nodes' },
      { label: 'Theoretical Climax', value: 'Fixed Point Omega Convergence' }
    ]
  }
];
