---
name: setup-tractorbeam
description: Add @tractorbeam shared configs (eslint, prettier, typescript) to a project. Use when setting up linting, formatting, or TypeScript configuration for a new or existing repo.
---

# Setup Tractorbeam Shared Configs

Add `@tractorbeam/eslint-config`, `@tractorbeam/prettier-config`, and `@tractorbeam/typescript-config` to a project.

## Setup Process

### 1. Detect Project Context

First, understand the project:

```bash
# Check package manager
ls package-lock.json pnpm-lock.yaml yarn.lock bun.lock 2>/dev/null

# Check for monorepo
ls pnpm-workspace.yaml turbo.json lerna.json 2>/dev/null

# Check existing configs
ls eslint.config.* .eslintrc* prettier.config.* .prettierrc* tsconfig*.json 2>/dev/null
```

### 2. Install Dependencies

Use the detected package manager (default to pnpm):

```bash
# All packages
pnpm add -D @tractorbeam/eslint-config @tractorbeam/prettier-config @tractorbeam/typescript-config

# Required peer dependencies
pnpm add -D eslint typescript-eslint prettier typescript

# For eslint.config.ts (TypeScript config file)
pnpm add -D jiti
```

### 3. Create Config Files

#### ESLint (`eslint.config.ts`)

Determine which configs to include based on the project:

```typescript
// eslint.config.ts
import { defineConfig } from "eslint/config";

import { base, typescript } from "@tractorbeam/eslint-config";

export default defineConfig([base, typescript]);
```

**With React:**
```typescript
import { defineConfig } from "eslint/config";

import { base, react, typescript } from "@tractorbeam/eslint-config";

export default defineConfig([base, typescript, react]);
```

**With TanStack Router:**
```typescript
import { defineConfig } from "eslint/config";

import { base, react, tanstackRouter, typescript } from "@tractorbeam/eslint-config";

export default defineConfig([base, typescript, react, tanstackRouter]);
```

**With Playwright tests:**
```typescript
import { defineConfig } from "eslint/config";

import { base, playwright, typescript } from "@tractorbeam/eslint-config";

export default defineConfig([
  base,
  typescript,
  { files: ["**/e2e/**/*.ts", "**/tests/**/*.ts"], extends: [playwright] },
]);
```

**With ignores (common patterns):**
```typescript
import { includeIgnoreFile } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";

import { base, typescript } from "@tractorbeam/eslint-config";

export default defineConfig([
  base,
  typescript,
  includeIgnoreFile(".gitignore"),
  globalIgnores(["dist/**", "*.gen.ts"]),
]);
```

#### Prettier (`prettier.config.js`)

```javascript
// prettier.config.js
import config from "@tractorbeam/prettier-config";

export default config;
```

Or in `package.json`:
```json
{
  "prettier": "@tractorbeam/prettier-config"
}
```

#### TypeScript (`tsconfig.json`)

Choose the appropriate preset:

| Preset | Use Case |
|--------|----------|
| `node.json` | Node.js projects (general) |
| `node22.json` | Node.js 22+ projects |
| `react.json` | React applications |
| `next.json` | Next.js applications |
| `tanstack-start.json` | TanStack Start applications |
| `vite.json` | Vite-based projects |
| `strictest.json` | Maximum type safety |

```json
{
  "extends": "@tractorbeam/typescript-config/node22.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**For React/Vite:**
```json
{
  "extends": "@tractorbeam/typescript-config/vite.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### 4. Add Scripts to package.json

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit"
  }
}
```

### 5. Clean Up Old Configs

Remove replaced config files:
- `.eslintrc`, `.eslintrc.js`, `.eslintrc.json`, `.eslintrc.yml`
- Old eslint plugins that are now included (covered by the shared config)
- `.prettierrc`, `.prettierrc.js`, `.prettierrc.json`, `.prettierrc.yml` (if using package.json approach)

## Monorepo Considerations

For monorepos, configs typically go in the root:

```
monorepo/
├── eslint.config.ts      # Root ESLint config
├── prettier.config.js    # Root Prettier config
├── tsconfig.json         # Base tsconfig (if needed)
├── packages/
│   ├── app/
│   │   └── tsconfig.json # Extends root or preset directly
│   └── lib/
│       └── tsconfig.json
```

Each package's `tsconfig.json` can extend the preset directly:
```json
{
  "extends": "@tractorbeam/typescript-config/node22.json"
}
```

## Edge Cases

### Mixed JS/TS Codebase
Disable type checking for JS files:
```typescript
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

import { base, typescript } from "@tractorbeam/eslint-config";

export default defineConfig([
  base,
  typescript,
  { files: ["**/*.js"], extends: [tseslint.configs.disableTypeChecked] },
]);
```

### Custom Rule Overrides
Add rules after extending:
```typescript
export default defineConfig([
  base,
  typescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
```

### Node.js Globals
Add the `node` config for Node.js projects:
```typescript
import { base, node, typescript } from "@tractorbeam/eslint-config";

export default defineConfig([base, typescript, node]);
```
