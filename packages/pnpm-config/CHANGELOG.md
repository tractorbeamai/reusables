# @tractorbeam/pnpm-config

## 0.1.0

### Minor Changes

- 8a3a1d3: Add the shared pnpm config dependency. Its `updateConfig` hook adds `@cloudflare/*`, `miniflare`, `workerd`, and `wrangler` to `minimumReleaseAgeExclude`, keeping the project's own exclusions.
