/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | DRAGGABLE MODULE
 * Draggable windows (Music Lab) and Sovereign Bridges (Bandcamp).
 * ═══════════════════════════════════════════════════════════════════
 */

MOSKV.draggable = (() => {
    'use strict';

    const setTranslate = (xPos, yPos, el) => {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    };

    const triggerCompaction = () => {
        const visibleWindows = Array.from(document.querySelectorAll('.drag-window')).filter(w => w.style.display !== 'none');
        const cols = Math.ceil(Math.sqrt(visibleWindows.length));
        const padding = 20;
        const topOffset = 80; // Safe area for header
        
        // Calculate grid cell dimensions
        const cellWidth = (window.innerWidth - padding * 2) / cols;
        const cellHeight = (window.innerHeight - topOffset - padding * 2) / Math.ceil(visibleWindows.length / cols);

        visibleWindows.forEach((w, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            // Apply kinetic override
            w.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            w.style.left = `${padding + col * cellWidth}px`;
            w.style.top = `${topOffset + padding + row * cellHeight}px`;
            w.style.transform = 'translate3d(0px, 0px, 0px)';
            w.style.zIndex = 10 + index;
            
            // Remove transition after it's done so dragging doesn't lag
            setTimeout(() => {
                w.style.transition = '';
            }, 550);
        });
        
        console.log("> CORTEX COMPACTION ROUTINE EXECUTED: ENTROPY MINIMIZED.");
    };

    const initDraggableWindows = () => {
        const windows = document.querySelectorAll('.drag-window');
        
        const handleWindow = (win) => {
            const header = win.querySelector('.drag-header');
            const closeBtn = win.querySelector('.drag-close');
            let isDragging = false;
            let currentX, currentY, initialX, initialY;
            let xOffset = 0;
            let yOffset = 0;

            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    win.style.display = 'none';
                });
            }

            if (header) {
                header.addEventListener('mousedown', dragStart);
                header.addEventListener('dblclick', triggerCompaction);
                document.addEventListener('mouseup', dragEnd);
                document.addEventListener('mousemove', drag);
            }

            win.addEventListener('mousedown', () => {
                windows.forEach(w => w.style.zIndex = 10);
                win.style.zIndex = 20;
            });

            function dragStart(e) {
                const style = globalThis.getComputedStyle(win);
                const transform = style.getPropertyValue('transform');
                
                if (transform && transform !== 'none') {
                    const matrix = new DOMMatrixReadOnly(transform);
                    xOffset = matrix.m41;
                    yOffset = matrix.m42;
                } else {
                    xOffset = 0;
                    yOffset = 0;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || e.target.parentElement === header) {
                    isDragging = true;
                    document.body.classList.add('is-dragging-window');
                }
            }

            function dragEnd() {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                document.body.classList.remove('is-dragging-window');
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            }
        };

        windows.forEach(handleWindow);
    };

    const initSovereignBridges = () => {
        const workspace = document.getElementById('labWorkspace');
        if (!workspace || typeof DATA === 'undefined' || !DATA.bandcampPlayers) return;

        DATA.bandcampPlayers.forEach((player, index) => {
            const win = document.createElement('div');
            win.className = 'drag-window';
            win.id = `bc-bridge-${index}`;
            const top = 100 + (index * 40);
            const left = 30 + (index * 5);
            win.style.top = `${top}px`;
            win.style.left = `${left}%`;
            win.style.zIndex = "15";

            win.innerHTML = `
                <div class="drag-header">
                    <span class="drag-title">Ω_BRIDGE_${player.slug.toUpperCase()}.SYS</span>
                    <span class="drag-close">✕</span>
                </div>
                <div class="drag-body" style="padding: 0; line-height: 0;">
                    <iframe title="Bandcamp Player" src="https://bandcamp.com/EmbeddedPlayer/track=${player.id}/size=large/bgcol=1a1a1a/linkcol=b4ff00/tracklist=false/transparent=true/" width="350" height="350" seamless allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
                </div>
            `;
            workspace.appendChild(win);
        });

        // Re-run to include new windows
        initDraggableWindows();
    };

    const init = () => {
        initDraggableWindows();
        if (typeof DATA !== 'undefined' && DATA.bandcampPlayers && DATA.bandcampPlayers.length > 0) {
            initSovereignBridges();
        }
    };

    return { init };
})();
