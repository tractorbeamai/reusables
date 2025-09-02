/* eslint-disable jsdoc/check-tag-names */

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  /**
   * Some of Prettier's defaults can be overridden by an EditorConfig file. We
   * define those here to prevent that from happening. These are the same as the
   * Prettier defaults. We use all of the prettier defaults (via omission, for
   * those not affected by EditorConfig).
   *
   * See: https://github.com/prettier/prettier/blob/main/docs/configuration.md#editorconfig
   */
  endOfLine: "lf",
  tabWidth: 2,
  printWidth: 80,
  useTabs: false,

  plugins: [
    "prettier-plugin-pkg",
    "prettier-plugin-sh",
    "prettier-plugin-sql",
    "@ianvs/prettier-plugin-sort-imports",
  ],

  importOrder: [
    "",
    "<BUILTIN_MODULES>",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^[.]",
  ],
};

export default config;
