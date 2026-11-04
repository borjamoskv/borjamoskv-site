import { AudioEngine } from './audio/AudioEngine';
import { BookViewerModal } from './components/BookViewerModal';
import { CatalogueModal } from './components/CatalogueModal';
import { EditorialView } from './components/EditorialView';
import { HUDToast } from './components/HUDToast';
import { LightboxModal } from './components/LightboxModal';
import { ManifestoModal } from './components/ManifestoModal';
import { Navigation } from './components/Navigation';
import { ReelPlayer } from './components/ReelPlayer';
import type { TopologicalCodexModal } from './components/TopologicalCodexModal';
import { CODEX_TOTAL_COUNT } from './data/codexEdges';
import { SectionType, WORKS, WorkItem } from './data/works';

class App {
  private audioEngine: AudioEngine;
  private reelPlayer: ReelPlayer;
  private editorialView: EditorialView;
  private navigation: Navigation;
  private catalogueModal: CatalogueModal;
  private codexModal: TopologicalCodexModal | null = null;
  private codexModalPromise: Promise<TopologicalCodexModal> | null = null;
  private manifestoModal: ManifestoModal;
  private bookModal: BookViewerModal;
  private lightboxModal: LightboxModal;
  private hudToast: HUDToast;
  private suppressHashHandler: boolean = false;

  constructor() {
    const navRoot = document.getElementById('nav-root')!;
    const mainRoot = document.getElementById('main-root')!;

    // 1. Initialize Sovereign Web Audio Engine (Studer A800 + V6 Installation Loop)
    this.audioEngine = new AudioEngine();

    // 2. Initialize Tactical HUD Toast
    this.hudToast = new HUDToast();

    // 3. Initialize Reel-to-Reel Player
    const reelContainer = document.createElement('div');
    this.reelPlayer = new ReelPlayer(reelContainer, this.audioEngine);

    // 4. Initialize Auxiliary Modals
    this.bookModal = new BookViewerModal();
    this.lightboxModal = new LightboxModal();
    this.manifestoModal = new ManifestoModal();

    // 5. Initialize Editorial Split-Screen View with 5:4 Frame & Topological Edges
    this.editorialView = new EditorialView(
      mainRoot,
      this.reelPlayer,
      (work: WorkItem) => {
        if (this.navigation) {
          this.navigation.setSection(work.section);
        }
        if (!this.codexModal?.isOpen()) {
          this.setLocationHash(`#work/${work.id}`);
        }
        this.hudToast.show(`LOADED // ${work.catalogNumber} ${work.title}`);
      },
      (docUrl: string, title?: string, badge?: string) => {
        this.bookModal.open(docUrl, title, badge);
        this.hudToast.show(`VIEWER // ${title || 'THE SCIENCE OF FRICTION'}`);
      },
      (mediaUrl: string, title: string, meta: string, isVideo?: boolean) => {
        this.lightboxModal.open(mediaUrl, title, meta, isVideo);
        this.hudToast.show(`LIGHTBOX // ${title}`);
      },
      async (slug: string) => {
        const modal = await this.ensureCodexModal();
        modal.openNodeBySlug(slug);
        this.hudToast.show(`CODEX // #${slug.toUpperCase()}`);
      }
    );

    // 6. Initialize Catalogue Drawer Modal
    this.catalogueModal = new CatalogueModal((selectedWork: WorkItem) => {
      this.editorialView.setWorkById(selectedWork.id);
    });

    // 7. Initialize Navigation Header
    this.navigation = new Navigation(
      navRoot,
      (section: SectionType | 'ALL') => {
        this.handleSectionChange(section);
      },
      async () => {
        const modal = await this.ensureCodexModal();
        modal.openIndex();
        this.hudToast.show(`CODEX // TOPOLOGICAL MATRIX [${CODEX_TOTAL_COUNT} CRYSTALS]`);
      },
      () => {
        this.catalogueModal.open();
        this.hudToast.show(`DRAWER // CATALOGUE [${WORKS.length} WORKS]`);
      },
      () => {
        this.manifestoModal.open();
        this.hudToast.show('MODAL // C5-REAL MANIFESTO');
      },
      () => {
        this.cycleInstallationLoop();
      }
    );

    // 8. Sync V6 Loop telemetry across ReelPlayer, Navigation & Codex Reader
    this.audioEngine.onLoopModeChange = (mode, cueLabel) => {
      this.reelPlayer.syncLoopUI();
      this.navigation.setLoopStatus(mode);
      this.codexModal?.refreshAudioHeader();
      this.hudToast.show(`TAPE LOOP [${mode}] // ${cueLabel}`);
    };

    // 9. Auto-advance to next track on audio end (when V6 Loop is OFF)
    this.audioEngine.onTrackEnd = () => {
      if (this.audioEngine.getLoopMode() !== 'OFF') return;
      this.editorialView.nextWork();
      setTimeout(() => {
        this.audioEngine.play();
      }, 500);
    };

    // 10. Setup Global Keyboard Shortcuts & Deterministic Hash Router
    this.setupKeyboardShortcuts();
    this.setupHashRouter();
  }

  private async ensureCodexModal(): Promise<TopologicalCodexModal> {
    if (this.codexModal) return this.codexModal;
    if (!this.codexModalPromise) {
      this.codexModalPromise = import('./components/TopologicalCodexModal').then(
        ({ TopologicalCodexModal: ModalClass }) => {
          this.codexModal = new ModalClass(
            this.audioEngine,
            (work: WorkItem) => {
              this.editorialView.setWorkById(work.id);
            },
            (url: string, title: string, badge: string) => {
              this.bookModal.open(url, title, badge);
              this.hudToast.show(`VIEWER // ${title}`);
            },
            (msg: string) => {
              this.hudToast.show(msg);
            },
            (hash: string) => {
              this.setLocationHash(hash);
            }
          );
          return this.codexModal;
        }
      );
    }
    return this.codexModalPromise;
  }

  private async toggleCodexModal() {
    if (this.codexModal?.isOpen()) {
      this.codexModal.close();
    } else {
      const modal = await this.ensureCodexModal();
      modal.openIndex();
      this.hudToast.show(`CODEX // TOPOLOGICAL MATRIX [${CODEX_TOTAL_COUNT} CRYSTALS]`);
    }
  }

  private cycleInstallationLoop() {
    this.audioEngine.cycleLoopMode();
    this.reelPlayer.syncLoopUI();
    this.navigation.setLoopStatus(this.audioEngine.getLoopMode());
    this.codexModal?.refreshAudioHeader();
  }

  private setLocationHash(hash: string) {
    if (window.location.hash === hash) return;
    this.suppressHashHandler = true;
    if (!hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      history.replaceState(null, '', hash);
    }
    setTimeout(() => {
      this.suppressHashHandler = false;
    }, 0);
  }

  private setupHashRouter() {
    const applyRoute = async () => {
      if (this.suppressHashHandler) return;
      const raw = window.location.hash || '';

      if (raw === '#codex' || raw === '#codex/') {
        this.editorialView.setWorkByIndex(0);
        const modal = await this.ensureCodexModal();
        modal.openIndex();
        return;
      }

      if (raw.startsWith('#codex/')) {
        const slug = decodeURIComponent(raw.slice('#codex/'.length));
        if (!this.editorialView.getCurrentWork()) {
          this.editorialView.setWorkByIndex(0);
        }
        const modal = await this.ensureCodexModal();
        modal.openNodeBySlug(slug);
        return;
      }

      if (raw.startsWith('#work/')) {
        const workId = decodeURIComponent(raw.slice('#work/'.length));
        this.codexModal?.close(true);
        if (!this.editorialView.setWorkById(workId)) {
          this.editorialView.setWorkByIndex(0);
        }
        return;
      }

      this.editorialView.setWorkByIndex(0);
    };

    window.addEventListener('hashchange', () => {
      void applyRoute();
    });
    void applyRoute();
  }

  private handleSectionChange(section: SectionType | 'ALL') {
    this.codexModal?.close(true);
    if (section === 'ALL') {
      this.editorialView.setWorkByIndex(0);
      return;
    }

    const firstInSectionIdx = WORKS.findIndex((w) => w.section === section);
    if (firstInSectionIdx !== -1) {
      this.editorialView.setWorkByIndex(firstInSectionIdx);
    }
  }

  private setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Cmd+K / Ctrl+K always toggles V5 Topological Codex & Blog
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        void this.toggleCodexModal();
        return;
      }

      // Ignore plain keys if typing inside search input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case 'ArrowLeft':
          if (this.codexModal?.isOpen()) return;
          e.preventDefault();
          this.editorialView.prevWork();
          break;
        case 'ArrowRight':
          if (this.codexModal?.isOpen()) return;
          e.preventDefault();
          this.editorialView.nextWork();
          break;
        case ' ':
          if (this.codexModal?.isOpen()) return;
          e.preventDefault();
          const state = this.audioEngine.getPlaybackState();
          this.hudToast.show(state.isPlaying ? 'DECK // PAUSED' : 'DECK // PLAYING');
          this.audioEngine.togglePlay();
          break;
        case 'ArrowUp':
          if (this.codexModal?.isOpen()) return;
          e.preventDefault();
          const newVolUp = Math.min(1, Math.round((this.audioEngine.getVolume() + 0.05) * 100) / 100);
          this.audioEngine.setVolume(newVolUp);
          this.hudToast.show(`VOLUME // ${Math.round(newVolUp * 100)}%`);
          break;
        case 'ArrowDown':
          if (this.codexModal?.isOpen()) return;
          e.preventDefault();
          const newVolDown = Math.max(0, Math.round((this.audioEngine.getVolume() - 0.05) * 100) / 100);
          this.audioEngine.setVolume(newVolDown);
          this.hudToast.show(`VOLUME // ${Math.round(newVolDown * 100)}%`);
          break;
        case 't':
        case 'T':
          e.preventDefault();
          void this.toggleCodexModal();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          this.cycleInstallationLoop();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          this.catalogueModal.open();
          this.hudToast.show(`DRAWER // CATALOGUE [${WORKS.length} WORKS]`);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          this.manifestoModal.open();
          this.hudToast.show('MODAL // C5-REAL MANIFESTO');
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          this.bookModal.open('/ciencia_friccion_libro.pdf');
          this.hudToast.show('VIEWER // THE SCIENCE OF FRICTION');
          break;
        case '1':
          e.preventDefault();
          this.handleSectionChange('MUSIC');
          this.hudToast.show(`FILTER // MUSIC [${WORKS.filter((w) => w.section === 'MUSIC').length} WORKS]`);
          break;
        case '2':
          e.preventDefault();
          this.handleSectionChange('ART');
          this.hudToast.show(`FILTER // ART [${WORKS.filter((w) => w.section === 'ART').length} WORKS]`);
          break;
        case '3':
          e.preventDefault();
          this.handleSectionChange('COMPLEX SYSTEMS');
          this.hudToast.show(`FILTER // COMPLEX SYSTEMS [${WORKS.filter((w) => w.section === 'COMPLEX SYSTEMS').length} WORKS]`);
          break;
        case '0':
          e.preventDefault();
          this.handleSectionChange('ALL');
          this.hudToast.show(`FILTER // ALL [${WORKS.length} WORKS]`);
          break;
      }
    });
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new App();

  // Register Service Worker for offline PWA codex
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline fallback silent
    });
  }
});
