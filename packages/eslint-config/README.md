# @tractorbeam/eslint-config

> [!WARNING]
> **Deprecated.** This package receives no further updates. Lint with [Oxlint](https://oxc.rs/docs/guide/usage/linter) using [`@tractorbeam/oxlint-config`](https://www.npmjs.com/package/@tractorbeam/oxlint-config) instead, and format with [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) using [`@tractorbeam/oxfmt-config`](https://www.npmjs.com/package/@tractorbeam/oxfmt-config).

Shared ESLint configuration for Tractorbeam projects using modern flat config format.

## Installation

```bash
pnpm add -D @tractorbeam/eslint-config eslint typescript-eslint
```

## TypeScript config files (`eslint.config.ts`)

If you use an `eslint.config.ts` file under Node.js, ESLint requires the optional dev dependency `jiti` (v2+):

```bash
pnpm add -D jiti
```

## Quick Start

In `eslint.config.ts`:

```typescript
import { base, react, typescript } from "@tractorbeam/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([base, typescript, react]);
```

## Available Configs

| Config              | Description                              | File Patterns                   |
| ------------------- | ---------------------------------------- | ------------------------------- |
| `base`              | ESLint recommended rules                 | All files                       |
| `typescript`        | TypeScript, unicorn, regexp, import-lite | `**/*.ts`, `**/*.tsx`           |
| `react`             | React, hooks, a11y, react-compiler       | `**/*.tsx`, `**/*.jsx`          |
| `tanstackRouter`    | TanStack Router plugin                   | `**/*.tsx`, `**/*.jsx`          |
| `node`              | Node.js globals                          | All files                       |
| `cloudflareWorkers` | Cloudflare Workers globals               | All files                       |
| `playwright`        | Playwright testing rules                 | No default (use with `extends`) |

## Customization

### Disabling Type Checking for JS Files

If you have JavaScript files alongside TypeScript, disable type checking for them:

```typescript
import { base, typescript } from "@tractorbeam/eslint-config";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  base,
  typescript,
  { files: ["**/*.js"], extends: [tseslint.configs.disableTypeChecked] },
]);
```

### Custom File Patterns

Use `extends` to apply configs to specific file patterns:

```typescript
import { base, playwright, typescript } from "@tractorbeam/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([base, eslint, { files: ["**/e2e/**/*.ts"], extends: [playwright] }]);
```

### Overriding Rules

Override any rules by adding them after `extends`:

```typescript
import { base, react, typescript } from "@tractorbeam/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
  base,
  typescript,
  {
    extends: [react],
    rules: {
      "react-hooks/exhaustive-deps": "error",
    },
  },
]);
```

### Adding Ignores

Use ESLint's built-in ignore utilities:

```typescript
import { includeIgnoreFile } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";

import { base, typescript } from "@tractorbeam/eslint-config";

export default defineConfig([
  base,
typescript
  includeIgnoreFile(".gitignore"),
  globalIgnores(["dist/**", "*.gen.ts"]),
]);
```

## Peer Dependencies

- `eslint >= 9`
- `typescript-eslint >= 8`
