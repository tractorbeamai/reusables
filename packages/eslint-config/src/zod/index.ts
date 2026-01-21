import type { Linter } from "eslint";
import eslintPluginZod from "eslint-plugin-zod";
import { defineConfig } from "eslint/config";

export const zod: Linter.Config[] = defineConfig([
  eslintPluginZod.configs.recommended,
]);
