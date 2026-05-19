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
const playlistItems = Array.from(document.querySelectorAll(".playlist-item"));
const immersiveTitle = document.getElementById("immersive-title");

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
    if (immersiveTitle) {
      immersiveTitle.textContent = activeVideoTitle;
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
      
      setTimeout(() => {
        button.style.opacity = "";
        button.style.transform = "";
      }, 80 + idx * 40);
    }
  });
};

// Switch playlist video
const switchVideo = (videoId, title, localSrc = null, framesAttr = null) => {
  activeVideoId = videoId;
  activeVideoTitle = title;

  if (currentTitleEl) {
    currentTitleEl.textContent = title;
  }

  if (videoId === "LOCAL") {
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
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0"
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
    playlistItems.forEach((p) => p.classList.toggle("is-active", p === item));
    const videoId = item.dataset.videoId;
    const title = item.dataset.title;
    const localSrc = item.dataset.videoSrc || null;
    const frames = item.dataset.frames || null;
    switchVideo(videoId, title, localSrc, frames);
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

  ["inicio", "musica", "video", "fotogramas"].forEach((id) => {
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
