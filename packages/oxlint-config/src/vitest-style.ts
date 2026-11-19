import { defineRule, definePlugin } from "@oxlint/plugins";

/**
 * Vitest no longer collects `if (import.meta.vitest)` blocks, so a test left
 * in a module never runs.
 */
const noInSourceTestsRule = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Disallow Vitest in-source test blocks." },
    messages: { inSource: "Move this test to a test file; Vitest no longer runs in-source tests." },
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (
          node.object.type === "MetaProperty" &&
          node.object.meta.name === "import" &&
          node.property.type === "Identifier" &&
          node.property.name === "vitest"
        ) {
          context.report({ node, messageId: "inSource" });
        }
      },
    };
  },
});

export default definePlugin({
  meta: { name: "vitest-style" },
  rules: {
    "no-in-source-tests": noInSourceTestsRule,
  },
});
