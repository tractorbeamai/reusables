# @tractorbeam/oxlint-config

Shared Oxlint configuration for Tractorbeam projects.

The preset enables a selected set of [anti-slop](https://github.com/dmmulroy/anti-slop) rules at error severity. The plugin is built from a pinned GitHub dependency and registered automatically; its source is not vendored into this repository.

## Install

```bash
pnpm add -D @tractorbeam/oxlint-config vite-plus
```

## Usage with Vite+

```typescript
import oxlintConfig from "@tractorbeam/oxlint-config";
import { defineConfig } from "vite-plus";

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

The shared configuration enables type-aware linting and TypeScript checking, and the stylistic rules described below.

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

Matching files receive Playwright's recommended rules plus stricter errors for unawaited Playwright calls (including locator methods), `nth()`-style positional locators, raw CSS or XPath locators, and `waitForTimeout`. The rules are applied through the returned `overrides`, so they never reach application source. Set Playwright's `settings` (for example, `globalAliases` for custom fixtures) in your own configuration.

## Effect

Effect linting is opt-in. Install `@effect/tsgo` and `oxlint-plugin-effect`, and turn it on:

```bash
pnpm add -D @effect/tsgo oxlint-plugin-effect
```

```typescript
export default defineConfig({
  lint: oxlintConfig({ effect: true }),
});
```

The option treats the codebase as Effect code. It enables `@effect/tsgo`'s `strict` preset, its `style`, `antipattern`, and `effect-native` presets as errors, and the rules of [oxlint-plugin-effect](https://github.com/cevr/effect-oxlint) that hold Effect's conventions, such as `effect/noSilentCatchAll`, `effect/noUnboundedConcurrency`, and `effect/requireNamedEffectFn`. The presets come from the `@effect/tsgo` your project installs, so a new release's rules arrive with it.

The effect-native preset holds every file to Effect's own services: `fetch`, `Date`, `console`, timers, `process.env`, `JSON`, `crypto.randomUUID`, Node built-ins, `async` functions, and native Array, Record, and String methods report in favor of `HttpClient`, `Clock`, `Logger`, `Config`, `effect/Array`, and the rest. All-Effect is the default because a codebase that mixes the two styles file by file drifts back to the native APIs one convenience at a time; exceptions name the code that can't follow it. `unicorn/no-array-sort` is off, since it mistakes `effect/Array`'s `sort`, which copies, for `Array#sort`, and `prefer-effect-array` already reports a native sort.

List code on another platform's terms in `except`: React and browser code, a published SDK whose API is plain TypeScript, or tool configuration that the tool loads and calls. Comment why each one is there:

```typescript
export default defineConfig({
  lint: oxlintConfig({
    effect: {
      except: [
        // The web app is React.
        "apps/web/**",
        // The SDK's API is plain TypeScript, for customers who don't use Effect.
        "packages/sdk/**",
        // Tool configuration, which the tool loads and calls.
        "**/*.config.ts",
      ],
    },
  }),
});
```

The effect-native rules are off in those files, except its `*-in-effect` rules: a native API inside Effect code, such as `fetch` in `Effect.gen`, is wrong wherever the code lives.

`antipattern` includes `effecttsgo/strict-effect-provide`, which reports providing a layer anywhere but an application's entry point, such as its `main`, its Worker, or a test that builds a runtime. Turn it off for your own entry points in an override:

```typescript
const lint = oxlintConfig({ effect: true });

export default defineConfig({
  lint: {
    ...lint,
    overrides: [
      ...lint.overrides,
      { files: ["src/main.ts"], rules: { "effecttsgo/strict-effect-provide": "off" } },
    ],
  },
});
```

A few of `@effect/tsgo`'s rules are off: `strict-boolean-expressions`, which TypeScript's narrowing covers; `missing-pipeable-signature`, since a data-last overload is for a library's pipeline API and most exported functions take every argument at once; and `unstable-api-usage`, so Effect's unstable modules, such as HttpApi and RPC, are fair to use. Shared rules that flag Effect's own idioms are relaxed: namespace imports, `_tag`, a schema and its type sharing a name, Effect's constructors called without `new`, and its combinators taking a `this`-like argument or a function reference.

Two rules read their settings from the tsconfig's `@effect/language-service` plugin entry, never from Oxlint's rule options, so extend `@tractorbeam/typescript-config/effect` in every tsconfig that covers Effect code. `effecttsgo/schema-class-missing-brand` then asks only untagged Schema classes for a brand; without the preset, tagged classes and errors are asked too. `effecttsgo/prefer-namespace-import` then asks for `import * as Effect from "effect/Effect"` over named imports from `"effect"`.

## Stylistic rules

Stylistic linting is on by default. It requires braces on every block (`curly: all`), so `if (done) return;` must be written as `if (done) { return; }`, and a blank line before and after multiline statements, declarations, and blocks.

Both rules are autofixable: repeat `vp check --fix`, which lints with fixes and then formats, until it passes, usually three runs. Braces on nested blocks are added one level per pass, and the formatter expands one-line `{ return; }` bodies, which the blank-line rule then pads. Without Vite+, alternate `oxlint --fix` and your formatter the same way.

Opt out with `stylistic: false`:

```typescript
export default defineConfig({
  lint: oxlintConfig({ stylistic: false }),
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
    overrides: [
      ...lint.overrides,
      { files: ["scripts/**"], rules: { "no-inline-comments": "off" } },
    ],
    rules: {
      ...lint.rules,
      "no-console": "off",
    },
  },
});
```
