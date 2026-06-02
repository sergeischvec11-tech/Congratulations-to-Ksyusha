const screens = [...document.querySelectorAll(".screen")];
const navButtons = [...document.querySelectorAll("[data-target]")];
const songScreen = document.querySelector(".song");
const songAudio = document.querySelector("#song-audio");
const appShell = document.querySelector(".site-shell");
const audioButtons = [...document.querySelectorAll("[data-audio-toggle]")];
const photoButtons = [...document.querySelectorAll("[data-photo]")];
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
const cakeButton = document.querySelector("[data-cake-toggle]");
const cakeDigits = [...document.querySelectorAll("[data-cake-digit]")];
const letterTrack = document.querySelector("[data-letter-track]");
const letterViewport = document.querySelector(".letter-viewport");
const letterSlides = [...document.querySelectorAll("[data-letter-slide]")];
const letterDots = [...document.querySelectorAll("[data-letter-dot]")];
const letterPrev = document.querySelector("[data-letter-prev]");
const letterNext = document.querySelector("[data-letter-next]");
const giftScreen = document.querySelector(".present");
const openGiftButton = document.querySelector("[data-open-gift]");
let activeLetterIndex = 0;

function setSongPlaying(isPlaying) {
  songScreen?.classList.toggle("is-playing", isPlaying);
  appShell.classList.toggle("is-song-playing", isPlaying);
  document.body.classList.toggle("is-song-playing", isPlaying);
  audioButtons.forEach((button) => {
    button.setAttribute("aria-label", isPlaying ? "Остановить музыку" : "Включить музыку");
    button.setAttribute("aria-pressed", String(isPlaying));
  });
}

function pauseSong() {
  setSongPlaying(false);
  songAudio?.pause();
}

async function toggleSong() {
  if (!songAudio) {
    return;
  }

  if (songAudio.paused) {
    try {
      await songAudio.play();
      setSongPlaying(true);
    } catch {
      setSongPlaying(false);
    }
  } else {
    pauseSong();
  }
}

function showScreen(name, syncHash = true) {
  const screenName = name === "present-open" ? "present" : name;

  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === screenName);
  });
  document.body.classList.toggle("is-present-screen", screenName === "present");

  if (syncHash) {
    history.replaceState(null, "", `#${name}`);
  }

  if (name === "present-open") {
    openGift();
  }
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.target === "present" || button.classList.contains("restart")) {
      resetGift();
    }

    showScreen(button.dataset.target);
  });
});

audioButtons.forEach((button) => {
  button.addEventListener("click", () => {
    toggleSong();
  });
});

if (songAudio) {
  songAudio.addEventListener("ended", () => {
    pauseSong();
    songAudio.currentTime = 0;
  });

  songAudio.addEventListener("play", () => {
    setSongPlaying(true);
  });

  songAudio.addEventListener("pause", () => {
    if (!songAudio.ended) {
      setSongPlaying(false);
    }
  });
}

function celebrateCake() {
  cakeDigits.forEach((digit, index) => {
    digit.textContent = index === 0 ? "1" : "8";
  });

  cakeButton.classList.add("is-lit");
  cakeButton.classList.remove("is-celebrating");
  void cakeButton.offsetWidth;
  cakeButton.classList.add("is-celebrating");
  cakeButton.setAttribute("aria-label", "Свечи 18 зажжены");
}

if (cakeButton) {
  cakeButton.addEventListener("click", celebrateCake);
  cakeButton.addEventListener("animationend", (event) => {
    if (event.target === cakeButton) {
      cakeButton.classList.remove("is-celebrating");
    }
  });
}

function setActiveLetter(index) {
  if (!letterTrack || letterSlides.length === 0) {
    return;
  }

  activeLetterIndex = (index + letterSlides.length) % letterSlides.length;
  letterTrack.style.transform = `translateX(-${activeLetterIndex * 100}%)`;

  letterSlides.forEach((slide, slideIndex) => {
    const isCurrent = slideIndex === activeLetterIndex;
    slide.classList.toggle("is-current", isCurrent);
    slide.setAttribute("aria-hidden", String(!isCurrent));

    if (isCurrent) {
      slide.scrollTop = 0;
    }
  });

  letterDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeLetterIndex);
    dot.setAttribute("aria-pressed", String(dotIndex === activeLetterIndex));
  });
}

function moveLetter(direction) {
  setActiveLetter(activeLetterIndex + direction);
}

letterPrev?.addEventListener("click", () => {
  moveLetter(-1);
});

letterNext?.addEventListener("click", () => {
  moveLetter(1);
});

letterDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    setActiveLetter(index);
  });
});

if (letterViewport) {
  let swipeStart = null;

  letterViewport.addEventListener("pointerdown", (event) => {
    swipeStart = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };
    letterViewport.setPointerCapture?.(event.pointerId);
  });

  letterViewport.addEventListener("pointerup", (event) => {
    if (!swipeStart || event.pointerId !== swipeStart.id) {
      return;
    }

    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      moveLetter(deltaX < 0 ? 1 : -1);
    }

    letterViewport.releasePointerCapture?.(event.pointerId);
    swipeStart = null;
  });

  letterViewport.addEventListener("pointercancel", () => {
    swipeStart = null;
  });
}

setActiveLetter(0);

function openGift() {
  if (!giftScreen || !openGiftButton) {
    return;
  }

  giftScreen.classList.add("is-gift-open");
  openGiftButton.disabled = true;
}

function resetGift() {
  if (!giftScreen || !openGiftButton) {
    return;
  }

  giftScreen.classList.remove("is-gift-open");
  openGiftButton.disabled = false;
}

openGiftButton?.addEventListener("click", openGift);

window.addEventListener("keydown", (event) => {
  if (document.querySelector(".letter.is-active")) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveLetter(-1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveLetter(1);
      return;
    }
  }

  if (event.key === "Escape") {
    if (!lightbox.hidden) {
      closeLightbox();
    } else {
      showScreen("gifts");
    }
  }
});

function openLightbox(src) {
  lightboxImage.src = src;
  lightbox.hidden = false;
  document.body.classList.add("is-lightbox-open");
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = "";
  document.body.classList.remove("is-lightbox-open");
}

photoButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openLightbox(button.dataset.photo);
  });
});

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

window.addEventListener("hashchange", () => {
  const requested = location.hash.slice(1);
  const exists = requested === "present-open" || screens.some((screen) => screen.dataset.screen === requested);
  showScreen(exists ? requested : "intro", false);
});

function clearInitialHash() {
  if (location.hash) {
    history.replaceState(null, "", `${location.pathname}${location.search}`);
  }
}

clearInitialHash();
resetGift();
showScreen("intro", false);
document.documentElement.classList.remove("app-loading");
