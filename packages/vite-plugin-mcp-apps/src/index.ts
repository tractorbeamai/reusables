import { realpath } from "node:fs/promises";
import path from "node:path";

import type { BuildOptions, EnvironmentOptions, Plugin, UserConfig, ViteBuilder } from "vite";

import { discoverApps, type DiscoveredApp } from "./discovery.js";
import { inlineBundle } from "./inline.js";

/**
 * Options for the filesystem-based MCP Apps build.
 */
export interface McpAppsOptions {
  /**
   * Project-relative directory containing MCP app directories.
   *
   * @default "src/mcp-apps"
   */
  appsDirectory?: string;
}

/**
 * Builds every discovered MCP app into a self-contained HTML file.
 */
export function mcpApps(options: McpAppsOptions = {}): Plugin {
  let apps = new Map<string, DiscoveredApp>();

  return {
    name: "tractorbeam:mcp-apps",
    apply: "build",
    enforce: "post",
    async config(config) {
      assertDedicatedBuild(config);

      const root = await realpath(path.resolve(process.cwd(), config.root ?? "."));
      const discoveredApps = await discoverApps(root, options.appsDirectory);

      apps = new Map(discoveredApps.map((app) => [app.environmentName, app]));

      return {
        appType: "mpa",
        base: "./",
        builder: {},
        environments: Object.fromEntries(
          discoveredApps.map((app) => [app.environmentName, { consumer: "client" }]),
        ),
        root,
      };
    },
    configEnvironment(name) {
      const app = apps.get(name);

      if (app === undefined) {
        return undefined;
      }

      return {
        build: buildOptions(app, app === [...apps.values()][0]),
      } satisfies EnvironmentOptions;
    },
    applyToEnvironment(environment) {
      return apps.has(environment.name);
    },
    buildApp: {
      order: "pre",
      async handler(builder) {
        await buildApps(builder, apps);
      },
    },
    generateBundle: {
      order: "post",
      handler(_outputOptions, bundle) {
        const app = apps.get(this.environment.name);

        if (app === undefined) {
          throw new Error(`Unknown MCP Apps build environment: ${this.environment.name}`);
        }

        inlineBundle(bundle, app);
      },
    },
  };
}

function assertDedicatedBuild(config: UserConfig): void {
  const build = config.build;
  const conflicts: string[] = [];

  addConflict(conflicts, config.builder !== undefined, "builder");
  addConflict(conflicts, config.environments !== undefined, "environments");
  addConflict(conflicts, build?.lib !== undefined && build.lib !== false, "build.lib");
  addConflict(conflicts, build?.ssr !== undefined && build.ssr !== false, "build.ssr");
  addConflict(conflicts, build?.watch !== undefined && build.watch !== null, "build.watch");
  addConflict(conflicts, build?.write === false, "build.write");
  addConflict(
    conflicts,
    build?.rolldownOptions?.input !== undefined,
    "build.rolldownOptions.input",
  );
  addConflict(
    conflicts,
    build?.rolldownOptions?.output !== undefined,
    "build.rolldownOptions.output",
  );
  addConflict(conflicts, build?.rollupOptions?.input !== undefined, "build.rollupOptions.input");
  addConflict(conflicts, build?.rollupOptions?.output !== undefined, "build.rollupOptions.output");
  addConflict(conflicts, build?.assetsInlineLimit !== undefined, "build.assetsInlineLimit");
  addConflict(conflicts, build?.cssCodeSplit === true, "build.cssCodeSplit");
  addConflict(
    conflicts,
    build?.modulePreload !== undefined && build.modulePreload !== false,
    "build.modulePreload",
  );
  addConflict(conflicts, build?.emptyOutDir !== undefined, "build.emptyOutDir");
  addConflict(
    conflicts,
    build?.sourcemap !== undefined && build.sourcemap !== false,
    "build.sourcemap",
  );
  addConflict(
    conflicts,
    build?.manifest !== undefined && build.manifest !== false,
    "build.manifest",
  );
  addConflict(
    conflicts,
    build?.ssrManifest !== undefined && build.ssrManifest !== false,
    "build.ssrManifest",
  );
  addConflict(conflicts, build?.license !== undefined && build.license !== false, "build.license");
  addConflict(
    conflicts,
    build?.copyPublicDir !== undefined && build.copyPublicDir !== false,
    "build.copyPublicDir",
  );

  if (config.base !== undefined && config.base !== "./") {
    conflicts.push("base");
  }

  if (conflicts.length > 0) {
    throw new Error(
      `@tractorbeam/vite-plugin-mcp-apps owns a dedicated single-file build and cannot be combined with: ${conflicts.join(", ")}.`,
    );
  }
}

function addConflict(conflicts: string[], condition: boolean, name: string): void {
  if (condition) {
    conflicts.push(name);
  }
}

function buildOptions(app: DiscoveredApp, first: boolean): BuildOptions {
  return {
    assetsInlineLimit: () => true,
    copyPublicDir: false,
    cssCodeSplit: false,
    emptyOutDir: first,
    license: false,
    manifest: false,
    modulePreload: false,
    rolldownOptions: {
      input: app.input,
      output: {
        codeSplitting: false,
      },
    },
    sourcemap: false,
    ssrManifest: false,
    write: true,
  };
}

async function buildApps(
  builder: ViteBuilder,
  apps: ReadonlyMap<string, DiscoveredApp>,
): Promise<void> {
  await [...apps.keys()].reduce(async (previousBuild, name) => {
    await previousBuild;

    const environment = builder.environments[name];
    if (environment === undefined) {
      throw new Error(`Vite did not create the MCP app build environment "${name}".`);
    }

    if (!environment.isBuilt) {
      await builder.build(environment);
    }
  }, Promise.resolve());
}
