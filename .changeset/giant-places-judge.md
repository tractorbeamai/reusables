---
"@tractorbeam/oxlint-config": minor
---

Add an opt-in `effect` option that lints Effect code. `oxlintConfig({ effect: true })` enables `@effect/tsgo`'s `strict` preset, its `style` and `antipattern` presets as errors, errors for native APIs such as `fetch`, `Date`, and `process.env` inside Effect code, and oxlint-plugin-effect's convention rules, and relaxes the shared rules that flag Effect's own idioms. Turn `antipattern`'s `effecttsgo/strict-effect-provide` off for your application's entry points. `effect: { native: { files } }` also applies the effect-native preset, as errors, to matching files. Install `@effect/tsgo` 0.64.1 or later and `oxlint-plugin-effect` 0.29.0 or later, now optional peer dependencies, and extend `@tractorbeam/typescript-config/effect` in every tsconfig that covers Effect code, which holds the settings `effecttsgo/schema-class-missing-brand` and `effecttsgo/prefer-namespace-import` read.
