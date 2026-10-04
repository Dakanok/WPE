mixitup("#patches", {
  selectors: { target: ".mix" },
  multifilter: { enable: true },
  pagination: {
    limit: 20,
    maintainActivePage: false,
    hidePageListIfSinglePage: true,
  },
  templates: {
    pager: '<button type="button" class="btn btn-outline-secondary ${classNames}" data-page="${pageNumber}">${pageNumber}</button>',
    pagerPrev: '<button type="button" class="btn btn-outline-secondary ${classNames}" data-page="prev">&laquo;</button>',
    pagerNext: '<button type="button" class="btn btn-outline-secondary ${classNames}" data-page="next">&raquo;</button>', pagerTruncationMarker: '<span class="align-self-center px-1 ${classNames}">&hellip;</span>',
    pageStats: "${startPageAt} to ${endPageAt} of ${totalTargets}",
    pageStatsSingle: "${startPageAt} of ${totalTargets}",
    pageStatsFail: "No patches found",
  },
  callbacks: {
    onMixStart: () => {
      document.querySelectorAll(".wpe-player audio").forEach((a) => a.pause());
    },
  },
});

// Clic sur un auteur / une étiquette / un style dans une carte
document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-filter-target]");
  if (!link) return;

  event.preventDefault();
  const select = document.getElementById(link.dataset.filterTarget);
  select.value = link.dataset.filterValue;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  select.closest("form").scrollIntoView({ behavior: "smooth" });
});

const root = document.documentElement;

document.getElementById("theme-toggle").addEventListener("click", () => {
  const next = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-bs-theme", next);
  try { localStorage.setItem("theme", next); } catch { }
});

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  try { if (localStorage.getItem("theme")) return; } catch { }
  root.setAttribute("data-bs-theme", event.matches ? "dark" : "light");
});

// Panneau d'envoi : l'adresse n'apparaît qu'après acceptation
const consent = document.getElementById("submit-consent");
const emailBox = document.getElementById("submit-email");
const syncConsent = () => { emailBox.hidden = !consent.checked; };
consent.addEventListener("change", syncConsent);
syncConsent(); // couvre le cas où le navigateur restaure la case cochée au rechargement

// Copie de l'adresse dans le presse-papier
const copyButton = document.getElementById("copy-email");
const copyFeedback = document.getElementById("copy-feedback");
let copyTimer;

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyButton.textContent.trim());
    copyFeedback.innerHTML =
      '<div class="alert alert-success py-2 mt-2 mb-0">Address copied</div>';
  } catch {
    copyFeedback.innerHTML =
      '<div class="alert alert-danger py-2 mt-2 mb-0">Could not copy, please copy the address manually.</div>';
  }
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { copyFeedback.innerHTML = ""; }, 3000);
});

// Lecteurs audio : un seul sample à la fois
const formatTime = (s) => {
  if (!isFinite(s)) return "--:--";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

document.querySelectorAll(".wpe-player").forEach((player) => {
  const audio = player.querySelector("audio");
  const toggle = player.querySelector(".wpe-player-toggle");
  const icon = toggle.querySelector("i");
  const seek = player.querySelector(".wpe-player-seek");
  const time = player.querySelector(".wpe-player-time");

  const render = () => {
    const d = audio.duration;
    const pct = isFinite(d) && d > 0 ? (audio.currentTime / d) * 100 : 0;
    seek.value = pct;
    seek.style.setProperty("--wpe-progress", `${pct}%`);
    seek.setAttribute(
      "aria-valuetext",
      `${formatTime(audio.currentTime)} of ${formatTime(d)}`
    );
    time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(d)}`;
  };

  toggle.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => { time.textContent = "Unavailable"; });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    document.querySelectorAll(".wpe-player audio").forEach((other) => {
      if (other !== audio) other.pause();
    });
    icon.className = "fa-solid fa-pause";
    toggle.setAttribute("aria-pressed", "true");
  });

  audio.addEventListener("pause", () => {
    icon.className = "fa-solid fa-play";
    toggle.setAttribute("aria-pressed", "false");
  });

  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
    render();
  });
  audio.addEventListener("loadedmetadata", () => {
    seek.disabled = false;
    render();
  });
  audio.addEventListener("timeupdate", render);
  audio.addEventListener("error", () => { time.textContent = "Unavailable"; });

  seek.addEventListener("input", () => {
    if (isFinite(audio.duration)) {
      audio.currentTime = (seek.value / 100) * audio.duration;
    }
  });
});