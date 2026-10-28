---
"@tractorbeam/typescript-config": minor
---

`strictest` drops `exactOptionalPropertyTypes` and `noPropertyAccessFromIndexSignature`, and adds `verbatimModuleSyntax` and `noUncheckedSideEffectImports`. Optional properties accept an explicit `undefined` again, and index-signature properties read with dot notation. Type-only imports must use `import type`, and a side-effect import must resolve.
