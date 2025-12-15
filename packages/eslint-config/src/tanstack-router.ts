import pluginTanStackRouter from "@tanstack/eslint-plugin-router";
import type { Linter } from "eslint";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export const tanstackRouter: Linter.Config[] = defineConfig([
  {
    files: ["**/*.tsx", "**/*.jsx"],
    extends: [pluginTanStackRouter.configs["flat/recommended"]],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // tanstack throws notFound and similar to redirect immediately
      "@typescript-eslint/only-throw-error": "off",
    },
  },
]);
