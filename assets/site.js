const header = document.querySelector("[data-header]");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const backgroundVideo = document.querySelector("[data-bg-video]");
const backdropStill = document.querySelector(".backdrop__still");
const mainVideo = document.querySelector("[data-main-video]");
const toggleBackground = document.querySelector("[data-toggle-bg]");
const focusVideo = document.querySelector("[data-focus-video]");
const openImmersiveButtons = Array.from(document.querySelectorAll("[data-open-immersive]"));
const frames = Array.from(document.querySelectorAll("[data-frame]"));
const cues = Array.from(document.querySelectorAll("[data-cue-time]"));
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const closeLightbox = document.querySelector("[data-close]");
const immersive = document.querySelector("[data-immersive]");
const immersiveVideo = document.querySelector("[data-immersive-video]");
const closeImmersive = document.querySelector("[data-close-immersive]");
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
  if (!mainVideo || !Number.isFinite(time)) {
    return;
  }

  const maxTime = Number.isFinite(mainVideo.duration)
    ? Math.max(mainVideo.duration - 0.25, 0)
    : time;

  try {
    mainVideo.currentTime = Math.min(time, maxTime);
  } catch {
    mainVideo.addEventListener("loadedmetadata", () => seekMainVideo(time), { once: true });
  }
};

const jumpMainVideo = async (time) => {
  if (!mainVideo || !Number.isFinite(time)) {
    return;
  }

  if (mainVideo.readyState >= 1) {
    seekMainVideo(time);
  } else {
    mainVideo.addEventListener("loadedmetadata", () => seekMainVideo(time), { once: true });
    mainVideo.load();
  }

  mainVideo.scrollIntoView({ behavior: "smooth", block: "center" });

  try {
    await mainVideo.play();
    window.setTimeout(() => seekMainVideo(time), 80);
  } catch {
    seekMainVideo(time);
    mainVideo.focus();
  }
};

const seekImmersiveVideo = (time) => {
  if (!immersiveVideo || !Number.isFinite(time)) {
    return;
  }

  const maxTime = Number.isFinite(immersiveVideo.duration)
    ? Math.max(immersiveVideo.duration - 0.25, 0)
    : time;

  try {
    immersiveVideo.currentTime = Math.min(time, maxTime);
  } catch {
    immersiveVideo.addEventListener("loadedmetadata", () => seekImmersiveVideo(time), {
      once: true,
    });
  }
};

const getVideoTime = () => {
  if (mainVideo && mainVideo.currentTime > 0.2) {
    return mainVideo.currentTime;
  }

  return backgroundVideo?.currentTime ?? 0;
};

const openImmersive = async () => {
  if (!immersive || !immersiveVideo) {
    return;
  }

  const time = getVideoTime();

  if (typeof immersive.showModal === "function" && !immersive.open) {
    immersive.showModal();
  } else {
    immersive.setAttribute("open", "");
  }

  document.body.classList.add("is-immersive");

  if (immersiveVideo.readyState >= 1) {
    seekImmersiveVideo(time);
  } else {
    immersiveVideo.addEventListener("loadedmetadata", () => seekImmersiveVideo(time), {
      once: true,
    });
    immersiveVideo.load();
  }

  try {
    await immersiveVideo.play();
    window.setTimeout(() => seekImmersiveVideo(time), 80);
  } catch {
    seekImmersiveVideo(time);
    closeImmersive?.focus();
  }
};

const syncMainVideoFromImmersive = () => {
  if (!mainVideo || !immersiveVideo || !Number.isFinite(immersiveVideo.currentTime)) {
    return;
  }

  if (mainVideo.readyState >= 1) {
    seekMainVideo(immersiveVideo.currentTime);
  } else {
    mainVideo.addEventListener("loadedmetadata", () => seekMainVideo(immersiveVideo.currentTime), {
      once: true,
    });
  }
};

const closeImmersiveMode = () => {
  if (!immersive || !immersiveVideo) {
    return;
  }

  syncMainVideoFromImmersive();
  immersiveVideo.pause();
  document.body.classList.remove("is-immersive");

  if (immersive.open) {
    immersive.close();
  } else {
    immersive.removeAttribute("open");
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
  await jumpMainVideo(mainVideo?.currentTime ?? 0);
});

openImmersiveButtons.forEach((button) => {
  button.addEventListener("click", openImmersive);
});

closeImmersive?.addEventListener("click", closeImmersiveMode);

immersive?.addEventListener("cancel", () => {
  syncMainVideoFromImmersive();
  immersiveVideo?.pause();
  document.body.classList.remove("is-immersive");
});

immersive?.addEventListener("close", () => {
  document.body.classList.remove("is-immersive");
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
