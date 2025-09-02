import { defineConfig } from "eslint/config";
import globals from "globals";

import pluginN from "eslint-plugin-n";
import pluginUnicorn from "eslint-plugin-unicorn";

export default defineConfig([
  pluginN.configs["flat/recommended"],
  {
    extends: [],
    files: ["**/*.{js,jsx,ts,tsx,mjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      unicorn: pluginUnicorn,
    },
    rules: {
      "unicorn/prefer-node-protocol": "error",
    },
  },
]);
