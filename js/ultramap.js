// ═══════════════════════════════════════════════════════════════════════════
// ULTRAMAP-Ω REAL-TIME TOPOLOGY SIMULATOR (10,000 DAEMONS)
// ═══════════════════════════════════════════════════════════════════════════

class UltramapSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Core parameters
    this.capacity = 10000;
    this.agents = [];
    this.mode = 'swarm'; // 'swarm' or 'mafia'
    
    // 3D rotation angles
    this.angleX = 0.2;
    this.angleY = -0.5;
    
    // Interactive mouse state
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    // Volumetric hormone wave propagation active list
    this.waves = []; // { x, y, z, type: 'dopamine'|'cortisol', radius, maxRadius, force }
    
    // Telemetry variables
    this.totalJoules = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    
    // Bind interaction event listeners
    this.initEvents();
    
    // Populate agents
    this.generateAgents();
    
    // Boot message
    this.logTerminal("BOOT: Mapeado de 10,000 agentes en sustrato de 1.28 MB completado.");
    this.logTerminal("SYS: Correlación vectorial establecida. Exergía base calibrada.");
    
    // Start animation loop
    this.lastTime = performance.now();
    this.animate();
  }
  
  generateAgents() {
    this.agents = [];
    const numMafia = 1200; // Nucleus size
    
    for (let i = 0; i < this.capacity; i++) {
      let x, y, z, isMafia = false;
      let entropy = 0.1 + Math.random() * 0.9;
      
      if (i < numMafia) {
        // Mafia Core: Densely clustered in an outer ring structure with a core hub
        isMafia = true;
        const angle = (i / numMafia) * Math.PI * 2;
        const radius = 50 + Math.random() * 20 + Math.sin(angle * 5) * 8;
        x = Math.cos(angle) * radius;
        y = (Math.random() - 0.5) * 15;
        z = Math.sin(angle) * radius;
        entropy = 0.05 + Math.random() * 0.15; // Low stable entropy
      } else {
        // Organic Control: Dispersed spherical cloud of high entropy
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = 80 + Math.random() * 150;
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta);
        z = radius * Math.cos(phi);
      }
      
      this.agents.push({
        id: i,
        x: x,
        y: y,
        z: z,
        baseX: x,
        baseY: y,
        baseZ: z,
        vx: 0,
        vy: 0,
        vz: 0,
        entropy: entropy,
        dopamine: isMafia ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3,
        cortisol: isMafia ? 0.05 + Math.random() * 0.1 : Math.random() * 0.4,
        isMafia: isMafia,
        // Cached 2D projection coordinates
        px: 0,
        py: 0,
        pz: 0,
        pscale: 0,
        visible: false
      });
    }
  }
  
  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });
    
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.lastMouseX;
      const deltaY = e.clientY - this.lastMouseY;
      
      this.angleY += deltaX * 0.005;
      this.angleX += deltaY * 0.005;
      
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });
    
    // Canvas click to inject hormone
    this.canvas.addEventListener('click', (e) => {
      if (this.isDragging && Math.abs(e.clientX - this.lastMouseX) > 2) return;
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Find the closest agent to click
      let closestAgent = null;
      let minDist = 40; // Click threshold distance
      
      for (const agent of this.agents) {
        if (!agent.visible) continue;
        const dx = agent.px - clickX;
        const dy = agent.py - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          closestAgent = agent;
        }
      }
      
      // Inject wave from click position or closest agent
      if (closestAgent) {
        const type = Math.random() > 0.5 ? 'dopamine' : 'cortisol';
        this.triggerEndocrinePulse(closestAgent.baseX, closestAgent.baseY, closestAgent.baseZ, type);
      } else {
        // Fallback: project screen coordinates to 3D center plane
        const scale = 400 / 400; // Simplified scale
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const rx = (clickX - cx) / scale;
        const ry = (clickY - cy) / scale;
        
        this.triggerEndocrinePulse(rx, ry, 0, Math.random() > 0.5 ? 'dopamine' : 'cortisol');
      }
    });
    
    // Button actions
    document.getElementById('view-mode-btn').addEventListener('click', () => {
      this.mode = 'swarm';
      document.getElementById('view-mode-btn').classList.add('active-mode');
      document.getElementById('view-network-btn').classList.remove('active-mode');
      this.logTerminal("SYS: Modo de visualización cambiado a Topología Swarm K-0.");
    });
    
    document.getElementById('view-network-btn').addEventListener('click', () => {
      this.mode = 'mafia';
      document.getElementById('view-network-btn').classList.add('active-mode');
      document.getElementById('view-mode-btn').classList.remove('active-mode');
      this.logTerminal("SYS: Modo de visualización cambiado a Red de Recomendación.");
    });
    
    document.getElementById('inject-dopamine-btn').addEventListener('click', () => {
      this.triggerEndocrinePulse(0, 0, 0, 'dopamine');
    });
    
    document.getElementById('inject-cortisol-btn').addEventListener('click', () => {
      this.triggerEndocrinePulse(0, 0, 0, 'cortisol');
    });
  }
  
  triggerEndocrinePulse(x, y, z, type) {
    this.waves.push({
      x: x,
      y: y,
      z: z,
      type: type,
      radius: 0,
      maxRadius: 220,
      speed: 4.5,
      force: 0.8
    });
    
    const color = type === 'dopamine' ? 'Dopamina (#00f3ff)' : 'Cortisol (#ff3355)';
    this.logTerminal(`PULSO: Señal volumétrica de ${color} inyectada en [X:${x.toFixed(1)}, Y:${y.toFixed(1)}, Z:${z.toFixed(1)}]`);
  }
  
  logTerminal(message) {
    const logEl = document.getElementById('telemetry-log');
    if (!logEl) return;
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const line = document.createElement('div');
    line.textContent = `[${timeStr}] ${message}`;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
    
    // Limit lines to 15
    while (logEl.children.length > 15) {
      logEl.removeChild(logEl.firstChild);
    }
  }
  
  updateTelemetry(avgEntropy) {
    // Dynamic values update
    document.getElementById('t-entropy').textContent = `${avgEntropy.toFixed(3)} S`;
    document.getElementById('t-exergy').textContent = `${this.totalJoules.toFixed(2)} J`;
    document.getElementById('t-fps').textContent = `${this.fps} FPS`;
    
    // Simulate minor latency jitter
    const latency = 1.5 + Math.random() * 0.8;
    document.getElementById('t-latency').textContent = `${latency.toFixed(1)} μs`;
    
    // Graph density
    document.getElementById('t-density').textContent = this.mode === 'mafia' ? '84.6% (Core)' : '14.2% (Swarm)';
  }
  
  animate() {
    const now = performance.now();
    const dt = (now - this.lastTime) / 16.666; // Normalize to 60fps
    this.lastTime = now;
    
    // Calculate FPS
    this.frameCount++;
    if (now - this.lastFpsUpdate >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
    
    // Process Waves
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const wave = this.waves[i];
      wave.radius += wave.speed * dt;
      if (wave.radius > wave.maxRadius) {
        this.waves.splice(i, 1);
      }
    }
    
    // Clear canvas
    this.ctx.fillStyle = '#050505';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw background radar lines
    this.drawHUDGrid();
    
    // 3D coordinates system constants
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const fov = 400;
    
    // Pre-calculate rotation matrices
    const cosX = Math.cos(this.angleX);
    const sinX = Math.sin(this.angleX);
    const cosY = Math.cos(this.angleY);
    const sinY = Math.sin(this.angleY);
    
    let sumEntropy = 0;
    
    // Project agents & apply dynamics
    for (let i = 0; i < this.capacity; i++) {
      const agent = this.agents[i];
      
      // Apply hormone wave interactions
      let targetEntropy = agent.isMafia ? 0.08 : 0.45;
      let forceX = 0, forceY = 0, forceZ = 0;
      
      for (const wave of this.waves) {
        const dx = agent.x - wave.x;
        const dy = agent.y - wave.y;
        const dz = agent.z - wave.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        // Check if wave is hitting the agent
        const thickness = 10;
        if (dist >= wave.radius - thickness && dist <= wave.radius + thickness) {
          const intensity = 1.0 - (dist / wave.maxRadius);
          
          if (wave.type === 'dopamine') {
            // Dopamine coordinates sync (pull towards core + alignment)
            agent.dopamine = Math.min(1.0, agent.dopamine + 0.15 * intensity);
            agent.cortisol = Math.max(0.0, agent.cortisol - 0.1 * intensity);
            
            // Attract towards center of pulse
            forceX += (wave.x - agent.x) * 0.05 * intensity;
            forceY += (wave.y - agent.y) * 0.05 * intensity;
            forceZ += (wave.z - agent.z) * 0.05 * intensity;
            
            targetEntropy = 0.02; // Dopamine locks state
          } else {
            // Cortisol coordinates disorder (repel + high entropy vibration)
            agent.cortisol = Math.min(1.0, agent.cortisol + 0.2 * intensity);
            agent.dopamine = Math.max(0.0, agent.dopamine - 0.15 * intensity);
            
            // Random vibration repelled outwards
            const angle = Math.random() * Math.PI * 2;
            forceX += (dx / (dist + 0.1)) * 15 * intensity + (Math.random() - 0.5) * 8 * intensity;
            forceY += (dy / (dist + 0.1)) * 15 * intensity + (Math.random() - 0.5) * 8 * intensity;
            forceZ += (dz / (dist + 0.1)) * 15 * intensity + (Math.random() - 0.5) * 8 * intensity;
            
            targetEntropy = 0.95; // Cortisol excites entropy
          }
          
          // Accumulate exergy cost
          this.totalJoules += (dist * 0.001) / (agent.entropy + 0.01);
        }
      }
      
      // Interpolate agent entropy towards target
      agent.entropy += (targetEntropy - agent.entropy) * 0.05 * dt;
      sumEntropy += agent.entropy;
      
      // Dynamics towards stable coordinates (spring force)
      const k = 0.015 / (agent.entropy + 0.01);
      const rx = (agent.baseX - agent.x) * k + forceX;
      const ry = (agent.baseY - agent.y) * k + forceY;
      const rz = (agent.baseZ - agent.z) * k + forceZ;
      
      // Physics step
      const friction = 0.85;
      agent.vx = (agent.vx + rx) * friction;
      agent.vy = (agent.vy + ry) * friction;
      agent.vz = (agent.vz + rz) * friction;
      
      agent.x += agent.vx * dt;
      agent.y += agent.vy * dt;
      agent.z += agent.vz * dt;
      
      // 3D Matrix Multiplication
      // Y-axis rotation (angleY)
      const rY_x = agent.x * cosY - agent.z * sinY;
      const rY_z = agent.x * sinY + agent.z * cosY;
      
      // X-axis rotation (angleX)
      const rX_y = agent.y * cosX - rY_z * sinX;
      const rX_z = agent.y * sinX + rY_z * cosX;
      
      // Perspective projection
      const depth = rX_z + 300; // zOffset
      if (depth > 10) {
        const scale = fov / depth;
        agent.px = cx + rY_x * scale;
        agent.py = cy + rX_y * scale;
        agent.pz = depth;
        agent.pscale = scale;
        agent.visible = agent.px >= 0 && agent.px <= this.canvas.width && agent.py >= 0 && agent.py <= this.canvas.height;
      } else {
        agent.visible = false;
      }
    }
    
    // Sort agents by depth (Back-to-Front painter algorithm)
    const renderList = this.agents.filter(a => a.visible).sort((a, b) => b.pz - a.pz);
    
    // Draw edges if in Mafia Mode (Draw connections between core mafia)
    if (this.mode === 'mafia') {
      this.drawMafiaEdges(renderList);
    }
    
    // Draw agents (nodes)
    const drawLength = renderList.length;
    for (let i = 0; i < drawLength; i++) {
      const a = renderList[i];
      const size = Math.max(0.5, a.pscale * 1.5);
      
      // Color determined by endocrine state
      let color;
      if (a.cortisol > 0.3) {
        color = `rgba(255, 51, 85, ${0.3 + a.cortisol * 0.7})`; // Cortisol Red
      } else if (a.dopamine > 0.5) {
        color = `rgba(0, 243, 255, ${0.3 + a.dopamine * 0.7})`; // Dopamine Blue
      } else {
        // Base state
        if (a.isMafia) {
          color = 'rgba(43, 59, 229, 0.6)'; // YInMn Blue for Mafia Base
        } else {
          color = 'rgba(255, 255, 255, 0.15)'; // Gray/White for Control Group
        }
      }
      
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(a.px, a.py, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Draw volumetric waves in 3D projection
    this.drawEndocrineWaves(cosX, sinX, cosY, sinY, cx, cy, fov);
    
    // Update Telemetry Panel
    this.updateTelemetry(sumEntropy / this.capacity);
    
    requestAnimationFrame(() => this.animate());
  }
  
  drawMafiaEdges(projectedAgents) {
    // Only connect mafia nodes that are close to keep 60fps
    const len = projectedAgents.length;
    this.ctx.strokeStyle = 'rgba(43, 59, 229, 0.035)'; // Faint YInMn Blue
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    
    // Sub-sample to avoid O(N^2) complexity over 10,000 nodes
    const sampleStep = 8;
    for (let i = 0; i < len; i += sampleStep) {
      const a = projectedAgents[i];
      if (!a.isMafia) continue;
      
      let connections = 0;
      for (let j = i + 1; j < len; j += 4) {
        const b = projectedAgents[j];
        if (!b.isMafia) continue;
        
        const dx = a.px - b.px;
        const dy = a.py - b.py;
        const dist = dx * dx + dy * dy;
        
        if (dist < 1200) { // Connect if close
          this.ctx.moveTo(a.px, a.py);
          this.ctx.lineTo(b.px, b.py);
          connections++;
          if (connections > 4) break; // Limit connections per node
        }
      }
    }
    this.ctx.stroke();
  }
  
  drawEndocrineWaves(cosX, sinX, cosY, sinY, cx, cy, fov) {
    for (const wave of this.waves) {
      // Project wave center
      const rY_x = wave.x * cosY - wave.z * sinY;
      const rY_z = wave.x * sinY + wave.z * cosY;
      const rX_y = wave.y * cosX - rY_z * sinX;
      const rX_z = wave.y * sinX + rY_z * cosX;
      
      const depth = rX_z + 300;
      if (depth <= 10) continue;
      
      const scale = fov / depth;
      const wpx = cx + rY_x * scale;
      const wpy = cy + rX_y * scale;
      const wSize = wave.radius * scale * 0.6; // Scale wave radius
      
      if (wSize > 0) {
        const grad = this.ctx.createRadialGradient(wpx, wpy, 0, wpx, wpy, wSize);
        const waveColor = wave.type === 'dopamine' ? '0, 243, 255' : '255, 51, 85';
        
        grad.addColorStop(0, `rgba(${waveColor}, 0)`);
        grad.addColorStop(0.85, `rgba(${waveColor}, 0.05)`);
        grad.addColorStop(1, `rgba(${waveColor}, 0.15)`);
        
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(wpx, wpy, wSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Thin contour
        this.ctx.strokeStyle = `rgba(${waveColor}, 0.3)`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    }
  }
  
  drawHUDGrid() {
    this.ctx.strokeStyle = 'rgba(43, 59, 229, 0.04)';
    this.ctx.lineWidth = 1;
    
    // Draw concentric circles in center
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    this.ctx.arc(cx, cy, 200, 0, Math.PI * 2);
    this.ctx.arc(cx, cy, 300, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Crosshairs
    this.ctx.beginPath();
    this.ctx.moveTo(cx - 320, cy);
    this.ctx.lineTo(cx + 320, cy);
    this.ctx.moveTo(cx, cy - 220);
    this.ctx.lineTo(cx, cy + 220);
    this.ctx.stroke();
  }
}

// Auto bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.ultramapSim = new UltramapSimulator('ultramap-canvas');
});
