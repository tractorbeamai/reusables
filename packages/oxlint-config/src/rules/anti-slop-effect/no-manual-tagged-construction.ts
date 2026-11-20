// Vendored from https://github.com/dmmulroy/anti-slop/tree/13909c9e07590f5a85d93c62712259fe14a883f7/src/effect.
// Copyright (c) 2026 Dillon Mulroy, MIT License.

import { defineRule } from "@oxlint/plugins";

import { isMatchPatternObject, isStringLiteral, propertyName } from "./shared/tagged-values.ts";

export const noManualTaggedConstructionRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Construct tagged values with their existing Effect constructor instead of writing `_tag` manually.",
    },
    messages: {
      manualConstruction:
        "Use the existing Schema tagged `.make`, tagged class/error constructor, or Data.taggedEnum variant constructor instead of writing a literal `_tag` object.",
    },
  },
  createOnce(context) {
    return {
      ObjectExpression(node) {
        if (isMatchPatternObject(node)) {
          return;
        }

        const tag = node.properties.find(
          (property) =>
            property.type === "Property" &&
            propertyName(property) === "_tag" &&
            isStringLiteral(property.value),
        );

        if (tag !== undefined) {
          context.report({ node: tag, messageId: "manualConstruction" });
        }
      },
    };
  },
});
