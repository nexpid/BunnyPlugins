// @ts-check

import { join } from "node:path";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config({
  extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
  languageOptions: {
    parserOptions: {
      project: ["tsconfig.json"],
    },
  },
  plugins: {
    "simple-import-sort": simpleImportSort,
    "unused-imports": unusedImports,
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "prefer-const": "warn",

    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",

    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },

  // why do i have to include this twice??
  files: [
    "plugins",
    "stuff",
    "lang",
    "node_modules/@revenge-mod/vendetta-types",
    "global.d.ts",
  ],
  ignores: ["archive", "dist", "scripts"],
});
