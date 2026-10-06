/* ==========================================================================
   WPE - main.js (src/assets/js/main.js)

   1. Filtering and pagination (MixItUp + MultiFilter + Pagination)
   2. Filter shortcuts (clickable card tags, "All" instruments button)
   3. Audio players
   4. Light / dark theme toggle
   5. "Submit a patch" panel (consent checkbox, copy address)
   ========================================================================== */


/* --------------------------------------------------------------------------
   1. Filtering and pagination
   -------------------------------------------------------------------------- */

mixitup("#patches", {
  selectors: { target: ".mix" },

  // MultiFilter: several filter groups (instrument, style, author).
  // Default logic: OR within a group, AND between groups.
  multifilter: { enable: true },

  pagination: {
    limit: 12, // patches per page (use a small value, e.g. 3, to test with few patches)
    maintainActivePage: false, // back to page 1 whenever a filter changes
    hidePageListIfSinglePage: true,
  },

  // Pagination markup, styled with Bootstrap buttons.
  // ${...} placeholders are filled in by the extension (these are plain strings).
  templates: {
    pager: '<button type="button" class="btn btn-outline-secondary ${classNames}" data-page="${pageNumber}">${pageNumber}</button>',
    pagerPrev: '<button type="button" class="btn btn-outline-secondary ${classNames}" data-page="prev">&laquo;</button>',
    pagerNext: '<button type="button" class="btn btn-outline-secondary ${classNames}" data-page="next">&raquo;</button>',
    pagerTruncationMarker: '<span class="align-self-center px-1 ${classNames}">&hellip;</span>',
    pageStats: "${startPageAt} to ${endPageAt} of ${totalTargets}",
    pageStatsSingle: "${startPageAt} of ${totalTargets}",
    pageStatsFail: "No patches found",
  },

  callbacks: {
    // Stop any playing sample when the list changes (new filter or new page)
    onMixStart: () => {
      document
        .querySelectorAll(".wpe-player audio")
        .forEach((audio) => audio.pause());
    },
  },
});


/* --------------------------------------------------------------------------
   2. Filter shortcuts
   -------------------------------------------------------------------------- */

// 2a. Clicking an author / instrument / style on a card filters on it.
// The link's data-filter-target is the id of the matching filter control:
// a <select> (style, author) or the fieldset of checkboxes (instrument).
// Filters are changed programmatically, then a "change" event is dispatched
// so that MultiFilter re-reads the filter UI.
document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-filter-target]");
  if (!link) return;

  event.preventDefault();
  const target = document.getElementById(link.dataset.filterTarget);
  const value = link.dataset.filterValue;
  let input;

  if (target.tagName === "SELECT") {
    target.value = value;
    input = target;
  } else {
    // Group of checkboxes (instruments): only the clicked value stays checked
    target.querySelectorAll('input[type="checkbox"]').forEach((box) => {
      box.checked = box.value === value;
    });
    input = target.querySelector("input:checked") || target.querySelector("input");
  }

  input.dispatchEvent(new Event("change", { bubbles: true }));
  target.closest("form").scrollIntoView({ behavior: "smooth" });
});

// 2b. "All" button for instruments.
// Instruments are toggle-style checkboxes: with none checked, every instrument
// is shown. "All" unchecks everything and is highlighted when nothing is checked.
const instrumentGroup = document.getElementById("filter-instrument");
const instrumentAll = document.getElementById("instrument-all");
const instrumentBoxes = instrumentGroup.querySelectorAll('input[type="checkbox"]');

const syncInstrumentAll = () => {
  const none = ![...instrumentBoxes].some((box) => box.checked);
  instrumentAll.classList.toggle("active", none);
  instrumentAll.setAttribute("aria-pressed", String(none));
};

instrumentAll.addEventListener("click", () => {
  instrumentBoxes.forEach((box) => { box.checked = false; });
  // Notify MultiFilter (any checkbox of the group will do)
  instrumentBoxes[0]?.dispatchEvent(new Event("change", { bubbles: true }));
});

// Keep "All" in sync: user clicks, card-badge clicks (both fire "change")...
instrumentGroup.addEventListener("change", syncInstrumentAll);
// ...and the Reset button (checkboxes are only cleared after the reset event)
instrumentGroup.closest("form").addEventListener("reset", () => setTimeout(syncInstrumentAll));
syncInstrumentAll();


/* --------------------------------------------------------------------------
   3. Audio players
   Custom controls on top of a hidden-state <audio> element.
   Only one sample plays at a time.
   -------------------------------------------------------------------------- */

const formatTime = (seconds) => {
  if (!isFinite(seconds)) return "--:--";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
};

document.querySelectorAll(".wpe-player").forEach((player) => {
  const audio = player.querySelector("audio");
  const toggle = player.querySelector(".wpe-player-toggle");
  const icon = toggle.querySelector("i");
  const seek = player.querySelector(".wpe-player-seek");
  const time = player.querySelector(".wpe-player-time");

  // Update the progress bar, its accessible text and the time label
  const render = () => {
    const duration = audio.duration;
    const percent = isFinite(duration) && duration > 0 ? (audio.currentTime / duration) * 100 : 0;
    seek.value = percent;
    seek.style.setProperty("--wpe-progress", `${percent}%`); // filled part of the bar
    seek.setAttribute(
      "aria-valuetext",
      `${formatTime(audio.currentTime)} of ${formatTime(duration)}`
    );
    time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
  };

  toggle.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => { time.textContent = "Unavailable"; });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    // One sample at a time: pause every other player
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

  // Samples use preload="none": duration is unknown until the first play,
  // so the seek bar stays disabled until the metadata is loaded.
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


/* --------------------------------------------------------------------------
   4. Light / dark theme
   The initial theme (saved choice, otherwise the browser setting) is applied
   by a small inline script in <head> (base.njk) to avoid a flash on load.
   -------------------------------------------------------------------------- */

const root = document.documentElement;

document.getElementById("theme-toggle").addEventListener("click", () => {
  const next = root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-bs-theme", next);
  try { localStorage.setItem("theme", next); } catch {}
});

// Until the visitor makes a choice, follow the browser setting live
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  try { if (localStorage.getItem("theme")) return; } catch {}
  root.setAttribute("data-bs-theme", event.matches ? "dark" : "light");
});


/* --------------------------------------------------------------------------
   5. "Submit a patch" panel
   -------------------------------------------------------------------------- */

// The contact address is only revealed once the consent box is checked
const consent = document.getElementById("submit-consent");
const emailBox = document.getElementById("submit-email");
const syncConsent = () => { emailBox.hidden = !consent.checked; };

consent.addEventListener("change", syncConsent);
syncConsent(); // also covers browsers that restore the checked state on reload

// Clicking the address copies it to the clipboard and shows a short alert.
// The Clipboard API requires HTTPS or localhost.
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