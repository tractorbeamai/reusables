# Renovate artifacts

Version sources: Root `package.json#packageManager` and the Vite Plus pair in `pnpm-workspace.yaml`.

Opt-in presets: `renovate-pnpm-lock` and `renovate-vite-plus`. Artifact generation runs once per branch using `npx --yes --ignore-scripts --package corepack@0.36.0 corepack pnpm install --lockfile-only --ignore-scripts --no-frozen-lockfile`. Only `pnpm-lock.yaml` may be committed by the artifact hook. Repeat the generation command to check idempotence.

Frozen installation and `pnpm check` verify the workspace. Keep the Vite core alias and Vite Plus entries adjacent; Renovate updates both from one version lookup.

Keep the shared broad non-major batch, maturity window, and merge authorization. `merge-when-ready` keeps merge candidates current; Bulldozer merges only after current-base checks pass. Do not introduce automatic dependency-family split PRs.

See the [shared update contracts](https://github.com/tractorbeamai/.github/blob/main/RENOVATE.md) for enrollment, worker requirements, failure handling, and rollback.
