---
"@tractorbeam/pnpm-config": minor
---

Add the shared pnpm config dependency. Its `updateConfig` hook adds `@cloudflare/*`, `miniflare`, `workerd`, and `wrangler` to `minimumReleaseAgeExclude`, keeping the project's own exclusions.
