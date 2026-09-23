# Renovate artifacts

Version sources: Root `package.json#packageManager` and the Vite Plus pair in `pnpm-workspace.yaml`.

`renovate.json5` owns the artifact hook and repository-specific dependency coordination. Artifact generation runs once per branch using `npx --yes --ignore-scripts --package corepack@0.36.0 corepack pnpm install --lockfile-only --ignore-scripts --no-frozen-lockfile`. Only `pnpm-lock.yaml` may be committed by the artifact hook. Repeat the generation command to check idempotence.

Frozen installation and `pnpm check` verify the workspace. The shared preset tracks the Vite core alias and Vite Plus with the same release identity.

Keep the shared broad non-major batch, maturity window, and merge authorization. `merge-when-ready` keeps merge candidates current; Bulldozer merges only after current-base checks pass. Do not introduce automatic dependency-family split PRs.

See the [shared update contracts](https://github.com/tractorbeamai/.github/blob/main/RENOVATE.md) for organization-wide batching and merge policy. Keep repository-specific commands, version rules, output filters, and verification here and in this repository’s Renovate config, even when another repository uses similar settings.

The local regex manager maintains the hook’s Corepack pin. Corepack 0.36.0 supports pnpm 12’s binary distribution. Both the npm bootstrap and pnpm install disable lifecycle scripts.

Roll out only after the worker allows the exact commands. A failed hook remains an artifact error and existing CI checks remain required. Roll back by removing this repository’s `postUpgradeTasks`; retain safe dependency and validation fixes.

Vite Plus/core dependency tracking is inherited from `local>tractorbeamai/.github:renovate-vite-plus`. Do not duplicate its custom manager or native-manager suppression rules here.
