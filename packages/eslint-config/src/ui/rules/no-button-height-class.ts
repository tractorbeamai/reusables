import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator.withoutDocs;

/**
 * Patterns for Tailwind sizing classes that shouldn't be used on Button components.
 * These match numeric values, arbitrary values, and fractions.
 *
 * Allowed exceptions:
 * - w-full, h-full, size-full, min-w-full, max-w-full, min-h-full, max-h-full
 * - min-w-0, min-h-0 (reset utilities)
 * - max-w-none, max-h-none (remove constraints)
 */

// Base pattern for values: numeric (40), arbitrary ([100px]), fractions (1/2)
const VALUE_PATTERN = "(\\d+|\\[.+?\\]|\\d+\\/\\d+)";

// h-* classes (except h-full)
const HEIGHT_PATTERN = new RegExp(`\\bh-(?!full\\b)${VALUE_PATTERN}`);

// w-* classes (except w-full)
const WIDTH_PATTERN = new RegExp(`\\bw-(?!full\\b)${VALUE_PATTERN}`);

// size-* classes (except size-full)
const SIZE_PATTERN = new RegExp(`\\bsize-(?!full\\b)${VALUE_PATTERN}`);

// min-h-* classes (except min-h-full, min-h-0)
const MIN_HEIGHT_PATTERN = new RegExp(`\\bmin-h-(?!full\\b|0\\b)${VALUE_PATTERN}`);

// max-h-* classes (except max-h-full, max-h-none)
const MAX_HEIGHT_PATTERN = new RegExp(
  `\\bmax-h-(?!full\\b|none\\b)${VALUE_PATTERN}`,
);

// min-w-* classes (except min-w-full, min-w-0)
const MIN_WIDTH_PATTERN = new RegExp(`\\bmin-w-(?!full\\b|0\\b)${VALUE_PATTERN}`);

// max-w-* classes (except max-w-full, max-w-none)
const MAX_WIDTH_PATTERN = new RegExp(
  `\\bmax-w-(?!full\\b|none\\b)${VALUE_PATTERN}`,
);

const PATTERNS = [
  HEIGHT_PATTERN,
  WIDTH_PATTERN,
  SIZE_PATTERN,
  MIN_HEIGHT_PATTERN,
  MAX_HEIGHT_PATTERN,
  MIN_WIDTH_PATTERN,
  MAX_WIDTH_PATTERN,
];

export const noButtonHeightClass = createRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer size prop over sizing classes on Button components",
    },
    messages: {
      preferSizeProp:
        "Avoid using sizing classes (h-*, w-*, size-*, min-*, max-*) on <Button>. Use the size prop instead.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const hasDisallowedSizeClass = (classString: string): boolean => {
      return PATTERNS.some((pattern) => pattern.test(classString));
    };

    return {
      JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
        // Check if element is <Button>
        if (
          node.name.type !== AST_NODE_TYPES.JSXIdentifier ||
          node.name.name !== "Button"
        ) {
          return;
        }

        // Find className attribute
        const classNameAttr = node.attributes.find(
          (attr): attr is TSESTree.JSXAttribute =>
            attr.type === AST_NODE_TYPES.JSXAttribute &&
            attr.name.type === AST_NODE_TYPES.JSXIdentifier &&
            attr.name.name === "className",
        );

        if (!classNameAttr) {
          return;
        }

        const reportViolation = () => {
          context.report({
            node,
            messageId: "preferSizeProp",
          });
        };

        // Check for sizing patterns in string literal or template literal
        const value = classNameAttr.value;
        if (
          value?.type === AST_NODE_TYPES.Literal &&
          typeof value.value === "string"
        ) {
          if (hasDisallowedSizeClass(value.value)) {
            reportViolation();
          }
        }

        // Handle JSX expressions like className={...} or className={`...`}
        if (value?.type === AST_NODE_TYPES.JSXExpressionContainer) {
          const expr = value.expression;
          if (
            expr.type === AST_NODE_TYPES.Literal &&
            typeof expr.value === "string"
          ) {
            if (hasDisallowedSizeClass(expr.value)) {
              reportViolation();
            }
          }
          if (expr.type === AST_NODE_TYPES.TemplateLiteral) {
            for (const quasi of expr.quasis) {
              if (hasDisallowedSizeClass(quasi.value.raw)) {
                reportViolation();
                break;
              }
            }
          }
        }
      },
    };
  },
});
