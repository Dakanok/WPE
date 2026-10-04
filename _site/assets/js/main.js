mixitup("#patches", {
  selectors: { target: ".mix" },
  pagination: {
    limit: 20, // pour tester avec tes 4 patches ; passe à 12 ensuite
    maintainActivePage: false, // retour à la page 1 à chaque changement de filtre
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