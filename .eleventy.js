module.exports = function (eleventyConfig) {
  // Fichiers du site (CSS, JS, samples, patches)
  eleventyConfig.addPassthroughCopy("src/assets");

  // Dépendances npm copiées dans le site généré
  eleventyConfig.addPassthroughCopy({
    "node_modules/bootstrap/dist/css/bootstrap.min.css": "assets/vendor/bootstrap/bootstrap.min.css",
    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js": "assets/vendor/bootstrap/bootstrap.bundle.min.js",
    "node_modules/mixitup/dist/mixitup.min.js": "assets/vendor/mixitup/mixitup.min.js",
    "node_modules/@fortawesome/fontawesome-free/css/all.min.css": "assets/vendor/fontawesome/css/all.min.css",
    "node_modules/@fortawesome/fontawesome-free/webfonts": "assets/vendor/fontawesome/webfonts",
  });

  return {
    dir: { input: "src", output: "_site" },
  };
};