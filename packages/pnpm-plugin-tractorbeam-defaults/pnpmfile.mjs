// Cloudflare publishes these packages almost daily, so a release-age gate would
// keep Workers projects behind the runtime their deploys use.
const minimumReleaseAgeExclude = ["@cloudflare/*", "miniflare", "workerd", "wrangler"];

export const hooks = {
  // Appends to the project's own exclusions instead of replacing them.
  updateConfig(config) {
    config.minimumReleaseAgeExclude = [
      ...new Set([...(config.minimumReleaseAgeExclude ?? []), ...minimumReleaseAgeExclude]),
    ];

    return config;
  },
};
