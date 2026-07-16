import type { OxlintConfig } from "oxlint";

const config = {
  plugins: ["import", "react", "react-perf", "jsx-a11y", "promise"],
  categories: {
    correctness: "error",
    suspicious: "error",
    perf: "error",
    pedantic: "warn",
  },
  rules: {
    "import/no-namespace": "error",
    "no-inline-comments": ["warn", { ignorePattern: "#__PURE__|@__PURE__" }],
    "react/react-in-jsx-scope": "off",
    "import/max-dependencies": "off",
    "import/no-unassigned-import": "off",
    "react-perf/jsx-no-new-object-as-prop": "warn",
    "react-perf/jsx-no-jsx-as-prop": "warn",
    "react-perf/jsx-no-new-function-as-prop": "warn",
    "react-perf/jsx-no-new-array-as-prop": "warn",
    "no-shadow": "off",
    "jsx-a11y/label-has-associated-control": "off",
    "react/no-array-index-key": "warn",
    "react/jsx-no-constructed-context-values": "warn",
    "jsx-a11y/anchor-has-content": "warn",
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/no-redundant-roles": "warn",
    "jsx-a11y/prefer-tag-over-role": "warn",
    "max-lines-per-function": ["warn", { max: 150 }],
    "jsx-a11y/tabindex-no-positive": "warn",
    "jsx-a11y/no-autofocus": "warn",
    "jsx-a11y/autocomplete-valid": "warn",
  },
} satisfies OxlintConfig;

export default config;
