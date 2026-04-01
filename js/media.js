/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | MEDIA MODULE
 * Background video, Music Lab embeds, and video controls.
 * ═══════════════════════════════════════════════════════════════════
 */

MOSKV.media = (() => {
    'use strict';

    let currentVideoId = "";

    const initBackgroundVideo = () => {
        try {
            if (typeof DATA === 'undefined' || !DATA.bgVideos || DATA.bgVideos.length === 0) return;
            const iframe = document.getElementById('bg-video');
            if (!iframe) return;

            currentVideoId = DATA.bgVideos[Math.floor(Math.random() * DATA.bgVideos.length)];
            
            const src = `https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${currentVideoId}&playsinline=1&enablejsapi=1&rel=0&modestbranding=1&vq=hd1080`;
            iframe.src = src;
        } catch (e) {
            console.error("[CORTEX] Background video injection failed:", e);
        }
    };

    const initRandomMusicLabEmbeds = () => {
        try {
            // BANDCAMP
            const bcContainer = document.getElementById('embed-container-1');
            if (bcContainer && typeof DATA !== 'undefined' && DATA.bandcampPlayers) {
                const bcItem = DATA.bandcampPlayers[Math.floor(Math.random() * DATA.bandcampPlayers.length)];
                bcContainer.innerHTML = `<iframe style="border-radius:0; border:0; width: 350px; height: 120px;" src="https://bandcamp.com/EmbeddedPlayer/album=${bcItem.id}/size=large/bgcol=333333/linkcol=74c7ff/tracklist=false/artwork=small/transparent=true/" seamless><a href="https://${bcItem.slug}.bandcamp.com/">${bcItem.title}</a></iframe>`;
            }

            // MIXCLOUD
            const mcContainer = document.getElementById('embed-container-2');
            if (mcContainer) {
                const mcSlugs = [
                    "%2Fborjamoskv%2F",
                    "%2Fborjamoskv%2Fteckno%2F",
                    "%2Fborjamoskv%2Fborja-moskv-b2b-k-style-zul-2015%2F",
                    "%2Fborjamoskv%2Fborja-moskv-classic-techno-vinyl-set%2F"
                ];
                const mcItem = mcSlugs[Math.floor(Math.random() * mcSlugs.length)];
                mcContainer.innerHTML = `<iframe title="Mixcloud Player" width="350" height="120" src="https://www.mixcloud.com/widget/iframe/?hide_cover=1&light=0&feed=${mcItem}" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
            }

            // YOUTUBE
            const ytContainer = document.getElementById('embed-container-3');
            if (ytContainer && typeof DATA !== 'undefined' && DATA.bgVideos) {
                const ytItem = DATA.bgVideos[Math.floor(Math.random() * DATA.bgVideos.length)];
                ytContainer.innerHTML = `<iframe title="YouTube Player" width="350" height="197" src="https://www.youtube.com/embed/${ytItem}?controls=1&modestbranding=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            }
        } catch(e) {
            console.error("[CORTEX] Music Lab Randomizer failed:", e);
        }
    };

    const initVideoControls = () => {
        const soundToggle = document.getElementById('heroSoundToggle');
        if (!soundToggle) return;
        
        const iconUnmute = soundToggle.querySelector('.icon-unmute');
        const iconMute = soundToggle.querySelector('.icon-mute');
        const iframe = document.getElementById('bg-video');
        let isMuted = true;
        globalThis.heroVideoUnmuted = false;

        soundToggle.addEventListener('click', () => {
            isMuted = !isMuted;
            const command = isMuted ? 'mute' : 'unMute';
            
            if (iframe?.contentWindow) {
                iframe.contentWindow.postMessage(JSON.stringify({
                    event: 'command',
                    func: command,
                    args: []
                }), 'https://www.youtube-nocookie.com');
            }

            // Notify sovereign-audio ducking loop
            globalThis.heroVideoUnmuted = !isMuted;

            if (isMuted) {
                if (iconUnmute) iconUnmute.style.display = 'block';
                if (iconMute) iconMute.style.display = 'none';
            } else {
                if (iconUnmute) iconUnmute.style.display = 'none';
                if (iconMute) iconMute.style.display = 'block';
            }
        });
    };

    const initSecretEgg = () => {
        const egg = document.querySelector('.secret-egg');
        if (!egg) return;

        const potentialNests = [
            { selector: '.footer-bottom', position: 'beforeend' },
            { selector: '#newsletter', position: 'beforebegin' },
            { selector: '.marquee-section', position: 'beforeend' },
            { selector: '.hero-poetry', position: 'afterend' },
            { selector: '.substack-section', position: 'beforeend' }
        ];

        try {
            const nest = potentialNests[Math.floor(Math.random() * potentialNests.length)];
            const target = document.querySelector(nest.selector);
            if (target) {
                target.appendChild(egg);
                if (nest.selector === '.hero-poetry') {
                    egg.style.position = 'relative';
                    egg.style.marginTop = '2rem';
                } else {
                    egg.style.position = 'absolute';
                }
            }
        } catch (e) {
            console.warn("[CORTEX] Egg teleportation failed:", e);
        }

        egg.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            egg.style.transform = 'scale(1.5) rotate(360deg)';
            egg.style.transition = 'all 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            globalThis.open('https://naroa.online', '_blank');
        });
        
        egg.addEventListener('click', (e) => {
            e.preventDefault();
            egg.style.transform = 'scale(1.5) rotate(720deg)';
            egg.style.transition = 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            setTimeout(() => {
                globalThis.location.href = 'https://naroa.online';
            }, 1000);
        });
    };

    const init = () => {
        initBackgroundVideo();
        initRandomMusicLabEmbeds();
        if (document.getElementById('heroSoundToggle')) {
            initVideoControls();
        }
        initSecretEgg();
    };

    return { init, getCurrentVideoId: () => currentVideoId };
})();
