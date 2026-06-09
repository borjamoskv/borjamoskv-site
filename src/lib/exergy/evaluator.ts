// src/lib/exergy/evaluator.ts
// C5-REAL Exergy Evaluator Ported from mass_exergy_scanner.py

export interface SubstackPost {
  title: string;
  subtitle: string;
  description: string;
  link?: string;
  pubDate?: string;
}

export interface ExergyMetrics {
  clickbait: number; // 0 - 100
  tech: number;       // 0 - 100
  commercial: number; // 0 - 100
  c5_real: number;    // 0 - 100
}

export interface ExergyAuditRecord {
  timestamp: string;      // ISO-8601
  title: string;
  subtitle: string;
  description: string;
  language: "es" | "en";
  metrics: ExergyMetrics;
  smoke_index: number;
  exergy_score: number;
  prev_hash: string;
  hash?: string;          // Added during persistence
}

// Spanish Patterns
const ES_CLICKBAIT = [
  /\bsuperar\b/g, /\bsecreto\b/g, /\bla verdad\b/g, /\bhype\b/g, /\bgratis\b/g,
  /\bdefinitiva\b/g, /\blife hack\b/g, /🍌/g, /100\s*%/g, /\bmorir\b/g,
  /\bgratuita\b/g, /\bmentira\b/g, /\brico\b/g, /\binjusta\b/g, /nadie te cuenta/g,
  /\bobsesión\b/g, /\brevelación\b/g, /\bdefinitivo\b/g, /\bmultiplica\b/g,
  /\bganar dinero\b/g, /\bhazte rico\b/g, /\bel plan\b/g
];

const ES_TECH = [
  /\bpython\b/g, /\bapi\b/g, /\bgit\b/g, /\bmmap\b/g, /\bjson\b/g, /\brust\b/g,
  /\barxiv\b/g, /\bbenchmark\b/g, /\bcomplexity\b/g, /\brag\b/g, /\bvector\b/g,
  /\bdatabase\b/g, /\btoken\b/g, /\bast\b/g, /\bprompt\b/g, /context engineering/g,
  /\bworkflow\b/g, /\bagente\b/g, /\bllm\b/g, /\bmodel\b/g, /\bcode\b/g, /\bcompile\b/g
];

const ES_SPONSOR = [
  /\bpatrocinado\b/g, /\bsponsor\b/g, /\bholded\b/g, /gratis aquí/g, /\bafiliado\b/g,
  /14 días gratis/g, /pruébalo gratis/g, /\bdescuento\b/g, /\bprecio\b/g,
  /\bcompra\b/g, /\bsuscripción de pago\b/g
];

const ES_C5_REAL = [
  /\bc5-real\b/g, /\bc5 real\b/g, /\bledger\b/g, /\bfalsación\b/g, /\bfalsacion\b/g,
  /\binmutable\b/g, /\binmutabilidad\b/g, /\bantigravity\b/g, /\bcortex\b/g,
  /\bautopoiesis\b/g, /\bmaxwell\b/g, /\bcausal\b/g, /\bdeterminista\b/g,
  /\bproof of work\b/g, /\bdemonio de maxwell\b/g
];

// English Patterns
const EN_CLICKBAIT = [
  /\bovercome\b/g, /\bsecret\b/g, /\bthe truth\b/g, /\bhype\b/g, /\bfree\b/g,
  /\bultimate\b/g, /\blife hack\b/g, /🍌/g, /100\s*%/g, /\bdie\b/g, /\blie\b/g,
  /\brich\b/g, /\bunfair\b/g, /nobody tells you/g, /no one tells you/g,
  /\bobsesión\b/g, /\brevelation\b/g, /\bmultiply\b/g, /make money/g,
  /get rich/g, /\bthe plan\b/g
];

const EN_TECH = [
  /\bpython\b/g, /\bapi\b/g, /\bgit\b/g, /\bmmap\b/g, /\bjson\b/g, /\brust\b/g,
  /\barxiv\b/g, /\bbenchmark\b/g, /\bcomplexity\b/g, /\brag\b/g, /\bvector\b/g,
  /\bdatabase\b/g, /\btoken\b/g, /\bast\b/g, /\bprompt\b/g, /context engineering/g,
  /\bworkflow\b/g, /\bagent\b/g, /\bllm\b/g, /\bmodel\b/g, /\bcode\b/g, /\bcompile\b/g
];

const EN_SPONSOR = [
  /\bsponsored\b/g, /\bsponsor\b/g, /\bholded\b/g, /free here/g, /\baffiliate\b/g,
  /14 days free/g, /try it free/g, /\bdiscount\b/g, /\bprice\b/g, /\bbuy\b/g,
  /\bpurchase\b/g, /paid subscription/g
];

const EN_C5_REAL = [
  /\bc5-real\b/g, /\bc5 real\b/g, /\bledger\b/g, /\bproof of work\b/g, /\bmaxwell\b/g,
  /\bimmutable\b/g, /\bimmutability\b/g, /\bantigravity\b/g, /\bcortex\b/g,
  /\bautopoiesis\b/g, /\bthermodynamics\b/g, /\bcausal\b/g, /\bdeterministic\b/g
];

export function detectLang(title: string, subtitle?: string, description?: string): "es" | "en" {
  const textLower = `${title} ${subtitle || ""} ${description || ""}`.toLowerCase();
  
  const esWords = new Set(["de", "la", "en", "el", "que", "los", "un", "una", "con", "para", "por", "del", "y", "como", "mas", "o"]);
  const enWords = new Set(["the", "of", "and", "to", "in", "is", "that", "it", "with", "for", "on", "this", "be", "are", "you", "or"]);

  const words = textLower.match(/\b\w+\b/g) || [];
  
  let esCount = 0;
  let enCount = 0;

  for (const w of words) {
    if (esWords.has(w)) esCount++;
    if (enWords.has(w)) enCount++;
  }

  if (esCount > enCount) return "es";
  if (enCount > esCount) return "en";
  return "es"; // Default fallback
}

export function auditPostMetrics(
  title: string,
  subtitle: string,
  description: string,
  lang: "es" | "en"
): {
  metrics: ExergyMetrics;
  smoke_index: number;
  exergy_score: number;
  classification: string;
} {
  const text = `${title} ${subtitle || ""} ${description || ""}`.toLowerCase();
  const wordsList = text.trim().split(/\s+/).filter(Boolean);
  const words = wordsList.length === 0 ? 1 : wordsList.length;

  const cbPats = lang === "en" ? EN_CLICKBAIT : ES_CLICKBAIT;
  const techPats = lang === "en" ? EN_TECH : ES_TECH;
  const commPats = lang === "en" ? EN_SPONSOR : ES_SPONSOR;
  const c5Pats = lang === "en" ? EN_C5_REAL : ES_C5_REAL;

  const countMatches = (regexes: RegExp[]): number => {
    let sum = 0;
    for (const rx of regexes) {
      rx.lastIndex = 0;
      const matches = text.match(rx);
      if (matches) {
        sum += matches.length;
      }
    }
    return sum;
  };

  const cbCount = countMatches(cbPats);
  const techCount = countMatches(techPats);
  const commCount = countMatches(commPats);
  const c5Count = countMatches(c5Pats);

  // Compute title clickbait flags
  let titleCb = 0;
  const titleLower = title.toLowerCase();
  for (const rx of cbPats) {
    rx.lastIndex = 0;
    if (rx.test(titleLower)) {
      titleCb++;
    }
  }

  // Densities (per 1000 words)
  const cbDensity = (cbCount / words) * 1000;
  const techDensity = (techCount / words) * 1000;
  const commDensity = (commCount / words) * 1000;
  const c5Density = (c5Count / words) * 1000;

  // Raw scores capped at 100
  const cbScore = Math.min(100.0, cbDensity * 18.0 + (titleCb * 15.0));
  const techScore = Math.min(100.0, techDensity * 8.0);
  const commScore = Math.min(100.0, commDensity * 22.0);
  const c5Score = Math.min(100.0, c5Density * 15.0);

  // Smoke Index & Exergy
  const smokeIndex = Math.max(0.0, Math.min(100.0, cbScore * 0.45 + commScore * 0.45 - techScore * 0.10));
  const exergyScore = Math.max(0.0, Math.min(100.0, 100.0 - smokeIndex));

  // Classification Mapping
  let classification = "Hype-driven / Divulgativo";
  if (commScore >= 40) {
    classification = "Comercial / Transaccional";
  } else if (techScore >= 30) {
    classification = "Técnico / Práctico";
  }
  if (c5Score >= 25) {
    classification = "C5-REAL / Arquitectura";
  }

  return {
    metrics: {
      clickbait: Number(cbScore.toFixed(1)),
      tech: Number(techScore.toFixed(1)),
      commercial: Number(commScore.toFixed(1)),
      c5_real: Number(c5Score.toFixed(1))
    },
    smoke_index: Number(smokeIndex.toFixed(1)),
    exergy_score: Number(exergyScore.toFixed(1)),
    classification
  };
}
