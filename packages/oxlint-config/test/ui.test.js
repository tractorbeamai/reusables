import { RuleTester } from "oxlint/plugins-dev";

import uiPlugin from "@tractorbeam/oxlint-config/ui";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });

tester.run("ui/no-button-height-class", uiPlugin.rules["no-button-height-class"], {
  valid: [
    '<Button className="h-full w-full size-full" />',
    '<Button className="min-h-0 min-w-0 max-h-none max-w-none" />',
    '<Button className="rounded-md px-4" />',
    '<button className="h-10 w-10" />',
    "<Button className={classes} />",
  ],
  invalid: [
    { code: '<Button className="h-10" />', errors: [{ messageId: "preferSizeProp" }] },
    { code: '<Button className={"w-8"} />', errors: [{ messageId: "preferSizeProp" }] },
    { code: '<Button className="md:h-10" />', errors: [{ messageId: "preferSizeProp" }] },
    {
      code: "<Button className={`rounded-md size-4 ${classes}`} />",
      errors: [{ messageId: "preferSizeProp" }],
    },
    {
      code: '<Button className="min-h-[40px] max-w-1/2" />',
      errors: [{ messageId: "preferSizeProp" }],
    },
  ],
});

tester.run("ui/no-icon-class-in-button", uiPlugin.rules["no-icon-class-in-button"], {
  valid: [
    "<Button><SearchIcon /></Button>",
    '<div><SearchIcon className="size-4" /></div>',
    '<Button><span className="size-4" /></Button>',
    '<Button><Search aria-hidden="true" /></Button>',
  ],
  invalid: [
    {
      code: '<Button><SearchIcon className="size-4" /></Button>',
      errors: [{ messageId: "noClassName" }],
    },
    {
      code: '<Button><Icons.Search className="size-4" /></Button>',
      errors: [{ messageId: "noClassName" }],
    },
    {
      code: 'import { Search } from "lucide-react"; <Button><Search className="size-4" /></Button>',
      errors: [{ messageId: "noClassName" }],
    },
    {
      code: 'import { Search as SearchGlyph } from "lucide-react"; <Button><SearchGlyph className="size-4" /></Button>',
      errors: [{ messageId: "noClassName" }],
    },
    {
      code: 'import * as Lucide from "lucide-react"; <Button><Lucide.Search className="size-4" /></Button>',
      errors: [{ messageId: "noClassName" }],
    },
    {
      code: 'import { MagnifyingGlass } from "@heroicons/react/24/outline"; <Button><MagnifyingGlass className="size-4" /></Button>',
      errors: [{ messageId: "noClassName" }],
    },
    {
      code: 'import { BrandGithub } from "@tabler/icons-react"; <Button><BrandGithub className="size-4" /></Button>',
      errors: [{ messageId: "noClassName" }],
    },
    {
      code: 'import * as ProductIcons from "@/components/icons"; <Button><ProductIcons.Search className="size-4" /></Button>',
      errors: [{ messageId: "noClassName" }],
    },
  ],
});
