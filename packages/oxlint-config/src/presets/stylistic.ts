import type { OxlintConfig } from "vite-plus/lint";

import { jsPlugin } from "./js-plugin.ts";

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
