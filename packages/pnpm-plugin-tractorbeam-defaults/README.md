# @tractorbeam/pnpm-plugin-tractorbeam-defaults

Tractorbeam's pnpm defaults, installed as a pnpm [config dependency](https://pnpm.io/config-dependencies). Its name follows pnpm's `@*/pnpm-plugin-*` pattern, so pnpm loads its `pnpmfile.mjs` automatically.

The pnpmfile's `updateConfig` hook adds `@cloudflare/*`, `miniflare`, `workerd`, and `wrangler` to [`minimumReleaseAgeExclude`](https://pnpm.io/settings#minimumreleaseageexclude). Cloudflare publishes these packages almost daily, so the release-age gate would otherwise hold Workers projects back. The hook appends to the project's own exclusions; it never replaces them.

## Usage

Declare the package in `configDependencies` in `pnpm-workspace.yaml`, pinned with its integrity:

```yaml
configDependencies:
  "@tractorbeam/pnpm-plugin-tractorbeam-defaults": 0.1.0+sha512-...

minimumReleaseAge: 2880
minimumReleaseAgeExclude:
  - some-other-package
```

pnpm installs config dependencies before it runs any `updateConfig` hook, so the release-age gate still applies to this package itself unless its entry pins `version+integrity`. Keep the project's release-age gate and any other exclusions in `pnpm-workspace.yaml`.

Commands that pass `--ignore-pnpmfile` skip the hook. Tractorbeam's hosted Renovate allows pnpmfiles for this reason.
