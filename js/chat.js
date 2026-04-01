/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | CHAT MODULE
 * RITXIE HAWTING — AI chatbot with CF Worker backend.
 * ═══════════════════════════════════════════════════════════════════
 */

MOSKV.chat = (() => {
    'use strict';

    const botResponses = [
        "RITXIE HAWTING está pensando. Dame un momento...",
        "Te sigo. Continúa.",
        "Buscando la señal...",
        "La conexión está abierta. Te escucho.",
        "No encuentro eso aún, pero sigo tirando del hilo.",
        "Entendido. Voy a ello.",
        "Preparando respuesta...",
        "Todo en línea por aquí.",
        "Buen punto.",
        "Leyendo entre ruido y contexto..."
    ];

    const init = () => {
        const chatquito = document.getElementById('frontierTerminal'); // Updated to Frontier
        const closeBtn = document.getElementById('chatquitoClose');
        const openBtn = document.getElementById('chatquitoOpen');
        const input = document.getElementById('chatquitoInput');
        const body = document.getElementById('chatquitoBody');

        if (!chatquito) return;

        // Auto-show after 5s
        setTimeout(() => {
            if (!chatquito.classList.contains('active')) {
                chatquito.classList.add('active');
                document.body.style.overflow = "hidden"; // Lock scroll for Frontier
                if (openBtn) openBtn.style.display = 'none';
                if (input) input.focus();
            }
        }, 5000);

        closeBtn.addEventListener('click', () => {
            chatquito.classList.remove('active');
            document.body.style.overflow = ""; // Unlock scroll
            if (openBtn) openBtn.style.display = 'flex';
        });

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                chatquito.classList.add('active');
                document.body.style.overflow = "hidden"; // Lock scroll
                openBtn.style.display = 'none';
                if (input) input.focus();
            });
        }

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim() !== '') {
                const msg = input.value.trim();
                input.value = '';
                
                body.innerHTML += `<div class="chat-msg user">${msg}</div>`;
                body.scrollTop = body.scrollHeight;

                const typingId = 'typing-' + Date.now();
                body.innerHTML += `<div id="${typingId}" class="chat-msg bot" style="opacity: 0.5;">RITXIE HAWTING piensa...</div>`;
                body.scrollTop = body.scrollHeight;

                fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: msg })
                })
                .then(r => r.json())
                .then(data => {
                    const typingEl = document.getElementById(typingId);
                    if (typingEl) typingEl.remove();

                    if (data?.reply) {
                        body.innerHTML += `<div class="chat-msg bot">${data.reply}</div>`;
                    } else {
                        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
                        body.innerHTML += `<div class="chat-msg bot">${randomResponse}</div>`;
                    }
                    body.scrollTop = body.scrollHeight;
                })
                .catch(() => {
                    const typingEl = document.getElementById(typingId);
                    if (typingEl) typingEl.remove();
                    const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
                    body.innerHTML += `<div class="chat-msg bot">${randomResponse}</div>`;
                    body.scrollTop = body.scrollHeight;
                });
            }
        });
    };

    return { init };
})();
