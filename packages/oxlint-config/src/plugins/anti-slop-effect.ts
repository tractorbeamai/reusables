import { definePlugin } from "@oxlint/plugins";

import { noManualEffectErrorTagRule } from "../rules/anti-slop-effect/no-manual-effect-error-tag.ts";
import { noManualTagComparisonRule } from "../rules/anti-slop-effect/no-manual-tag-comparison.ts";
import { noManualTaggedConstructionRule } from "../rules/anti-slop-effect/no-manual-tagged-construction.ts";
import { noServiceConstructorImportsRule } from "../rules/anti-slop-effect/no-service-constructor-imports.ts";
import { preferEffectMatchRule } from "../rules/anti-slop-effect/prefer-effect-match.ts";
import { requireCauseWhenNarrowingRule } from "../rules/anti-slop-effect/require-cause-when-narrowing.ts";
import { throwInEffectGenRule } from "../rules/anti-slop-effect/throw-in-effect-gen.ts";

/**
 * anti-slop's Effect rules, vendored because neither anti-slop nor
 * K-Mistele's fork exports its Effect plugin.
 */
export default definePlugin({
  meta: { name: "anti-slop-effect" },
  rules: {
    "no-manual-effect-error-tag": noManualEffectErrorTagRule,
    "no-manual-tag-comparison": noManualTagComparisonRule,
    "no-manual-tagged-construction": noManualTaggedConstructionRule,
    "no-service-constructor-imports": noServiceConstructorImportsRule,
    "prefer-effect-match": preferEffectMatchRule,
    "require-cause-when-narrowing": requireCauseWhenNarrowingRule,
    "throw-in-effect-gen": throwInEffectGenRule,
  },
});
