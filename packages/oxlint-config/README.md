# @tractorbeam/oxlint-config

Shared Oxlint configuration for Tractorbeam projects.

The `antiSlop` preset enables a selected set of [anti-slop](https://github.com/dmmulroy/anti-slop)'s generic rules at error severity. They come from the `quality` plugin of [`@nkzw/oxlint-config`](https://github.com/nkzw-tech/oxlint-config), which maintains them, and three that nkzw's plugin left out, `no-runtime-typeof`, `no-shape-in-symbol-names`, and `no-unknown-parameters`, come from [K-Mistele's fork](https://github.com/k-mistele/anti-slop) of anti-slop, pinned to a commit since it has no releases. The `anti-slop` plugin that holds them is bundled and registered automatically.

## Install

```bash
pnpm add -D @tractorbeam/oxlint-config vite-plus
```

## Usage with Vite+

The package exports presets that you combine with Oxlint's `extends`, one per concern:

| Preset | What it brings |
| --- | --- |
| `core` | The `correctness`, `suspicious`, and `perf` categories as errors and `pedantic` as warnings, the `import` and `promise` plugins, Landmines' `package-exports`, and the shared rules |
| `antiSlop` | A selected set of anti-slop's generic rules, as errors |
| `react` | React, React Performance, and JSX accessibility rules, Tractorbeam's UI rules, and React Doctor's rules in JSX files |
| `stylistic` | Braces on every block and blank lines around multiline statements |
| `vitest` | Vitest's and Landmines' rules in test files, and no in-source tests |
| `shadcn` | `@shadcn/lint`'s design-system rules, for a Tailwind v4 component library |
| `effect()` | `@effect/tsgo`'s and oxlint-plugin-effect's rules and Tractorbeam's Effect rules, for an Effect codebase |

Two more exports are rule sets for an override's `files`, not presets: `playwright`, Playwright's rules, and `effectNativeOff()`, which lifts Effect's native-API rules from code that isn't Effect.

```typescript
import { antiSlop, core, options, react, stylistic } from "@tractorbeam/oxlint-config";
import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    extends: [core, antiSlop, react, stylistic],
    options,
    plugins: [],
  },
});
```

Each preset brings the plugins, JS plugins, and rules it needs, and turns off the rules it clashes with. `antiSlop`, for example, turns off `typescript/consistent-indexed-object-style`, whose fix creates the `Record` aliases that `anti-slop/no-known-value-widening` reports, and `unicorn/prefer-reflect-apply`, which asks for the `Reflect.apply` that `anti-slop/no-reflect-apply` bans. Extend `core` first; a later preset's rules override an earlier one's, and your own `rules` and `overrides` override them all.

`extends` carries a preset's `plugins`, `jsPlugins`, `categories`, `rules`, and `overrides`, but not every field, so set these in your own configuration:

- `options`: Oxlint reads `typeAware` and `typeCheck` only from the root configuration. Set `options` to the exported `options`, which turns both on, or to your own. Type-aware linting runs on [tsrs](https://oxc.rs/blog/2026-11-17-faster-type-aware-linting-with-tsrs), which typechecks and lints in one TypeScript analysis, so `typeCheck` costs little on top of `typeAware`. Vite+ 1.7 and later bundle tsrs; with Oxlint alone, install `tsrs` next to it.
- `plugins: []`: Oxlint enables its default plugins, `typescript`, `unicorn`, and `oxc`, for a configuration without `plugins`, which would turn on their `pedantic` and `perf` rules. An empty list keeps the plugins to those the presets name.
- `ignorePatterns`, `env`, and `settings`: no preset sets them, and `extends` doesn't carry them.

The UI rules in `react` warn when a `Button` uses fixed Tailwind sizing utilities instead of its `size` prop, or when an icon nested inside a `Button` has its own `className`. Icon detection supports `*Icon` component names, `Icons.*` members, Lucide, and imports from packages or local modules whose specifier contains `icon`.

The UI rules also ask that a function returning JSX be a PascalCase component rendered as an element, not a lowercase helper or a `render*` function (`ui/jsx-component-names`); that JSX be created in the component that renders it, not in a module-level constant every render shares (`ui/no-module-jsx`); and that hooks be declared outside `components/` (`ui/no-hook-declarations`, whose `allow` option lists the hooks a component module may declare).

The UI rules also keep application entry points out of reusable component directories. They warn when a file under `components/` is named `page`, `route`, `*-page`, or `*-route`, or declares a function component named `*Page` or `*Route`; implement those screens in the router's route files instead. Files elsewhere, such as Next.js `app/**/page.tsx` or Playwright page objects, are unaffected. For TanStack Router, they warn when a route factory registers an inline or otherwise named `component`; register a named `*Route` component, or `Outlet` for a layout with nothing of its own.

`core` allows `TODO`, `FIXME`, and other warning comments, so a known gap can be marked in the code it affects. It also agrees with Oxfmt and with TypeScript's `noImplicitReturns`: `unicorn/number-literal-case`, `eslint/no-useless-return`, and `typescript/consistent-return` are off. It asks for one import per module, with types marked inline (`import/no-duplicates` with `preferInline`, `typescript/consistent-type-imports` with `inline-type-imports`), allows `== null` (`eqeqeq` with `null: "ignore"`), and allows `while (true)` (`typescript/no-unnecessary-condition` with `allowConstantLoopConditions`). Its `typescript/*` rules run only where your configuration enables the `typescript` plugin.

## Cyclomatic complexity

Cyclomatic complexity linting is opt-in. Set the maximum allowed complexity in your rules to enable it:

```typescript
export default defineConfig({
  lint: {
    extends: [core, antiSlop, stylistic],
    options,
    plugins: [],
    rules: { complexity: ["warn", 15] },
  },
});
```

## Playwright tests

Spread `playwright` into an override whose `files` match your Playwright tests:

```typescript
export default defineConfig({
  lint: {
    extends: [core, antiSlop, stylistic],
    options,
    plugins: [],
    overrides: [{ files: ["e2e/**/*.ts"], ...playwright }],
  },
});
```

Matching files receive Playwright's recommended rules plus stricter errors for unawaited Playwright calls (including locator methods), `nth()`-style positional locators, raw CSS or XPath locators, and `waitForTimeout`. The override loads the Playwright plugin itself, so its rules never reach application source. Set Playwright's `settings` (for example, `globalAliases` for custom fixtures) in your own configuration.

## Vitest

Extend `vitest` to lint test files, `**/*.{test,spec}.*`, with Oxlint's `vitest` plugin:

```typescript
export default defineConfig({
  lint: {
    extends: [core, antiSlop, stylistic, vitest],
    options,
    plugins: [],
  },
});
```

`vitest/valid-expect` allows a second argument, the message that labels an assertion's failure. Rules that misread @effect/vitest's `it.effect`, such as `no-standalone-expect`, are off, as are the hook, conditional-expect, and global-import rules and the matcher and layout preferences. In test files, two rules from [Landmines](https://github.com/interfere-inc/landmines) keep tests honest: `landmines-testing/no-test-doubles` reports module mocks, stubbed globals, and fake implementations, which replace the behavior a test should exercise, and `landmines-testing/no-flake-masking` reports test retries and raised timeouts. `landmines-testing/no-fixed-sleep` and `landmines-testing/no-unsignaled-poll` report a test that sleeps a fixed time or polls without a signal to wait on, and `landmines-testing/strict-msw` an MSW server that lets unhandled requests through. `landmines-structure/test-file-names` asks tests, fixtures, and test helpers to end in `.test.ts`, `.fixture.ts`, and `.test-utils.ts`; Landmines' `colocated-tests` is off, so tests may live in a package's own `test/` directory. `no-flake-masking` accepts a per-file allowlist with an exact count, `{ allow: { "test/live/slow.test.ts": 2 } }`, for adopting it in an existing codebase; a file with fewer violations than its allowance is reported too, so the list only shrinks. Everywhere else, `vitest-style/no-in-source-tests` reports `if (import.meta.vitest)` blocks: Vitest no longer collects them, so a test left in a module never runs.

## React

The `react` preset enables [React Doctor](https://github.com/millionco/react-doctor)'s recommended rules and its TanStack Query and Start rules as errors, without its copies of Oxlint's own `react` and `jsx-a11y` rules, which the preset runs natively, or `async-await-in-loop`, which `no-await-in-loop` covers. React Doctor runs single-threaded, so the preset gives its rules only to `**/*.{jsx,tsx}`. To check other React code, such as hooks in `.ts` files, add an override with the same rules:

```typescript
overrides: [{ files: ["packages/web/src/**/*.ts"], rules: react.overrides[0].rules }],
```

## shadcn

The `shadcn` preset enables [`@shadcn/lint`](https://github.com/shadcn-ui/lint)'s rules as [Ultracite](https://www.ultracite.ai/docs/provider/oxlint)'s preset does: `no-restyle`, `no-raw-colors`, `no-arbitrary-values`, `no-inline-styles`, `no-unknown-classes`, and `require-static-classes`, all as errors. `no-restyle` and `no-arbitrary-values` allow layout classes, so a page may place a component, as with `mt-4` or `w-full`, while its padding, colors, typography, and shape stay in its variants. In `**/components/ui/**`, where components style themselves, `no-restyle`, `no-arbitrary-values`, and `require-static-classes` are off. The plugin reads the components and theme from `components.json`, and works with any Tailwind v4 design system. Install it, and extend `shadcn`:

```bash
pnpm add -D @shadcn/lint
```

```typescript
import { antiSlop, core, options, react, shadcn, stylistic } from "@tractorbeam/oxlint-config";
import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    extends: [core, antiSlop, react, stylistic, shadcn],
    options,
    plugins: [],
    // Oxlint doesn't merge `settings` from extended configurations, so set the plugin's here.
    settings: { shadcn: { componentImports: ["^@acme/ui"] } },
    overrides: [
      {
        // A component library outside `components/ui` needs the same override.
        files: ["packages/ui/src/components/**"],
        rules: {
          "shadcn/no-arbitrary-values": "off",
          "shadcn/no-restyle": "off",
          "shadcn/require-static-classes": "off",
        },
      },
    ],
  },
});
```

## Effect

Install `@effect/tsgo`, `oxlint-plugin-effect`, `tsrs`, and `oxlint-tsgolint`, and extend `effect()` after `core`. It's a function because it reads its rules from `@effect/tsgo` and `oxlint-plugin-effect` when called; nothing loads them otherwise, so projects without Effect don't install them:

```bash
pnpm add -D @effect/tsgo oxlint-plugin-effect tsrs oxlint-tsgolint
```

```typescript
import { antiSlop, core, effect, options, stylistic } from "@tractorbeam/oxlint-config";

export default defineConfig({
  lint: {
    extends: [core, antiSlop, stylistic, effect()],
    options,
    plugins: [],
  },
});
```

The Effect rules run inside Oxlint's type-aware linter, so Oxlint and tsrs need the Effect-patched builds that `@effect/tsgo` ships. Patch them on install, and run Vite+ through `effect-tsgo --tsrs-lint`, since `vp` otherwise starts its own unpatched type-aware backend: its bundled tsrs from Vite+ 1.7, tsgolint before that:

```json
{
  "scripts": {
    "prepare": "effect-tsgo patch --oxlint --tsrs",
    "check": "effect-tsgo --tsrs-lint vp check"
  }
}
```

`effect-tsgo patch --oxlint` requires `oxlint-tsgolint` installed, though the rules run on tsrs. Oxlint run directly, outside Vite+, finds the patched `tsrs-lint` itself. Use the patched `tsrs --lsp` as the editor's TypeScript language server, so it reports the Effect diagnostics and quick fixes too. Check `@effect/tsgo`'s README for the tsrs and Oxlint versions each release supports.

The preset treats the codebase as Effect code. It enables `@effect/tsgo`'s `strict` preset, its `correctness`, `style`, `antipattern`, and `effect-native` presets as errors, and the rules of [oxlint-plugin-effect](https://github.com/cevr/effect-oxlint) that hold Effect's conventions, such as `effect/noSilentCatchAll`, `effect/noUnboundedConcurrency`, and `effect/requireNamedEffectFn`. The presets come from the `@effect/tsgo` your project installs, so a new release's rules arrive with it.

The effect-native preset holds every file to Effect's own services: `fetch`, `Date`, `console`, timers, `process.env`, `JSON`, `crypto.randomUUID`, Node built-ins, and `async` functions report in favor of `HttpClient`, `Clock`, `Logger`, `Config`, and the rest. All-Effect is the default because a codebase that mixes the two styles file by file drifts back to the native APIs one convenience at a time; exceptions name the code that can't follow it.

The preset's `prefer-effect-array`, `prefer-effect-record`, and `prefer-effect-string` are off. Native Array, Object, and String methods are house style; `effect/Array`, `effect/Record`, and `effect/String` are for what the native methods lack. `effect/String`'s functions also take their string last, so each native call would become a pipe. `unicorn/no-array-sort` is off too, since it mistakes `effect/Array`'s `sort`, which copies, for `Array#sort`.

Turn the effect-native rules off for code on another platform's terms with an override whose `rules` are `effectNativeOff()`: React and browser code, a published SDK whose API is plain TypeScript, or tool configuration that the tool loads and calls. Comment why each glob is there:

```typescript
import {
  antiSlop,
  core,
  effect,
  effectNativeOff,
  options,
  stylistic,
} from "@tractorbeam/oxlint-config";

export default defineConfig({
  lint: {
    extends: [core, antiSlop, stylistic, effect()],
    options,
    plugins: [],
    overrides: [
      {
        files: [
          // The web app is React.
          "apps/web/**",
          // The SDK's API is plain TypeScript, for customers who don't use Effect.
          "packages/sdk/**",
          // Tool configuration, which the tool loads and calls.
          "**/*.config.ts",
        ],
        rules: effectNativeOff(),
      },
    ],
  },
});
```

`effectNativeOff()` keeps the preset's `*-in-effect` rules: a native API inside Effect code, such as `fetch` in `Effect.gen`, is wrong wherever the code lives.

`antipattern` includes `effecttsgo/strict-effect-provide`, which reports providing a layer anywhere but an application's entry point, such as its `main`, its Worker, or a test that builds a runtime. Turn it off for your own entry points in an override:

```typescript
export default defineConfig({
  lint: {
    extends: [core, antiSlop, stylistic, effect()],
    options,
    plugins: [],
    overrides: [{ files: ["src/main.ts"], rules: { "effecttsgo/strict-effect-provide": "off" } }],
  },
});
```

The preset adds Tractorbeam's Effect rules. `effect-style/effect-names` names services and layers as Effect's own examples do: a service in PascalCase, a service's layers `layer` or `layerTest`, and other layers in PascalCase, as `ObservabilityLayer`. `effect-style/no-yield-expression-member` asks for `(yield* stage).console` to bind the yielded value first, as unicorn's `no-await-expression-member` does for `await`. `effect-style/no-array-for-each` replaces `unicorn/no-array-for-each`, which also reports `Effect.forEach`. The `anti-slop-effect` plugin holds [anti-slop](https://github.com/dmmulroy/anti-slop)'s Effect rules, vendored since neither anti-slop nor its fork exports them. Five come from anti-slop's Effect group: `anti-slop-effect/no-manual-effect-error-tag` asks for `Effect.catchTag` over branching on `_tag` inside `Effect.catch`, `anti-slop-effect/no-manual-tag-comparison` asks for `Match` or `Predicate.isTagged` over comparing or switching on `_tag`, `anti-slop-effect/no-manual-tagged-construction` asks for a tagged value's constructor over an object literal with a `_tag`, `anti-slop-effect/no-service-constructor-imports` keeps a service's project-local `make*` constructor out of runtime imports, and `anti-slop-effect/prefer-effect-match` asks for `Match` over a chained ternary of literals compared to one value. Two more come from [K-Mistele's fork](https://github.com/k-mistele/anti-slop) of anti-slop: `anti-slop-effect/require-cause-when-narrowing` asks a `mapError` or `catch` handler that builds a new error to keep the original as its `cause`, and `anti-slop-effect/throw-in-effect-gen` reports a `throw` in an `Effect.gen` or `Effect.fn` generator, where it becomes a defect instead of a typed failure. In `**/*.test.{ts,tsx}`, `effect-style/no-focused-effect-tests` and `effect-style/no-disabled-effect-tests` report `.only` and `.skip` on `it.effect` and `it.live`, which Oxlint's Vitest rules don't see, and `effect/noEffectRunInTests` asks for `it.effect` over `Effect.run*`.

A few of `@effect/tsgo`'s rules are off: `strict-boolean-expressions`, which TypeScript's narrowing covers; `missing-pipeable-signature`, since a data-last overload is for a library's pipeline API and most exported functions take every argument at once; and `unstable-api-usage`, so Effect's unstable modules, such as HttpApi and RPC, are fair to use. The preset relaxes the shared rules that flag Effect's own idioms: namespace imports, `_tag`, a schema and its type sharing a name, Effect's constructors called without `new`, and its combinators taking a `this`-like argument or a function reference.

Two rules read their settings from the tsconfig's `@effect/language-service` plugin entry, never from Oxlint's rule options, so extend `@tractorbeam/typescript-config/effect` in every tsconfig that covers Effect code. `effecttsgo/schema-class-missing-brand` then asks only untagged Schema classes for a brand; without the preset, tagged classes and errors are asked too. `effecttsgo/prefer-namespace-import` then asks for `import * as Effect from "effect/Effect"` over named imports from `"effect"`.

## Stylistic rules

`stylistic` requires braces on every block (`curly: all`), so `if (done) return;` must be written as `if (done) { return; }`, and a blank line before and after multiline statements, declarations, and blocks. Cases that share a body stay together: the blank-line rule allows an empty `case` directly above the next, where a blank line is what `no-fallthrough` reports.

Both rules are autofixable: repeat `vp check --fix`, which lints with fixes and then formats, until it passes, usually three runs. Braces on nested blocks are added one level per pass, and the formatter expands one-line `{ return; }` bodies, which the blank-line rule then pads. Without Vite+, alternate `oxlint --fix` and your formatter the same way.

## Repository configuration

Set repository-specific rules, ignores, and overrides next to `extends`:

```typescript
export default defineConfig({
  lint: {
    extends: [core, antiSlop, react, stylistic],
    ignorePatterns: ["generated/**"],
    options,
    overrides: [{ files: ["scripts/**"], rules: { "no-inline-comments": "off" } }],
    plugins: [],
    rules: { "no-console": "off" },
  },
});
```

## `oxlintConfig`

The default export, `oxlintConfig(options)`, merges the presets into one configuration whose fields you spread into your own. It takes `complexity`, `effect` (`true`, or `{ except }`, the globs that get `effectNativeOff()`), `playwright` (`{ files }`, the globs that get the Playwright rules), `react` (on by default), and `stylistic` (on by default), and sets `options` to type-aware linting and checking. It has no Vitest option; extend `vitest` for that. Spread its fields into your own configuration:

```typescript
import oxlintConfig from "@tractorbeam/oxlint-config";

const lint = oxlintConfig({ react: false, complexity: 15 });

export default defineConfig({
  lint: {
    ...lint,
    ignorePatterns: ["generated/**"],
    overrides: [
      ...lint.overrides,
      { files: ["scripts/**"], rules: { "no-inline-comments": "off" } },
    ],
    rules: { ...lint.rules, "no-console": "off" },
  },
});
```

Prefer `extends`: it carries every field a preset sets, where spreading drops any field you don't copy.
