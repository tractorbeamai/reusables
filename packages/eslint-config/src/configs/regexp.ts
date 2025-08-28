// @ts-check

import pluginRegexp from "eslint-plugin-regexp";
import { allJsFiles } from "../utils.ts";
import tseslint from "typescript-eslint";

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config({
  ...pluginRegexp.configs["flat/recommended"],
  files: allJsFiles,
});
