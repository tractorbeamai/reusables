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

// The anti-slop rules' upstream cases, at the vendored revision.
tester.run(
  "effect-style/no-manual-effect-error-tag",
  effectStylePlugin.rules["no-manual-effect-error-tag"],
  {
    valid: [
      'error._tag === "NotFound";',
      'Effect.catchTag("NotFound", recover);',
      'Effect.catchTag("Wrapper", (error) => error.reason._tag === "Timeout" ? retry : fail);',
    ],
    invalid: [
      {
        code: 'Effect.catch((error) => error._tag === "NotFound" ? recover : fail);',
        errors: [{ messageId: "tag" }],
      },
      {
        code: 'Effect.catchAll(function (error) { return error.reason._tag === "Timeout" ? retry : fail; });',
        errors: [{ messageId: "reason" }],
      },
      {
        code: 'Effect.catchIf(predicate, (error) => { switch (error._tag) { case "NotFound": return recover; } });',
        errors: [{ messageId: "tag" }],
      },
    ],
  },
);

tester.run(
  "effect-style/no-manual-tag-comparison",
  effectStylePlugin.rules["no-manual-tag-comparison"],
  {
    valid: [
      'Predicate.isTagged("Ready")(value);',
      'Match.value(value).pipe(Match.tag("Ready", handleReady));',
      'if (value.status === "Ready") handleReady(value);',
      'Effect.catch((error) => error._tag === "NotFound" ? recover : fail);',
    ],
    invalid: [
      { code: 'value._tag === "Ready";', errors: [{ messageId: "manualComparison" }] },
      { code: '"Ready" !== value["_tag"];', errors: [{ messageId: "manualComparison" }] },
      {
        code: 'switch (value._tag) { case "Ready": handleReady(value); }',
        errors: [{ messageId: "manualSwitch" }],
      },
    ],
  },
);

tester.run(
  "effect-style/no-manual-tagged-construction",
  effectStylePlugin.rules["no-manual-tagged-construction"],
  {
    valid: [
      'Match.when({ _tag: "Ready" }, handleReady);',
      'Match.not({ "_tag": "Pending" });',
      "Ready.make({ value });",
      "new NotFound({ id });",
      "({ _tag: tag, value });",
    ],
    invalid: [
      {
        code: 'const value = { _tag: "Ready", payload };',
        errors: [{ messageId: "manualConstruction" }],
      },
      {
        code: 'const value = { ["_tag"]: "Ready" };',
        errors: [{ messageId: "manualConstruction" }],
      },
    ],
  },
);

tester.run(
  "effect-style/no-service-constructor-imports",
  effectStylePlugin.rules["no-service-constructor-imports"],
  {
    valid: [
      {
        filename: "src/issue-service.test.ts",
        code: 'import { makeIssueService } from "./issue-service.ts";',
      },
      {
        filename: "src/issue-service.spec.tsx",
        code: 'import { makeIssueService } from "../issue-service.ts";',
      },
      {
        filename: "src/runtime.ts",
        code: 'import { makeExecutionMemo } from "alchemy/Runtime/ExecutionMemo";',
      },
      {
        filename: "src/runtime.ts",
        code: 'import { makeissueService } from "./issue-service.ts";',
      },
      {
        filename: "src/runtime.ts",
        code: 'import { issueServiceLayer } from "./issue-service.ts";\nWorkspaceName.make("name");',
      },
    ],
    invalid: [
      {
        filename: "src/runtime.ts",
        code: 'import { makeIssueService } from "./issue-service.ts";',
        errors: [{ messageId: "serviceConstructorImport", data: { name: "makeIssueService" } }],
      },
      {
        filename: "src/runtime.ts",
        code: 'import { makeIssueService as createIssueService } from "../issue-service.ts";',
        errors: [{ messageId: "serviceConstructorImport", data: { name: "makeIssueService" } }],
      },
    ],
  },
);

tester.run("effect-style/prefer-effect-match", effectStylePlugin.rules["prefer-effect-match"], {
  valid: [
    'kind === "a" ? first : fallback;',
    'kind === "a" ? first : other === "b" ? second : fallback;',
    "condition ? first : otherCondition ? second : fallback;",
  ],
  invalid: [
    {
      code: 'kind === "a" ? first : kind === "b" ? second : fallback;',
      errors: [{ messageId: "preferMatch" }],
    },
    {
      code: "`a` !== kind ? first : `b` === kind ? second : fallback;",
      errors: [{ messageId: "preferMatch" }],
    },
  ],
});

tester.run("vitest-style/no-in-source-tests", vitestStylePlugin.rules["no-in-source-tests"], {
  valid: ["const url = import.meta.url;"],
  invalid: [{ code: "if (import.meta.vitest) { test(); }", errors: [{ messageId: "inSource" }] }],
});
