"use strict";

(() => {
  const flower = document.querySelector('[data-flower="sakura"]');
  const dialog = document.getElementById("sakura-surprise");
  const sky = document.getElementById("sakura-sky");
  const promise = document.getElementById("sakura-promise");
  const title = document.getElementById("sakura-promise-title");
  const soundButton = document.getElementById("sakura-sound");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const flightDuration = 3200;
  let launchTimer;
  let arrivalTimer;
  let soundTimer;
  let version = 0;
  let soundContext = null;
  let masterGain = null;
  let soundEnabled = true;

  function stopPlaneSound() {
    clearTimeout(soundTimer);
    if (masterGain) masterGain.gain.value = 0;
    const previousContext = soundContext;
    soundContext = null;
    masterGain = null;
    if (previousContext && previousContext.state !== "closed") previousContext.close().catch(() => {});
    soundButton.textContent = "Play plane sound";
    soundButton.setAttribute("aria-pressed", "false");
  }

  function playPlaneSound(durationMs) {
    stopPlaneSound();
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) {
      soundButton.hidden = true;
      return;
    }
    try {
      const context = new AudioEngine();
      soundContext = context;
      const now = context.currentTime;
      const seconds = durationMs / 1000;
      const master = context.createGain();
      masterGain = master;
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(.16, now + Math.min(.4, seconds / 3));
      master.gain.linearRampToValueAtTime(.1, now + seconds * .7);
      master.gain.linearRampToValueAtTime(0, now + seconds);

      if (context.createStereoPanner) {
        const pan = context.createStereoPanner();
        pan.pan.setValueAtTime(-.85, now);
        pan.pan.linearRampToValueAtTime(0, now + seconds);
        master.connect(pan);
        pan.connect(context.destination);
      } else master.connect(context.destination);

      // Filtered brown noise and a quiet engine tone create an original airplane whoosh.
      const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const samples = buffer.getChannelData(0);
      let brown = 0;
      for (let i = 0; i < samples.length; i++) {
        brown = (brown + .02 * (Math.random() * 2 - 1)) / 1.02;
        samples[i] = brown * 3.5;
      }
      const noise = context.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(1100, now + seconds * .55);
      filter.frequency.linearRampToValueAtTime(500, now + seconds);
      filter.Q.value = .6;
      noise.connect(filter);
      filter.connect(master);

      const engine = context.createOscillator();
      engine.type = "triangle";
      engine.frequency.setValueAtTime(75, now);
      engine.frequency.linearRampToValueAtTime(100, now + seconds * .5);
      engine.frequency.linearRampToValueAtTime(70, now + seconds);
      const engineVolume = context.createGain();
      engineVolume.gain.value = .12;
      engine.connect(engineVolume);
      engineVolume.connect(master);
      noise.start(now);
      engine.start(now);
      noise.stop(now + seconds + .05);
      engine.stop(now + seconds + .05);
      context.resume().then(() => {
        if (soundContext !== context || !dialog.open) return;
        soundButton.textContent = "Mute plane sound";
        soundButton.setAttribute("aria-pressed", "true");
      }).catch(() => {
        if (soundContext === context) stopPlaneSound();
      });
      soundTimer = setTimeout(() => {
        if (soundContext === context) stopPlaneSound();
      }, durationMs + 100);
    } catch {
      stopPlaneSound();
    }
  }

  function resetFlight() {
    version++;
    clearTimeout(launchTimer);
    clearTimeout(arrivalTimer);
    stopPlaneSound();
    sky.classList.remove("is-flying", "has-arrived");
    promise.hidden = true;
    dialog.removeAttribute("aria-busy");
  }

  function arrive(currentVersion) {
    if (!dialog.open || currentVersion !== version) return;
    sky.classList.remove("is-flying");
    sky.classList.add("has-arrived");
    promise.hidden = false;
    markFlowerComplete(flower);
    stopPlaneSound();
    dialog.removeAttribute("aria-busy");
    title.focus({ preventScroll: true });
  }

  function startFlight() {
    resetFlight();
    dialog.scrollTop = 0;
    const currentVersion = version;
    if (soundEnabled) playPlaneSound(reducedMotion.matches ? 1000 : flightDuration + 120);
    if (reducedMotion.matches) {
      sky.classList.add("has-arrived");
      promise.hidden = false;
      markFlowerComplete(flower);
      title.focus({ preventScroll: true });
      return;
    }
    dialog.setAttribute("aria-busy", "true");
    launchTimer = setTimeout(() => {
      if (!dialog.open || currentVersion !== version) return;
      sky.classList.add("is-flying");
      arrivalTimer = setTimeout(() => arrive(currentVersion), flightDuration);
    }, 120);
  }

  flower.addEventListener("click", () => {
    dialog.showModal();
    document.body.classList.add("surprise-is-open");
    startFlight();
  });
  document.getElementById("sakura-replay").addEventListener("click", () => {
    startFlight();
    if (!reducedMotion.matches) dialog.querySelector("[data-close-sakura]").focus({ preventScroll: true });
  });
  soundButton.addEventListener("click", () => {
    if (soundContext && soundContext.state === "running") {
      soundEnabled = false;
      stopPlaneSound();
    } else {
      soundEnabled = true;
      playPlaneSound(sky.classList.contains("has-arrived") ? 1200 : flightDuration);
    }
  });

  function closeFlight() {
    resetFlight();
    dialog.close();
    document.body.classList.remove("surprise-is-open");
    flower.focus({ preventScroll: true });
  }
  dialog.querySelectorAll("[data-close-sakura]").forEach(button => button.addEventListener("click", closeFlight));
  dialog.addEventListener("cancel", event => { event.preventDefault(); closeFlight(); });
})();
