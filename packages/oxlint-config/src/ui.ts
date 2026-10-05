import { definePlugin } from "@oxlint/plugins";

import { noButtonHeightClassRule } from "./ui/rules/no-button-height-class.ts";
import { noIconClassInButtonRule } from "./ui/rules/no-icon-class-in-button.ts";
import { noPagesInComponentsRule } from "./ui/rules/no-pages-in-components.ts";
import { routeComponentNamesRule } from "./ui/rules/route-component-names.ts";

export default definePlugin({
  meta: { name: "ui" },
  rules: {
    "no-button-height-class": noButtonHeightClassRule,
    "no-icon-class-in-button": noIconClassInButtonRule,
    "no-pages-in-components": noPagesInComponentsRule,
    "route-component-names": routeComponentNamesRule,
  },
});
