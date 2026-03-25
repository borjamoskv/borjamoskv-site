class WebGLFluidSystem {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    if (!this.canvas) return;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.bgScene = new THREE.Scene();
    
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    this.sceneCamera = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 0, 1000);
    this.sceneCamera.position.z = 100;

    this.target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });

    this.uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uAudioFreq: { value: 0 },
      uScrollVelocity: { value: 0 }
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    
    // Shader with Simplex Noise and Fluid-like distortion, Sovereign 200 optimized
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform float uAudioFreq;
        uniform float uScrollVelocity;

        // Simplex 2D noise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                   -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
            dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
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
          vec2 st = gl_FragCoord.xy / uResolution.xy;
          st.x *= uResolution.x / uResolution.y;

          vec2 mouse = uMouse.xy / uResolution.xy;
          mouse.x *= uResolution.x / uResolution.y;

          // Base distortion
          vec2 p = st * 3.0; // scale
          
          // Audio impact
          float bass = uAudioFreq * 2.0; 
          
          // Flow speed
          float t = uTime * 0.2 + uScrollVelocity * 0.01;

          // Apply simplex noise to coordinates
          float noiseVal = snoise(p + t);
          float dist = distance(st, mouse);
          
          // Mouse repulsion mixed with audio
          float interaction = smoothstep(0.5, 0.0, dist) * (0.5 + bass);
          noiseVal += interaction;

          // Edge glow & darkness map
          vec3 color1 = vec3(0.0, 0.0, 0.0); // Industrial Noir Base
          vec3 color2 = vec3(0.8, 1.0, 0.0); // Cyber Lime Accent (#ccff00)
          
          float mixVal = smoothstep(0.1, 0.9, snoise(st * 4.0 - t * 0.5 + noiseVal));
          mixVal *= (bass + 0.1); // Brightness pulses with bass
          mixVal += interaction * 0.5;
          
          vec3 finalColor = mix(color1, color2, clamp(mixVal, 0.0, 1.0));
          
          // Extremely subtle alpha so it lives *beneath* the design
          gl_FragColor = vec4(finalColor, clamp(mixVal * 0.3, 0.0, 0.3));
        }
      `,
      transparent: true,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.bgScene.add(this.mesh);

    // Screen display mesh for the composite scene
    const compositeMaterial = new THREE.MeshBasicMaterial({ map: this.target.texture });
    // Match the screen size in the orthographic camera
    const compositeGeo = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    this.compositeMesh = new THREE.Mesh(compositeGeo, compositeMaterial);
    this.compositeMesh.position.z = -10; // behind everything
    this.scene.add(this.compositeMesh);

    if (typeof TypographicRaymarching !== 'undefined') {
        this.textShader = new TypographicRaymarching(this.scene, this.sceneCamera, () => this.target.texture);
    }

    this.bindEvents();
    this.clock = new THREE.Clock();
    this.render();
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.target.setSize(window.innerWidth, window.innerHeight);
      this.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      
      this.sceneCamera.left = -window.innerWidth / 2;
      this.sceneCamera.right = window.innerWidth / 2;
      this.sceneCamera.top = window.innerHeight / 2;
      this.sceneCamera.bottom = -window.innerHeight / 2;
      this.sceneCamera.updateProjectionMatrix();

      if (this.compositeMesh) {
         this.compositeMesh.geometry.dispose();
         this.compositeMesh.geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
      }
    });

    window.addEventListener('mousemove', (e) => {
      this.uniforms.uMouse.value.set(e.clientX, window.innerHeight - e.clientY);
      this.mouseX = e.clientX / window.innerWidth;
      this.mouseY = 1.0 - (e.clientY / window.innerHeight);
    });

    // We can get scroll velocity from lenis if it's available, otherwise fallback
    if (window.lenis) {
      window.lenis.on('scroll', (e) => {
        this.uniforms.uScrollVelocity.value = e.velocity || 0;
      });
    }
  }

  render() {
    // Read audio frequency from AutoDJ engine
    if (window.autoDJAesthetic && typeof window.autoDJAesthetic.getLowFrequencyData === 'function') {
        const bass = window.autoDJAesthetic.getLowFrequencyData();
        // Smooth transition
        this.uniforms.uAudioFreq.value += (bass - this.uniforms.uAudioFreq.value) * 0.1;
    } else {
        this.uniforms.uAudioFreq.value *= 0.95; // Decay
    }

    // Decay scroll velocity slightly per frame if not moving to avoid static distortion
    this.uniforms.uScrollVelocity.value *= 0.9;

    this.uniforms.uTime.value = this.clock.getElapsedTime();
    
    // Pass 1: Render background fluid to render target
    this.renderer.setRenderTarget(this.target);
    this.renderer.clear();
    this.renderer.render(this.bgScene, this.camera);

    // Pass 2: Render composite (bg + refracted text) to screen
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.sceneCamera);

    if (this.textShader) {
       this.textShader.update(this.uniforms.uTime.value, { x: this.mouseX || 0.5, y: this.mouseY || 0.5 });
    }

    requestAnimationFrame(this.render.bind(this));
  }
}

document.addEventListener("DOMContentLoaded", () => {
    // Init WebGL System when THREE is available
    if (typeof THREE !== 'undefined') {
        window.webglFluidSystem = new WebGLFluidSystem();
    }
});
