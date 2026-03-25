(function() {
  'use strict';

  globalThis.MOSKV = globalThis.MOSKV || {};

  const registry = new Map();
  const restoreStack = [];
  let activeOwner = null;

  function emit(type, detail) {
    document.dispatchEvent(new CustomEvent(type, { detail }));
  }

  function ensureEntry(id, config = {}) {
    const existing = registry.get(id) || {};
    const entry = {
      id,
      resume: typeof config.resume === 'function' ? config.resume : existing.resume || (() => {}),
      suspend: typeof config.suspend === 'function' ? config.suspend : existing.suspend || (() => {}),
      restorable: config.restorable ?? existing.restorable ?? true
    };
    registry.set(id, entry);
    return entry;
  }

  function pushRestoreCandidate(id) {
    const idx = restoreStack.lastIndexOf(id);
    if (idx !== -1) restoreStack.splice(idx, 1);
    restoreStack.push(id);
  }

  function popRestoreCandidate(excludeId) {
    while (restoreStack.length > 0) {
      const candidate = restoreStack.pop();
      if (candidate !== excludeId && registry.has(candidate)) {
        return candidate;
      }
    }
    return null;
  }

  function register(id, config = {}) {
    return ensureEntry(id, config);
  }

  function claim(id, options = {}) {
    const entry = ensureEntry(id, options);
    const previousOwner = activeOwner;

    if (previousOwner && previousOwner !== id) {
      const previousEntry = registry.get(previousOwner);
      if ((options.restorePrevious ?? true) && previousEntry?.restorable !== false) {
        pushRestoreCandidate(previousOwner);
      }
      previousEntry?.suspend?.({
        reason: options.reason || 'focus-shift',
        nextOwner: id
      });
    }

    activeOwner = id;

    if (options.resume !== false) {
      entry.resume?.({
        reason: options.reason || 'focus-claim',
        previousOwner
      });
    }

    emit('moskv:audio-focus-change', {
      activeOwner,
      previousOwner,
      reason: options.reason || 'focus-claim'
    });

    return activeOwner;
  }

  function release(id, options = {}) {
    const entry = registry.get(id);
    if (!entry) return null;

    if (activeOwner !== id) {
      const idx = restoreStack.lastIndexOf(id);
      if (idx !== -1) restoreStack.splice(idx, 1);
      return activeOwner;
    }

    entry.suspend?.({
      reason: options.reason || 'focus-release',
      nextOwner: null
    });

    const previousOwner = activeOwner;
    activeOwner = null;

    let restoredOwner = null;
    if (options.resumePrevious !== false) {
      restoredOwner = popRestoreCandidate(id);
      if (restoredOwner) {
        activeOwner = restoredOwner;
        registry.get(restoredOwner)?.resume?.({
          reason: 'focus-restore',
          previousOwner: id
        });
      }
    }

    emit('moskv:audio-focus-change', {
      activeOwner,
      previousOwner,
      reason: options.reason || 'focus-release'
    });

    return activeOwner;
  }

  MOSKV.audioFocus = {
    register,
    claim,
    release,
    isActive(id) {
      return activeOwner === id;
    },
    getActiveOwner() {
      return activeOwner;
    }
  };
})();
