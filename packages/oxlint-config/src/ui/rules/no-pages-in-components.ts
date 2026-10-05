import { defineRule } from "@oxlint/plugins";

import type { ESTree } from "@oxlint/plugins";

const COMPONENTS_DIRECTORY_PATTERN = /(?:^|\/)components\//u;
const ENTRY_FILENAME_PATTERN = /(?:^|\/)(?:[^/]+-)?(?:page|route)\.[cm]?[jt]sx?$/u;
const ENTRY_NAME_PATTERN = /^[A-Z]\w*(?:Page|Route)$/u;

function isEntryName(node: ESTree.BindingPattern | ESTree.BindingIdentifier | null): boolean {
  return node?.type === "Identifier" && ENTRY_NAME_PATTERN.test(node.name);
}

/** Keep page and route entry points out of reusable component directories. */
export const noPagesInComponentsRule = defineRule({
  meta: {
    type: "suggestion",
    docs: {
      description: "Keep page and route implementations out of components/ directories.",
    },
    messages: {
      entryInComponents:
        "Implement pages and routes with the router's route files. Keep components/ for independently reusable UI.",
    },
  },
  create(context) {
    const filename = context.filename.replaceAll("\\", "/");
    if (!COMPONENTS_DIRECTORY_PATTERN.test(filename)) return {};

    return {
      Program(node) {
        if (ENTRY_FILENAME_PATTERN.test(filename)) {
          context.report({ node, messageId: "entryInComponents" });
        }
      },
      FunctionDeclaration(node) {
        if (node.id !== null && isEntryName(node.id)) {
          context.report({ node: node.id, messageId: "entryInComponents" });
        }
      },
      VariableDeclarator(node) {
        const isFunction =
          node.init?.type === "ArrowFunctionExpression" || node.init?.type === "FunctionExpression";
        if (isFunction && isEntryName(node.id)) {
          context.report({ node: node.id, messageId: "entryInComponents" });
        }
      },
    };
  },
});
