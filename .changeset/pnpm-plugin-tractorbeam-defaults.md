---
"@tractorbeam/pnpm-plugin-tractorbeam-defaults": minor
---

Publish the shared pnpm config dependency as `@tractorbeam/pnpm-plugin-tractorbeam-defaults`, which pnpm loads automatically. It replaces `@tractorbeam/pnpm-config`, whose pnpmfile each project had to list and which failed to load on a fresh checkout when pnpm switched to the project's version.
