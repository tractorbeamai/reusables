import assert from "node:assert/strict";
import { test } from "node:test";

import config from "../dist/index.js";

test("leaves Markdown prose unwrapped", () => {
  assert.deepEqual(config.overrides, [
    { files: ["*.md", "*.mdx"], options: { proseWrap: "never" } },
  ]);
});
