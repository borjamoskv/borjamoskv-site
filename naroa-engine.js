/**
 * CORTEX-Native Ephemeral Mutation Engine
 * Parálisis de Scroll & Euclidean Cursor Logic
 */

class InfiniteMicaEngine {
    constructor() {
        // Base state and focal target data
        this.baseImage = 'borjarl.jpg'; 
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
    }

    init() {
        this.buildRail();
        this.initLenis();
        this.initEuclideanCursor();
        this.initSnap();
    }

    buildRail() {
        const rail = document.getElementById('rail');
        // Construct minimum viable asymmetric rail for infinite loop
        for(let i=1; i<=8; i++) {
            const alignClass = i % 2 === 0 ? 'asym-left' : 'asym-right';
            const node = document.createElement('div');
            node.className = \`rail-section \${alignClass}\`;
            node.innerHTML = \`
                <img src="\${this.baseImage}" class="focal-point" alt="Artwork Fragment \${i}">
                <div class="focal-target" data-focal="true"></div>
                <div class="rail-meta">SEQ_ID <span>0x00\${i}</span> // MICA_STATE <span>ACTIVE</span></div>
            \`;
            rail.appendChild(node);
        }
    }

    initLenis() {
        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
            infinite: true, // Core thermodynamic mechanic: never-ending mutation
            syncTouch: true
        });

        const raf = (time) => {
            this.lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        // Velocity dictates Chromatic Distortion
        this.lenis.on('scroll', (e) => {
            const v = Math.abs(e.velocity);
            // Threshold > 50px/sec triggers distortion clamp
            let distortion = 0;
            if (v > 10) {
                // Non-linear entropy application
                distortion = v / 20; 
                if (distortion > 15) distortion = 15;
            }
            document.documentElement.style.setProperty('--scroll-velocity', distortion.toFixed(2));
        });
    }

    initSnap() {
        // Hiper-rigid magnetic snap
        gsap.registerPlugin(ScrollTrigger);
        
        const sections = document.querySelectorAll('.rail-section');
        sections.forEach((sec) => {
            ScrollTrigger.create({
                trigger: sec,
                start: "center center",
                end: "+=1", // Creates a strict anchor point
                snap: {
                    snapTo: "labels", 
                    duration: {min: 0.1, max: 0.4},
                    ease: "power4.inOut"
                }
            });
        });
    }

    initEuclideanCursor() {
        const cursor = document.getElementById('euclidean-cursor');
        const dataLbl = document.getElementById('cursor-data');
        const canvas = document.getElementById('euclidean-canvas');
        const ctx = canvas.getContext('2d');
        
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // High-DPI scaling for sub-pixel precision could be added here
        };
        window.addEventListener('resize', resize);
        resize();

        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            cursor.style.left = \`\${this.mouseX}px\`;
            cursor.style.top = \`\${this.mouseY}px\`;
        });

        const drawLoop = () => {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(180, 255, 0, 0.4)';
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 1;

            let closestDist = Infinity;
            
            document.querySelectorAll('.focal-target').forEach(target => {
                const rect = target.getBoundingClientRect();
                // O(1) visibility cull
                if(rect.top < window.innerHeight && rect.bottom > 0) {
                    const tx = rect.left + rect.width/2;
                    const ty = rect.top + rect.height/2;

                    const dx = this.mouseX - tx;
                    const dy = this.mouseY - ty;
                    const dist = Math.hypot(dx, dy);

                    if(dist < closestDist) closestDist = dist;

                    if(dist < 700) { // Render horizon threshold
                        ctx.beginPath();
                        ctx.moveTo(this.mouseX, this.mouseY);
                        ctx.lineTo(tx, ty);
                        ctx.stroke();
                        
                        ctx.fillStyle = '#B4FF00';
                        ctx.beginPath();
                        ctx.arc(tx, ty, 3, 0, Math.PI*2);
                        ctx.fill();
                    }
                }
            });

            if(closestDist !== Infinity) {
                dataLbl.innerText = \`Δ: \${closestDist.toFixed(2)}px\`;
            } else {
                dataLbl.innerText = \`Δ: NULL\`;
            }

            requestAnimationFrame(drawLoop);
        };
        requestAnimationFrame(drawLoop);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new InfiniteMicaEngine();
    app.init();
});
