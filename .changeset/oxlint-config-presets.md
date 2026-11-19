---
"@tractorbeam/oxlint-config": minor
---

Export presets to combine with Oxlint's `extends`: `core`, `antiSlop`, `react` (with the UI rules), `stylistic`, `playwright({ files })`, and `effect()`, plus the `options` object that turns on type-aware linting and checking, and `effectNativeOff()`, the rule map an override puts on code that isn't Effect. Each preset brings its own plugins and rules and turns off the rules it clashes with: `antiSlop` turns off `typescript/consistent-indexed-object-style` and `unicorn/prefer-reflect-apply`, and `effect` turns off the shared rules that misread Effect's idioms. Set `options`, `plugins: []`, and any `ignorePatterns`, `env`, or `settings` in your own configuration, since `extends` doesn't carry them; the README shows how. `oxlintConfig(...)` still works and returns the same configuration, built from the presets.
