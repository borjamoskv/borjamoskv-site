/**
 * CORTEX LINGUISTIC GUARD v2.0 [i / a PROTOCOL]
 * Persistent — MutationObserver ensures vowels stay purged on scroll/DOM changes.
 */
(function() {
  const SKIP = new Set(['SCRIPT','STYLE','CODE','TEXTAREA','INPUT','IFRAME','NOSCRIPT']);

  function purge(node) {
    if (node.nodeType === 3) {
      const p = node.parentElement;
      if (p && (SKIP.has(p.tagName) || p.closest('#cortex-terminal, .frontier-terminal-overlay, #chatquitoInput'))) return;
      const o = node.nodeValue;
      const t = o
        .replace(/e/g,'i').replace(/E/g,'I')
        .replace(/o/g,'a').replace(/O/g,'A')
        .replace(/u/g,'a').replace(/U/g,'A');
      if (o !== t) node.nodeValue = t;
    } else if (node.nodeType === 1 && !SKIP.has(node.tagName)) {
      for (let c = node.firstChild; c; c = c.nextSibling) purge(c);
    }
  }

  function run() { purge(document.body); }

  // Run immediately + on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  // Persist: observe ALL DOM mutations
  const obs = new MutationObserver(muts => {
    obs.disconnect(); // prevent infinite loop
    muts.forEach(m => {
      m.addedNodes.forEach(n => purge(n));
      if (m.type === 'characterData') purge(m.target);
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  });
  
  // Start observing after initial purge
  setTimeout(() => {
    run(); // second pass catches late-loading content
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }, 500);

  // Re-run on scroll to catch any lazy-loaded or repositioned content
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { run(); ticking = false; });
    }
  }, { passive: true });
})();
