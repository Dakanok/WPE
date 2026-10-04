mixitup("#patches", {
  selectors: { target: ".mix" },
  multifilter: { enable: true },
  pagination: {
    limit: 3, // à passer à 12 après les tests
    maintainActivePage: false,
    hidePageListIfSinglePage: true,
  },
  templates: {
    pager: '<button type="button" class="btn btn-outline-primary ${classNames}" data-page="${pageNumber}">${pageNumber}</button>',
    pagerPrev: '<button type="button" class="btn btn-outline-primary ${classNames}" data-page="prev">&laquo;</button>',
    pagerNext: '<button type="button" class="btn btn-outline-primary ${classNames}" data-page="next">&raquo;</button>',
    pagerTruncationMarker: '<span class="align-self-center px-1 ${classNames}">&hellip;</span>',
    pageStats: "${startPageAt} to ${endPageAt} of ${totalTargets}",
    pageStatsSingle: "${startPageAt} of ${totalTargets}",
    pageStatsFail: "No patches found",
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