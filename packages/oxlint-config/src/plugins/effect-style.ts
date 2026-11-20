import { definePlugin } from "@oxlint/plugins";

import { effectNamesRule } from "../rules/effect-style/effect-names.ts";
import {
  noDisabledEffectTestsRule,
  noFocusedEffectTestsRule,
} from "../rules/effect-style/effect-test-modifiers.ts";
import { noArrayForEachRule } from "../rules/effect-style/no-array-for-each.ts";
import { noManualEffectErrorTagRule } from "../rules/effect-style/no-manual-effect-error-tag.ts";
import { noManualTagComparisonRule } from "../rules/effect-style/no-manual-tag-comparison.ts";
import { noManualTaggedConstructionRule } from "../rules/effect-style/no-manual-tagged-construction.ts";
import { noServiceConstructorImportsRule } from "../rules/effect-style/no-service-constructor-imports.ts";
import { noYieldExpressionMemberRule } from "../rules/effect-style/no-yield-expression-member.ts";
import { preferEffectMatchRule } from "../rules/effect-style/prefer-effect-match.ts";
import { requireCauseWhenNarrowingRule } from "../rules/effect-style/require-cause-when-narrowing.ts";
import { throwInEffectGenRule } from "../rules/effect-style/throw-in-effect-gen.ts";

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
