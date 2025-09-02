import type { Linter } from "eslint";
import { defineConfig } from "eslint/config";

import js from "@eslint/js";
import pluginImportX from "eslint-plugin-import-x";
import pluginImportZod from "eslint-plugin-import-zod";
import pluginJsdoc from "eslint-plugin-jsdoc";
import pluginRegexp from "eslint-plugin-regexp";
import pluginUnicorn from "eslint-plugin-unicorn";

import configPrettier from "./prettier.js";
import configTypescript from "./typescript.js";

export default defineConfig([
  /* ESLint Recommended */
  js.configs.all,
  {
    rules: {
      yoda: ["error", "never"],
      "sort-imports": "off",
      "sort-keys": "off",
    },
  },

  /* Plugins */
  pluginUnicorn.configs.recommended,
  pluginImportX.flatConfigs.recommended as Linter.Config,
  pluginImportZod.configs.recommended as Linter.Config,
  pluginRegexp.configs["flat/recommended"],
  pluginJsdoc.configs["flat/recommended-typescript"],

  /* Configs */
  configTypescript,
  configPrettier,
]);
