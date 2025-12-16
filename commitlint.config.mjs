export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Scope remains optional, but when provided it must be one of these.
    "scope-enum": [
      2,
      "always",
      [
        "repo",
        "eslint-config",
        "prettier-config",
        "typescript-config",
        "deps",
        "release",
      ],
    ],
  },
};
