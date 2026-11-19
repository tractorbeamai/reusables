import { defineConfig } from "vite-plus";

import oxfmtConfig from "./packages/oxfmt-config/src/index";
import { antiSlop, core, options, stylistic } from "./packages/oxlint-config/src/index";

export default defineConfig({
  fmt: {
    ...oxfmtConfig,
    ignorePatterns: [
      ...oxfmtConfig.ignorePatterns,
      "pnpm-lock.yaml",
      // Written by its generate.mjs, whose output its test compares exactly.
      "packages/pnpm-plugin-tractorbeam-defaults/renovate.json",
    ],
  },
  lint: {
    extends: [core, antiSlop, stylistic],
    options,
    plugins: [],
    ignorePatterns: ["**/dist/**", "packages/eslint-config/**", "packages/prettier-config/**"],
  },
  run: {
    cache: true,
  },
});
