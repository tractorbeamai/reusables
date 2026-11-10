# @tractorbeam/pnpm-config

Shared pnpm configuration for Tractorbeam projects, installed as a pnpm [config dependency](https://pnpm.io/config-dependencies).

Its pnpmfile's `updateConfig` hook adds `@cloudflare/*`, `miniflare`, `workerd`, and `wrangler` to [`minimumReleaseAgeExclude`](https://pnpm.io/settings#minimumreleaseageexclude). Cloudflare publishes these packages almost daily, so the release-age gate would otherwise hold Workers projects back. The hook appends to the project's own exclusions; it never replaces them.

## Usage

Add the package as a config dependency and load its pnpmfile from `pnpm-workspace.yaml`:

```bash
pnpm add --config @tractorbeam/pnpm-config
```

```yaml
configDependencies:
  "@tractorbeam/pnpm-config": 0.1.0+sha512-...

pnpmfile:
  - node_modules/.pnpm-config/@tractorbeam/pnpm-config/pnpmfile.mjs

minimumReleaseAge: 2880
minimumReleaseAgeExclude:
  - some-other-package
```

pnpm loads only the pnpmfiles that `pnpmfile` lists, so a project with its own `.pnpmfile.mjs` lists both. Keep the project's release-age gate and any other exclusions in `pnpm-workspace.yaml`.

pnpm installs config dependencies before it runs any `updateConfig` hook, so the release-age gate still applies to this package itself unless its entry pins `version+integrity`.

Commands that pass `--ignore-pnpmfile` skip the hook. Tractorbeam's hosted Renovate allows pnpmfiles for this reason.
