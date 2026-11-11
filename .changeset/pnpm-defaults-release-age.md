---
"@tractorbeam/pnpm-plugin-tractorbeam-defaults": minor
---

Set `minimumReleaseAge` to 48 hours, the age Tractorbeam's laptops require, instead of leaving pnpm's 24-hour default, and exempt only the packages laptops exempt: `@tractorbeam/*` and Cloudflare's. Effect and Alchemy releases now wait 48 hours like other packages. A project that sets a longer age keeps it.
