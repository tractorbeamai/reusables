import { definePlugin } from "@oxlint/plugins";

import { noInSourceTestsRule } from "../rules/vitest-style/no-in-source-tests.ts";

export default definePlugin({
  meta: { name: "vitest-style" },
  rules: {
    "no-in-source-tests": noInSourceTestsRule,
  },
});
