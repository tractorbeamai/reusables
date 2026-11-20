import type { OxlintConfig } from "vite-plus/lint";

/** A selected set of the `anti-slop` plugin's rules, as errors. */
export const antiSlop = {
  // Each preset lists its `plugins`, even none: `extends` takes the union of
  // its configurations' plugins, and a configuration without `plugins` adds
  // Oxlint's defaults, `typescript`, `unicorn`, and `oxc`.
  plugins: [],
  jsPlugins: [{ name: "anti-slop", specifier: "@tractorbeam/oxlint-config/anti-slop" }],
  rules: {
    "anti-slop/no-array-filter-map": "error",
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-conditional-empty-object-spread": "error",
    "anti-slop/no-known-value-widening": "error",
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-reduce-accumulator-copy": "error",
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
    // `anti-slop/no-reflect-apply` bans.
    "typescript/consistent-indexed-object-style": "off",
    "unicorn/prefer-reflect-apply": "off",
  },
} satisfies OxlintConfig;
