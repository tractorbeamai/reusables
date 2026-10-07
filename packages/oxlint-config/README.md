# @tractorbeam/oxlint-config

Shared Oxlint configuration for Tractorbeam projects.

The preset enables a selected set of [anti-slop](https://github.com/dmmulroy/anti-slop) rules at error severity. The plugin is built from a pinned GitHub dependency and registered automatically; its source is not vendored into this repository.

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

React, React Performance, and JSX accessibility plugins and rules are enabled by default.

The React preset also enables Tractorbeam's UI rules. These warn when a `Button` uses fixed Tailwind sizing utilities instead of its `size` prop, or when an icon nested inside a `Button` has its own `className`. Icon detection supports `*Icon` component names, `Icons.*` members, Lucide, and imports from packages or local modules whose specifier contains `icon`.

The UI rules also keep application entry points out of reusable component directories. They warn when a file under `components/` is named `page`, `route`, `*-page`, or `*-route`, or declares a function component named `*Page` or `*Route`; implement those screens in the router's route files instead. Files elsewhere, such as Next.js `app/**/page.tsx` or Playwright page objects, are unaffected. For TanStack Router, they warn when a route factory registers an inline or otherwise named `component`; register a named `*Route` component, or `Outlet` for a layout with nothing of its own.

Disable React linting for projects that do not use React:

```typescript
export default defineConfig({
  lint: oxlintConfig({ react: false }),
});
```

The shared configuration enables type-aware linting and TypeScript checking. It also warns when a file exceeds 1,000 lines or a function exceeds 300 lines.

## Cyclomatic complexity

Cyclomatic complexity linting is opt-in. Set the maximum allowed complexity to enable it:

```typescript
export default defineConfig({
  lint: oxlintConfig({ complexity: 15 }),
});
```

## Playwright tests

Playwright linting is opt-in. Pass the globs that match your Playwright tests, written the same way as an Oxlint override's `files`:

```typescript
export default defineConfig({
  lint: oxlintConfig({ playwright: { files: ["e2e/**/*.ts"] } }),
});
```

Matching files receive Playwright's recommended rules plus stricter errors for unawaited Playwright calls (including locator methods), `nth()`-style positional locators, raw CSS or XPath locators, `waitForTimeout`, and non-retrying assertions. The rules are applied through the returned `overrides`, so they never reach application source. Set Playwright's `settings` (for example, `globalAliases` for custom fixtures) in your own configuration.

## Stylistic rules

Stylistic linting is opt-in. It requires braces on every block (`curly: all`) and a blank line before and after multiline statements, declarations, and blocks:

```typescript
export default defineConfig({
  lint: oxlintConfig({ stylistic: true }),
});
```

## Repository configuration

Compose repository-specific rules, ignores, and overrides in `vite.config.ts`. Spread the returned `overrides` before your own so opt-in presets keep applying:

```typescript
const lint = oxlintConfig();

export default defineConfig({
  lint: {
    ...lint,
    ignorePatterns: ["generated/**"],
    overrides: [...lint.overrides, { files: ["scripts/**"], rules: { "max-lines": "off" } }],
    rules: {
      ...lint.rules,
      "no-console": "off",
    },
  },
});
```
