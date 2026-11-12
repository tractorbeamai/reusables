---
"@tractorbeam/typescript-config": patch
---

The package no longer declares `vitest` as an optional peer dependency. pnpm recorded that peer in every consumer's lockfile entry for the config, so each Vitest upgrade changed the entry and invalidated build caches keyed on it. The `vitest` preset still needs `vitest` installed alongside it, as the README says.
