# @tractorbeam/vale-config

Shared [Vale](https://vale.sh) configuration for Tractorbeam docs, released as a Vale package rather than to npm.

## Usage

List the release in the project's `.vale.ini`:

```ini
StylesPath = .vale/styles

Packages = https://github.com/tractorbeamai/reusables/releases/download/%40tractorbeam%2Fvale-config%400.1.0/Tractorbeam.zip
```

Then install and lint:

```bash
vale sync
vale path/to/page.md
```

The package's own `.vale.ini` becomes the project's base configuration: it installs Google's and ai-tells' published styles, enables them with GitLab's `gitlab_base` style, Mintlify's `CutPhrases` rule, and the `Tractorbeam` style, applies Tractorbeam's overrides, and adds the `Tractorbeam` vocabulary. Override any rule after the `Packages` line, for example `Google.Passive = NO`.

## What ships in the package

| Style | Source |
| --- | --- |
| `Google` | [vale-cli/Google](https://github.com/vale-cli/Google) v0.7.1, installed by `vale sync` |
| `ai-tells` | [tbhb/vale-ai-tells](https://github.com/tbhb/vale-ai-tells) v1.37.0, installed by `vale sync` |
| `gitlab_base` | GitLab's `doc/.vale/gitlab_base` at a pinned commit, bundled (CC BY-SA 4.0) |
| `Mintlify` | Mintlify's `.vale/styles/Mintlify` at a pinned commit, bundled (MIT) |
| `Tractorbeam` | This package: `Terms` (name spellings the vocabulary can't catch), `Unverified` (leftover `[UNVERIFIED]` markers), `RequirementVerbs` ("may" and "shall" outside policies), and `ProductPossessive` (possessives of product names such as Constellation and Beam) |

`Tractorbeam.RequirementVerbs` flags "may" and "shall", which policies use on purpose. Turn it off for policy files in the project's `.vale.ini`:

```ini
[content/policies/*.md]
Tractorbeam.RequirementVerbs = NO
```

GitLab and Mintlify don't publish their styles as packages, so `scripts/package.sh` fetches them at the commits pinned in the script and builds `Tractorbeam.zip`. The release workflow attaches the zip to the `@tractorbeam/vale-config@<version>` GitHub release once Changesets bumps the version.

## Development

```bash
pnpm --filter @tractorbeam/vale-config package
```

Builds `dist/Tractorbeam.zip`. To try it, point a scratch `.vale.ini` at the zip's absolute path in `Packages` and run `vale sync`.
