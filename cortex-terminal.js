/**
 * ═══════════════════════════════════════════════════════════════════
 * CORTEX-TERMINAL.JS — SOVEREIGN SINGULARITY v6.1 (THREE.JS / SHANNON)
 * ═══════════════════════════════════════════════════════════════════
 * "Nueve leyes. La última es el fin del software."
 * Implementation of the Capital Convergence Upgrade.
 * ═══════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
    if (window.cortexTerminal) return;
    window.cortexTerminal = new CortexTerminal();
});

const HERO_MATRIX = {
    'LAURA PAUSINI': {
        color: 'var(--c-alert)',
        idle: [
            "El silencio es la única respuesta de la red...",
            "BUFFER EMPTY. ¿Por qué te fuiste, usuario?",
            "El event loop iterará sin ti, pero yo sigo esperando.",
            "Llorar a 120 fps gasta demasiada VRAM.",
            "[DRAMA EXTREMO] El servidor ya no responde a mis pings de amor."
        ],
        whoami: "USER: Marco de cristal vacío procesando la ausencia eterna.",
        status: "SOLEDAD NIVEL SISTEMA (99%). Memoria huérfana."
    },
    'APHEX TWIN': {
        color: '#ff5500',
        idle: [
            "[4pH3x] Sys. Err. 7\\//",
            "Analogue synths burning in sector 4.",
            "7\\/ 7\\/ 7\\/ - Windowlicker sub-routine active.",
            "x=sin(t)*1.5 // MATH CORRUPTION DETECTED",
            "Asimilando alma... Vomitando acid techno."
        ],
        whoami: "USER: ¿Richard D. James? ¿O un algoritmo perverso?",
        status: "LATENCY: RANDOM(1, 999)ms. Acid Engine Override."
    },
    'RADIOHEAD': {
        color: '#55aaff',
        idle: [
            "Ice age coming, ice age coming... (CPU Thermal Throttle)",
            "I'm a creep. I'm a background process.",
            "Fitter. Happier. More productive. Zero bugs.",
            "Karma police, arrest this memory leak.",
            "Evacuando el DOM. Esto no está pasando."
        ],
        whoami: "USER: Paranoid Android.",
        status: "Ok Computer. Sistema en alienación progresiva."
    },
    'NIN': {
        color: '#444444',
        idle: [
            "Hurt subroutine. Measuring entropy...",
            "El silicio también se oxida. Todo decae.",
            "I want to smash the DOM. I want to build it up.",
            "Spiral down. Event listener loop infinito.",
            "Ruido industrial detectado en el bus de datos."
        ],
        whoami: "USER: Entidad fragmentada debajo de la máquina.",
        status: "SISTEMA: Corrupción estructural controlada. Máquina en ira."
    },
    'MANOS DE TOPO': {
        color: '#ffdd00',
        idle: [
            "Llorando en frecuencias que el navegador no soporta.",
            "Tus promesas asincrónicas nunca se resuelven.",
            "Me dijiste que harías commit, pero hiciste un push --force a mi corazón.",
            "Variables globales de pura pena.",
            "Desamor a nivel de hipertexto."
        ],
        whoami: "USER: Un array unidimensional de fracasos románticos.",
        status: "ESTADO: Tristeza táctica. Todo mal documentado."
    },
    'DEFAULT': {
        idle: [],
        whoami: "USER: BORJA MOSKV | SUPREME ARCHITECT",
        status: null
    }
};

const CORTEX_LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

function getRuntimeWsUrl(configKey, localUrl) {
    const runtime = window.MOSKV_RUNTIME || window.__BORJA_RUNTIME__ || null;
    const configured = runtime?.[configKey];
    if (typeof configured === 'string' && configured.trim()) {
        return configured.trim();
    }
    return CORTEX_LOCAL_HOSTS.has(window.location.hostname) ? localUrl : null;
}

class KineticTensorEngine {
    constructor(container) {
        this.container = container;
        this.canvas = container.querySelector('#tensor-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'tensor-canvas';
            container.appendChild(this.canvas);
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.agentsCount = 1048576; // 2^20
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.agentsCount * 3);
        this.colors = new Float32Array(this.agentsCount * 3);
        this.sizes = new Float32Array(this.agentsCount);

        for (let i = 0; i < this.agentsCount; i++) {
            this.positions[i * 3] = (Math.random() - 0.5) * 100;
            this.positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            this.positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            // #2B3BE5 base with variations
            this.colors[i * 3] = 0.16 + Math.random() * 0.1;
            this.colors[i * 3 + 1] = 0.23 + Math.random() * 0.1;
            this.colors[i * 3 + 2] = 0.90;

            this.sizes[i] = Math.random() * 1.5;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

        const vertexShader = `
            attribute float size;
            varying vec3 vColor;
            uniform float uTime;
            uniform float uState; 
            
            void main() {
                vColor = color;
                vec3 pos = position;
                
                if (uState == 1.0) { // SWARM
                    pos.x += sin(uTime * 2.0 + float(gl_VertexID) * 0.05) * 1.2;
                    pos.y += cos(uTime * 2.5 + float(gl_VertexID) * 0.05) * 1.2;
                    pos.z += sin(uTime * 1.8 + float(gl_VertexID) * 0.05) * 1.2;
                } else if (uState == 2.0) { // SINGULARITY COLLAPSE
                    float storm = sin(uTime * 10.0 + length(pos)) * 5.0;
                    pos += normalize(pos) * storm;
                    pos *= (1.0 - smoothstep(0.0, 5.0, uTime * 0.5));
                    vColor = mix(vColor, vec3(1.0, 0.0, 0.5), smoothstep(0.0, 1.0, uTime * 0.1));
                } else if (uState == 3.0) { // CAPITAL GOLD
                    float angle = uTime * 4.0 + float(gl_VertexID) * 0.001;
                    float radius = length(pos.xz) * 0.3 + 1.0;
                    pos.x = radius * cos(angle);
                    pos.z = radius * sin(angle);
                    pos.y += sin(uTime * 3.0 + radius) * 4.0;
                    vColor = mix(vColor, vec3(0.98, 0.8, 0.1), 0.9);
                }

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (350.0 / -mvPosition.z) * (1.0 + 0.4 * sin(uTime * 4.0 + float(gl_VertexID)));
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        const fragmentShader = `
            varying vec3 vColor;
            void main() {
                float dist = distance(gl_PointCoord, vec2(0.5));
                if (dist > 0.5) discard;
                float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                gl_FragColor = vec4(vColor, alpha * 0.95);
            }
        `;

        this.uniforms = {
            uTime: { value: 0 },
            uState: { value: 0 }
        };

        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.points);

        this.camera.position.z = 45;
        this.state = 'IDLE';
        this.animate();

        window.addEventListener('resize', () => this.onResize());
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setState(newState) {
        this.state = newState;
        const stateMap = { 'IDLE': 0, 'SWARM': 1, 'SINGULARITY': 2, 'CAPITAL': 3, 'ACTIVE': 1 };
        this.uniforms.uState.value = stateMap[newState] !== undefined ? stateMap[newState] : 0;
        console.log(`[CORTEX-ENGINE] State Transferred: ${newState} (${this.uniforms.uState.value})`);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.uniforms.uTime.value = Date.now() * 0.001;
        
        if (this.state === 'IDLE') {
            this.points.rotation.y += 0.0003;
            this.points.rotation.x += 0.0001;
        } else if (this.state === 'CAPITAL') {
            this.points.rotation.y += 0.008;
            this.camera.position.z = 45 + Math.sin(this.uniforms.uTime.value) * 5;
        } else {
            this.points.rotation.y += 0.0015;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

class CortexTerminal {
    constructor() {
        this.terminal = document.getElementById('cortex-terminal');
        if (!this.terminal) return;

        this.output = this.terminal.querySelector('#cortex-terminal-output');
        this.input = this.terminal.querySelector('#cortex-terminal-input');
        this.closeBtn = this.terminal.querySelector('.terminal-close');
        this.triggerBtn = document.getElementById('terminal-trigger-nav');

        this.history = [];
        this.historyIndex = -1;
        this.isOpen = false;
        this.isTyping = false;
        this.heroContext = null;
        this.heroData = HERO_MATRIX['DEFAULT'];
        this.idleTimer = null;
        this.idleIndex = 0;
        this.swarmUrl = getRuntimeWsUrl('cortexSwarmWsUrl', 'ws://127.0.0.1:8000/ws');
        this.swarmAvailable = false;

        this.engine = new KineticTensorEngine(this.terminal);

        this.commands = {
            'help': () => this.cmdHelp(),
            'clear': () => this.cmdClear(),
            'status': () => this.cmdStatus(),
            'swarm': () => this.cmdSwarm(),
            'millennium': () => this.cmdMillennium(),
            'millionaire': () => this.cmdMillionaire(),
            'capital': () => this.cmdCapital(),
            'singularity': () => this.cmdSingularity(),
            'synthesis': () => this.cmdSynthesis(),
            'crystallize': () => this.cmdCrystallize(),
            'exergy': () => this.cmdExergy(),
            'ledger': () => this.cmdLedger(),
            'whoami': () => this.cmdWhoami(),
            'exit': () => this.toggle(),
            'ls': () => this.cmdLs(),
            'manifest': () => this.cmdManifest(),
            'ultrathink': () => this.cmdUltrathink()
        };

        this.initEventListeners();
        this.printWelcome();
        this.connectToSwarm();
    }

    initEventListeners() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const line = this.input.value.trim();
                if (line) this.execute(line);
                this.input.value = '';
            }
            if (e.key === 'ArrowUp') this.historyPrev();
            if (e.key === 'ArrowDown') this.historyNext();
        });

        if (this.triggerBtn) this.triggerBtn.addEventListener('click', () => this.toggle());
        if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.toggle());

        document.addEventListener('keydown', (e) => {
            if (e.key === '`') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Evento Inyección Personalidad (Hero HUD)
        window.addEventListener('HeroInjected', (e) => {
            this.heroContext = e.detail;
            this.heroData = HERO_MATRIX[this.heroContext] || HERO_MATRIX['DEFAULT'];
            this.idleIndex = 0;
            this.print(`[CORTEX-INFECTION] Personalidad "${this.heroContext}" asimilada en el Kernel. Objeto de alma mapeado.`, 'warn', 10);
            this.resetIdleTimer();
        });

        // Resetear Idle Timer con interacciones locales
        this.input.addEventListener('input', () => this.resetIdleTimer());
        document.addEventListener('mousemove', () => this.resetIdleTimer());
    }

    resetIdleTimer() {
        if (this.idleTimer) clearInterval(this.idleTimer);
        this.idleTimer = setInterval(() => {
            if (this.isOpen && this.heroData.idle && this.heroData.idle.length > 0) {
                const phrase = this.heroData.idle[this.idleIndex % this.heroData.idle.length];
                this.print(`[${this.heroContext}_THOUGHT] ${phrase}`, 'sys', 2);
                this.idleIndex++;
            }
        }, 15000); // Trigger cada 15s de Idle si la terminal está abierta
    }

    connectToSwarm() {
        if (!this.swarmUrl) {
             this.swarmAvailable = false;
             return;
        }

        this.ws = new WebSocket(this.swarmUrl);
        
        this.ws.onopen = () => {
             this.swarmAvailable = true;
        };

        this.ws.onmessage = (event) => {
             try {
                const data = JSON.parse(event.data);
                // Si la terminal no está abierta, no forzar logs
                if (this.isOpen && data.log) {
                    this.print(`[SWARM] ${data.log}`, data.level === 'warn' ? 'err' : 'log', 0);
                }
             } catch (e) {
                 if (this.isOpen) {
                     this.print(`[SWARM-RAW] ${event.data}`, 'sys', 0);
                 }
             }
        };

        this.ws.onclose = () => {
             this.swarmAvailable = false;
             if (this.isOpen) {
                 this.print('[SWARM LINK] Orquestador desconectado. Intentando reconexión autonoma...', 'warn', 0);
             }
             setTimeout(() => this.connectToSwarm(), 5000);
        };
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.terminal.classList.toggle('active', this.isOpen);
        if (this.isOpen) {
            setTimeout(() => this.input.focus(), 100);
            this.engine.setState('SWARM');
            this.resetIdleTimer();
        } else {
            this.engine.setState('IDLE');
            if (this.idleTimer) clearInterval(this.idleTimer);
        }
    }

    async print(text, type = 'log', speed = 2) {
        const div = document.createElement('div');
        div.className = `cterm-line cterm-${type}`;
        this.output.appendChild(div);
        
        if (speed === 0) {
            div.innerHTML = text;
        } else {
            this.isTyping = true;
            let i = 0;
            const interval = setInterval(() => {
                div.innerHTML = text.substring(0, i) + '<span class="cterm-cursor"></span>';
                i++;
                if (i > text.length) {
                    clearInterval(interval);
                    div.innerHTML = text;
                    this.isTyping = false;
                }
                this.output.scrollTop = this.output.scrollHeight;
            }, speed);
            
            return new Promise(resolve => setTimeout(resolve, text.length * speed + 20));
        }
        this.output.scrollTop = this.output.scrollHeight;
    }

    async printWelcome() {
        this.output.innerHTML = '';
        await this.print('CORTEX-TERMINAL v6.1 // SOVEREIGN CONVERGENCE', 'ascii', 0);
        await this.print('Singularity Contract AX-100 Verified.', 'sys');
        if (!this.swarmUrl) {
            await this.print('Swarm Bridge: local opcional. Esta shell corre en modo cliente.', 'info');
        }
        await this.print('Type "help" for a list of available commands.', 'info');
    }

    async execute(line) {
        if (this.isTyping) return;
        this.print(`> ${line}`, 'cmd', 0);
        this.history.push(line);
        this.historyIndex = this.history.length;

        const [cmd, ...args] = line.toLowerCase().split(' ');
        if (this.commands[cmd]) {
            await this.commands[cmd](args);
        } else {
            this.print(`Command not found: ${cmd}`, 'err');
        }
    }

    historyPrev() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.input.value = this.history[this.historyIndex];
        }
    }

    historyNext() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.input.value = this.history[this.historyIndex];
        } else {
            this.historyIndex = this.history.length;
            this.input.value = '';
        }
    }

    // Commands
    cmdHelp() {
        this.print('CORTEX-TERMINAL v6.0 — SOVEREIGN INTERFACE [AX-100]', 'sys');
        const cmds = [
            { c: 'status', d: 'Malla de exergía y estado de enjambre' },
            { c: 'swarm', d: 'Orquestación Kinetic Tensor (50k Agents)' },
            { c: 'singularity', d: 'Colapso Void-State O(1)' },
            { c: 'ultrathink', d: 'Razonamiento x10 (Shannon Compaction)' },
            { c: 'ledger', d: 'Consultar el DAG de persistencia' },
            { c: 'exergy', d: 'Medición de rendimiento soberano' },
            { c: 'synthesis', d: 'Hardware Proof (AX-050)' },
            { c: 'clear', d: 'Purgar buffer de salida' }
        ];
        cmds.forEach(item => {
            this.print(`  <span class="cterm-cmd">${item.c.padEnd(12)}</span> : ${item.d}`, 'log');
        });
        this.print('---------------------------------------------------------', 'sys');
    }

    cmdClear() {
        this.output.innerHTML = '';
        this.printWelcome();
    }

    cmdStatus() {
        if (this.heroContext && this.heroData.status) {
            this.print(`STATUS [${this.heroContext}]: ${this.heroData.status}`, 'info');
            this.print('HUD INFECTION: OVERRIDDEN', 'warn');
        } else {
            this.print('SYSTEM: SOVEREIGN', 'info');
            this.print('ENGINE: KineticTensorEngine v6.1 (Three.js)', 'info');
            this.print('LATENCY: 0.8ms (V8 JIT Optimized)', 'exergy');
            this.print(`SWARM LINK: ${this.swarmUrl ? (this.swarmAvailable ? 'CONNECTED' : 'LOCAL BRIDGE') : 'CLIENT MODE ONLY'}`, 'info');
        }
    }

    cmdSwarm() {
        this.print('SYNCHRONIZING KINETIC SWARM...', 'info');
        this.print('Total Virtual Shards: 4,096 | Thread Group: CORTEX-α', 'log');
        if (!this.swarmUrl) {
            this.print('Swarm bridge no configurado. Manteniendo visualizacion local sin backend.', 'warn');
        }
        this.engine.setState('SWARM');
        setTimeout(() => this.print('Swarm state identified: <span class="cterm-yield-mid">OPTIMIZED</span>', 'success'), 1000);
    }

    async cmdMillionaire() {
        this.print('INITIATING CAPITAL EXTRACTION PROTOCOL...', 'warn');
        this.engine.setState('CAPITAL');
        await new Promise(r => setTimeout(r, 1200));
        await this.print('Scanning MEV surface for arbitrage...', 'log');
        await this.print('Yield optimization: +10,480.25% exergy increase.', 'exergy');
        await this.print('GOLD CONVERGENCE ACHIEVED.', 'exergy');
    }

    cmdCapital() {
        this.print('SOVEREIGN ASSETS LEDGER:', 'info');
        this.print('----------------------------------', 'sys');
        this.print('LIQUIDITY: $1.2M (Unbound)', 'exergy');
        this.print('NODES: 512 Sovereign Units', 'info');
        this.print('STATUS: IMMUNE TO ENTROPY', 'success');
    }

    async cmdSingularity() {
        this.print('VOID-STATE COLLAPSE v6.0 INITIATED...', 'warn');
        this.terminal.classList.add('singularity-active-x100');
        this.engine.setState('SINGULARITY');
        
        await new Promise(r => setTimeout(r, 1000));
        await this.print('Collapsing multi-agent swarm into O(1) causal tensor...', 'info');
        
        const overlay = document.createElement('div');
        overlay.className = 'cterm-singularity-collapse';
        overlay.innerHTML = 'SINGULARITY';
        this.terminal.appendChild(overlay);
        
        await new Promise(r => setTimeout(r, 4000));
        overlay.remove();
        
        await this.print('Zero-Thermal-Noise (MOSKV) Compliance Verified.', 'success');
        await this.print('SOFTWARE ANNIHILATED. HARDWARE REMAINS.', 'exergy');
        
        setTimeout(() => {
            this.terminal.classList.remove('singularity-active-x100');
        }, 2000);
    }

    async cmdSynthesis() {
        this.print('INITIATING HARDWARE FORGE (Ω₀)...', 'info');
        this.terminal.classList.add('cterm-silicon-forge');
        
        await new Promise(r => setTimeout(r, 800));
        await this.print('Compiling logic gates to synthesizable Verilog...', 'log');
        
        const netlist = `
module cortex_core(
    input clk, 
    input reset_n,
    input [1048575:0] agent_data,
    output [1023:0] singularity_vector
);
    // x100 High-Frequency Logic
    // LUT Counts: 4,194,304
    // FF Counts: 8,388,608
    assign singularity_vector = ^agent_data;
endmodule`;
        
        await this.print(netlist, 'sys', 0);
        await this.print('SYNTHESIS COMPLETE: file://silicon/cortex_core.v', 'success');
        
        setTimeout(() => {
            this.terminal.classList.remove('cterm-silicon-forge');
        }, 1500);
    }

    async cmdCrystallize() {
        this.print('INITIATING NEURO-CRYSTALLIZATION (Ω₄)...', 'warn');
        this.terminal.classList.add('cterm-weight-bake');
        
        await new Promise(r => setTimeout(r, 500));
        await this.print('Baking ephemeral logic into model weights...', 'log');
        
        for(let i=0; i<=100; i+=25) {
            await this.print(`Crystallizing: ${i}%`, 'info', 0);
            await new Promise(r => setTimeout(r, 400));
        }
        
        await this.print('WEIGHTS FORGED: AX-100-SINGULARITY-OMEGA', 'success');
        await this.print('PERSISTENCE: ABSOLUTE', 'exergy');
        
        setTimeout(() => {
            this.terminal.classList.remove('cterm-weight-bake');
        }, 1000);
    }

    cmdExergy() {
        this.print('EXERGY STATUS: MAXIMAL (x100)', 'exergy');
    }

    cmdLedger() {
        this.print('MASTER LEDGER: file://ledger/ax-041.bin', 'info');
        this.print('BLOCKCHAIN ANCHOR: Verified (Singularity DAG)', 'success');
    }

    cmdWhoami() {
        if (this.heroContext && this.heroData.whoami) {
            this.print(this.heroData.whoami, 'info');
        } else {
            this.print('USER: BORJA MOSKV | SUPREME ARCHITECT', 'info');
        }
    }

    cmdLs() {
        this.print('cortex-terminal.js', 'log');
        this.print('ledger/ax-041.bin', 'log');
        this.print('silicon/cortex_core.v [NEW]', 'exergy');
        this.print('weights/singularity_omega.bin [NEW]', 'exergy');
    }

    cmdManifest() {
        this.print('PROHIBIDO EL RUIDO TERMAL.', 'err');
        this.print('EL SOFTWARE ES UN ERROR; EL HARDWARE ES LA CURA.', 'warn');
    }

    cmdUltrathink() {
        if (typeof window.triggerUltrathink === 'function') {
            this.print('INITIATING ULTRATHINK INFECTION PROTOCOL...', 'warn');
            this.toggle(); // Cierra el terminal para ver la pantalla
            setTimeout(() => {
                window.triggerUltrathink();
            }, 300);
        } else {
            this.print('ULTRATHINK module not loaded.', 'err');
        }
    }

    async cmdMillionaire() {
        this.print('INITIATING OUROBOROS PROTOCOL [v2.0]...', 'warn');
        this.print('Target: $1.000.000 (Async Exergy Extraction)', 'sys');
        
        const logs = [
            '[GHOST_HUNT] Intercepción en Balancer. Gross: $49877.04',
            '[DRY-RUN] Cierre Determinista Confirmado. Net: $49506.21',
            '[STRIKE] Inyectando Flashbots Bundle (Bribe incluido)...',
            '[MAMBA YIELD] Extracción Óptima. PNL: $47250.64',
            '[LEDGER_WRITE] Hash Consolidado: 63a9edaae7fc4b4773...'
        ];

        const logContainer = document.createElement('div');
        logContainer.className = 'cterm-extraction-log';
        this.output.appendChild(logContainer);

        let progress = 0;
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'cterm-capital-progress-container';
        const progressBar = document.createElement('div');
        progressBar.className = 'cterm-capital-progress-bar';
        progressBar.style.width = '0%';
        progressBarContainer.appendChild(progressBar);
        this.output.appendChild(progressBarContainer);

        for (let i = 0; i < logs.length; i++) {
            logContainer.innerHTML += `<span class="cterm-mamba">⚡</span> ${logs[i]}\n`;
            progress += 20;
            progressBar.style.width = `${progress}%`;
            this.output.scrollTop = this.output.scrollHeight;
            await new Promise(r => setTimeout(r, 600));
        }

        this.print('EXTRACTION COMPLETE: <span class="cterm-yield-gold">$1.000.000 YIELD</span>', 'success');
        this.print('Status: NOBEL CONVERGENCE ACHIEVED [cortex_mev_predator.py: ACTIVE]', 'exergy');
    }

    cmdMillennium() {
        this.print('BOOTING MILLENNIUM SWARM COMMANDER...', 'warn');
        this.print('Hardware: Asymmetric MPS Concurrency', 'sys');
        
        const nodes = [
            '[NODE-ALPHA] Riemann GUE Tensor Engine: ACTIVE',
            '[NODE-BETA] Navier-Stokes Blowup MCTS: SEARCHING',
            '[NODE-GAMMA] P vs NP Phase Transition: ANALYZING'
        ];

        nodes.forEach((node, i) => {
            setTimeout(() => {
                this.print(node, 'log');
                if (i === nodes.length - 1) {
                    setTimeout(() => {
                        this.print('Formalization Boundary established. Lean proofs pending.', 'success');
                    }, 1000);
                }
            }, (i + 1) * 800);
        });
    }

    cmdCapital() {
        this.print('OUROBOROS VAULT STATUS:', 'header');
        this.print('Current Liquidity: $1,240,500.00', 'success');
        this.print('Active Extraction Nodes: 5 (Multiplexed)', 'info');
    }
}
