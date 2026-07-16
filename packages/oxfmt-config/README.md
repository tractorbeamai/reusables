# @tractorbeam/oxfmt-config

Shared Oxfmt configuration for Tractorbeam projects.

## Install

```bash
pnpm add -D @tractorbeam/oxfmt-config vite-plus
```

## Usage with Vite+

```typescript
import { defineConfig } from "vite-plus";

import config from "@tractorbeam/oxfmt-config";

export default defineConfig({
  fmt: config,
});
```

Compose repository-specific options in `vite.config.ts`:

```typescript
export default defineConfig({
  fmt: {
    ...config,
    ignorePatterns: [...config.ignorePatterns, "generated/**"],
  },
});
```
