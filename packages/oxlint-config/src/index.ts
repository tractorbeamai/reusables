import playwrightPlugin from "eslint-plugin-playwright";
import type { DummyRuleMap, ExternalPluginEntry, OxlintConfig } from "vite-plus/lint";

import { effect, effectNativeOff } from "./effect-rules.ts";

export { effect, effectNativeOff };

function jsPlugin(name: string, path = name): ExternalPluginEntry {
  return { name, specifier: `@tractorbeam/oxlint-config/${path}` };
}

/**
 * Type-aware linting and TypeScript checking. Oxlint reads `options` only from
 * the root configuration, so set it there alongside `extends`.
 */
export const options = {
  typeAware: true,
  typeCheck: true,
} satisfies OxlintConfig["options"];

/** The categories, import and promise rules, and shared rules every project gets. */
export const core = {
  plugins: ["import", "promise"],
  categories: {
    correctness: "error",
    suspicious: "error",
    perf: "error",
    pedantic: "warn",
  },
  rules: {
    "max-lines": "off",
    "max-lines-per-function": "off",
    "no-inline-comments": ["warn", { ignorePattern: "#__PURE__|@__PURE__" }],
    "no-nested-ternary": "error",
    "no-shadow": "off",
    // A `TODO` or `FIXME` comment marks a known gap where it lives, which a
    // reader of that code needs to see.
    "no-warning-comments": "off",
    "import/max-dependencies": "off",
    "import/no-namespace": "error",
    "import/no-unassigned-import": "off",
  },
} satisfies OxlintConfig;

/** A selected set of anti-slop's rules, as errors. */
export const antiSlop = {
  // Each preset lists its `plugins`, even none: `extends` takes the union of
  // its configurations' plugins, and a configuration without `plugins` adds
  // Oxlint's defaults, `typescript`, `unicorn`, and `oxc`.
  plugins: [],
  jsPlugins: [jsPlugin("anti-slop")],
  rules: {
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
    // `consistent-indexed-object-style`'s fix rewrites an index-signature
    // interface into a `Record` alias, which `no-known-value-widening` then
    // reports, and `prefer-reflect-apply` asks for the `Reflect.apply` that
    // anti-slop's `no-reflect-apply` bans.
    "typescript/consistent-indexed-object-style": "off",
    "unicorn/prefer-reflect-apply": "off",
  },
} satisfies OxlintConfig;

/** React, React Performance, and JSX accessibility rules, and Tractorbeam's UI rules. */
export const react = {
  plugins: ["jsx-a11y", "react", "react-perf"],
  jsPlugins: [jsPlugin("ui")],
  rules: {
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
  },
} satisfies OxlintConfig;

const multilineStatements = [
  "multiline-block-like",
  "multiline-expression",
  "multiline-const",
  "multiline-let",
  "multiline-var",
];

/** Braces on every block, and blank lines around multiline statements. */
export const stylistic = {
  plugins: [],
  jsPlugins: [jsPlugin("@stylistic", "stylistic")],
  rules: {
    "@stylistic/padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: multilineStatements },
      { blankLine: "always", prev: multilineStatements, next: "*" },
    ],
    curly: ["error", "all"],
  },
} satisfies OxlintConfig;

const playwrightRules = {
  ...playwrightPlugin.configs["flat/recommended"].rules,
  "playwright/missing-playwright-await": ["error", { includePageLocatorMethods: true }],
  "playwright/no-nth-methods": "error",
  "playwright/no-raw-locators": "error",
  "playwright/no-wait-for-timeout": "error",
} satisfies DummyRuleMap;

/** Playwright's recommended rules and stricter locator and waiting rules, in the test files `files` matches. */
export function playwright({ files }: { files: string[] }) {
  return {
    plugins: [],
    jsPlugins: [jsPlugin("playwright")],
    overrides: [{ files, rules: playwrightRules }],
  } satisfies OxlintConfig;
}

export interface EffectOptions {
  /**
   * Globs for code on another platform's terms, which get `effectNativeOff()`
   * in an override.
   */
  except?: string[];
}

export interface OxlintConfigOptions {
  /** Warn when cyclomatic complexity exceeds this value. */
  complexity?: number;
  /**
   * Lint the codebase as Effect code with `@effect/tsgo`'s and
   * oxlint-plugin-effect's rules, except the globs `except` lists.
   * Off by default; install both packages to turn it on, and extend
   * `@tractorbeam/typescript-config/effect` in every tsconfig that covers Effect code.
   */
  effect?: boolean | EffectOptions;
  /** Apply Playwright rules to test files matching these globs. */
  playwright?: { files: string[] };
  react?: boolean;
  /** Require braces on every block and blank lines around multiline statements. On by default; set `stylistic: false` to opt out. */
  stylistic?: boolean;
}

/**
 * The presets merged into one configuration, for projects that spread its
 * fields into their own. Prefer the presets with `extends`.
 */
export default function oxlintConfig({
  complexity,
  effect: effectOption = false,
  playwright: playwrightOption,
  react: reactOption = true,
  stylistic: stylisticOption = true,
}: OxlintConfigOptions = {}) {
  const presets: OxlintConfig[] = [
    core,
    antiSlop,
    ...(complexity === undefined
      ? []
      : [{ rules: { complexity: ["warn", complexity] } } satisfies OxlintConfig]),
    ...(reactOption ? [react] : []),
    ...(stylisticOption ? [stylistic] : []),
    ...(playwrightOption ? [playwright(playwrightOption)] : []),
    ...(effectOption ? [effect()] : []),
    ...(effectOption === false || effectOption === true || !effectOption.except?.length
      ? []
      : [{ overrides: [{ files: effectOption.except, rules: effectNativeOff() }] }]),
  ];

  const rules: DummyRuleMap = Object.fromEntries(
    presets.flatMap((preset) => Object.entries(preset.rules ?? {})),
  );

  return {
    jsPlugins: presets.flatMap((preset) => preset.jsPlugins ?? []),
    options,
    plugins: presets.flatMap((preset) => preset.plugins ?? []),
    categories: core.categories,
    rules,
    overrides: presets.flatMap((preset) => preset.overrides ?? []),
  } satisfies OxlintConfig;
}
