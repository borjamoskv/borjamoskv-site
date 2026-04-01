(function() {
  'use strict';

  const PRESETS = {
    forge: {
      label: 'FORGE',
      primary: 'industrial techno heavy',
      secondary: 'distorted bass, alarms and iron dust',
      weight: 24,
      detail: 'Estira la intro con kick industrial, metal caliente y distorsion seca.'
    },
    ritual: {
      label: 'RITUAL',
      primary: 'ritual industrial percussion',
      secondary: 'cavern drones, chains and smoked pressure',
      weight: 52,
      detail: 'Abre un breakdown cavernoso con percusion ritual, humo de fabrica y drone oscuro.'
    },
    collapse: {
      label: 'COLLAPSE',
      primary: 'broken club impact',
      secondary: 'system alarms, clipped kicks and red friction',
      weight: 73,
      detail: 'Convierte el tema en tool dub con alarmas, low end roto y friccion de sistema.'
    },
    ash: {
      label: 'ASH',
      primary: 'slow doom techno',
      secondary: 'metallic decay, rust ambience and toxic sub',
      weight: 38,
      detail: 'Alarga el cierre con doom techno, decay largo y niebla de hierro.'
    }
  };

  const copyLinkButton = document.getElementById('jes-copy-link');
  const resetButton = document.getElementById('jes-reset-ui');
  const checkEngineButton = document.getElementById('jes-check-engine');
  const engineState = document.getElementById('jes-engine-state');
  const engineDetail = document.getElementById('jes-engine-detail');
  const presetName = document.getElementById('jes-current-preset');
  const presetDetail = document.getElementById('jes-current-preset-detail');
  const statusMirror = document.getElementById('jes-surface-status-label');
  const statusSource = document.getElementById('jes-extender-status');

  let activePresetKey = 'forge';
  let probeTimer = 0;

  const getModule = () => globalThis.MOSKV?.jesExtender || null;

  const updateUrl = (presetKey) => {
    const url = new URL(globalThis.location.href);
    url.searchParams.set('preset', presetKey);
    globalThis.history.replaceState({}, '', url);
  };

  const syncWeightLabel = () => {
    const slider = document.getElementById('jes-extender-weight');
    const label = document.getElementById('jes-extender-weight-val');
    if (!slider || !label) return;
    label.textContent = `${slider.value}%`;
  };

  const setPresetMeta = (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    activePresetKey = presetKey;
    if (presetName) presetName.textContent = preset.label;
    if (presetDetail) presetDetail.textContent = preset.detail;

    const modeName = document.getElementById('jes-app-mode-name');
    if (modeName) modeName.textContent = preset.label.charAt(0) + preset.label.slice(1).toLowerCase();
  };

  const setPreset = (presetKey, { syncUrl = true } = {}) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    const primary = document.getElementById('jes-extender-prompt');
    const secondary = document.getElementById('jes-extender-prompt-secondary');
    const slider = document.getElementById('jes-extender-weight');

    if (primary) primary.value = preset.primary;
    if (secondary) secondary.value = preset.secondary;
    if (slider) {
      slider.value = String(preset.weight);
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }

    syncWeightLabel();
    setPresetMeta(presetKey);

    document.querySelectorAll('[data-jes-preset]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.jesPreset === presetKey);
    });

    if (syncUrl) updateUrl(presetKey);
  };

  const setEngineBadge = (label, detail, tone = 'idle') => {
    if (engineState) {
      engineState.textContent = label;
      engineState.dataset.tone = tone;
    }
    if (engineDetail) engineDetail.textContent = detail;
  };

  const setIdleEngineState = () => {
    setEngineBadge('LOCAL ONLY', 'Se comprobara al extraer o al pulsar CHECK ENGINE.', 'idle');
  };

  const getWsUrl = () => {
    const module = getModule();
    return module?.getWsUrl?.() || 'ws://localhost:8001/ws/generate';
  };

  const getProbeUrl = () => getWsUrl().replace(/^ws/i, 'http');

  const probeEngine = () => {
    globalThis.clearTimeout(probeTimer);
    setEngineBadge('CHECKING', 'Probando acceso al WebSocket local.', 'checking');

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    probeTimer = globalThis.setTimeout(() => {
      controller?.abort();
      setEngineBadge('OFFLINE', 'El engine no respondio a tiempo en localhost:8001.', 'offline');
    }, 1400);

    fetch(`${getProbeUrl()}?probe=${Date.now()}`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller?.signal
    }).then(() => {
      globalThis.clearTimeout(probeTimer);
      setEngineBadge('ONLINE', 'Engine disponible. Puedes extraer en tiempo real.', 'online');
    }).catch(() => {
      globalThis.clearTimeout(probeTimer);
      setEngineBadge('OFFLINE', 'No hay respuesta del engine local en este puerto.', 'offline');
    });
  };

  const copyShareLink = async () => {
    const url = new URL(globalThis.location.href);
    url.searchParams.set('preset', activePresetKey);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url.toString());
        if (copyLinkButton) copyLinkButton.textContent = 'LINK COPIADO';
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (error) {
      console.debug('[Jes-Extender] Clipboard unavailable.', error);
      if (copyLinkButton) copyLinkButton.textContent = 'COPIA MANUAL';
    }

    globalThis.setTimeout(() => {
      if (copyLinkButton) copyLinkButton.textContent = 'COPIAR LINK';
    }, 1200);
  };

  const resetUi = () => {
    const module = getModule();
    module?.stop?.({ nextStatus: 'STANDBY' });
    setPreset('forge');
    setIdleEngineState();
  };

  const initPresets = () => {
    const slider = document.getElementById('jes-extender-weight');
    if (slider) {
      slider.addEventListener('input', syncWeightLabel);
    }

    document.querySelectorAll('[data-jes-preset]').forEach((button) => {
      button.addEventListener('click', () => setPreset(button.dataset.jesPreset));
    });

    const requested = new URLSearchParams(globalThis.location.search).get('preset');
    setPreset(PRESETS[requested] ? requested : 'forge', { syncUrl: Boolean(requested) });
  };

  const initStatusMirror = () => {
    if (!statusSource || !statusMirror || typeof MutationObserver === 'undefined') return;

    const update = () => {
      const text = statusSource.textContent || 'STATUS: STANDBY';
      statusMirror.textContent = text.replace('STATUS:', '').trim() || 'HEAVY_PROTOCOL';
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(statusSource, { childList: true, characterData: true, subtree: true });
  };

  const initStateListener = () => {
    document.addEventListener('jes-extender:state', (event) => {
      const { status, tone } = event.detail || {};
      if (!status) return;

      if (status === 'CONNECTED' || status === 'EXTRACTING') {
        setEngineBadge(
          status === 'EXTRACTING' ? 'LIVE' : 'ONLINE',
          status === 'EXTRACTING'
            ? 'Extraccion en curso. El audio esta reclamando foco.'
            : 'Engine conectado y listo para recibir prompts.',
          tone === 'active' ? 'active' : 'online'
        );
      } else if (status === 'ENGINE OFFLINE' || status === 'DISCONNECTED') {
        setEngineBadge('OFFLINE', 'El engine local no esta disponible o cerro conexion.', 'offline');
      } else if (status === 'CONNECTING') {
        setEngineBadge('CHECKING', 'Intentando abrir handshake con el engine.', 'checking');
      }
    });
  };

  const initKeyboardShortcuts = () => {
    document.addEventListener('keydown', (event) => {
      const isMetaEnter = (event.metaKey || event.ctrlKey) && event.key === 'Enter';
      const isEscape = event.key === 'Escape';

      if (isMetaEnter) {
        event.preventDefault();
        document.getElementById('jes-extender-summon')?.click();
      }

      if (isEscape) {
        document.getElementById('jes-extender-stop')?.click();
      }
    });
  };

  const initRuntimeActions = () => {
    checkEngineButton?.addEventListener('click', probeEngine);
    copyLinkButton?.addEventListener('click', copyShareLink);
    resetButton?.addEventListener('click', resetUi);
  };

  const initVisualizer = () => {
    const canvas = document.getElementById('jes-extender-canvas');
    const slider = document.getElementById('jes-extender-weight');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * globalThis.devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(rect.height * globalThis.devicePixelRatio));
    };

    const draw = (time) => {
      const width = canvas.width;
      const height = canvas.height;
      const weight = slider ? Number(slider.value) / 100 : 0.24;
      const currentStatus = statusSource?.textContent || '';
      const active = currentStatus.includes('EXTRACTING') || currentStatus.includes('CONNECTED');

      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(255, 43, 92, 0.16)');
      gradient.addColorStop(0.5, active ? 'rgba(255, 102, 32, 0.18)' : 'rgba(79, 16, 30, 0.12)');
      gradient.addColorStop(1, 'rgba(4, 6, 14, 0.94)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const bars = 24;
      const gap = width / bars;
      for (let i = 0; i < bars; i += 1) {
        const phase = time * 0.0018 + i * 0.42;
        const amplitude = (Math.sin(phase) * 0.5 + 0.5) * (0.3 + weight * 0.9);
        const barHeight = Math.max(height * 0.12, amplitude * height * (active ? 0.78 : 0.46));
        const x = i * gap + gap * 0.18;
        const y = height - barHeight;

        ctx.fillStyle = active
          ? 'rgba(255, 76, 76, 0.84)'
          : 'rgba(132, 65, 91, 0.56)';
        ctx.fillRect(x, y, gap * 0.48, barHeight);
      }

      ctx.strokeStyle = active ? 'rgba(255, 145, 64, 0.8)' : 'rgba(126, 58, 79, 0.44)';
      ctx.lineWidth = Math.max(2, width * 0.004);
      ctx.beginPath();
      for (let i = 0; i <= width; i += Math.max(8, Math.floor(width / 52))) {
        const curve = height * (0.5 + Math.sin(time * 0.0025 + i * 0.035) * (0.08 + weight * 0.09));
        if (i === 0) {
          ctx.moveTo(i, curve);
        } else {
          ctx.lineTo(i, curve);
        }
      }
      ctx.stroke();

      globalThis.requestAnimationFrame(draw);
    };

    globalThis.addEventListener('resize', resize, { passive: true });
    resize();
    globalThis.requestAnimationFrame(draw);
  };

  document.addEventListener('DOMContentLoaded', () => {
    initPresets();
    initRuntimeActions();
    initStatusMirror();
    initStateListener();
    initKeyboardShortcuts();
    initVisualizer();
    setIdleEngineState();
  });
})();
