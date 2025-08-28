// @ts-check

import pluginJsdoc from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";
import { allJsFiles } from "../utils.ts";

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config({
  ...pluginJsdoc.configs["flat/recommended-typescript"],
  files: allJsFiles,
});
