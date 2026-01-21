import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from "@typescript-eslint/utils";
import * as ts from "typescript";

const createRule = ESLintUtils.RuleCreator.withoutDocs;

/**
 * Checks if a type is or extends LucideIcon from lucide-react.
 * Returns true if the type's name contains "LucideIcon" or "LucideProps",
 * or if any base type does.
 */
function isLucideIconType(type: ts.Type, checker: ts.TypeChecker): boolean {
  // Check the type's symbol name
  const typeName = checker.typeToString(type);
  if (
    typeName.includes("LucideIcon") ||
    typeName.includes("LucideProps") ||
    typeName.includes("ForwardRefExoticComponent")
  ) {
    // Check if it's from lucide-react by examining the full type string
    const fullType = checker.typeToString(
      type,
      undefined,
      ts.TypeFormatFlags.NoTruncation,
    );
    if (fullType.includes("lucide-react") || fullType.includes("Lucide")) {
      return true;
    }
  }

  // Check call signatures for function components
  const callSignatures = type.getCallSignatures();
  for (const sig of callSignatures) {
    const returnType = checker.getReturnTypeOfSignature(sig);
    const returnTypeName = checker.typeToString(returnType);
    // React elements from icon components
    if (
      returnTypeName.includes("Element") ||
      returnTypeName.includes("ReactNode")
    ) {
      // Check parameters for SVGProps or LucideProps
      for (const param of sig.parameters) {
        const paramType = checker.getTypeOfSymbol(param);
        const paramTypeName = checker.typeToString(paramType);
        if (
          paramTypeName.includes("LucideProps") ||
          paramTypeName.includes("SVGProps")
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Checks if a JSX element name matches Icon patterns by name:
 * - Exactly "Icon"
 * - Ends with "Icon" (e.g., SearchIcon, ChevronDownIcon)
 */
function isIconComponentByName(node: TSESTree.JSXOpeningElement): boolean {
  if (node.name.type === AST_NODE_TYPES.JSXIdentifier) {
    const name = node.name.name;
    return name === "Icon" || name.endsWith("Icon");
  }
  // Handle namespaced components like Icons.Search
  if (node.name.type === AST_NODE_TYPES.JSXMemberExpression) {
    const { object, property } = node.name;
    // object can be JSXIdentifier or JSXMemberExpression (nested)
    // property is always JSXIdentifier
    if (object.type === AST_NODE_TYPES.JSXIdentifier) {
      // Match Icons.* or *.Icon patterns
      return (
        object.name === "Icons" ||
        object.name === "Icon" ||
        property.name === "Icon" ||
        property.name.endsWith("Icon")
      );
    }
  }
  return false;
}

/**
 * Checks if a JSX element is a LucideIcon by type.
 * Returns undefined if type checking is not available.
 */
function isIconComponentByType(
  node: TSESTree.JSXOpeningElement,
  context: Parameters<ReturnType<typeof createRule>["create"]>[0],
): boolean | undefined {
  // Try to get parser services with type info
  const services = ESLintUtils.getParserServices(context, true);

  // Check if type info is available
  if (!services.program) {
    return undefined;
  }

  const checker = services.program.getTypeChecker();

  // Get the JSX element name node to check its type
  const nameNode = node.name;
  if (nameNode.type === AST_NODE_TYPES.JSXIdentifier) {
    try {
      const type = services.getTypeAtLocation(nameNode);
      return isLucideIconType(type, checker);
    } catch {
      // Type info not available for this node
      return undefined;
    }
  }

  if (nameNode.type === AST_NODE_TYPES.JSXMemberExpression) {
    try {
      const type = services.getTypeAtLocation(nameNode);
      return isLucideIconType(type, checker);
    } catch {
      return undefined;
    }
  }

  return undefined;
}

/**
 * Checks if a node is inside a Button component by walking up the AST.
 */
function isInsideButton(
  node: TSESTree.Node,
  context: Parameters<ReturnType<typeof createRule>["create"]>[0],
): boolean {
  const ancestors = context.sourceCode.getAncestors(node);

  for (const ancestor of ancestors) {
    if (
      ancestor.type === AST_NODE_TYPES.JSXElement &&
      ancestor.openingElement.name.type === AST_NODE_TYPES.JSXIdentifier &&
      ancestor.openingElement.name.name === "Button"
    ) {
      return true;
    }
  }
  return false;
}

export const noIconClassInButton = createRule({
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow className on Icon components nested inside Button (uses type info when available)",
    },
    messages: {
      noClassName:
        "Avoid using className on icons inside <Button>. The Button component handles icon sizing automatically.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
        // First, try type-based detection (more accurate)
        const isIconByType = isIconComponentByType(node, context);

        // If type checking says it's not an icon, trust it
        if (isIconByType === false) {
          return;
        }

        // If type checking says it's an icon, or type checking isn't available,
        // fall back to name-based detection
        const isIcon = isIconByType === true || isIconComponentByName(node);

        if (!isIcon) {
          return;
        }

        // Check if it's inside a Button
        if (!isInsideButton(node, context)) {
          return;
        }

        // Check if it has a className attribute
        const classNameAttr = node.attributes.find(
          (attr): attr is TSESTree.JSXAttribute =>
            attr.type === AST_NODE_TYPES.JSXAttribute &&
            attr.name.type === AST_NODE_TYPES.JSXIdentifier &&
            attr.name.name === "className",
        );

        if (classNameAttr) {
          context.report({
            node: classNameAttr,
            messageId: "noClassName",
          });
        }
      },
    };
  },
});
