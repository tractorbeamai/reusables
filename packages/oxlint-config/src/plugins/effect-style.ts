import { definePlugin } from "@oxlint/plugins";

import { effectNamesRule } from "../rules/effect-style/effect-names.ts";
import {
  noDisabledEffectTestsRule,
  noFocusedEffectTestsRule,
} from "../rules/effect-style/effect-test-modifiers.ts";
import { noArrayForEachRule } from "../rules/effect-style/no-array-for-each.ts";
import { noYieldExpressionMemberRule } from "../rules/effect-style/no-yield-expression-member.ts";

export default definePlugin({
  meta: { name: "effect-style" },
  rules: {
    "effect-names": effectNamesRule,
    "no-array-for-each": noArrayForEachRule,
    "no-disabled-effect-tests": noDisabledEffectTestsRule,
    "no-focused-effect-tests": noFocusedEffectTestsRule,
    "no-yield-expression-member": noYieldExpressionMemberRule,
  },
});
