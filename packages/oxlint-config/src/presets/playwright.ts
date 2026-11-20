import playwrightPlugin from "eslint-plugin-playwright";
import type { OxlintOverride } from "vite-plus/lint";

/**
 * Playwright's recommended rules and stricter locator and waiting rules, for
 * an override whose `files` match your Playwright tests:
 * `overrides: [{ files: ["e2e/**"], ...playwright }]`.
 */
export const playwright = {
  jsPlugins: [{ name: "playwright", specifier: "@tractorbeam/oxlint-config/playwright" }],
  rules: {
    ...playwrightPlugin.configs["flat/recommended"].rules,
    "playwright/missing-playwright-await": ["error", { includePageLocatorMethods: true }],
    "playwright/no-nth-methods": "error",
    "playwright/no-raw-locators": "error",
    "playwright/no-wait-for-timeout": "error",
  },
} satisfies Omit<OxlintOverride, "files">;
