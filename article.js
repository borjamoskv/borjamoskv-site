// ═══════════════════════════════════════════════════════════════════════════
// ARTICLE CONTROLLER: Reading progress, TOC syncing, and interactive elements
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initReadingTime();
    initTOCSync();
    initHeaderScroll();
});

// Toggle is-scrolled class on scroll
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (header) {
        const checkScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        };
        window.addEventListener('scroll', checkScroll);
        checkScroll(); // Initial check
    }
}

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
