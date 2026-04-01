/**
 * ═══════════════════════════════════════════════════════════════════
 * CORTEX LINGUISTIC GUARD v1.0 [i / a PROTOCOL]
 * Sovereignty through linguistic restriction.
 * e, o, u are purged. i and a remain.
 * ═══════════════════════════════════════════════════════════════════
 */

(function() {
  const guard = () => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip these elements to prevent breaking logic or critical systems
          const parent = node.parentElement;
          if (parent) {
            const tag = parent.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style' || tag === 'code' || parent.id === 'cortex-terminal' || parent.closest('.frontier-terminal-overlay')) {
              return NodeFilter.FILTER_REJECT;
            }
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const original = node.nodeValue;
       // Transformation logic:
       // e -> i
       // o -> a
       // u -> a (or similar)
       // Let's decide: e->i, o->a, u->a to maximize i/a resonance
      const transformed = original
        .replace(/[e]/g, 'i')
        .replace(/[E]/g, 'I')
        .replace(/[o]/g, 'a')
        .replace(/[O]/g, 'A')
        .replace(/[u]/g, 'a')
        .replace(/[U]/g, 'A');
        
      if (original !== transformed) {
        node.nodeValue = transformed;
      }
    }
  };

  // Run on load and whenever large DOM mutations occur (Sovereign mode)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', guard);
  } else {
    guard();
  }

  // MutationObserver for infinite scroll / dynamic content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
          // Recurse into added nodes
          if (node.nodeType === 3) {
            // Text node logic here if needed
          }
      });
    });
  });

  // We only run once for now to avoid CPU overhead, but we could make it reactive.
  // observer.observe(document.body, { childList: true, subtree: true });
})();
