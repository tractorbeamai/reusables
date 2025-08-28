// @ts-check

import configWorkspace from "../../eslint.config.ts";
import configNode from "./src/configs/node.ts";
import { allJsFiles } from "./src/utils.ts";
import pluginNx from "@nx/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(configWorkspace, configNode, {
  files: allJsFiles,
  plugins: {
    nx: pluginNx,
  },
  rules: {
    "nx/dependency-checks": [
      "error",
      {
        ignoredFiles: ["{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}"],
      },
    ],
    "n/global-require": 0,
  },
  languageOptions: {
    parser: await import("jsonc-eslint-parser"),
  },
});
