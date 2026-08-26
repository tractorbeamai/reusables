# @tractorbeam/oxlint-config

Shared Oxlint configuration for Tractorbeam projects.

The preset enables every rule from [anti-slop](https://github.com/dmmulroy/anti-slop) at error severity. The plugin is built from a pinned GitHub dependency and registered automatically; its source is not vendored into this repository.

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

The React preset also enables Tractorbeam's UI rules. These warn when a `Button` uses fixed Tailwind sizing utilities instead of its `size` prop, or when an icon nested inside a `Button` has its own `className`. Icon detection supports `*Icon` component names, `Icons.*` members, Lucide, and imports from packages or local modules whose specifier contains `icon`.

```typescript
export default defineConfig({
  lint: oxlintConfig({ react: false }),
});
```

The shared configuration enables type-aware linting and TypeScript checking. It also warns when a file exceeds 1,000 lines or a function exceeds 150 lines.

## Cyclomatic complexity

Cyclomatic complexity linting is opt-in. Enable the shared preset to warn when a function's classic McCabe complexity exceeds 15:

```typescript
export default defineConfig({
  lint: oxlintConfig({ complexity: true }),
});
```

Customize the maximum or use Oxlint's `modified` variant, which counts an entire `switch` statement as one complexity increment instead of counting each case:

```typescript
export default defineConfig({
  lint: oxlintConfig({
    complexity: { max: 10, variant: "modified" },
  }),
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
