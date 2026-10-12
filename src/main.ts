import { AudioEngine } from './audio/AudioEngine';
import { ReelPlayer } from './components/ReelPlayer';
import { EditorialView } from './components/EditorialView';
import { Navigation } from './components/Navigation';
import { CatalogueModal } from './components/CatalogueModal';
import { ManifestoModal } from './components/ManifestoModal';
import { SectionType, WorkItem, WORKS } from './data/works';

class App {
  private audioEngine: AudioEngine;
  private reelPlayer: ReelPlayer;
  private editorialView: EditorialView;
  private navigation: Navigation;
  private catalogueModal: CatalogueModal;
  private manifestoModal: ManifestoModal;

  constructor() {
    const navRoot = document.getElementById('nav-root')!;
    const mainRoot = document.getElementById('main-root')!;

    // 1. Initialize Audio Engine
    this.audioEngine = new AudioEngine();

    // 2. Initialize Reel-to-Reel Player
    const reelContainer = document.createElement('div');
    this.reelPlayer = new ReelPlayer(reelContainer, this.audioEngine);

    // 3. Initialize Editorial Split-Screen View
    this.editorialView = new EditorialView(
      mainRoot,
      this.reelPlayer,
      (work: WorkItem) => {
        this.navigation.setSection(work.section);
      }
    );

    // 4. Initialize Catalogue & Manifesto Modals
    this.catalogueModal = new CatalogueModal((selectedWork: WorkItem) => {
      this.editorialView.setWorkById(selectedWork.id);
    });

    this.manifestoModal = new ManifestoModal();

    // 5. Initialize Navigation Header
    this.navigation = new Navigation(
      navRoot,
      (section: SectionType | 'ALL') => {
        this.handleSectionChange(section);
      },
      () => this.catalogueModal.open(),
      () => this.manifestoModal.open()
    );

    // 6. Setup Global Keyboard Shortcuts
    this.setupKeyboardShortcuts();

    // 7. Auto-advance to next track on audio end
    this.audioEngine.onTrackEnd = () => {
      this.editorialView.nextWork();
      setTimeout(() => {
        this.audioEngine.play();
      }, 500);
    };

    // Load initial work into deck
    this.editorialView.setWorkByIndex(0);
  }

  private handleSectionChange(section: SectionType | 'ALL') {
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
      // Ignore if typing inside search input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.editorialView.prevWork();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.editorialView.nextWork();
          break;
        case ' ':
          e.preventDefault();
          this.audioEngine.togglePlay();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          this.catalogueModal.open();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          this.manifestoModal.open();
          break;
      }
    });
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
