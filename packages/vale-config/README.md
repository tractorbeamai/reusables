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

The package's own `.vale.ini` becomes the project's base configuration: it installs Google's and ai-tells' published styles, enables them with GitLab's `gitlab_base` style and the `Tractorbeam` style, turns off rules that repeat another style's check, applies Tractorbeam's overrides, and adds the `Tractorbeam` vocabulary. Front matter is not linted. Override any rule after the `Packages` line, for example `Google.Passive = NO`.

## What ships in the package

| Style | Source |
| --- | --- |
| `Google` | [vale-cli/Google](https://github.com/vale-cli/Google) v0.7.1, installed by `vale sync` |
| `ai-tells` | [tbhb/vale-ai-tells](https://github.com/tbhb/vale-ai-tells) v1.37.0, installed by `vale sync` |
| `ai-tells-experimental` | The same release's opt-in style of document-level checks (sentence- and paragraph-length variance, passive and long-word density), installed by `vale sync` |
| `gitlab_base` | GitLab's `doc/.vale/gitlab_base` at a pinned commit, bundled (CC BY-SA 4.0) |
| `Tractorbeam` | This package: `Spelling` (accepts GitLab's spelling exceptions, Red Hat's dictionary word list, and Mintlify's vocabulary, fetched at pinned commits, plus the Tractorbeam vocabulary; replaces `Vale.Spelling`), `Terms` (name spellings the vocabulary can't catch), `Unverified` (leftover `[UNVERIFIED]` markers), `RequirementVerbs` ("may" and "shall" outside policies), `ProductPossessive` (possessives of product names such as Constellation and Beam), `ContrastiveNegationCells` (ai-tells' trailing ", no …" pattern, applied to table cells that end without punctuation), `CutPhrases` (the phrases from Mintlify's `CutPhrases` rule that ai-tells doesn't already catch), `EmbeddedQuestion` (a question clause as the subject, as in "Which path you follow depends on…"), and `QuestionWordIt` (a sentence with a question word such as "which", "how", or "whether" that ends on a bare "it") |

`Tractorbeam.RequirementVerbs` flags "may" and "shall", which policies use on purpose. Turn it off, along with any other rule that flags a formal register, for policy files in the project's `.vale.ini`:

```ini
[content/policies/*.md]
Tractorbeam.RequirementVerbs = NO
```

GitLab doesn't publish its style as a package, and Mintlify and Red Hat don't publish their word lists as packages, so `scripts/package.sh` fetches them at the commits pinned in the script and builds `Tractorbeam.zip`. The release workflow attaches the zip to the `@tractorbeam/vale-config@<version>` GitHub release once Changesets bumps the version.

## Development

```bash
pnpm --filter @tractorbeam/vale-config package
```

Builds `dist/Tractorbeam.zip`. To try it, point a scratch `.vale.ini` at the zip's absolute path in `Packages` and run `vale sync`.
