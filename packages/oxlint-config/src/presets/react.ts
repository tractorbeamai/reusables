import type { OxlintConfig } from "vite-plus/lint";

import { jsPlugin } from "./js-plugin.ts";

/** React, React Performance, and JSX accessibility rules, and Tractorbeam's UI rules. */
export const react = {
  plugins: ["jsx-a11y", "react", "react-perf"],
  jsPlugins: [jsPlugin("ui")],
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
} satisfies OxlintConfig;
