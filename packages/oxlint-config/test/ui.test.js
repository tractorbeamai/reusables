import uiPlugin from "@tractorbeam/oxlint-config/ui";
import { RuleTester } from "oxlint/plugins-dev";

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

tester.run("ui/no-pages-in-components", uiPlugin.rules["no-pages-in-components"], {
  valid: [
    { code: "function SettingsRoute() {}", filename: "src/routes/settings.tsx" },
    { code: "export default function Page() {}", filename: "app/settings/page.tsx" },
    { code: "export class LoginPage {}", filename: "tests/pages/login-page.ts" },
    { code: "function PageHeader() {}", filename: "src/components/page-header.tsx" },
    { code: "const Pagination = () => null;", filename: "src/components/pagination.tsx" },
    { code: "const routePage = 1;", filename: "src/components/table.tsx" },
  ],
  invalid: [
    {
      code: "function SettingsPage() {}",
      filename: "src/components/settings.tsx",
      errors: [{ messageId: "entryInComponents" }],
    },
    {
      code: "export const ObjectRoute = () => null;",
      filename: "src/components/objects/object.tsx",
      errors: [{ messageId: "entryInComponents" }],
    },
    {
      code: "export const value = 1;",
      filename: "src/components/settings-page.tsx",
      errors: [{ messageId: "entryInComponents" }],
    },
    {
      code: "export const value = 1;",
      filename: "src\\components\\route.ts",
      errors: [{ messageId: "entryInComponents" }],
    },
  ],
});

tester.run("ui/route-component-names", uiPlugin.rules["route-component-names"], {
  valid: [
    'import { createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/settings")({ component: SettingsRoute });',
    'import { Outlet, createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/settings")({ component: Outlet });',
    'import { createRootRouteWithContext } from "@tanstack/react-router"; export const Route = createRootRouteWithContext<Context>()({ component: RootRoute });',
    'import { createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/settings")({ loader });',
    'import { createFileRoute } from "./router"; export const Route = createFileRoute("/settings")({ component: Settings });',
  ],
  invalid: [
    {
      code: 'import { createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/settings")({ component: SettingsPage });',
      errors: [{ messageId: "routeName" }],
    },
    {
      code: 'import { createFileRoute } from "@tanstack/react-router"; export const Route = createFileRoute("/settings")({ component: () => <Settings /> });',
      errors: [{ messageId: "routeName" }],
    },
    {
      code: 'import { createRoute as route } from "@tanstack/react-router"; export const settings = route({ path: "/settings", component: Settings });',
      errors: [{ messageId: "routeName" }],
    },
  ],
});

tester.run("ui/jsx-component-names", uiPlugin.rules["jsx-component-names"], {
  valid: [
    "function Header() { return <h1 />; }",
    "const label = (name) => `${name}!`;",
    "function header() { const Inner = () => <h1 />; return Inner; }",
    "const items = list.map((item) => <li>{item}</li>);",
  ],
  invalid: [
    { code: "function header() { return <h1 />; }", errors: [{ messageId: "lowercase" }] },
    { code: "const header = () => (ok ? <h1 /> : null);", errors: [{ messageId: "lowercase" }] },
    { code: "const renderRow = (row) => row.id;", errors: [{ messageId: "render" }] },
  ],
});

tester.run("ui/no-module-jsx", uiPlugin.rules["no-module-jsx"], {
  valid: [
    "function Header() { const icon = <svg />; return icon; }",
    'export const Route = createFileRoute("/")({ staticData: { label: <b /> } });',
    "const Header = () => <h1 />;",
  ],
  invalid: [
    { code: "const icon = <svg />;", errors: [{ messageId: "module" }] },
    {
      code: "export const items = [<li key={1} />, <li key={2} />];",
      errors: [{ messageId: "module" }],
    },
  ],
});

tester.run("ui/no-hook-declarations", uiPlugin.rules["no-hook-declarations"], {
  valid: [
    { code: "function useTheme() {}", filename: "src/hooks/use-theme.ts" },
    {
      code: "function useTheme() {}",
      filename: "src/components/theme.tsx",
      options: [{ allow: ["useTheme"] }],
    },
    { code: "function user() {}", filename: "src/components/user.tsx" },
  ],
  invalid: [
    {
      code: "const useTheme = () => null;",
      filename: "src/components/theme.tsx",
      errors: [{ messageId: "hookDeclaration" }],
    },
  ],
});
