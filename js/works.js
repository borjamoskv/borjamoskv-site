/**
 * ═══════════════════════════════════════════════════════════════════
 * BORJA MOSKV | WORKS MODULE
 * Category filtering and rendering of the works grid.
 * ═══════════════════════════════════════════════════════════════════
 */

MOSKV.works = (() => {
    'use strict';

    const init = () => {
        const filterBar = document.getElementById('filterBar');
        const worksGrid = document.getElementById('worksGrid');
        
        if (!filterBar || !worksGrid || typeof DATA === 'undefined') return;

        // Render Filters
        let filterHtml = '';
        DATA.categories.forEach((cat, index) => {
            const active = index === 0 ? 'active' : '';
            filterHtml += `<button class="filter-btn ${active}" data-filter="${cat.id}">${cat.label}</button>`;
        });
        filterBar.innerHTML = filterHtml;

        // Render Works
        const renderGrid = (filterId) => {
            worksGrid.innerHTML = '';
            let itemsToRender = DATA.works;
            
            if (filterId !== 'all') {
                itemsToRender = DATA.works.filter(w => w.categories.includes(filterId));
            }

            let gridHtml = '';
            itemsToRender.forEach(work => {
                const thumbUrl = `https://img.youtube.com/vi/${work.id}/hqdefault.jpg`;
                const ytLink = `https://www.youtube.com/watch?v=${work.id}`;

                gridHtml += `
                    <div class="work-card">
                        <a href="${ytLink}" target="_blank" class="work-link" aria-label="${work.title}"></a>
                        <div class="work-thumb" style="background-image: url('${thumbUrl}')"></div>
                        <div class="work-info">
                            <h3 class="work-title">${work.title}</h3>
                            <div class="work-desc">${work.desc}</div>
                        </div>
                    </div>
                `;
            });
            worksGrid.innerHTML = gridHtml;
        };

        // Initial render
        renderGrid('all');

        // Filter events
        filterBar.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                Array.from(filterBar.children).forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                renderGrid(e.target.dataset.filter);
            }
        });
    };

    return { init };
})();
