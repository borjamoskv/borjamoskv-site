/**
 * MORPH SHADER TRANSITION (AWWWARDS GRADE)
 * Uses Three.js to create a fullscreen WebGL distortion effect.
 * Triggered programmatically via `globalThis.triggerGlobalMorph(durationMs)`
 */

if (typeof THREE === 'undefined') {
    console.warn('[CORTEX] Three.js is required for morph-shader.js');
}

(function() {
    let _morphOverlay = null;

    class MorphTransition {
        constructor() {
            this.container = document.createElement('div');
            this.container.id = 'webgl-morph-overlay';
            Object.assign(this.container.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100vw',
                height: '100vh',
                zIndex: '9999',
                pointerEvents: 'none',
                opacity: '0',
                transition: 'opacity 0.2s ease-out'
            });

            if (document.body) {
                document.body.appendChild(this.container);
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(this.container);
                });
            }

            this.scene = new THREE.Scene();
            this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
            this.renderer.setPixelRatio(globalThis.devicePixelRatio);
            this.renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
            this.container.appendChild(this.renderer.domElement);

            this.clock = new THREE.Clock();
            
            // Simplex noise in GLSL
            const vertexShader = `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `;

            const fragmentShader = `
                uniform float uTime;
                uniform float uProgress;
                uniform vec2 uResolution;
                varying vec2 vUv;

                // 2D Simplex Noise function (Ashima Arts)
                vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                float snoise(vec2 v){
                  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                  vec2 i  = floor(v + dot(v, C.yy) );
                  vec2 x0 = v -   i + dot(i, C.xx);
                  vec2 i1;
                  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                  vec4 x12 = x0.xyxy + C.xxzz;
                  x12.xy -= i1;
                  i = mod(i, 289.0);
                  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                  m = m*m;
                  m = m*m;
                  vec3 x = 2.0 * fract(p * C.www) - 1.0;
                  vec3 h = abs(x) - 0.5;
                  vec3 ox = floor(x + 0.5);
                  vec3 a0 = x - ox;
                  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                  vec3 g;
                  g.x  = a0.x  * x0.x  + h.x  * x0.y;
                  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                  return 130.0 * dot(m, g);
                }

                void main() {
                    // Normalize coordinates
                    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
                    vec2 uv = vUv * aspect;
                    
                    // Create fluid warp
                    float noise1 = snoise(uv * 3.0 + uTime * 0.5);
                    float noise2 = snoise(uv * 6.0 - uTime * 0.8 + noise1);
                    
                    // Color palette mixing (Grayscale to neon lime core)
                    vec3 col1 = vec3(0.05, 0.05, 0.05); // Dark
                    vec3 col2 = vec3(0.8, 1.0, 0.0);    // Cyber Lime #ccff00
                    vec3 col3 = vec3(0.9, 0.9, 0.9);    // White edge
                    
                    // Mask based on progress (0 -> 1 -> 0)
                    float intensity = sin(uProgress * 3.14159); 
                    
                    // Dynamic thresholding
                    float t = smoothstep(0.0, 0.5, noise2 + intensity - 0.5);
                    vec3 finalCol = mix(col1, col2, t);
                    
                    // Add bright edge
                    float edge = smoothstep(0.45, 0.5, noise2 + intensity - 0.5) - smoothstep(0.5, 0.55, noise2 + intensity - 0.5);
                    finalCol = mix(finalCol, col3, edge * intensity);
                    
                    // Alpha fade based on intensity
                    float alpha = smoothstep(0.0, 0.2, intensity) * clamp((noise1 + 1.0) * 0.5 + intensity*1.5, 0.0, 1.0);
                    
                    gl_FragColor = vec4(finalCol, alpha * intensity);
                }
            `;

            this.material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uTime: { value: 0 },
                    uProgress: { value: 0 },
                    uResolution: { value: new THREE.Vector2(globalThis.innerWidth, globalThis.innerHeight) }
                },
                transparent: true,
                depthWrite: false
            });

            this.geometry = new THREE.PlaneGeometry(2, 2);
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.scene.add(this.mesh);

            this.isActive = false;
            this.bindEvents();
        }

        bindEvents() {
            globalThis.addEventListener('resize', () => {
                this.renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
                this.material.uniforms.uResolution.value.set(globalThis.innerWidth, globalThis.innerHeight);
            });
        }

        render() {
            if (!this.isActive) return;
            this.material.uniforms.uTime.value = this.clock.getElapsedTime();
            this.renderer.render(this.scene, this.camera);
            this.animationFrame = requestAnimationFrame(this.render.bind(this));
        }

        trigger(durationMs = 2000) {
            if (this.isActive) {
                // If already active, restart progress
                if (globalThis.gsap) {
                    globalThis.gsap.killTweensOf(this.material.uniforms.uProgress);
                }
            } else {
                this.isActive = true;
                this.container.style.opacity = '1';
                this.clock.start();
                this.render();
            }

            // Awwwards style: use GSAP for smooth uniform interpolation
            if (globalThis.gsap) {
                this.material.uniforms.uProgress.value = 0;
                gsap.to(this.material.uniforms.uProgress, {
                    value: 1,
                    duration: durationMs / 1000,
                    ease: "power2.inOut",
                    onComplete: () => this.stop()
                });
            } else {
                // Fallback if GSAP is missing (should not happen in this project)
                let start = Date.now();
                const animateFallback = () => {
                    let elapsed = Date.now() - start;
                    let p = elapsed / durationMs;
                    if (p >= 1) {
                        this.material.uniforms.uProgress.value = 1;
                        this.stop();
                    } else {
                        // ease in out quad approximation
                        let eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
                        this.material.uniforms.uProgress.value = eased;
                        requestAnimationFrame(animateFallback);
                    }
                };
                animateFallback();
            }
        }

        stop() {
            this.container.style.opacity = '0';
            setTimeout(() => {
                this.isActive = false;
                cancelAnimationFrame(this.animationFrame);
            }, 200); // Wait for CSS opacity fade
        }
    }

    // Initialize only when DOM is ready
    globalThis.addEventListener('DOMContentLoaded', () => {
        if (!_morphOverlay && typeof THREE !== 'undefined') {
            _morphOverlay = new MorphTransition();
        }
    });

    // Expose global trigger
    globalThis.triggerGlobalMorph = function(durationMs = 2000) {
        if (!_morphOverlay && typeof THREE !== 'undefined') {
            _morphOverlay = new MorphTransition();
        }
        if (_morphOverlay) {
            _morphOverlay.trigger(durationMs);
        }
    };
})();
