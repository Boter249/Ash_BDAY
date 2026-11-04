"use strict";

function markFlowerComplete(button) {
  button.classList.add("is-complete");
  const flowerName = button.querySelector(".flower-name").textContent.trim();
  button.setAttribute("aria-label", flowerName + ", already opened");
  const flowers = document.querySelectorAll(".flower-button");
  if ([...flowers].every(flower => flower.classList.contains("is-complete"))) {
    document.getElementById("flowers-done").hidden = false;
  }
}

const tulipButton = document.querySelector('[data-flower="tulip"]');
const tulipDialog = document.getElementById("tulip-surprise");
let tulipGif = document.getElementById("tulip-gif");
const tulipPlayer = document.getElementById("tulip-player");
const birthdayMessage = document.getElementById("tulip-birthday");
const birthdayTitle = document.getElementById("tulip-birthday-title");
const playbackNote = document.getElementById("tulip-playback-note");
const tulipAudio = document.getElementById("tulip-audio");
const playSoundButton = document.getElementById("tulip-play-sound");
const gifSource = tulipGif.getAttribute("src");
// GIF images have no ended event. One cycle of this 62-frame GIF lasts 4.96 seconds.
const gifDurationMs = Number(tulipGif.dataset.durationMs) || 4960;
let revealTimer;
let audioStartTimer;
let playbackVersion = 0;

function showPlaybackNote(message) {
  playbackNote.textContent = message;
  playbackNote.hidden = false;
}

function stopTulipAudio() {
  clearTimeout(audioStartTimer);
  tulipAudio.muted = true;
  tulipAudio.pause();
  tulipAudio.currentTime = 0;
}

function playTulipGif() {
  clearTimeout(revealTimer);
  const currentPlayback = ++playbackVersion;
  stopTulipAudio();
  birthdayMessage.hidden = true;
  tulipPlayer.hidden = false;
  playbackNote.hidden = true;
  playSoundButton.hidden = true;
  let imageFailed = false;

  // Start silently in the click gesture so browsers allow sound after the delay.
  tulipAudio.muted = true;
  tulipAudio.volume = 1;
  tulipAudio.play().catch(error => {
    if (!tulipDialog.open || currentPlayback !== playbackVersion || tulipPlayer.hidden || imageFailed) return;
    if (error.name === "NotAllowedError") {
      showPlaybackNote("Tap Play sound to hear the clip.");
      playSoundButton.hidden = false;
    } else {
      showPlaybackNote("The sound couldn't play, but you can still watch the GIF.");
    }
  });

  // A fresh image and URL restart animated GIFs on every open and replay.
  const nextGif = tulipGif.cloneNode(false);
  nextGif.removeAttribute("src");
  nextGif.hidden = true;
  nextGif.addEventListener("load", () => {
    if (!tulipDialog.open || currentPlayback !== playbackVersion) return;
    nextGif.hidden = false;
    audioStartTimer = setTimeout(() => {
      if (!tulipDialog.open || currentPlayback !== playbackVersion || imageFailed) return;
      tulipAudio.currentTime = 0;
      tulipAudio.muted = false;
    }, 1000);
    // Leave enough time for the delayed sound to finish before showing the message.
    const audioDurationMs = Number.isFinite(tulipAudio.duration) ? tulipAudio.duration * 1000 : 0;
    const revealAfterMs = Math.max(gifDurationMs, 1000 + audioDurationMs);
    revealTimer = setTimeout(() => {
      if (!tulipDialog.open || currentPlayback !== playbackVersion) return;
      stopTulipAudio();
      tulipPlayer.hidden = true;
      tulipGif.hidden = true;
      birthdayMessage.hidden = false;
      markFlowerComplete(tulipButton);
      birthdayTitle.focus({ preventScroll: true });
    }, revealAfterMs);
  }, { once: true });
  nextGif.addEventListener("error", () => {
    if (tulipDialog.open && currentPlayback === playbackVersion) {
      imageFailed = true;
      stopTulipAudio();
      playSoundButton.hidden = true;
      showPlaybackNote("This surprise couldn't load. Please try again.");
    }
  }, { once: true });
  tulipGif.replaceWith(nextGif);
  tulipGif = nextGif;
  nextGif.src = gifSource + "?play=" + Date.now() + "-" + currentPlayback;
}

tulipButton.addEventListener("click", () => {
  tulipDialog.showModal();
  document.body.classList.add("surprise-is-open");
  playTulipGif();
});

document.getElementById("tulip-replay").addEventListener("click", () => {
  playTulipGif();
  tulipDialog.querySelector("[data-close-surprise]").focus({ preventScroll: true });
});

playSoundButton.addEventListener("click", () => {
  // Restart both together when the browser needs an explicit sound tap.
  playTulipGif();
  tulipDialog.querySelector("[data-close-surprise]").focus({ preventScroll: true });
});

function closeTulipSurprise() {
  // Clean up immediately, including when the tab's rendering is paused.
  clearTimeout(revealTimer);
  playbackVersion++;
  stopTulipAudio();
  tulipGif.hidden = true;
  tulipDialog.close();
  document.body.classList.remove("surprise-is-open");
  tulipButton.focus({ preventScroll: true });
}

document.querySelectorAll("[data-close-surprise]").forEach(button => {
  button.addEventListener("click", closeTulipSurprise);
});

tulipDialog.addEventListener("cancel", event => {
  event.preventDefault();
  closeTulipSurprise();
});
