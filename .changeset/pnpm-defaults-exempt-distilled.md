---
"@tractorbeam/pnpm-plugin-tractorbeam-defaults": minor
---

Exempt the Distilled SDKs (`@distilled.cloud/*`) from the release-age gate. Alchemy pins the Distilled release it ships with, so without the exemption a new Alchemy release could not resolve until its Distilled packages were 48 hours old.
