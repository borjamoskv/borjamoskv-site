// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE ROUTER — Intent Classification & Reply Generation
// Classifies user input and routes to the appropriate handler.
// Depends on: WasmSearchEngine, SearchResultsRenderer
// ═══════════════════════════════════════════════════════════════════════════

const SEARCH_PREFIXES = ['buscar ', 'search ', 'find ', 'track ', '/search '];

const INTENT_RULES = [
    {
        match: (lower) => lower.includes('hola') || lower.includes('saludo'),
        reply: () => 'Saludos, operador. Soy RITXIE HAWTING. ¿Buscas exergía musical o análisis de agentes?'
    },
    {
        match: (lower) => lower.includes('musica') || lower.includes('set') || lower.includes('track') || lower.includes('dj'),
        reply: () => 'Mi archivo cuenta con 1,918 tracks (2008-2025). Explora la sección de música o sintoniza el AutoDJ en el background.'
    },
    {
        match: (lower) => lower.includes('humo') || lower.includes('benchmark') || lower.includes('influencer'),
        reply: () => 'Hemos mapeado 10,000 influencers de IA. La disipación térmica es real. Consulta el Benchmark de Humo en el menú.'
    },
    {
        match: (lower) => lower.includes('cortex') || lower.includes('ley') || lower.includes('singularidad'),
        reply: () => 'CORTEX opera bajo la Ley Bizantina. Los sistemas estocásticos solo son fiables tras una frontera determinista.'
    },
    {
        match: (lower) => lower.includes('creador') || lower.includes('borja') || lower.includes('moskv'),
        reply: () => 'Borja Moskv es arquitecto, artista y trader. Su ecosistema unifica ruido y señal.'
    }
];

const FALLBACK_REPLIES = [
    'Señal procesada. La entropía del canal se mantiene estable.',
    'Análisis causal en curso. Recomiendo verificar con Ledger C5-REAL.',
    'Interesante conjetura. Pero carece de exergía demostrable.',
    'Sintoniza el AutoDJ en local para purificar el ruido estocástico.'
];

class ResponseRouter {
    /**
     * @param {WasmSearchEngine} searchEngine
     */
    constructor(searchEngine) {
        this.engine = searchEngine;
    }

    /**
     * Route user input to a response.
     * @param {string} text — raw user input
     * @returns {string} — HTML response string
     */
    route(text) {
        const lower = text.toLowerCase();

        // 1. Explicit search command
        const explicitQuery = this._extractSearchQuery(text, lower);
        if (explicitQuery !== null) {
            return this._executeSearch(explicitQuery);
        }

        // 2. Intent rule matching
        for (const rule of INTENT_RULES) {
            if (rule.match(lower)) {
                return rule.reply();
            }
        }

        // 3. Implicit search (>= 3 chars, no rule matched)
        if (text.trim().length >= 3) {
            const results = this.engine.search(text.trim());
            if (results && results.length > 0) {
                return window.MOSKV.SearchResultsRenderer.format(results, text.trim());
            }
        }

        // 4. Deterministic fallback
        return this._fallback(lower);
    }

    _extractSearchQuery(text, lower) {
        for (const prefix of SEARCH_PREFIXES) {
            if (lower.startsWith(prefix)) {
                return text.substring(prefix.length).trim();
            }
        }
        return null;
    }

    _executeSearch(query) {
        if (!this.engine.ready) {
            return 'El motor WASM de búsqueda no se ha inicializado o falló al cargar.';
        }
        if (!query) {
            return 'Por favor, introduce un término de búsqueda válido.';
        }
        const results = this.engine.search(query);
        return window.MOSKV.SearchResultsRenderer.format(results, query);
    }

    _fallback(lower) {
        let hash = 0;
        for (let i = 0; i < lower.length; i++) {
            hash = lower.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % FALLBACK_REPLIES.length;
        return FALLBACK_REPLIES[index];
    }
}

window.MOSKV = window.MOSKV || {};
window.MOSKV.ResponseRouter = ResponseRouter;
