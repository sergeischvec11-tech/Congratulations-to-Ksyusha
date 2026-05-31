const screens = [...document.querySelectorAll(".screen")];
const navButtons = [...document.querySelectorAll("[data-target]")];
const songScreen = document.querySelector(".song");
const playToggle = document.querySelector(".play-toggle");

function showScreen(name, syncHash = true) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });

  if (name !== "song") {
    songScreen.classList.remove("is-playing");
  }

  if (syncHash) {
    history.replaceState(null, "", `#${name}`);
  }
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.target));
});

playToggle.addEventListener("click", () => {
  songScreen.classList.toggle("is-playing");
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
