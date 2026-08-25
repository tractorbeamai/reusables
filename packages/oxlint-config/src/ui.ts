import { definePlugin } from "@oxlint/plugins";

import { noButtonHeightClassRule } from "./ui/rules/no-button-height-class.ts";
import { noIconClassInButtonRule } from "./ui/rules/no-icon-class-in-button.ts";

export default definePlugin({
  meta: { name: "ui" },
  rules: {
    "no-button-height-class": noButtonHeightClassRule,
    "no-icon-class-in-button": noIconClassInButtonRule,
  },
});
