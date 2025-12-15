import type { Linter } from "eslint";
import { defineConfig } from "eslint/config";
import globals from "globals";

export const node: Linter.Config[] = defineConfig([
  {
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "no-console": "off",
    },
  },
]);
