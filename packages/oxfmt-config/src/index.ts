import type { OxfmtConfig } from "oxfmt";

const config = {
  ignorePatterns: ["**/dist/**", "**/routeTree.gen.ts"],
} satisfies OxfmtConfig;

export default config;
