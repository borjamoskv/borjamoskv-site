// ═══════════════════════════════════════════════════════════════════════════
// SEARCH RESULTS RENDERER — Presentation Abstraction
// Converts raw search result arrays into formatted HTML.
// Zero state. Pure function layer.
// ═══════════════════════════════════════════════════════════════════════════

const TRACK_ARCHIVE_SIZE = 1918;

class SearchResultsRenderer {
    /**
     * Format search results into HTML.
     * @param {Array} results — array of track objects from WasmSearchEngine
     * @param {string} query — the original search query (for display)
     * @returns {string} — HTML string
     */
    static format(results, query) {
        if (!results || results.length === 0) {
            return `No he encontrado ningún track que coincida con "${query}" en el archivo de ${TRACK_ARCHIVE_SIZE} temas.`;
        }

        let html = `<div class="search-results-header">
            Encontrados <strong>${results.length}</strong> track${results.length > 1 ? 's' : ''} para "${query}":
        </div>
        <div class="search-results-list">`;

        results.forEach(track => {
            const valPct = Math.round(track.valence * 100);
            const enPct = Math.round(track.energy * 100);

            html += `
            <div class="search-track-item">
                <div class="track-main-info">
                    <span class="track-title">${track.title}</span>
                    <span class="track-artist">${track.artist}</span>
                </div>
                <div class="track-sub-info">
                    <span class="track-album">${track.album} (${track.year})</span>
                    <span class="track-duration">${track.duration}</span>
                </div>
                <div class="track-metrics">
                    <div class="metric-bar-wrap">
                        <span class="metric-label">V: ${valPct}%</span>
                        <div class="metric-bar-bg"><div class="metric-bar-fill valence" style="width: ${valPct}%"></div></div>
                    </div>
                    <div class="metric-bar-wrap">
                        <span class="metric-label">E: ${enPct}%</span>
                        <div class="metric-bar-bg"><div class="metric-bar-fill energy" style="width: ${enPct}%"></div></div>
                    </div>
                </div>
            </div>`;
        });

        html += `</div>`;
        return html;
    }
}

window.MOSKV = window.MOSKV || {};
window.MOSKV.SearchResultsRenderer = SearchResultsRenderer;
