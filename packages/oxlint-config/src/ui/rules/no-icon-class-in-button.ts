import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

function isButtonElement(node: ESTree.Node): node is ESTree.JSXElement {
  return (
    node.type === "JSXElement" &&
    node.openingElement.name.type === "JSXIdentifier" &&
    node.openingElement.name.name === "Button"
  );
}

function isInsideButton(node: ESTree.JSXOpeningElement): boolean {
  let ancestor: ESTree.Node | null = node.parent;
  while (ancestor !== null) {
    if (isButtonElement(ancestor)) return true;
    ancestor = ancestor.parent;
  }
  return false;
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

function isIconName(name: string): boolean {
  return name === "Icon" || name.endsWith("Icon");
}

function isIconModule(moduleSpecifier: string): boolean {
  return moduleSpecifier === "lucide-react" || moduleSpecifier.toLowerCase().includes("icon");
}

function isNamedIconComponent(
  name: ESTree.JSXElementName,
  iconImports: ReadonlySet<string>,
  iconNamespaces: ReadonlySet<string>,
): boolean {
  if (name.type === "JSXIdentifier") {
    return isIconName(name.name) || iconImports.has(name.name);
  }
  if (name.type !== "JSXMemberExpression") return false;

  if (isIconName(name.property.name)) return true;
  return (
    name.object.type === "JSXIdentifier" &&
    (name.object.name === "Icons" ||
      name.object.name === "Icon" ||
      iconNamespaces.has(name.object.name))
  );
}

/** Disallow icon-specific classes where Button owns icon sizing. */
export const noIconClassInButtonRule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow className on icon components nested inside Button.",
    },
    messages: {
      noClassName:
        "Avoid using className on icons inside <Button>. The Button component handles icon sizing automatically.",
    },
  },
  create(context) {
    const iconImports = new Set<string>();
    const iconNamespaces = new Set<string>();

    return {
      ImportDeclaration(node) {
        if (!isIconModule(node.source.value)) return;
        for (const specifier of node.specifiers) {
          if (specifier.type === "ImportNamespaceSpecifier") {
            iconNamespaces.add(specifier.local.name);
          } else {
            iconImports.add(specifier.local.name);
          }
        }
      },
      JSXOpeningElement(node) {
        if (!isNamedIconComponent(node.name, iconImports, iconNamespaces)) return;
        if (!isInsideButton(node)) return;
        const className = node.attributes.find(isClassNameAttribute);
        if (className !== undefined) context.report({ node: className, messageId: "noClassName" });
      },
    };
  },
});
