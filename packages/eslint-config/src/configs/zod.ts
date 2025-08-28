// @ts-check

import pluginZod from "eslint-plugin-zod";
import tseslint from "typescript-eslint";

/** @type {import("typescript-eslint").ConfigArray} */
export default tseslint.config({
  plugins: {
    zod: pluginZod,
  },
  rules: {
    "zod/prefer-enum": 2,
    "zod/require-strict": 2,
  },
});
