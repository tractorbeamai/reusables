import { defineConfig } from "eslint/config";
import globals from "globals";

import pluginUnicorn from "eslint-plugin-unicorn";

export default defineConfig({
  languageOptions: {
    globals: {
      ...globals.browser,
    },
  },
  plugins: {
    unicorn: pluginUnicorn,
  },
  rules: {
    "unicorn/prefer-dom-node-append": "error",
    "unicorn/prefer-dom-node-dataset": "error",
    "unicorn/prefer-dom-node-remove": "error",
    "unicorn/prefer-dom-node-text-content": "error",
    "unicorn/prefer-keyboard-event-key": "error",
    "unicorn/prefer-modern-dom-apis": "error",
  },
});
