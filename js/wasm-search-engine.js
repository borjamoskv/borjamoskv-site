// ═══════════════════════════════════════════════════════════════════════════
// WASM SEARCH ENGINE — Abstraction Layer
// Encapsulates WebAssembly loading, memory management, and search execution.
// Zero DOM dependencies. Pure data in → data out.
// ═══════════════════════════════════════════════════════════════════════════

const INPUT_BUFFER_LIMIT = 1000; // bytes

class WasmSearchEngine {
    constructor(wasmPath = './search.wasm') {
        this.wasmPath = wasmPath;
        this.instance = null;
        this._loading = null;
    }

    /**
     * Lazy-load the WASM module. Returns the instance (or null on failure).
     * Idempotent — subsequent calls return the cached instance.
     */
    async load() {
        if (this.instance) return this.instance;
        if (this._loading) return this._loading;

        this._loading = this._init();
        return this._loading;
    }

    async _init() {
        try {
            const response = await fetch(this.wasmPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const wasmBytes = await response.arrayBuffer();
            const { instance } = await WebAssembly.instantiate(wasmBytes);
            this.instance = instance;
            return this.instance;
        } catch (e) {
            console.error('[WasmSearchEngine] Load failed:', e);
            this.instance = null;
            this._loading = null;
            return null;
        }
    }

    /**
     * @returns {boolean} Whether the engine is loaded and ready.
     */
    get ready() {
        return this.instance !== null;
    }

    /**
     * Execute a search query against the WASM index.
     * @param {string} query — raw user query
     * @returns {Array} — parsed results array (empty on failure)
     */
    search(query) {
        if (!this.instance) return [];
        try {
            const encoder = new TextEncoder();
            const queryBytes = encoder.encode(query);

            // Guard: prevent buffer overflow (WASM input buffer is 1KB)
            if (queryBytes.length > INPUT_BUFFER_LIMIT) return [];

            const inputPtr = this.instance.exports.get_input_ptr();
            const memory = this.instance.exports.memory;

            // Write query bytes to INPUT_BUFFER
            const wasmMemBuffer = new Uint8Array(memory.buffer);
            wasmMemBuffer.set(queryBytes, inputPtr);

            // Execute search
            this.instance.exports.search(inputPtr, queryBytes.length);

            // Read results
            const resultPtr = this.instance.exports.get_result_ptr();
            const resultLen = this.instance.exports.get_result_len();

            const resultBytes = new Uint8Array(memory.buffer, resultPtr, resultLen);
            const decoder = new TextDecoder();
            const jsonStr = decoder.decode(resultBytes);

            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('[WasmSearchEngine] Search execution failed:', e);
            return [];
        }
    }
}

// Export as singleton on the MOSKV namespace
window.MOSKV = window.MOSKV || {};
window.MOSKV.WasmSearchEngine = WasmSearchEngine;
