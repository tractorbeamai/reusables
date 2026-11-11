// The release-age gate Aikido enforces on Tractorbeam's laptops, and the
// packages it exempts. pnpm's own default is 24 hours, so a lockfile resolved
// without this gate can hold versions that laptops then refuse to install.
// Mirrors tractorbeamai/infra's data/package-age.json; infra's and
// tractorbeamai/.github's checks fail when their lists differ from this one.
const minimumReleaseAge = 48 * 60;

const minimumReleaseAgeExclude = [
  "@tractorbeam/*",
  "@cloudflare/*",
  "miniflare",
  "workerd",
  "wrangler",
  "effect",
  "@effect/*",
  "alchemy",
  "@alchemy.run/*",
];

const allowBuilds = { esbuild: true, sharp: true };

export const hooks = {
  // Adds to the project's own settings; the project's entries win, and a
  // longer release age than the gate stays.
  updateConfig(config) {
    config.minimumReleaseAge = Math.max(config.minimumReleaseAge ?? 0, minimumReleaseAge);

    config.minimumReleaseAgeExclude = [
      ...new Set([...(config.minimumReleaseAgeExclude ?? []), ...minimumReleaseAgeExclude]),
    ];

    config.allowBuilds = { ...allowBuilds, ...config.allowBuilds };

    return config;
  },
};
