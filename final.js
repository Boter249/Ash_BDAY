"use strict";

function initializeFinalMusic(music) {
  function removeInteractionListeners() {
    document.removeEventListener("pointerdown", playMusic);
    document.removeEventListener("keydown", playMusic);
  }

  function playMusic() {
    // Some browsers require a gesture before allowing sound. Retry on the next
    // tap or key press without displaying a separate music button.
    music.play().then(removeInteractionListeners).catch(() => {});
  }

  function startMusic() {
    document.addEventListener("pointerdown", playMusic);
    document.addEventListener("keydown", playMusic);
    playMusic();
  }

  music.addEventListener("playing", removeInteractionListeners);
  function stopMusic() {
    removeInteractionListeners();
    music.pause();
  }
  window.addEventListener("pagehide", stopMusic);
  window.addEventListener("pageshow", event => {
    if (event.persisted && !music.closest("[hidden]")) startMusic();
  });
  return { start: startMusic, stop: stopMusic };
}

function initializeFinalDecorations(root) {
  const layer = root.querySelector("#final-celebration");
  const balloonTemplate = root.querySelector("#final-balloon-template");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const colors = ["#D9A399", "#F2CD65", "#A7B49B", "#BCD5CB", "#E8C3B6"];

  function decorate() {
    layer.replaceChildren();
    if (reducedMotion.matches) return;
    const pieces = document.createDocumentFragment();

    // Reuse a small, fixed set of decorations: CSS loops them indefinitely.
    for (let i = 0; i < 44; i++) {
      const piece = document.createElement("span");
      const duration = 6 + Math.random() * 5;
      piece.className = "party-confetti";
      piece.style.setProperty("--left", (i * 100 / 44).toFixed(2) + "%");
      piece.style.setProperty("--size", (5 + Math.random() * 5).toFixed(2) + "px");
      piece.style.setProperty("--color", colors[i % colors.length]);
      piece.style.setProperty("--duration", duration.toFixed(2) + "s");
      piece.style.setProperty("--delay", (-Math.random() * duration).toFixed(2) + "s");
      piece.style.setProperty("--drift", (Math.random() * 110 - 55).toFixed(2) + "px");
      piece.style.setProperty("--spin", (360 + Math.random() * 720).toFixed(2) + "deg");
      pieces.append(piece);
    }

    for (let i = 0; i < 8; i++) {
      const balloon = document.createElement("span");
      const duration = 17 + Math.random() * 9;
      balloon.className = "party-balloon";
      balloon.style.setProperty("--left", (2 + i * 94 / 8).toFixed(2) + "%");
      balloon.style.setProperty("--size", (54 + Math.random() * 24).toFixed(2) + "px");
      balloon.style.setProperty("--color", colors[i % colors.length]);
      balloon.style.setProperty("--duration", duration.toFixed(2) + "s");
      balloon.style.setProperty("--delay", (-i * duration / 8).toFixed(2) + "s");
      balloon.style.setProperty("--drift", (i % 2 ? 26 : -26) + "px");
      balloon.append(balloonTemplate.content.cloneNode(true));
      pieces.append(balloon);
    }

    layer.append(pieces);
  }

  function updateVisibility() {
    layer.classList.toggle("is-paused", document.hidden || !!layer.closest("[hidden]"));
  }

  reducedMotion.addEventListener("change", decorate);
  document.addEventListener("visibilitychange", updateVisibility);
  decorate();
  updateVisibility();
  return updateVisibility;
}

(() => {
  const standalone = document.getElementById("final-root");
  if (standalone) {
    standalone.append(createFinalScreen());
    initializeFinalDecorations(standalone);
    initializeFinalMusic(standalone.querySelector("#final-music")).start();
    return;
  }

  const done = document.getElementById("flowers-done");
  const flowers = document.getElementById("flower-screen");
  const flowerTitle = document.title;
  let screen;
  let music;
  let playback;
  let updateDecorations;

  function showFinalScreen() {
    if (!screen) {
      screen = document.createElement("div");
      screen.id = "final-screen";
      screen.append(createFinalScreen());
      document.body.append(screen);
      music = screen.querySelector("#final-music");
      playback = initializeFinalMusic(music);
      updateDecorations = initializeFinalDecorations(screen);
    }

    // Keep play() in the Done activation, before any navigation or async work.
    screen.hidden = false;
    music.currentTime = 0;
    playback.start();
    flowers.hidden = true;
    document.body.classList.replace("flowers-page", "final-page");
    document.title = "Happy Birthday Ash!";
    updateDecorations();
    window.scrollTo(0, 0);
    const title = screen.querySelector("#final-title");
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
  }

  done.addEventListener("click", event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (done.hidden) return;
    showFinalScreen();
    history.pushState(null, "", "#birthday-finale");
  });

  window.addEventListener("popstate", () => {
    if (!screen) return;
    if (location.hash === "#birthday-finale") {
      showFinalScreen();
    } else {
      playback.stop();
      screen.hidden = true;
      flowers.hidden = false;
      document.body.classList.replace("final-page", "flowers-page");
      document.title = flowerTitle;
      updateDecorations();
      done.focus();
    }
  });
})();
