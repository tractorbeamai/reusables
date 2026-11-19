// The Effect preset lives on its own subpath because it reads its rules from
// the optional peers `@effect/tsgo` and `oxlint-plugin-effect`, which only
// Effect projects install.
import { effectNativeOffRules, effectPreset } from "./effect-rules.ts";

/**
 * Lints the codebase as Effect code, and turns off the shared rules that
 * misread Effect's idioms. Extend it after `core`.
 */
export const effect = effectPreset();

/**
 * The effect-native preset's rules, off, for an override's `rules` on code on
 * another platform's terms, such as React components, a published SDK's
 * plain-TypeScript API, or tool configuration. Its `*-in-effect` rules stay
 * on: a native API inside Effect code is wrong wherever that code is.
 */
export const effectNativeOff = effectNativeOffRules();
