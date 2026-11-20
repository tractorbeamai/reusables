import { defineRule, type ESTree } from "@oxlint/plugins";

const STOP_TYPES = new Set([
  "ArrowFunctionExpression",
  "FunctionDeclaration",
  "FunctionExpression",
  "CallExpression",
  "NewExpression",
]);

/**
 * The module-scope declarator that holds `node` outside any function or call,
 * if any. A call's arguments are the callee's to keep, such as a route's
 * breadcrumb label in `createFileRoute(…)({ staticData })`.
 */
function moduleDeclarator(node: ESTree.Node): ESTree.VariableDeclarator | undefined {
  for (let current = node.parent; current !== null; current = current.parent) {
    if (STOP_TYPES.has(current.type)) {
      return undefined;
    }

    if (current.type === "VariableDeclarator") {
      const scope = current.parent.parent;

      const atModuleScope =
        scope?.type === "Program" ||
        (scope?.type === "ExportNamedDeclaration" && scope.parent?.type === "Program");

      return atModuleScope ? current : undefined;
    }
  }

  return undefined;
}

/** Create JSX in the component that renders it, not in a module-level constant every render shares. */
export const noModuleJsxRule = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Create JSX in a component, not in a module-level constant." },
    messages: {
      module:
        "'{{name}}' holds JSX at module scope, one element every render shares: create it in the component that renders it.",
    },
  },
  create(context) {
    const reported = new Set<ESTree.VariableDeclarator>();

    function check(node: ESTree.JSXElement | ESTree.JSXFragment) {
      const declarator = moduleDeclarator(node);

      if (declarator === undefined || reported.has(declarator)) {
        return;
      }

      reported.add(declarator);

      context.report({
        node: declarator.id,
        messageId: "module",
        data: { name: declarator.id.type === "Identifier" ? declarator.id.name : "This binding" },
      });
    }

    return { JSXElement: check, JSXFragment: check };
  },
});
