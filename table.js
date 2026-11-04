"use strict";

(() => {
  const flower = document.querySelector('[data-flower="chrysanthemum"]');
  const dialog = document.getElementById("table-surprise");
  const puzzle = document.getElementById("table-puzzle");
  const scene = document.getElementById("brick-scene");
  const artTitle = document.getElementById("table-art-title");
  const brick = document.getElementById("loose-brick");
  const target = document.getElementById("brick-target");
  const status = document.getElementById("table-status");
  const gift = document.getElementById("table-gift");
  const giftTitle = document.getElementById("table-gift-title");
  const audio = document.getElementById("table-audio");
  const audioActions = document.getElementById("table-audio-actions");
  const playAudio = document.getElementById("table-play-audio");
  const continueButton = document.getElementById("table-continue");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let phase = "puzzle";
  let selected = false;
  let drag = null;
  let suppressClick = false;
  let fadeTimer;
  let shatterTimer;
  let shatterFinished = false;
  let revealRequested = false;
  let run = 0;

  function selectBrick() {
    if (phase !== "puzzle") return;
    selected = true;
    brick.classList.add("is-selected");
    brick.setAttribute("aria-pressed", "true");
    target.classList.add("is-ready");
    target.setAttribute("aria-disabled", "false");
    status.textContent = "Now place it in the dotted space on top.";
  }

  function resetBrickPosition() {
    brick.style.removeProperty("left");
    brick.style.removeProperty("top");
  }

  function finishDragging() {
    if (drag && brick.hasPointerCapture(drag.id)) brick.releasePointerCapture(drag.id);
    drag = null;
    brick.classList.remove("is-dragging");
    target.classList.remove("is-over");
  }

  function resetPuzzle() {
    run++;
    clearTimeout(fadeTimer);
    clearTimeout(shatterTimer);
    finishDragging();
    audio.pause();
    audio.currentTime = 0;
    phase = "puzzle";
    selected = false;
    shatterFinished = false;
    revealRequested = false;
    suppressClick = false;
    puzzle.hidden = false;
    puzzle.classList.remove("is-fading");
    scene.classList.remove("is-shattered");
    artTitle.textContent = "A glass table holding a pyramid of nine bricks, with its top brick missing.";
    gift.hidden = true;
    audioActions.hidden = true;
    playAudio.hidden = true;
    continueButton.hidden = true;
    brick.disabled = false;
    brick.classList.remove("is-placed", "is-selected");
    brick.setAttribute("aria-pressed", "false");
    brick.setAttribute("aria-label", "Pick up the last brick");
    target.hidden = false;
    target.classList.remove("is-ready");
    target.setAttribute("aria-disabled", "true");
    resetBrickPosition();
    status.textContent = "Just one piece left.";
  }

  function fadeToGift() {
    if (!dialog.open || phase !== "audio") return;
    if (!shatterFinished) {
      revealRequested = true;
      return;
    }
    phase = "fading";
    audio.pause();
    audioActions.hidden = true;
    puzzle.classList.add("is-fading");
    fadeTimer = setTimeout(() => {
      if (!dialog.open || phase !== "fading") return;
      phase = "gift";
      puzzle.hidden = true;
      gift.hidden = false;
      markFlowerComplete(flower);
      dialog.scrollTop = 0;
      giftTitle.focus({ preventScroll: true });
    }, reducedMotion.matches ? 0 : 450);
  }

  function soundFailed(blocked) {
    if (!dialog.open || phase !== "audio") return;
    audioActions.hidden = false;
    playAudio.hidden = !blocked;
    continueButton.hidden = blocked;
    status.textContent = blocked
      ? "Tap Play sound for your surprise."
      : "The sound couldn't load. You can still open your surprise.";
  }

  function startAudio() {
    const currentRun = run;
    audioActions.hidden = true;
    audio.muted = false;
    audio.volume = 1;
    // Keep play() inside the placement/tap gesture so sound is allowed.
    audio.play().catch(error => {
      if (currentRun !== run) return;
      soundFailed(error.name === "NotAllowedError");
    });
  }

  function placeBrick() {
    if (phase !== "puzzle" || !dialog.open) return;
    finishDragging();
    phase = "audio";
    brick.style.left = "41.40625%";
    brick.style.top = "34.130435%";
    brick.classList.remove("is-selected");
    brick.classList.add("is-placed");
    brick.setAttribute("aria-pressed", "false");
    brick.setAttribute("aria-label", "Final brick placed at the top");
    brick.disabled = true;
    target.hidden = true;
    scene.classList.add("is-shattered");
    artTitle.textContent = "The glass table has shattered, and the bricks have fallen.";
    status.textContent = "Oh no… our table!";
    // Let the glass break completely before fading, even if the sound is very short.
    shatterTimer = setTimeout(() => {
      shatterFinished = true;
      if (revealRequested) fadeToGift();
    }, reducedMotion.matches ? 0 : 1100);
    startAudio();
  }

  function overTarget() {
    const slot = target.getBoundingClientRect();
    const moving = brick.getBoundingClientRect();
    const x = moving.left + moving.width / 2;
    const y = moving.top + moving.height / 2;
    return x >= slot.left - 10 && x <= slot.right + 10 && y >= slot.top - 10 && y <= slot.bottom + 10;
  }

  brick.addEventListener("pointerdown", event => {
    if (phase !== "puzzle" || (event.pointerType === "mouse" && event.button !== 0)) return;
    selectBrick();
    const bounds = brick.getBoundingClientRect();
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top, moved: false };
    brick.setPointerCapture(event.pointerId);
  });

  brick.addEventListener("pointermove", event => {
    if (!drag || drag.id !== event.pointerId || phase !== "puzzle") return;
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 4 && !drag.moved) return;
    drag.moved = true;
    brick.classList.add("is-dragging");
    const bounds = scene.getBoundingClientRect();
    const x = Math.max(0, Math.min(bounds.width - brick.offsetWidth, event.clientX - bounds.left - drag.offsetX));
    const y = Math.max(0, Math.min(bounds.height - brick.offsetHeight, event.clientY - bounds.top - drag.offsetY));
    brick.style.left = (x / bounds.width * 100) + "%";
    brick.style.top = (y / bounds.height * 100) + "%";
    target.classList.toggle("is-over", overTarget());
  });

  brick.addEventListener("pointerup", event => {
    if (!drag || drag.id !== event.pointerId) return;
    const moved = drag.moved;
    const correct = moved && overTarget();
    finishDragging();
    if (moved) {
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 0);
      if (correct) placeBrick();
      else {
        resetBrickPosition();
        status.textContent = "Try the dotted space at the top.";
      }
    }
  });

  brick.addEventListener("pointercancel", () => {
    finishDragging();
    if (phase === "puzzle") resetBrickPosition();
  });
  brick.addEventListener("click", () => { if (!suppressClick) selectBrick(); });
  target.addEventListener("click", () => {
    if (selected) placeBrick();
    else if (phase === "puzzle") status.textContent = "Pick up the last brick first.";
  });
  audio.addEventListener("ended", fadeToGift);
  audio.addEventListener("error", () => soundFailed(false));
  playAudio.addEventListener("click", startAudio);
  continueButton.addEventListener("click", fadeToGift);

  flower.addEventListener("click", () => {
    resetPuzzle();
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add("surprise-is-open");
  });
  document.getElementById("table-reset").addEventListener("click", () => {
    resetPuzzle();
    dialog.scrollTop = 0;
    brick.focus({ preventScroll: true });
  });

  function closePuzzle() {
    resetPuzzle();
    dialog.close();
    document.body.classList.remove("surprise-is-open");
    flower.focus({ preventScroll: true });
  }
  dialog.querySelectorAll("[data-close-table]").forEach(button => button.addEventListener("click", closePuzzle));
  dialog.addEventListener("cancel", event => { event.preventDefault(); closePuzzle(); });
})();
