import pluginTanStackRouter from "@tanstack/eslint-plugin-router";
import type { Linter } from "eslint";
import { defineConfig } from "eslint/config";

export const tanstackRouter: Linter.Config[] = defineConfig([
  pluginTanStackRouter.configs["flat/recommended"],
]);