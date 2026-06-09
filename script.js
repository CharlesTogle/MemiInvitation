const ITINERARY = [
  { "12:00 pm": "Pick You Up" },
  { "12:30 am": "We Arrive at MOA" },
  { "1:00 pm": "LA Chicks memi!!" },
  { "2:00 pm": "IKEA Date!!!" },
  { "3:00 pm": "I buy you Make Up Cleanser KKV!!" },
  { "3:30 pm": "Timezone Memis!! Karaoke tayo plss" },
  { "4:30 pm": "We buy Cloud Yogurt" },
  { "5:00 pm": "We et Sichu Malatang" },
  { "6:00 pm": "We are pauwi memi :(("},
  { "7:00 pm": "We arrive at meminie house"},
  { "7:30 pm": "I arrive at mr memi house" },
  { "9:00 pm": "We watch anime/movie together :D" },
  { "12:00 am": "We Ip" },
];

const COUPLE_PHOTOS = [
  "us_image1.jpg",
  "us_image2.jpg",
  "us_image3.jpg",
  "us_image4.jpg",
  "us_image5.jpg",
  "us_image6.jpg",
  "us_image7.jpg",
];

const MUSIC = "my_music.mp3";
const MUSIC_COVER = "my_music_cover.png";

const heartSvg = `
  <svg viewBox="0 0 33.4 29.6" aria-hidden="true">
    <path fill="currentColor" d="M23.6,0c-2.9,0-5.5,1.6-6.9,4C15.3,1.6,12.7,0,9.8,0C4.4,0,0,4.4,0,9.8c0,10.1,16.7,19.8,16.7,19.8
      S33.4,19.9,33.4,9.8C33.4,4.4,29,0,23.6,0z"/>
  </svg>
`;

document.addEventListener("DOMContentLoaded", () => {
  setupInvitePage();
  setupItineraryPage();
});

function setupInvitePage() {
  const page = document.body.dataset.page;
  if (page !== "invite") return;

  const yesButton = document.getElementById("yesButton");
  const noButton = document.getElementById("noButton");
  const stage = document.querySelector("[data-answer-stage]");

  yesButton?.addEventListener("click", () => {
    window.location.href = "itinerary.html";
  });

  if (!noButton || !stage) return;

  requestAnimationFrame(() => {
    pinNoButton(noButton);
  });

  window.addEventListener("resize", () => {
    keepNoButtonInViewport(noButton);
  });

  noButton.addEventListener("mouseenter", () => {
    if (isTouchDevice()) return;
    moveNoButton(noButton, yesButton);
  });

  noButton.addEventListener("click", (event) => {
    event.preventDefault();
    moveNoButton(noButton, yesButton);
  });
}

function pinNoButton(noButton) {
  noButton.classList.remove("is-floating");
  noButton.style.position = "";
  noButton.style.left = "";
  noButton.style.top = "";
  noButton.style.width = "";

  const buttonRect = noButton.getBoundingClientRect();

  noButton.style.position = "fixed";
  noButton.style.left = `${buttonRect.left}px`;
  noButton.style.top = `${buttonRect.top}px`;
  noButton.style.width = `${buttonRect.width}px`;
  noButton.classList.add("is-floating");
}

function moveNoButton(noButton, yesButton) {
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const buttonWidth = noButton.offsetWidth;
  const buttonHeight = noButton.offsetHeight;
  const maxLeft = Math.max(0, viewportWidth - buttonWidth);
  const maxTop = Math.max(0, viewportHeight - buttonHeight);
  const margin = Math.min(48, Math.max(14, viewportWidth * 0.035));
  const zoneWidth = Math.max(0, Math.min(viewportWidth * 0.18, maxLeft - margin));
  const zoneHeight = Math.max(0, Math.min(viewportHeight * 0.18, maxTop - margin));
  const previousRect = noButton.getBoundingClientRect();
  const yesRect = yesButton ? yesButton.getBoundingClientRect() : null;
  const minimumJump = Math.min(viewportWidth, viewportHeight) * 0.34;
  const candidates = getExtremePositions({
    maxLeft,
    maxTop,
    margin,
    zoneWidth,
    zoneHeight,
  });
  let nextPosition = null;
  let farthestPosition = null;
  let farthestDistance = -1;

  for (let attempt = 0; attempt < 36; attempt += 1) {
    const candidate = candidates[randomBetween(0, candidates.length - 1)]();
    const candidateRect = {
      ...candidate,
      width: buttonWidth,
      height: buttonHeight,
    };

    const avoidsYes = !yesRect || !rectsOverlap(candidateRect, yesRect, 18);
    const distanceFromPrevious = getRectDistance(candidateRect, previousRect);
    const movedFarEnough = distanceFromPrevious >= minimumJump;

    if (avoidsYes && distanceFromPrevious > farthestDistance) {
      farthestPosition = candidate;
      farthestDistance = distanceFromPrevious;
    }

    if (avoidsYes && movedFarEnough) {
      nextPosition = candidate;
      break;
    }
  }

  if (!nextPosition) {
    nextPosition = farthestPosition ?? { left: maxLeft, top: maxTop };
  }

  noButton.style.left = `${nextPosition.left}px`;
  noButton.style.top = `${nextPosition.top}px`;
}

function getExtremePositions({ maxLeft, maxTop, margin, zoneWidth, zoneHeight }) {
  const leftEdge = () => randomClamped(margin, margin + zoneWidth, 0, maxLeft);
  const rightEdge = () => randomClamped(maxLeft - zoneWidth, maxLeft - margin, 0, maxLeft);
  const topEdge = () => randomClamped(margin, margin + zoneHeight, 0, maxTop);
  const bottomEdge = () => randomClamped(maxTop - zoneHeight, maxTop - margin, 0, maxTop);
  const middleX = () => randomClamped(margin, maxLeft - margin, 0, maxLeft);
  const middleY = () => randomClamped(margin, maxTop - margin, 0, maxTop);

  return [
    () => ({ left: leftEdge(), top: topEdge() }),
    () => ({ left: rightEdge(), top: topEdge() }),
    () => ({ left: leftEdge(), top: bottomEdge() }),
    () => ({ left: rightEdge(), top: bottomEdge() }),
    () => ({ left: middleX(), top: topEdge() }),
    () => ({ left: middleX(), top: bottomEdge() }),
    () => ({ left: leftEdge(), top: middleY() }),
    () => ({ left: rightEdge(), top: middleY() }),
  ];
}

function rectsOverlap(rectA, rectB, padding = 0) {
  return (
    rectA.left < rectB.left + rectB.width + padding &&
    rectA.left + rectA.width + padding > rectB.left &&
    rectA.top < rectB.top + rectB.height + padding &&
    rectA.top + rectA.height + padding > rectB.top
  );
}

function getRectDistance(rectA, rectB) {
  const centerAX = rectA.left + rectA.width / 2;
  const centerAY = rectA.top + rectA.height / 2;
  const centerBX = rectB.left + rectB.width / 2;
  const centerBY = rectB.top + rectB.height / 2;

  return Math.hypot(centerAX - centerBX, centerAY - centerBY);
}

function keepNoButtonInViewport(noButton) {
  if (!noButton.classList.contains("is-floating")) {
    pinNoButton(noButton);
    return;
  }

  const maxLeft = Math.max(0, document.documentElement.clientWidth - noButton.offsetWidth);
  const maxTop = Math.max(0, document.documentElement.clientHeight - noButton.offsetHeight);
  const currentRect = noButton.getBoundingClientRect();

  noButton.style.left = `${clamp(currentRect.left, 0, maxLeft)}px`;
  noButton.style.top = `${clamp(currentRect.top, 0, maxTop)}px`;
}

function isTouchDevice() {
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomClamped(min, max, lowerBound, upperBound) {
  const start = clamp(Math.min(min, max), lowerBound, upperBound);
  const end = clamp(Math.max(min, max), lowerBound, upperBound);

  return randomBetween(start, end);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setupItineraryPage() {
  const page = document.body.dataset.page;
  if (page !== "itinerary") return;

  renderPhotoGallery();
  renderItinerary();
  renderFloatingHearts();
  setupMusicPlayer();
}

function renderPhotoGallery() {
  const gallery = document.getElementById("photoGallery");
  if (!gallery) return;

  const photos = COUPLE_PHOTOS.filter(Boolean);
  if (!photos.length) return;

  photos.forEach((photo, index) => {
    const frame = document.createElement("figure");
    const image = document.createElement("img");

    frame.className = "photo-frame";
    image.src = photo;
    image.alt = `Photo of us ${index + 1}`;
    image.loading = "lazy";

    image.addEventListener("load", () => {
      frame.classList.add("is-loaded");
      gallery.classList.add("has-photos");
    });

    image.addEventListener("error", () => {
      frame.remove();
    });

    frame.appendChild(image);
    gallery.appendChild(frame);
  });
}

function renderItinerary() {
  const list = document.getElementById("itineraryList");
  if (!list) return;

  const fragment = document.createDocumentFragment();

  ITINERARY.forEach((item) => {
    const [time, plan] = Object.entries(item)[0];
    const li = document.createElement("li");
    li.className = "timeline-item";
    li.innerHTML = `
      <span class="timeline-time">${time}</span>
      <span class="timeline-plan">
        <span class="timeline-heart">${heartSvg}</span>${plan}
      </span>
    `;
    fragment.appendChild(li);
  });

  list.appendChild(fragment);
}

function renderFloatingHearts() {
  const field = document.getElementById("heartField");
  if (!field) return;

  const colors = ["#de5f98", "#f59ac0", "#89c8f4", "#ffffff"];
  const heartCount = 22;

  for (let index = 0; index < heartCount; index += 1) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.innerHTML = heartSvg;
    heart.style.left = `${randomBetween(0, 100)}%`;
    heart.style.setProperty("--heart-size", `${randomBetween(18, 42)}px`);
    heart.style.setProperty("--heart-speed", `${randomBetween(8, 17)}s`);
    heart.style.setProperty("--heart-delay", `${randomBetween(-16, 0)}s`);
    heart.style.setProperty("--heart-drift", `${randomBetween(-90, 90)}px`);
    heart.style.setProperty("--heart-color", colors[index % colors.length]);
    field.appendChild(heart);
  }
}

function setupMusicPlayer() {
  const audio = document.getElementById("musicAudio");
  const cover = document.getElementById("musicCover");
  const toggle = document.getElementById("musicToggle");
  const playButton = document.getElementById("musicPlayButton");
  const playIcon = playButton?.querySelector(".audio-icon");
  const muteButton = document.getElementById("musicMuteButton");
  const progress = document.getElementById("musicProgress");
  const volume = document.getElementById("musicVolume");
  const currentTime = document.getElementById("musicCurrentTime");
  const duration = document.getElementById("musicDuration");

  if (!audio || !cover || !toggle) return;

  const defaultVolume = 0.7;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";

    const totalSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = String(totalSeconds % 60).padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  };

  const updateRangeFill = (range) => {
    if (!(range instanceof HTMLInputElement)) return;

    const min = Number(range.min) || 0;
    const max = Number(range.max) || 100;
    const value = Number(range.value) || 0;
    const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;

    range.style.setProperty("--range-fill", `${clamp(fill, 0, 100)}%`);
  };

  const updateTime = () => {
    const audioDuration = audio.duration;
    const hasDuration = Number.isFinite(audioDuration) && audioDuration > 0;

    if (progress instanceof HTMLInputElement) {
      progress.max = hasDuration ? String(audioDuration) : "100";
      progress.value = hasDuration ? String(audio.currentTime) : "0";
      progress.setAttribute(
        "aria-valuetext",
        `${formatTime(audio.currentTime)} of ${formatTime(audioDuration)}`,
      );
      updateRangeFill(progress);
    }

    if (currentTime) currentTime.textContent = formatTime(audio.currentTime);
    if (duration) duration.textContent = formatTime(audioDuration);
  };

  const setPlayingState = (isPlaying) => {
    toggle.classList.toggle("is-playing", isPlaying);
    toggle.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
    playButton?.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
    playIcon?.classList.toggle("audio-icon--play", !isPlaying);
    playIcon?.classList.toggle("audio-icon--pause", isPlaying);
  };

  const updateVolumeState = () => {
    const isMuted = audio.muted || audio.volume === 0;

    muteButton?.classList.toggle("is-muted", isMuted);
    muteButton?.setAttribute("aria-label", isMuted ? "Unmute music" : "Mute music");

    if (volume instanceof HTMLInputElement) {
      volume.value = String(audio.volume);
      volume.setAttribute("aria-valuetext", `${Math.round(audio.volume * 100)}%`);
      updateRangeFill(volume);
    }
  };

  const toggleAudio = async () => {
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlayingState(false);
      }
    } else {
      audio.pause();
    }
  };

  audio.src = MUSIC;
  audio.volume = defaultVolume;
  cover.src = MUSIC_COVER;
  updateTime();
  updateVolumeState();

  cover.addEventListener("error", () => {
    cover.removeAttribute("src");
  });

  toggle.addEventListener("click", toggleAudio);
  playButton?.addEventListener("click", toggleAudio);

  progress?.addEventListener("input", () => {
    if (!(progress instanceof HTMLInputElement)) return;

    const nextTime = Number(progress.value);

    if (Number.isFinite(nextTime)) {
      audio.currentTime = nextTime;
      updateTime();
    }
  });

  volume?.addEventListener("input", () => {
    if (!(volume instanceof HTMLInputElement)) return;

    audio.volume = clamp(Number(volume.value) || 0, 0, 1);
    audio.muted = audio.volume === 0;
    updateVolumeState();
  });

  muteButton?.addEventListener("click", () => {
    if (audio.volume === 0) {
      audio.volume = defaultVolume;
      audio.muted = false;
    } else {
      audio.muted = !audio.muted;
    }

    updateVolumeState();
  });

  audio.addEventListener("loadedmetadata", updateTime);
  audio.addEventListener("durationchange", updateTime);
  audio.addEventListener("timeupdate", updateTime);
  audio.addEventListener("volumechange", updateVolumeState);
  audio.addEventListener("play", () => setPlayingState(true));
  audio.addEventListener("pause", () => setPlayingState(false));
  audio.addEventListener("ended", () => setPlayingState(false));
}
