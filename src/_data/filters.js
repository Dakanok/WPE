const patches = require("./patches.json");

const unique = (key) =>
  [...new Set(patches.map((p) => p[key]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

module.exports = {
  tags: unique("tag"),
  styles: unique("style"),
  authors: unique("author"),
};