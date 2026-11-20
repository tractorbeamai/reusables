import nkzwQuality from "@nkzw/oxlint-config/quality/index.js";
import { definePlugin } from "@oxlint/plugins";
import antiSlopFork from "oxlint-plugin-anti-slop";

/**
 * anti-slop's generic rules: nkzw's `quality` plugin, which maintains them, and
 * three it dropped, from K-Mistele's anti-slop fork.
 */
export default definePlugin({
  meta: { name: "anti-slop" },
  rules: {
    ...nkzwQuality.rules,
    "no-runtime-typeof": antiSlopFork.rules["no-runtime-typeof"],
    "no-shape-in-symbol-names": antiSlopFork.rules["no-shape-in-symbol-names"],
    "no-unknown-parameters": antiSlopFork.rules["no-unknown-parameters"],
  },
});
