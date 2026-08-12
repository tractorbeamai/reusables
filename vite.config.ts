import { defineConfig } from "vite-plus";

import oxfmtConfig from "./packages/oxfmt-config/src/index";
import oxlintConfig from "./packages/oxlint-config/src/index";

export default defineConfig({
  fmt: {
    ...oxfmtConfig,
    ignorePatterns: [...oxfmtConfig.ignorePatterns, "pnpm-lock.yaml"],
  },
  lint: {
    ...oxlintConfig({ react: false }),
    ignorePatterns: ["**/dist/**"],
  },
  run: {
    cache: true,
  },
});
