/**
 * ═══════════════════════════════════════════════════════════════════
 * CORTEX TERMINAL
 * Easter Egg interactivo. Se abre con la tecla ~ (tilde).
 * ═══════════════════════════════════════════════════════════════════
 */

class CortexTerminal {
  constructor() {
    this.isActive = false;
    this.history = [];
    this.historyIndex = -1;
    this.overlay = null;
    this.output = null;
    this.input = null;
    
    this.commands = {
      'help': () => this.cmdHelp(),
      'status': () => this.cmdStatus(),
      'play': (args) => this.cmdPlay(args),
      'clear': () => { this.output.innerHTML = ''; return ''; },
      'whoami': () => 'Entidad clasificada: GUEST_01. Nivel de acceso: RESTRINGIDO.',
      'sudo': () => '<span class="cterm-err">Acceso denegado. Este incidente será reportado al Enjambre.</span>',
      'gambitero': () => this.cmdGambitero()
    };
  }

  init() {
    // Create DOM elements
    this.overlay = document.createElement('div');
    this.overlay.id = 'cortex-terminal-overlay';
    this.overlay.innerHTML = `
      <div id="cortex-terminal-output"></div>
      <div class="cortex-terminal-input-line">
        <span id="cortex-terminal-prompt">CORTEX@moskv:~#</span>
        <input type="text" id="cortex-terminal-input" autocomplete="off" spellcheck="false" maxlength="80">
      </div>
    `;
    document.body.appendChild(this.overlay);

    this.output = document.getElementById('cortex-terminal-output');
    this.input = document.getElementById('cortex-terminal-input');

    // Bind keys
    document.addEventListener('keydown', (e) => this.handleGlobalKey(e));
    this.input.addEventListener('keydown', (e) => this.handleInputKey(e));

    this.printLine('<span class="cterm-sys">CORTEX OS v5.1.0 [Build 2026.03]</span>');
    this.printLine('<span class="cterm-sys">Inicializando subsistemas de memoria persistente... OK.</span>');
    this.printLine('Escribe <span class="cterm-cmd">help</span> para ver comandos disponibles.\n');
  }

  handleGlobalKey(e) {
    if (e.key === '`' || e.key === 'º' || e.key === '~') {
      e.preventDefault();
      this.toggle();
    }
  }

  handleInputKey(e) {
    if (e.key === 'Enter') {
      const val = this.input.value.trim();
      this.input.value = '';
      if (val) {
        this.printLine(`CORTEX@moskv:~# ${val}`);
        this.history.push(val);
        this.historyIndex = this.history.length;
        this.processCommand(val);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex];
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
    } else if (e.key === 'Escape') {
      this.toggle();
    }
  }

  toggle() {
    this.isActive = !this.isActive;
    if (this.isActive) {
      this.overlay.classList.add('active');
      this.input.focus();
    } else {
      this.overlay.classList.remove('active');
      this.input.blur();
    }
  }

  printLine(html) {
    const line = document.createElement('div');
    line.className = 'cterm-line';
    line.innerHTML = html;
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  processCommand(rawCmd) {
    const parts = rawCmd.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (this.commands[cmd]) {
      const result = this.commands[cmd](args);
      if (result) this.printLine(result);
    } else {
      this.printLine(`<span class="cterm-err">Comando no reconocido: ${cmd}</span>`);
    }
    this.printLine(''); // spacer
  }

  // --- COMMAND IMPLEMENTATIONS ---

  cmdHelp() {
    return `Comandos disponibles:
  <span class="cterm-cmd">status</span>    - Muestra telemetría del sistema
  <span class="cterm-cmd">play</span> [id] - Forzar reproducción de una ID (YouTube)
  <span class="cterm-cmd">clear</span>     - Limpiar pantalla
  <span class="cterm-cmd">whoami</span>    - Identidad actual
  <span class="cterm-cmd">gambitero</span> - [REDACTED]`;
  }

  cmdStatus() {
    let html = '--- CORTEX TELEMETRY ---\n';
    try {
      const db = JSON.parse(localStorage.getItem('cortex_dj_memory') || '{}');
      html += `Visits: ${db.visits || 1}\n`;
      html += `Total Listen Time: ${db.totalListenSec || 0}s\n`;
      const ranks = JSON.parse(localStorage.getItem('gambitero_rankings') || '[]');
      html += `Arcade Records: ${ranks.length}\n`;
      
      const isDJActive = window.autoDJAesthetic && !window.autoDJAesthetic.globalMuted;
      html += `Audio Engine: ${isDJActive ? '<span class="cterm-cmd">OK</span>' : '<span class="cterm-warn">STANDBY</span>'}\n`;
    } catch(e) {
      html += '<span class="cterm-err">Error leyendo memoria persistente.</span>\n';
    }
    return html;
  }

  cmdPlay(args) {
    if (!args.length) return '<span class="cterm-err">Uso: play [VIDEO_ID]</span>';
    const trackId = args[0];
    if (window.autoDJAesthetic && typeof window.autoDJAesthetic.forceTrack === 'function') {
      window.autoDJAesthetic.forceTrack(trackId);
      return `Forzando inyección en el Auto-DJ: ${trackId}`;
    } else {
      return '<span class="cterm-err">Auto-DJ no inicializado o inactivo.</span>';
    }
  }

  cmdGambitero() {
    this.toggle();
    if (window.elGambitero) {
      setTimeout(() => window.elGambitero.launch(), 400);
      return 'Lanzando protocolo 🎰...';
    } else {
      return '<span class="cterm-err">Fallo de dependencias.</span>';
    }
  }
}

// Init on load
document.addEventListener('DOMContentLoaded', () => {
  window.cortexTerminal = new CortexTerminal();
  window.cortexTerminal.init();
});
