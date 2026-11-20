import type { DummyRuleMap, OxlintConfig } from "vite-plus/lint";

import { antiSlop } from "./presets/anti-slop.ts";
import { core, options } from "./presets/core.ts";
import { effect, effectNativeOff } from "./presets/effect.ts";
import { playwright } from "./presets/playwright.ts";
import { react } from "./presets/react.ts";
import { stylistic } from "./presets/stylistic.ts";

export { core, options } from "./presets/core.ts";
export { effect, effectNativeOff } from "./presets/effect.ts";
export { playwright } from "./presets/playwright.ts";
export { antiSlop } from "./presets/anti-slop.ts";
export { react } from "./presets/react.ts";
export { stylistic } from "./presets/stylistic.ts";
export { vitest } from "./presets/vitest.ts";

export interface EffectOptions {
  /**
   * Globs for code on another platform's terms, which get `effectNativeOff`
   * in an override.
   */
  except?: string[];
}

export interface OxlintConfigOptions {
  /** Warn when cyclomatic complexity exceeds this value. */
  complexity?: number;
  /**
   * Lint the codebase as Effect code with `@effect/tsgo`'s and
   * oxlint-plugin-effect's rules, except the globs `except` lists.
   * Off by default; install both packages to turn it on, and extend
   * `@tractorbeam/typescript-config/effect` in every tsconfig that covers Effect code.
   */
  effect?: boolean | EffectOptions;
  /** Apply Playwright rules to test files matching these globs. */
  playwright?: { files: string[] };
  react?: boolean;
  /** Require braces on every block and blank lines around multiline statements. On by default; set `stylistic: false` to opt out. */
  stylistic?: boolean;
}

/**
 * The presets merged into one configuration, for projects that spread its
 * fields into their own. Prefer the presets with `extends`.
 */
export default function oxlintConfig({
  complexity,
  effect: effectOption = false,
  playwright: playwrightOption,
  react: reactOption = true,
  stylistic: stylisticOption = true,
}: OxlintConfigOptions = {}) {
  const presets: OxlintConfig[] = [
    core,
    antiSlop,
    ...(complexity === undefined
      ? []
      : [{ rules: { complexity: ["warn", complexity] } } satisfies OxlintConfig]),
    ...(reactOption ? [react] : []),
    ...(stylisticOption ? [stylistic] : []),
    ...(playwrightOption
      ? [
          {
            jsPlugins: playwright.jsPlugins,
            overrides: [{ files: playwrightOption.files, rules: playwright.rules }],
          } satisfies OxlintConfig,
        ]
      : []),
    ...(effectOption ? [effect()] : []),
    ...(effectOption === false || effectOption === true || !effectOption.except?.length
      ? []
      : [{ overrides: [{ files: effectOption.except, rules: effectNativeOff() }] }]),
  ];

  const rules: DummyRuleMap = Object.fromEntries(
    presets.flatMap((preset) => Object.entries(preset.rules ?? {})),
  );

  return {
    jsPlugins: presets.flatMap((preset) => preset.jsPlugins ?? []),
    options,
    plugins: presets.flatMap((preset) => preset.plugins ?? []),
    categories: core.categories,
    rules,
    overrides: presets.flatMap((preset) => preset.overrides ?? []),
  } satisfies OxlintConfig;
}
