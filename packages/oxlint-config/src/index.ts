import playwright from "eslint-plugin-playwright";
import type { OxlintConfig } from "oxlint";

export interface OxlintConfigOptions {
  /** Warn when cyclomatic complexity exceeds this value. */
  complexity?: number;
  /** Apply Playwright rules to test files matching these globs. */
  playwright?: { files: string[] };
  react?: boolean;
  /** Require braces on every block and blank lines around multiline statements. */
  stylistic?: boolean;
}

const globalRules = {
  "max-lines": ["warn", { max: 1000 }],
  "max-lines-per-function": ["warn", { max: 300 }],
  "no-inline-comments": ["warn", { ignorePattern: "#__PURE__|@__PURE__" }],
  "no-nested-ternary": "error",
  "no-shadow": "off",
} satisfies OxlintConfig["rules"];

const pluginRules = {
  "anti-slop/no-chained-type-assertions": "error",
  "anti-slop/no-conditional-empty-object-spread": "error",
  "anti-slop/no-known-value-widening": "error",
  "anti-slop/no-object-parameters": "error",
  "anti-slop/no-runtime-typeof": "error",
  "anti-slop/no-shape-in-symbol-names": "error",
  "anti-slop/no-unknown-parameters": "error",
  "anti-slop/no-unknown-type-aliases": "error",
  "anti-slop/no-unsafe-dictionary-type": "error",
  "anti-slop/no-widen-then-assert": "error",
  "import/max-dependencies": "off",
  "import/no-namespace": "error",
  "import/no-unassigned-import": "off",
} satisfies OxlintConfig["rules"];

const reactPluginRules = {
  "jsx-a11y/anchor-has-content": "warn",
  "jsx-a11y/autocomplete-valid": "warn",
  "jsx-a11y/click-events-have-key-events": "warn",
  "jsx-a11y/label-has-associated-control": "off",
  "jsx-a11y/no-autofocus": "warn",
  "jsx-a11y/no-redundant-roles": "warn",
  "jsx-a11y/prefer-tag-over-role": "warn",
  "jsx-a11y/tabindex-no-positive": "warn",
  "react/jsx-no-constructed-context-values": "warn",
  "react/no-array-index-key": "warn",
  "react/react-in-jsx-scope": "off",
  "react-perf/jsx-no-jsx-as-prop": "warn",
  "react-perf/jsx-no-new-array-as-prop": "warn",
  "react-perf/jsx-no-new-function-as-prop": "warn",
  "react-perf/jsx-no-new-object-as-prop": "warn",
  "ui/no-button-height-class": "warn",
  "ui/no-icon-class-in-button": "warn",
  "ui/no-pages-in-components": "warn",
  "ui/route-component-names": "warn",
} satisfies OxlintConfig["rules"];

const MULTILINE_STATEMENTS = [
  "multiline-block-like",
  "multiline-expression",
  "multiline-const",
  "multiline-let",
  "multiline-var",
];

const stylisticRules = {
  "@stylistic/padding-line-between-statements": [
    "error",
    { blankLine: "always", prev: "*", next: MULTILINE_STATEMENTS },
    { blankLine: "always", prev: MULTILINE_STATEMENTS, next: "*" },
  ],
  curly: ["error", "all"],
} satisfies OxlintConfig["rules"];

const playwrightRules = {
  ...playwright.configs["flat/recommended"].rules,
  "playwright/missing-playwright-await": ["error", { includePageLocatorMethods: true }],
  "playwright/no-nth-methods": "error",
  "playwright/no-raw-locators": "error",
  "playwright/no-wait-for-timeout": "error",
  "playwright/prefer-web-first-assertions": "error",
} satisfies OxlintConfig["rules"];

export default function oxlintConfig({
  complexity,
  playwright: playwrightTests,
  react = true,
  stylistic = false,
}: OxlintConfigOptions = {}) {
  const rules = { ...globalRules, ...pluginRules };

  if (complexity !== undefined) {
    Object.assign(rules, { complexity: ["warn", complexity] });
  }

  if (react) {
    Object.assign(rules, reactPluginRules);
  }

  if (stylistic) {
    Object.assign(rules, stylisticRules);
  }

  return {
    jsPlugins: [
      {
        name: "anti-slop",
        specifier: "@tractorbeam/oxlint-config/anti-slop",
      },
      ...(react
        ? [
            {
              name: "ui",
              specifier: "@tractorbeam/oxlint-config/ui",
            },
          ]
        : []),
      ...(stylistic
        ? [
            {
              name: "@stylistic",
              specifier: "@tractorbeam/oxlint-config/stylistic",
            },
          ]
        : []),
      ...(playwrightTests
        ? [
            {
              name: "playwright",
              specifier: "@tractorbeam/oxlint-config/playwright",
            },
          ]
        : []),
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    plugins: react
      ? ["import", "jsx-a11y", "promise", "react", "react-perf"]
      : ["import", "promise"],
    categories: {
      correctness: "error",
      suspicious: "error",
      perf: "error",
      pedantic: "warn",
    },
    rules,
    overrides: playwrightTests ? [{ files: playwrightTests.files, rules: playwrightRules }] : [],
  } satisfies OxlintConfig;
}
