// @ts-check

import tseslint from "typescript-eslint";

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config({
  files: ["**/*.ts", "**/*.tsx"],
  extends: [
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
  ],
  plugins: {
    "@typescript-eslint": tseslint.plugin,
  },
  languageOptions: {
    parserOptions: {
      projectService: true,
    },
  },
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { fixStyle: "separate-type-imports", prefer: "type-imports" },
    ],
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
  },
});
