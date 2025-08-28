// @ts-check

import configPrettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config(configPrettier);
