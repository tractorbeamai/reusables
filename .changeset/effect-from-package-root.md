---
"@tractorbeam/oxlint-config": minor
---

Export the Effect preset from the package root again, as functions: `import { effect, effectNativeOff } from "@tractorbeam/oxlint-config"`, then `extends: [core, …, effect()]` and `{ files, rules: effectNativeOff() }` in an override. They read `@effect/tsgo` and `oxlint-plugin-effect` only when called, so a project without Effect still never loads them. The `@tractorbeam/oxlint-config/effect` subpath is gone; to migrate, import both from the package root and call them. `oxlintConfig({ effect })` is unchanged.
