import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

const ROUTER_SOURCE = "@tanstack/react-router";
const ROUTE_FACTORIES = new Set([
  "createFileRoute",
  "createLazyFileRoute",
  "createLazyRoute",
  "createRootRoute",
  "createRootRouteWithContext",
  "createRoute",
]);
const ROUTE_COMPONENT_PATTERN = /^[A-Z]\w*Route$/u;

function calleeIdentifier(node: ESTree.CallExpression): ESTree.IdentifierReference | undefined {
  let callee: ESTree.Expression = node.callee;
  while (callee.type === "CallExpression" || callee.type === "TSInstantiationExpression") {
    callee = callee.type === "CallExpression" ? callee.callee : callee.expression;
  }
  return callee.type === "Identifier" ? callee : undefined;
}

function componentProperty(options: ESTree.ObjectExpression): ESTree.ObjectProperty | undefined {
  return options.properties.find(
    (property): property is ESTree.ObjectProperty =>
      property.type === "Property" &&
      !property.computed &&
      property.key.type === "Identifier" &&
      property.key.name === "component",
  );
}

/** Register named `*Route` components, or the router's `Outlet`, with route factories. */
export const routeComponentNamesRule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Name route entry components with a Route suffix.",
    },
    messages: {
      routeName:
        "Register a named component with a Route suffix (for example, SettingsRoute), or Outlet for a layout with nothing of its own.",
    },
  },
  create(context) {
    const factories = new Set<string>();
    const outlets = new Set<string>();

    return {
      ImportDeclaration(node) {
        if (node.source.value !== ROUTER_SOURCE) return;
        for (const specifier of node.specifiers) {
          if (specifier.type !== "ImportSpecifier" || specifier.imported.type !== "Identifier") {
            continue;
          }
          if (ROUTE_FACTORIES.has(specifier.imported.name)) factories.add(specifier.local.name);
          if (specifier.imported.name === "Outlet") outlets.add(specifier.local.name);
        }
      },
      CallExpression(node) {
        const callee = calleeIdentifier(node);
        if (callee === undefined || !factories.has(callee.name)) return;
        const [options] = node.arguments;
        if (options?.type !== "ObjectExpression") return;
        const component = componentProperty(options)?.value;
        if (component === undefined) return;
        if (
          component.type === "Identifier" &&
          (outlets.has(component.name) || ROUTE_COMPONENT_PATTERN.test(component.name))
        ) {
          return;
        }
        context.report({ node: component, messageId: "routeName" });
      },
    };
  },
});
