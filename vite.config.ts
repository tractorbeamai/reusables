import { defineConfig } from "vite-plus";

import oxfmtConfig from "./packages/oxfmt-config/src/index";
import oxlintConfig from "./packages/oxlint-config/src/index";

const lint = oxlintConfig({ react: false });

export default defineConfig({
  fmt: {
    ...oxfmtConfig,
    ignorePatterns: [...oxfmtConfig.ignorePatterns, "pnpm-lock.yaml"],
  },
  lint: {
    ...lint,
    ignorePatterns: ["**/dist/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  run: {
    cache: true,
    tasks: {
      "workspace:build": "vp run --filter './packages/**' build",
      "workspace:clean": {
        cache: false,
        command: "vp run --filter './packages/**' clean",
      },
      "workspace:release": {
        cache: false,
        command: "changeset publish",
        dependsOn: ["workspace:build"],
      },
      "workspace:test": "vp run --filter './packages/**' test",
    },
  },
});
