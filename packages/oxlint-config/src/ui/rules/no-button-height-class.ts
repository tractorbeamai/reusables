import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

const VALUE_PATTERN = "(\\d+|\\[.+?\\]|\\d+\\/\\d+)";
const CLASS_START_PATTERN = "(?:^|[\\s:])";

const disallowedSizePatterns = [
  new RegExp(`${CLASS_START_PATTERN}h-(?!full\\b)${VALUE_PATTERN}`, "u"),
  new RegExp(`${CLASS_START_PATTERN}w-(?!full\\b)${VALUE_PATTERN}`, "u"),
  new RegExp(`${CLASS_START_PATTERN}size-(?!full\\b)${VALUE_PATTERN}`, "u"),
  new RegExp(`${CLASS_START_PATTERN}min-h-(?!full\\b|0\\b)${VALUE_PATTERN}`, "u"),
  new RegExp(`${CLASS_START_PATTERN}max-h-(?!full\\b|none\\b)${VALUE_PATTERN}`, "u"),
  new RegExp(`${CLASS_START_PATTERN}min-w-(?!full\\b|0\\b)${VALUE_PATTERN}`, "u"),
  new RegExp(`${CLASS_START_PATTERN}max-w-(?!full\\b|none\\b)${VALUE_PATTERN}`, "u"),
];

function isButton(node: ESTree.JSXOpeningElement): boolean {
  return node.name.type === "JSXIdentifier" && node.name.name === "Button";
}

function isClassNameAttribute(
  attribute: ESTree.JSXAttributeItem,
): attribute is ESTree.JSXAttribute {
  return (
    attribute.type === "JSXAttribute" &&
    attribute.name.type === "JSXIdentifier" &&
    attribute.name.name === "className"
  );
}

function hasDisallowedSizeClass(value: string): boolean {
  return disallowedSizePatterns.some((pattern) => pattern.test(value));
}

function isStringLiteral(
  expression:
    | ESTree.BigIntLiteral
    | ESTree.BooleanLiteral
    | ESTree.NullLiteral
    | ESTree.NumericLiteral
    | ESTree.RegExpLiteral
    | ESTree.StringLiteral,
): expression is ESTree.StringLiteral {
  return expression.value === String(expression.value);
}

function attributeHasDisallowedSizeClass(attribute: ESTree.JSXAttribute): boolean {
  const { value } = attribute;
  if (value?.type === "Literal") {
    return hasDisallowedSizeClass(value.value);
  }
  if (value?.type !== "JSXExpressionContainer") return false;

  const { expression } = value;
  if (expression.type === "Literal") {
    return isStringLiteral(expression) && hasDisallowedSizeClass(expression.value);
  }
  if (expression.type !== "TemplateLiteral") return false;

  return expression.quasis.some((quasi) => hasDisallowedSizeClass(quasi.value.raw));
}

/** Prefer the Button size prop over fixed Tailwind sizing utilities. */
export const noButtonHeightClassRule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer the size prop over sizing classes on Button components.",
    },
    messages: {
      preferSizeProp:
        "Avoid using sizing classes (h-*, w-*, size-*, min-*, max-*) on <Button>. Use the size prop instead.",
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (!isButton(node)) return;
        const className = node.attributes.find(isClassNameAttribute);
        if (className === undefined || !attributeHasDisallowedSizeClass(className)) return;
        context.report({ node, messageId: "preferSizeProp" });
      },
    };
  },
});
