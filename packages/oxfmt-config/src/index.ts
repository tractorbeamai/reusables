import type { OxfmtConfig } from "oxfmt";

const config = {
  ignorePatterns: ["**/dist/**", "**/routeTree.gen.ts"],
  sortImports: true,
  // Class names in `class` and `className`, and in the class-merging helpers.
  sortTailwindcss: { functions: ["clsx", "cn", "cva"] },
  overrides: [{ files: ["*.md", "*.mdx"], options: { proseWrap: "never" } }],
} satisfies OxfmtConfig;

export default config;
