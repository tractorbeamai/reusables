import type { Linter } from "eslint";
import { defineConfig } from "eslint/config";

import pluginImportX from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      pluginImportX.flatConfigs.typescript as Linter.Config,
    ],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/consistent-type-exports": [
        "warn",
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        { allowExpressions: true },
      ],
      "@typescript-eslint/method-signature-style": "warn",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          format: ["PascalCase"],
          selector: ["typeLike", "enumMember"],
        },
        {
          custom: {
            match: false,
            regex: "^I[A-Z]|^(Interface|Props)$",
          },
          format: ["PascalCase"],
          selector: "interface",
        },
      ],
      "@typescript-eslint/no-redundant-type-constituents": "warn",
      "@typescript-eslint/no-unnecessary-qualifier": "warn",
      "@typescript-eslint/prefer-regexp-exec": "warn",
    },
  },
]);
