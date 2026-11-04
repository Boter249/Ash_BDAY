"use strict";

(() => {
  const flower = document.querySelector('[data-flower="thai-magnolia"]');
  const dialog = document.getElementById("magnolia-surprise");
  const stage = document.getElementById("magnolia-gift-stage");
  const unwrapButton = document.getElementById("magnolia-unwrap");
  const hint = document.getElementById("magnolia-gift-hint");
  const reveal = document.getElementById("magnolia-reveal");
  const amount = document.getElementById("magnolia-amount");
  const birthdaySound = document.getElementById("magnolia-audio");
  const playSoundButton = document.getElementById("magnolia-play-sound");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let unwrapTimer;
  let revealTimer;
  let version = 0;
  let unwrapping = false;

  function stopBirthdaySound() {
    birthdaySound.pause();
    birthdaySound.currentTime = 0;
  }

  function playBirthdaySound() {
    stopBirthdaySound();
    const currentVersion = version;
    birthdaySound.muted = false;
    birthdaySound.volume = .7;
    birthdaySound.play().then(() => {
      if (currentVersion === version) playSoundButton.hidden = true;
    }).catch(() => {
      if (dialog.open && currentVersion === version) playSoundButton.hidden = false;
    });
  }

  function resetGift() {
    version++;
    clearTimeout(unwrapTimer);
    clearTimeout(revealTimer);
    stopBirthdaySound();
    playSoundButton.hidden = true;
    stage.classList.remove("is-unwrapping");
    stage.hidden = false;
    unwrapping = false;
    unwrapButton.disabled = false;
    hint.hidden = false;
    reveal.hidden = true;
    dialog.removeAttribute("aria-busy");
  }

  function showGift(currentVersion) {
    if (!dialog.open || currentVersion !== version) return;
    stage.hidden = true;
    reveal.hidden = false;
    markFlowerComplete(flower);
    dialog.removeAttribute("aria-busy");
    dialog.scrollTop = 0;
    amount.focus({ preventScroll: true });
  }

  function unwrapGift() {
    if (!dialog.open || unwrapping || !reveal.hidden) return;
    unwrapping = true;
    unwrapButton.disabled = true;
    hint.hidden = true;
    dialog.scrollTop = 0;
    const currentVersion = version;
    playBirthdaySound();
    if (reducedMotion.matches) {
      showGift(currentVersion);
      return;
    }
    dialog.setAttribute("aria-busy", "true");
    unwrapTimer = setTimeout(() => {
      if (!dialog.open || currentVersion !== version) return;
      stage.classList.add("is-unwrapping");
      revealTimer = setTimeout(() => showGift(currentVersion), 1500);
    }, 150);
    dialog.querySelector("[data-close-magnolia]").focus({ preventScroll: true });
  }

  flower.addEventListener("click", () => {
    resetGift();
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add("surprise-is-open");
  });

  unwrapButton.addEventListener("click", unwrapGift);
  playSoundButton.addEventListener("click", playBirthdaySound);

  document.getElementById("magnolia-replay").addEventListener("click", () => {
    resetGift();
    dialog.scrollTop = 0;
    unwrapButton.focus({ preventScroll: true });
  });

  function closeGift() {
    resetGift();
    dialog.close();
    document.body.classList.remove("surprise-is-open");
    flower.focus({ preventScroll: true });
  }

  dialog.querySelectorAll("[data-close-magnolia]").forEach(button => button.addEventListener("click", closeGift));
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    closeGift();
  });
})();
