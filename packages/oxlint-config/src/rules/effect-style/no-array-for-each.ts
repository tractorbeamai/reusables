import { defineRule } from "@oxlint/plugins";

const NAMESPACE = /^[A-Z]/u;

/**
 * Unicorn's `no-array-for-each`, except for a namespace's `forEach`, such as
 * `Effect.forEach`, an effectful combinator a `for…of` can't replace.
 */
export const noArrayForEachRule = defineRule({
  meta: {
    type: "suggestion",
    docs: { description: "Disallow Array#forEach in favor of for…of." },
    messages: { forEach: "Use a for…of loop instead of forEach." },
  },
  create(context) {
    return {
      CallExpression(node) {
        const { callee } = node;

        if (
          callee.type === "MemberExpression" &&
          !callee.computed &&
          callee.property.type === "Identifier" &&
          callee.property.name === "forEach" &&
          !(callee.object.type === "Identifier" && NAMESPACE.test(callee.object.name))
        ) {
          context.report({ node: callee.property, messageId: "forEach" });
        }
      },
    };
  },
});
