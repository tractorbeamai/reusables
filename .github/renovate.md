# Renovate artifacts

Version sources: Root `package.json#packageManager` and the Vite Plus pair in `pnpm-workspace.yaml`.

`renovate.json5` owns the artifact hook and dependency coordination. Artifact generation runs once per branch using `npx --yes --ignore-scripts --package corepack@0.36.0 corepack pnpm install --lockfile-only --ignore-scripts --no-frozen-lockfile`. Only `pnpm-lock.yaml` may be committed by the artifact hook. Repeat the generation command to check idempotence.

Frozen installation and `pnpm check` verify the workspace. Keep the Vite core alias and Vite Plus entries adjacent; Renovate updates both from one version lookup.

Keep the shared broad non-major batch, maturity window, and merge authorization. `merge-when-ready` keeps merge candidates current; Bulldozer merges only after current-base checks pass. Do not introduce automatic dependency-family split PRs.

See the [shared update contracts](https://github.com/tractorbeamai/.github/blob/main/RENOVATE.md) for organization-wide batching and merge policy. Keep repository-specific commands, version rules, output filters, and verification here and in this repository’s Renovate config, even when another repository uses similar settings.

The local regex manager maintains the hook’s Corepack pin. Corepack 0.36.0 supports pnpm 12’s binary distribution. Both the npm bootstrap and pnpm install disable lifecycle scripts.

The local Vite Plus regex manager owns the adjacent core alias and Vite Plus catalog entries as one declaration. Independent npm updates for those two entries are disabled; no new dependency group is introduced.

Roll out only after the worker allows the exact commands. A failed hook remains an artifact error and existing CI checks remain required. Roll back by removing this repository’s `postUpgradeTasks`; retain safe dependency and validation fixes.
