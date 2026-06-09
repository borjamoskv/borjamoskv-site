// ═══════════════════════════════════════════════════════════════════════════
// CHAT CONTROLLER: Ritxie Hawting Interactive Assistant
// Thin orchestrator — composes WasmSearchEngine, ResponseRouter, DOM layer.
//
// Dependencies (load before this file):
//   js/wasm-search-engine.js    → MOSKV.WasmSearchEngine
//   js/search-results-renderer.js → MOSKV.SearchResultsRenderer
//   js/response-router.js       → MOSKV.ResponseRouter
// ═══════════════════════════════════════════════════════════════════════════

window.MOSKV = window.MOSKV || {};

window.MOSKV.chat = {
    /** @type {WasmSearchEngine} */
    _engine: null,
    /** @type {ResponseRouter} */
    _router: null,
    /** @type {VoiceEffectsPipeline} */
    _voicePipeline: null,
    /** @type {boolean} */
    _voiceEnabled: false,

    init() {
        const toggleBtn = document.getElementById('chatquitoOpen');
        const widget = document.getElementById('chatquito');
        const closeBtn = document.getElementById('chatquitoClose');
        const input = document.getElementById('chatquitoInput');
        const body = document.getElementById('chatquitoBody');
        const voiceToggle = document.getElementById('chatquitoVoiceToggle');

        if (!widget) return;

        // Bootstrap abstraction layers
        this._engine = new window.MOSKV.WasmSearchEngine('/search.wasm');
        this._router = new window.MOSKV.ResponseRouter(this._engine);
        this._voicePipeline = new window.MOSKV.VoiceEffectsPipeline();

        // Load WASM in background
        this._engine.load().then(() => {
            console.log('RITXIE WASM search engine ready.');
        });

        // Initialize voice toggle state (default to muted for autoplay policy compliance)
        if (voiceToggle) {
            this._voiceEnabled = false;
            voiceToggle.textContent = '🔇';
            voiceToggle.classList.add('muted');

            voiceToggle.addEventListener('click', () => {
                this._voiceEnabled = !this._voiceEnabled;
                if (this._voiceEnabled) {
                    voiceToggle.textContent = '🔊';
                    voiceToggle.classList.remove('muted');
                    // Play initial response to initialize/resume AudioContext
                    this._voicePipeline.speak('on');
                } else {
                    voiceToggle.textContent = '🔇';
                    voiceToggle.classList.add('muted');
                    this._voicePipeline.stopSynthesis();
                }
            });
        }

        // Toggle widget visibility
        const toggleWidget = (show) => {
            if (show) {
                widget.classList.add('visible');
                toggleBtn?.classList.add('hidden');
                input?.focus();
            } else {
                widget.classList.remove('visible');
                toggleBtn?.classList.remove('hidden');
                // Stop synthesis if closed
                this._voicePipeline.stopSynthesis();
            }
        };

        toggleBtn?.addEventListener('click', () => toggleWidget(true));
        closeBtn?.addEventListener('click', () => toggleWidget(false));

        // Handle message submission
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                const text = input.value.trim();
                input.value = '';

                // Cut off any active synthesis on new user message submission
                this._voicePipeline.stopSynthesis();

                // Add user message
                this.appendMessage(text, 'user');

                // Route and append bot response
                setTimeout(() => {
                    const reply = this._router.route(text);
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
            
            // Speak response if voice is active
            if (this._voiceEnabled) {
                this.speakResponse(text);
            }
        } else {
            msg.textContent = text;
        }

        body.appendChild(msg);
        body.scrollTop = body.scrollHeight;
    },

    _stripHTML(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        // Also strip standard buttons, links or extra UI elements that we don't want spoken
        const buttons = tmp.querySelectorAll('button, a.btn');
        buttons.forEach(btn => btn.remove());
        return tmp.textContent || tmp.innerText || '';
    },

    speakResponse(text) {
        if (!this._voicePipeline) return;

        const cleanText = this._stripHTML(text);
        if (!cleanText.trim()) return;

        // Position speaker on the right channel (chat window location representation)
        this._voicePipeline.setPan(0.4);

        // Fetch Master BPM dynamically from running DJ system
        let activeBPM = 125;
        if (window.MOSKV.AutoDJAesthetic && window.MOSKV.AutoDJAesthetic.masterBPM) {
            activeBPM = window.MOSKV.AutoDJAesthetic.masterBPM;
        } else if (window.AutoDJAesthetic && window.AutoDJAesthetic.masterBPM) {
            activeBPM = window.AutoDJAesthetic.masterBPM;
        }
        this._voicePipeline.setBPM(activeBPM);

        // Execute synthesis
        this._voicePipeline.speak(cleanText);
    }
};

// Auto-initialize when file is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.MOSKV.chat.init());
} else {
    window.MOSKV.chat.init();
}
