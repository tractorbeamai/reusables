import type { Linter } from "eslint";
import pluginPlaywright from "eslint-plugin-playwright";
import { defineConfig } from "eslint/config";

export const playwright: Linter.Config[] = defineConfig([
  pluginPlaywright.configs["flat/recommended"],
]);
