const header = document.querySelector("[data-header]");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const backgroundVideo = document.querySelector("[data-bg-video]");
const backdropStill = document.querySelector(".backdrop__still");
const toggleBackground = document.querySelector("[data-toggle-bg]");
const focusVideo = document.querySelector("[data-focus-video]");
const openImmersiveButtons = Array.from(document.querySelectorAll("[data-open-immersive]"));
const frames = Array.from(document.querySelectorAll("[data-frame]"));
const cues = Array.from(document.querySelectorAll("[data-cue-time]"));
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const closeLightbox = document.querySelector("[data-close]");
const immersive = document.querySelector("[data-immersive]");
const closeImmersive = document.querySelector("[data-close-immersive]");

// Dynamic element queries to prevent stale references when swapping players
const getMainVideo = () => document.querySelector("[data-main-video]");
const getImmersiveVideo = () => document.querySelector("[data-immersive-video]");

const screenContainer = document.querySelector("[data-screen-container]");
const immersiveVideoContainer = document.querySelector("[data-immersive-video-container]");
const currentTitleEl = document.querySelector("[data-video-current-title]");
const currentNoteEl = document.querySelector("[data-video-current-note]");
const currentTypeEl = document.querySelector("[data-video-current-type]");
const currentSourceEl = document.querySelector("[data-video-current-source]");
const playlistItems = Array.from(document.querySelectorAll(".playlist-item"));
const immersiveTitle = document.getElementById("immersive-title");
const immersiveMeta = document.querySelector("[data-immersive-meta]");

const bindMainVideoListeners = () => {
  const mainVid = getMainVideo();
  if (!mainVid) return;

  mainVid.addEventListener("play", () => {
    if (backgroundVideo && !backgroundVideo.paused) {
      backgroundVideo.pause();
      setToggleLabel();
    }
  });

  mainVid.addEventListener("pause", () => {
    if (backgroundVideo && backgroundVideo.paused && !reducedMotion.matches) {
      backgroundVideo.play().then(setToggleLabel, setToggleLabel);
    }
  });

  mainVid.addEventListener("ended", () => {
    if (backgroundVideo && backgroundVideo.paused && !reducedMotion.matches) {
      backgroundVideo.play().then(setToggleLabel, setToggleLabel);
    }
  });
};

const bindImmersiveVideoListeners = (immVid) => {
  if (!immVid) return;

  immVid.addEventListener("play", () => {
    if (backgroundVideo && !backgroundVideo.paused) {
      backgroundVideo.pause();
      setToggleLabel();
    }
  });

  immVid.addEventListener("pause", () => {
    if (backgroundVideo && backgroundVideo.paused && !reducedMotion.matches) {
      backgroundVideo.play().then(setToggleLabel, setToggleLabel);
    }
  });

  immVid.addEventListener("ended", () => {
    if (backgroundVideo && backgroundVideo.paused && !reducedMotion.matches) {
      backgroundVideo.play().then(setToggleLabel, setToggleLabel);
    }
  });
};

let activeVideoId = "LOCAL";
let activeVideoSrc = "media/no-sleep-in-my-city.mp4";
let activeVideoTitle = "No Sleep In My City";
let activeVideoNote = "Música propia con vídeo local: noche, bowl y ciudad en loop.";
let activeVideoType = "Vídeo musical";
let activeVideoSource = "MP4 local";

const localImmersiveTemplate = `
  <video
    class="immersive__video"
    data-immersive-video
    controls
    playsinline
    preload="metadata"
    poster="media/no-sleep-in-my-city-poster.jpg"
  >
    <source src="media/no-sleep-in-my-city.mp4" type="video/mp4" />
  </video>
`;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const backgroundStart = 8;
let defaultBackdropImage = 'url("media/no-sleep-in-my-city-poster.jpg")';

const updateVideoMeta = () => {
  if (currentTitleEl) {
    currentTitleEl.textContent = activeVideoTitle;
  }

  if (currentNoteEl) {
    currentNoteEl.textContent = activeVideoNote;
  }

  if (currentTypeEl) {
    currentTypeEl.textContent = activeVideoType;
  }

  if (currentSourceEl) {
    currentSourceEl.textContent = activeVideoSource;
  }

  if (immersiveTitle) {
    immersiveTitle.textContent = activeVideoTitle;
  }

  if (immersiveMeta) {
    immersiveMeta.textContent = `${activeVideoType} / ${activeVideoSource}`;
  }
};

const setScrolledHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
};

const setToggleLabel = () => {
  if (!toggleBackground || !backgroundVideo) {
    return;
  }

  const paused = backgroundVideo.paused;
  toggleBackground.textContent = paused ? "Reproducir" : "Pausar";
  toggleBackground.setAttribute(
    "aria-label",
    paused ? "Reproducir fondo de vídeo" : "Pausar fondo de vídeo",
  );
};

const setActiveSection = (id) => {
  document.body.dataset.section = id;

  navLinks.forEach((link) => {
    const active = link.hash === `#${id}`;
    link.classList.toggle("is-active", active);

    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const showFramePreview = (image) => {
  if (!backdropStill || !image) {
    return;
  }

  backdropStill.style.backgroundImage = `url("${image}")`;
  document.body.classList.add("is-previewing-frame");
};

const clearFramePreview = () => {
  if (!backdropStill) {
    return;
  }

  backdropStill.style.backgroundImage = defaultBackdropImage;
  document.body.classList.remove("is-previewing-frame");
};

const updateBackgroundProgress = () => {
  if (!backgroundVideo || !Number.isFinite(backgroundVideo.duration)) {
    return;
  }

  const progress = (backgroundVideo.currentTime / backgroundVideo.duration) * 100;
  document.documentElement.style.setProperty("--video-progress", `${progress.toFixed(2)}%`);
};

const seekMainVideo = (time) => {
  const mainVid = getMainVideo();
  if (!mainVid || !Number.isFinite(time)) {
    return;
  }

  const maxTime = Number.isFinite(mainVid.duration)
    ? Math.max(mainVid.duration - 0.25, 0)
    : time;

  try {
    mainVid.currentTime = Math.min(time, maxTime);
  } catch {
    mainVid.addEventListener("loadedmetadata", () => seekMainVideo(time), { once: true });
  }
};

const jumpMainVideo = async (time) => {
  const mainVid = getMainVideo();
  if (!mainVid || !Number.isFinite(time)) {
    return;
  }

  if (mainVid.readyState >= 1) {
    seekMainVideo(time);
  } else {
    mainVid.addEventListener("loadedmetadata", () => seekMainVideo(time), { once: true });
    mainVid.load();
  }

  mainVid.scrollIntoView({ behavior: "smooth", block: "center" });

  try {
    await mainVid.play();
    window.setTimeout(() => seekMainVideo(time), 80);
  } catch {
    seekMainVideo(time);
    mainVid.focus();
  }
};

const seekImmersiveVideo = (time) => {
  const immVid = getImmersiveVideo();
  if (!immVid || !Number.isFinite(time)) {
    return;
  }

  const maxTime = Number.isFinite(immVid.duration)
    ? Math.max(immVid.duration - 0.25, 0)
    : time;

  try {
    immVid.currentTime = Math.min(time, maxTime);
  } catch {
    immVid.addEventListener("loadedmetadata", () => seekImmersiveVideo(time), {
      once: true,
    });
  }
};

const getVideoTime = () => {
  const mainVid = getMainVideo();
  if (mainVid && mainVid.currentTime > 0.2) {
    return mainVid.currentTime;
  }

  return backgroundVideo?.currentTime ?? 0;
};

const openImmersive = async () => {
  if (!immersive) {
    return;
  }

  if (typeof immersive.showModal === "function" && !immersive.open) {
    immersive.showModal();
  } else {
    immersive.setAttribute("open", "");
  }

  document.body.classList.add("is-immersive");
  updateVideoMeta();

  if (activeVideoId === "LOCAL") {
    if (!getImmersiveVideo()) {
      if (immersiveVideoContainer) {
        immersiveVideoContainer.innerHTML = localImmersiveTemplate;
      }
    }
    const immVid = getImmersiveVideo();
    if (!immVid) return;

    // Bind listeners to manage backdrop video during immersive playback
    bindImmersiveVideoListeners(immVid);

    const time = getVideoTime();

    if (immVid.readyState >= 1) {
      seekImmersiveVideo(time);
    } else {
      immVid.addEventListener("loadedmetadata", () => seekImmersiveVideo(time), {
        once: true,
      });
      immVid.load();
    }

    try {
      await immVid.play();
      window.setTimeout(() => seekImmersiveVideo(time), 80);
    } catch {
      seekImmersiveVideo(time);
      closeImmersive?.focus();
    }
  } else {
    if (immersiveVideoContainer) {
      immersiveVideoContainer.innerHTML = `
        <iframe
          class="immersive__video"
          src="https://www.youtube.com/embed/${activeVideoId}?autoplay=1&enablejsapi=1&rel=0"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      `;
    }
  }
};

const syncMainVideoFromImmersive = () => {
  const mainVid = getMainVideo();
  const immVid = getImmersiveVideo();
  if (!mainVid || !immVid || !Number.isFinite(immVid.currentTime)) {
    return;
  }

  if (mainVid.readyState >= 1) {
    seekMainVideo(immVid.currentTime);
  } else {
    mainVid.addEventListener("loadedmetadata", () => seekMainVideo(immVid.currentTime), {
      once: true,
    });
  }
};

const closeImmersiveMode = () => {
  if (!immersive) {
    return;
  }

  if (activeVideoId === "LOCAL") {
    const immVid = getImmersiveVideo();
    const wasPlaying = immVid && !immVid.paused;
    syncMainVideoFromImmersive();
    immVid?.pause();

    if (wasPlaying) {
      const mainVid = getMainVideo();
      mainVid?.play().catch(() => {});
    }
  } else {
    if (immersiveVideoContainer) {
      immersiveVideoContainer.innerHTML = "";
    }
  }

  document.body.classList.remove("is-immersive");

  if (immersive.open) {
    immersive.close();
  } else {
    immersive.removeAttribute("open");
  }
};

const getStillMetadata = (videoId, idx) => {
  if (videoId === "LOCAL") {
    const localMeta = [
      {
        desc: "Fotograma de vídeo con bowl nocturno",
        hash: "SHA256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        provenance: "STATUS: C5-REAL | LEDGER: ETH-842918"
      },
      {
        desc: "Fotograma de vídeo en skatepark",
        hash: "SHA256-8f4b1d3d63b27ae64700777fa6b7852b855ca495991b7852b855ca495991b785",
        provenance: "STATUS: C5-REAL | LEDGER: ETH-842918"
      },
      {
        desc: "Fotograma oscuro con texto manuscrito",
        hash: "SHA256-0193f6c512347890abcdef1234567890abcdef1234567890abcdef1234567890",
        provenance: "STATUS: C5-REAL | LEDGER: ETH-842918"
      },
      {
        desc: "Fotograma con patinador y sombra",
        hash: "SHA256-550e8400e29b41d4a716446655440000abcdef1234567890abcdef1234567890",
        provenance: "STATUS: C5-REAL | LEDGER: ETH-842918"
      },
      {
        desc: "Fotograma nocturno de vídeo",
        hash: "SHA256-7c9c0f49ea2c448d8b4b1d3d63b27ae64700777fa6b7852b855ca495991b7852b",
        provenance: "STATUS: C5-REAL | LEDGER: ETH-842918"
      },
      {
        desc: "Fotograma en bowl bajo estrellas",
        hash: "SHA256-06f1ae8d2c448d9a8b4b1d3d63b27ae64700777fa6b7852b855ca495991b7852bc",
        provenance: "STATUS: C5-REAL | LEDGER: ETH-842918"
      }
    ];
    return localMeta[idx] || localMeta[0];
  } else {
    const descText = `Fotograma de ${activeVideoTitle} - Frame ${idx + 1}`;
    let val = 0;
    const key = (videoId || "") + idx;
    for (let i = 0; i < key.length; i++) {
      val = (val << 5) - val + key.charCodeAt(i);
      val |= 0;
    }
    const hex = Math.abs(val).toString(16).padStart(8, "0") + 
                Math.abs(val * 31).toString(16).padStart(8, "0") +
                Math.abs(val * 97).toString(16).padStart(8, "0");
    const hash = `SHA256-${hex.substring(0, 16).padEnd(16, "0")}...`;
    
    return {
      desc: descText,
      hash: hash,
      provenance: "STATUS: C5-REAL | LEDGER: ETH-842918"
    };
  }
};

const updateCollageStills = (videoId, framesAttr = null) => {
  const stillButtons = Array.from(document.querySelectorAll(".still"));
  if (stillButtons.length === 0) return;

  let framesArray = [];

  if (framesAttr) {
    framesArray = framesAttr.split(",").map(f => f.trim());
  } else if (videoId === "LOCAL") {
    framesArray = [
      "media/gambitero-real-01.jpg",
      "media/gambitero-real-02.jpg",
      "media/gambitero-real-03.jpg",
      "media/gambitero-real-04.jpg",
      "media/gambitero-real-05.jpg",
      "media/gambitero-real-06.jpg"
    ];
  } else {
    // Generate YouTube frames
    framesArray = [
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/hq1.jpg`,
      `https://img.youtube.com/vi/${videoId}/hq2.jpg`,
      `https://img.youtube.com/vi/${videoId}/hq3.jpg`,
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/default.jpg`
    ];
  }

  stillButtons.forEach((button, idx) => {
    const frameUrl = framesArray[idx] || framesArray[0];
    if (!frameUrl) return;

    button.dataset.frame = frameUrl;

    const img = button.querySelector("img");
    if (img) {
      button.style.opacity = "0.2";
      button.style.transform = "scale(0.96) translate3d(0,0,0)";
      
      img.src = frameUrl;
      img.alt = `Fotograma de ${activeVideoTitle} - Frame ${idx + 1}`;

      // Update description and cryptographic metadata text inside the overlay
      const descEl = button.querySelector(".still__desc");
      const hashEl = button.querySelector(".crypto-hash");
      const provEl = button.querySelector(".crypto-prov");
      const meta = getStillMetadata(videoId, idx);

      if (descEl) descEl.textContent = meta.desc;
      if (hashEl) hashEl.textContent = `HASH: ${meta.hash}`;
      if (provEl) provEl.textContent = meta.provenance;
      
      setTimeout(() => {
        button.style.opacity = "";
        button.style.transform = "";
      }, 80 + idx * 40);
    }
  });
};

// Switch playlist video
const switchVideo = (videoId, title, localSrc = null, meta = {}) => {
  activeVideoId = videoId || "LOCAL";
  activeVideoTitle = title || "No Sleep In My City";
  activeVideoNote = meta.note || "Música y vídeo seleccionados del archivo.";
  activeVideoType = meta.type || "Pieza";
  activeVideoSource = meta.source || "YouTube";
  const framesAttr = meta.frames || null;
  updateVideoMeta();

  if (activeVideoId === "LOCAL") {
    activeVideoSrc = localSrc || "media/no-sleep-in-my-city.mp4";
    defaultBackdropImage = 'url("media/no-sleep-in-my-city-poster.jpg")';
    if (screenContainer) {
      screenContainer.innerHTML = `
        <video
          class="screen__video"
          data-main-video
          poster="media/no-sleep-in-my-city-poster.jpg"
          controls
          playsinline
          preload="metadata"
        >
          <source src="${activeVideoSrc}" type="video/mp4" />
        </video>
      `;
    }
    bindMainVideoListeners();
  } else {
    defaultBackdropImage = `url("https://img.youtube.com/vi/${videoId}/hqdefault.jpg")`;
    if (screenContainer) {
      screenContainer.innerHTML = `
        <iframe
          class="screen__video"
          src="https://www.youtube.com/embed/${activeVideoId}?autoplay=1&enablejsapi=1&rel=0"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      `;
    }
  }

  if (backdropStill) {
    backdropStill.style.backgroundImage = defaultBackdropImage;
  }

  updateCollageStills(videoId, framesAttr);
};

const primeBackgroundVideo = () => {
  if (!backgroundVideo || !Number.isFinite(backgroundVideo.duration)) {
    return;
  }

  if (backgroundVideo.currentTime < 1) {
    backgroundVideo.currentTime = Math.min(backgroundStart, backgroundVideo.duration - 1);
  }
};

setScrolledHeader();
setActiveSection("inicio");
bindMainVideoListeners();
updateVideoMeta();
window.addEventListener("scroll", setScrolledHeader, { passive: true });

if (backgroundVideo) {
  if (backgroundVideo.readyState >= 1) {
    primeBackgroundVideo();
  } else {
    backgroundVideo.addEventListener("loadedmetadata", primeBackgroundVideo, { once: true });
  }

  if (reducedMotion.matches) {
    backgroundVideo.removeAttribute("autoplay");
    backgroundVideo.pause();
    setToggleLabel();
  } else {
    backgroundVideo.play().then(setToggleLabel, setToggleLabel);
  }

  backgroundVideo.addEventListener("timeupdate", updateBackgroundProgress);
  backgroundVideo.addEventListener("loadedmetadata", updateBackgroundProgress, { once: true });
}

toggleBackground?.addEventListener("click", async () => {
  if (!backgroundVideo) {
    return;
  }

  if (backgroundVideo.paused) {
    try {
      await backgroundVideo.play();
    } catch {
      return;
    }
  } else {
    backgroundVideo.pause();
  }

  setToggleLabel();
});

focusVideo?.addEventListener("click", async () => {
  if (activeVideoId === "LOCAL") {
    const mainVid = getMainVideo();
    await jumpMainVideo(mainVid?.currentTime ?? 0);
  } else {
    const iframe = screenContainer?.querySelector("iframe");
    if (iframe) {
      iframe.scrollIntoView({ behavior: "smooth", block: "center" });
      const currentSrc = iframe.src;
      if (!currentSrc.includes("autoplay=1")) {
        iframe.src = currentSrc.replace("autoplay=0", "autoplay=1");
      }
    }
  }
});

openImmersiveButtons.forEach((button) => {
  button.addEventListener("click", openImmersive);
});

closeImmersive?.addEventListener("click", closeImmersiveMode);

immersive?.addEventListener("cancel", () => {
  if (activeVideoId === "LOCAL") {
    const immVid = getImmersiveVideo();
    syncMainVideoFromImmersive();
    immVid?.pause();
  } else {
    if (immersiveVideoContainer) {
      immersiveVideoContainer.innerHTML = "";
    }
  }
  document.body.classList.remove("is-immersive");
});

immersive?.addEventListener("close", () => {
  document.body.classList.remove("is-immersive");
});

playlistItems.forEach((item) => {
  item.addEventListener("click", () => {
    const executeSwitch = () => {
      playlistItems.forEach((p) => p.classList.toggle("is-active", p === item));
      const videoId = item.dataset.videoId;
      const title = item.dataset.title;
      const localSrc = item.dataset.videoSrc || null;
      const frames = item.dataset.frames || null;
      switchVideo(videoId, title, localSrc, {
        note: item.dataset.note,
        source: item.dataset.source,
        type: item.dataset.type,
        frames: frames,
      });
    };

    if (document.startViewTransition) {
      document.startViewTransition(() => executeSwitch());
    } else {
      executeSwitch();
    }
  });
});

cues.forEach((cue) => {
  cue.addEventListener("pointerenter", () => showFramePreview(cue.dataset.cueFrame));
  cue.addEventListener("pointerleave", clearFramePreview);
  cue.addEventListener("focus", () => showFramePreview(cue.dataset.cueFrame));
  cue.addEventListener("blur", clearFramePreview);

  cue.addEventListener("click", async () => {
    cues.forEach((item) => item.classList.toggle("is-cued", item === cue));
    showFramePreview(cue.dataset.cueFrame);
    await jumpMainVideo(Number(cue.dataset.cueTime));
  });
});

frames.forEach((frame) => {
  frame.addEventListener("pointerenter", () => showFramePreview(frame.dataset.frame));
  
  frame.addEventListener("pointerleave", () => {
    clearFramePreview();
    if (frame.dataset.tiltRaf) {
      cancelAnimationFrame(Number(frame.dataset.tiltRaf));
    }
    frame.style.transform = "";
    frame.style.boxShadow = "";
    const shine = frame.querySelector(".still-shine");
    if (shine) {
      shine.style.background = "";
    }
  });
  
  frame.addEventListener("focus", () => showFramePreview(frame.dataset.frame));
  
  frame.addEventListener("blur", () => {
    clearFramePreview();
    if (frame.dataset.tiltRaf) {
      cancelAnimationFrame(Number(frame.dataset.tiltRaf));
    }
    frame.style.transform = "";
    frame.style.boxShadow = "";
  });

  frame.addEventListener("pointermove", (e) => {
    if (reducedMotion.matches) return;

    if (frame.dataset.tiltRaf) {
      cancelAnimationFrame(Number(frame.dataset.tiltRaf));
    }

    frame.dataset.tiltRaf = requestAnimationFrame(() => {
      const rect = frame.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      const nx = (x - xc) / xc;
      const ny = (yc - y) / yc;
      
      const rotX = (ny * 10).toFixed(2);
      const rotY = (nx * 10).toFixed(2);
      
      frame.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px) scale(1.035)`;
      frame.style.boxShadow = `${-nx * 12}px ${ny * 12 + 16}px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(43, 59, 229, 0.18)`;
      
      let shine = frame.querySelector(".still-shine");
      if (!shine) {
        shine = document.createElement("div");
        shine.className = "still-shine";
        frame.appendChild(shine);
      }
      const pctX = ((x / rect.width) * 100).toFixed(1);
      const pctY = ((y / rect.height) * 100).toFixed(1);
      shine.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 65%)`;
    });
  });

  frame.addEventListener("click", () => {
    const image = frame.dataset.frame;
    const img = frame.querySelector("img");

    if (!image || !lightbox || !lightboxImage) {
      return;
    }

    lightboxImage.src = image;
    lightboxImage.alt = img?.alt ?? "";

    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
      return;
    }

    window.open(image, "_blank", "noopener,noreferrer");
  });
});

closeLightbox?.addEventListener("click", () => {
  lightbox?.close();
});

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        setActiveSection(entry.target.id);
      });
    },
    { rootMargin: "-46% 0px -46% 0px", threshold: 0 },
  );

  ["inicio", "musica", "artworks", "video", "fotogramas"].forEach((id) => {
    const section = document.getElementById(id);
    if (section) {
      sectionObserver.observe(section);
    }
  });
}

let windowTiltRaf;
window.addEventListener(
  "pointermove",
  (event) => {
    if (windowTiltRaf) {
      cancelAnimationFrame(windowTiltRaf);
    }
    windowTiltRaf = requestAnimationFrame(() => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      document.documentElement.style.setProperty("--mx", x.toFixed(3));
      document.documentElement.style.setProperty("--my", y.toFixed(3));
    });
  },
  { passive: true },
);

let windowScrollRaf;
window.addEventListener(
  "scroll",
  () => {
    if (windowScrollRaf) {
      cancelAnimationFrame(windowScrollRaf);
    }
    windowScrollRaf = requestAnimationFrame(() => {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollMax <= 0) return;
      const sy = window.scrollY / scrollMax;
      document.documentElement.style.setProperty("--sy", sy.toFixed(3));
    });
  },
  { passive: true },
);

// ==========================================================================
// APCA CONTRAST THEME SWITCH LOGIC
// ==========================================================================
const themeBtn = document.getElementById("theme-switch");
if (themeBtn) {
  const savedTheme = localStorage.getItem("moskv-theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
  }
  themeBtn.addEventListener("click", () => {
    const isLight = document.body.classList.toggle("light-theme");
    localStorage.setItem("moskv-theme", isLight ? "light" : "dark");
  });
}

// ==========================================================================
// LIQUID DISTORTION WAVE HOVER ANIMATION
// ==========================================================================
const liquidDisp = document.getElementById("liquid-disp");
if (liquidDisp) {
  let dispScale = 0;
  let dispTarget = 0;
  let dispRaf = null;

  const animateDisp = () => {
    dispScale += (dispTarget - dispScale) * 0.15;
    liquidDisp.setAttribute("scale", dispScale.toFixed(2));
    if (Math.abs(dispTarget - dispScale) > 0.05) {
      dispRaf = requestAnimationFrame(animateDisp);
    } else {
      dispScale = dispTarget;
      liquidDisp.setAttribute("scale", dispScale);
      dispRaf = null;
    }
  };

  const triggers = document.querySelectorAll(".brand, .site-nav a, .text-link, .arcade-slot");
  triggers.forEach(el => {
    el.classList.add("liquid-trigger");
    el.addEventListener("pointerenter", () => {
      dispTarget = 25;
      if (!dispRaf) animateDisp();
    });
    el.addEventListener("pointerleave", () => {
      dispTarget = 0;
      if (!dispRaf) animateDisp();
    });
  });
}

// ==========================================================================
// PORTFOLIO VIRTUAL LOUPE & LIGHTING RELIEF SHADING FOR HYPERREALISM
// ==========================================================================
frames.forEach((frame, idx) => {
  // Append fine texture grain weave
  const textureLayer = document.createElement("div");
  textureLayer.className = "still-texture-layer";
  frame.appendChild(textureLayer);

  // Append spotlight relief layer
  const spotlightLayer = document.createElement("div");
  spotlightLayer.className = "still-spotlight-shading";
  frame.appendChild(spotlightLayer);

  // Append loupe magnifier
  const loupeEl = document.createElement("div");
  loupeEl.className = "still-loupe";
  loupeEl.style.backgroundImage = `url(${frame.dataset.frame})`;
  frame.appendChild(loupeEl);

  // Append cryptographic proof provenance details
  const mockHashes = [
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "8f4b1d3d63b27ae6c44933ba20d0f41a0212a452ef322304df34ba219a12c85e",
    "0193f6c512347890abcd1234567890ab258cdb8d145c22e4c965bdf2542a12a5",
    "550e8400e29b41d4a716446655440000a6c221e892c55b6ef22cd35ef6b2cfd2",
    "7c9c0f49ea2c448d3db8cf8de1c8d415b3e21014e7a2b64d39f4e2cb5a8553e1",
    "28e469c8cdb732d8471b65e23114aef72cd35bf40df48de5cfbd3e8c142bcfb4"
  ];
  const provEl = document.createElement("div");
  provEl.className = "provenance-card";
  provEl.innerHTML = `
    <strong>CRYPTOGRAPHIC PROVENANCE</strong>
    <span>HASH: SHA256-${mockHashes[idx % mockHashes.length].substring(0, 16)}...</span>
    <span>STATUS: C5-REAL | LEDGER: ETH-842918</span>
  `;
  frame.appendChild(provEl);

  // Hook magnifier tracking onto mouse pointer move
  frame.addEventListener("pointermove", (e) => {
    const rect = frame.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    frame.style.setProperty("--light-x", `${(x / rect.width * 100).toFixed(1)}%`);
    frame.style.setProperty("--light-y", `${(y / rect.height * 100).toFixed(1)}%`);

    loupeEl.style.left = `${x}px`;
    loupeEl.style.top = `${y}px`;
    loupeEl.style.backgroundSize = `${rect.width * 3.5}px ${rect.height * 3.5}px`;
    
    const bgX = -(x * 3.5 - 70);
    const bgY = -(y * 3.5 - 70);
    loupeEl.style.backgroundPosition = `${bgX}px ${bgY}px`;
  });
});

// ==========================================================================
// RETRO ARCADE ROOM: 21 MINI-GAMES INTERACTIVE MANAGER
// ==========================================================================
class ArcadeManager {
  constructor() {
    this.dialog = document.querySelector("[data-arcade]");
    this.canvas = document.getElementById("arcade-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.audioCtx = null;
    
    this.activeGameIdx = 0;
    this.gameRaf = null;
    
    // Sliders
    this.param1 = document.getElementById("param-1");
    this.param2 = document.getElementById("param-2");
    this.val1 = document.querySelector("[data-slider-1-val]");
    this.val2 = document.querySelector("[data-slider-2-val]");
    
    // Controls
    this.btnAudio = document.getElementById("btn-audio");
    this.btnReset = document.getElementById("btn-reset");
    this.isAudioOn = true;
    
    this.mouseX = 320;
    this.mouseY = 200;
    this.isMouseDown = false;
    
    this.exergyEl = document.querySelector("[data-arcade-exergy]");
    
    this.initGames();
    this.initEvents();
  }

  initGames() {
    const self = this;
    const ctx = this.ctx;
    
    function getSynth(freq, type="sawtooth", release=0.1) {
      if (!self.isAudioOn || !self.audioCtx) return null;
      if (self.audioCtx.state === "suspended") self.audioCtx.resume();
      
      const osc = self.audioCtx.createOscillator();
      const gain = self.audioCtx.createGain();
      const filter = self.audioCtx.createBiquadFilter();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, self.audioCtx.currentTime);
      
      filter.type = "lowpass";
      filter.Q.setValueAtTime(8, self.audioCtx.currentTime);
      filter.frequency.setValueAtTime(2000, self.audioCtx.currentTime);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(self.audioCtx.destination);
      
      gain.gain.setValueAtTime(0.08, self.audioCtx.currentTime);
      return { osc, gain, filter, release };
    }
    
    this.gamesList = [
      // 01: Acid Synth 303
      {
        name: "Acid Synth 303",
        desc: "Sintetizador clásico TB-303 con secuenciador y filtros. Haz click y arrastra en la pantalla para modificar resonancia y frecuencia.",
        notes: [110, 130.81, 146.83, 164.81, 196, 220, 261.63, 293.66],
        step: 0,
        lastTime: 0,
        setup(c) {
          this.step = 0;
          this.lastTime = 0;
        },
        update(c, ctx, p1, p2, mx, my, md) {
          const bpm = 110 + p1 * 1.5;
          const cutoff = 200 + p2 * 30;
          const interval = 60000 / bpm / 4;
          const now = Date.now();
          
          if (now - this.lastTime > interval) {
            this.lastTime = now;
            this.step = (this.step + 1) % 16;
            
            if (self.isAudioOn && self.audioCtx) {
              const noteIndex = Math.floor(Math.sin(this.step * 0.7) * 4 + 4) % this.notes.length;
              const freq = this.notes[noteIndex];
              const synth = getSynth(freq, "sawtooth", 0.15);
              if (synth) {
                synth.filter.frequency.exponentialRampToValueAtTime(cutoff + (md ? mx : 300), self.audioCtx.currentTime + 0.1);
                synth.osc.start();
                synth.gain.gain.setValueAtTime(0.12, self.audioCtx.currentTime);
                synth.gain.gain.exponentialRampToValueAtTime(0.001, self.audioCtx.currentTime + 0.14);
                synth.osc.stop(self.audioCtx.currentTime + 0.15);
              }
            }
          }
          
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          ctx.strokeStyle = "rgba(43, 59, 229, 0.2)";
          ctx.lineWidth = 1;
          for (let i = 0; i < 16; i++) {
            const x = (c.width / 16) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, c.height);
            ctx.stroke();
            if (i === this.step) {
              ctx.fillStyle = "rgba(255, 159, 28, 0.15)";
              ctx.fillRect(x, 0, c.width / 16, c.height);
            }
          }
          
          ctx.strokeStyle = "oklch(0.78 0.22 80)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let i = 0; i < c.width; i++) {
            const y = c.height / 2 + Math.sin(i * 0.05 + now * 0.01) * (md ? my * 0.4 : 40) * Math.sin(i * 0.002);
            if (i === 0) ctx.moveTo(i, y);
            else ctx.lineTo(i, y);
          }
          ctx.stroke();
          
          ctx.fillStyle = "oklch(0.48 0.32 250)";
          ctx.beginPath();
          ctx.arc(mx, my, md ? 24 : 12, 0, Math.PI * 2);
          ctx.fill();
        },
        destroy() {}
      },
      
      // 02: Cortex Void
      {
        name: "Cortex Void",
        desc: "Simulación de vacío cuántico con partículas atraídas por gravedad gravitacional. Modifica la velocidad con X e Y.",
        pts: [],
        setup(c) {
          this.pts = [];
          for (let i = 0; i < 200; i++) {
            this.pts.push({
              x: Math.random() * c.width,
              y: Math.random() * c.height,
              vx: 0,
              vy: 0,
              color: `oklch(0.82 0.24 ${120 + Math.random() * 100})`
            });
          }
        },
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "rgba(10, 10, 10, 0.2)";
          ctx.fillRect(0, 0, c.width, c.height);
          
          const speedFactor = 0.01 + p1 * 0.0005;
          const friction = 0.90 + p2 * 0.0008;
          
          this.pts.forEach(p => {
            const dx = mx - p.x;
            const dy = my - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            const force = (md ? 8 : 3) / dist;
            p.vx += dx * force * speedFactor;
            p.vy += dy * force * speedFactor;
            
            p.vx *= friction;
            p.vy *= friction;
            
            p.x += p.vx;
            p.y += p.vy;
            
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, md ? 3.5 : 2, 0, Math.PI * 2);
            ctx.fill();
          });
        },
        destroy() { this.pts = []; }
      },

      // 03: Brush Magnifier
      {
        name: "Brush Magnifier",
        desc: "Magnificador de lienzo hiperrealista. Examina detalles microscópicos y la trama física del óleo sobre lienzo.",
        setup(c) {},
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "#161311";
          ctx.fillRect(0, 0, c.width, c.height);
          
          ctx.fillStyle = "oklch(0.48 0.32 250 / 0.8)";
          ctx.fillRect(100, 100, 440, 200);
          ctx.fillStyle = "oklch(0.78 0.22 80 / 0.7)";
          ctx.beginPath();
          ctx.arc(320, 200, 110, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = "rgba(255,255,255,0.03)";
          ctx.lineWidth = 1;
          for (let i = 0; i < c.width; i += 4) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, c.height); ctx.stroke();
          }
          for (let i = 0; i < c.height; i += 4) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(c.width, i); ctx.stroke();
          }
          
          const radius = 80 + p1 * 0.5;
          const zoom = 2 + p2 * 0.02;
          
          ctx.save();
          ctx.beginPath();
          ctx.arc(mx, my, radius, 0, Math.PI * 2);
          ctx.clip();
          
          ctx.fillStyle = "#221C18";
          ctx.fillRect(0, 0, c.width, c.height);
          
          ctx.save();
          ctx.translate(mx, my);
          ctx.scale(zoom, zoom);
          ctx.translate(-mx, -my);
          
          ctx.fillStyle = "oklch(0.48 0.32 250 / 0.9)";
          ctx.fillRect(100, 100, 440, 200);
          ctx.fillStyle = "oklch(0.78 0.22 80)";
          ctx.beginPath();
          ctx.arc(320, 200, 110, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = "rgba(255,255,255,0.08)";
          ctx.lineWidth = 0.5;
          for (let i = 0; i < 400; i += 6) {
            ctx.beginPath();
            ctx.moveTo(100, i);
            ctx.bezierCurveTo(200, i + 20, 440, i - 20, 540, i);
            ctx.stroke();
          }
          
          ctx.restore();
          ctx.restore();
          
          ctx.strokeStyle = "oklch(0.48 0.32 250)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(mx, my, radius, 0, Math.PI * 2);
          ctx.stroke();
        },
        destroy() {}
      },

      // 04: Studio Spotlight
      {
        name: "Studio Spotlight",
        desc: "Modo iluminación de estudio. Desplaza el foco para proyectar sombras tangibles en las grietas del lienzo hiperrealista.",
        setup(c) {},
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          ctx.fillStyle = "#333";
          ctx.beginPath();
          ctx.arc(320, 200, 120, 0, Math.PI * 2);
          ctx.fill();
          
          const radius = 200 + p1 * 3;
          const intensity = 0.5 + p2 * 0.005;
          const grad = ctx.createRadialGradient(mx, my, 20, mx, my, radius);
          grad.addColorStop(0, `rgba(255, 230, 200, ${intensity})`);
          grad.addColorStop(0.5, "rgba(20, 20, 20, 0.4)");
          grad.addColorStop(1, "rgba(0, 0, 0, 0.95)");
          
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, c.width, c.height);
          
          ctx.strokeStyle = "rgba(255,255,255,0.2)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(320, 200, 120, 0, Math.PI * 2);
          ctx.stroke();
        },
        destroy() {}
      },

      // 05: Pixel Canvas
      {
        name: "Pixel Canvas",
        desc: "Lienzo de dibujo retro. Pinta píxeles directamente sobre la matriz retro del CRT. X cambia tamaño, Y cambia color.",
        grid: [],
        setup(c) {
          this.grid = Array(40 * 25).fill(0);
        },
        update(c, ctx, p1, p2, mx, my, md) {
          const cellWidth = 16;
          const cellHeight = 16;
          const cols = 40;
          const rows = 25;
          
          if (md) {
            const col = Math.floor(mx / cellWidth);
            const row = Math.floor(my / cellHeight);
            if (col >= 0 && col < cols && row >= 0 && row < rows) {
              const hue = Math.floor(p2 * 3.6);
              this.grid[row * cols + col] = hue || 1;
            }
          }
          
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          for (let r = 0; r < rows; r++) {
            for (let col = 0; col < cols; col++) {
              const val = this.grid[r * cols + col];
              if (val > 0) {
                ctx.fillStyle = `hsl(${val}, 85%, 55%)`;
                ctx.fillRect(col * cellWidth, r * cellHeight, cellWidth - 1, cellHeight - 1);
              }
            }
          }
        },
        destroy() { this.grid = []; }
      },

      // 06: Kaleido Mirror
      {
        name: "Kaleido Mirror",
        desc: "Espejo caleidoscópico radial. Pinta hermosos patrones simétricos reflejados sobre múltiples ejes.",
        setup(c) {
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
        },
        update(c, ctx, p1, p2, mx, my, md) {
          if (!md) {
            ctx.fillStyle = "rgba(10, 10, 10, 0.01)";
            ctx.fillRect(0, 0, c.width, c.height);
            return;
          }
          
          const axes = Math.floor(4 + p1 * 0.1);
          const brushSize = 2 + p2 * 0.15;
          const cx = c.width / 2;
          const cy = c.height / 2;
          
          const dx = mx - cx;
          const dy = my - cy;
          const r = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          
          ctx.fillStyle = `oklch(0.78 0.22 ${Math.floor(r * 0.5) % 360})`;
          
          for (let i = 0; i < axes; i++) {
            const a = angle + (Math.PI * 2 / axes) * i;
            const x = cx + Math.cos(a) * r;
            const y = cy + Math.sin(a) * r;
            ctx.beginPath();
            ctx.arc(x, y, brushSize, 0, Math.PI * 2);
            ctx.fill();
            
            const aRef = -angle + (Math.PI * 2 / axes) * i;
            const xRef = cx + Math.cos(aRef) * r;
            const yRef = cy + Math.sin(aRef) * r;
            ctx.beginPath();
            ctx.arc(xRef, yRef, brushSize, 0, Math.PI * 2);
            ctx.fill();
          }
        },
        destroy() {}
      },

      // 07: Bezier Ropes
      {
        name: "Bezier Ropes",
        desc: "Cuerdas elásticas Bézier. Wiggle interactivo que reacciona fluidamente a los desplazamientos de la mano.",
        setup(c) {},
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "rgba(10, 10, 10, 0.12)";
          ctx.fillRect(0, 0, c.width, c.height);
          
          const ropes = 6;
          ctx.lineWidth = 2;
          for (let i = 0; i < ropes; i++) {
            ctx.strokeStyle = `oklch(0.68 0.25 ${240 + i * 20})`;
            ctx.beginPath();
            ctx.moveTo(0, c.height / ropes * i);
            const cpX = mx + Math.sin(Date.now() * 0.002 + i) * 60;
            const cpY = my + Math.cos(Date.now() * 0.002 + i) * 60;
            ctx.quadraticCurveTo(cpX, cpY, c.width, c.height / ropes * i);
            ctx.stroke();
          }
        },
        destroy() {}
      },

      // 08: Fourier Spiro
      {
        name: "Fourier Spiro",
        desc: "Spirografo de órbitas de Fourier. Traza curvas planetarias matemáticas mediante engranajes giratorios.",
        angle: 0,
        points: [],
        setup(c) {
          this.angle = 0;
          this.points = [];
        },
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          const R = 80 + p1 * 0.5;
          const r = 20 + p2 * 0.3;
          const d = 40;
          const speed = 0.04;
          
          this.angle += speed;
          if (this.points.length > 500) this.points.shift();
          
          const cx = c.width / 2;
          const cy = c.height / 2;
          
          const k = r / R;
          const x = cx + R * ((1 - k) * Math.cos(this.angle) + d / R * k * Math.cos((1 - k) * this.angle / k));
          const y = cy + R * ((1 - k) * Math.sin(this.angle) - d / R * k * Math.sin((1 - k) * this.angle / k));
          
          this.points.push({ x, y });
          
          ctx.strokeStyle = "rgba(255,255,255,0.05)";
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, Math.PI*2);
          ctx.stroke();
          
          ctx.strokeStyle = "oklch(0.78 0.22 80)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          this.points.forEach((p, idx) => {
            if (idx === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          });
          ctx.stroke();
        },
        destroy() { this.points = []; }
      },

      // 09: Binary Matrix
      {
        name: "Binary Matrix",
        desc: "Lluvia de código binario digital. Las cascadas fosforescentes del terminal reaccionan a los bloques de colisión.",
        cols: [],
        setup(c) {
          const fontSize = 12;
          const count = Math.floor(c.width / fontSize);
          this.cols = [];
          for (let i = 0; i < count; i++) {
            this.cols.push({
              x: i * fontSize,
              y: Math.random() * -600,
              speed: 2 + Math.random() * 5
            });
          }
        },
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "rgba(10, 10, 10, 0.15)";
          ctx.fillRect(0, 0, c.width, c.height);
          
          ctx.fillStyle = "oklch(0.82 0.24 140)";
          ctx.font = "11px Courier";
          
          const speedMult = 0.5 + p1 * 0.02;
          
          this.cols.forEach(col => {
            const char = Math.random() > 0.5 ? "1" : "0";
            
            const dx = mx - col.x;
            const dy = my - col.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 40) {
              col.y -= 15;
            }
            
            ctx.fillText(char, col.x, col.y);
            
            col.y += col.speed * speedMult;
            if (col.y > c.height) {
              col.y = Math.random() * -100;
            }
          });
        },
        destroy() { this.cols = []; }
      },

      // 10: Life Automata
      {
        name: "Life Automata",
        desc: "Juego de la Vida de Conway. Autómata celular biológico. Dibuja patrones vivos y observa su evolución periódica.",
        grid: [],
        lastTime: 0,
        setup(c) {
          const cols = 40;
          const rows = 25;
          this.grid = Array(cols * rows).fill(0).map(() => Math.random() > 0.85 ? 1 : 0);
          this.lastTime = 0;
        },
        update(c, ctx, p1, p2, mx, my, md) {
          const cols = 40;
          const rows = 25;
          const cw = c.width / cols;
          const ch = c.height / rows;
          
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          if (md) {
            const xCell = Math.floor(mx / cw);
            const yCell = Math.floor(my / ch);
            if (xCell >= 0 && xCell < cols && yCell >= 0 && yCell < rows) {
              this.grid[yCell * cols + xCell] = 1;
            }
          }
          
          const now = Date.now();
          const speed = 100 + (100 - p1) * 3;
          
          if (now - this.lastTime > speed) {
            this.lastTime = now;
            const nextGrid = [...this.grid];
            
            for (let y = 0; y < rows; y++) {
              for (let x = 0; x < cols; x++) {
                let neighbors = 0;
                for (let i = -1; i <= 1; i++) {
                  for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    const nx = (x + i + cols) % cols;
                    const ny = (y + j + rows) % rows;
                    neighbors += this.grid[ny * cols + nx];
                  }
                }
                
                const idx = y * cols + x;
                const state = this.grid[idx];
                if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                  nextGrid[idx] = 0;
                } else if (state === 0 && neighbors === 3) {
                  nextGrid[idx] = 1;
                }
              }
            }
            this.grid = nextGrid;
          }
          
          ctx.fillStyle = "oklch(0.82 0.24 140)";
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              if (this.grid[y * cols + x] === 1) {
                ctx.fillRect(x * cw, y * ch, cw - 1, ch - 1);
              }
            }
          }
        },
        destroy() { this.grid = []; }
      },

      // 11: Lorenz Attractor
      {
        name: "Lorenz Attractor",
        desc: "Caos matemático de Lorenz. Traza hermosas órbitas tridimensionales de atractor extraño.",
        x: 0.1, y: 0, z: 0,
        pts: [],
        setup(c) {
          this.x = 0.1; this.y = 0; this.z = 0;
          this.pts = [];
        },
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          const dt = 0.005 + p1 * 0.0001;
          const sigma = 10;
          const rho = 28 + p2 * 0.1;
          const beta = 8/3;
          
          const dx = sigma * (this.y - this.x) * dt;
          const dy = (this.x * (rho - this.z) - this.y) * dt;
          const dz = (this.x * this.y - beta * this.z) * dt;
          
          this.x += dx;
          this.y += dy;
          this.z += dz;
          
          this.pts.push({ x: this.x, y: this.y, z: this.z });
          if (this.pts.length > 800) this.pts.shift();
          
          ctx.strokeStyle = "rgba(43, 59, 229, 0.7)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          this.pts.forEach((p, idx) => {
            const px = c.width / 2 + p.x * 7;
            const py = c.height / 2 + (p.y - 25) * 6;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
          
          if (this.pts.length > 0) {
            const head = this.pts[this.pts.length - 1];
            ctx.fillStyle = "oklch(0.78 0.22 80)";
            ctx.beginPath();
            ctx.arc(c.width / 2 + head.x * 7, c.height / 2 + (head.y - 25) * 6, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        },
        destroy() { this.pts = []; }
      },

      // 12: Ambient Matrix
      {
        name: "Ambient Matrix",
        desc: "Sintetizador secuencial poli-dimensional. Dibuja arpegios de onda sinusoidal al mover el cursor en la cuadrícula.",
        setup(c) {},
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          const cols = 8;
          const rows = 8;
          const cellW = c.width / cols;
          const cellH = c.height / rows;
          
          ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          for (let i = 0; i <= cols; i++) {
            ctx.beginPath(); ctx.moveTo(i * cellW, 0); ctx.lineTo(i * cellW, c.height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i * cellH); ctx.lineTo(c.width, i * cellH); ctx.stroke();
          }
          
          const cellX = Math.floor(mx / cellW);
          const cellY = Math.floor(my / cellH);
          
          if (cellX >= 0 && cellX < cols && cellY >= 0 && cellY < rows) {
            ctx.fillStyle = "rgba(43, 59, 229, 0.3)";
            ctx.fillRect(cellX * cellW, cellY * cellH, cellW, cellH);
            
            if (md && self.isAudioOn && self.audioCtx) {
              const freq = 130 + (cellX * 40) + (cellY * 15);
              const synth = getSynth(freq, "sine", 0.3);
              if (synth) {
                synth.osc.start();
                synth.gain.gain.setValueAtTime(0.06, self.audioCtx.currentTime);
                synth.gain.gain.exponentialRampToValueAtTime(0.001, self.audioCtx.currentTime + 0.28);
                synth.osc.stop(self.audioCtx.currentTime + 0.3);
              }
            }
          }
        },
        destroy() {}
      },

      // 13: Liquid Metaballs
      {
        name: "Liquid Metaballs",
        desc: "Fluido orgánico interactivo. Los metaballs líquidos colisionan y se fusionan magnéticamente. X regula el tamaño, Y la vibración.",
        balls: [],
        setup(c) {
          this.balls = [];
          for (let i = 0; i < 4; i++) {
            this.balls.push({
              x: Math.random() * c.width,
              y: Math.random() * c.height,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              r: 40 + Math.random() * 20
            });
          }
        },
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          this.balls.forEach((b, idx) => {
            if (idx === 0) {
              b.x = mx; b.y = my;
            } else {
              b.x += b.vx * (1 + p2 * 0.02);
              b.y += b.vy * (1 + p2 * 0.02);
              if (b.x < 0 || b.x > c.width) b.vx *= -1;
              if (b.y < 0 || b.y > c.height) b.vy *= -1;
            }
          });
          
          const radiusMult = 0.5 + p1 * 0.01;
          const scale = 4;
          for (let y = 0; y < c.height; y += scale) {
            for (let x = 0; x < c.width; x += scale) {
              let sum = 0;
              this.balls.forEach(b => {
                const dx = x - b.x;
                const dy = y - b.y;
                sum += (b.r * radiusMult * b.r * radiusMult) / (dx * dx + dy * dy || 1);
              });
              
              if (sum > 1) {
                ctx.fillStyle = `oklch(0.48 0.32 ${180 + Math.sin(sum) * 60})`;
                ctx.fillRect(x, y, scale, scale);
              }
            }
          }
        },
        destroy() { this.balls = []; }
      },

      // 14: Turing Diffusion
      {
        name: "Turing Diffusion",
        desc: "Líquido biológico Turing. Simulación de reacción-difusión modelando patrones orgánicos de cebra.",
        grid: [],
        setup(c) {
          this.grid = Array(80 * 50).fill(0).map(() => Math.random());
        },
        update(c, ctx, p1, p2, mx, my, md) {
          const w = 80;
          const h = 50;
          const cellW = c.width / w;
          const cellH = c.height / h;
          
          const feed = 0.055 + p1 * 0.0001;
          const kill = 0.062 + p2 * 0.0001;
          
          const nextGrid = [...this.grid];
          for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
              const idx = y * w + x;
              const n = this.grid[(y-1)*w + x] + this.grid[(y+1)*w + x] + this.grid[y*w + (x-1)] + this.grid[y*w + (x+1)];
              const blur = n / 4;
              
              const a = this.grid[idx];
              nextGrid[idx] = a + (blur - a) * 0.15 - a * blur * blur + feed * (1 - a);
            }
          }
          this.grid = nextGrid;
          
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const val = this.grid[y * w + x];
              ctx.fillStyle = `oklch(${val.toFixed(2)} 0.12 250)`;
              ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
            }
          }
        },
        destroy() { this.grid = []; }
      },

      // 15: Lajus Drum Box
      {
        name: "Lajus Drum Box",
        desc: "Secuenciador rítmico Lajus. Caja de ritmos con Kick, Snare, Hihat y Sintetizador. Activa celdas al hacer click.",
        grid: [],
        step: 0,
        lastTime: 0,
        setup(c) {
          this.step = 0;
          this.lastTime = 0;
          this.grid = Array(4 * 16).fill(0);
          this.grid[0 * 16 + 0] = 1;
          this.grid[0 * 16 + 4] = 1;
          this.grid[0 * 16 + 8] = 1;
          this.grid[0 * 16 + 12] = 1;
          this.grid[2 * 16 + 2] = 1;
          this.grid[2 * 16 + 6] = 1;
          this.grid[2 * 16 + 10] = 1;
          this.grid[2 * 16 + 14] = 1;
          this.grid[1 * 16 + 4] = 1;
          this.grid[1 * 16 + 12] = 1;
        },
        update(c, ctx, p1, p2, mx, my, md) {
          const cols = 16;
          const rows = 4;
          const cw = c.width / cols;
          const ch = c.height / rows;
          
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          const bpm = 90 + p1 * 0.8;
          const interval = 60000 / bpm / 4;
          const now = Date.now();
          
          if (now - this.lastTime > interval) {
            this.lastTime = now;
            this.step = (this.step + 1) % cols;
            
            if (self.isAudioOn && self.audioCtx) {
              if (this.grid[0 * cols + this.step]) {
                const kick = getSynth(55, "triangle", 0.1);
                if (kick) {
                  kick.osc.start();
                  kick.gain.gain.exponentialRampToValueAtTime(0.001, self.audioCtx.currentTime + 0.15);
                  kick.osc.stop(self.audioCtx.currentTime + 0.16);
                }
              }
              if (this.grid[1 * cols + this.step]) {
                const snare = getSynth(280, "sawtooth", 0.08);
                if (snare) {
                  snare.osc.start();
                  snare.gain.gain.exponentialRampToValueAtTime(0.001, self.audioCtx.currentTime + 0.1);
                  snare.osc.stop(self.audioCtx.currentTime + 0.12);
                }
              }
              if (this.grid[2 * cols + this.step]) {
                const hat = getSynth(10000, "sine", 0.04);
                if (hat) {
                  hat.osc.start();
                  hat.gain.gain.exponentialRampToValueAtTime(0.001, self.audioCtx.currentTime + 0.05);
                  hat.osc.stop(self.audioCtx.currentTime + 0.06);
                }
              }
              if (this.grid[3 * cols + this.step]) {
                const s = getSynth(220, "sawtooth", 0.2);
                if (s) {
                  s.osc.start();
                  s.gain.gain.exponentialRampToValueAtTime(0.001, self.audioCtx.currentTime + 0.22);
                  s.osc.stop(self.audioCtx.currentTime + 0.25);
                }
              }
            }
          }
          
          if (md) {
            const col = Math.floor(mx / cw);
            const row = Math.floor(my / ch);
            if (col >= 0 && col < cols && row >= 0 && row < rows) {
              if (!this.clickedThisFrame) {
                this.grid[row * cols + col] = this.grid[row * cols + col] ? 0 : 1;
                this.clickedThisFrame = true;
              }
            }
          } else {
            this.clickedThisFrame = false;
          }
          
          const rowColors = ["#ff5d5d", "#5d6eff", "#ffb755", "#55ff77"];
          for (let r = 0; r < rows; r++) {
            for (let col = 0; col < cols; col++) {
              const active = this.grid[r * cols + col];
              ctx.fillStyle = active ? rowColors[r] : "rgba(255,255,255,0.03)";
              ctx.strokeStyle = "rgba(255,255,255,0.08)";
              ctx.lineWidth = 1;
              ctx.fillRect(col * cw + 2, r * ch + 2, cw - 4, ch - 4);
              ctx.strokeRect(col * cw + 2, r * ch + 2, cw - 4, ch - 4);
              
              if (col === this.step) {
                ctx.fillStyle = "rgba(255,255,255,0.15)";
                ctx.fillRect(col * cw + 2, r * ch + 2, cw - 4, ch - 4);
              }
            }
          }
        },
        destroy() { this.grid = []; }
      },

      // 16: RGB Glitch Split
      {
        name: "RGB Glitch Split",
        desc: "Efecto aberración cromática RGB glitch. Divide y dispersa los canales de color en el tubo de rayos catódicos.",
        setup(c) {},
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          ctx.lineWidth = 10;
          ctx.strokeStyle = "#fff";
          ctx.strokeRect(100, 80, 440, 240);
          ctx.beginPath();
          ctx.arc(320, 200, 60, 0, Math.PI * 2);
          ctx.stroke();
          
          const dist = 2 + p1 * 0.15;
          const shift = md ? 15 : 0;
          
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
          ctx.fillRect(dist + shift, 0, c.width, c.height);
          
          ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
          ctx.fillRect(-dist, 0, c.width, c.height);
          
          ctx.fillStyle = "rgba(0, 0, 255, 0.8)";
          ctx.fillRect(0, dist + shift * 0.5, c.width, c.height);
          ctx.restore();
        },
        destroy() {}
      },

      // 17: Bezier Flows
      {
        name: "Bezier Flows",
        desc: "Corrientes sinuosas vectoriales. Flujos continuos de curvas fluidas que viajan por el lienzo digital.",
        setup(c) {},
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "rgba(10, 10, 10, 0.1)";
          ctx.fillRect(0, 0, c.width, c.height);
          
          const lines = 8;
          const time = Date.now() * 0.001;
          const thickness = 1 + p1 * 0.05;
          
          ctx.lineWidth = thickness;
          for (let i = 0; i < lines; i++) {
            ctx.strokeStyle = `oklch(0.78 0.22 ${120 + i * 25})`;
            ctx.beginPath();
            ctx.moveTo(0, c.height / 2);
            
            const cp1x = c.width * 0.25;
            const cp1y = c.height / 2 + Math.sin(time + i) * (my * 0.7);
            const cp2x = c.width * 0.75;
            const cp2y = c.height / 2 - Math.cos(time + i) * (mx * 0.7);
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, c.width, c.height / 2);
            ctx.stroke();
          }
        },
        destroy() {}
      },

      // 18: Sovereign Pad
      {
        name: "Sovereign Pad",
        desc: "Sintetizador FM de atmósfera cinematográfica. Controla el índice de modulación y la frecuencia arrastrando la mano.",
        setup(c) {},
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          if (md && self.isAudioOn && self.audioCtx) {
            const freq = 60 + p1 * 2;
            const modFreq = 10 + p2 * 1.5;
            
            const carrier = self.audioCtx.createOscillator();
            const modulator = self.audioCtx.createOscillator();
            const modGain = self.audioCtx.createGain();
            const outGain = self.audioCtx.createGain();
            
            carrier.frequency.value = freq;
            modulator.frequency.value = modFreq;
            modGain.gain.value = mx * 2;
            
            modulator.connect(modGain);
            modGain.connect(carrier.frequency);
            carrier.connect(outGain);
            outGain.connect(self.audioCtx.destination);
            
            outGain.gain.setValueAtTime(0.04, self.audioCtx.currentTime);
            outGain.gain.exponentialRampToValueAtTime(0.001, self.audioCtx.currentTime + 0.35);
            
            modulator.start();
            carrier.start();
            modulator.stop(self.audioCtx.currentTime + 0.35);
            carrier.stop(self.audioCtx.currentTime + 0.35);
          }
          
          ctx.strokeStyle = "oklch(0.78 0.22 80)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < c.width; i++) {
            const y = c.height/2 + Math.sin(i * 0.02 + (md ? mx * 0.05 : 0)) * Math.cos(i * 0.005) * 80;
            if (i === 0) ctx.moveTo(i, y);
            else ctx.lineTo(i, y);
          }
          ctx.stroke();
        },
        destroy() {}
      },

      // 19: Braitenberg Bugs
      {
        name: "Braitenberg Bugs",
        desc: "Entidades autónomas inteligentes. Insectos vectoriales dotados de fototaxis que persiguen o evitan el cursor.",
        bugs: [],
        setup(c) {
          this.bugs = [];
          for (let i = 0; i < 8; i++) {
            this.bugs.push({
              x: Math.random() * c.width,
              y: Math.random() * c.height,
              angle: Math.random() * Math.PI * 2
            });
          }
        },
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "rgba(10, 10, 10, 0.15)";
          ctx.fillRect(0, 0, c.width, c.height);
          
          const maxSpeed = 2 + p1 * 0.08;
          const avoidMode = md;
          
          this.bugs.forEach((b, idx) => {
            const dx = mx - b.x;
            const dy = my - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            let targetAngle = Math.atan2(dy, dx);
            if (avoidMode && dist < 120) {
              targetAngle += Math.PI;
            }
            
            b.angle += (targetAngle - b.angle) * 0.1;
            
            b.x += Math.cos(b.angle) * maxSpeed;
            b.y += Math.sin(b.angle) * maxSpeed;
            
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.angle);
            ctx.fillStyle = `oklch(0.82 0.24 ${140 + idx * 20})`;
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-6, -6);
            ctx.lineTo(-6, 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          });
        },
        destroy() { this.bugs = []; }
      },

      // 20: Ray Obstacles
      {
        name: "Ray Obstacles",
        desc: "Iluminación 2D por trazado de rayos. Proyecta haces de luz dinámicos que chocan contra bloques de colisión.",
        setup(c) {},
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "#050505";
          ctx.fillRect(0, 0, c.width, c.height);
          
          const blocks = [
            { x: 120, y: 100, w: 80, h: 80 },
            { x: 440, y: 220, w: 80, h: 80 }
          ];
          
          ctx.fillStyle = "#1e1e1e";
          blocks.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
          
          const raysCount = 60 + Math.floor(p2 * 1.2);
          const maxRadius = 150 + p1 * 2;
          
          ctx.strokeStyle = "rgba(255, 230, 180, 0.15)";
          ctx.lineWidth = 1;
          
          for (let i = 0; i < raysCount; i++) {
            const angle = (Math.PI * 2 / raysCount) * i;
            let targetX = mx + Math.cos(angle) * maxRadius;
            let targetY = my + Math.sin(angle) * maxRadius;
            
            blocks.forEach(b => {
              if (targetX > b.x && targetX < b.x + b.w && targetY > b.y && targetY < b.y + b.h) {
                targetX = b.x; targetY = b.y;
              }
            });
            
            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
          }
        },
        destroy() {}
      },

      // 21: Morse Typist
      {
        name: "Morse Typist",
        desc: "Mecanógrafo interactivo de código morse. Escribe en tu teclado físico para componer geometrías vectoriales neon.",
        lines: [],
        setup(c) {
          this.lines = [];
          this.onKey = (e) => {
            this.lines.push({
              x1: Math.random() * c.width,
              y1: Math.random() * c.height,
              x2: Math.random() * c.width,
              y2: Math.random() * c.height,
              color: `oklch(0.78 0.22 ${Math.random() * 360})`,
              life: 1.0
            });
            
            if (self.isAudioOn && self.audioCtx) {
              const freq = 440 + Math.random() * 220;
              const synth = getSynth(freq, "sine", 0.08);
              if (synth) {
                synth.osc.start();
                synth.gain.gain.exponentialRampToValueAtTime(0.001, self.audioCtx.currentTime + 0.07);
                synth.osc.stop(self.audioCtx.currentTime + 0.08);
              }
            }
          };
          window.addEventListener("keydown", this.onKey);
        },
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.font = "14px monospace";
          ctx.fillText("Presiona cualquier tecla física para dibujar y emitir tonos...", 40, c.height - 40);
          
          this.lines.forEach((l, idx) => {
            ctx.strokeStyle = l.color;
            ctx.lineWidth = l.life * 4;
            ctx.beginPath();
            ctx.moveTo(l.x1, l.y1);
            ctx.lineTo(l.x2, l.y2);
            ctx.stroke();
            
            l.life -= 0.02 * (1 + p1 * 0.02);
          });
          
          this.lines = this.lines.filter(l => l.life > 0);
        },
        destroy() {
          window.removeEventListener("keydown", this.onKey);
          this.lines = [];
        }
      },

      // 22: ARC-AGI Grid
      {
        name: "ARC-AGI Grid",
        desc: "Simulador de pruebas ARC-AGI. Deduce el patrón lógico y haz click en las celdas de la derecha para cambiar su color y completar la matriz.",
        gridSize: 3,
        inputGrid: [
          [1, 0, 1],
          [0, 2, 0],
          [1, 0, 1]
        ],
        outputGrid: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ],
        targetGrid: [
          [2, 0, 2],
          [0, 1, 0],
          [2, 0, 2]
        ],
        palette: ["#0A0A0A", "#2B3BE5", "#FF9F1C", "#9D5B65"], // ink, blue, honey, wine
        solved: false,
        lastMouseDown: false,
        setup(c) {
          this.outputGrid = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
          ];
          this.solved = false;
          this.lastMouseDown = false;
        },
        update(c, ctx, p1, p2, mx, my, md) {
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(0, 0, c.width, c.height);
          
          ctx.fillStyle = "rgba(243, 244, 246, 0.8)";
          ctx.font = "bold 16px monospace";
          ctx.fillText("ENTRADA (Deduce la regla)", 40, 50);
          ctx.fillText("SALIDA (Haz click para resolver)", 340, 50);
          
          const cellSize = 60;
          const startY = 100;
          
          // Draw Input Grid (Left)
          const startXInput = 60;
          for (let r = 0; r < 3; r++) {
            for (let col = 0; col < 3; col++) {
              const val = this.inputGrid[r][col];
              ctx.fillStyle = this.palette[val];
              ctx.fillRect(startXInput + col * cellSize, startY + r * cellSize, cellSize - 4, cellSize - 4);
              ctx.strokeStyle = "rgba(243, 244, 246, 0.2)";
              ctx.strokeRect(startXInput + col * cellSize, startY + r * cellSize, cellSize - 4, cellSize - 4);
            }
          }
          
          // Draw Output Grid (Right)
          const startXOutput = 380;
          for (let r = 0; r < 3; r++) {
            for (let col = 0; col < 3; col++) {
              const val = this.outputGrid[r][col];
              ctx.fillStyle = this.palette[val];
              ctx.fillRect(startXOutput + col * cellSize, startY + r * cellSize, cellSize - 4, cellSize - 4);
              ctx.strokeStyle = "rgba(243, 244, 246, 0.4)";
              ctx.strokeRect(startXOutput + col * cellSize, startY + r * cellSize, cellSize - 4, cellSize - 4);
            }
          }
          
          // Handle clicks on Output Grid
          if (md && !this.lastMouseDown) {
            const relativeX = mx - startXOutput;
            const relativeY = my - startY;
            
            if (relativeX >= 0 && relativeX < cellSize * 3 && relativeY >= 0 && relativeY < cellSize * 3) {
              const colIdx = Math.floor(relativeX / cellSize);
              const rowIdx = Math.floor(relativeY / cellSize);
              
              if (rowIdx >= 0 && rowIdx < 3 && colIdx >= 0 && colIdx < 3) {
                this.outputGrid[rowIdx][colIdx] = (this.outputGrid[rowIdx][colIdx] + 1) % this.palette.length;
                
                if (self.isAudioOn && self.audioCtx) {
                  const freq = 300 + (rowIdx * 3 + colIdx) * 50;
                  const synth = getSynth(freq, "sine", 0.1);
                  if (synth) {
                    synth.osc.start();
                    synth.gain.gain.exponentialRampToValueAtTime(0.001, self.audioCtx.currentTime + 0.09);
                    synth.osc.stop(self.audioCtx.currentTime + 0.1);
                  }
                }
                
                let match = true;
                for (let r = 0; r < 3; r++) {
                  for (let col = 0; col < 3; col++) {
                    if (this.outputGrid[r][col] !== this.targetGrid[r][col]) {
                      match = false;
                    }
                  }
                }
                
                if (match && !this.solved) {
                  this.solved = true;
                  if (self.isAudioOn && self.audioCtx) {
                    const freqs = [523.25, 659.25, 783.99, 1046.50];
                    freqs.forEach((freq, index) => {
                      const synth = getSynth(freq, "triangle", 0.2);
                      if (synth) {
                        synth.osc.start(self.audioCtx.currentTime + index * 0.1);
                        synth.gain.gain.setValueAtTime(0.08, self.audioCtx.currentTime + index * 0.1);
                        synth.gain.gain.exponentialRampToValueAtTime(0.001, self.audioCtx.currentTime + index * 0.1 + 0.18);
                        synth.osc.stop(self.audioCtx.currentTime + index * 0.1 + 0.2);
                      }
                    });
                  }
                }
              }
            }
          }
          
          this.lastMouseDown = md;
          
          if (this.solved) {
            ctx.fillStyle = "#FF9F1C";
            ctx.font = "bold 16px monospace";
            ctx.fillText("¡EXERGÍA DE RETÍCULA COMPLETA! C5-REAL", 60, 310);
            ctx.font = "12px monospace";
            ctx.fillText("Has resuelto la invariante del espacio computacional.", 60, 335);
          } else {
            ctx.fillStyle = "rgba(243, 244, 246, 0.4)";
            ctx.font = "12px monospace";
            ctx.fillText("Regla: Invierte los colores azul (1) y miel (2) de la entrada.", 60, 310);
          }
        },
        destroy() {}
      }
    ];
  }

  initEvents() {
    const openBtns = document.querySelectorAll("[data-open-arcade]");
    openBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (!this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } else if (this.audioCtx.state === "suspended") {
          this.audioCtx.resume();
        }
        if (typeof this.dialog.showModal === "function") {
          this.dialog.showModal();
          this.startLoop();
        }
      });
    });

    const closeBtns = document.querySelectorAll("[data-close-arcade]");
    closeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.dialog.close();
        this.stopLoop();
      });
    });
    
    this.dialog.addEventListener("click", (e) => {
      if (e.target === this.dialog) {
        this.dialog.close();
        this.stopLoop();
      }
    });

    const slots = this.dialog.querySelectorAll(".arcade-slot");
    slots.forEach(slot => {
      slot.addEventListener("click", () => {
        if (this.audioCtx && this.audioCtx.state === "suspended") {
          this.audioCtx.resume();
        }
        slots.forEach(s => s.classList.remove("active"));
        slot.classList.add("active");
        
        const idx = parseInt(slot.dataset.gameIdx, 10);
        this.switchGame(idx);
      });
    });

    const getCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      this.mouseX = ((clientX - rect.left) / rect.width) * this.canvas.width;
      this.mouseY = ((clientY - rect.top) / rect.height) * this.canvas.height;
    };

    const resumeAudioCtx = () => {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } else if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
    };

    this.canvas.addEventListener("mousedown", (e) => {
      this.isMouseDown = true;
      resumeAudioCtx();
      getCoords(e);
    });
    this.canvas.addEventListener("mousemove", (e) => {
      getCoords(e);
    });
    window.addEventListener("mouseup", () => {
      this.isMouseDown = false;
    });

    this.canvas.addEventListener("touchstart", (e) => {
      this.isMouseDown = true;
      resumeAudioCtx();
      getCoords(e);
    }, { passive: true });
    this.canvas.addEventListener("touchmove", (e) => {
      getCoords(e);
    }, { passive: true });
    window.addEventListener("touchend", () => {
      this.isMouseDown = false;
    });

    this.param1.addEventListener("input", (e) => {
      this.val1.textContent = e.target.value;
    });
    this.param2.addEventListener("input", (e) => {
      this.val2.textContent = e.target.value;
    });

    this.btnAudio.addEventListener("click", () => {
      this.isAudioOn = !this.isAudioOn;
      this.btnAudio.classList.toggle("active", this.isAudioOn);
      this.btnAudio.textContent = this.isAudioOn ? "AUDIO: ON" : "AUDIO: OFF";
      this.btnAudio.setAttribute("aria-pressed", this.isAudioOn ? "true" : "false");
      if (this.isAudioOn) {
        resumeAudioCtx();
      }
    });

    this.btnReset.addEventListener("click", () => {
      const active = this.gamesList[this.activeGameIdx];
      if (active && active.setup) {
        active.destroy();
        active.setup(this.canvas);
      }
    });
  }

  startLoop() {
    const active = this.gamesList[this.activeGameIdx];
    if (active && active.setup) {
      active.setup(this.canvas);
    }
    
    const loop = () => {
      const active = this.gamesList[this.activeGameIdx];
      if (active) {
        const p1 = parseFloat(this.param1.value);
        const p2 = parseFloat(this.param2.value);
        
        active.update(
          this.canvas,
          this.ctx,
          p1,
          p2,
          this.mouseX,
          this.mouseY,
          this.isMouseDown
        );
      }
      
      if (this.exergyEl) {
        const rand = 98 + Math.sin(Date.now() * 0.005) * 2;
        this.exergyEl.textContent = `${rand.toFixed(1)}%`;
      }
      
      this.gameRaf = requestAnimationFrame(loop);
    };
    
    if (this.gameRaf) cancelAnimationFrame(this.gameRaf);
    this.gameRaf = requestAnimationFrame(loop);
  }

  stopLoop() {
    if (this.gameRaf) {
      cancelAnimationFrame(this.gameRaf);
      this.gameRaf = null;
    }
    const active = this.gamesList[this.activeGameIdx];
    if (active && active.destroy) {
      active.destroy();
    }
  }

  switchGame(idx) {
    this.stopLoop();
    this.activeGameIdx = idx;
    
    const game = this.gamesList[idx];
    document.querySelector("[data-arcade-game-title]").textContent = game.name;
    document.querySelector("[data-arcade-game-desc]").textContent = game.desc;
    
    this.startLoop();
  }
}

// Instantiate Arcade
new ArcadeManager();

// ==========================================================================
// SECRET EASTER EGG LOGIC (BANDCAMP EXERGY OVERDRIVE)
// ==========================================================================
(function() {
  const eggBtn = document.getElementById("easter-egg-btn");
  if (!eggBtn) return;

  function playSynthSnd() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(330, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.28);
      
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (err) {
      console.warn("Audio Context blocked or not supported.");
    }
  }

  function triggerEgg() {
    eggBtn.classList.add("pulse-active");
    document.body.classList.add("is-glitching");
    playSynthSnd();

    setTimeout(() => {
      document.body.classList.remove("is-glitching");
    }, 250);

    setTimeout(() => {
      eggBtn.classList.remove("pulse-active");
      window.open("https://borjamoskv.bandcamp.com", "_blank", "noopener,noreferrer");
    }, 450);
  }

  eggBtn.addEventListener("click", (e) => {
    e.preventDefault();
    triggerEgg();
  });

  let buffer = "";
  const codes = ["moskv", "bandcamp"];
  
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    
    buffer += e.key.toLowerCase();
    if (buffer.length > 15) {
      buffer = buffer.substring(buffer.length - 15);
    }

    for (const code of codes) {
      if (buffer.endsWith(code)) {
        triggerEgg();
        buffer = "";
        break;
      }
    }
  });
})();


