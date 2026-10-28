import type { OxfmtConfig } from "oxfmt";

const config = {
  ignorePatterns: ["**/dist/**", "**/routeTree.gen.ts"],
  // Tractorbeam's own packages sort after third-party ones, in their own group.
  sortImports: { internalPattern: ["@tractorbeam/", "~/", "@/", "#"] },
  // Class names in `class` and `className`, and in the class-merging helpers.
  sortTailwindcss: { functions: ["clsx", "cn", "cva"] },
  overrides: [{ files: ["*.md", "*.mdx"], options: { proseWrap: "never" } }],
} satisfies OxfmtConfig;

export default config;
