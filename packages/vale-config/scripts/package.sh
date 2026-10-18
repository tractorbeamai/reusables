#!/usr/bin/env bash
# Build dist/Tractorbeam.zip, a Vale package: this config and vocabulary plus
# GitLab's gitlab_base style and the Mintlify and Red Hat word lists, fetched at
# pinned commits because none of them is published as a package.
set -euo pipefail

GITLAB_SHA=60211423df71189501c30d85671d3f794af2bfaa
MINTLIFY_SHA=d216a1658361a64650da085b0af067af25bb7e0b
REDHAT_SHA=7cfb4abccd7893c96b8d9e14fe569b25d29ac78f

root="$(cd "$(dirname "$0")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
pkg="$work/Tractorbeam"
mkdir -p "$pkg/styles"

cp "$root/.vale.ini" "$pkg/.vale.ini"
cp -R "$root/styles/." "$pkg/styles/"

curl -fsSL "https://gitlab.com/gitlab-org/gitlab/-/archive/$GITLAB_SHA/gitlab-$GITLAB_SHA.tar.gz?path=doc/.vale/gitlab_base" |
  tar -xz -C "$work"
mv "$work/gitlab-$GITLAB_SHA-doc-.vale-gitlab_base/doc/.vale/gitlab_base" "$pkg/styles/gitlab_base"
cat >"$pkg/styles/gitlab_base/NOTICE.md" <<EOF
From GitLab (https://gitlab.com/gitlab-org/gitlab/-/tree/$GITLAB_SHA/doc/.vale/gitlab_base),
licensed under CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
EOF

# Word lists for Tractorbeam.Spelling: Mintlify's vocabulary and Red Hat's
# dictionary word list (MIT).
curl -fsSL "https://raw.githubusercontent.com/mintlify/docs/$MINTLIFY_SHA/.vale/styles/config/vocabularies/Mintlify/accept.txt" \
  -o "$pkg/styles/Tractorbeam/wordlist-mintlify.txt"
curl -fsSL "https://raw.githubusercontent.com/redhat-documentation/vale-at-red-hat/$REDHAT_SHA/.vale/styles/RedHat/dictionaries/wordlist.txt" \
  -o "$pkg/styles/Tractorbeam/wordlist-redhat.txt"
cat >"$pkg/styles/Tractorbeam/NOTICE.md" <<EOF
wordlist-mintlify.txt is Mintlify's Vale vocabulary
(https://github.com/mintlify/docs/blob/$MINTLIFY_SHA/.vale/styles/config/vocabularies/Mintlify/accept.txt), MIT.
wordlist-redhat.txt is Red Hat's Vale dictionary word list
(https://github.com/redhat-documentation/vale-at-red-hat/blob/$REDHAT_SHA/.vale/styles/RedHat/dictionaries/wordlist.txt), MIT.
EOF

mkdir -p "$root/dist"
rm -f "$root/dist/Tractorbeam.zip"
(cd "$work" && zip -qr "$root/dist/Tractorbeam.zip" Tractorbeam)
echo "$root/dist/Tractorbeam.zip"
