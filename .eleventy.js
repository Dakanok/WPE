const sass = require("sass");
const path = require("node:path");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addPassthroughCopy({
    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js": "assets/vendor/bootstrap/bootstrap.bundle.min.js",
    "node_modules/mixitup/dist/mixitup.min.js": "assets/vendor/mixitup/mixitup.min.js",
    "node_modules/mixitup-pagination/dist/mixitup-pagination.min.js": "assets/vendor/mixitup/mixitup-pagination.min.js",
    "node_modules/mixitup-multifilter/dist/mixitup-multifilter.min.js": "assets/vendor/mixitup/mixitup-multifilter.min.js",
    "node_modules/@fortawesome/fontawesome-free/css/all.min.css": "assets/vendor/fontawesome/css/all.min.css",
    "node_modules/@fortawesome/fontawesome-free/webfonts": "assets/vendor/fontawesome/webfonts",
    "node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2": "assets/fonts/space-grotesk-latin-wght-normal.woff2",
    "node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2": "assets/fonts/jetbrains-mono-latin-wght-normal.woff2",
  });

  // Compilation des fichiers .sass (syntaxe indentée)
  eleventyConfig.addTemplateFormats("sass");
  eleventyConfig.addExtension("sass", {
    outputFileExtension: "css",
    compile: async function (inputContent, inputPath) {
      const parsed = path.parse(inputPath);
      // Les partiels (_nom.sass) ne produisent pas de fichier de sortie
      if (parsed.name.startsWith("_")) return;

      const result = sass.compileString(inputContent, {
        syntax: "indented",
        loadPaths: [parsed.dir || ".", "node_modules"],
        quietDeps: true,
        silenceDeprecations: ["import"],
      });

      // Relance la compilation si un fichier importé change
      this.addDependencies(inputPath, result.loadedUrls);

      return async () => result.css;
    },
  });

  return {
    dir: { input: "src", output: "_site" },
  };
};