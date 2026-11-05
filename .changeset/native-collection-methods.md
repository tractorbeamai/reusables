---
"@tractorbeam/oxlint-config": minor
---

Turn off `effecttsgo/prefer-effect-array`, `effecttsgo/prefer-effect-record`, and `effecttsgo/prefer-effect-string` in the `effect` option, so native Array, Object, and String methods no longer report. Use `effect/Array`, `effect/Record`, and `effect/String` for what the native methods lack; `effect/String`'s functions take their string last, so replacing each native call with one would turn it into a pipe. The rest of the effect-native preset stays errors.
