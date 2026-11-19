import effectStylePlugin from "@tractorbeam/oxlint-config/effect-style";
import vitestStylePlugin from "@tractorbeam/oxlint-config/vitest-style";
import { RuleTester } from "oxlint/plugins-dev";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });

tester.run("effect-style/effect-names", effectStylePlugin.rules["effect-names"], {
  valid: [
    'class Users extends Context.Service<Users>()("Users") {}',
    "const ObservabilityLayer = Layer.mergeAll(A, B);",
    "export const layerTest = Layer.succeed(Users, users);",
    "class Users { static layer = Layer.effect(Users, make); }",
    "const program = Layer.launch(AppLayer);",
    "const users = Users.layer.pipe(Layer.build);",
  ],
  invalid: [
    {
      code: 'class users extends Context.Service<users>()("users") {}',
      errors: [{ messageId: "service" }],
    },
    { code: "const observability = Layer.mergeAll(A, B);", errors: [{ messageId: "binding" }] },
    {
      code: "export const live = Users.layer.pipe(Layer.provide(Db));",
      errors: [{ messageId: "exported" }],
    },
    {
      code: "class Users { static live = Layer.effect(Users, make); }",
      errors: [{ messageId: "member" }],
    },
  ],
});

tester.run(
  "effect-style/no-yield-expression-member",
  effectStylePlugin.rules["no-yield-expression-member"],
  {
    valid: ["function* f() { const stage = yield* Stage; return stage.console; }"],
    invalid: [
      {
        code: "function* f() { return (yield* Stage).console; }",
        errors: [{ messageId: "yieldExpressionMember" }],
      },
      {
        code: "function* f() { return (yield* Stage)!.console; }",
        errors: [{ messageId: "yieldExpressionMember" }],
      },
    ],
  },
);

tester.run("effect-style/no-array-for-each", effectStylePlugin.rules["no-array-for-each"], {
  valid: ["Effect.forEach(items, f);", "for (const item of items) f(item);"],
  invalid: [
    { code: "items.forEach(f);", errors: [{ messageId: "forEach" }] },
    { code: "this.items.forEach(f);", errors: [{ messageId: "forEach" }] },
  ],
});

tester.run(
  "effect-style/no-focused-effect-tests",
  effectStylePlugin.rules["no-focused-effect-tests"],
  {
    valid: ['it.effect("a", f);', 'it.only("a", f);', 'it.effect.skip("a", f);'],
    invalid: [
      { code: 'it.effect.only("a", f);', errors: [{ messageId: "modifier" }] },
      { code: 'it.live.only("a", f);', errors: [{ messageId: "modifier" }] },
    ],
  },
);

tester.run(
  "effect-style/no-disabled-effect-tests",
  effectStylePlugin.rules["no-disabled-effect-tests"],
  {
    valid: ['it.effect("a", f);', 'it.effect.only("a", f);'],
    invalid: [{ code: 'it.effect.skip("a", f);', errors: [{ messageId: "modifier" }] }],
  },
);

tester.run("vitest-style/no-in-source-tests", vitestStylePlugin.rules["no-in-source-tests"], {
  valid: ["const url = import.meta.url;"],
  invalid: [{ code: "if (import.meta.vitest) { test(); }", errors: [{ messageId: "inSource" }] }],
});
