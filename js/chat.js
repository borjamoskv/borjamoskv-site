// ═══════════════════════════════════════════════════════════════════════════
// CHAT CONTROLLER: Ritxie Hawting Interactive Assistant
// WASM Search Engine Integrated (1,918 Tracks)
// ═══════════════════════════════════════════════════════════════════════════

window.MOSKV = window.MOSKV || {};

let wasmInstance = null;

async function loadWasm() {
    if (wasmInstance) return wasmInstance;
    try {
        const response = await fetch('./search.wasm');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const wasmBytes = await response.arrayBuffer();
        const { instance } = await WebAssembly.instantiate(wasmBytes);
        wasmInstance = instance;
        return wasmInstance;
    } catch (e) {
        console.error("Error loading WebAssembly search engine:", e);
        return null;
    }
}

function performWasmSearch(query) {
    if (!wasmInstance) return [];
    try {
        const encoder = new TextEncoder();
        const queryBytes = encoder.encode(query);
        
        // Exclude too long queries to prevent buffer overflow (buffer is 1KB)
        if (queryBytes.length > 1000) return [];
        
        const inputPtr = wasmInstance.exports.get_input_ptr();
        const memory = wasmInstance.exports.memory;
        
        // Write query to INPUT_BUFFER
        const wasmMemBuffer = new Uint8Array(memory.buffer);
        wasmMemBuffer.set(queryBytes, inputPtr);
        
        // Run search
        wasmInstance.exports.search(inputPtr, queryBytes.length);
        
        // Read results
        const resultPtr = wasmInstance.exports.get_result_ptr();
        const resultLen = wasmInstance.exports.get_result_len();
        
        const resultBytes = new Uint8Array(memory.buffer, resultPtr, resultLen);
        const decoder = new TextDecoder();
        const jsonStr = decoder.decode(resultBytes);
        
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("WASM search execution failed:", e);
        return [];
    }
}

window.MOSKV.chat = {
    init() {
        const toggleBtn = document.getElementById('chatquitoOpen');
        const widget = document.getElementById('chatquito');
        const closeBtn = document.getElementById('chatquitoClose');
        const input = document.getElementById('chatquitoInput');
        const body = document.getElementById('chatquitoBody');

        if (!widget) return;

        // Load WASM in background
        loadWasm().then(() => {
            console.log("RITXIE WASM search engine ready.");
        });

        // Toggle widget visibility
        const toggleWidget = (show) => {
            if (show) {
                widget.classList.add('visible');
                toggleBtn?.classList.add('hidden');
                input?.focus();
            } else {
                widget.classList.remove('visible');
                toggleBtn?.classList.remove('hidden');
            }
        };

        toggleBtn?.addEventListener('click', () => toggleWidget(true));
        closeBtn?.addEventListener('click', () => toggleWidget(false));

        // Handle message submission
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                const text = input.value.trim();
                input.value = '';
                
                // Add user message
                this.appendMessage(text, 'user');
                
                // Generate and append bot response
                setTimeout(() => {
                    const reply = this.getBotReply(text);
                    this.appendMessage(reply, 'bot');
                }, 1000);
            }
        });
    },

    appendMessage(text, sender) {
        const body = document.getElementById('chatquitoBody');
        if (!body) return;

        const msg = document.createElement('div');
        msg.className = `chat-msg ${sender}`;
        
        // Bot messages can contain formatted HTML results, user messages are textContent
        if (sender === 'bot') {
            msg.innerHTML = text;
        } else {
            msg.textContent = text;
        }
        
        body.appendChild(msg);
        body.scrollTop = body.scrollHeight;
    },

    executeSearchAndFormat(query) {
        if (!wasmInstance) {
            return "El motor WASM de búsqueda no se ha inicializado o falló al cargar.";
        }
        if (!query) {
            return "Por favor, introduce un término de búsqueda válido.";
        }
        const results = performWasmSearch(query);
        return this.formatSearchResults(results, query);
    },

    formatSearchResults(results, query) {
        if (!results || results.length === 0) {
            return `No he encontrado ningún track que coincida con "${query}" en el archivo de 1,918 temas.`;
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
    },

    getBotReply(text) {
        const lower = text.toLowerCase();
        
        // Check for explicit search command
        const searchPrefixes = ['buscar ', 'search ', 'find ', 'track ', '/search '];
        let query = null;
        for (const prefix of searchPrefixes) {
            if (lower.startsWith(prefix)) {
                query = text.substring(prefix.length).trim();
                break;
            }
        }
        
        // If explicit search query is specified
        if (query !== null) {
            return this.executeSearchAndFormat(query);
        }

        if (lower.includes('hola') || lower.includes('saludo')) {
            return "Saludos, operador. Soy RITXIE HAWTING. ¿Buscas exergía musical o análisis de agentes?";
        }
        if (lower.includes('musica') || lower.includes('set') || lower.includes('track') || lower.includes('dj')) {
            return "Mi archivo cuenta con 1,918 tracks (2008-2025). Explora la sección de música o sintoniza el AutoDJ en el background.";
        }
        if (lower.includes('humo') || lower.includes('benchmark') || lower.includes('influencer')) {
            return "Hemos mapeado 10,000 influencers de IA. La disipación térmica es real. Consulta el Benchmark de Humo en el menú.";
        }
        if (lower.includes('cortex') || lower.includes('ley') || lower.includes('singularidad')) {
            return "CORTEX opera bajo la Ley Bizantina. Los sistemas estocásticos solo son fiables tras una frontera determinista.";
        }
        if (lower.includes('creador') || lower.includes('borja') || lower.includes('moskv')) {
            return "Borja Moskv es arquitecto, artista y trader. Su ecosistema unifica ruido y señal.";
        }

        // Implicit search (if user writes query without prefix and no rule matches)
        if (text.trim().length >= 3) {
            const results = performWasmSearch(text.trim());
            if (results && results.length > 0) {
                return this.formatSearchResults(results, text.trim());
            }
        }

        const fallbackReplies = [
            "Señal procesada. La entropía del canal se mantiene estable.",
            "Análisis causal en curso. Recomiendo verificar con Ledger C5-REAL.",
            "Interesante conjetura. Pero carece de exergía demostrable.",
            "Sintoniza el AutoDJ en local para purificar el ruido estocástico."
        ];
        
        // Return a deterministic pseudo-random fallback based on string hash
        let hash = 0;
        for (let i = 0; i < lower.length; i++) {
            hash = lower.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % fallbackReplies.length;
        return fallbackReplies[index];
    }
};

// Auto-initialize when file is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.MOSKV.chat.init());
} else {
    window.MOSKV.chat.init();
}

