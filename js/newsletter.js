/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | NEWSLETTER MODULE
 * Extracted from inline <script> in index.html.
 * CF Worker API integration for email subscriptions.
 * ═══════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newsletterForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('nlSubmit');
        const status = document.getElementById('nlStatus');
        const name = document.getElementById('nlName').value.trim();
        const email = document.getElementById('nlEmail').value.trim();
        
        btn.disabled = true;
        btn.textContent = '...';
        status.textContent = '';
        
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });
            const data = await res.json();
            status.textContent = data.message;
            status.style.color = data.ok ? '#CCFF00' : '#ff003c';
            if (data.ok) {
                document.getElementById('nlName').value = '';
                document.getElementById('nlEmail').value = '';
            }
        } catch (err) {
            console.error('[Newsletter] Network Error:', err);
            status.textContent = '[Error de conexión] Inténtalo de nuevo.';
            status.style.color = '#ff003c';
        }
        
        btn.disabled = false;
        btn.textContent = 'Sintonizar';
    });
});
