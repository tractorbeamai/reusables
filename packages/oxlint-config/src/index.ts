import playwrightPlugin from "eslint-plugin-playwright";
import type {
  DummyRuleMap,
  ExternalPluginEntry,
  OxlintConfig,
  OxlintOverride,
} from "vite-plus/lint";

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
    // `== null` checks for null and undefined at once.
    eqeqeq: ["error", "always", { null: "ignore" }],
    "import/max-dependencies": "off",
    "import/no-namespace": "error",
    "import/no-unassigned-import": "off",
    // A type imported beside values from the same module is marked inline, in
    // one import; an import of only types stays `import type`. A type
    // annotation may name an `import("…")` type, as an ambient declaration
    // file must.
    "eslint/no-duplicate-imports": "off",
    "import/no-duplicates": ["error", { preferInline: true }],
    "typescript/consistent-type-imports": [
      "error",
      { fixStyle: "inline-type-imports", disallowTypeAnnotations: false },
    ],
    // `noImplicitReturns` already requires a value from every path of a
    // function that returns one, and asks for the bare `return;` that
    // `no-useless-return` removes.
    "eslint/no-useless-return": "off",
    "typescript/consistent-return": "off",
    // Oxfmt writes hex digits in lowercase, and this rule, with no option to
    // agree, wants them in uppercase.
    "unicorn/number-literal-case": "off",
    // `while (true)` loops on purpose, until a read reports it's done.
    "typescript/no-unnecessary-condition": ["error", { allowConstantLoopConditions: true }],
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
    "anti-slop/no-array-filter-map": "error",
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-conditional-empty-object-spread": "error",
    "anti-slop/no-known-value-widening": "error",
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-reflect-apply": "error",
    "anti-slop/no-reflect-get": "error",
    "anti-slop/no-runtime-typeof": "error",
    "anti-slop/no-shape-in-symbol-names": "error",
    "anti-slop/no-unknown-parameters": "error",
    "anti-slop/no-unknown-returns": "error",
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
    "ui/jsx-component-names": "warn",
    "ui/no-button-height-class": "warn",
    "ui/no-hook-declarations": "warn",
    "ui/no-icon-class-in-button": "warn",
    "ui/no-module-jsx": "warn",
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
      // Cases that share a body stay together: a blank line after an empty
      // `case` is what `no-fallthrough` reports.
      { blankLine: "any", prev: "case", next: ["case", "default"] },
    ],
    curly: ["error", "all"],
  },
} satisfies OxlintConfig;

/**
 * Playwright's recommended rules and stricter locator and waiting rules, for
 * an override whose `files` match your Playwright tests:
 * `overrides: [{ files: ["e2e/**"], ...playwright }]`.
 */
export const playwright = {
  jsPlugins: [jsPlugin("playwright")],
  rules: {
    ...playwrightPlugin.configs["flat/recommended"].rules,
    "playwright/missing-playwright-await": ["error", { includePageLocatorMethods: true }],
    "playwright/no-nth-methods": "error",
    "playwright/no-raw-locators": "error",
    "playwright/no-wait-for-timeout": "error",
  },
} satisfies Omit<OxlintOverride, "files">;

/**
 * Vitest's rules in test files, with the ones that misread @effect/vitest's
 * testers or hold a matcher or layout preference off, and no in-source tests
 * anywhere.
 */
export const vitest = {
  plugins: [],
  jsPlugins: [jsPlugin("vitest-style")],
  rules: {
    // Vitest no longer collects `if (import.meta.vitest)` blocks, so a test
    // left in a module never runs.
    "vitest-style/no-in-source-tests": "error",
  },
  overrides: [
    {
      files: ["**/*.{test,spec}.{ts,tsx,mts,cts,js,jsx,mjs,cjs}"],
      plugins: ["vitest"],
      rules: {
        // `expect(value, message)` labels the assertion's failure.
        "vitest/valid-expect": ["error", { maxArgs: 2 }],
        // Every `expect` inside @effect/vitest's `it.effect` reads as outside a test.
        "vitest/no-standalone-expect": "off",
        // Tests import `it` and `expect` from Vitest rather than use globals.
        "vitest/no-importing-vitest-globals": "off",
        // A test may branch on its case's data, as a table's cases do.
        "vitest/no-conditional-expect": "off",
        "vitest/no-conditional-in-test": "off",
        // Hooks and top-level tests are how a file shares setup; a `describe`
        // around every file adds nothing.
        "vitest/no-hooks": "off",
        "vitest/require-hook": "off",
        "vitest/require-top-level-describe": "off",
        // Matcher and layout preferences. prefer-strict-boolean-matchers and
        // prefer-to-be-truthy/-falsy ask for opposite matchers.
        "vitest/consistent-test-it": "off",
        "vitest/max-expects": "off",
        "vitest/no-large-snapshots": "off",
        "vitest/prefer-called-once": "off",
        "vitest/prefer-describe-function-title": "off",
        "vitest/prefer-equality-matcher": "off",
        "vitest/prefer-expect-assertions": "off",
        "vitest/prefer-expect-resolves": "off",
        "vitest/prefer-import-in-mock": "off",
        "vitest/prefer-lowercase-title": "off",
        "vitest/prefer-strict-boolean-matchers": "off",
        "vitest/prefer-to-be-falsy": "off",
        "vitest/prefer-to-be-truthy": "off",
        "vitest/prefer-to-have-length": "off",
      },
    },
  ],
} satisfies OxlintConfig;

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
    ...(playwrightOption
      ? [
          {
            jsPlugins: playwright.jsPlugins,
            overrides: [{ files: playwrightOption.files, rules: playwright.rules }],
          } satisfies OxlintConfig,
        ]
      : []),
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
