import { defineRule } from "@oxlint/plugins";

/**
 * `(yield* Stage).console` hides a step inside an expression; binding the
 * yielded value names it, as unicorn's `no-await-expression-member` asks of
 * `await`.
 */
export const noYieldExpressionMemberRule = defineRule({
  meta: {
    type: "suggestion",
    docs: { description: "Disallow member access on a yield expression." },
    messages: {
      yieldExpressionMember: "Bind the yielded value to a variable before reading its members.",
    },
  },
  create(context) {
    return {
      MemberExpression(node) {
        let { object } = node;

        while (
          object.type === "TSNonNullExpression" ||
          object.type === "TSAsExpression" ||
          object.type === "ParenthesizedExpression"
        ) {
          object = object.expression;
        }

        if (object.type === "YieldExpression") {
          context.report({ node, messageId: "yieldExpressionMember" });
        }
      },
    };
  },
});
