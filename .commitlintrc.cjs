const fs = require("fs");

module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      [...fs.readdirSync("./plugins"), "stuff", "workflows", "github"],
    ],
    "scope-case": [1, "always", "kebab-case"],
  },
};
