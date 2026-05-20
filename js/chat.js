// ═══════════════════════════════════════════════════════════════════════════
// CHAT CONTROLLER: Ritxie Hawting Interactive Assistant
// ═══════════════════════════════════════════════════════════════════════════

window.MOSKV = window.MOSKV || {};
window.MOSKV.chat = {
    init() {
        const toggleBtn = document.getElementById('chatquitoToggle');
        const widget = document.getElementById('chatquitoWidget');
        const closeBtn = document.getElementById('chatquitoClose');
        const input = document.getElementById('chatquitoInput');
        const body = document.getElementById('chatquitoBody');

        if (!widget) return;

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
        msg.textContent = text;
        body.appendChild(msg);
        body.scrollTop = body.scrollHeight;
    },

    getBotReply(text) {
        const lower = text.toLowerCase();
        
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
