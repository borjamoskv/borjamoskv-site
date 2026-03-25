class TypographicRaymarching {
    constructor(scene, camera, getBgTexture) {
      this.scene = scene;
      this.camera = camera;
      this.getBgTexture = getBgTexture;
      this.mesh = null;
      this.material = null;
      
      this.uniforms = {
        uMsdfAtlas: { value: null },
        uBackground: { value: null },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) }
      };
      
      this.init();
    }
  
    async init() {
      // 1. Fetch MSDF atlas and JSON
      const fontData = await fetch('fonts/Arial-Bold.json').then(r => r.json());
      const textureLoader = new THREE.TextureLoader();
      const atlas = await new Promise(res => textureLoader.load('fonts/Arial-MSDF.png', res));
      
      // We need linear filtering for MSDF borders
      atlas.minFilter = THREE.LinearFilter;
      atlas.magFilter = THREE.LinearFilter;
      atlas.generateMipmaps = false;
  
      this.uniforms.uMsdfAtlas.value = atlas;
  
      const text = "BORJA\nMOSKV";
      const geometry = this.createTextGeometry(text, fontData);
      
      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          #define MAX_STEPS 100
          #define SURF_DIST 0.001
          #define MAX_DIST 10.0
  
          uniform sampler2D uMsdfAtlas;
          uniform sampler2D uBackground;
          uniform float uTime;
          uniform vec2 uResolution;
          uniform vec2 uMouse;
  
          varying vec2 vUv;
  
          float median(float r, float g, float b) {
              return max(min(r, g), min(max(r, g), b));
          }
  
          float getSdfEntity(vec2 uv) {
              vec3 msdf = texture2D(uMsdfAtlas, uv).rgb;
              float sigDist = median(msdf.r, msdf.g, msdf.b) - 0.5;
              return sigDist;
          }
  
          vec2 getSdfNormal(vec2 uv) {
              vec2 e = vec2(0.002, 0.0);
              
              vec2 n = vec2(
                  getSdfEntity(uv + e.xy) - getSdfEntity(uv - e.xy),
                  getSdfEntity(uv + e.yx) - getSdfEntity(uv - e.yx)
              );
              return normalize(n);
          }
  
          void main() {
              float sigDist = getSdfEntity(vUv);
              // distance < 0 is outside, distance > 0 is inside
              float inside = smoothstep(-0.02, 0.02, sigDist);
              // discard if fully outside to save blending and render time
              if (inside <= 0.01) discard;
  
              vec2 normal2D = getSdfNormal(vUv);
              
              // IOR of typical glass
              float ior = 1.15;
              
              // Screen coordinates for sampling the background behind the text
              vec2 screenUv = gl_FragCoord.xy / uResolution;
              
              // Optical refraction vector
              // Move sample UV based on the normal of the letter's edge
              vec2 refractedUv = screenUv - (normal2D * 0.05 * ior * inside);
              
              // Ensure we don't sample outside the buffer
              refractedUv = clamp(refractedUv, 0.0, 1.0);
              
              vec4 bgColor = texture2D(uBackground, refractedUv);
              
              // Glass tint (Industrial Noir - Dark metalish smoke)
              vec3 glassTint = vec3(0.05, 0.05, 0.05); // slightly lifts blacks
              
              // Fresnel reflection on edges
              float fresnel = pow(1.0 - smoothstep(0.0, 0.3, sigDist), 2.0);
              vec3 fresnelLuster = vec3(0.5, 0.6, 0.1) * fresnel * 0.8; // Cyber Lime reflection hint
              
              vec3 finalColor = bgColor.rgb + glassTint + fresnelLuster;
              
              gl_FragColor = vec4(finalColor, inside);
          }
        `,
        transparent: true,
        depthWrite: false,
      });
  
      this.mesh = new THREE.Mesh(geometry, this.material);
      
      // Position logic
      // BMFont pixels: if width is ~512, let's scale it so it fills 80% of width up to max
      const scaleVal = Math.min(window.innerWidth / 800 * 3.0, 5.0);
      this.mesh.scale.set(scaleVal, -scaleVal, scaleVal); 
      
      // Center vertically based on scale
      this.mesh.position.set(0, scaleVal * 40, 0); // 40 is roughly half the line height
  
      this.scene.add(this.mesh);
  
      window.addEventListener('resize', () => {
        this.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      });
    }
  
    createTextGeometry(text, font) {
      const chars = font.chars.reduce((acc, c) => {
        acc[String.fromCharCode(c.id)] = c;
        return acc;
      }, {});
  
      const positions = [];
      const uvs = [];
      const indices = [];
  
      let cursorX = 0;
      let cursorY = 0;
      const lineHeight = font.common ? font.common.lineHeight : 45; // Arial usually 45
      const texW = font.common ? font.common.scaleW : 512;
      const texH = font.common ? font.common.scaleH : 512;
  
      let indexOffset = 0;
  
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '\n') {
          cursorY += lineHeight;
          cursorX = 0;
          continue;
        }
  
        const glyph = chars[char];
        if (!glyph) {
          cursorX += 20; // unknown char space
          continue;
        }
  
        const x = cursorX + glyph.xoffset;
        const y = cursorY + glyph.yoffset;
        const w = glyph.width;
        const h = glyph.height;
  
        // positions (Z=0)
        positions.push(
          x, y, 0,
          x + w, y, 0,
          x + w, y + h, 0,
          x, y + h, 0
        );
  
        // uvs
        const u0 = glyph.x / texW;
        const v0 = 1.0 - (glyph.y / texH);
        const u1 = (glyph.x + w) / texW;
        const v1 = 1.0 - ((glyph.y + h) / texH);
  
        uvs.push(
          u0, v0,
          u1, v0,
          u1, v1,
          u0, v1
        );
  
        // indices for 2 triangles
        indices.push(
          indexOffset, indexOffset + 2, indexOffset + 1,
          indexOffset, indexOffset + 3, indexOffset + 2
        );
  
        indexOffset += 4;
        cursorX += glyph.xadvance;
      }
  
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      
      geometry.computeBoundingBox();
      
      // Center geometry around origin X
      const boxW = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      const boxH = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
      
      const centerOffsetX = -0.5 * boxW;
      const centerOffsetY = -0.5 * boxH;
      geometry.translate(centerOffsetX, centerOffsetY, 0);
  
      return geometry;
    }
  
    update(time, mouse) {
      if (this.material) {
        this.uniforms.uTime.value = time;
        // Always grab the latest texture reference from the factory
        this.uniforms.uBackground.value = this.getBgTexture();
        if (mouse) {
          this.uniforms.uMouse.value.set(mouse.x, mouse.y);
        }
      }
    }
  }
  
  window.TypographicRaymarching = TypographicRaymarching;
