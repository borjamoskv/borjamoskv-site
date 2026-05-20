// ═══════════════════════════════════════════════════════════════════════════
// ARTICLE CONTROLLER: Reading progress, TOC syncing, and interactive elements
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initReadingTime();
    initReadingProgress();
    initScrollReveal();
    initTOCSync();
});

// Calculate reading time based on word count
function initReadingTime() {
    const articleBody = document.querySelector('.article-body');
    const readingTimeEl = document.getElementById('readingTime');
    if (!articleBody || !readingTimeEl) return;

    const words = articleBody.innerText.trim().split(/\s+/).length;
    const wordsPerMinute = 200;
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    
    readingTimeEl.textContent = `${minutes} min de lectura`;
}

// Update top reading progress bar on scroll
function initReadingProgress() {
    const progressEl = document.getElementById('readingProgress');
    if (!progressEl) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressEl.style.width = `${scrollPercent}%`;
    }, { passive: true });
}

// Scroll reveal animations for sections
function initScrollReveal() {
    const sections = document.querySelectorAll('.article-section, .article-epigraph, .article-epilogue');
    if (!sections.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                // Optional: stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.classList.add('reveal-hidden');
        observer.observe(section);
    });
}

// Synchronize Table of Contents with active sections
function initTOCSync() {
    const sections = document.querySelectorAll('.article-section');
    const tocLinks = document.querySelectorAll('.toc-link');
    if (!sections.length || !tocLinks.length) return;

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the middle-top area
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                tocLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}
