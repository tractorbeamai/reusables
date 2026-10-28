import browser from "./browser.json" with { type: "json" };
import bundler from "./bundler.json" with { type: "json" };
import cloudflareWorkers from "./cloudflare-workers.json" with { type: "json" };
import effect from "./effect.json" with { type: "json" };
import next from "./next.json" with { type: "json" };
import nodeBundler from "./node-bundler.json" with { type: "json" };
import node from "./node.json" with { type: "json" };
import node22 from "./node22.json" with { type: "json" };
import strictest from "./strictest.json" with { type: "json" };
import tanstackStart from "./tanstack-start.json" with { type: "json" };
import vitest from "./vitest.json" with { type: "json" };

export const presets = {
  browser,
  bundler,
  "cloudflare-workers": cloudflareWorkers,
  effect,
  next,
  node,
  "node-bundler": nodeBundler,
  node22,
  strictest,
  "tanstack-start": tanstackStart,
  vitest,
};
