// Writes renovate.json, the Renovate preset that holds package-exemptions.json's
// release age and exemptions, which tractorbeamai/.github's shared Renovate
// config extends. With --check, fails instead when renovate.json is stale.
import { readFileSync, writeFileSync } from "node:fs";

const source = new URL("package-exemptions.json", import.meta.url);
const target = new URL("renovate.json", import.meta.url);

const { minimum_age_hours: hours, exempt_packages: exempt } = JSON.parse(
  readFileSync(source, "utf8"),
);

const preset = {
  $schema: "https://docs.renovatebot.com/renovate-schema.json",
  description: "Generated from package-exemptions.json by generate.mjs; edit that file instead.",
  minimumReleaseAge: `${hours} hours`,
  packageRules: [
    {
      description: "Packages exempt from the release-age gate.",
      matchDatasources: ["npm"],
      // Renovate matches a whole scope with `@scope/**`; pnpm and Aikido write `@scope/*`.
      matchPackageNames: exempt.npm.map((name) => name.replace(/\/\*$/u, "/**")),
      minimumReleaseAge: "0 days",
    },
  ],
};

const text = `${JSON.stringify(preset, null, 2)}\n`;

if (process.argv.includes("--check")) {
  let current = "";

  try {
    current = readFileSync(target, "utf8");
  } catch {}

  if (current !== text) {
    console.error(
      "renovate.json is stale; run `pnpm --filter @tractorbeam/pnpm-plugin-tractorbeam-defaults generate`",
    );

    process.exit(1);
  }
} else {
  writeFileSync(target, text);
}
