/**
 * CORTEX ACHIEVEMENT & NARRATIVE ENGINE
 * Persistent localStorage memory. Unlockable content.
 * Video game progression across visits.
 * ═══════════════════════════════════════════════════════════
 */
(function() {
'use strict';

const STORAGE_KEY = 'MOSKV_ARCADE_STATE';

// ═══ DEFAULT STATE ═══
const DEFAULT_STATE = {
    visits: 0,
    totalListenTime: 0,      // seconds
    tracksHeard: [],
    achievementsUnlocked: [],
    lastVisit: null,
    favoriteTrack: null,     // most repeated
    vaultOpened: false,
    filtersUsed: 0,
    transitionsTriggered: 0,
    secretsFound: [],
};

// ═══ ACHIEVEMENTS ═══
const ACHIEVEMENTS = [
    { id: 'first_blood',     title: 'FIRST BLOOD',          desc: 'Pressed START for the first time', icon: '⚡', threshold: () => true },
    { id: 'explorer',        title: 'EXPLORADOR',           desc: 'Opened the Vault', icon: '🗝️', threshold: (s) => s.vaultOpened },
    { id: 'listener_5',      title: 'OÍDO ABIERTO',         desc: 'Heard 5 different tracks', icon: '🎧', threshold: (s) => s.tracksHeard.length >= 5 },
    { id: 'listener_15',     title: 'MELÓMANO RADICAL',     desc: 'Heard 15 different tracks', icon: '🔊', threshold: (s) => s.tracksHeard.length >= 15 },
    { id: 'listener_30',     title: 'ARCHIVO VIVIENTE',     desc: 'Heard 30 different tracks', icon: '📡', threshold: (s) => s.tracksHeard.length >= 30 },
    { id: 'dj_mode',         title: 'DJ AUTÓNOMO',          desc: 'Triggered 10 manual transitions', icon: '🎛️', threshold: (s) => s.transitionsTriggered >= 10 },
    { id: 'filter_freak',    title: 'FILTER FREAK',         desc: 'Used all 5 visual filters', icon: '◈', threshold: (s) => s.filtersUsed >= 5 },
    { id: 'return_visitor',  title: 'REINCIDENTE',          desc: 'Came back for a 3rd visit', icon: '🔄', threshold: (s) => s.visits >= 3 },
    { id: 'veteran',         title: 'VETERANX',             desc: '10+ visits. You live here.', icon: '🏠', threshold: (s) => s.visits >= 10 },
    { id: 'glitch_hunter',   title: 'GLITCH HUNTER',        desc: 'Found GLITCH IN THE MIRROR', icon: '🪞', threshold: (s) => s.tracksHeard.includes('x8E9HInpzE4') },
    { id: 'void_walker',     title: 'VOID WALKER',          desc: 'Entered VOID CASCADE', icon: '🌀', threshold: (s) => s.tracksHeard.includes('EP5s0yKZUKk') },
    { id: 'time_lord',       title: 'SEÑOR DEL TIEMPO',     desc: 'Spent 10+ minutes listening', icon: '⏳', threshold: (s) => s.totalListenTime >= 600 },
    { id: 'secret_chiquito', title: 'FISTRO PECADOR',       desc: 'Found the Chiquito easter egg', icon: '🤡', threshold: (s) => s.secretsFound.includes('chiquito') },
    { id: 'secret_elon',     title: 'NO TOCAR',             desc: 'Touched what should not be touched', icon: '⚠️', threshold: (s) => s.secretsFound.includes('elon') },
    { id: 'night_owl',       title: 'BÚHO NOCTURNO',        desc: 'Visited between 2am and 5am', icon: '🦉', threshold: (s) => s.secretsFound.includes('night_owl') },
];

// ═══ STATE MANAGEMENT ═══
function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            return { ...DEFAULT_STATE, ...saved };
        }
    } catch(e) {}
    return { ...DEFAULT_STATE };
}

function saveState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}

// ═══ INIT ═══
const state = loadState();
state.visits++;
state.lastVisit = new Date().toISOString();

// Check night owl
const hour = new Date().getHours();
if (hour >= 2 && hour < 5 && !state.secretsFound.includes('night_owl')) {
    state.secretsFound.push('night_owl');
}

saveState(state);

// ═══ ACHIEVEMENT TOAST UI ═══
function showAchievement(achievement) {
    if (state.achievementsUnlocked.includes(achievement.id)) return;
    state.achievementsUnlocked.push(achievement.id);
    saveState(state);

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <div class="ach-icon">${achievement.icon}</div>
        <div class="ach-info">
            <div class="ach-label">ACHIEVEMENT UNLOCKED</div>
            <div class="ach-title">${achievement.title}</div>
            <div class="ach-desc">${achievement.desc}</div>
        </div>
    `;
    document.body.appendChild(toast);

    // Haptic
    if ('vibrate' in navigator) navigator.vibrate([50, 80, 50, 80, 100]);

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(toast,
            { x: 400, opacity: 0, scale: 0.8 },
            { x: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
        );
        gsap.to(toast, { x: 400, opacity: 0, delay: 4, duration: 0.6, ease: 'power2.in',
            onComplete: () => toast.remove()
        });
    } else {
        setTimeout(() => toast.remove(), 5000);
    }
}

function checkAchievements() {
    ACHIEVEMENTS.forEach(ach => {
        if (!state.achievementsUnlocked.includes(ach.id) && ach.threshold(state)) {
            showAchievement(ach);
        }
    });
}

// ═══ WELCOME BACK NARRATIVE ═══
function showWelcomeBack() {
    if (state.visits <= 1) return; // First visit, no welcome back

    const overlay = document.createElement('div');
    overlay.className = 'welcome-back-overlay';

    let msg = '';
    if (state.visits === 2) {
        msg = 'Has vuelto. La señal te reconoce.';
    } else if (state.visits <= 5) {
        msg = `Visita #${state.visits}. ${state.tracksHeard.length} tracks descubiertos.`;
    } else if (state.visits <= 10) {
        msg = `Visita #${state.visits}. Estás construyendo tu propio archivo.`;
    } else {
        msg = `Visita #${state.visits}. Ya eres parte de la señal.`;
    }

    // Find favorite track
    if (state.tracksHeard.length > 0 && window.DATA) {
        const freq = {};
        state.tracksHeard.forEach(id => { freq[id] = (freq[id] || 0) + 1; });
        const favId = Object.entries(freq).sort((a,b) => b[1] - a[1])[0][0];
        const work = window.DATA.works?.find(w => w.id === favId);
        if (work) {
            msg += `<br><span class="wb-fav">Tu track más escuchado: ${work.title}</span>`;
        }
    }

    overlay.innerHTML = `
        <div class="wb-content">
            <div class="wb-greeting">> BIENVENIDX DE VUELTA</div>
            <div class="wb-msg">${msg}</div>
            <div class="wb-achievements">${state.achievementsUnlocked.length}/${ACHIEVEMENTS.length} logros</div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Auto-dismiss after 4s or on click
    const dismiss = () => {
        if (typeof gsap !== 'undefined') {
            gsap.to(overlay, { opacity: 0, y: -30, duration: 0.6, onComplete: () => overlay.remove() });
        } else {
            overlay.remove();
        }
    };
    overlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 4500);

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(overlay, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
    }
}

// ═══ CURSOR REACTIVE DEFORMATION ═══
function initCursorDeformation() {
    const videoSystem = document.querySelector('.video-background-system');
    if (!videoSystem) return;

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 to 1
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        const dist = Math.sqrt(x * x + y * y); // 0 to ~1.4

        // Subtle hue + brightness shift based on cursor position
        const hueShift = Math.round(x * 15);
        const brightness = 1 + (y * 0.1);
        const contrast = 1 + (dist * 0.08);

        videoSystem.style.filter = `hue-rotate(${hueShift}deg) brightness(${brightness.toFixed(2)}) contrast(${contrast.toFixed(2)})`;
    });

    // On touch (mobile) — quick pulse deformation
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        if (!touch) return;
        const x = (touch.clientX / window.innerWidth - 0.5) * 2;
        const hue = Math.round(x * 20);
        videoSystem.style.filter = `hue-rotate(${hue}deg) brightness(1.05)`;
    }, { passive: true });
}

// ═══ SECRET DETECTORS ═══
function initSecretDetectors() {
    // Detect Chiquito easter egg
    const chiquitoBtn = document.getElementById('chiquito-trigger') || document.querySelector('[onclick*="chiquito"]');
    document.addEventListener('click', (e) => {
        if (e.target.closest('#chiquito-trigger') || e.target.closest('.chiquito')) {
            if (!state.secretsFound.includes('chiquito')) {
                state.secretsFound.push('chiquito');
                saveState(state);
                checkAchievements();
            }
        }
        // Elon NO TOCAR
        if (e.target.closest('#no-tocar-btn')) {
            if (!state.secretsFound.includes('elon')) {
                state.secretsFound.push('elon');
                saveState(state);
                checkAchievements();
            }
        }
    });
}

// ═══ LISTEN TIME TRACKER ═══
let listenInterval = null;
function startListenTimer() {
    if (listenInterval) return;
    listenInterval = setInterval(() => {
        if (window.djAesthetic && !window.djAesthetic.globalMuted) {
            state.totalListenTime++;
            if (state.totalListenTime % 30 === 0) { // Save every 30s
                saveState(state);
                checkAchievements();
            }
        }
    }, 1000);
}

// ═══ PUBLIC API ═══
window.MOSKV_ARCADE = {
    state,
    saveState: () => saveState(state),
    checkAchievements,

    // Called by game-hud.js when a track plays
    onTrackPlayed(trackId) {
        if (!state.tracksHeard.includes(trackId)) {
            state.tracksHeard.push(trackId);
        }
        saveState(state);
        checkAchievements();
    },

    // Called when vault opens
    onVaultOpened() {
        state.vaultOpened = true;
        saveState(state);
        checkAchievements();
    },

    // Called on manual transition
    onTransition() {
        state.transitionsTriggered++;
        saveState(state);
        checkAchievements();
    },

    // Called when filter changes
    onFilterUsed() {
        state.filtersUsed++;
        saveState(state);
        checkAchievements();
    },

    // Boot
    init() {
        showWelcomeBack();
        initCursorDeformation();
        initSecretDetectors();
        startListenTimer();
        // First blood on boot
        checkAchievements();
        // Start ambient
        if (window.CORTEX_AMBIENT) window.CORTEX_AMBIENT.start();
    }
};

})();
