---
"@tractorbeam/oxlint-config": patch
---

Type the returned configuration with the Oxlint types that Vite+ ships (`vite-plus/lint`), so `defineConfig({ lint: oxlintConfig() })` type-checks against the Oxlint version your Vite+ runs, even when another Oxlint version is installed.
