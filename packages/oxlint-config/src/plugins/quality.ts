import quality from "@nkzw/oxlint-config/quality/index.js";
import { definePlugin } from "@oxlint/plugins";
import antiSlop from "oxlint-plugin-anti-slop";

/**
 * nkzw's `quality` plugin, which maintains anti-slop's generic rules, and
 * three anti-slop rules it dropped, from K-Mistele's anti-slop fork.
 */
export default definePlugin({
  meta: { name: "quality" },
  rules: {
    ...quality.rules,
    "no-runtime-typeof": antiSlop.rules["no-runtime-typeof"],
    "no-shape-in-symbol-names": antiSlop.rules["no-shape-in-symbol-names"],
    "no-unknown-parameters": antiSlop.rules["no-unknown-parameters"],
  },
});
