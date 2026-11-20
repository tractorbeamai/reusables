import type { OxlintConfig } from "vite-plus/lint";

/**
 * `@shadcn/lint`'s design-system rules, as Ultracite's `shadcn` preset sets
 * them: every rule an error, and `allow: ["layout"]` so pages may place a
 * component but leave its padding, colors, typography, and shape to its
 * variants. The plugin finds the components and theme from `components.json`.
 *
 * `@shadcn/lint` is an optional peer, as in Ultracite, since it brings a native
 * parser that projects without a design system shouldn't install.
 */
export const shadcn = {
  plugins: [],
  jsPlugins: [{ name: "shadcn", specifier: "@shadcn/lint" }],
  rules: {
    "shadcn/no-arbitrary-values": ["error", { allow: ["layout"] }],
    "shadcn/no-inline-styles": "error",
    "shadcn/no-raw-colors": "error",
    "shadcn/no-restyle": ["error", { allow: ["layout"] }],
    "shadcn/no-unknown-classes": "error",
    "shadcn/require-static-classes": "error",
  },
  overrides: [
    {
      // Components own their appearance: they restyle sibling components,
      // need structural arbitrary values such as `ring-[3px]`, and pass their
      // own variant functions, such as `buttonVariants()`, as class values.
      files: ["**/components/ui/**"],
      rules: {
        "shadcn/no-arbitrary-values": "off",
        "shadcn/no-restyle": "off",
        "shadcn/require-static-classes": "off",
      },
    },
  ],
} satisfies OxlintConfig;
