// ═══════════════════════════════════════════════════════════════════════════
// ARTICLE CONTROLLER: Reading progress, TOC syncing, and interactive elements
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initReadingTime();
    initTOCSync();
    initHeaderScroll();
    initReadingProgressFallback();
    initCodeBlockInteractions();
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

// Cross-browser fallback for CSS animation-timeline: scroll()
function initReadingProgressFallback() {
    const progressBar = document.getElementById('readingProgress');
    if (!progressBar) return;

    // Check if browser natively supports animation-timeline: scroll()
    const supportsAnimationTimeline = window.CSS && window.CSS.supports && (
        window.CSS.supports('animation-timeline', 'scroll()') ||
        window.CSS.supports('animation-timeline', 'scroll-timeline')
    );

    if (!supportsAnimationTimeline) {
        const updateProgress = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) : 0;
            progressBar.style.transform = `scaleX(${scrollPercentage})`;
        };
        
        // Remove animation property so JS control can take over
        progressBar.style.animation = 'none';
        progressBar.style.transform = 'scaleX(0)';
        
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }
}

// Add copy buttons and hover highlights to code blocks
function initCodeBlockInteractions() {
    const preBlocks = document.querySelectorAll('.article-body pre');
    preBlocks.forEach((pre) => {
        // Skip mermaid wrappers
        if (pre.classList.contains('mermaid')) return;
        
        pre.style.position = 'relative';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.innerHTML = 'COPIAR';
        copyBtn.setAttribute('aria-label', 'Copiar código al portapapeles');
        
        // Style the copy button natively (Industrial Noir styling)
        Object.assign(copyBtn.style, {
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(10, 10, 10, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            color: 'rgba(255, 255, 255, 0.6)',
            padding: '4px 8px',
            fontSize: '0.65rem',
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '0.1em',
            cursor: 'pointer',
            opacity: '0',
            transition: 'opacity 0.2s ease, border-color 0.2s ease, color 0.2s ease, background 0.2s ease',
            zIndex: '10'
        });
        
        pre.appendChild(copyBtn);
        
        pre.addEventListener('mouseenter', () => {
            copyBtn.style.opacity = '1';
        });
        pre.addEventListener('mouseleave', () => {
            copyBtn.style.opacity = '0';
        });
        
        copyBtn.addEventListener('mouseenter', () => {
            copyBtn.style.color = '#FFF';
            copyBtn.style.borderColor = 'var(--accent-primary, #2B3BE5)';
        });
        copyBtn.addEventListener('mouseleave', () => {
            copyBtn.style.color = 'rgba(255, 255, 255, 0.6)';
            copyBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        copyBtn.addEventListener('click', async () => {
            const codeEl = pre.querySelector('code');
            const codeText = codeEl ? codeEl.innerText : pre.innerText.replace('COPIAR', '').trim();
            
            try {
                await navigator.clipboard.writeText(codeText);
                copyBtn.innerHTML = 'COPIADO ✓';
                copyBtn.style.color = '#00FF66';
                copyBtn.style.borderColor = '#00FF66';
                copyBtn.style.background = 'rgba(0, 255, 102, 0.05)';
                
                setTimeout(() => {
                    copyBtn.innerHTML = 'COPIAR';
                    copyBtn.style.color = 'rgba(255, 255, 255, 0.6)';
                    copyBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    copyBtn.style.background = 'rgba(10, 10, 10, 0.8)';
                }, 2000);
            } catch (err) {
                console.error('Error copying code to clipboard', err);
            }
        });
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

