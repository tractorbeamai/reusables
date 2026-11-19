import { definePlugin } from "@oxlint/plugins";

import { jsxComponentNamesRule } from "./ui/rules/jsx-component-names.ts";
import { noButtonHeightClassRule } from "./ui/rules/no-button-height-class.ts";
import { noHookDeclarationsRule } from "./ui/rules/no-hook-declarations.ts";
import { noIconClassInButtonRule } from "./ui/rules/no-icon-class-in-button.ts";
import { noModuleJsxRule } from "./ui/rules/no-module-jsx.ts";
import { noPagesInComponentsRule } from "./ui/rules/no-pages-in-components.ts";
import { routeComponentNamesRule } from "./ui/rules/route-component-names.ts";

export default definePlugin({
  meta: { name: "ui" },
  rules: {
    "jsx-component-names": jsxComponentNamesRule,
    "no-button-height-class": noButtonHeightClassRule,
    "no-hook-declarations": noHookDeclarationsRule,
    "no-icon-class-in-button": noIconClassInButtonRule,
    "no-module-jsx": noModuleJsxRule,
    "no-pages-in-components": noPagesInComponentsRule,
    "route-component-names": routeComponentNamesRule,
  },
});
