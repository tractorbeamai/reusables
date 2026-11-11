# @tractorbeam/pnpm-plugin-tractorbeam-defaults

Tractorbeam's pnpm defaults, installed as a pnpm [config dependency](https://pnpm.io/config-dependencies). Its name follows pnpm's `@*/pnpm-plugin-*` pattern, so pnpm loads its `pnpmfile.mjs` automatically.

The pnpmfile's `updateConfig` hook adds to the project's own settings and never replaces them:

- [`minimumReleaseAge`](https://pnpm.io/settings#minimumreleaseage): 48 hours (2880 minutes), the age Tractorbeam's laptops require before they download a package. pnpm's own default is 24 hours, so a lockfile resolved without this setting can hold versions that laptops refuse to install. A project that sets a longer age keeps it.
- [`minimumReleaseAgeExclude`](https://pnpm.io/settings#minimumreleaseageexclude): Tractorbeam's own packages (`@tractorbeam/*`) and Cloudflare's (`@cloudflare/*`, `miniflare`, `workerd`, `wrangler`), which ship almost daily. These are the only packages laptops exempt from the age requirement, so a broader exemption here would let a lockfile hold versions that laptops refuse.
- [`allowBuilds`](https://pnpm.io/settings#allowbuilds): `esbuild` and `sharp`. A project's own entry for either, such as `sharp: false`, wins.

## Usage

Declare the package in `configDependencies` and exempt it from the release-age gate in `pnpm-workspace.yaml`:

```yaml
configDependencies:
  "@tractorbeam/pnpm-plugin-tractorbeam-defaults": latest

minimumReleaseAgeExclude:
  - "@tractorbeam/pnpm-plugin-tractorbeam-defaults"
```

pnpm installs config dependencies before it runs any `updateConfig` hook, so the hook's exclusions cannot cover the plugin itself. Without the project's own entry, the gate holds each new release of the plugin. The lockfile records the version `latest` resolved to; `pnpm update` and Renovate's lock file maintenance move it.

Commands that pass `--ignore-pnpmfile` skip the hook. Tractorbeam's hosted Renovate allows pnpmfiles for this reason.
