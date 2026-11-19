# @tractorbeam/oxlint-config

## 0.10.0

### Minor Changes

- 669fe0b: Export presets to combine with Oxlint's `extends`: `core`, `antiSlop`, `react` (with the UI rules), `stylistic`, `vitest`, and `effect()`, plus the `options` object that turns on type-aware linting and checking. Each preset brings its own plugins and rules and turns off the rules it clashes with. `playwright` and `effectNativeOff()` are rule sets to spread into an override whose `files` you choose. Set `options`, `plugins: []`, and any `ignorePatterns`, `env`, or `settings` in your own configuration, since `extends` doesn't carry them; the README shows how. `oxlintConfig(...)` still works, built from the presets.

  The presets also take on rules from Tractorbeam's applications, which `oxlintConfig(...)` now enables too:

  - `core` allows `== null`, and `while (true)` in `typescript/no-unnecessary-condition`; asks for one import per module with inline type imports (`import/no-duplicates`, `typescript/consistent-type-imports`) in place of `eslint/no-duplicate-imports`; and turns off `unicorn/number-literal-case`, `eslint/no-useless-return`, and `typescript/consistent-return`, which disagree with Oxfmt and `noImplicitReturns`.
  - `antiSlop` adds `no-array-filter-map`, `no-reflect-apply`, `no-reflect-get`, and `no-unknown-returns`, and turns off `typescript/consistent-indexed-object-style` and `unicorn/prefer-reflect-apply`.
  - `react` adds `ui/jsx-component-names`, `ui/no-module-jsx`, and `ui/no-hook-declarations`, as warnings.
  - `stylistic` allows an empty `case` directly above the next.
  - `effect()` adds `@effect/tsgo`'s `correctness` preset as errors, which brings `effecttsgo/any-unknown-in-error-context` and `effecttsgo/unsafe-effect-type-assertion`, and the `effect-style` plugin's `effect-names`, `no-yield-expression-member`, and `no-array-for-each`, which replaces `unicorn/no-array-for-each`, and in `**/*.test.{ts,tsx}` its `no-focused-effect-tests` and `no-disabled-effect-tests` and `effect/noEffectRunInTests`.
  - `vitest` is new: Vitest's rules in test files, with the rules that misread @effect/vitest or hold a matcher or layout preference off, and `vitest-style/no-in-source-tests` everywhere.

### Patch Changes

- 778ad2e: Update dependencies: depend on `@stylistic/eslint-plugin` 6.0.1, and build the bundled plugins against `@oxlint/plugins` 1.94.

## 0.9.0

### Minor Changes

- dd15aea: Turn off `no-warning-comments`, which the `pedantic` category enabled, so `TODO`, `FIXME`, and similar comments no longer report, even in a configuration that raises `pedantic` to errors.

### Patch Changes

- ef9d52c: Document running the `effect` option's type-aware rules on the Effect-patched tsrs

## 0.8.0

### Minor Changes

- 1c2854c: Turn off `effecttsgo/prefer-effect-array`, `effecttsgo/prefer-effect-record`, and `effecttsgo/prefer-effect-string` in the `effect` option, so native Array, Object, and String methods no longer report. Use `effect/Array`, `effect/Record`, and `effect/String` for what the native methods lack; `effect/String`'s functions take their string last, so replacing each native call with one would turn it into a pipe. The rest of the effect-native preset stays errors.

### Patch Changes

- 01f92a2: Type the returned configuration with the Oxlint types that Vite+ ships (`vite-plus/lint`), so `defineConfig({ lint: oxlintConfig() })` type-checks against the Oxlint version your Vite+ runs, even when another Oxlint version is installed.

## 0.7.0

### Minor Changes

- e53c5d6: Add an opt-in `effect` option that lints the codebase as Effect code. `oxlintConfig({ effect: true })` enables `@effect/tsgo`'s `strict` preset, its `style`, `antipattern`, and `effect-native` presets as errors, so native APIs such as `fetch`, `Date`, `process.env`, and native Array methods report in every file, and oxlint-plugin-effect's convention rules, and relaxes the shared rules that flag Effect's own idioms. `effect: { except: [globs] }` turns the effect-native rules off for code on another platform's terms, such as React, a published SDK's plain-TypeScript API, or tool configuration, while native APIs inside Effect code stay errors there. Turn `antipattern`'s `effecttsgo/strict-effect-provide` off for your application's entry points. Install `@effect/tsgo` 0.64.1 or later and `oxlint-plugin-effect` 0.29.0 or later, now optional peer dependencies, and extend `@tractorbeam/typescript-config/effect` in every tsconfig that covers Effect code, which holds the settings `effecttsgo/schema-class-missing-brand` and `effecttsgo/prefer-namespace-import` read.

## 0.6.0

### Minor Changes

- 247b3cd: Turn off `max-lines` and `max-lines-per-function`, including the defaults the `pedantic` category would otherwise apply, so the shared config no longer limits file or function length.
- 02a296f: Stylistic rules are now on by default: braces on every block (`curly: all`) and blank lines around multiline statements. Upgrade, then repeat `vp check --fix` until it passes, usually three runs: braces on nested blocks are added one level per pass, and the formatter expands one-line `{ return; }` bodies, which the blank-line rule then pads. Without Vite+, alternate `oxlint --fix` and your formatter the same way. Opt out with `oxlintConfig({ stylistic: false })`.

## 0.5.0

### Minor Changes

- 61a6cab: Add an opt-in cyclomatic complexity limit to the shared Oxlint config.
- 1c0d11e: Enable `no-nested-ternary` as an error in the default Oxlint configuration.
- 05ed169: Add an opt-in `playwright: { files }` option that applies Playwright's recommended rules and stricter locator, waiting, and assertion rules to matching test files, and an opt-in `stylistic` option that requires braces on every block and blank lines around multiline statements. Raise the default `max-lines-per-function` warning threshold from 150 to 300 lines.
- 79db427: Warn when page or route implementations live in `components/` directories, and when TanStack Router routes register a component that is not a named `*Route` or `Outlet`.

### Patch Changes

- 3d1f5e6: Update dependencies: build against `@oxlint/plugins` 1.87 and `eslint-plugin-playwright` 2.12.1, and bump `postcss` to 8.5.29.

## 0.4.0

### Minor Changes

- 69bec2d: Add Oxlint UI rules for Button sizing and nested icon classes.

## 0.3.0

### Minor Changes

- de467b7: Build the anti-slop Oxlint plugin from a pinned GitHub dependency and enable all of its rules in the shared preset.

## 0.2.0

### Minor Changes

- e8e34e6: Enable type-aware linting and checking, warn on files over 1,000 lines, and leave Markdown prose unwrapped by default.

## 0.1.0

### Minor Changes

- 97ef5b8: Publish configurable shared Tractorbeam Oxlint rules and plugin presets for Vite+ projects, with React support enabled by default.
