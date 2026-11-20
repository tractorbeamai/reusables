import { definePlugin } from "@oxlint/plugins";

import { jsxComponentNamesRule } from "../rules/ui/jsx-component-names.ts";
import { noButtonHeightClassRule } from "../rules/ui/no-button-height-class.ts";
import { noHookDeclarationsRule } from "../rules/ui/no-hook-declarations.ts";
import { noIconClassInButtonRule } from "../rules/ui/no-icon-class-in-button.ts";
import { noModuleJsxRule } from "../rules/ui/no-module-jsx.ts";
import { noPagesInComponentsRule } from "../rules/ui/no-pages-in-components.ts";
import { routeComponentNamesRule } from "../rules/ui/route-component-names.ts";

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
