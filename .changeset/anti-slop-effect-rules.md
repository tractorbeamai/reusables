---
"@tractorbeam/oxlint-config": minor
---

Add an `anti-slop-effect` plugin with anti-slop's Effect rules, and enable all seven in the Effect preset: `no-manual-effect-error-tag`, `no-manual-tag-comparison`, `no-manual-tagged-construction`, `no-service-constructor-imports`, and `prefer-effect-match` from anti-slop, and `require-cause-when-narrowing`, which asks an error handler that builds a new error to keep the original as its `cause`, and `throw-in-effect-gen`, which reports a `throw` in an Effect generator, where it becomes a defect instead of a typed failure, from K-Mistele's fork.
