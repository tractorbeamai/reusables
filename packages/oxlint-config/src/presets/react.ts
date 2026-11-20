import {
  REACT_DOCTOR_RULES,
  RECOMMENDED_RULES,
  TANSTACK_QUERY_RULES,
  TANSTACK_START_RULES,
} from "oxlint-plugin-react-doctor";
import type { OxlintConfig } from "vite-plus/lint";

// React Doctor's ports of Oxlint's own react and jsx-a11y rules are left out:
// the native rules run already, with this preset's exceptions.
const portedFromOxlint = new Set(
  REACT_DOCTOR_RULES.filter((entry) => entry.originallyExternal).map((entry) => entry.key),
);

/** React Doctor's recommended rules and its TanStack Query and Start rules, as errors. */
const reactDoctorRules = Object.fromEntries(
  Object.keys({ ...RECOMMENDED_RULES, ...TANSTACK_QUERY_RULES, ...TANSTACK_START_RULES })
    // Core's no-await-in-loop already reports what this one does.
    .filter((rule) => !portedFromOxlint.has(rule) && rule !== "react-doctor/async-await-in-loop")
    .map((rule) => [rule, "error"] as const),
);

/**
 * React, React Performance, and JSX accessibility rules, Tractorbeam's UI
 * rules, and React Doctor's rules in JSX files.
 */
export const react = {
  plugins: ["jsx-a11y", "react", "react-perf"],
  jsPlugins: [
    { name: "ui", specifier: "@tractorbeam/oxlint-config/ui" },
    { name: "react-doctor", specifier: "@tractorbeam/oxlint-config/react-doctor" },
  ],
  rules: {
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
    "ui/jsx-component-names": "warn",
    "ui/no-button-height-class": "warn",
    "ui/no-hook-declarations": "warn",
    "ui/no-icon-class-in-button": "warn",
    "ui/no-module-jsx": "warn",
    "ui/no-pages-in-components": "warn",
    "ui/route-component-names": "warn",
  },
  overrides: [
    {
      // React Doctor runs single-threaded, so it checks only JSX files. Give
      // other React code, such as hooks in `.ts` files, its rules in an
      // override: `{ files, rules: react.overrides[0].rules }`.
      files: ["**/*.{jsx,tsx}"],
      rules: reactDoctorRules,
    },
  ],
} satisfies OxlintConfig;
