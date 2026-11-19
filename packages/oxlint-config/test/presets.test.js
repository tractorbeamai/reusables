import { deepStrictEqual } from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { after, test } from "node:test";

// Inside the package, so the presets' plugin specifiers resolve to it.
const dir = mkdtempSync(join(import.meta.dirname, "tmp-"));

after(() => rmSync(dir, { recursive: true, force: true }));

function printConfig(config) {
  writeFileSync(join(dir, "oxlint.config.mjs"), config);
  writeFileSync(join(dir, "a.ts"), "export {};\n");

  return JSON.parse(
    execFileSync("oxlint", ["-c", "oxlint.config.mjs", "--print-config", "a.ts"], {
      cwd: dir,
      encoding: "utf8",
    }),
  );
}

test("extending the presets enables only the plugins they list", () => {
  const config = printConfig(`
    import { antiSlop, core, playwright, react, stylistic } from "@tractorbeam/oxlint-config";

    export default {
      extends: [core, antiSlop, react, stylistic, playwright({ files: ["e2e/**"] })],
      plugins: [],
    };
  `);

  deepStrictEqual(config.plugins.toSorted(), [
    "import",
    "jsx-a11y",
    "promise",
    "react",
    "react-perf",
  ]);
});
