# @tractorbeam/oxlint-config

Shared Oxlint configuration for Tractorbeam projects.

## Install

```bash
pnpm add -D @tractorbeam/oxlint-config vite-plus
```

## Usage with Vite+

```typescript
import { defineConfig } from "vite-plus";

import config from "@tractorbeam/oxlint-config";

export default defineConfig({
  lint: config,
});
```

Compose repository-specific rules, ignores, and overrides in `vite.config.ts`:

```typescript
export default defineConfig({
  lint: {
    ...config,
    ignorePatterns: ["generated/**"],
    rules: {
      ...config.rules,
      "no-console": "off",
    },
  },
});
```
