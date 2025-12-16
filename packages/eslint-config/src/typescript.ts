import type { Linter } from "eslint";
import pluginImportLite from "eslint-plugin-import-lite";
import pluginRegexp from "eslint-plugin-regexp";
import pluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export const typescript: Linter.Config[] = defineConfig([
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      pluginUnicorn.configs.recommended,
      pluginRegexp.configs["flat/recommended"],
      pluginImportLite.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "unicorn/no-nested-ternary": "off",
      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-abusive-eslint-disable": "off",
      "unicorn/no-array-sort": "off",
    },
  },
]);
