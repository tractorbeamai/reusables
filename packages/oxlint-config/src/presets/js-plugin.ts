import type { ExternalPluginEntry } from "vite-plus/lint";

/** The entry for a JS plugin this package publishes on the `@tractorbeam/oxlint-config/<path>` subpath. */
export function jsPlugin(name: string, path = name): ExternalPluginEntry {
  return { name, specifier: `@tractorbeam/oxlint-config/${path}` };
}
