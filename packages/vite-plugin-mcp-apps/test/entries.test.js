import assert from "node:assert/strict";
import { readFile, symlink } from "node:fs/promises";
import path from "node:path";
import { afterEach, test } from "node:test";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { createBuilder } from "vite";

import { mcpApps } from "../dist/index.mjs";
import { appHtml, buildProject, cleanupProjects, createProject, listFiles } from "./helpers.js";

afterEach(cleanupProjects);

test("builds only the listed apps, under their IDs", async () => {
  const project = await createProject({
    "src/mcp-apps/ignored/index.html": appHtml("Ignored", "./main.js"),
    "src/mcp-apps/ignored/main.js": `document.body.dataset.app = "ignored";`,
    "src/views/treasury/index.html": appHtml("Treasury", "./main.js"),
    "src/views/treasury/main.js": `document.body.dataset.app = "treasury-view";`,
    "pages/ledger.html": appHtml("Ledger", "./ledger.js"),
    "pages/ledger.js": `document.body.dataset.app = "ledger-view";`,
  });

  const outputDirectory = await buildProject(project, {
    pluginOptions: {
      apps: {
        treasury: "src/views/treasury/index.html",
        "reports/ledger": "pages/ledger.html",
      },
    },
  });

  assert.deepEqual(await listFiles(outputDirectory), ["reports/ledger.html", "treasury.html"]);

  const [treasuryHtml, ledgerHtml] = await Promise.all([
    readFile(path.join(outputDirectory, "treasury.html"), "utf8"),
    readFile(path.join(outputDirectory, "reports/ledger.html"), "utf8"),
  ]);

  assert.match(treasuryHtml, /treasury-view/u);
  assert.doesNotMatch(treasuryHtml, /ledger-view/u);
  assert.match(ledgerHtml, /ledger-view/u);
  assert.doesNotMatch(ledgerHtml, /<script[^>]+src=/u);
});

test("rejects a missing app entry", async () => {
  const project = await createProject({});

  await assert.rejects(
    buildProject(project, {
      pluginOptions: { apps: { treasury: "src/views/treasury/index.html" } },
    }),
    /MCP app "treasury" entry does not exist or is not a file: .*src\/views\/treasury\/index\.html/u,
  );
});

test("rejects invalid app IDs and entries", async () => {
  const project = await createProject({
    "src/views/treasury/index.html": appHtml("Treasury", "./main.js"),
    "src/views/treasury/main.js": `document.body.dataset.app = "treasury";`,
  });

  const entry = "src/views/treasury/index.html";

  const cases = [
    [{}, /must name at least one MCP app/u],
    [{ "../treasury": entry }, /MCP app ID must be a relative path/u],
    [{ "/treasury": entry }, /MCP app ID must be a relative path/u],
    [{ treasury: path.join(project, entry) }, /entry must be project-relative/u],
    [{ treasury: "../outside/index.html" }, /must remain inside the Vite project root/u],
    [{ treasury: "src/views/treasury/main.js" }, /entry must be an HTML file/u],
    [{ Treasury: entry, treasury: entry }, /output collision/u],
  ];

  await Promise.all(
    cases.map(([apps, message]) =>
      assert.rejects(buildProject(project, { pluginOptions: { apps } }), message),
    ),
  );
});

test("rejects apps combined with appsDirectory", () => {
  assert.throws(
    () => mcpApps({ apps: { treasury: "index.html" }, appsDirectory: "src/views" }),
    /either apps or appsDirectory, not both/u,
  );
});

test("builds as one plugin among several returned from a wrapper plugin", async () => {
  const project = await createProject({
    "src/views/treasury/index.html": appHtml("Treasury", "./main.jsx"),
    "src/views/treasury/main.jsx": `
      import { createRoot } from "react-dom/client";
      import "./styles.css";
      function Treasury() {
        return <p className="text-emerald-700 font-bold">treasury-react-view</p>;
      }
      createRoot(document.querySelector("#app")).render(<Treasury />);
    `,
    "src/views/treasury/styles.css": `@import "tailwindcss";`,
    "src/views/payouts/index.html": appHtml("Payouts", "./main.jsx"),
    "src/views/payouts/main.jsx": `
      import { createRoot } from "react-dom/client";
      createRoot(document.querySelector("#app")).render(<p>payouts-react-view</p>);
    `,
  });

  // The project lives in a temporary directory, so link this package's
  // dependencies in for React to resolve.
  await symlink(
    fileURLToPath(new URL("../node_modules", import.meta.url)),
    path.join(project, "node_modules"),
  );

  const outputDirectory = path.join(project, "dist");
  const written = [];

  // Mirrors how a wrapper such as `tractorbeam()` composes the build: its own
  // plugins and `mcpApps()` returned together as one nested plugin array.
  function wrapper(views) {
    return [
      react(),
      tailwindcss(),
      mcpApps({
        apps: Object.fromEntries(views.map((view) => [view, `src/views/${view}/index.html`])),
      }),
      {
        name: "wrapper:collect-outputs",
        writeBundle(_options, bundle) {
          written.push(
            ...Object.keys(bundle).map((fileName) => `${this.environment.name}:${fileName}`),
          );
        },
      },
    ];
  }

  const builder = await createBuilder({
    build: { outDir: outputDirectory },
    configFile: false,
    logLevel: "silent",
    plugins: [wrapper(["treasury", "payouts"])],
    root: project,
  });

  await builder.buildApp();

  assert.deepEqual(await listFiles(outputDirectory), ["payouts.html", "treasury.html"]);
  assert.deepEqual(written.sort(), ["mcp_apps_0:payouts.html", "mcp_apps_1:treasury.html"]);

  const [treasuryHtml, payoutsHtml] = await Promise.all([
    readFile(path.join(outputDirectory, "treasury.html"), "utf8"),
    readFile(path.join(outputDirectory, "payouts.html"), "utf8"),
  ]);

  assert.match(treasuryHtml, /treasury-react-view/u);
  assert.match(treasuryHtml, /\.text-emerald-700\{/u);
  assert.match(treasuryHtml, /\.font-bold\{/u);
  assert.doesNotMatch(treasuryHtml, /payouts-react-view/u);
  assert.match(payoutsHtml, /payouts-react-view/u);
  assert.doesNotMatch(payoutsHtml, /text-emerald-700/u);
  assert.doesNotMatch(treasuryHtml, /<script[^>]+src=/u);
  assert.doesNotMatch(treasuryHtml, /<link[^>]+stylesheet/u);
});
