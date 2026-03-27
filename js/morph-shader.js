/**
 * ═══════════════════════════════════════════════════════════════
 * MORPH SHADER TRANSITION (AWWWARDS TIER S++)
 * Fullscreen WebGL wipe with domain-warped FBM + directional sweep.
 * Triggered via `globalThis.triggerGlobalMorph(durationMs)`
 * ═══════════════════════════════════════════════════════════════
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
                top: '0', left: '0',
                width: '100vw', height: '100vh',
                zIndex: '9999',
                pointerEvents: 'none',
                opacity: '0',
                transition: 'opacity 0.15s ease-out'
            });

            const attach = () => document.body.appendChild(this.container);
            document.body ? attach() : document.addEventListener('DOMContentLoaded', attach);

            this.scene = new THREE.Scene();
            this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
            this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio, 2));
            this.renderer.setSize(globalThis.innerWidth, globalThis.innerHeight);
            this.container.appendChild(this.renderer.domElement);

            this.clock = new THREE.Clock();

            this.material = new THREE.ShaderMaterial({
                vertexShader: `
                    varying vec2 vUv;
                    void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
                `,
                fragmentShader: /* glsl */`
                    precision highp float;
                    uniform float uTime;
                    uniform float uProgress;
                    uniform vec2  uResolution;
                    uniform float uDirection; // 0.0 = horizontal, 1.0 = vertical
                    varying vec2 vUv;

                    // ── Simplex 2D ──
                    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                    float snoise(vec2 v) {
                        const vec4 C = vec4(0.211324865405187,0.366025403784439,
                                           -0.577350269189626,0.024390243902439);
                        vec2 i = floor(v + dot(v, C.yy));
                        vec2 x0 = v - i + dot(i, C.xx);
                        vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
                        vec4 x12 = x0.xyxy + C.xxzz;
                        x12.xy -= i1;
                        i = mod(i, 289.0);
                        vec3 p = permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
                        vec3 m = max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
                        m = m*m; m = m*m;
                        vec3 x2 = 2.0*fract(p*C.www)-1.0;
                        vec3 h = abs(x2)-0.5;
                        vec3 ox = floor(x2+0.5);
                        vec3 a0 = x2-ox;
                        m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
                        vec3 g;
                        g.x = a0.x*x0.x + h.x*x0.y;
                        g.yz = a0.yz*x12.xz + h.yz*x12.yw;
                        return 130.0 * dot(m, g);
                    }

                    // ── FBM ──
                    float fbm(vec2 p) {
                        float f = 0.0, a = 0.5;
                        mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
                        for (int i = 0; i < 5; i++) {
                            f += a * snoise(p);
                            p = rot * p * 2.0 + vec2(1.7, 9.2);
                            a *= 0.5;
                        }
                        return f;
                    }

                    void main() {
                        vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
                        vec2 uv = vUv * aspect;

                        // Domain warp
                        float t = uTime * 0.6;
                        float f1 = fbm(uv * 3.0 + t);
                        float f2 = fbm(uv * 3.0 + f1 * 1.2 + t * 0.5);

                        // Directional sweep
                        float sweepAxis = mix(vUv.x, vUv.y, uDirection);
                        float sweep = sweepAxis + f2 * 0.3;

                        // Bell curve progress (0 → peak → 0)
                        float intensity = sin(uProgress * 3.14159);

                        // Threshold wipe
                        float edge = smoothstep(
                            uProgress - 0.3 + f2 * 0.2,
                            uProgress + 0.05,
                            sweep
                        );

                        // Colors
                        vec3 noir = vec3(0.03, 0.03, 0.04);
                        vec3 lime = vec3(0.8, 1.0, 0.0);
                        vec3 white = vec3(0.95);

                        vec3 col = mix(noir, lime, edge * intensity);

                        // Hot edge glow
                        float edgeGlow = smoothstep(0.48, 0.5, edge) - smoothstep(0.5, 0.52, edge);
                        col = mix(col, white, edgeGlow * intensity * 1.5);

                        // Caustic shimmer
                        float caustic = snoise(uv * 12.0 + t * 2.0) * 0.5 + 0.5;
                        col += lime * caustic * 0.08 * intensity * edge;

                        float alpha = smoothstep(0.0, 0.15, intensity) *
                                      clamp((f1 + 1.0) * 0.5 + intensity * 1.5, 0.0, 1.0);

                        gl_FragColor = vec4(col, alpha * intensity);
                    }
                `,
                uniforms: {
                    uTime:       { value: 0 },
                    uProgress:   { value: 0 },
                    uResolution: { value: new THREE.Vector2(globalThis.innerWidth, globalThis.innerHeight) },
                    uDirection:  { value: 0 }
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
                this.material.uniforms.uResolution.value.set(
                    globalThis.innerWidth, globalThis.innerHeight
                );
            });
        }

        render() {
            if (!this.isActive) return;
            this.material.uniforms.uTime.value = this.clock.getElapsedTime();
            this.renderer.render(this.scene, this.camera);
            this.animationFrame = requestAnimationFrame(this.render.bind(this));
        }

        trigger(durationMs = 2000) {
            // Randomize direction each trigger
            this.material.uniforms.uDirection.value = Math.random() > 0.5 ? 1.0 : 0.0;

            if (this.isActive) {
                if (globalThis.gsap) gsap.killTweensOf(this.material.uniforms.uProgress);
            } else {
                this.isActive = true;
                this.container.style.opacity = '1';
                this.clock.start();
                this.render();
            }

            if (globalThis.gsap) {
                this.material.uniforms.uProgress.value = 0;
                gsap.to(this.material.uniforms.uProgress, {
                    value: 1,
                    duration: durationMs / 1000,
                    ease: 'power2.inOut',
                    onComplete: () => this.stop()
                });
            } else {
                let start = Date.now();
                const fallback = () => {
                    const p = (Date.now() - start) / durationMs;
                    if (p >= 1) {
                        this.material.uniforms.uProgress.value = 1;
                        this.stop();
                    } else {
                        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
                        this.material.uniforms.uProgress.value = eased;
                        requestAnimationFrame(fallback);
                    }
                };
                fallback();
            }
        }

        stop() {
            this.container.style.opacity = '0';
            setTimeout(() => {
                this.isActive = false;
                cancelAnimationFrame(this.animationFrame);
            }, 150);
        }
    }

    globalThis.addEventListener('DOMContentLoaded', () => {
        if (!_morphOverlay && typeof THREE !== 'undefined') {
            _morphOverlay = new MorphTransition();
        }
    });

    globalThis.triggerGlobalMorph = function(durationMs = 2000) {
        if (!_morphOverlay && typeof THREE !== 'undefined') {
            _morphOverlay = new MorphTransition();
        }
        if (_morphOverlay) _morphOverlay.trigger(durationMs);
    };
})();
