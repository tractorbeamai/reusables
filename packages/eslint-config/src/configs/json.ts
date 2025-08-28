// @ts-check

import tseslint from "typescript-eslint";
import json from "@eslint/json";

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config(
  {
    files: ["**/*.json"],
    ignores: ["package-lock.json"],
    plugins: { json },
    language: "json/json",
    extends: [json.configs.recommended],
  },
  {
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
    extends: [json.configs.recommended],
  }
);
