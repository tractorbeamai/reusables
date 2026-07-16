import type { OxlintConfig } from "oxlint";

export interface OxlintConfigOptions {
  react?: boolean;
}

const globalRules = {
  "max-lines-per-function": ["warn", { max: 150 }],
  "no-inline-comments": ["warn", { ignorePattern: "#__PURE__|@__PURE__" }],
  "no-shadow": "off",
} satisfies OxlintConfig["rules"];

const pluginRules = {
  "import/max-dependencies": "off",
  "import/no-namespace": "error",
  "import/no-unassigned-import": "off",
} satisfies OxlintConfig["rules"];

const reactPluginRules = {
  "jsx-a11y/anchor-has-content": "warn",
  "jsx-a11y/autocomplete-valid": "warn",
  "jsx-a11y/click-events-have-key-events": "warn",
  "jsx-a11y/label-has-associated-control": "off",
  "jsx-a11y/no-autofocus": "warn",
  "jsx-a11y/no-redundant-roles": "warn",
  "jsx-a11y/prefer-tag-over-role": "warn",
  "jsx-a11y/tabindex-no-positive": "warn",
  "react/jsx-no-constructed-context-values": "warn",
  "react/no-array-index-key": "warn",
  "react/react-in-jsx-scope": "off",
  "react-perf/jsx-no-jsx-as-prop": "warn",
  "react-perf/jsx-no-new-array-as-prop": "warn",
  "react-perf/jsx-no-new-function-as-prop": "warn",
  "react-perf/jsx-no-new-object-as-prop": "warn",
} satisfies OxlintConfig["rules"];

export default function oxlintConfig({ react = true }: OxlintConfigOptions = {}) {
  return {
    plugins: react
      ? ["import", "jsx-a11y", "promise", "react", "react-perf"]
      : ["import", "promise"],
    categories: {
      correctness: "error",
      suspicious: "error",
      perf: "error",
      pedantic: "warn",
    },
    rules: {
      ...globalRules,
      ...pluginRules,
      ...(react ? reactPluginRules : {}),
    },
  } satisfies OxlintConfig;
}
