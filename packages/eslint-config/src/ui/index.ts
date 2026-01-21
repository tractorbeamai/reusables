import type { Linter, Rule } from "eslint";
import { defineConfig } from "eslint/config";

import { noButtonHeightClass } from "./rules/no-button-height-class.js";
import { noIconClassInButton } from "./rules/no-icon-class-in-button.js";

export const ui: Linter.Config[] = defineConfig([
  {
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: {
      ui: {
        rules: {
          // Cast required: @typescript-eslint/utils RuleModule has stricter types than ESLint's Rule.RuleModule
          "no-button-height-class":
            noButtonHeightClass as unknown as Rule.RuleModule,
          "no-icon-class-in-button":
            noIconClassInButton as unknown as Rule.RuleModule,
        },
      },
    },
    rules: {
      "ui/no-button-height-class": "warn",
      "ui/no-icon-class-in-button": "warn",
    },
  },
]);
