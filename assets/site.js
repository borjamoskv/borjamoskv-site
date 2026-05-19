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
const defaultBackdropImage = 'url("media/no-sleep-in-my-city-poster.jpg")';

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
    syncMainVideoFromImmersive();
    immVid?.pause();
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

// Switch playlist video
const switchVideo = (videoId, title, localSrc = null) => {
  activeVideoId = videoId;
  activeVideoTitle = title;

  if (currentTitleEl) {
    currentTitleEl.textContent = title;
  }

  if (videoId === "LOCAL") {
    activeVideoSrc = localSrc || "media/no-sleep-in-my-city.mp4";
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
  } else {
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
    switchVideo(videoId, title, localSrc);
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
  frame.addEventListener("pointerleave", clearFramePreview);
  frame.addEventListener("focus", () => showFramePreview(frame.dataset.frame));
  frame.addEventListener("blur", clearFramePreview);

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

window.addEventListener(
  "pointermove",
  (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    document.documentElement.style.setProperty("--mx", x.toFixed(3));
    document.documentElement.style.setProperty("--my", y.toFixed(3));
  },
  { passive: true },
);

window.addEventListener(
  "scroll",
  () => {
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    const sy = window.scrollY / scrollMax;
    document.documentElement.style.setProperty("--sy", sy.toFixed(3));
  },
  { passive: true },
);
