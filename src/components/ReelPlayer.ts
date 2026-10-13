import { AudioEngine } from '../audio/AudioEngine';
import { WorkItem } from '../data/works';

export class ReelPlayer {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audioEngine: AudioEngine;
  private currentWork: WorkItem | null = null;

  // Animation and physics state
  private animFrameId: number = 0;
  private lastTimestamp: number = 0;
  private reelRotation: number = 0;
  private reelAngularVelocity: number = 0;
  private targetAngularVelocity: number = 0;

  // VU Meter needles ballistics
  private needleLeft: number = 0;
  private needleRight: number = 0;

  // DOM controls
  private controlsContainer!: HTMLElement;
  private playBtn!: HTMLButtonElement;
  private timeDisplay!: HTMLElement;
  private satBtn!: HTMLButtonElement;
  private wowBtn!: HTMLButtonElement;
  private progressSlider!: HTMLInputElement;

  constructor(container: HTMLElement, audioEngine: AudioEngine) {
    this.container = container;
    this.audioEngine = audioEngine;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'w-full h-auto rounded border border-neutral-800 bg-[#0e0e0e] shadow-2xl block';
    this.ctx = this.canvas.getContext('2d')!;

    this.buildDOM();
    this.setupEvents();
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
    this.startRenderLoop();
  }

  private buildDOM() {
    this.container.innerHTML = '';
    this.container.className = 'reel-deck-wrapper w-full flex flex-col gap-3 font-mono';

    // Deck Header Banner
    const deckHeader = document.createElement('div');
    deckHeader.className = 'flex items-center justify-between text-[11px] text-neutral-400 tracking-widest uppercase border-b border-neutral-800/80 pb-2 px-1';
    deckHeader.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="font-bold text-neutral-200">STUDER A-60 / REVOX TRANSDUCTION DECK</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="hidden sm:inline text-neutral-500">SPEED: 15 IPS</span>
        <span class="text-neutral-400">FLUX: 355 nWb/m</span>
      </div>
    `;

    // Canvas container
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'relative w-full overflow-hidden rounded bg-black border border-neutral-800/90 shadow-inner';
    canvasWrap.appendChild(this.canvas);

    // Transport & Controls bar
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.className = 'flex flex-col gap-2 p-3 bg-[#121212] rounded border border-neutral-800/80 shadow-md';

    // Timeline bar
    const timelineWrap = document.createElement('div');
    timelineWrap.className = 'flex items-center gap-3 w-full';

    this.timeDisplay = document.createElement('span');
    this.timeDisplay.className = 'text-xs text-amber-400/90 tracking-widest font-mono select-none min-w-[95px]';
    this.timeDisplay.textContent = '00:00 / 00:00';

    this.progressSlider = document.createElement('input');
    this.progressSlider.type = 'range';
    this.progressSlider.min = '0';
    this.progressSlider.max = '100';
    this.progressSlider.value = '0';
    this.progressSlider.className = 'flex-1 h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400';

    timelineWrap.appendChild(this.timeDisplay);
    timelineWrap.appendChild(this.progressSlider);

    // Transport buttons
    const buttonsWrap = document.createElement('div');
    buttonsWrap.className = 'flex items-center justify-between gap-2 pt-1 flex-wrap';

    const leftButtons = document.createElement('div');
    leftButtons.className = 'flex items-center gap-1.5';

    const rewBtn = document.createElement('button');
    rewBtn.className = 'px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-neutral-300 text-xs rounded border border-neutral-700/60 uppercase tracking-wider transition-colors';
    rewBtn.textContent = '◀◀ -10s';
    rewBtn.title = 'Rewind 10 seconds';
    rewBtn.onclick = () => this.audioEngine.seekRelative(-10);

    this.playBtn = document.createElement('button');
    this.playBtn.className = 'px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 hover:text-amber-300 text-xs font-bold rounded border border-amber-500/50 uppercase tracking-widest transition-all';
    this.playBtn.textContent = '▶ PLAY';
    this.playBtn.onclick = () => this.audioEngine.togglePlay();

    const stopBtn = document.createElement('button');
    stopBtn.className = 'px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-neutral-300 text-xs rounded border border-neutral-700/60 uppercase tracking-wider transition-colors';
    stopBtn.textContent = '■ STOP';
    stopBtn.onclick = () => this.audioEngine.stop();

    const fwdBtn = document.createElement('button');
    fwdBtn.className = 'px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700 text-neutral-300 text-xs rounded border border-neutral-700/60 uppercase tracking-wider transition-colors';
    fwdBtn.textContent = '+10s ▶▶';
    fwdBtn.title = 'Forward 10 seconds';
    fwdBtn.onclick = () => this.audioEngine.seekRelative(10);

    leftButtons.appendChild(rewBtn);
    leftButtons.appendChild(this.playBtn);
    leftButtons.appendChild(stopBtn);
    leftButtons.appendChild(fwdBtn);

    const rightButtons = document.createElement('div');
    rightButtons.className = 'flex items-center gap-2';

    this.satBtn = document.createElement('button');
    this.satBtn.className = 'px-3 py-1.5 bg-neutral-900 text-amber-400/90 text-xs rounded border border-amber-500/40 uppercase tracking-widest font-mono text-[10px] transition-colors';
    this.satBtn.textContent = 'TAPE SAT: [ON]';
    this.satBtn.title = 'Toggle warm analog tape saturation filter';
    this.satBtn.onclick = () => {
      const current = this.audioEngine.getSaturation();
      this.audioEngine.setSaturation(!current);
      this.updateSatBtnText();
    };

    this.wowBtn = document.createElement('button');
    this.wowBtn.className = 'px-2.5 py-1.5 bg-amber-500/10 text-amber-400 text-xs rounded border border-amber-500/50 uppercase tracking-widest font-mono text-[10px] transition-colors';
    this.wowBtn.textContent = 'WOW/FLUTTER: [ON]';
    this.wowBtn.title = 'Toggle analog tape wow and flutter speed variation';
    this.wowBtn.onclick = () => {
      const cur = this.audioEngine.getWowFlutter();
      this.audioEngine.setWowFlutter(!cur);
      this.updateWowBtnText();
    };

    rightButtons.appendChild(this.satBtn);
    rightButtons.appendChild(this.wowBtn);

    const volWrap = document.createElement('div');
    volWrap.className = 'flex items-center gap-1.5 bg-neutral-900 px-2 py-1 rounded border border-neutral-700/60';
    
    const muteBtn = document.createElement('button');
    muteBtn.className = 'text-[10px] text-amber-400 font-mono hover:text-amber-300';
    muteBtn.textContent = 'VOL';
    muteBtn.title = 'Click to toggle mute';
    
    const volSlider = document.createElement('input');
    volSlider.type = 'range';
    volSlider.min = '0';
    volSlider.max = '100';
    volSlider.value = String(Math.round(this.audioEngine.getVolume() * 100));
    volSlider.className = 'w-16 h-1 bg-neutral-800 rounded appearance-none cursor-pointer accent-amber-500';
    volSlider.title = 'Master Output Level';

    const volLabel = document.createElement('span');
    volLabel.className = 'text-[10px] text-neutral-400 font-mono w-7 text-right select-none';
    volLabel.textContent = `${volSlider.value}%`;

    volSlider.oninput = () => {
      const val = parseInt(volSlider.value, 10) / 100;
      this.audioEngine.setVolume(val);
      volLabel.textContent = `${volSlider.value}%`;
      muteBtn.textContent = val === 0 ? 'MUT' : 'VOL';
    };

    muteBtn.onclick = () => {
      const muted = this.audioEngine.toggleMute();
      muteBtn.textContent = muted ? 'MUT' : 'VOL';
      volLabel.textContent = muted ? '0%' : `${Math.round(this.audioEngine.getVolume() * 100)}%`;
      volLabel.className = muted ? 'text-[10px] text-red-400 font-mono w-7 text-right select-none' : 'text-[10px] text-neutral-400 font-mono w-7 text-right select-none';
    };

    volWrap.appendChild(muteBtn);
    volWrap.appendChild(volSlider);
    volWrap.appendChild(volLabel);
    rightButtons.appendChild(volWrap);

    buttonsWrap.appendChild(leftButtons);
    buttonsWrap.appendChild(rightButtons);

    this.controlsContainer.appendChild(timelineWrap);
    this.controlsContainer.appendChild(buttonsWrap);

    this.container.appendChild(deckHeader);
    this.container.appendChild(canvasWrap);
    this.container.appendChild(this.controlsContainer);
  }

  private updateSatBtnText() {
    const isSat = this.audioEngine.getSaturation();
    this.satBtn.textContent = `TAPE SAT: [${isSat ? 'ON' : 'OFF'}]`;
    if (isSat) {
      this.satBtn.className = 'px-3 py-1.5 bg-amber-500/10 text-amber-400 text-xs rounded border border-amber-500/50 uppercase tracking-widest font-mono text-[10px]';
    } else {
      this.satBtn.className = 'px-3 py-1.5 bg-neutral-900 text-neutral-400 text-xs rounded border border-neutral-700 uppercase tracking-widest font-mono text-[10px]';
    }
  }

  private updateWowBtnText() {
    const isW = this.audioEngine.getWowFlutter();
    this.wowBtn.textContent = `WOW/FLUTTER: [${isW ? 'ON' : 'OFF'}]`;
    if (isW) {
      this.wowBtn.className = 'px-2.5 py-1.5 bg-amber-500/10 text-amber-400 text-xs rounded border border-amber-500/50 uppercase tracking-widest font-mono text-[10px]';
    } else {
      this.wowBtn.className = 'px-2.5 py-1.5 bg-neutral-900 text-neutral-400 text-xs rounded border border-neutral-700 uppercase tracking-widest font-mono text-[10px]';
    }
  }

  private setupEvents() {
    this.audioEngine.onPlayStateChange = (isPlaying) => {
      this.targetAngularVelocity = isPlaying ? 2.8 : 0;
      this.playBtn.textContent = isPlaying ? '❚❚ PAUSE' : '▶ PLAY';
      if (isPlaying) {
        this.playBtn.classList.add('bg-amber-500', 'text-black');
        this.playBtn.classList.remove('bg-amber-500/20', 'text-amber-400');
      } else {
        this.playBtn.classList.remove('bg-amber-500', 'text-black');
        this.playBtn.classList.add('bg-amber-500/20', 'text-amber-400');
      }
    };

    this.audioEngine.onTimeUpdate = (currentTime, duration) => {
      const curStr = this.formatTime(currentTime);
      const durStr = this.formatTime(duration);
      this.timeDisplay.textContent = `${curStr} / ${durStr}`;

      if (duration > 0 && !this.progressSlider.matches(':active')) {
        this.progressSlider.value = ((currentTime / duration) * 100).toString();
      }
    };

    this.progressSlider.addEventListener('input', () => {
      const val = parseFloat(this.progressSlider.value);
      const state = this.audioEngine.getPlaybackState();
      if (state.duration > 0) {
        const targetSec = (val / 100) * state.duration;
        this.audioEngine.seek(targetSec);
      }
    });
  }

  public loadWork(work: WorkItem) {
    this.currentWork = work;
    this.audioEngine.loadTrack(work.audioUrl);
    this.timeDisplay.textContent = `00:00 / ${work.duration || '00:00'}`;
    this.progressSlider.value = '0';
  }

  private resizeCanvas() {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    const w = rect && rect.width > 0 ? rect.width : 640;
    const h = Math.round(w * 0.48); // Classic deck aspect ratio
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.scale(dpr, dpr);
  }

  private formatTime(secs: number): string {
    if (!secs || isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  private startRenderLoop() {
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      this.updatePhysics(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private updatePhysics(dt: number) {
    // Angular inertia simulation for tape reels
    const smoothing = 4.0;
    this.reelAngularVelocity += (this.targetAngularVelocity - this.reelAngularVelocity) * smoothing * dt;
    this.reelRotation += this.reelAngularVelocity * dt;

    // VU Meters ballistics
    const levels = this.audioEngine.getVUMeterLevels();
    const attack = 14.0;
    const decay = 4.5;

    // Left needle
    if (levels.left > this.needleLeft) {
      this.needleLeft += (levels.left - this.needleLeft) * attack * dt;
    } else {
      this.needleLeft -= (this.needleLeft - levels.left) * decay * dt;
    }

    // Right needle
    if (levels.right > this.needleRight) {
      this.needleRight += (levels.right - this.needleRight) * attack * dt;
    } else {
      this.needleRight -= (this.needleRight - levels.right) * decay * dt;
    }

    this.needleLeft = Math.max(0, Math.min(1.0, this.needleLeft));
    this.needleRight = Math.max(0, Math.min(1.0, this.needleRight));
  }

  private render() {
    const w = parseFloat(this.canvas.style.width) || 640;
    const h = parseFloat(this.canvas.style.height) || 300;

    this.ctx.clearRect(0, 0, w, h);

    // 1. Deck Faceplate
    this.drawFaceplate(w, h);

    // Geometry parameters
    const reelRadius = h * 0.38;
    const reelY = h * 0.44;
    const reelAX = w * 0.24; // Left (Supply)
    const reelBX = w * 0.76; // Right (Takeup)

    // Compute tape pack thickness based on track progress
    const state = this.audioEngine.getPlaybackState();
    const progress = state.duration > 0 ? state.currentTime / state.duration : 0.05;
    const minTapeRadius = reelRadius * 0.36;
    const maxTapeRadius = reelRadius * 0.88;

    const leftTapeRadius = maxTapeRadius - (maxTapeRadius - minTapeRadius) * progress;
    const rightTapeRadius = minTapeRadius + (maxTapeRadius - minTapeRadius) * progress;

    // 2. Draw Magnetic Tape threading
    this.drawTapePath(reelAX, reelY, leftTapeRadius, reelBX, reelY, rightTapeRadius, h);

    // 3. Draw Reel A (Supply) and Reel B (Takeup)
    const reelALabel = this.currentWork ? `${this.currentWork.catalogNumber} REEL A` : 'BM-REEL 01';
    const reelBLabel = this.currentWork ? `${this.currentWork.section.substring(0, 6)} MASTER` : 'TAKEUP MASTER';
    this.drawPrecisionReel(reelAX, reelY, reelRadius, leftTapeRadius, this.reelRotation, reelALabel);
    this.drawPrecisionReel(reelBX, reelY, reelRadius, rightTapeRadius, this.reelRotation * 1.05, reelBLabel);

    // 4. Center Tape Head Block
    this.drawHeadBlock(w * 0.5, h * 0.78, w * 0.22, h * 0.22);

    // 5. Dual Analog Needle VU Meters
    this.drawVUMeters(w * 0.5, h * 0.22, w * 0.32, h * 0.28);
  }

  private drawFaceplate(w: number, h: number) {
    // Brushed dark aluminum background
    const grad = this.ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#191919');
    grad.addColorStop(0.5, '#131313');
    grad.addColorStop(1, '#0c0c0c');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Subtle brushed metal horizontal scanlines
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    for (let y = 0; y < h; y += 4) {
      this.ctx.fillRect(0, y, w, 1);
    }

    // Outer industrial bezel
    this.ctx.strokeStyle = '#282828';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(3, 3, w - 6, h - 6);

    // Allen hex bolts at 4 corners
    const boltRadius = 3.5;
    const bolts = [
      [14, 14],
      [w - 14, 14],
      [14, h - 14],
      [w - 14, h - 14]
    ];
    for (const [bx, by] of bolts) {
      this.ctx.fillStyle = '#222';
      this.ctx.beginPath();
      this.ctx.arc(bx, by, boltRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#444';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      // Hex socket
      this.ctx.strokeStyle = '#111';
      this.ctx.strokeRect(bx - 1.5, by - 1.5, 3, 3);
    }
  }

  private drawPrecisionReel(
    cx: number,
    cy: number,
    maxRadius: number,
    tapeRadius: number,
    angle: number,
    label: string
  ) {
    this.ctx.save();
    this.ctx.translate(cx, cy);

    // 1. Reel backplate shadow
    this.ctx.beginPath();
    this.ctx.arc(0, 0, maxRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fill();

    // 2. Magnetic tape pack (dark ferric oxide brown/black)
    this.ctx.beginPath();
    this.ctx.arc(0, 0, tapeRadius, 0, Math.PI * 2);
    const tapeGrad = this.ctx.createRadialGradient(0, 0, maxRadius * 0.35, 0, 0, tapeRadius);
    tapeGrad.addColorStop(0, '#2c1e18');
    tapeGrad.addColorStop(0.7, '#1f1511');
    tapeGrad.addColorStop(1, '#110c09');
    this.ctx.fillStyle = tapeGrad;
    this.ctx.fill();

    // Concentric micro-grooves of wound tape
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.lineWidth = 1;
    for (let r = maxRadius * 0.4; r < tapeRadius; r += 6) {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, r, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // 3. Rotating 3-spoke precision aluminum flange
    this.ctx.rotate(angle);

    // Outer aluminum rim
    this.ctx.beginPath();
    this.ctx.arc(0, 0, maxRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(210, 210, 210, 0.85)';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Stroboscopic speed calibration marks (36 radial ticks along the rim)
    this.ctx.strokeStyle = 'rgba(240, 240, 240, 0.6)';
    this.ctx.lineWidth = 1.2;
    for (let s = 0; s < 36; s++) {
      const sa = (s * Math.PI * 2) / 36;
      this.ctx.beginPath();
      this.ctx.moveTo(Math.cos(sa) * (maxRadius * 0.94), Math.sin(sa) * (maxRadius * 0.94));
      this.ctx.lineTo(Math.cos(sa) * maxRadius, Math.sin(sa) * maxRadius);
      this.ctx.stroke();
    }

    // 3 large cutouts (precision cut spokes)
    const spokeCount = 3;
    for (let i = 0; i < spokeCount; i++) {
      const spokeAngle = (i * 2 * Math.PI) / spokeCount;
      this.ctx.save();
      this.ctx.rotate(spokeAngle);

      // Trapezoidal cutout hole in aluminum plate
      this.ctx.beginPath();
      this.ctx.arc(0, 0, maxRadius * 0.84, -0.42, 0.42);
      this.ctx.arc(0, 0, maxRadius * 0.42, 0.42, -0.42, true);
      this.ctx.closePath();
      this.ctx.strokeStyle = '#777';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      this.ctx.restore();
    }

    // Metal spoke lines
    this.ctx.strokeStyle = 'rgba(230, 230, 230, 0.5)';
    this.ctx.lineWidth = 1.5;
    for (let i = 0; i < spokeCount; i++) {
      const a = (i * 2 * Math.PI) / spokeCount;
      this.ctx.beginPath();
      this.ctx.moveTo(Math.cos(a) * (maxRadius * 0.38), Math.sin(a) * (maxRadius * 0.38));
      this.ctx.lineTo(Math.cos(a) * maxRadius, Math.sin(a) * maxRadius);
      this.ctx.stroke();
    }

    // 4. Center hub (CNC turned aluminum)
    const hubRadius = maxRadius * 0.36;
    const hubGrad = this.ctx.createRadialGradient(0, 0, 2, 0, 0, hubRadius);
    hubGrad.addColorStop(0, '#e5e5e5');
    hubGrad.addColorStop(0.5, '#999999');
    hubGrad.addColorStop(1, '#444444');

    this.ctx.beginPath();
    this.ctx.arc(0, 0, hubRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = hubGrad;
    this.ctx.fill();
    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Center spindle clamp
    this.ctx.beginPath();
    this.ctx.arc(0, 0, hubRadius * 0.32, 0, Math.PI * 2);
    this.ctx.fillStyle = '#111';
    this.ctx.fill();
    this.ctx.strokeStyle = '#888';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Small label etched on the flange
    this.ctx.font = `600 ${Math.max(8, Math.round(maxRadius * 0.1))}px monospace`;
    this.ctx.fillStyle = 'rgba(240, 240, 240, 0.85)';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(label, 0, -maxRadius * 0.62);

    this.ctx.restore();
  }

  private drawTapePath(
    ax: number,
    ay: number,
    ar: number,
    bx: number,
    by: number,
    br: number,
    h: number
  ) {
    const guideY = h * 0.82;
    const headLeftX = ax + ar * 0.4;
    const headRightX = bx - br * 0.4;

    this.ctx.save();
    this.ctx.strokeStyle = '#321f18'; // Dark magnetic tape
    this.ctx.lineWidth = 3.5;
    this.ctx.lineCap = 'round';

    // Left reel down to head block guide
    this.ctx.beginPath();
    this.ctx.moveTo(ax, ay + ar);
    this.ctx.quadraticCurveTo(ax + 10, guideY, headLeftX, guideY);
    this.ctx.lineTo(headRightX, guideY);
    this.ctx.quadraticCurveTo(bx - 10, guideY, bx, by + br);
    this.ctx.stroke();

    // Tape highlight reflection
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(headLeftX, guideY - 1);
    this.ctx.lineTo(headRightX, guideY - 1);
    this.ctx.stroke();

    this.ctx.restore();
  }

  private drawHeadBlock(cx: number, cy: number, w: number, h: number) {
    const x = cx - w / 2;
    const y = cy - h / 2;

    this.ctx.save();

    // Head block housing
    this.ctx.fillStyle = '#1e1e1e';
    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeStyle = '#383838';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(x, y, w, h);

    // Three tape heads (Erase, Record, Playback)
    const headW = w * 0.22;
    const headH = h * 0.65;
    const headSpacing = w * 0.28;
    const startX = cx - headSpacing;

    const labels = ['ERASE', 'REC', 'PLAY'];
    for (let i = 0; i < 3; i++) {
      const hx = startX + i * headSpacing - headW / 2;
      const hy = cy - headH / 2;

      // Metallic tape head cylinder
      const hGrad = this.ctx.createLinearGradient(hx, hy, hx + headW, hy);
      hGrad.addColorStop(0, '#555');
      hGrad.addColorStop(0.5, '#eee');
      hGrad.addColorStop(1, '#333');

      this.ctx.fillStyle = hGrad;
      this.ctx.fillRect(hx, hy, headW, headH);
      this.ctx.strokeStyle = '#111';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(hx, hy, headW, headH);

      // Head core vertical gap line
      this.ctx.fillStyle = '#0a0a0a';
      this.ctx.fillRect(hx + headW / 2 - 1, hy, 2, headH);

      // Label below head
      this.ctx.font = '500 8px monospace';
      this.ctx.fillStyle = '#888';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(labels[i], hx + headW / 2, hy + headH + 11);
    }

    // Active record/play optical indicator LED
    const isPlaying = this.audioEngine.getPlaybackState().isPlaying;
    this.ctx.beginPath();
    this.ctx.arc(cx, y + 8, 3, 0, Math.PI * 2);
    this.ctx.fillStyle = isPlaying ? '#22c55e' : '#444';
    this.ctx.fill();
    if (isPlaying) {
      this.ctx.shadowColor = '#22c55e';
      this.ctx.shadowBlur = 6;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    this.ctx.restore();
  }

  private drawVUMeters(cx: number, cy: number, w: number, h: number) {
    const meterW = w * 0.46;
    const meterH = h;
    const gap = w * 0.08;
    const leftX = cx - meterW - gap / 2;
    const rightX = cx + gap / 2;

    this.drawSingleVU(leftX, cy - meterH / 2, meterW, meterH, this.needleLeft, 'CH-1 LEFT');
    this.drawSingleVU(rightX, cy - meterH / 2, meterW, meterH, this.needleRight, 'CH-2 RIGHT');
  }

  private drawSingleVU(
    x: number,
    y: number,
    w: number,
    h: number,
    level: number,
    label: string
  ) {
    this.ctx.save();

    // Meter Housing & Backlit Ivory/Amber Scale
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeStyle = '#2b2b2b';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(x, y, w, h);

    // Warm backlit scale gradient
    const scaleGrad = this.ctx.createLinearGradient(x, y, x, y + h);
    scaleGrad.addColorStop(0, '#f9ecd4');
    scaleGrad.addColorStop(0.7, '#f4e0b8');
    scaleGrad.addColorStop(1, '#dfc596');

    const innerPad = 4;
    this.ctx.fillStyle = scaleGrad;
    this.ctx.fillRect(x + innerPad, y + innerPad, w - innerPad * 2, h - innerPad * 2);

    // Arc & Scale markings
    const pivotX = x + w / 2;
    const pivotY = y + h * 1.15;
    const needleLength = h * 0.88;

    // dB tick marks (-20 to +3 dB)
    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(pivotX, pivotY, needleLength * 0.96, -Math.PI * 0.72, -Math.PI * 0.28);
    this.ctx.stroke();

    // Red Danger Overload Arc (> 0 dB)
    this.ctx.strokeStyle = '#dc2626';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.arc(pivotX, pivotY, needleLength * 0.96, -Math.PI * 0.38, -Math.PI * 0.28);
    this.ctx.stroke();

    // Channel label & VU emblem
    this.ctx.font = 'bold 8px monospace';
    this.ctx.fillStyle = '#333';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, pivotX, y + h * 0.68);
    this.ctx.font = '600 7px sans-serif';
    this.ctx.fillStyle = '#666';
    this.ctx.fillText('-20  -10  -7  -5  -3   0  +1  +3 dB', pivotX, y + h * 0.35);

    // Dynamic Needle
    // Map level (0.0 to 1.0) to angle (-0.68 to -0.30 radians)
    const minAngle = -Math.PI * 0.68;
    const maxAngle = -Math.PI * 0.30;
    const needleAngle = minAngle + (maxAngle - minAngle) * level;

    this.ctx.strokeStyle = '#111';
    this.ctx.lineWidth = 1.6;
    this.ctx.beginPath();
    this.ctx.moveTo(pivotX, pivotY);
    this.ctx.lineTo(
      pivotX + Math.cos(needleAngle) * needleLength,
      pivotY + Math.sin(needleAngle) * needleLength
    );
    this.ctx.stroke();

    // Needle pivot cover cap
    this.ctx.beginPath();
    this.ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fill();

    this.ctx.restore();
  }

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }
}
