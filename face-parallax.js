/**
 * FACE PARALLAX ENGINE — Camera-reactive visual layer
 * Uses getUserMedia + face detection for parallax offset
 * Falls back to mouse if camera denied
 * Toggle: [F] key
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

let active = false;
let video = null;
let faceCanvas = null;
let faceCtx = null;
let stream = null;
let detecting = false;
let offsetX = 0, offsetY = 0;
let targetX = 0, targetY = 0;
const SMOOTHING = 0.08;

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, facingMode: 'user' }
        });
        
        video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        video.style.cssText = 'display:none;';
        document.body.appendChild(video);
        
        // Small indicator
        const indicator = document.createElement('div');
        indicator.id = 'face-parallax-indicator';
        indicator.style.cssText = `
            position:fixed; bottom:12px; left:12px; z-index:99999;
            width:8px; height:8px; border-radius:50%;
            background:#2B3BE5; box-shadow:0 0 6px #2B3BE5;
            animation: fpulse 2s infinite;
        `;
        document.body.appendChild(indicator);

        // Add animation
        if (!document.getElementById('face-parallax-style')) {
            const style = document.createElement('style');
            style.id = 'face-parallax-style';
            style.textContent = `
                @keyframes fpulse { 
                    0%,100% { opacity:0.4; transform:scale(1); } 
                    50% { opacity:1; transform:scale(1.5); } 
                }
            `;
            document.head.appendChild(style);
        }

        await video.play();
        
        // Create off-screen canvas for detection
        faceCanvas = document.createElement('canvas');
        faceCanvas.width = 320;
        faceCanvas.height = 240;
        faceCtx = faceCanvas.getContext('2d', { willReadFrequently: true });
        
        detecting = true;
        detectLoop();
        
    } catch(e) {
        console.log('[FaceParallax] Camera denied, using mouse fallback');
        useMouse();
    }
}

function detectLoop() {
    if (!detecting || !video || !faceCtx) return;
    
    faceCtx.drawImage(video, 0, 0, 320, 240);
    
    // Simple brightness-based face detection (centroid of bright pixels)
    // More robust than facedetector API for simple parallax
    const imageData = faceCtx.getImageData(0, 0, 320, 240);
    const data = imageData.data;
    let sumX = 0, sumY = 0, count = 0;
    
    // Skin-tone detection (simplified)
    for (let y = 0; y < 240; y += 4) {
        for (let x = 0; x < 320; x += 4) {
            const i = (y * 320 + x) * 4;
            const r = data[i], g = data[i+1], b = data[i+2];
            
            // Simple skin-tone heuristic
            if (r > 80 && g > 40 && b > 20 && 
                r > g && r > b && 
                (r - g) > 15 && 
                Math.abs(r - g) < 100) {
                sumX += x;
                sumY += y;
                count++;
            }
        }
    }
    
    if (count > 50) {
        const avgX = sumX / count;
        const avgY = sumY / count;
        // Normalize to -1..1 (mirror X since camera is mirrored)
        targetX = -((avgX / 320) - 0.5) * 2;
        targetY = ((avgY / 240) - 0.5) * 2;
    }
    
    requestAnimationFrame(detectLoop);
}

function useMouse() {
    document.addEventListener('mousemove', (e) => {
        if (!active) return;
        targetX = ((e.clientX / window.innerWidth) - 0.5) * 2;
        targetY = ((e.clientY / window.innerHeight) - 0.5) * 2;
    }, { passive: true });
}

function updateParallax() {
    if (!active) return;
    
    offsetX += (targetX - offsetX) * SMOOTHING;
    offsetY += (targetY - offsetY) * SMOOTHING;
    
    // Apply to CSS custom properties for all parallax consumers
    document.documentElement.style.setProperty('--face-x', offsetX.toFixed(4));
    document.documentElement.style.setProperty('--face-y', offsetY.toFixed(4));
    
    // Apply to fractal/video background
    const bg = document.getElementById('fractal-canvas') || document.querySelector('.video-background video');
    if (bg) {
        bg.style.transform = `translate(${offsetX * -15}px, ${offsetY * -10}px) scale(1.05)`;
    }
    
    // Apply to HUD elements (subtle)
    const hud = document.querySelector('.game-hud');
    if (hud) {
        hud.style.transform = `translate(${offsetX * 3}px, ${offsetY * 2}px)`;
    }
    
    requestAnimationFrame(updateParallax);
}

function start() {
    active = true;
    startCamera();
    updateParallax();
}

function stop() {
    active = false;
    detecting = false;
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
    if (video) { video.remove(); video = null; }
    const indicator = document.getElementById('face-parallax-indicator');
    if (indicator) indicator.remove();
    
    // Reset transforms
    document.documentElement.style.removeProperty('--face-x');
    document.documentElement.style.removeProperty('--face-y');
    const bg = document.getElementById('fractal-canvas') || document.querySelector('.video-background video');
    if (bg) bg.style.transform = '';
    const hud = document.querySelector('.game-hud');
    if (hud) hud.style.transform = '';
}

function toggle() {
    active ? stop() : start();
}

window.FACE_PARALLAX = { start, stop, toggle };

})();
