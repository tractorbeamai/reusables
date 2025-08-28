import pluginNx from "@nx/eslint-plugin";
import tseslint from "typescript-eslint";
import configAuto from "@tractorbeamai/eslint-config/auto";
import { workspaceRoot } from "@nx/devkit";

export default tseslint.config(
  {
    ignores: ["**/dist", "pnpm-lock.yaml"],
  },
  {
    plugins: { "@typescript-eslint": tseslint.plugin },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: workspaceRoot,
      },
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: {
      nx: pluginNx,
    },
    rules: {
      "nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
          depConstraints: [
            {
              sourceTag: "*",
              onlyDependOnLibsWithTags: ["*"],
            },
          ],
        },
      ],
    },
  },
  configAuto
);