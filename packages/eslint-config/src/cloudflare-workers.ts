import type { Linter } from "eslint";
import { defineConfig } from "eslint/config";
import globals from "globals";

export const cloudflareWorkers: Linter.Config[] = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.worker,
      },
    },
    rules: {
      "no-console": "off",
    },
  },
]);
