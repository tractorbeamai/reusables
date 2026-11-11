---
"@tractorbeam/pnpm-plugin-tractorbeam-defaults": minor
---

Set `minimumReleaseAge` to 48 hours, the age Tractorbeam's laptops require, instead of leaving pnpm's 24-hour default. A project that sets a longer age keeps it. Packages exempt from the age stay `@tractorbeam/*`, Cloudflare's, Effect's, and Alchemy's.
