---
"@tractorbeam/oxlint-config": minor
---

Export presets to combine with Oxlint's `extends`: `core`, `antiSlop`, `react` (with the UI rules), `stylistic`, `vitest`, and `effect()`, plus the `options` object that turns on type-aware linting and checking. Each preset brings its own plugins and rules and turns off the rules it clashes with. `playwright` and `effectNativeOff()` are rule sets to spread into an override whose `files` you choose. Set `options`, `plugins: []`, and any `ignorePatterns`, `env`, or `settings` in your own configuration, since `extends` doesn't carry them; the README shows how. `oxlintConfig(...)` still works, built from the presets.

The presets also take on rules from Tractorbeam's applications, which `oxlintConfig(...)` now enables too:

- `core` allows `== null`, and `while (true)` in `typescript/no-unnecessary-condition`; asks for one import per module with inline type imports (`import/no-duplicates`, `typescript/consistent-type-imports`) in place of `eslint/no-duplicate-imports`; and turns off `unicorn/number-literal-case`, `eslint/no-useless-return`, and `typescript/consistent-return`, which disagree with Oxfmt and `noImplicitReturns`.
- `antiSlop` adds `no-array-filter-map`, `no-reflect-apply`, `no-reflect-get`, and `no-unknown-returns`, and turns off `typescript/consistent-indexed-object-style` and `unicorn/prefer-reflect-apply`.
- `react` adds `ui/jsx-component-names`, `ui/no-module-jsx`, and `ui/no-hook-declarations`, as warnings.
- `stylistic` allows an empty `case` directly above the next.
- `effect()` adds the `effect-style` plugin's `effect-names`, `no-yield-expression-member`, and `no-array-for-each`, which replaces `unicorn/no-array-for-each`, and in `**/*.test.{ts,tsx}` its `no-focused-effect-tests` and `no-disabled-effect-tests` and `effect/noEffectRunInTests`.
- `vitest` is new: Vitest's rules in test files, with the rules that misread @effect/vitest or hold a matcher or layout preference off, and `vitest-style/no-in-source-tests` everywhere.
