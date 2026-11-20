import type { OxlintConfig } from "vite-plus/lint";

import { jsPlugin } from "./js-plugin.ts";

/**
 * Vitest's rules in test files, with the ones that misread @effect/vitest's
 * testers or hold a matcher or layout preference off, and no in-source tests
 * anywhere.
 */
export const vitest = {
  plugins: [],
  jsPlugins: [jsPlugin("vitest-style"), jsPlugin("landmines-testing")],
  rules: {
    // Vitest no longer collects `if (import.meta.vitest)` blocks, so a test
    // left in a module never runs.
    "vitest-style/no-in-source-tests": "error",
  },
  overrides: [
    {
      files: ["**/*.{test,spec}.{ts,tsx,mts,cts,js,jsx,mjs,cjs}"],
      plugins: ["vitest"],
      rules: {
        // A test exercises the real dependency, not a mock of it, and a flaky
        // test is fixed, not retried or given longer to pass.
        "landmines-testing/no-test-doubles": "error",
        "landmines-testing/no-flake-masking": "error",
        // `expect(value, message)` labels the assertion's failure.
        "vitest/valid-expect": ["error", { maxArgs: 2 }],
        // Every `expect` inside @effect/vitest's `it.effect` reads as outside a test.
        "vitest/no-standalone-expect": "off",
        // Tests import `it` and `expect` from Vitest rather than use globals.
        "vitest/no-importing-vitest-globals": "off",
        // A test may branch on its case's data, as a table's cases do.
        "vitest/no-conditional-expect": "off",
        "vitest/no-conditional-in-test": "off",
        // Hooks and top-level tests are how a file shares setup; a `describe`
        // around every file adds nothing.
        "vitest/no-hooks": "off",
        "vitest/require-hook": "off",
        "vitest/require-top-level-describe": "off",
        // Matcher and layout preferences. prefer-strict-boolean-matchers and
        // prefer-to-be-truthy/-falsy ask for opposite matchers.
        "vitest/consistent-test-it": "off",
        "vitest/max-expects": "off",
        "vitest/no-large-snapshots": "off",
        "vitest/prefer-called-once": "off",
        "vitest/prefer-describe-function-title": "off",
        "vitest/prefer-equality-matcher": "off",
        "vitest/prefer-expect-assertions": "off",
        "vitest/prefer-expect-resolves": "off",
        "vitest/prefer-import-in-mock": "off",
        "vitest/prefer-lowercase-title": "off",
        "vitest/prefer-strict-boolean-matchers": "off",
        "vitest/prefer-to-be-falsy": "off",
        "vitest/prefer-to-be-truthy": "off",
        "vitest/prefer-to-have-length": "off",
      },
    },
  ],
} satisfies OxlintConfig;
