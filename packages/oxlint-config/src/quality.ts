import quality from "@nkzw/oxlint-config/quality/index.js";
import { definePlugin } from "@oxlint/plugins";

import { noRuntimeTypeofRule } from "./quality/rules/no-runtime-typeof.ts";
import { noForbiddenTermInSymbolNamesRule } from "./quality/rules/no-shape-in-symbol-names.ts";
import { noUnknownParametersRule } from "./quality/rules/no-unknown-parameters.ts";

/**
 * nkzw's `quality` plugin, which maintains anti-slop's generic rules, and three
 * anti-slop rules it dropped, vendored.
 */
export default definePlugin({
  meta: { name: "quality" },
  rules: {
    ...quality.rules,
    "no-runtime-typeof": noRuntimeTypeofRule,
    "no-shape-in-symbol-names": noForbiddenTermInSymbolNamesRule,
    "no-unknown-parameters": noUnknownParametersRule,
  },
});
