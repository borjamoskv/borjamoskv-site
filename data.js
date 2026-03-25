// ═══════════════════════════════════════════════════════════════════════════
// DATA STORE: Centralized configuration and content arrays
// ═══════════════════════════════════════════════════════════════════════════

const HQ_BACKGROUND_VISUALS = [
    'b9ktVQN48OU', // LES BUKO [8K]
    'x8E9HInpzE4', // Glitch in the mirror [4K]
    'NYhOQTcNLkA', // Ecos del cosmos [4K]
    'Otvpn9vfXOE', // Me caigo y me levanto
    'hY0G0Zxf_uo', // 32 Y PICO [4K]
    'T_rU7WfOVTI', // Eclectic Electronic Visual Set Live [4K]
    'vxD2l4cIp7I', // Eclectic Electronic Cowpunk Set VJ [4K]
    'EP5s0yKZUKk', // Void Cascade [4K]
    'hsdOCzJpUMg', // Antes de las guerras
    'CFQ1smlFYjQ', // Lamento Bolivariano
    'Izt6bzo0PO8', // El Cuy del Altiplano
    'zzHETLKSeT4', // Metafashion
    '4Cb-Iu8DnJM', // BLAC [4K]
    'YvGpocK-Iqg', // Neural Transfer [4K]
    'NJqC3Xf6RzE', // Patadas
    'LDzdKd4WxvI', // 4 Drogas
    'eIrt6Uw-SEo', // Prisma del Xokas
    'PCjZruRuoNY', // Building Your Own Universe
    'AL46Orm0LS4', // Algorithms vs Human Attention
    'U2faQ81sRpg'  // The Ghost of the Torn Panties
];

const HERO_BACKGROUND = {
    id: 'b9ktVQN48OU',
    title: 'LES BUKO',
    label: 'EMBEDDED BACKGROUND REEL [4K/8K]',
    url: 'https://www.youtube.com/watch?v=b9ktVQN48OU',
    mood: 'electronic'
};

const DATA = {
    heroBackground: { ...HERO_BACKGROUND },

    // Videos para el fondo (loop automático)
    bgVideos: [...HQ_BACKGROUND_VISUALS],
    backgroundVisuals: [...HQ_BACKGROUND_VISUALS],

    // Bandcamp Sovereign Bridge (Ω_BANDCAMP)
    bandcampPlayers: [
        { id: "3994364503", title: "Instructions for Flying", slug: "borjamoskv" },
        { id: "3655180424", title: "Oscar Mulero - Tormenta", slug: "oscarmulero" }
    ],

    // Thumbnails HD de videos propios del artista
    videoThumbnails: [
        'NJqC3Xf6RzE', 'rakTVLzdc44', 'LDzdKd4WxvI', 'N66gquS-zLw', 'hsdOCzJpUMg',
        'eIrt6Uw-SEo', 'PCjZruRuoNY', 'AL46Orm0LS4', '-s5ZB4djvEw', 'uhw1ZQrp-9g',
        'lbQ1aKrnGNs', '_1XOjBK4wJc', 'bmD0YmLm45A', 'NYhOQTcNLkA', 'x8E9HInpzE4',
        'b9ktVQN48OU', 'gDquDpykJIc', 'I3jJXm8aG-A', '3iQFsgZrDZk', 'tMorCDfedf8',
        'GeHP3ADsans', 'AcouyGSki-8', '4RXo5uD-wF4', 'ya59utbBStM', 'D8hjJ17vZYc',
        'MH-YirWPNmI', 'YvGpocK-Iqg', 'EP5s0yKZUKk', 'T_rU7WfOVTI', 'vxD2l4cIp7I',
        'hY0G0Zxf_uo',
        '_zT6jP2OvXk', 'VqhnG94f5pE', 'rmzKC8AYkVw', 'zzHETLKSeT4',
        '4Cb-Iu8DnJM'
    ],

    // Filter categories
    categories: [
        { id: 'all', label: 'ALL' },
        { id: 'original', label: 'Originals' },
        { id: 'rework', label: 'Reworks' },
        { id: 'ambient', label: 'Ambient' },
        { id: 'idm', label: 'IDM' },
        { id: 'techno', label: 'Techno' },
        { id: 'electronic', label: 'Electronic' },
        { id: '4k', label: '4K Visuals' },
        { id: '8k', label: '8K Visuals' },
        { id: 'experimental', label: 'Experimental' },
        { id: 'parkour', label: 'Parkour' },
        { id: 'hard-bachata', label: 'Hard Bachata' },
        { id: 'salmorejo', label: 'Salmorejo' },
    ],

    // Works — enriched with categories for filtering
    works: [
        { id: "NYhOQTcNLkA", title: "ECOS DEL COSMOS", desc: "Original · Ambient / Sci-Fi [4K]", categories: ["original", "ambient", "4k"], featured: true },
        { id: "x8E9HInpzE4", title: "GLITCH IN THE MIRROR", desc: "Original · Experimental [4K]", categories: ["original", "experimental", "4k"], featured: true },
        { id: "b9ktVQN48OU", title: "LES BUKO", desc: "Original · Electronic [8K]", categories: ["original", "electronic", "4k", "8k"], featured: true },
        { id: "hY0G0Zxf_uo", title: "32 Y PICO", desc: "Visual Compilation · Electronic", categories: ["original", "electronic", "4k"], featured: true },
        { id: "NJqC3Xf6RzE", title: "PATADAS", desc: "Original · Electronic", categories: ["original", "electronic", "experimental"] },
        { id: "rakTVLzdc44", title: "1", desc: "Original · Experimental", categories: ["original", "experimental"] },
        { id: "LDzdKd4WxvI", title: "4 DROGAS", desc: "Original · Techno", categories: ["original", "techno"] },
        { id: "N66gquS-zLw", title: "COHERENCIA RARA 42", desc: "Original · Experimental", categories: ["original", "experimental"] },
        { id: "hsdOCzJpUMg", title: "ANTES DE LAS GUERRAS", desc: "Original · Ambient", categories: ["original", "ambient", "electronic"] },
        { id: "eIrt6Uw-SEo", title: "EN EL PRISMA DEL XOKAS", desc: "Original · Experimental", categories: ["original", "experimental"] },
        { id: "PCjZruRuoNY", title: "BUILDING YOUR OWN UNIVERSE", desc: "Short · Substack", categories: ["original", "experimental"] },
        { id: "AL46Orm0LS4", title: "ALGORITHMS VS HUMAN ATTENTION", desc: "Short · Substack", categories: ["original", "experimental"] },
        { id: "-s5ZB4djvEw", title: "CON LA PUNTA DEL CIPOTE", desc: "Short · Substack", categories: ["original", "experimental"] },
        { id: "uhw1ZQrp-9g", title: "EL ARTE NO TE DEBE NADA", desc: "Short · Substack", categories: ["original", "experimental"] },
        { id: "lbQ1aKrnGNs", title: "RADIOHEAD — IN RAINBOWS", desc: "Rework · IDM / Ambient", categories: ["rework", "idm", "ambient"] },
        { id: "gDquDpykJIc", title: "O SUPERMAN (LAURIE ANDERSON)", desc: "Rework · Electronic", categories: ["rework", "electronic"] },
        { id: "I3jJXm8aG-A", title: "THE MEXICAN", desc: "Rework · Bakala", categories: ["rework", "techno"] },
        { id: "bmD0YmLm45A", title: "RADIOHEAD — NO SURPRISES", desc: "Rework · Ambient Techno", categories: ["rework", "ambient", "techno"] },
        { id: "_1XOjBK4wJc", title: "TAME IMPALA — LET IT HAPPEN", desc: "Rework · Psychedelic", categories: ["rework", "experimental"] },
        { id: "3iQFsgZrDZk", title: "IDLES — THE BEACHLAND BALLROOM", desc: "Rework · Warehouse Techno", categories: ["rework", "techno"] },
        { id: "tMorCDfedf8", title: "JAR TO THE SYSTEM", desc: "Original · Electronic", categories: ["original", "electronic"] },
        { id: "GeHP3ADsans", title: "ASÍ FUE", desc: "Rework · Electro Deep House", categories: ["rework", "electronic"] },
        { id: "AcouyGSki-8", title: "SWANS — SCREEN SHOT", desc: "Rework · Experimental", categories: ["rework", "experimental"] },
        { id: "4RXo5uD-wF4", title: "GRIZZLY BEAR — DEEP SEA DIVER", desc: "Remix · Electronic", categories: ["rework", "electronic"] },
        { id: "ya59utbBStM", title: "JOHN FRUSCIANTE — MURDERERS", desc: "Rework · IDM", categories: ["rework", "idm"] },
        { id: "D8hjJ17vZYc", title: "ROBERT COSMIC — VIAJEROS", desc: "Rework · Electronic", categories: ["rework", "electronic"] },
        { id: "MH-YirWPNmI", title: "RADIOHEAD — 15 STEP", desc: "Rework · IDM", categories: ["rework", "idm"] },
        { id: "Yr5CMXrJgIo", title: "LINDSTRØM & PRINS THOMAS — NAA ER DRUENE", desc: "Rework · Electronic", categories: ["rework", "electronic"] },
        { id: "u99SbUVjV6M", title: "ROBOCOP", desc: "Rework · Electronic", categories: ["rework", "electronic"] },
        { id: "nz9h7q5FA-0", title: "CRUJIDOS", desc: "Rework · Experimental", categories: ["rework", "experimental"] },
        { id: "rmzKC8AYkVw", title: "32 ELECTRONIC MUSIC VISUAL TRACKS", desc: "Visual Compilation", categories: ["original", "electronic", "4k"] },
        { id: "zzHETLKSeT4", title: "METAFASHION", desc: "Original · Experimental", categories: ["original", "experimental"] },
        { id: "4Cb-Iu8DnJM", title: "BLAC", desc: "Original · Electronic", categories: ["original", "electronic"] },
        { id: "Icz_FGJAQ78", title: "CICLISTAS", desc: "Original · Visual", categories: ["original", "experimental"] },
        { id: "Izt6bzo0PO8", title: "EL CUY DEL ALTIPLANO", desc: "Original · Ambient", categories: ["original", "ambient"] },
        { id: "KuBNnC4mYuU", title: "JUGAR LA BRISCA CON AMAVISCA", desc: "Original · Hard Bachata", categories: ["original", "electronic", "hard-bachata"] },
        { id: "TOuixj79kDU", title: "TAA LUU VAA NAA SHEE DOOO", desc: "Original · Experimental", categories: ["original", "experimental"] },
        { id: "c4Wz6M2_y1s", title: "EL TUPAS", desc: "Original · Salmorejo", categories: ["original", "electronic", "salmorejo"] },
        { id: "CFQ1smlFYjQ", title: "LAMENTO BOLIVARIANO", desc: "Original · Ambient", categories: ["original", "ambient"] },
        { id: "Otvpn9vfXOE", title: "ME CAIGO Y ME LEVANTO", desc: "Original · Parkour [4K]", categories: ["original", "electronic", "parkour", "4k"] },
        { id: "hCkD67O9H2o", title: "INCREÍBLE", desc: "Original · Electronic", categories: ["original", "electronic"] },
        { id: "Z_S9hMVOizo", title: "COCODRILO COJONES", desc: "Original · Hard Bachata Frontflip", categories: ["original", "electronic", "hard-bachata", "parkour"] },
        { id: "YvGpocK-Iqg", title: "NEURAL TRANSFER", desc: "Original · Electronic", categories: ["original", "electronic"] },
        { id: "EP5s0yKZUKk", title: "VOID CASCADE", desc: "Original · Ambient", categories: ["original", "ambient"] },
        { id: "iI9-8BibHaM", title: "LA HUMILDAD ABRE MÁS PUERTAS QUE EL TALENTO", desc: "Original · Electronic", categories: ["original", "electronic"] },
        { id: "U2faQ81sRpg", title: "THE GHOST OF THE TORN PANTIES", desc: "Original · Experimental", categories: ["original", "experimental"] },
        { id: "8Encp3vIb9M", title: "PIENSO LUEGO IMPROVISO", desc: "Original · Electronic", categories: ["original", "electronic"] },
        { id: "v1MvE0jG_G0", title: "LITTLE MEGA MIX", desc: "Mix · Electronic", categories: ["original", "electronic"] },
        { id: "cFOFcUPUUNs", title: "FROSTIE AIR", desc: "Original · Ambient", categories: ["original", "ambient"] },
        { id: "_l1J37XK8vM", title: "PERCULAES", desc: "Original · Electronic", categories: ["original", "electronic"] },
        { id: "8UMhx5cDYjo", title: "THE SUPERSTARS", desc: "Original · Electronic", categories: ["original", "electronic"] },
        { id: "ZtOVq-nMgqo", title: "2 MANY FORRESTS", desc: "Original · Electronic", categories: ["original", "electronic"] },
        { id: "Zc8QEQ8y1f8", title: "RETRATOS NAROA GUTIÉRREZ GIL", desc: "Visual · Photography", categories: ["original", "4k"] },
        { id: "UrX4mqXmapE", title: "EL CHOMBO — CHACARRON", desc: "MICA Inject · Electronic", categories: ["original", "electronic"] },
    ],
};

globalThis.HQ_BACKGROUND_VISUALS = HQ_BACKGROUND_VISUALS;
globalThis.HERO_BACKGROUND = HERO_BACKGROUND;
globalThis.DATA = DATA;
