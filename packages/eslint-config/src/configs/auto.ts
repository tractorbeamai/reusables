// @ts-check

import configBase from "./base.ts";
import configJsdoc from "./jsdoc.ts";
import configJson from "./json.ts";
import configPrettier from "./prettier.ts";
import configRegexp from "./regexp.ts";
import configTypescript from "./typescript.ts";
import tseslint from "typescript-eslint";

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config(
  configBase,
  configJsdoc,
  configJson,
  configPrettier,
  configRegexp,
  configTypescript
);
