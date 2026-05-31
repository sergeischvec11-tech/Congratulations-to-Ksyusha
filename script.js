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
const giftScreen = document.querySelector(".present");
const openGiftButton = document.querySelector("[data-open-gift]");

function setSongPlaying(isPlaying) {
  songScreen.classList.toggle("is-playing", isPlaying);
  appShell.classList.toggle("is-song-playing", isPlaying);
  document.body.classList.toggle("is-song-playing", isPlaying);
  audioButtons.forEach((button) => {
    button.setAttribute("aria-label", isPlaying ? "Остановить музыку" : "Включить музыку");
    button.setAttribute("aria-pressed", String(isPlaying));
  });
}

function pauseSong() {
  setSongPlaying(false);
  songAudio.pause();
}

async function toggleSong() {
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

  if (syncHash) {
    history.replaceState(null, "", `#${name}`);
  }

  if (name === "present-open") {
    openGift();
  }
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("restart")) {
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

window.addEventListener("keydown", (event) => {
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

function openGift() {
  giftScreen.classList.add("is-gift-open");
  openGiftButton.disabled = true;
}

function resetGift() {
  giftScreen.classList.remove("is-gift-open");
  openGiftButton.disabled = false;
}

openGiftButton.addEventListener("click", openGift);

window.addEventListener("hashchange", () => {
  const requested = location.hash.slice(1);
  const exists = requested === "present-open" || screens.some((screen) => screen.dataset.screen === requested);
  showScreen(exists ? requested : "intro", false);
});

const initial = location.hash.slice(1);
showScreen(initial === "present-open" || screens.some((screen) => screen.dataset.screen === initial) ? initial : "intro", false);
