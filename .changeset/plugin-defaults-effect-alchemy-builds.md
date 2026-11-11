---
"@tractorbeam/pnpm-plugin-tractorbeam-defaults": minor
---

Exempt `@tractorbeam/*`, Effect (`effect`, `@effect/*`), and Alchemy (`alchemy`, `@alchemy.run/*`) from the release-age gate, and allow `esbuild` and `sharp` to run build scripts. A project's own `allowBuilds` entries win.
