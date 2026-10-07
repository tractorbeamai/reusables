import playwrightPlugin from "eslint-plugin-playwright";
import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "oxlint";

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
} satisfies DummyRuleMap;

const antiSlopRules = {
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
} satisfies DummyRuleMap;

const importRules = {
  "import/max-dependencies": "off",
  "import/no-namespace": "error",
  "import/no-unassigned-import": "off",
} satisfies DummyRuleMap;

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
} satisfies DummyRuleMap;

const multilineStatements = [
  "multiline-block-like",
  "multiline-expression",
  "multiline-const",
  "multiline-let",
  "multiline-var",
];

const stylisticRules = {
  "@stylistic/padding-line-between-statements": [
    "error",
    { blankLine: "always", prev: "*", next: multilineStatements },
    { blankLine: "always", prev: multilineStatements, next: "*" },
  ],
  curly: ["error", "all"],
} satisfies DummyRuleMap;

const playwrightRules = {
  ...playwrightPlugin.configs["flat/recommended"].rules,
  "playwright/missing-playwright-await": ["error", { includePageLocatorMethods: true }],
  "playwright/no-nth-methods": "error",
  "playwright/no-raw-locators": "error",
  "playwright/no-wait-for-timeout": "error",
} satisfies DummyRuleMap;

function jsPlugin(name: string, path = name): ExternalPluginEntry {
  return { name, specifier: `@tractorbeam/oxlint-config/${path}` };
}

export default function oxlintConfig({
  complexity,
  playwright,
  react = true,
  stylistic = false,
}: OxlintConfigOptions = {}) {
  return {
    jsPlugins: [
      jsPlugin("anti-slop"),
      ...(react ? [jsPlugin("ui")] : []),
      ...(stylistic ? [jsPlugin("@stylistic", "stylistic")] : []),
      ...(playwright ? [jsPlugin("playwright")] : []),
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
    rules: {
      ...globalRules,
      ...antiSlopRules,
      ...importRules,
      ...(complexity !== undefined && { complexity: ["warn", complexity] }),
      ...(react && reactPluginRules),
      ...(stylistic && stylisticRules),
    },
    overrides: playwright ? [{ files: playwright.files, rules: playwrightRules }] : [],
  } satisfies OxlintConfig;
}
