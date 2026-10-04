const patches = require("./patches.json");

module.exports = [...new Set(patches.map((p) => p.tag))].sort();