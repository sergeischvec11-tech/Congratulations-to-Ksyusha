const screens = [...document.querySelectorAll(".screen")];
const navButtons = [...document.querySelectorAll("[data-target]")];
const songScreen = document.querySelector(".song");
const playToggle = document.querySelector(".play-toggle");
const songAudio = document.querySelector("#song-audio");

function pauseSong() {
  songScreen.classList.remove("is-playing");
  playToggle.setAttribute("aria-label", "Включить песню");
  songAudio.pause();
}

async function toggleSong() {
  if (songAudio.paused) {
    try {
      await songAudio.play();
      songScreen.classList.add("is-playing");
      playToggle.setAttribute("aria-label", "Остановить песню");
    } catch {
      songScreen.classList.remove("is-playing");
    }
  } else {
    pauseSong();
  }
}

function showScreen(name, syncHash = true) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });

  if (name !== "song") {
    pauseSong();
  }

  if (syncHash) {
    history.replaceState(null, "", `#${name}`);
  }
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.target));
});

playToggle.addEventListener("click", () => {
  toggleSong();
});

songAudio.addEventListener("ended", () => {
  pauseSong();
  songAudio.currentTime = 0;
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    showScreen("gifts");
  }
});

window.addEventListener("hashchange", () => {
  const requested = location.hash.slice(1);
  const exists = screens.some((screen) => screen.dataset.screen === requested);
  showScreen(exists ? requested : "intro", false);
});

const initial = location.hash.slice(1);
showScreen(screens.some((screen) => screen.dataset.screen === initial) ? initial : "intro", false);
