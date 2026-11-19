import { defineRule, type ESTree } from "@oxlint/plugins";

type FunctionNode = ESTree.Function | ESTree.ArrowFunctionExpression;

function returnsJsx(expression: ESTree.Expression | null): boolean {
  switch (expression?.type) {
    case "JSXElement":
    case "JSXFragment": {
      return true;
    }
    case "ConditionalExpression": {
      return returnsJsx(expression.consequent) || returnsJsx(expression.alternate);
    }
    case "LogicalExpression": {
      return returnsJsx(expression.left) || returnsJsx(expression.right);
    }
    case "ParenthesizedExpression":
    case "TSAsExpression":
    case "TSSatisfiesExpression":
    case "TSNonNullExpression": {
      return returnsJsx(expression.expression);
    }
    default: {
      return false;
    }
  }
}

/** The name a function is declared or bound with, if any. */
function nameOf(fn: FunctionNode): ESTree.BindingIdentifier | undefined {
  if (fn.type === "FunctionDeclaration") {
    return fn.id ?? undefined;
  }

  const { parent } = fn;

  return parent.type === "VariableDeclarator" &&
    parent.init === fn &&
    parent.id.type === "Identifier"
    ? parent.id
    : undefined;
}

function enclosingFunction(node: ESTree.Node): FunctionNode | undefined {
  for (let current = node.parent; current !== null; current = current.parent) {
    if (
      current.type === "FunctionDeclaration" ||
      current.type === "FunctionExpression" ||
      current.type === "ArrowFunctionExpression"
    ) {
      return current;
    }
  }

  return undefined;
}

/**
 * A function that returns JSX is a component: name it in PascalCase and render
 * it as an element, so React gives it its own hooks and reconciliation, rather
 * than calling a lowercase helper or a `render*` function that inlines its tree.
 */
export const jsxComponentNamesRule = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Name every function that returns JSX as a component." },
    messages: {
      lowercase:
        "'{{name}}' returns JSX: make it a PascalCase component and render it as an element.",
      render: "Make '{{name}}' a PascalCase component rather than a render function.",
    },
  },
  create(context) {
    const reported = new Set<FunctionNode>();

    function checkName(fn: FunctionNode) {
      const identifier = nameOf(fn);

      if (identifier !== undefined && /^render[A-Z]/u.test(identifier.name)) {
        reported.add(fn);
        context.report({ node: identifier, messageId: "render", data: { name: identifier.name } });
      }
    }

    function checkReturn(fn: FunctionNode | undefined, value: ESTree.Expression | null) {
      const identifier = fn === undefined ? undefined : nameOf(fn);

      if (
        fn === undefined ||
        identifier === undefined ||
        reported.has(fn) ||
        !/^[a-z]/u.test(identifier.name) ||
        !returnsJsx(value)
      ) {
        return;
      }

      reported.add(fn);
      context.report({ node: identifier, messageId: "lowercase", data: { name: identifier.name } });
    }

    return {
      FunctionDeclaration: checkName,
      FunctionExpression: checkName,
      ArrowFunctionExpression(node) {
        checkName(node);

        if (node.expression && node.body.type !== "BlockStatement") {
          checkReturn(node, node.body);
        }
      },
      ReturnStatement(node) {
        checkReturn(enclosingFunction(node), node.argument);
      },
    };
  },
});
