# @tractorbeam/pnpm-plugin-tractorbeam-defaults

Tractorbeam's pnpm defaults, installed as a pnpm [config dependency](https://pnpm.io/config-dependencies). Its name follows pnpm's `@*/pnpm-plugin-*` pattern, so pnpm loads its `pnpmfile.mjs` automatically.

The pnpmfile's `updateConfig` hook adds to the project's own settings and never replaces them:

- [`minimumReleaseAge`](https://pnpm.io/settings#minimumreleaseage): 48 hours (2880 minutes), the age Tractorbeam's laptops require before they download a package. pnpm's own default is 24 hours, so a lockfile resolved without this setting can hold versions that laptops refuse to install. A project that sets a longer age keeps it.
- [`minimumReleaseAgeExclude`](https://pnpm.io/settings#minimumreleaseageexclude): Tractorbeam's own packages (`@tractorbeam/*`); Cloudflare's (`@cloudflare/*`, `miniflare`, `workerd`, `wrangler`), which ship almost daily; Effect's (`effect`, `@effect/*`); Alchemy's (`alchemy`, `@alchemy.run/*`); and the Distilled SDKs (`@distilled.cloud/*`), whose releases Alchemy pins and ships with its own. Laptops (through Aikido) and Renovate exempt exactly these packages too, so a lockfile never holds a version one of them refuses. The list is defined in `tractorbeamai/infra`'s `data/package-age.json`; change it there and here together, since infra's and `tractorbeamai/.github`'s checks compare their lists with this one.
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
