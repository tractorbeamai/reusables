import { definePlugin } from "@oxlint/plugins";

import { effectNamesRule } from "./effect-style/rules/effect-names.ts";
import {
  noDisabledEffectTestsRule,
  noFocusedEffectTestsRule,
} from "./effect-style/rules/effect-test-modifiers.ts";
import { noArrayForEachRule } from "./effect-style/rules/no-array-for-each.ts";
import { noYieldExpressionMemberRule } from "./effect-style/rules/no-yield-expression-member.ts";

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
