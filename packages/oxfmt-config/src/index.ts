import type { OxfmtConfig } from "oxfmt";

const config = {
  ignorePatterns: ["**/dist/**", "**/routeTree.gen.ts"],
  overrides: [{ files: ["*.md", "*.mdx"], options: { proseWrap: "never" } }],
} satisfies OxfmtConfig;

export default config;
