---
"@tractorbeam/typescript-config": minor
---

Type-check against ES2025: the `bundler`, `browser`, `node-bundler`, `cloudflare-workers`, and `node` presets set `target` and `lib` to ES2025, so code can use `Float16Array`, `Math.f16round`, iterator helpers, the new `Set` methods, `Promise.try`, and `RegExp.escape`. `node22` stays on ES2024, because Node 22 has no `Float16Array`.
