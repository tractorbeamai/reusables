---
"@tractorbeam/typescript-config": minor
---

Reorganize the presets so a package extends one base and any add-ons, and needs no compiler options of its own.

- Base presets `bundler`, `browser`, `node-bundler`, and `cloudflare-workers` share one set of checks and one `lib`, and each declares the `types` its environment needs.
- `effect` and the new `vitest` are add-ons that combine with any base.
- `browser` replaces `vite` and `react`, which are removed. `cloudflare-workers` now matches the other bundler presets and includes Node types.
