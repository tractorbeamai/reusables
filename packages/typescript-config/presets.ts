import cloudflareWorkers from "./cloudflare-workers.json" with { type: "json" };
import next from "./next.json" with { type: "json" };
import node from "./node.json" with { type: "json" };
import node22 from "./node22.json" with { type: "json" };
import react from "./react.json" with { type: "json" };
import strictest from "./strictest.json" with { type: "json" };
import tanstackStart from "./tanstack-start.json" with { type: "json" };
import vite from "./vite.json" with { type: "json" };

export const presets: Record<string, Record<string, unknown>> = {
  "cloudflare-workers": cloudflareWorkers,
  next,
  node,
  node22,
  react,
  strictest,
  "tanstack-start": tanstackStart,
  vite,
};
