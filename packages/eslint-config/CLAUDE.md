# ESLint Config Development

## Creating Custom Rules

### Use `@typescript-eslint/utils` instead of `eslint` types

The `@types/eslint` types don't recognize typescript-eslint nodes. Always import from `@typescript-eslint/utils`:

```typescript
// ✅ Correct
import { AST_NODE_TYPES, ESLintUtils, TSESTree } from "@typescript-eslint/utils";

// ❌ Avoid - types don't support TS nodes properly
import type { Rule } from "eslint";
```

### Use `RuleCreator.withoutDocs` for rules without documentation URLs

```typescript
const createRule = ESLintUtils.RuleCreator.withoutDocs;

export const myRule = createRule({
  meta: { /* ... */ },
  defaultOptions: [],  // Required even if empty
  create(context) { /* ... */ },
});
```

### Type casting when registering rules in flat config

The `@typescript-eslint/utils` `RuleModule` type doesn't match ESLint's flat config plugin type. Cast when registering:

```typescript
import type { Rule } from "eslint";

plugins: {
  ui: {
    rules: {
      // Cast required: @typescript-eslint/utils RuleModule has stricter types
      "my-rule": myRule as unknown as Rule.RuleModule,
    },
  },
},
```

### JSXMemberExpression property is always JSXIdentifier

When checking `JSXMemberExpression`, the `property` field is always `JSXIdentifier`. Don't check its type or ESLint will error with "unnecessary conditional":

```typescript
// ✅ Correct
if (node.name.type === AST_NODE_TYPES.JSXMemberExpression) {
  const { object, property } = node.name;
  if (object.type === AST_NODE_TYPES.JSXIdentifier) {
    // property is always JSXIdentifier, no need to check
    return property.name.endsWith("Icon");
  }
}

// ❌ Will cause ESLint error
if (object.type === AST_NODE_TYPES.JSXIdentifier &&
    property.type === AST_NODE_TYPES.JSXIdentifier) { // unnecessary
```

## Type-Aware Rules

### Accessing TypeScript type checker

```typescript
import * as ts from "typescript";

create(context) {
  // Second param `true` makes it return undefined instead of throwing if unavailable
  const services = ESLintUtils.getParserServices(context, true);

  if (!services.program) {
    return undefined; // Type info not available, fall back to other detection
  }

  const checker = services.program.getTypeChecker();
  const type = services.getTypeAtLocation(node);
  const typeName = checker.typeToString(type);
}
```

### `requiresTypeChecking` metadata is not recognized

Don't add `requiresTypeChecking: true` to `meta.docs` - it will cause a TypeScript error. Just document it in the description:

```typescript
meta: {
  docs: {
    description: "My rule (uses type info when available)",  // Document here instead
  },
}
```

## Directory Structure

Configs use directory-based organization to support multiple files per config:

```
src/
├── index.ts              # Re-exports all configs
├── base/index.ts
├── typescript/index.ts
├── react/index.ts
└── ui/
    ├── index.ts          # Config definition, imports rules
    └── rules/
        ├── no-button-height-class.ts
        └── no-icon-class-in-button.ts
```

## Regex Patterns for Tailwind Classes

Use negative lookahead to exclude specific values:

```typescript
// Match w-* except w-full
const WIDTH_PATTERN = /\bw-(?!full\b)(\d+|\[.+?\]|\d+\/\d+)/;

// Match multiple exceptions
const MAX_HEIGHT_PATTERN = /\bmax-h-(?!full\b|none\b)(\d+|\[.+?\]|\d+\/\d+)/;
```

Pattern components:
- `\b` - word boundary
- `(?!full\b)` - negative lookahead, exclude "full"
- `\d+` - numeric values (h-10)
- `\[.+?\]` - arbitrary values (h-[100px])
- `\d+\/\d+` - fractions (h-1/2)
