import type { OxlintConfig } from "vite-plus/lint";

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
  jsPlugins: [
    { name: "landmines-structure", specifier: "@tractorbeam/oxlint-config/landmines-structure" },
  ],
  categories: {
    correctness: "error",
    suspicious: "error",
    perf: "error",
    pedantic: "warn",
  },
  rules: {
    // A package declares its entry points instead of exporting `./src/*`.
    "landmines-structure/package-exports": "error",
    "max-lines": "off",
    "max-lines-per-function": "off",
    "no-inline-comments": ["warn", { ignorePattern: "#__PURE__|@__PURE__" }],
    "no-nested-ternary": "error",
    "no-shadow": "off",
    // A disable comment names the rules it turns off.
    "unicorn/no-abusive-eslint-disable": "error",
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
