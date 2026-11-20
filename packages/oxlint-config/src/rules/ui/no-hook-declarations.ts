import { defineRule, type ESTree } from "@oxlint/plugins";

const COMPONENTS_DIRECTORY_PATTERN = /(?:^|\/)components\//u;
const HOOK_NAME_PATTERN = /^use[A-Z]/u;

/** Keep hook declarations out of `components/` directories, except the names `allow` lists. */
export const noHookDeclarationsRule = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Disallow hook declarations in component modules." },
    messages: {
      hookDeclaration: "Move hook '{{name}}' out of components/.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: { type: "array", items: { type: "string" }, uniqueItems: true },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    if (!COMPONENTS_DIRECTORY_PATTERN.test(context.filename.replaceAll("\\", "/"))) {
      return {};
    }

    // The schema validates the options.
    const [options] = context.options as [{ allow?: string[] }?];
    const allowed = new Set(options?.allow);

    function check(identifier: ESTree.BindingPattern | ESTree.BindingIdentifier | null) {
      if (
        identifier?.type === "Identifier" &&
        HOOK_NAME_PATTERN.test(identifier.name) &&
        !allowed.has(identifier.name)
      ) {
        context.report({
          node: identifier,
          messageId: "hookDeclaration",
          data: { name: identifier.name },
        });
      }
    }

    return {
      FunctionDeclaration(node) {
        check(node.id);
      },
      VariableDeclarator(node) {
        check(node.id);
      },
    };
  },
});
