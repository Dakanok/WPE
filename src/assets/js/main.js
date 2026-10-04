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
    pageStats: "${startPageAt} à ${endPageAt} sur ${totalTargets}",
    pageStatsSingle: "${startPageAt} sur ${totalTargets}",
    pageStatsFail: "Aucun patch trouvé",
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