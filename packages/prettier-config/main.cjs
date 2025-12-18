/**
 * @type {import("prettier").Config}
 */
module.exports = {
  plugins: [
    require.resolve("@ianvs/prettier-plugin-sort-imports"),
    require.resolve("prettier-plugin-packagejson"),
    require.resolve("prettier-plugin-tailwindcss"),
  ],
  importOrder: [
    "^(@/env)$",
    "",
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^types$",
    "@tractorbeam/(.*)$",
    "@/components/ui/(.*)$",
    "^@/(.*)$",
    "",
    "^[./]",
  ],
  importOrderParserPlugins: ["typescript", "jsx"],
};
