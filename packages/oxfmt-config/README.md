# @tractorbeam/oxfmt-config

Shared Oxfmt configuration for Tractorbeam projects.

## Install

```bash
pnpm add -D @tractorbeam/oxfmt-config vite-plus
```

## Usage with Vite+

```typescript
import config from "@tractorbeam/oxfmt-config";
import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: config,
});
```

The shared configuration sorts imports and Tailwind CSS classes, including those passed to `clsx`, `cn`, `cva`, and `tw`, and leaves Markdown and MDX prose unwrapped.

Compose repository-specific options in `vite.config.ts`:

```typescript
export default defineConfig({
  fmt: {
    ...config,
    ignorePatterns: [...config.ignorePatterns, "generated/**"],
  },
});
```
