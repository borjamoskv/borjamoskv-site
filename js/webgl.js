import * as THREE from 'three';

export function initWebGL() {
  const canvas = document.querySelector('#cortex-bg');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0a, 0.05);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Industrial Noir 2026 aesthetics
  const material = new THREE.PointsMaterial({
    color: 0x2b3be5,
    size: 0.05,
    transparent: true,
    opacity: 0.6,
  });

  const geometry = new THREE.BufferGeometry();
  const points = [];
  
  for (let i = 0; i < 5000; i++) {
    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 20;
    const z = (Math.random() - 0.5) * 20;
    points.push(x, y, z);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  camera.position.z = 5;

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    
    particles.rotation.y += 0.002 + (targetX - particles.rotation.y) * 0.05;
    particles.rotation.x += 0.001 + (targetY - particles.rotation.x) * 0.05;
    
    // Slow drift
    particles.position.z = Math.sin(Date.now() * 0.0005) * 2;

    renderer.render(scene, camera);
  }

  animate();
}

initWebGL();
