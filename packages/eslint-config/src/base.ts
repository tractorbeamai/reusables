import eslint from "@eslint/js";
import type { Linter } from "eslint";
import { defineConfig } from "eslint/config";

export const base: Linter.Config[] = defineConfig([
  eslint.configs.recommended,
  {
    rules: {
      "no-nested-ternary": "error",
    },
  },
]);
