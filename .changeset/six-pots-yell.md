---
"@tractorbeam/typescript-config": minor
---

The `effect` preset sets the Effect language service's `brandedSchemaClasses` to `Class`, `Error`, and `Opaque`, so the service and Oxlint's `effecttsgo/schema-class-missing-brand` ask for a brand only on untagged Schema classes: a tagged class's or tagged error's literal `_tag` already keeps its type distinct. The setting takes effect with `@effect/tsgo` 0.64 or later.
