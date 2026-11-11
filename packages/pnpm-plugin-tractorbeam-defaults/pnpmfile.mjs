// Tractorbeam's release-age gate and the packages exempt from it, which
// Aikido on laptops, Renovate, and every pnpm install share. pnpm's own default
// age is 24 hours, so a lockfile resolved without this gate can hold versions
// that laptops then refuse to install.
import { readFileSync } from "node:fs";

const { minimum_age_hours: minimumAgeHours, exempt_packages: exemptPackages } = JSON.parse(
  readFileSync(new URL("package-exemptions.json", import.meta.url), "utf8"),
);

const allowBuilds = { esbuild: true, sharp: true };

export const hooks = {
  // Adds to the project's own settings; the project's entries win, and a
  // longer release age than the gate stays.
  updateConfig(config) {
    config.minimumReleaseAge = Math.max(config.minimumReleaseAge ?? 0, minimumAgeHours * 60);

    config.minimumReleaseAgeExclude = [
      ...new Set([...(config.minimumReleaseAgeExclude ?? []), ...exemptPackages.npm]),
    ];

    config.allowBuilds = { ...allowBuilds, ...config.allowBuilds };

    return config;
  },
};
