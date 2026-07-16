# @tractorbeam/oxlint-config

Shared Oxlint configuration for Tractorbeam projects.

## Install

```bash
pnpm add -D @tractorbeam/oxlint-config vite-plus
```

## Usage with Vite+

```typescript
import { defineConfig } from "vite-plus";

import oxlintConfig from "@tractorbeam/oxlint-config";

export default defineConfig({
  lint: oxlintConfig(),
});
```

React, React Performance, and JSX accessibility plugins and rules are enabled by default. Disable them for projects that do not use React:

```typescript
export default defineConfig({
  lint: oxlintConfig({ react: false }),
});
```

Compose repository-specific rules, ignores, and overrides in `vite.config.ts`:

```typescript
const lint = oxlintConfig();

export default defineConfig({
  lint: {
    ...lint,
    ignorePatterns: ["generated/**"],
    rules: {
      ...lint.rules,
      "no-console": "off",
    },
  },
});
```
