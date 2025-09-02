/* eslint-disable import-x/no-named-as-default-member */

import tseslint from "typescript-eslint";
import configTractorbeam from "@tractorbeamai/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: ["**/dist", "pnpm-lock.yaml"],
  },
  configTractorbeam,
  {
    plugins: { "@typescript-eslint": tseslint.plugin },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
);
