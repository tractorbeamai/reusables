---
"@tractorbeam/oxlint-config": minor
---

Export the Effect preset from its own subpath, as a constant like the other presets: `import { effect, effectNativeOff } from "@tractorbeam/oxlint-config/effect"`, then `extends: [core, …, effect]` and `{ files, rules: effectNativeOff }` in an override. The package root no longer exports `effect()` or `effectNativeOff()`, so a project without Effect never loads `@effect/tsgo` or `oxlint-plugin-effect`. To migrate, import both from the subpath and drop the call parentheses. `oxlintConfig({ effect })` is unchanged.
