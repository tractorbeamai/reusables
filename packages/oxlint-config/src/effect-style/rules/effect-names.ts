import { defineRule, type ESTree } from "@oxlint/plugins";

/**
 * The `Namespace.member` a call chain starts from, such as `Context.Service`
 * in `Context.Service<A>()("key")` or `Layer.effect` in
 * `Layer.effect(A, make).pipe(Layer.provide(B))`.
 */
function calleeMember(node: ESTree.Node | null): string | undefined {
  let callee = node;

  while (
    callee?.type === "CallExpression" ||
    (callee?.type === "MemberExpression" && callee.object.type !== "Identifier")
  ) {
    callee = callee.type === "CallExpression" ? callee.callee : callee.object;
  }

  if (
    callee?.type !== "MemberExpression" ||
    callee.object.type !== "Identifier" ||
    callee.property.type !== "Identifier"
  ) {
    return undefined;
  }

  return `${callee.object.name}.${callee.property.name}`;
}

/** A value built by a `Layer` constructor, or taken or piped from a service's `layer` or `layerNoDeps`. */
const LAYER_SOURCE = /^Layer\.|\.layer(?:[A-Z][A-Za-z0-9]*)?$/u;

/** The `Layer` functions whose result is not a layer: an Effect that builds or launches one, a predicate, or a memo map. */
const LAYER_EXITS = new Set([
  "Layer.build",
  "Layer.buildWithMemoMap",
  "Layer.buildWithScope",
  "Layer.forkMemoMap",
  "Layer.forkMemoMapUnsafe",
  "Layer.isLayer",
  "Layer.launch",
  "Layer.makeMemoMap",
  "Layer.makeMemoMapUnsafe",
]);

/** Whether a step leaves layers behind: a `Layer` function whose result is no layer, or any of Effect's own, such as `Effect.runSync`. */
function exitsLayers(step: ESTree.Node): boolean {
  const member = calleeMember(step);

  return member !== undefined && (LAYER_EXITS.has(member) || member.startsWith("Effect."));
}

/** Whether a value is a layer, as far as its syntax shows: it starts from a layer source and no step of a `pipe` along its chain leaves layers behind. */
function isLayerValue(node: ESTree.Expression | null): boolean {
  if (node === null || !LAYER_SOURCE.test(calleeMember(node) ?? "") || exitsLayers(node)) {
    return false;
  }

  let link: ESTree.Node = node;

  while (link.type === "CallExpression" || link.type === "MemberExpression") {
    if (
      link.type === "CallExpression" &&
      link.callee.type === "MemberExpression" &&
      link.callee.property.type === "Identifier" &&
      link.callee.property.name === "pipe" &&
      link.arguments.some(exitsLayers)
    ) {
      return false;
    }

    link = link.type === "CallExpression" ? link.callee : link.object;
  }

  return true;
}

/** A layer that is part of an API, a service's static member or an export read through its module's namespace, is `layer` or `layer` and its variant. */
const MEMBER_LAYER_NAME = /^layer(?:[A-Z][A-Za-z0-9]*)?$/u;
const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/u;

/**
 * Name services and layers as Effect's own examples do: a service is a class,
 * named as a type; a service's layers are its `layer` and `layerTest`
 * members, and a module's its `layer` exports; every other layer is a
 * PascalCase value, as `ObservabilityLayer`.
 */
export const effectNamesRule = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Name services and layers as Effect's own examples do." },
    messages: {
      service: "Name the service '{{name}}' in PascalCase.",
      member:
        "Name the layer member '{{name}}' 'layer', or 'layer' and its variant, as in 'layerTest'.",
      exported:
        "Name the exported layer '{{name}}' in PascalCase, as in 'ObservabilityLayer', or 'layer' and its variant for its module's namespace, as in 'layerTest'.",
      binding: "Name the layer '{{name}}' in PascalCase, as in 'ObservabilityLayer'.",
    },
  },
  create(context) {
    function check(
      identifier: ESTree.Node,
      init: ESTree.Expression | null,
      messageId: "binding" | "exported" | "member",
      accepts: (name: string) => boolean,
    ) {
      if (identifier.type === "Identifier" && isLayerValue(init) && !accepts(identifier.name)) {
        context.report({ node: identifier, messageId, data: { name: identifier.name } });
      }
    }

    function checkService(node: ESTree.Class) {
      if (
        node.id !== null &&
        calleeMember(node.superClass) === "Context.Service" &&
        !PASCAL_CASE.test(node.id.name)
      ) {
        context.report({ node: node.id, messageId: "service", data: { name: node.id.name } });
      }
    }

    return {
      ClassDeclaration: checkService,
      ClassExpression: checkService,
      PropertyDefinition(node) {
        check(node.key, node.value, "member", (name) => MEMBER_LAYER_NAME.test(name));
      },
      VariableDeclarator(node) {
        if (node.parent.parent?.type === "ExportNamedDeclaration") {
          check(
            node.id,
            node.init,
            "exported",
            (name) => MEMBER_LAYER_NAME.test(name) || PASCAL_CASE.test(name),
          );
        } else {
          check(node.id, node.init, "binding", (name) => PASCAL_CASE.test(name));
        }
      },
    };
  },
});
