import { defineRule } from "@oxlint/plugins";

const EFFECT_TESTERS = new Set(["effect", "live"]);

/**
 * A rule that reports `modifier` on @effect/vitest's testers, `it.effect` and
 * `it.live`, which Oxlint's Vitest rules don't see.
 */
function effectTestModifierRule(modifier: string, description: string, message: string) {
  return defineRule({
    meta: {
      type: "problem",
      docs: { description },
      messages: { modifier: message },
    },
    create(context) {
      return {
        MemberExpression(node) {
          if (
            node.property.type === "Identifier" &&
            node.property.name === modifier &&
            node.object.type === "MemberExpression" &&
            node.object.property.type === "Identifier" &&
            EFFECT_TESTERS.has(node.object.property.name)
          ) {
            context.report({ node: node.property, messageId: "modifier" });
          }
        },
      };
    },
  });
}

export const noFocusedEffectTestsRule = effectTestModifierRule(
  "only",
  "Disallow focused @effect/vitest tests.",
  "Remove .only, which skips every other test in the file.",
);

export const noDisabledEffectTestsRule = effectTestModifierRule(
  "skip",
  "Disallow skipped @effect/vitest tests.",
  "Remove .skip, or fix or delete the test.",
);
