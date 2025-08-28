// @ts-check

import pluginVitest from "@vitest/eslint-plugin";
import tseslint from "typescript-eslint";

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config(pluginVitest.configs.all);
