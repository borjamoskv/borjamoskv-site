// webgl.js — Industrial Noir 2026 Particle Field
// C5-REAL — Custom GLSL ShaderMaterial, noise-driven morphing, mouse repulsion
import * as THREE from 'three';

// ─── GLSL: 3D Simplex Noise (Ashima) ────────────────────────────────
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

// ─── Vertex Shader ───────────────────────────────────────────────────
const vertexShader = /* glsl */ `
${NOISE_GLSL}

uniform float uTime;
uniform vec2 uMouse;       // normalized -1..1
uniform float uScroll;     // 0..1
uniform float uPixelRatio;

attribute float aRandom;   // per-particle randomness seed

varying float vDepth;
varying float vRandom;

void main() {
  vec3 pos = position;

  // ── Noise-driven displacement (smoke/fog drift) ──
  float noiseScale = 0.35;
  float timeScale = 0.12;
  float t = uTime * timeScale;

  float nx = snoise(pos * noiseScale + vec3(t, 0.0, 0.0));
  float ny = snoise(pos * noiseScale + vec3(0.0, t, 0.0));
  float nz = snoise(pos * noiseScale + vec3(0.0, 0.0, t));

  // Layered octave for organic detail
  float nx2 = snoise(pos * noiseScale * 2.5 + vec3(t * 0.7, 1.3, 0.0)) * 0.3;
  float ny2 = snoise(pos * noiseScale * 2.5 + vec3(0.0, t * 0.7, 2.7)) * 0.3;

  pos += vec3(nx + nx2, ny + ny2, nz) * (0.6 + aRandom * 0.4);

  // ── Mouse repulsion ──
  // Project mouse into world-ish coords (centered, scaled to field)
  vec3 mouseWorld = vec3(uMouse.x * 8.0, uMouse.y * 5.0, 0.0);
  vec3 delta = pos - mouseWorld;
  float dist = length(delta);
  float repulse = smoothstep(3.5, 0.0, dist) * 1.8;
  pos += normalize(delta + 0.001) * repulse;

  // ── Scroll rotation (subtle Y + Z twist) ──
  float scrollAngle = uScroll * 1.2;
  float cs = cos(scrollAngle);
  float sn = sin(scrollAngle);
  pos.xz = mat2(cs, -sn, sn, cs) * pos.xz;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;

  // ── Size: depth-attenuated, 2-6px range ──
  float baseSize = mix(2.0, 6.0, aRandom);
  gl_PointSize = baseSize * uPixelRatio * (300.0 / -mvPos.z);
  gl_PointSize = clamp(gl_PointSize, 1.0, 8.0 * uPixelRatio);

  // ── Varyings ──
  vDepth = clamp(-mvPos.z / 25.0, 0.0, 1.0);   // 0=near, 1=far
  vRandom = aRandom;
}
`;

// ─── Fragment Shader ─────────────────────────────────────────────────
const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uScroll;

varying float vDepth;
varying float vRandom;

// HSL → RGB conversion
vec3 hsl2rgb(float h, float s, float l) {
  vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
}

void main() {
  // Soft circle (discard outside radius)
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  float r = dot(cxy, cxy);
  if (r > 1.0) discard;

  // Soft edge falloff
  float alpha = 1.0 - smoothstep(0.3, 1.0, r);

  // ── Color: organic HSL drift between #2B3BE5 (h≈0.635) and #ec4899 (h≈0.917) ──
  float hueBase = 0.635;
  float hueDrift = sin(uTime * 0.08 + vRandom * 6.2831) * 0.15;
  float hue = hueBase + hueDrift + vRandom * 0.08;

  // Warm accent blend driven by random + time
  float warmMix = smoothstep(0.7, 1.0, vRandom + sin(uTime * 0.05) * 0.15);
  hue = mix(hue, 0.917, warmMix * 0.6);

  float sat = mix(0.7, 0.9, vRandom);
  float lit = mix(0.45, 0.6, 1.0 - vDepth);

  vec3 color = hsl2rgb(hue, sat, lit);

  // ── Depth-based alpha: far = more transparent ──
  float depthAlpha = mix(0.85, 0.08, vDepth);

  // ── Scroll opacity shift ──
  float scrollFade = mix(1.0, 0.6, uScroll);

  float finalAlpha = alpha * depthAlpha * scrollFade;

  gl_FragColor = vec4(color, finalAlpha);
}
`;

// ─── Constants ───────────────────────────────────────────────────────
const PARTICLE_COUNT = 10000;
const SPREAD = 16;
const LERP_RATE = 0.04;

// ─── State ───────────────────────────────────────────────────────────
let _cleanup = null;

export function initWebGL() {
  const canvas = document.querySelector('#cortex-bg');
  if (!canvas) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  const maxDPR = isMobile ? 1.5 : 2.0;

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDPR));
  renderer.setClearColor(0x000000, 0);

  const pixelRatio = renderer.getPixelRatio();

  // ── Scene + Camera ──
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 12;

  // ── Geometry: positions + per-particle random seed ──
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const randoms = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD;
    randoms[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

  // ── Uniforms ──
  const uniforms = {
    uTime:       { value: 0 },
    uMouse:      { value: new THREE.Vector2(0, 0) },
    uScroll:     { value: 0 },
    uPixelRatio: { value: pixelRatio },
  };

  // ── Material ──
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // ── Mouse tracking (smooth lerp) ──
  let mouseTarget = { x: 0, y: 0 };
  let mouseCurrent = { x: 0, y: 0 };

  const onMouseMove = (e) => {
    mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // ── Touch support ──
  const onTouchMove = (e) => {
    if (!e.touches.length) return;
    mouseTarget.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouseTarget.y = -((e.touches[0].clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  // ── Scroll tracking ──
  let scrollTarget = 0;
  let scrollCurrent = 0;

  const onScroll = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollTarget = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Resize ──
  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    const mobile = w < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2.0));
    uniforms.uPixelRatio.value = renderer.getPixelRatio();
  };
  window.addEventListener('resize', onResize, { passive: true });

  // ── Reduced motion: single static frame ──
  if (reducedMotion) {
    uniforms.uTime.value = 5.0; // seed noise at a nice state
    renderer.render(scene, camera);
    _cleanup = createCleanup(renderer, geometry, material, [
      ['mousemove', onMouseMove],
      ['touchmove', onTouchMove],
      ['scroll', onScroll],
      ['resize', onResize],
    ]);
    return;
  }

  // ── Animation loop with delta-time ──
  let animId = 0;
  let lastTime = 0;
  let paused = false;

  const tick = (timestamp) => {
    if (paused) { animId = requestAnimationFrame(tick); return; }

    const delta = lastTime ? (timestamp - lastTime) * 0.001 : 0.016;
    lastTime = timestamp;

    // Clamp delta to avoid jumps after tab-switch
    const dt = Math.min(delta, 0.1);

    // Advance time
    uniforms.uTime.value += dt;

    // Smooth lerp mouse
    mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * LERP_RATE;
    mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * LERP_RATE;
    uniforms.uMouse.value.set(mouseCurrent.x, mouseCurrent.y);

    // Smooth lerp scroll
    scrollCurrent += (scrollTarget - scrollCurrent) * LERP_RATE;
    uniforms.uScroll.value = scrollCurrent;

    renderer.render(scene, camera);
    animId = requestAnimationFrame(tick);
  };

  animId = requestAnimationFrame(tick);

  // ── Visibility: pause when tab hidden ──
  const onVisibility = () => {
    paused = document.hidden;
    if (!paused) lastTime = 0; // reset delta to avoid time jump
  };
  document.addEventListener('visibilitychange', onVisibility);

  // ── Cleanup ──
  _cleanup = createCleanup(renderer, geometry, material, [
    ['mousemove', onMouseMove],
    ['touchmove', onTouchMove],
    ['scroll', onScroll],
    ['resize', onResize],
  ], () => {
    cancelAnimationFrame(animId);
    document.removeEventListener('visibilitychange', onVisibility);
  });
}

function createCleanup(renderer, geometry, material, windowListeners, extraFn) {
  return () => {
    for (const [evt, fn] of windowListeners) {
      window.removeEventListener(evt, fn);
    }
    if (extraFn) extraFn();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}

/** Call on SPA navigation to release GPU resources */
export function destroyWebGL() {
  if (_cleanup) { _cleanup(); _cleanup = null; }
}

// ── Auto-init ──
initWebGL();
