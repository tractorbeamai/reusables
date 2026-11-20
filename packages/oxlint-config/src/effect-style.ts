import { definePlugin } from "@oxlint/plugins";

import { effectNamesRule } from "./effect-style/rules/effect-names.ts";
import {
  noDisabledEffectTestsRule,
  noFocusedEffectTestsRule,
} from "./effect-style/rules/effect-test-modifiers.ts";
import { noArrayForEachRule } from "./effect-style/rules/no-array-for-each.ts";
import { noManualEffectErrorTagRule } from "./effect-style/rules/no-manual-effect-error-tag.ts";
import { noManualTagComparisonRule } from "./effect-style/rules/no-manual-tag-comparison.ts";
import { noManualTaggedConstructionRule } from "./effect-style/rules/no-manual-tagged-construction.ts";
import { noServiceConstructorImportsRule } from "./effect-style/rules/no-service-constructor-imports.ts";
import { noYieldExpressionMemberRule } from "./effect-style/rules/no-yield-expression-member.ts";
import { preferEffectMatchRule } from "./effect-style/rules/prefer-effect-match.ts";
import { requireCauseWhenNarrowingRule } from "./effect-style/rules/require-cause-when-narrowing.ts";
import { throwInEffectGenRule } from "./effect-style/rules/throw-in-effect-gen.ts";

export default definePlugin({
  meta: { name: "effect-style" },
  rules: {
    "effect-names": effectNamesRule,
    "no-array-for-each": noArrayForEachRule,
    "no-disabled-effect-tests": noDisabledEffectTestsRule,
    "no-focused-effect-tests": noFocusedEffectTestsRule,
    "no-manual-effect-error-tag": noManualEffectErrorTagRule,
    "no-manual-tag-comparison": noManualTagComparisonRule,
    "no-manual-tagged-construction": noManualTaggedConstructionRule,
    "no-service-constructor-imports": noServiceConstructorImportsRule,
    "no-yield-expression-member": noYieldExpressionMemberRule,
    "prefer-effect-match": preferEffectMatchRule,
    "require-cause-when-narrowing": requireCauseWhenNarrowingRule,
    "throw-in-effect-gen": throwInEffectGenRule,
  },
});
