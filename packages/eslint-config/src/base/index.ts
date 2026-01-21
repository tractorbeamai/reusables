import eslint from "@eslint/js";
import type { Linter } from "eslint";
import { configs as pluginDependConfigs } from "eslint-plugin-depend";
import { defineConfig } from "eslint/config";

export const base: Linter.Config[] = defineConfig([
  eslint.configs.recommended,
  pluginDependConfigs["flat/recommended"],
  {
    rules: {
      "no-nested-ternary": "error",
    },
  },
]);
