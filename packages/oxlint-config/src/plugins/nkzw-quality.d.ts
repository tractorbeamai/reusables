// `@nkzw/oxlint-config` ships no declarations for its `quality` plugin.
declare module "@nkzw/oxlint-config/quality/index.js" {
  import type { definePlugin } from "@oxlint/plugins";

  const quality: ReturnType<typeof definePlugin>;
  export default quality;
}
