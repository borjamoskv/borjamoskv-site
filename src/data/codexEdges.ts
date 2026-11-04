/**
 * Lightweight Topological Edge Index (< 0.5 KB gzipped) for initial first-paint bundle.
 * Full essay corpus (codexGraph.ts) and reader UI load on-demand via ESNext chunk split.
 */

export interface CodexEdgeSummary {
  slug: string;
  code: string;
  title: string;
  readingTime: string;
  linkedWorkIds: string[];
}

export const CODEX_EDGE_INDEX: CodexEdgeSummary[] = [
  {
    slug: 'rubin-radiohead-coupling',
    code: 'CX-01',
    title: 'POR QUÉ RICK RUBIN NUNCA TRABAJÓ CON RADIOHEAD',
    readingTime: '6 MIN',
    linkedWorkIds: ['this-was-in-rainbows', 'instructions-for-flying', 'blac-cinema'],
  },
  {
    slug: 'lo-sutil-fisher-metrology',
    code: 'CX-02',
    title: 'LO SUTIL: FÍSICA DEL RESIDUO Y COTA DE CRAMÉR-RAO',
    readingTime: '7 MIN + PDF',
    linkedWorkIds: ['lo-inmanente', 'science-of-friction-book', 'retratos-naroa'],
  },
  {
    slug: 'borjario-wetware-2e',
    code: 'CX-03',
    title: 'EL BORJARIO: WETWARE, TDAH/2E Y DESESCALADA SOMÁTICA',
    readingTime: '3 MIN + SIM',
    linkedWorkIds: ['comic-elige-trastorno', 'portada-cocodrilo', 'miarma'],
  },
  {
    slug: 'borjario-silicon-acreativo',
    code: 'CX-04',
    title: 'EL BORJARIO DE SILICIO: MÉTODO ACREATIVO Y FORMA PRIMORDIAL',
    readingTime: '3 MIN',
    linkedWorkIds: ['babylon-60-kernel', 'cactuses', 'blac-cinema'],
  },
  {
    slug: 'aforismos-152-punto-fijo-omega',
    code: 'CX-05',
    title: 'AFORISMOS SIN NATA: 152 INVARIANTES HACIA EL PUNTO FIJO Ω',
    readingTime: '4 MIN + PDF',
    linkedWorkIds: ['the-five-aphorisms', 'autopoiesis-closure', 'science-of-friction-book'],
  },
  {
    slug: 'pre-conflict-acoustics-broken-compas',
    code: 'CX-06',
    title: 'ACÚSTICA PRE-CONFLICTO: SUB-GRAVE AERODINÁMICO Y COMPÁS ROTO',
    readingTime: '5 MIN',
    linkedWorkIds: ['instructions-for-flying', 'farandula', 'album-b', 'heimatflug'],
  },
];

export const CODEX_TOTAL_COUNT = CODEX_EDGE_INDEX.length;

export function getLinkedCodexEdgesForWork(workId: string): CodexEdgeSummary[] {
  return CODEX_EDGE_INDEX.filter((e) => e.linkedWorkIds.includes(workId));
}
