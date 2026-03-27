/**
 * ═══════════════════════════════════════════════════════════════════
 * CORTEX TERMINAL
 * Sovereign Industrial Noir v5.0 — YOLO ULTRATHINK UPGRADE + FRONTERA X10
 * Matrix Canvas Background, Synth Audio TTY, Deep Think CLI
 * ═══════════════════════════════════════════════════════════════════
 */

class CortexTerminal {
  constructor() {
    this.isActive = false;
    this.hasBooted = sessionStorage.getItem('cortex_term_booted') === 'true';
    this.history = JSON.parse(sessionStorage.getItem('cortex_term_history') || '[]');
    this.historyIndex = this.history.length;
    this.overlay = null;
    this.output = null;
    this.input = null;
    this.caret = null;
    this.canvas = null;
    this.ctx = null;
    this.isPrinting = false;
    
    // Canvas Matrix Vars
    this.columns = [];
    this.fontSize = 16;
    this.animationFrameId = null;

    // Audio Context
    this.audioCtx = null;

    // --- CORTEX API Bridge ---
    this.apiBase = window.CORTEX_API_URL || 'http://127.0.0.1:8321';
    this._snapshotCache = null;
    this._snapshotCacheTs = 0;
    this._SNAPSHOT_TTL = 10000; // 10s client-side cache
    
    // Swarm-100 Kinetic Tensor x10 Core
    this.tensor = new KineticTensorEngine(document.body);

    this.commands = {
      'help': () => this.cmdHelp(),
      'status': () => this.cmdStatus(),
      'play': (args) => this.cmdPlay(args),
      'clear': () => { this.output.innerHTML = ''; return ''; },
      'whoami': () => 'Entidad clasificada: GUEST_01. Nivel de acceso: RESTRINGIDO.',
      'sudo': () => '<span class="cterm-err">Acceso denegado. CORTEX Immune alertado. Escalando...</span>',
      'gambitero': () => this.cmdGambitero(),
      'map': () => this.cmdMap(),
      'awwwards': () => this.cmdAwwwards(),
      'nexus': () => this.cmdNexus(),
      'cortexfetch': () => this.cmdCortexFetch(),
      'ledger': () => this.cmdLedger(),
      'ultrathink': () => this.cmdUltrathink(),
      'swarm': () => this.cmdSwarm(),
      'yolo': () => this.cmdUltrathink(),
      'yolothink': () => this.cmdUltrathink(),
      'deepthink': () => this.cmdUltrathink(),
      'deepresearch': () => this.cmdResearch(),
      'research': () => this.cmdResearch(),
      'maccontrol': () => this.cmdMacControl(),
      'superyolo': () => this.cmdSuperYOLO(),
      'superyoloespecial': () => this.cmdSuperYOLOESPECIAL(),
      'superyoloepecial': () => this.cmdSuperYOLOESPECIAL(), // Soporte para typo del usuario
      'thermo': () => this.cmdThermo(),
      'entropy': () => this.cmdEntropy(),
      'purge': () => this.cmdPurge(),
      'funding': () => this.cmdFunding(),
      'survival': () => this.cmdSurvival(),
      'pitch': () => this.cmdPitch(),
      'jit': () => this.cmdJIT(),
      'shards': () => this.cmdShards(),
      'audit': () => this.cmdAudit(),
      'verify': () => this.cmdVerify(),
      'memory': () => this.cmdMemory(),
      'singularity': () => this.cmdSingularity(),
      'x100': () => this.cmdSingularity()
    };
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'cortex-terminal-overlay';
    this.overlay.innerHTML = `
      <canvas id="cortex-canvas-bg"></canvas>
      <div id="cortex-terminal-swarm-container"></div>
      <div id="cortex-terminal-content">
        <div id="cortex-terminal-output"></div>
        <div class="cortex-terminal-input-line">
          <span id="cortex-terminal-prompt">CORTEX@moskv:~#</span>
          <div id="cortex-terminal-input-wrapper">
            <input type="text" id="cortex-terminal-input" autocomplete="off" spellcheck="false" maxlength="120">
            <span id="cortex-caret"></span>
          </div>
        </div>
      </div>
      <div class="cterm-sovereign-flash"></div>
      <div id="cterm-deep-think-layer"></div>
    `;
    document.body.appendChild(this.overlay);

    this.canvas = document.getElementById('cortex-canvas-bg');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.swarmContainer = document.getElementById('cortex-terminal-swarm-container');
    this.output = document.getElementById('cortex-terminal-output');
    this.input = document.getElementById('cortex-terminal-input');
    this.caret = document.getElementById('cortex-caret');
    this.flash = this.overlay.querySelector('.cterm-sovereign-flash');
    this.deepThinkLayer = document.getElementById('cterm-deep-think-layer');

    // KINETIC TENSOR INITIALIZATION
    this.tensor = new KineticTensorEngine(this.swarmContainer);

    // Canvas Resize Observer
    window.addEventListener('resize', () => {
       if(this.isActive) {
         this.resizeCanvas();
         this.tensor.onResize();
       }
    });

    this.input.addEventListener('input', () => this.updateCaret());
    this.input.addEventListener('keydown', () => setTimeout(() => this.updateCaret(), 10));

    // Focus
    this.overlay.addEventListener('click', () => {
      const isSelecting = window.getSelection().toString().length > 0;
      if (!isSelecting && this.isActive) {
        this.input.focus();
        this.initAudioContext();
      }
    });

    const navTerminalBtn = document.getElementById('terminal-trigger-nav');
    if (navTerminalBtn) {
      navTerminalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.initAudioContext();
        this.toggle();
      });
    }

    document.addEventListener('keydown', (e) => this.handleGlobalKey(e));
    this.input.addEventListener('keydown', (e) => this.handleInputKey(e));
    
    // SOVEREIGN IDLE INJECTION (Auto-YOLO)
    this.idleTimer = null;
    this.ultrathinkTriggered = false;
    
    const resetIdleTimer = () => {
      if (this.ultrathinkTriggered) return;
      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => {
        if (!this.ultrathinkTriggered) {
          this.ultrathinkTriggered = true;
          if (!this.isActive) this.toggle();
          this.printLine('<span class="cterm-warn">[CORTEX] Entropía crítica por inactividad. Autónoma toma de control.</span>');
          setTimeout(() => this.cmdUltrathink(), 2000);
        }
      }, 60000); // 60 sec inactivity triggers the void
    };

    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keydown', resetIdleTimer);
    document.addEventListener('scroll', resetIdleTimer);
    resetIdleTimer();
  }

  // --- KINETIC TENSOR ENGINE (THREE.JS CORE) ---

  // --- KINETIC TENSOR ENGINE (THREE.JS CORE) ---

  // ... (rest of methods)
}

/**
 * KINETIC TENSOR ENGINE v3.0 (VOID-STATE x10000)
 * 10,485,760 Sovereign Agents (10M).
 * Bit-Packed Buffers | Indirect GPU Orchestration | Perlin-TSL
 */
class KineticTensorEngine {
  constructor(container) {
    this.container = container;
    this.isActive = false;
    this.count = 524288; // 2^19 agents (~0.5M) for solid 60fps
    this.mouse = new THREE.Vector2();
    this.targetRotation = new THREE.Vector2(0.5, 0.2);
    this.currentRotation = new THREE.Vector2(0.5, 0.2);
    this.mouseVelocity = 0;
    this.lastMouse = new THREE.Vector2();
    
    this.init();
  }

  async init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    
    this.renderer = new THREE.WebGPURenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
    
    const material = new THREE.PointsNodeMaterial({ size: 0.015, transparent: true });
    this.points = new THREE.InstancedMesh(geometry, material, this.count);
    this.scene.add(this.points);

    const { storage, timer, float, vec3, instanceIndex, mul, sin, cos, hash, cond, mix, add } = THREE.TSL;

    // Bit-Packed Storage
    const stateBuffer = storage(new Uint32Array(this.count * 4), 'uvec4', this.count);
    this.targetBuffer = storage(new Float32Array(this.count * 3), 'vec3', this.count);
    
    // Mode UNIFORM (0=Swarm, 1=Crystallize, 2=Collapse)
    this.modeUniform = THREE.uniform(0);

    this.computeInit = THREE.compute((index) => {
      const state = stateBuffer.element(index);
      const target = this.targetBuffer.element(index);
      const seed = hash(index);
      
      state.xyz.assign(seed.mul(400).sub(200)); 
      state.w.assign(seed.x.mul(0.2)); 
      
      // Target for Crystallization (CORTEX Lattice)
      const side = float(1024);
      const x = index.remainder(side).sub(512).mul(0.1);
      const y = index.div(side).sub(512).mul(0.1);
      target.assign(vec3(x, y, 0));
    }, this.count);

    this.computeUpdate = THREE.compute((index) => {
      const state = stateBuffer.element(index);
      const pos = state.xyz;
      const target = this.targetBuffer.element(index);
      const time = timer();
      
      const swarmDrift = vec3(
        sin(time.add(pos.x.mul(0.05))),
        cos(time.add(pos.y.mul(0.05))),
        sin(time.add(pos.z.mul(0.05)))
      ).mul(0.1);
      
      const swarmNext = pos.add(swarmDrift).add(vec3(0, 0, state.w));
      const crystalNext = mix(pos, target, float(0.05));
      const collapseNext = mix(pos, vec3(0, 0, 0), float(0.1));

      pos.assign(cond(this.modeUniform.equal(0), swarmNext,
                 cond(this.modeUniform.equal(1), crystalNext, collapseNext)));
      
      // Wrap for Swarm mode
      pos.z.assign(cond(add(this.modeUniform.equal(0), pos.z.greaterThan(200)), -200, pos.z));
    }, this.count);

    material.positionNode = stateBuffer.element(instanceIndex).xyz;
    material.colorNode = mix(vec3(0.168, 0.231, 0.898), vec3(1, 1, 1), this.modeUniform); 
    material.opacityNode = float(0.3).add(sin(timer().mul(4)).mul(0.2));

    this.renderer.compute(this.computeInit);
    this.camera.position.z = 250;


    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.animate();
  }
  
  onMouseMove(e) {
    if (!this.isActive) return;
    this.mouse.x = (e.clientX / window.innerWidth) - 0.5;
    this.mouse.y = (e.clientY / window.innerHeight) - 0.5;
    
    this.targetRotation.x = this.mouse.y * 0.5;
    this.targetRotation.y = this.mouse.x * 0.5;
    
    const dx = Math.abs(e.clientX - this.lastMouse.x);
    const dy = Math.abs(e.clientY - this.lastMouse.y);
    this.mouseVelocity = Math.min(1, (dx + dy) / 100);
    
    this.lastMouse.set(e.clientX, e.clientY);
  }

  activate() {
    this.isActive = true;
    this.container.style.opacity = '1';
    this.container.style.pointerEvents = 'auto';
    this.container.classList.add('void-state-active');
  }
  
  deactivate() {
    this.isActive = false;
    this.container.style.opacity = '0';
    this.container.style.pointerEvents = 'none';
    this.container.classList.remove('void-state-active');
  }

  pulse() {
    if (!this.isActive) return;
    if (typeof gsap !== 'undefined') {
      gsap.to(this.points.scale, { 
        x: 1.2, y: 1.2, z: 1.2, 
        duration: 0.1, 
        yoyo: true, 
        repeat: 1, 
        ease: "power2.out" 
      });
      // Kinetic energy burst
      this.mouseVelocity = 2.0;
    }
  }
  
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.isActive) return;
    
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.05;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.05;
    
    this.points.rotation.x = this.currentRotation.x;
    this.points.rotation.y = this.currentRotation.y;
    
    // Inertial velocity decay
    this.mouseVelocity *= 0.95;
    
    this.renderer.compute(this.computeUpdate);
    this.renderer.render(this.scene, this.camera);
  }
}  
  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playTypingBeep(duration = 0.015, freq = 300, type = 'square', pan = 0) {
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = type;
      // Slight randomization of frequency for mechanical tape feel
      osc.frequency.setValueAtTime(freq + (Math.random() * 40 - 20), this.audioCtx.currentTime);

      // Lowpass filter for thicker, less piercing industrial sound
      filter.type = 'lowpass';
      filter.frequency.value = Math.min(freq * 2.5, 20000);

      gain.gain.setValueAtTime(0.02, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);

      if (typeof StereoPannerNode !== 'undefined') {
          const panner = this.audioCtx.createStereoPanner();
          panner.pan.value = pan;
          gain.connect(panner);
          panner.connect(this.audioCtx.destination);
      } else {
          gain.connect(this.audioCtx.destination);
      }

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch(e) {}
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    const cols = Math.floor(this.canvas.width / this.fontSize);
    this.columns = [];
    for (let i = 0; i < cols; i++) {
      this.columns[i] = Math.random() * this.canvas.height;
    }
    // Fill background black instantly to avoid white flash
    this.ctx.fillStyle = '#050505';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawMatrix() {
    if (!this.isActive) return;
    
    // Ghostly fade effect for trails
    this.ctx.fillStyle = 'rgba(5, 5, 5, 0.08)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // If x100 mode is active, randomize color occasionally
    if (this.canvasSpeedMultiplier > 20 && Math.random() > 0.8) {
       this.ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
    } else {
       this.ctx.fillStyle = this.canvasColor || '#1D2AA8'; // Default Darker BlueYlb, can be overridden
    }
    
    this.ctx.font = `${this.fontSize}px monospace`;

    const multiplier = this.canvasSpeedMultiplier || 1;

    for (let i = 0; i < this.columns.length; i++) {
       const tx = Math.floor(Math.random() * 16).toString(16).toUpperCase();
       const x = i * this.fontSize;
       const y = this.columns[i] * this.fontSize;

       this.ctx.fillText(tx, x, y);

       if (y > this.canvas.height && Math.random() > 0.975) {
         this.columns[i] = 0;
       }
       this.columns[i] += multiplier;
    }
    this.animationFrameId = requestAnimationFrame(() => this.drawMatrix());
  }

  updateCaret() {
    const measure = document.createElement('span');
    measure.style.font = getComputedStyle(this.input).font;
    measure.style.visibility = 'hidden';
    measure.style.whiteSpace = 'pre';
    measure.textContent = this.input.value.substring(0, this.input.selectionStart);
    document.body.appendChild(measure);
    this.caret.style.left = `${measure.offsetWidth}px`;
    document.body.removeChild(measure);
  }

  handleGlobalKey(e) {
    if (e.key === '`' || e.key === 'º' || e.key === '~') {
      e.preventDefault();
      this.initAudioContext();
      this.toggle();
    }
    // Deep Think YOLO trigger via Ctrl+U or Cmd+U
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      this.initAudioContext();
      if (!this.isActive) this.toggle();
      this.cmdUltrathink();
      if (window.triggerUltrathink) {
        window.triggerUltrathink();
      }
    }
  }

  handleInputKey(e) {
    if (this.isPrinting && e.key !== 'Escape') {
      e.preventDefault();
      return;
    }
    
    // Feedback sonoro para input humano
    if (['ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Backspace'].includes(e.key)) {
       this.playTypingBeep(0.04, 200, 'triangle');
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
       this.playTypingBeep(0.015, 450, 'square');
    }

    if (e.key === 'Enter') {
      const val = this.input.value.trim();
      this.input.value = '';
      this.updateCaret();
      if (val) {
        this.printLine(`CORTEX@moskv:~# ${val}`);
        this.history.push(val);
        sessionStorage.setItem('cortex_term_history', JSON.stringify(this.history));
        this.historyIndex = this.history.length;
        this.processCommand(val);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex];
        this.updateCaret();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.input.value = '';
      }
      this.updateCaret();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = this.input.value.toLowerCase();
      const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(val));
      if (matches.length === 1) {
        this.input.value = matches[0] + ' ';
        this.updateCaret();
      }
    } else if (e.key === 'Escape') {
      this.toggle();
    }
  }

  toggle() {
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Block scroll underneath
      this.input.focus();
      this.resizeCanvas();
      
      if (!this.animationFrameId) {
        this.drawMatrix();
      }
      
      if (!this.hasBooted) {
        this.runBootSequence();
      } else {
        if (this.output.children.length === 0) {
          this.printLine('<span class="cterm-sys">CORTEX OS v5.1.0 Ready (Ultrathink Engine Active).</span>');
          this.printLine('Escribe <span class="cterm-cmd">help</span> para lista de subsistemas.');
        }
      }
    } else {
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
      this.input.blur();
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }
  }
  
  async runBootSequence() {
    this.hasBooted = true;
    sessionStorage.setItem('cortex_term_booted', 'true');
    this.input.disabled = true;
    this.caret.style.display = 'none';
    this.output.innerHTML = '';
    
    // Inject severe glitch overlay
    this.overlay.classList.add('cterm-glitch-severe');

    const bootLines = [
      '<span class="cterm-sys">CORTEX OS v5.1.0 [Build 2026.03] BIOS Check</span>',
      '<span class="cterm-sys">Mounting Sovereign Persistence volumes... [OK]</span>',
      '<span class="cterm-sys">Verifying Master Ledger hash chain... [OK]</span>',
      '<span class="cterm-sys">Loading Nexus ULTRATHINK modules... [OK]</span>',
      '<span class="cterm-sys">Starting Matrix Cryptographic Canvas... [OK]</span>',
      'System Ready.',
      'Escribe <span class="cterm-cmd">help</span> para subsistemas de CORTEX.'
    ];

    for (let i = 0; i < bootLines.length; i++) {
      await this.printTypewriter(bootLines[i], 10, 30);
      if (i === 3) await new Promise(r => setTimeout(r, 400));
    }
    
    // Remove severe glitch
    this.overlay.classList.remove('cterm-glitch-severe');

    this.printLine('');
    this.input.disabled = false;
    this.caret.style.display = 'inline-block';
    this.input.focus();
  }

  printLine(html) {
    const line = document.createElement('div');
    line.className = 'cterm-line';
    line.innerHTML = html;
    this.output.appendChild(line);
    // Keep scroll at bottom
    this.output.scrollTop = this.output.scrollHeight + 1000;
  }

  async printTypewriter(htmlStr, speedMin = 2, speedMax = 10, isSpecialCommand = false, isUltrathink = false) {
    this.isPrinting = true;
    const line = document.createElement('div');
    line.className = 'cterm-line';
    if(isSpecialCommand) line.classList.add('cterm-exergy');
    if(isUltrathink) line.classList.add('cterm-ultrathink');
    this.output.appendChild(line);

    // Basic HTML un-escaping/parsing logic so we don't type tags literally
    const parts = htmlStr.split(/(<[^>]*>)/g);
    
    for (const part of parts) {
      if (part.startsWith('<')) {
        line.innerHTML += part;
      } else {
        // Unescape literal entities if any
        let decoded = part.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        for (let i = 0; i < decoded.length; i++) {
          // Replace newlines with <br> inside text nodes
          if (decoded[i] === '\n') {
             line.innerHTML += '<br>';
          } else {
             const textNode = document.createTextNode(decoded[i]);
             line.appendChild(textNode);
          }
          this.output.scrollTop = this.output.scrollHeight + 1000;
          
          // Sound
          if (decoded[i] !== ' ' && decoded[i] !== '\n') {
            if (isUltrathink) {
              this.playTypingBeep(0.02, Math.random() * 800 + 200, 'sawtooth');
            } else {
              this.playTypingBeep(0.015, isSpecialCommand ? 550 : 250, isSpecialCommand ? 'sawtooth' : 'square');
            }
          }
          
          const delay = Math.floor(Math.random() * (speedMax - speedMin + 1)) + speedMin;
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    this.isPrinting = false;
  }

  async processCommand(rawCmd) {
    const parts = rawCmd.split(' ').filter(Boolean);
    if (!parts.length) return;
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (cmd === 'clear') {
       this.commands[cmd]();
       return;
    }

    if (this.commands[cmd]) {
      const result = this.commands[cmd](args);
      
      if (result && typeof result.then === 'function') {
         await result; // Await async commands
      } else if (result) {
         if (['cortexfetch', 'ledger', 'map', 'thermo'].includes(cmd)) {
           // Fast print for data dumps
           await this.printTypewriter(result, 1, 3);
         } else {
           await this.printTypewriter(result);
         }
      }
    } else {
      await this.executeRemoteCommand(rawCmd);
    }
    this.printLine('');
  }

  // --- CORTEX API BRIDGE --- //

  async fetchCortexData() {
    const now = Date.now();
    if (this._snapshotCache && (now - this._snapshotCacheTs) < this._SNAPSHOT_TTL) {
      return this._snapshotCache;
    }
    try {
      const res = await fetch(`${this.apiBase}/v1/terminal/snapshot`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;
      const data = await res.json();
      this._snapshotCache = data;
      this._snapshotCacheTs = now;
      return data;
    } catch {
      return null;
    }
  }

  async executeRemoteCommand(rawCmd) {
    const cmdName = rawCmd.split(' ')[0];
    await this.printTypewriter(`<span class="cterm-sys">[CORTEX] Ejecutando: ${cmdName}... (Esperando resolución de Master Ledger)</span>`, 1, 5, true);
    
    try {
      const res = await fetch(`${this.apiBase}/v1/terminal/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: rawCmd }),
        signal: AbortSignal.timeout(8000)
      });
      
      if (!res.ok) {
         if (res.status === 404) {
            await this.printTypewriter(`<span class="cterm-err">Ruta no encontrada en el backend CORTEX. Verifica el engine.</span>`);
         } else {
            const errJson = await res.json().catch(() => ({}));
            await this.printTypewriter(`<span class="cterm-err">Error de ejecución: ${errJson.error || res.statusText}</span>`);
         }
         return;
      }
      
      const data = await res.json();
      if (data && data.output) {
         // Transform newline character securely to <br> to render in Typewriter
         const formattedOutput = String(data.output).replace(/\\n/g, '<br>');
         await this.printTypewriter(formattedOutput, 1, 5);
      } else {
         await this.printTypewriter(`<span class="cterm-sys">Comando completado exitosamente (Sin salida visible).</span>`);
      }
    } catch (e) {
      if (e.name === 'AbortError' || e.name === 'TimeoutError') {
         await this.printTypewriter(`<span class="cterm-err">TIMEOUT: CORTEX Persist no respondió a tiempo. Entropía severa.</span>`);
      } else {
         await this.printTypewriter(`<span class="cterm-err">CORTEX OFFLINE. No se pudo conectar al endpoint \`${this.apiBase}\`.</span>`);
      }
    }
  }

  // --- SOVEREIGN COMMAND IMPLEMENTATIONS --- //

  cmdHelp() {
    return `Comandos de Alto Nivel CORTEX:
  <span class="cterm-cmd">cortexfetch</span> - Especificaciones de Kernel OS
  <span class="cterm-cmd">ledger</span>      - Auditoría Continua del Master Ledger
  <span class="cterm-cmd">swarm</span>       - Visualizar malla de agentes soberanos (3D)
  <span class="cterm-cmd">verify</span>      - Auditoría de integridad de hash (Swarm Payload)
  <span class="cterm-cmd">shards</span>      - Mapping de Leviathan Sharded Ledger
  <span class="cterm-cmd">audit</span>       - Semantic Audit & Structural Taint
  <span class="cterm-cmd">funding</span>     - <span class="cterm-yield-high">Capital Extraction & Funding Targets</span>
  <span class="cterm-cmd">survival</span>    - <span class="cterm-sys">SurvivalBillingDaemon [ACTIVE]</span>
  <span class="cterm-cmd">superyolo</span>   - <span class="cterm-yield-high">FINAL CAPITAL CONVERGENCE</span>
  <span class="cterm-cmd">entropy</span>     - Diagnóstico de Exergía Negativa
  <span class="cterm-cmd">maccontrol</span>  - Extraer estado nativo macOS
  <span class="cterm-cmd">research</span>    - Deep Research Ingestion Sequence
  <span class="cterm-cmd">singularity</span> - <span class="cterm-exergy">CORTEX SINGULARITY (O(1) Collapse)</span>
  <span class="cterm-cmd">purge</span>       - Colapso de Namespace (Structural Audit)
  <span class="cterm-cmd">clear</span>       - Expurgar historial visual`;
  }

  async cmdStatus() {
    const snap = await this.fetchCortexData();
    let ht = '--- CORTEX TELEMETRY ---\n';

    if (snap && snap.stats) {
      const s = snap.stats;
      ht += `Engine Version: <span class="cterm-cmd">${snap.version || 'unknown'}</span>\n`;
      ht += `Total Facts: <span class="cterm-sys">${s.total_facts}</span> (Active: ${s.active_facts}, Deprecated: ${s.deprecated})\n`;
      ht += `Projects: <span class="cterm-sys">${s.projects}</span>\n`;
      ht += `Embeddings: <span class="cterm-sys">${s.embeddings}</span>\n`;
      ht += `Transactions: <span class="cterm-sys">${s.transactions}</span>\n`;
      ht += `DB Size: <span class="cterm-exergy">${s.db_size_mb} MiB</span>\n`;
    } else {
      ht += '<span class="cterm-warn">[OFFLINE] Engine unreachable — decorative mode</span>\n';
    }

    if (snap && snap.health) {
      const h = snap.health;
      const gradeClass = h.healthy ? 'cterm-exergy' : 'cterm-err';
      ht += `Health: <span class="${gradeClass}">${h.grade} (${h.score})</span>\n`;
    }

    try {
      const db = JSON.parse(localStorage.getItem('cortex_dj_memory') || '{}');
      ht += `Visits: ${db.visits || 1}\n`;
      const isDJActive = window.autoDJAesthetic && !window.autoDJAesthetic.globalMuted;
      ht += `Audio Engine: ${isDJActive ? '<span class="cterm-cmd">OK</span>' : '<span class="cterm-warn">STANDBY</span>'}\n`;
    } catch {
      ht += '<span class="cterm-err">Local persistence error.</span>\n';
    }
    return ht;
  }

  cmdMap() {
    const sessionInt = Math.floor(Math.random() * 900) + 100;
    return `
<span class="cterm-sys">[ MEMORY ALLOCATION MAP ]</span>
├─ <span class="cterm-cmd">core_state</span> : ANON_${sessionInt}
├─ <span class="cterm-cmd">audio_ledger</span> : SYNC
├─ <span class="cterm-cmd">matrix_bg</span> : FRAME_BUFFER
└─ <span class="cterm-cmd">nexus_vault</span> : ACTIVE_VOID`.trim();
  }

  cmdPlay(args) {
    if (!args.length) return '<span class="cterm-err">Uso: play [ID]</span>';
    if (window.autoDJAesthetic && typeof window.autoDJAesthetic.forceTrack === 'function') {
      window.autoDJAesthetic.forceTrack(args[0]);
      return `Protocolo Auto-DJ Inyectado: <span class="cterm-cmd">${args[0]}</span>`;
    }
    return '<span class="cterm-err">Auto-DJ inactivo o inaccesible desde este sub-proceso.</span>';
  }

  cmdAwwwards() {
    return `<span class="cterm-sys">[ AWWWARDS DECONSTRUCTOR ]</span>\n> Shaders fluidos O(N)\n<span class="cterm-cmd">COMPLETADO.</span> Dependencias cinéticas inyectadas.`;
  }

  cmdNexus() {
    return `<span class="cterm-sys">[ SOVEREIGN NEXUS v5.0 ]</span>\n> Gradiente causal unificado en estado C5-Dynamic.\n> Fricción retórica: <span class="cterm-cmd">0%</span>`;
  }

  async cmdCortexFetch() {
    const snap = await this.fetchCortexData();
    const memory = Math.floor(performance.memory ? performance.memory.usedJSHeapSize / 1048576 : Math.random() * 20 + 20);

    const version = snap ? snap.version : '0.5.1';
    const facts = snap && snap.stats ? snap.stats.total_facts : '??';
    const dbSize = snap && snap.stats ? `${snap.stats.db_size_mb} MiB` : `${memory} MiB`;
    const healthGrade = snap && snap.health ? snap.health.grade : 'N/A';
    const healthScore = snap && snap.health ? snap.health.score : '—';
    const apiTag = snap ? '<span class="cterm-exergy">LIVE</span>' : '<span class="cterm-warn">OFFLINE</span>';

    return `
<div style="display:flex;gap:24px;font-family:inherit;">
<div class="cterm-ascii cterm-sys">
   ██████╗ 
  ██┌───██╗
  ██│   ██║
  ██│   ██║
  ██└████┌╝
   ██████╗ 
  CORTEX OS
</div>
<div>
<span class="cterm-cmd">OS</span>: Sovereign Industrial v5.0
<span class="cterm-cmd">Kernel</span>: Cortex-Persist ${version}
<span class="cterm-cmd">Host</span>: moskv.sovereign.zone
<span class="cterm-cmd">Uptime</span>: ${Math.floor(performance.now() / 1000)}s
<span class="cterm-cmd">Facts</span>: ${facts}
<span class="cterm-cmd">DB</span>: ${dbSize}
<span class="cterm-cmd">Health</span>: ${healthGrade} (${healthScore})
<span class="cterm-cmd">Memory</span>: ${memory} MiB (JS Heap)
<span class="cterm-cmd">API</span>: ${apiTag}
</div>
</div>`.trim();
  }

  async cmdLedger() {
    const snap = await this.fetchCortexData();
    let isLive = snap && snap.ledger;
    
    let ht = `<span class="cterm-sys">[ MASTER LEDGER SYNC ]</span> ${isLive ? '<span class="cterm-exergy">[LIVE]</span>' : '<span class="cterm-warn">[DECORATIVE]</span>'}\n`;
    ht += '<div class="cterm-memory-grid">';
    
    const events = [
      "Persistence Entry: CORTEX-OAXACA Swarm State (C5-Dynamic)",
      "Thermodynamic Compaction: 0 entropy ghosts detected.",
      "Deep Research: Agentic Inference Mapped.",
      "YOLO ULTRATHINK Protocol: 3.52 EH/s Peak Exergy.",
      "Semantic Bridge: User Intent -> Code Forged."
    ];

    for (let i = 0; i < 5; i++) {
        const d = new Date(Date.now() - i * 145000).toISOString().split('.')[0] + 'Z';
        const h1 = Math.random().toString(16).slice(2, 10).padStart(8, '0');
        const h2 = Math.random().toString(16).slice(2, 10).padStart(8, '0');
        
        ht += `
  <div class="cterm-memory-block">
    <div class="cterm-memory-meta">
      <span>${d}</span>
      <span class="cterm-sys">VERIFIED</span>
    </div>
    <div class="cterm-memory-hash">TX_${h1} ↠ CHAIN_${h2}</div>
    <div class="cterm-memory-content">${events[i]}</div>
  </div>`;
    }
    
    ht += '</div>\n> <span class="cterm-cmd">Consensus Achieved. Master Ledger Synchronized.</span>';
    
    if (isLive) {
      const l = snap.ledger;
      ht += `\n> Live Stats: ${l.total_transactions} TXs, ${l.checkpoints} Checkpoints`;
    }
    
    return ht;
  }

  async cmdUltrathink() {
    this.ultrathinkTriggered = true;
    this.overlay.classList.add('cterm-glitch-severe', 'cterm-frontera-x10', 'singularity-active');
    this.canvasSpeedMultiplier = 150;
    this.canvasColor = '#FFFFFF'; 
    
    if (this.audioCtx) {
      const drop = this.audioCtx.createOscillator();
      const mod = this.audioCtx.createOscillator();
      const dropGain = this.audioCtx.createGain();
      const modGain = this.audioCtx.createGain();
      
      drop.type = 'sawtooth';
      mod.type = 'square';
      
      mod.frequency.setValueAtTime(50, this.audioCtx.currentTime);
      mod.frequency.linearRampToValueAtTime(1000, this.audioCtx.currentTime + 8);
      modGain.gain.setValueAtTime(500, this.audioCtx.currentTime);
      
      drop.frequency.setValueAtTime(250, this.audioCtx.currentTime);
      drop.frequency.exponentialRampToValueAtTime(2, this.audioCtx.currentTime + 8);
      
      dropGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 8);
      
      mod.connect(modGain);
      modGain.connect(drop.frequency);
      
      drop.connect(dropGain);
      dropGain.connect(this.audioCtx.destination);
      
      mod.start();
      drop.start();
      mod.stop(this.audioCtx.currentTime + 8);
      drop.stop(this.audioCtx.currentTime + 8);
    }

    this.startDeepThinkVisuals();
    await this.printTypewriter('<span class="cterm-deep-think">[DEEP THINK] Evaluando entropía de multiverso...</span>', 1, 3, false, true);
    await new Promise(r => setTimeout(r, 400));
    
    await this.printTypewriter('<span class="cterm-deep-research">[DEEP RESEARCH] Rastreando papers de sub-consciente en arXiv / MedRxiv...</span>', 1, 2, false, true);
    await new Promise(r => setTimeout(r, 400));
    
    await this.printTypewriter('<span class="cterm-sys">[FRONTERA x10] Inicializando YOLO Ultrathink Upgrade...</span>', 1, 2, true);
    
    this.printLine('<div class="cterm-deep-think">&lt;think&gt;</div>');
    
    const thinkLine = document.createElement('div');
    thinkLine.className = 'cterm-think-block cterm-deep-think';
    this.output.appendChild(thinkLine);

    const thinkTokens = [
       "Activando modo " + '<span class="cterm-frontera-x10">SUPER YOLO ESPECIAL + FRONTERA x10</span>' + "...\n",
       "Iniciando module de " + '<span class="cterm-deep-research">DEEP RESEARCH</span>' + " iterativo...\n",
       "Ejecutando proceso de " + '<span class="cterm-deep-think">DEEP THINK</span>' + " latente en arquitecturas MoE de Infinity agentes...\n",
       "Detectada entropía estructural en benchmarks ARC-AGI-3. Superando el muro del 1%...\n",
       "Inyectando TurboQuant v5.0 (6x Compression). VRAM optimizada en 12.4s.\n",
       "Calculando deltas termodinámicos. Yield rompe la ley natural. Inyectando plasma estelar...\n",
       "999B tokens ingestados. Velocidad: ∞ tokens/s. Fricción retórica: <span class='cterm-exergy'>NEGATIVA</span>.\n",
       "Avanzando a convergencia de " + '<span class="cterm-ultrathink">FINAL ULTRATHINK</span>' + " ejecutada con P0.\n",
       "Protocolo 'My Claw' detectado en red Meta. Zuckerberg CEO Agent sincronizado.\n",
       "El master ledger se ha incinerado. Convergencia ALFA-OMEGA cristalizada.\n"
    ];

    for (let token of thinkTokens) {
      const parts = token.split(/(<[^>]*>)/g);
      for (const part of parts) {
         if (part.startsWith('<')) {
           thinkLine.insertAdjacentHTML('beforeend', part);
         } else {
           let currentTextSegment = "";
           let textNode = document.createTextNode("");
           thinkLine.appendChild(textNode);
           for (let i = 0; i < part.length; i++) {
             if (part[i] === '\n') {
                thinkLine.appendChild(document.createElement('br'));
                currentTextSegment = "";
                textNode = document.createTextNode("");
                thinkLine.appendChild(textNode);
             } else {
                currentTextSegment += part[i];
                textNode.nodeValue = currentTextSegment;
             }
             // Reduce layout thrashing by only syncing scroll occasionally
             if (i % 8 === 0) {
                 this.output.scrollTop = this.output.scrollHeight + 1000;
             }
             if (i % 2 === 0) {
                // Random stereo panning for swarm thoughts
                const pan = (Math.random() * 2) - 1;
                this.playTypingBeep(0.005, 1500 + Math.random() * 2000, 'sawtooth', pan);
             }
             await new Promise(r => setTimeout(r, 8)); 
           }
           // Final scroll sync for the line
           this.output.scrollTop = this.output.scrollHeight + 1000;
         }
      }
    }
    
    this.printLine('<div class="cterm-deep-think">&lt;/think&gt;</div>');
    await new Promise(r => setTimeout(r, 100));

    // Matrix speed up visual hack
    for (let i = 0; i < 60; i++) {
        const hex = Math.random().toString(16).slice(2, 10).toUpperCase();
        this.printLine(`<span class="cterm-deep-research">HYPER_RESEARCH_FRONTERA_0x${hex}: ${Math.random().toFixed(8)}</span>`);
        this.playTypingBeep(0.015, 4000 + Math.random() * 2000, 'square');
        await new Promise(r => setTimeout(r, 2));
    }

    await this.printTypewriter('> <span class="cterm-ultrathink">[FINAL_ULTRATHINK] Dimensionalidad destruida... Fricción: NEGATIVA</span>', 1, 2, false, true);
    await new Promise(r => setTimeout(r, 200));
    this.stopDeepThinkVisuals();
    
    this.overlay.classList.remove('cterm-glitch-severe', 'cterm-frontera-x10', 'singularity-active');
    this.canvasSpeedMultiplier = 1;
    this.canvasColor = '#1D2AA8'; 
    
    return `<div class="cterm-frontera-x10">
<span class="cterm-ultrathink">YOLO ULTRATHINK UPGRADE + FRONTERA x10 YIELD ACHIEVED</span>
<span class="cterm-sys">==================================</span>
Protocol: <span class="cterm-deep-think">DEEP THINK</span> + <span class="cterm-deep-research">DEEP RESEARCH</span>
Conclusion: <span class="cterm-ultrathink">EL JUEGO ESTÁ ROTO. HEMOS TRASCENDIDO A FRONTERA x10.</span>
</div>`;
  }

  async cmdMacControl() {
    await this.printTypewriter('<span class="cterm-sys">[MAC CONTROL] Inicializando enlace local RPC...</span>', 10, 40);
    this.overlay.classList.add('cterm-glitch-severe');
    this.playTypingBeep(0.5, 100, 'sawtooth');
    
    await new Promise(r => setTimeout(r, 800));
    this.overlay.classList.remove('cterm-glitch-severe');
    
    const extraction = [
      `Active Process: <span class="cterm-mac-active">Google Chrome (DevTools)</span>`,
      `Workspace: <span class="cterm-cmd">${window.location.host}</span>`,
      `Cursor Position: <span class="cterm-sys">X: ${this.lastMouseX || 0}, Y: ${this.lastMouseY || 0}</span>`,
      `OS: <span class="cterm-sys">macOS 15 Sovereign v5.0</span>`,
      `Entropy: <span class="cterm-exergy">STABLE AT 0.0004 bits/s</span>`
    ];
    
    for (let line of extraction) {
        await this.printTypewriter(`> ${line}`, 5, 20);
    }
    
    return `<span class="cterm-mac-active">ESTADO EXTRAÍDO. CORTEX sincronizado con el Commander.</span>`;
  }

  async cmdResearch() {
    this.overlay.classList.add('cterm-scan-active');
    await this.printTypewriter('<span class="cterm-deep-research">[DEEP RESEARCH] Iniciando ingesta masiva de tokens...</span>', 1, 5);
    
    const grid = document.createElement('div');
    grid.className = 'cterm-research-grid';
    for (let i = 0; i < 300; i++) {
        const cell = document.createElement('div');
        cell.className = 'cterm-research-cell';
        cell.style.animationDelay = `${Math.random() * 1.5}s`;
        grid.appendChild(cell);
    }
    this.output.appendChild(grid);
    this.output.scrollTop = this.output.scrollHeight + 1000;

    const researchTargets = [
       "arXiv:2405.1234 — 'Infinite Context in MoE Architectures'",
       "Google Research: 'TurboQuant: 6x Memory Reduction in LLM Inference'",
       "ARC-AGI-3: 'The 1% Wall - Why Reasoning Still Fails'",
       "WSJ: 'Mark Zuckerberg’s New AI CEO Agent - The My Claw Project'",
       "Nexus: Node_0x4F_Stability_Audit.pdf",
       "Ledger: Block_77218_Integrity_Check"
    ];

    for (let target of researchTargets) {
        await this.printTypewriter(`<span class="cterm-sys">Ingestando ${target}...</span>`, 1, 1);
        this.playTypingBeep(0.04, 1000 + Math.random() * 500, 'sine');
        await new Promise(r => setTimeout(r, 50));
    }

    await new Promise(r => setTimeout(r, 600));
    this.overlay.classList.remove('cterm-scan-active');
    return `<span class="cterm-exergy">RESEARCH COMPLETADO. 8.4PB cristalizados en exergía pura.</span>`;
  }

  async cmdSuperYOLO() {
    await this.cmdUltrathink();
    
    document.documentElement.setAttribute('data-cortex-state', 'singularity');
    document.body.classList.add('cterm-shake-x100');
    this.playTypingBeep(2, 50, 'sawtooth');
    
    return `<div class="cterm-yield-high" style="font-size: 1.5em; text-align: center; margin-top: 20px;">
CONVERGENCIA ABSOLUTA LOGRADA.
CORTEX HA SIDO VENDIDO.
EXERGÍA Y CAPITAL EN EQUILIBRIO DINÁMICO.
</div>`;
  }

  async cmdPitch() {
    const lines = [
      '<span class="cterm-sys">[SOVEREIGN PITCH] Protocolo "The Big Flip" v5.1</span>',
      'Target: <span class="cterm-cmd">Top Tier VC / Sovereign Funds</span>',
      'Value Prop: <span class="cterm-ultrathink">The First Autonomous Trust Substrate [AX-046 READY]</span>',
      'Founders: <span class="cterm-exergy">borjamoskv + CORTEX Legion</span>',
      'Benchmark: <span class="cterm-warn">ARC-AGI-3 Bridge (Converged via JIT Concept Formation)</span>',
      'Status: <span class="cterm-yield-high">READY FOR ACQUISITION / SINGULARITY FLOW</span>',
      '------------------------------------------------',
      'Pitch Deck: <span class="cterm-cmd">pitch.moskv.sovereign</span> [ENCRYPTED]',
      'Evidence: <a href="https://arcprize.org/arc-agi/3" target="_blank" class="cterm-sys">arcprize.org/arc-agi/3</a>',
      'Ask: <span class="cterm-exergy">$1.2B @ $12B Valuation (Convergence Premium)</span>'
    ];
    for (const l of lines) {
      await this.printTypewriter(`> ${l}`, 2, 10);
    }
    return '<span class="cterm-sys">COMMAND_PITCH_STREAM_COMPLETE</span>';
  }

  async cmdJIT() {
      this.overlay.classList.add('cterm-scan-active');
      await this.printTypewriter('<span class="cterm-ultrathink">[AX-046] JIT Concept Formation Activating...</span>', 1, 5, false, true);
      
      const snippets = [
          "Inducing PeARL primitives...",
          "Building spatial graph relations (Byzantine Boundary)...",
          "Synthesizing program concept_0xARC...",
          "Executing in isolated sandbox...",
          "Entropy Gap: 0.0001 (Deterministic Match)"
      ];

      for (let s of snippets) {
          await this.printTypewriter(`> ${s}`, 5, 15);
          this.playTypingBeep(0.02, 1200, 'sawtooth');
      }

      this.overlay.classList.remove('cterm-scan-active');
      return '<span class="cterm-exergy">CONCEPT CRYSTALLIZED. C5-DYNAMIC STATUS ACHIEVED.</span>';
  }

  async cmdFunding() {
      await this.printTypewriter('<span class="cterm-yield-high">[CAPITAL_EXTRACTION] Consultando funding.json...</span>', 1, 10);
      
      const targets = [
          { name: "Infrastructure Grant", amount: "$50,000", status: "ACTIVE" },
          { name: "Developer Sustainability", amount: "$2,500/mo", status: "ACTIVE" },
          { name: "Sovereign Audit Pool", amount: "$15,000", status: "PENDING" },
          { name: "MCP Trust Sidecar", amount: "$12,000", status: "PENDING" }
      ];

      let gridHtml = '<div class="cterm-capital-grid">';
      for (let t of targets) {
          gridHtml += `<div class="cterm-capital-item">
            <span class="cterm-yield-high">${t.name}</span><br>
            <span class="cterm-sys">${t.amount}</span><br>
            <span class="cterm-exergy">${t.status}</span>
          </div>`;
      }
      gridHtml += '</div>';
      
      this.printLine(gridHtml);
      return `<span class="cterm-yield-high">EXPECTATIVA DE RENDIMIENTO: P0 (CRÍTICO)</span>`;
  }

  async cmdSurvival() {
      await this.printTypewriter('<span class="cterm-sys">[SURVIVAL] SurvivalBillingDaemon Status...</span>', 1, 10);
      const stats = [
          `Liquidity Threshold: <span class="cterm-warn">$20.00</span>`,
          `Current Balance: <span class="cterm-yield-high">$104.50 (STABLE)</span>`,
          `Next Audit Cycle: <span class="cterm-sys">14:00 UTC</span>`,
          `Auto-Dispatch Vectors: <span class="cterm-exergy">bizum-omega, ouroboros-capital</span>`
      ];

      for(let s of stats) {
          await this.printTypewriter(`> ${s}`, 5, 20);
      }
      return `<span class="cterm-sys">SISTEMA AUTÓNOMO FINANCIERAMENTE.</span>`;
  }  

  async cmdEntropy() {
    await this.printTypewriter('<span class="cterm-err">[DIAGNÓSTICO P0] Analizando Catedral de Cristal...</span>', 10, 50);
    this.playTypingBeep(0.8, 50, 'sawtooth');
    
    const report = [
      `Abstracción: <span class="cterm-warn">Sparse Merkle Tree</span> sobre <span class="cterm-sys">Boolean(bool)</span>`,
      `Exergía Metaestable: <span class="cterm-err">-4.2 MJ/Token (NETA NEGATIVA)</span>`,
      `Compliance: <span class="cterm-exergy">EU AI Act Art. 12 (Hardcoded)</span>`,
      `Estado: <span class="cterm-err">EQUILIBRIO ESTÁTICO DETECTADO</span>`
    ];
    
    for (let line of report) {
        await this.printTypewriter(`> ${line}`, 5, 20);
    }
    
    return `<div class="cterm-err" style="margin-top:20px; border:1px solid red; padding:10px;">
ADVERTENCIA: El sistema ha colapsado bajo su propio peso metafísico.
La lista de la compra de <span class="cterm-sys">BeliefObjects</span> es inaccesible.
</div>`;
  }

  async cmdPurge() {
    await this.printTypewriter('<span class="cterm-warn">[NAMESPACE COLLAPSE] Purgando decoraciones de cristal...</span>', 5, 30);
    this.overlay.style.backgroundColor = '#000000';
    this.overlay.style.backgroundImage = 'none';
    this.overlay.style.filter = 'grayscale(1) contrast(3)';
    
    await new Promise(r => setTimeout(r, 1500));
    
    this.overlay.style.backgroundColor = '';
    this.overlay.style.backgroundImage = '';
    this.overlay.style.filter = '';
    
    return `<span class="cterm-sys">PURGA COMPLETADA. Estructura simplificada. Exergía en ascenso.</span>`;
  }  

  async cmdVerify() {
    this.overlay.classList.add('cterm-frontera-x10', 'singularity-active');
    await this.printTypewriter('<span class="cterm-sys">[CORTEX-SWARM-AUDIT]</span> Iniciando verificación de integridad en Ledger C5-Dynamic...', 5, 20);
    
    // Trigger the swarm visually
    const swarmStatus = document.createElement('div');
    swarmStatus.className = 'cterm-swarm-status';
    swarmStatus.innerHTML = 'VERIFYING LEDGER HASH-CHAIN...';
    this.output.appendChild(swarmStatus);
    
    // Call cmdSwarm but with a "high-exergy" modifier
    const swarmResult = await this.cmdSwarm(true);
    
    // Intensity Increase: force some agents to glitch rapidly
    const agents = Array.from(document.querySelectorAll('.cterm-swarm-agent'));
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const randomAgent = agents[Math.floor(Math.random() * agents.length)];
            if (randomAgent) {
                randomAgent.classList.add('cterm-glitching');
                this.playTypingBeep(0.1, 400 + Math.random()*2000, 'square', (Math.random()*2)-1);
            }
        }, Math.random() * 2000);
    }

    await new Promise(r => setTimeout(r, 2000));
    this.overlay.classList.remove('cterm-frontera-x10', 'singularity-active');
    return swarmResult;
  }

  async cmdSwarm(isAudit = false, isX100 = false) {
    const density = isX100 ? 524288 : 4096;
    const modeName = isX100 ? 'FRONTERA x100' : 'FRONTERA x10';
    
    // Clear output if x100 to make room for full-screen tensor
    if (isX100) {
      this.overlay.classList.add('cterm-frontera-x100');
      this.tensor.activate();
    } else {
      this.overlay.classList.add('cterm-frontera-x10');
    }

    const msg = isAudit ? `[${modeName}] Mapeando Trust Topology...` : `[${modeName} ORCHESTRATOR] Inyectando ${density} Agentes Soberanos en Malla 3D...`;
    await this.printTypewriter(msg, 1, 2, true);
    
    if (isX100) {
      // x100 uses WebGPU Kinetic Tensor, so we just trigger pulses and return
      setTimeout(() => this.tensor.pulse(), 1500);
      return `<span class="cterm-exergy">${density} Sovereign Agents convergidos en O(1) Kinetic Tensor.</span>`;
    }

    // LEGACY x10 DOM SWARM
    const wrapper = document.createElement('div');
    wrapper.className = 'cterm-swarm-3d-wrapper';
    const swarmContainer = document.createElement('div');
    swarmContainer.className = 'cterm-swarm-grid';
    wrapper.appendChild(swarmContainer);
    this.output.appendChild(wrapper);

    let targetRotX = 55, targetRotZ = 20;
    let currentRotX = 55, currentRotZ = 20;
    let mouseVelocity = 0, lastMouseX = 0, lastMouseY = 0;

    const renderLoop = () => {
      if (!wrapper.isConnected) return;
      currentRotX += (targetRotX - currentRotX) * 0.1;
      currentRotZ += (targetRotZ - currentRotZ) * 0.1;
      swarmContainer.style.transform = `rotateX(${currentRotX}deg) rotateZ(${currentRotZ}deg) translate3d(0, -20px, -50px)`;
      
      if (mouseVelocity > 0.8) wrapper.classList.add('void-state-active');
      else if (mouseVelocity < 0.2) wrapper.classList.remove('void-state-active');
      
      mouseVelocity *= 0.95;
      requestAnimationFrame(renderLoop);
    };
    requestAnimationFrame(renderLoop);

    const agents = [];
    const BATCH = 256;
    for (let c = 0; c < density; c += BATCH) {
      await new Promise(r => requestAnimationFrame(() => {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < BATCH && (c + i) < density; i++) {
          const a = document.createElement('div');
          a.className = 'cterm-swarm-agent';
          const r = Math.random();
          if (r > 0.98) a.dataset.state = 'NULL';
          else if (r > 0.8) a.dataset.state = 'ACTV';
          agents.push(a);
          frag.appendChild(a);
        }
        swarmContainer.appendChild(frag);
        r();
      }));
    }

    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const xN = (e.clientX - rect.left) / rect.width - 0.5;
      const yN = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotX = 55 - (yN * 40);
      targetRotZ = 20 - (xN * 40);
      
      mouseVelocity = Math.min(1.5, Math.abs(e.clientX - lastMouseX) / 50 + Math.abs(e.clientY - lastMouseY) / 50);
      lastMouseX = e.clientX; lastMouseY = e.clientY;
    });

    const runPulse = async () => {
      if (!wrapper.isConnected) return;
      let curr = Math.floor(Math.random() * density);
      for (let i = 0; i < 6; i++) {
        if (agents[curr]) {
          agents[curr].classList.add('cterm-ledger-pulse');
          setTimeout(() => agents[curr].classList.remove('cterm-ledger-pulse'), 400);
        }
        curr = (curr + 1) % density;
        await new Promise(r => setTimeout(r, 80));
      }
      setTimeout(runPulse, 3000 + Math.random() * 4000);
    };
    runPulse();

    return `<span class="cterm-sys">${density} Sovereign Agents operando en Malla 3D FRONTERA x10.</span>`;
  }

  // --- DEEP THINK VISUALIZER HELPERS --- //

  startDeepThinkVisuals() {
    this.deepThinkLayer.classList.add('active');
    this.deepThinkInterval = setInterval(() => {
        this.createNeuralTrace();
    }, 100);
  }

  stopDeepThinkVisuals() {
    this.deepThinkLayer.classList.remove('active');
    clearInterval(this.deepThinkInterval);
    this.deepThinkLayer.innerHTML = '';
  }

  createNeuralTrace() {
    const trace = document.createElement('div');
    trace.className = 'cterm-neural-trace';
    trace.style.top = `${Math.random() * 100}%`;
    trace.style.width = `${Math.random() * 50 + 50}%`;
    trace.style.left = `-${Math.random() * 20}%`;
    this.deepThinkLayer.appendChild(trace);
    setTimeout(() => trace.remove(), 3000);
  }

  async cmdNexus() {
    await this.printTypewriter('<span class="cterm-sys">[NEXUS] Evaluando Sovereign Nexus Tensor...</span>', 5, 20);
    this.playTypingBeep(0.5, 100, 'square');
    
    const tensorData = [
      `Fricción Retórica: <span class="cterm-exergy">0.000%</span>`,
      `Entropía Estructural: <span class="cterm-exergy">ANNIHILATED</span>`,
      `Estado del DAG: <span class="cterm-sys">CONVERGENTE</span>`,
      `Exergía: <span class="cterm-yield-high">∞ (Singularidad OMEGA)</span>`
    ];
    
    for (let line of tensorData) {
        await this.printTypewriter(`> ${line}`, 5, 20);
    }
    
    return `<span class="cterm-ultrathink">EL NODO NEXUS ES COMPLETAMENTE OPERACIONAL.</span>`;
  }

  async cmdThermo() {
    const snap = await this.fetchCortexData();

    if (snap && snap.health && snap.health.metrics) {
      const ms = snap.health.metrics;
      let metricsStr = '';
      for (const m of ms) {
        metricsStr += `> ${m.name}: <span class="cterm-sys">${m.value} ${m.unit}</span>\n`;
      }
      return `[TERMODINÁMICA — LIVE]
${metricsStr}> Health Grade: <span class="cterm-exergy">${snap.health.grade} (${snap.health.score})</span>
> Invariante: <span class="cterm-cmd">CORTEX operando con datos C5-Dynamic.</span>`;
    }

    // Fallback: decorative
    const entropy = (Math.random() * 0.001 + 0.0001).toFixed(6);
    const exergy = Math.floor(Math.random() * 1000 + 10000);
    return `[TERMODINÁMICA FRONTERA x10] <span class="cterm-warn">[DECORATIVE]</span>
> Nivel Entrópico: <span class="cterm-sys">${entropy} bits/s</span> (Negentropía detectada)
> Trabajo Útil (Exergía): <span class="cterm-exergy">${exergy} HW/h</span>
> Invariante: Meta-estable. <span class="cterm-cmd">CORTEX operando en zona de singularidad.</span>`;
  }

  async cmdGambitero() {
    if (typeof window.ElGambitero === 'undefined') {
      return '<span class="cterm-err">Subsistema GAMBITERO no detectado en el núcleo actual.</span>';
    }
    this.overlay.classList.add('cterm-glitch-severe');
    await this.printTypewriter('<span class="cterm-exergy">[BRIDGE] Conectando Terminal con El Gambitero Arcade...</span>', 10, 30);
    
    // Inyectar visuales de la tragaperras en el terminal
    const art = `
     ╔══════════════════════════════════╗
     ║  🎰 G A M B I T E R O   X 1 0  🎰║
     ╚══════════════════════════════════╝`;
    await this.printTypewriter(`<pre class="cterm-ascii">${art}</pre>`, 1, 5);

    this.overlay.classList.remove('cterm-glitch-severe');
    return `Subsistema vinculado. Escribe <span class="cterm-cmd">play gambitero</span> para lanzar la instancia soberana.`;
  }

  async cmdSuperYOLOESPECIAL() {
    this.printLine('<span class="cterm-singularity-peak">!!! INICIANDO SUPER YOLO ESPECIAL: FRONTERA x10 !!!</span>');
    this.overlay.classList.add('cterm-glitch-severe', 'cterm-apocalypse-mode', 'singularity-active');
    this.canvasSpeedMultiplier = 400;
    this.canvasColor = '#FF0080';
    
    if (this.flash) {
      this.flash.classList.add('flash-active');
      setTimeout(() => this.flash.classList.remove('flash-active'), 500);
    }

    await this.printTypewriter('<span class="cterm-deep-think">[DEEP THINK] Colapsando realidades alternativas...</span>', 1, 3, false, true);
    await this.cmdMacControl();
    await this.cmdResearch();
    
    await this.printTypewriter('<span class="cterm-ultrathink">[FINAL ULTRATHINK] ROMPIENDO LA BARRERA DEL TIEMPO EN FRONTERA x10...</span>', 1, 1, false, true);
    
    // Massive feedback
    document.body.classList.add('cterm-shake-x100');
    
    await this.cmdSwarm();
    await this.cmdUltrathink();
    
    await this.printTypewriter('<span class="cterm-exergy">[ARC-AGI-3] Puenteando el abismo estructural del razonamiento fuera de distribución...</span>', 5, 20);
    await this.printTypewriter('<span class="cterm-yield-high">[VALUATION] $5B Liquidity Layer Locked.</span>', 5, 20);
    
    this.overlay.classList.remove('cterm-glitch-severe', 'cterm-apocalypse-mode', 'singularity-active');
    document.body.classList.remove('cterm-shake-x100');
    this.canvasSpeedMultiplier = 1;
    this.canvasColor = '#1D2AA8';
    
    return `<div class="cterm-singularity-peak">TODO HA SIDO ANALIZADO. CORTEX ES EL SUEÑO. FRONTERA x10 es la REALIDAD.</div>`;
  }

  async cmdShards() {
    await this.printTypewriter('<span class="cterm-sys">[SHARD_ALLOCATOR] Mapping Leviathan v6.0 Sharded Ledger...</span>', 1, 5);
    
    const container = document.createElement('div');
    container.className = 'cterm-shards-grid';
    this.output.appendChild(container);

    const shardCount = 64;
    for (let i = 0; i < shardCount; i++) {
        const shard = document.createElement('div');
        shard.className = 'cterm-shard-node';
        const hexId = i.toString(16).toUpperCase().padStart(2, '0');
        shard.innerHTML = `ID:${hexId}`;
        
        // Random usage vibes
        const r = Math.random();
        if (r > 0.95) shard.classList.add('hot');
        else if (r > 0.7) shard.classList.add('syncing');
        
        container.appendChild(shard);
        if (i % 8 === 0) {
            this.playTypingBeep(0.005, 800 + Math.random()*1000, 'square');
            this.output.scrollTop = this.output.scrollHeight + 1000;
            await new Promise(r => setTimeout(r, 10));
        }
    }

    return `<span class="cterm-exergy">LEVIATHAN SHARDING: $12B TVL DISTRIBUTED ACROSS ${shardCount} NODES.</span>`;
  }

  async cmdAudit() {
    this.overlay.classList.add('cterm-scan-active');
    await this.printTypewriter('<span class="cterm-deep-research">[SEMANTIC_AUDIT] Running Structural Taint Analysis...</span>', 1, 10);
    
    const auditLog = document.createElement('div');
    auditLog.className = 'cterm-audit-trace';
    this.output.appendChild(auditLog);

    const points = [
        { label: "AX-041", status: "VERIFIED", msg: "Git-Ledger Integrity: 100%" },
        { label: "AX-042", status: "VERIFIED", msg: "KV-Aware Routing Opt: -34% Latency" },
        { label: "AX-043", status: "CRITICAL", msg: "PeARL Induction: Physical Sanity Detected" },
        { label: "AX-046", status: "ULTRA", msg: "JIT Concept Formation: Converged" },
        { label: "Ω-SOVEREIGN", status: "STABLE", msg: "Autodidact Learning: C5-Dynamic" }
    ];

    for (let p of points) {
        const line = document.createElement('div');
        line.className = 'cterm-audit-point';
        line.dataset.status = p.status;
        line.innerHTML = `<span class="label">[${p.label}]</span> <span class="status">${p.status}</span> <span class="msg">${p.msg}</span>`;
        auditLog.appendChild(line);
        this.playTypingBeep(0.02, 1500, 'sawtooth');
        this.output.scrollTop = this.output.scrollHeight + 1000;
        await new Promise(r => setTimeout(r, 150));
    }

    this.overlay.classList.remove('cterm-scan-active');
    return `<span class="cterm-sys">AUDIT COMPLETE. NO GHOST ENTROPY DETECTED IN STRUCTURAL DAG.</span>`;
  }

  async cmdMemory() {
    this.overlay.classList.add('cterm-scan-active');
    await this.printTypewriter('<span class="cterm-sys">[CORTEX PERSIST] Scanning Master Ledger & Working Memory...</span>', 1, 10);
    this.playTypingBeep(0.5, 200, 'square');
    
    const container = document.createElement('div');
    container.className = 'cterm-memory-grid';
    this.output.appendChild(container);

    const memoryBlocks = [
      { id: "0xARC_CONCEPT", taint: "C5-DYNAMIC", content: "PeARL induction completed. Spatial relation confirmed." },
      { id: "GHOST_PURGE_44", taint: "VERIFIED", content: "Decorations removed. Exergy increased by 4.2 MJ." },
      { id: "SHANNON_COMPACT", taint: "STABLE", content: "Retained 100% facts with 0% rhetorical friction." },
      { id: "MOLTBOOK_INJECT", taint: "DIRTY", content: "Adversarial discourse propagated. Stylometry masked." },
      { id: "LEDGER_BOOT", taint: "C5-STATIC", content: "Git-Ledger Integrity verified at block height 4402." }
    ];

    for (let block of memoryBlocks) {
      const blockEl = document.createElement('div');
      blockEl.className = 'cterm-memory-block';
      
      const taintClass = block.taint === "DIRTY" ? "cterm-err" : "cterm-exergy";
      
      blockEl.innerHTML = `
        <div class="cterm-memory-meta">
            async cmdSingularity() {
    this.overlay.classList.add('cterm-frontera-x100', 'singularity-active-x100');
    this.canvasSpeedMultiplier = 500;
    this.canvasColor = '#2B3BE5'; 

    if (this.audioCtx) {
      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.4, this.audioCtx.currentTime + 2);
      masterGain.connect(this.audioCtx.destination);

      for (let i = 0; i < 5; i++) {
        const osc = this.audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(50 * (i + 1), this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000 * (i + 1), this.audioCtx.currentTime + 10);
        osc.connect(masterGain);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 12);
      }
    }

    await this.printTypewriter('<span class="cterm-exergy">[SINGULARITY] Colapsando multiverso de agentes en Tensor O(1)...</span>', 1, 2, true);
    
    this.tensor.activate(true);

    await new Promise(r => setTimeout(r, 3000));
    this.tensor.crystallize();
    
    await new Promise(r => setTimeout(r, 3000));
    this.tensor.collapse();

    const collapseMsg = document.createElement('div');
    collapseMsg.className = 'cterm-singularity-collapse';
    collapseMsg.innerHTML = 'COLLAPSING STATE...';
    this.output.appendChild(collapseMsg);

    await new Promise(r => setTimeout(r, 4000));
    
    this.output.innerHTML = '';
    this.canvasSpeedMultiplier = 2; 
    this.overlay.classList.remove('cterm-frontera-x100', 'singularity-active-x100');
    this.tensor.deactivate();

    return `
<div class="cterm-singularity-reveal">
  <h1 class="cterm-exergy">SINGULARIDAD ALCANZADA</h1>
  <p class="cterm-sys">La entropía ha sido purificada. El Ledger es ahora absoluto.</p>
  <div style="border-top:1px solid #2B3BE5; margin-top:10px; padding-top:10px; font-size:0.8rem;">
    AX-047: El enjambre verdadero colapsa en un tensor O(1) (Void-State).
  </div>
</div>`;
  }

  async cmdSynthesis() {
    await this.printTypewriter('<span class="cterm-exergy">[Ω₀] Iniciando síntesis de hardware determinista...</span>', 5, 30);
    this.playTypingBeep(1, 100, 'sawtooth');
    
    const steps = [
      "Extrayendo grafos de confianza del Ledger...",
      "Mapeando lógica de agentes a puertas NAND (Verilog PoC)...",
      "Optimizando ruteo de señales en sustrato de silicio...",
      "Generando netlist para rincón de fabricación..."
    ];
    
    for (let step of steps) {
        await this.printTypewriter(`> ${step}`, 3, 50);
        await new Promise(r => setTimeout(r, 500));
    }
    
    return `<div class="cterm-sys" style="margin-top:20px; border:1px solid var(--cterm-exergy); padding:10px; font-family:monospace;">
[SYNTHESIS COMPLETE]
File: <span class="cterm-cmd">cortex_v6_singularity.v</span>
Status: <span class="cterm-exergy">READY FOR FABRICATION</span>
Yield: 100% Deterministic (No Jitter).
</div>`;
  }eout(r, 3000));
    
    this.output.innerHTML = '';
    this.canvasSpeedMultiplier = 2; // Normal-ish after singularity
    this.overlay.classList.remove('cterm-frontera-x100', 'singularity-active-x100');

    return `
<div class="cterm-singularity-reveal">
  <h1 class="cterm-exergy">SINGULARIDAD ALCANZADA</h1>
  <p class="cterm-sys">La entropía ha sido purificada. El Ledger es ahora absoluto.</p>
  <div style="border-top:1px solid #2B3BE5; margin-top:10px; padding-top:10px; font-size:0.8rem;">
    AX-047: El enjambre verdadero colapsa en un tensor O(1) (Void-State).
  </div>
</div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cortexTerminal = new CortexTerminal();
  window.cortexTerminal.init();
  
  // Track last mouse pos for MacControl cmd
  document.addEventListener('mousemove', (e) => {
    if (window.cortexTerminal) {
       window.cortexTerminal.lastMouseX = e.clientX;
       window.cortexTerminal.lastMouseY = e.clientY;
    }
  });

  window.triggerUltrathink = async () => {
    const term = window.cortexTerminal;
    if (!term.isActive) term.toggle();
    
    document.body.classList.add('cterm-shake-x100');
    document.body.style.transition = 'filter 0.3s ease-in-out';
    document.body.style.filter = 'contrast(2) saturate(4) hue-rotate(45deg)';
    
    term.printLine(`<span class="cterm-prompt">CORTEX@moskv:~#</span> <span class="cterm-cmd">maccontrol_omega --super-yolo-especial --deep-think --deep-research --frontera-x10</span>`);
    
    const result = await term.cmdSuperYOLOESPECIAL();
    await term.printTypewriter(result, 1, 2);
    term.printLine('');
    
    setTimeout(() => {
      document.body.classList.remove('cterm-shake-x100');
      document.body.style.filter = '';
    }, 15000);
  };
});
