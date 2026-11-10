import assert from "node:assert/strict";
import { test } from "node:test";

import { hooks } from "../pnpmfile.mjs";

const cloudflare = ["@cloudflare/*", "miniflare", "workerd", "wrangler"];

test("adds the Cloudflare packages when the project excludes nothing", () => {
  assert.deepEqual(hooks.updateConfig({ minimumReleaseAge: 2880 }), {
    minimumReleaseAge: 2880,
    minimumReleaseAgeExclude: cloudflare,
  });
});

test("keeps the project's own exclusions and lists each package once", () => {
  const config = hooks.updateConfig({ minimumReleaseAgeExclude: ["@tractorbeam/*", "wrangler"] });

  assert.deepEqual(config.minimumReleaseAgeExclude, [
    "@tractorbeam/*",
    "wrangler",
    "@cloudflare/*",
    "miniflare",
    "workerd",
  ]);
});
