---
"@tractorbeam/typescript-config": minor
---

The `effect` preset configures two Effect language service settings that Oxlint's Effect rules read from the tsconfig:

- `brandedSchemaClasses` is `Class`, `Error`, and `Opaque`, so the service and `effecttsgo/schema-class-missing-brand` ask for a brand only on untagged Schema classes: a tagged class's or tagged error's literal `_tag` already keeps its type distinct.
- `namespaceImportPackages` is `effect`, so `effecttsgo/prefer-namespace-import` asks for `import * as Effect from "effect/Effect"` over named imports from the `"effect"` barrel, and auto-import writes that form.

Both take effect with `@effect/tsgo` 0.64 or later.
