import type { OxlintConfig } from "vite-plus/lint";

import { jsPlugin } from "./js-plugin.ts";

/** A selected set of the `quality` plugin's rules, as errors. */
export const quality = {
  // Each preset lists its `plugins`, even none: `extends` takes the union of
  // its configurations' plugins, and a configuration without `plugins` adds
  // Oxlint's defaults, `typescript`, `unicorn`, and `oxc`.
  plugins: [],
  jsPlugins: [jsPlugin("quality")],
  rules: {
    "quality/no-array-filter-map": "error",
    "quality/no-chained-type-assertions": "error",
    "quality/no-conditional-empty-object-spread": "error",
    "quality/no-known-value-widening": "error",
    "quality/no-object-parameters": "error",
    "quality/no-reflect-apply": "error",
    "quality/no-reflect-get": "error",
    "quality/no-runtime-typeof": "error",
    "quality/no-shape-in-symbol-names": "error",
    "quality/no-unknown-parameters": "error",
    "quality/no-unknown-returns": "error",
    "quality/no-unknown-type-aliases": "error",
    "quality/no-unsafe-dictionary-type": "error",
    "quality/no-widen-then-assert": "error",
    // `consistent-indexed-object-style`'s fix rewrites an index-signature
    // interface into a `Record` alias, which `no-known-value-widening` then
    // reports, and `prefer-reflect-apply` asks for the `Reflect.apply` that
    // `quality/no-reflect-apply` bans.
    "typescript/consistent-indexed-object-style": "off",
    "unicorn/prefer-reflect-apply": "off",
  },
} satisfies OxlintConfig;
