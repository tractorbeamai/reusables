#!/usr/bin/env bash
# Create the GitHub release for the current version with Tractorbeam.zip attached,
# once Changesets has bumped it. Changesets doesn't release private packages.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
version="$(jq -r .version "$root/package.json")"
tag="@tractorbeam/vale-config@$version"

if [[ "$version" == "0.0.0" ]] || gh release view "$tag" >/dev/null 2>&1; then
  exit 0
fi

bash "$root/scripts/package.sh"
notes="$(awk -v v="## $version" '$0 == v { found = 1; next } found && /^## / { exit } found' "$root/CHANGELOG.md")"
gh release create "$tag" "$root/dist/Tractorbeam.zip" --title "$tag" --notes "$notes" --latest=false
