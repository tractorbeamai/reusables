# @tractorbeam/pnpm-plugin-tractorbeam-defaults

## 0.4.0

### Minor Changes

- e4a80a9: Exempt Alchemy's `@alchemy.dev/*` packages from the release-age gate, as the `@alchemy.run/*` packages are.

## 0.3.0

### Minor Changes

- 8989eea: Exempt the Distilled SDKs (`@distilled.cloud/*`) from the release-age gate. Alchemy pins the Distilled release it ships with, so without the exemption a new Alchemy release could not resolve until its Distilled packages were 48 hours old.
- 2f0991b: Ship Tractorbeam's release age and exempt packages as `package-exemptions.json`, which the pnpmfile reads, and as `renovate.json`, a Renovate preset generated from it.
- 0c924b0: Set `minimumReleaseAge` to 48 hours, the age Tractorbeam's laptops require, instead of leaving pnpm's 24-hour default. A project that sets a longer age keeps it. Packages exempt from the age stay `@tractorbeam/*`, Cloudflare's, Effect's, and Alchemy's.

## 0.2.0

### Minor Changes

- 254c259: Exempt `@tractorbeam/*`, Effect (`effect`, `@effect/*`), and Alchemy (`alchemy`, `@alchemy.run/*`) from the release-age gate, and allow `esbuild` and `sharp` to run build scripts. A project's own `allowBuilds` entries win.

## 0.1.0

### Minor Changes

- b093c3b: Publish the shared pnpm config dependency as `@tractorbeam/pnpm-plugin-tractorbeam-defaults`, which pnpm loads automatically. It replaces `@tractorbeam/pnpm-config`, whose pnpmfile each project had to list and which failed to load on a fresh checkout when pnpm switched to the project's version.
