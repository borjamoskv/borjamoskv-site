/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | WEBGL FLUID SYSTEM + POST-PROCESSING PIPELINE
 * Tier S++ Awwwards Architecture:
 *   Pass 1 — FBM Fluid Field (curl noise + Voronoi caustics)
 *   Pass 2 — Post-Processing (chromatic aberration, bloom, barrel distortion)
 * Audio-reactive via AutoDJ engine uniforms.
 * ═══════════════════════════════════════════════════════════════════
 */

class WebGLFluidSystem {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    if (!this.canvas) return;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.autoClear = false;

    // ── Cameras ──
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.sceneCamera = new THREE.OrthographicCamera(
      -window.innerWidth / 2, window.innerWidth / 2,
      window.innerHeight / 2, -window.innerHeight / 2,
      0, 1000
    );
    this.sceneCamera.position.z = 100;

    // ── Render Targets (Ping-pong for post-FX) ──
    const rtOpts = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType
    };
    this.rtFluid = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtOpts);
    this.rtPostFX = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, rtOpts);

    // ── Scenes ──
    this.fluidScene = new THREE.Scene();
    this.postFXScene = new THREE.Scene();
    this.compositeScene = new THREE.Scene();

    // ── Shared Uniforms ──
    this.uniforms = {
      uTime:           { value: 0 },
      uResolution:     { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse:          { value: new THREE.Vector2(0.5, 0.5) },
      uMouseVelocity:  { value: new THREE.Vector2(0, 0) },
      uAudioFreq:      { value: 0 },
      uAudioBass:      { value: 0 },
      uAudioSnare:     { value: 0 },
      uScrollVelocity: { value: 0 },
      uEnergyPhase:    { value: 0 } // 0=warmup, 1=buildup, 2=peak, 3=cooldown
    };

    this._prevMouse = new THREE.Vector2(0.5, 0.5);
    this._smoothMouse = new THREE.Vector2(0.5, 0.5);

    this._buildFluidPass();
    this._buildPostFXPass();
    this._buildCompositePass();

    this.bindEvents();
    this.clock = new THREE.Clock();
    this.render();
  }

  // ════════════════════════════════════════════════════════════════
  // PASS 1 — FBM FLUID FIELD
  // Curl noise advection + Voronoi caustics + black-hole singularity
  // ════════════════════════════════════════════════════════════════
  _buildFluidPass() {
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */`
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2  uResolution;
        uniform vec2  uMouse;
        uniform vec2  uMouseVelocity;
        uniform float uAudioFreq;
        uniform float uAudioBass;
        uniform float uAudioSnare;
        uniform float uScrollVelocity;
        uniform float uEnergyPhase;

        #define PI  3.14159265359
        #define TAU 6.28318530718

        // ── Simplex 2D (Ashima Arts) ──
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
          vec3 m = max(0.5 - vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)), 0.0);
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

        // ── FBM (6 octaves) ──
        float fbm(vec2 p) {
          float f = 0.0, a = 0.5;
          mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
          for (int i = 0; i < 6; i++) {
            f += a * snoise(p);
            p = rot * p * 2.0 + vec2(1.7, 9.2);
            a *= 0.5;
          }
          return f;
        }

        // ── Curl Noise (2D) ──
        vec2 curlNoise(vec2 p) {
          float eps = 0.01;
          float n1 = fbm(p + vec2(eps, 0.0));
          float n2 = fbm(p - vec2(eps, 0.0));
          float n3 = fbm(p + vec2(0.0, eps));
          float n4 = fbm(p - vec2(0.0, eps));
          return vec2((n3 - n4), -(n1 - n2)) / (2.0 * eps);
        }

        // ── Voronoi Distance (1st nearest) ──
        float voronoi(vec2 p) {
          vec2 n = floor(p);
          vec2 f = fract(p);
          float md = 8.0;
          for (int j = -1; j <= 1; j++) {
            for (int i = -1; i <= 1; i++) {
              vec2 g = vec2(float(i), float(j));
              vec2 o = vec2(
                snoise(n + g + vec2(0.0, 13.0)) * 0.5 + 0.5,
                snoise(n + g + vec2(7.0, 0.0)) * 0.5 + 0.5
              );
              o = 0.5 + 0.5 * sin(uTime * 0.4 + TAU * o);
              vec2 r = g + o - f;
              float d = dot(r, r);
              md = min(md, d);
            }
          }
          return sqrt(md);
        }

        void main() {
          vec2 st = gl_FragCoord.xy / uResolution.xy;
          float aspect = uResolution.x / uResolution.y;
          vec2 uv = st;
          uv.x *= aspect;

          vec2 mouse = uMouse.xy / uResolution.xy;
          mouse.x *= aspect;
          if (length(mouse) < 0.01) mouse = vec2(0.5 * aspect, 0.5);

          // ── Singularity (black hole) ──
          vec2 delta = uv - mouse;
          float r = length(delta);
          float angle = atan(delta.y, delta.x);
          float eventHorizon = 0.06 + uAudioBass * 0.1;
          float gravity = smoothstep(eventHorizon * 8.0, 0.0, r);

          // Spiral warp (audio-driven spin rate)
          float spinRate = 1.2 + uAudioFreq * 3.0 + uEnergyPhase * 0.5;
          float spin = uTime * spinRate + 10.0 * gravity;
          float pull = 1.0 - smoothstep(0.0, eventHorizon * 3.0, r);
          float c = cos(spin), s = sin(spin);
          mat2 rot = mat2(c, -s, s, c);
          vec2 warped = mouse + rot * delta * mix(1.0, 0.02, pull);

          // ── Curl noise advection ──
          float curlScale = 3.0 + uAudioFreq * 2.0;
          vec2 curl = curlNoise(warped * curlScale + uTime * 0.15);
          float curlStrength = 0.08 + uAudioBass * 0.15 + abs(uScrollVelocity) * 0.02;
          warped += curl * curlStrength;

          // ── FBM fluid field ──
          float t = uTime * 0.2;
          float f1 = fbm(warped * 4.0 + t);
          float f2 = fbm(warped * 4.0 + f1 * 1.5 + t * 0.7);
          float f3 = fbm(warped * 8.0 - f2 + t * 0.3);
          float domainWarp = f1 + f2 * 0.5 + f3 * 0.25;

          // ── Voronoi caustic overlay ──
          float vScale = 6.0 + uAudioSnare * 4.0;
          float caustic = voronoi(warped * vScale + t * 0.3 + f1 * 0.4);
          caustic = smoothstep(0.0, 0.15, caustic) * 0.6;

          // ── Color synthesis ──
          vec3 noir    = vec3(0.02, 0.02, 0.03);
          vec3 lime    = vec3(0.8, 1.0, 0.0);
          vec3 cyan    = vec3(0.0, 0.85, 0.95);
          vec3 magenta = vec3(0.9, 0.0, 0.8);
          vec3 hotWhite = vec3(1.0, 0.98, 0.9);

          // Fluid color mix
          float colorMix = domainWarp * 0.5 + 0.5;
          vec3 fluidColor = mix(cyan, magenta, colorMix);
          fluidColor = mix(fluidColor, lime, sin(domainWarp * 4.0 + uTime) * 0.3 + 0.3);

          // Accretion disk
          float disk = smoothstep(eventHorizon * 1.1, eventHorizon * 1.8, r) *
                       smoothstep(eventHorizon * 5.0, eventHorizon * 1.3, r);

          // Mix: noir background → fluid near singularity
          vec3 col = mix(noir, fluidColor * 0.6, gravity * 0.85 + disk * 0.3);

          // Caustic highlights
          col += hotWhite * caustic * gravity * 0.4;

          // Singularity core: pure black
          float core = smoothstep(eventHorizon, eventHorizon * 0.95, r);
          col = mix(col, vec3(0.0), core);

          // Lime rim-light with audio pulse
          col += lime * disk * 0.5 * gravity * (1.0 + sin(uTime * 5.0) * 0.3);

          // Mouse velocity streak
          float velMag = length(uMouseVelocity) * 0.001;
          col += lime * velMag * gravity * 0.3;

          // Alpha: transparent background, solidifies near singularity
          float alpha = gravity * 0.9 + core * 0.95 + disk * 0.5 + caustic * gravity * 0.2;
          alpha = clamp(alpha, 0.0, 0.98);

          // Energy phase tint
          if (uEnergyPhase > 1.5 && uEnergyPhase < 2.5) {
            // Peak: red/orange glow
            col += vec3(0.3, 0.05, 0.0) * gravity * uAudioBass;
          }

          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false
    });

    this.fluidMesh = new THREE.Mesh(geo, mat);
    this.fluidScene.add(this.fluidMesh);
  }

  // ════════════════════════════════════════════════════════════════
  // PASS 2 — POST-PROCESSING
  // Chromatic aberration + barrel distortion + vignette + bloom glow
  // ════════════════════════════════════════════════════════════════
  _buildPostFXPass() {
    const geo = new THREE.PlaneGeometry(2, 2);

    this.postFXUniforms = {
      uTexture:     { value: null },
      uResolution:  this.uniforms.uResolution,
      uTime:        this.uniforms.uTime,
      uAudioBass:   this.uniforms.uAudioBass,
      uAudioSnare:  this.uniforms.uAudioSnare,
      uEnergyPhase: this.uniforms.uEnergyPhase
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.postFXUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */`
        precision highp float;
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform vec2  uResolution;
        uniform float uTime;
        uniform float uAudioBass;
        uniform float uAudioSnare;
        uniform float uEnergyPhase;

        // ── Barrel Distortion ──
        vec2 barrelDistort(vec2 uv, float amt) {
          vec2 cc = uv - 0.5;
          float r2 = dot(cc, cc);
          return uv + cc * r2 * amt;
        }

        void main() {
          // Audio-reactive distortion intensity
          float bassIntensity = uAudioBass;
          float snareIntensity = uAudioSnare;
          float peakBoost = (uEnergyPhase > 1.5 && uEnergyPhase < 2.5) ? 1.5 : 1.0;

          // Barrel distortion (subtle, increases with bass)
          float barrelAmt = 0.02 + bassIntensity * 0.08 * peakBoost;
          vec2 distUv = barrelDistort(vUv, barrelAmt);

          // ── Chromatic Aberration ──
          float caBase = 0.002 + bassIntensity * 0.008 * peakBoost;
          float caSnare = snareIntensity * 0.005;
          float caAmount = caBase + caSnare;

          // Directional CA: radial from center
          vec2 dir = normalize(vUv - 0.5);
          float dist = length(vUv - 0.5);
          vec2 caOffset = dir * caAmount * dist;

          float r = texture2D(uTexture, distUv + caOffset).r;
          float g = texture2D(uTexture, distUv).g;
          float b = texture2D(uTexture, distUv - caOffset).b;
          float a = texture2D(uTexture, distUv).a;

          vec3 col = vec3(r, g, b);

          // ── Bloom (simple threshold glow) ──
          float lum = dot(col, vec3(0.299, 0.587, 0.114));
          float bloomThreshold = 0.5 - bassIntensity * 0.15;
          float bloom = smoothstep(bloomThreshold, 1.0, lum);
          col += col * bloom * (0.15 + bassIntensity * 0.3) * peakBoost;

          // ── Vignette ──
          float vig = 1.0 - smoothstep(0.4, 1.4, dist * 2.0);
          col *= mix(0.7, 1.0, vig);

          // ── Scanline flicker (subtle CRT) ──
          float scanline = sin(gl_FragCoord.y * 1.5 + uTime * 8.0) * 0.02;
          col -= scanline * peakBoost;

          // ── Film grain ──
          float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453);
          col += (noise - 0.5) * 0.03;

          gl_FragColor = vec4(col, a);
        }
      `,
      transparent: true,
      depthWrite: false
    });

    this.postFXMesh = new THREE.Mesh(geo, mat);
    this.postFXScene.add(this.postFXMesh);
  }

  // ════════════════════════════════════════════════════════════════
  // COMPOSITE — Final output to screen
  // ════════════════════════════════════════════════════════════════
  _buildCompositePass() {
    const compositeMat = new THREE.MeshBasicMaterial({
      map: this.rtPostFX.texture,
      transparent: true,
      depthWrite: false
    });
    const compositeGeo = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    this.compositeMesh = new THREE.Mesh(compositeGeo, compositeMat);
    this.compositeMesh.position.z = -10;
    this.compositeScene.add(this.compositeMesh);

    if (typeof TypographicRaymarching !== 'undefined') {
      this.textShader = new TypographicRaymarching(
        this.compositeScene, this.sceneCamera, () => this.rtPostFX.texture
      );
    }
  }

  // ════════════════════════════════════════════════════════════════
  // EVENTS
  // ════════════════════════════════════════════════════════════════
  bindEvents() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth, h = window.innerHeight;
      this.renderer.setSize(w, h);
      this.rtFluid.setSize(w, h);
      this.rtPostFX.setSize(w, h);
      this.uniforms.uResolution.value.set(w, h);

      this.sceneCamera.left   = -w / 2;
      this.sceneCamera.right  =  w / 2;
      this.sceneCamera.top    =  h / 2;
      this.sceneCamera.bottom = -h / 2;
      this.sceneCamera.updateProjectionMatrix();

      if (this.compositeMesh) {
        this.compositeMesh.geometry.dispose();
        this.compositeMesh.geometry = new THREE.PlaneGeometry(w, h);
      }
    });

    window.addEventListener('mousemove', (e) => {
      const newMouse = new THREE.Vector2(e.clientX, window.innerHeight - e.clientY);
      this.uniforms.uMouseVelocity.value.set(
        newMouse.x - this._prevMouse.x,
        newMouse.y - this._prevMouse.y
      );
      this._prevMouse.copy(newMouse);

      // Smooth lerp for fluid mouse
      this._smoothMouse.lerp(newMouse, 0.08);
      this.uniforms.uMouse.value.copy(this._smoothMouse);

      this.mouseX = e.clientX / window.innerWidth;
      this.mouseY = 1.0 - (e.clientY / window.innerHeight);
    });

    if (window.lenis) {
      window.lenis.on('scroll', (e) => {
        this.uniforms.uScrollVelocity.value = e.velocity || 0;
      });
    }
  }

  // ════════════════════════════════════════════════════════════════
  // RENDER LOOP
  // ════════════════════════════════════════════════════════════════
  render() {
    // ── Read audio data from AutoDJ ──
    if (window.autoDJAesthetic && typeof window.autoDJAesthetic.getLowFrequencyData === 'function') {
      const bass = window.autoDJAesthetic.getLowFrequencyData();
      this.uniforms.uAudioFreq.value += (bass - this.uniforms.uAudioFreq.value) * 0.12;
      this.uniforms.uAudioBass.value += (bass - this.uniforms.uAudioBass.value) * 0.15;
    } else {
      this.uniforms.uAudioFreq.value *= 0.95;
      this.uniforms.uAudioBass.value *= 0.95;
    }

    // Read snare data
    const snareRaw = parseFloat(
      document.documentElement.style.getPropertyValue('--dj-snare-energy') || '0'
    );
    this.uniforms.uAudioSnare.value += (snareRaw - this.uniforms.uAudioSnare.value) * 0.15;

    // Read energy phase
    const phaseMap = { warmup: 0, buildup: 1, peak: 2, cooldown: 3 };
    if (window.autoDJAesthetic && window.autoDJAesthetic.energyPhase) {
      this.uniforms.uEnergyPhase.value = phaseMap[window.autoDJAesthetic.energyPhase] || 0;
    }

    // Decay scroll velocity
    this.uniforms.uScrollVelocity.value *= 0.92;

    this.uniforms.uTime.value = this.clock.getElapsedTime();

    // ── Pass 1: Fluid → rtFluid ──
    this.renderer.setRenderTarget(this.rtFluid);
    this.renderer.clear();
    this.renderer.render(this.fluidScene, this.camera);

    // ── Pass 2: Post-FX → rtPostFX ──
    this.postFXUniforms.uTexture.value = this.rtFluid.texture;
    this.renderer.setRenderTarget(this.rtPostFX);
    this.renderer.clear();
    this.renderer.render(this.postFXScene, this.camera);

    // ── Pass 3: Composite → screen ──
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.compositeScene, this.sceneCamera);

    if (this.textShader) {
      this.textShader.update(
        this.uniforms.uTime.value,
        { x: this.mouseX || 0.5, y: this.mouseY || 0.5 }
      );
    }

    requestAnimationFrame(this.render.bind(this));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof THREE !== 'undefined') {
    window.webglFluidSystem = new WebGLFluidSystem();
  }
});
