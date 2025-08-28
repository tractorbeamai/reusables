// @ts-check

import pluginN from "eslint-plugin-n";
import pluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";
import { allJsFiles } from "../utils.ts";

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config({
  files: allJsFiles,
  extends: [pluginN.configs["flat/recommended"]],
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
  plugins: {
    unicorn: pluginUnicorn,
  },
  rules: {
    "unicorn/prefer-node-protocol": 2,
  },
});
