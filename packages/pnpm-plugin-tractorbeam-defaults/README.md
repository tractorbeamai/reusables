# @tractorbeam/pnpm-plugin-tractorbeam-defaults

Tractorbeam's pnpm defaults, installed as a pnpm [config dependency](https://pnpm.io/config-dependencies). Its name follows pnpm's `@*/pnpm-plugin-*` pattern, so pnpm loads its `pnpmfile.mjs` automatically.

The pnpmfile's `updateConfig` hook adds to the project's own settings and never replaces them:

- [`minimumReleaseAge`](https://pnpm.io/settings#minimumreleaseage): the release age in [`package-exemptions.json`](package-exemptions.json), 48 hours, which Tractorbeam's laptops require before they download a package. pnpm's own default is 24 hours, so a lockfile resolved without this setting can hold versions that laptops refuse to install. A project that sets a longer age keeps it.
- [`minimumReleaseAgeExclude`](https://pnpm.io/settings#minimumreleaseageexclude): the packages `package-exemptions.json` exempts: Tractorbeam's own (`@tractorbeam/*`); Cloudflare's (`@cloudflare/*`, `miniflare`, `workerd`, `wrangler`), which ship almost daily; Effect's (`effect`, `@effect/*`); Alchemy's (`alchemy`, `@alchemy.run/*`, `@alchemy.dev/*`); and the Distilled SDKs (`@distilled.cloud/*`), whose releases Alchemy pins and ships with its own.
- [`allowBuilds`](https://pnpm.io/settings#allowbuilds): `esbuild` and `sharp`. A project's own entry for either, such as `sharp: false`, wins.

## Tractorbeam's release-age policy

`package-exemptions.json` is the one place Tractorbeam sets its release age and the packages exempt from it. Everything else reads it:

- This package's pnpmfile, for every pnpm install that loads the plugin.
- [`renovate.json`](renovate.json), a Renovate preset that `generate.mjs` writes from it, which `tractorbeamai/.github`'s shared Renovate config extends. `pnpm --filter @tractorbeam/pnpm-plugin-tractorbeam-defaults generate` rewrites it, and the package's `test` fails while it is stale.
- `tractorbeamai/infra`, which pins a released version of this package and renders that version's file into Aikido Device Protection, the Fleet laptop setup, and hosted Renovate's pnpm config.

To change the policy, edit `package-exemptions.json`, run `generate`, and add a changeset. Once the release publishes, Renovate bumps infra's pin.

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
