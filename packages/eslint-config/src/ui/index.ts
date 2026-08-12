import type { TSESLint } from "@typescript-eslint/utils";
import type { Linter, Rule } from "eslint";
import { defineConfig } from "eslint/config";

import { noButtonHeightClass } from "./rules/no-button-height-class.js";
import { noIconClassInButton } from "./rules/no-icon-class-in-button.js";

const uiRules = {
  "no-button-height-class": adaptRuleModule(noButtonHeightClass),
  "no-icon-class-in-button": adaptRuleModule(noIconClassInButton),
};

const uiPlugin = { rules: uiRules };

function adaptRuleModule(rule: TSESLint.AnyRuleModule): Rule.RuleModule {
  return {
    meta: {
      ...rule.meta,
      defaultOptions:
        rule.meta.defaultOptions === undefined ? undefined : [...rule.meta.defaultOptions],
    },
    create(context) {
      return Reflect.apply(rule.create, rule, [context]) as Rule.RuleListener;
    },
  };
}

export const ui: Linter.Config[] = defineConfig([
  {
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: {
      ui: uiPlugin,
    },
    rules: {
      "ui/no-button-height-class": "warn",
      "ui/no-icon-class-in-button": "warn",
    },
  },
]);
