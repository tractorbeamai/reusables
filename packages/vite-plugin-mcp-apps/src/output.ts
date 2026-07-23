import type { HtmlAssetSource, Rolldown } from "vite";

import type { DiscoveredApp } from "./discovery.js";
import { findUnresolvedReferences } from "./validation.js";

export function finalizeBundle(
  bundle: Rolldown.OutputBundle,
  app: DiscoveredApp,
  additionalAssetSources?: Readonly<Record<string, HtmlAssetSource>>,
): void {
  const htmlAssets = Object.values(bundle).filter(
    (entry): entry is Rolldown.OutputAsset =>
      entry.type === "asset" && entry.fileName.endsWith(".html"),
  );

  if (htmlAssets.length !== 1) {
    throw new Error(
      `MCP app "${app.id}" must produce exactly one HTML asset; received ${htmlAssets.length}.`,
    );
  }

  const htmlAsset = htmlAssets[0];
  const residualAssets = Object.values(bundle)
    .filter((entry) => entry !== htmlAsset)
    .map((entry) => entry.fileName)
    .sort((left, right) => left.localeCompare(right, "en"));

  if (residualAssets.length > 0) {
    throw new Error(
      `MCP app "${app.id}" could not be reduced to one HTML file. Residual bundle assets: ${residualAssets.join(", ")}.`,
    );
  }

  const unresolvedReferences = findUnresolvedReferences(
    toText(htmlAsset.source),
    additionalAssetSources,
  );

  if (unresolvedReferences.length > 0) {
    throw new Error(
      `MCP app "${app.id}" could not be reduced to one HTML file. Unresolved local resources: ${unresolvedReferences.join(", ")}.`,
    );
  }

  htmlAsset.fileName = app.output;
}

function toText(source: string | Uint8Array): string {
  return typeof source === "string" ? source : new TextDecoder().decode(source);
}
