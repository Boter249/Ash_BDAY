"use strict";

const noButton = document.getElementById("no");
const yesButton = document.getElementById("yes");
const question = document.getElementById("question");
const hint = document.getElementById("hint");
const teasing = ["Yeah no, press Yes", "Just hit yes man", "Please press Yes"];
let dodges = 0;
let lastDodge = -Infinity;
let roaming = false;
let target = null;

function viewport() {
  return { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
}

function overlaps(x, y, width, height, rect, gap = 18) {
  return x < rect.right + gap && x + width > rect.left - gap && y < rect.bottom + gap && y + height > rect.top - gap;
}

// Prefer open space around the invitation, always keeping away from Yes.
function escapePosition(pointerX, pointerY) {
  const bounds = viewport();
  const rect = noButton.getBoundingClientRect();
  const yesRect = yesButton.getBoundingClientRect();
  const cardRect = document.getElementById("invitation").getBoundingClientRect();
  const padding = 14;
  const maxX = Math.max(padding, bounds.width - rect.width - padding);
  const maxY = Math.max(padding, bounds.height - rect.height - padding);
  let best = null;
  let bestScore = -Infinity;

  // Include corners so a safe location exists even on small screens.
  const candidates = [[padding, padding], [maxX, padding], [padding, maxY], [maxX, maxY]];
  for (let i = 0; i < 44; i++) {
    candidates.push([padding + Math.random() * (maxX - padding), padding + Math.random() * (maxY - padding)]);
  }
  for (const [x, y] of candidates) {
    if (overlaps(x, y, rect.width, rect.height, yesRect)) continue;
    const distance = Math.hypot(x + rect.width / 2 - pointerX, y + rect.height / 2 - pointerY);
    const travel = Math.hypot(x - rect.left, y - rect.top);
    const outsideCard = !overlaps(x, y, rect.width, rect.height, cardRect, 8);
    const score = distance + Math.min(travel, 260) * .35 + (outsideCard ? 160 : 0) + Math.random() * 50;
    if (score > bestScore) {
      best = { x, y };
      bestScore = score;
    }
  }
  return best || { x: padding, y: padding };
}

function dodge(pointerX, pointerY, force = false) {
  if (question.hidden) return;
  const now = performance.now();
  if (!force && now - lastDodge < 180) return;
  lastDodge = now;
  if (!roaming) {
    const initial = noButton.getBoundingClientRect();
    noButton.style.left = initial.left + "px";
    noButton.style.top = initial.top + "px";
    noButton.classList.add("is-roaming");
    // Commit the starting position so the first escape also glides.
    noButton.getBoundingClientRect();
    roaming = true;
  }
  target = escapePosition(pointerX, pointerY);
  noButton.style.left = target.x + "px";
  noButton.style.top = target.y + "px";
  hint.textContent = teasing[Math.min(dodges, teasing.length - 1)];
  dodges++;
}

// Detect approach before the pointer reaches the button.
document.addEventListener("pointermove", (event) => {
  if (question.hidden || event.pointerType === "touch") return;
  const rect = noButton.getBoundingClientRect();
  const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
  const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
  const nearCurrent = Math.hypot(dx, dy) < 65;
  const nearDestination = roaming && target && event.clientX > target.x - 55 && event.clientX < target.x + rect.width + 55 && event.clientY > target.y - 55 && event.clientY < target.y + rect.height + 55;
  if (nearCurrent || nearDestination) dodge(event.clientX, event.clientY);
}, { passive: true });

// Cover taps, quick clicks, and keyboard activation as well as hovering.
noButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  dodge(event.clientX, event.clientY, true);
});
noButton.addEventListener("click", (event) => {
  event.preventDefault();
  const rect = noButton.getBoundingClientRect();
  dodge(event.detail ? event.clientX : rect.left + rect.width / 2, event.detail ? event.clientY : rect.top + rect.height / 2, true);
});
noButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const rect = noButton.getBoundingClientRect();
    dodge(rect.left + rect.width / 2, rect.top + rect.height / 2, true);
  }
});

yesButton.addEventListener("click", () => {
  window.location.assign("flowers.html");
});

window.addEventListener("resize", () => {
  if (!roaming || question.hidden) return;
  const rect = noButton.getBoundingClientRect();
  dodge(rect.left + rect.width / 2, rect.top + rect.height / 2, true);
});
