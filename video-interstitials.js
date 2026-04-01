/**
 * FULLSCREEN VIDEO INTERSTITIALS
 * Mandatory fullscreen video breaks between sections
 * Random video on each visit — immersive, unavoidable
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

// Pool of YouTube video IDs (curated)
const VIDEO_POOL = [
    'b9ktVQN48OU', 'pgldO_y7hzc', 'NYhOQTcNLkA', 'hY0G0Zxf_uo',
    'T_rU7WfOVTI', 'EP5s0yKZUKk', 'E9vLd5pS7-g', 'mQjFXZ8Y4G8',
    'Vn_j3Z2c8l0', 'WdZ1fB7o9U0', 'c_RzB9T83J4', 'RcuGred7BYE'
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function init() {
    // Find insertion points (between major sections)
    const sections = document.querySelectorAll('section[id]');
    const insertAfter = ['hero', 'players', 'sets'];
    const shuffled = shuffle(VIDEO_POOL);
    let videoIdx = 0;

    insertAfter.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (!section || videoIdx >= shuffled.length) return;

        const videoId = shuffled[videoIdx++];
        const interstitial = document.createElement('div');
        interstitial.className = 'video-interstitial';
        interstitial.setAttribute('data-video-id', videoId);
        interstitial.innerHTML = `
            <div class="vi-wrapper">
                <iframe
                    data-src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0&playsinline=1"
                    frameborder="0"
                    allow="autoplay; encrypted-media"
                    allowfullscreen
                    loading="lazy"
                    title="Immersive Video"
                ></iframe>
            </div>
            <div class="vi-gradient-top"></div>
            <div class="vi-gradient-bottom"></div>
        `;

        section.after(interstitial);
    });

    // Lazy load: only load iframe when in viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target.querySelector('iframe[data-src]');
                if (iframe && !iframe.src) {
                    iframe.src = iframe.dataset.src;
                }
            }
        });
    }, { threshold: 0.1, rootMargin: '200px' });

    document.querySelectorAll('.video-interstitial').forEach(el => observer.observe(el));

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        .video-interstitial {
            position: relative;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            margin: 0;
            padding: 0;
            background: #000;
        }
        .vi-wrapper {
            position: absolute;
            inset: -10%;
            width: 120%;
            height: 120%;
        }
        .vi-wrapper iframe {
            width: 100%;
            height: 100%;
            object-fit: cover;
            pointer-events: none;
        }
        .vi-gradient-top,
        .vi-gradient-bottom {
            position: absolute;
            left: 0;
            right: 0;
            height: 120px;
            z-index: 2;
            pointer-events: none;
        }
        .vi-gradient-top {
            top: 0;
            background: linear-gradient(to bottom, rgba(2,2,2,0.8), transparent);
        }
        .vi-gradient-bottom {
            bottom: 0;
            background: linear-gradient(to top, rgba(2,2,2,0.8), transparent);
        }
    `;
    document.head.appendChild(style);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();
