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
  // Adds to the project's own settings; the project's entries win.
  updateConfig(config) {
    config.minimumReleaseAgeExclude = [
      ...new Set([...(config.minimumReleaseAgeExclude ?? []), ...minimumReleaseAgeExclude]),
    ];

    config.allowBuilds = { ...allowBuilds, ...config.allowBuilds };

    return config;
  },
};
