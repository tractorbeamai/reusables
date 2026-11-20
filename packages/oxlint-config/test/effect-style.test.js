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

// The fork's cases for its two rules, at the vendored revision.
{
  const imports = `
	import * as Effect from "effect/Effect";
`;

  const missingCause = (operator, error) => ({
    messageId: "missingCause",
    data: { operator, error },
  });

  tester.run(
    "effect-style/require-cause-when-narrowing",
    effectStylePlugin.rules["require-cause-when-narrowing"],
    {
      valid: [
        `${imports}
		const a = decode(text).pipe(Effect.mapError((cause) => BadRequest.make({ reason: "Invalid JSON", cause })));
		const b = decode(text).pipe(Effect.mapError((error) => new BadRequest({ reason: error.message })));
		const c = decode(text).pipe(Effect.mapError(() => BadRequest.make({ reason: "Invalid JSON", ...details })));`,
        // Capture before narrowing.
        `${imports}
		const a = decode(text).pipe(Effect.tapError(Effect.logError), Effect.mapError(() => BadRequest.make({ reason: "Invalid JSON" })));
		const b = Effect.fn("decode")(function* () {}, Effect.tapCause(Effect.logError), Effect.catch(() => Effect.fail(new Failed())));
		const c = Effect.mapError(Effect.tapErrorCause(decode(text), Effect.logError), () => new Failed());`,
        // Specific expected tags are handled on purpose.
        `${imports}
		const a = load.pipe(Effect.catchTag("NotFound", () => Effect.fail(new Missing())));
		const b = load.pipe(Effect.catchTags({ NotFound: () => Effect.fail(new Missing()) }));`,
        // Recovering with a value, or constructing inside a nested function, is not narrowing.
        `${imports}
		const a = load.pipe(Effect.orElse(() => Effect.succeed(new Fallback())));
		const b = load.pipe(Effect.catch(() => Effect.sync(() => new Fallback())));
		const c = load.pipe(Effect.catch(() => Effect.succeed(Option.make(1))));`,
        // Not Effect's Effect.
        `
		import * as Effect from "other-library";
		const a = load.pipe(Effect.mapError(() => new Failed()));`,
      ],
      invalid: [
        {
          code: `${imports}
			const a = decode(text).pipe(Effect.mapError(() => BadRequest.make({ reason: "Invalid JSON" })));`,
          errors: [missingCause("Effect.mapError", "BadRequest")],
        },
        {
          code: `${imports}
			const a = Effect.mapError(decode(text), (_error) => new McpDialFailed({ message: "bad frame" }));`,
          errors: [missingCause("Effect.mapError", "McpDialFailed")],
        },
        {
          code: `${imports}
			const a = read.pipe(Effect.catch(() => AuthUnavailable.make({ error: "unavailable" })));
			const b = read.pipe(Effect.catchAll(() => Effect.fail(new Unavailable())));
			const c = read.pipe(Effect.orElse(() => Effect.gen(function* () {
				return yield* new Unavailable({ reason: "down" });
			})));
			const d = read.pipe(Effect.catchCause(() => { return Effect.fail(Errors.Unavailable.make()); }));`,
          errors: [
            missingCause("Effect.catch", "AuthUnavailable"),
            missingCause("Effect.catchAll", "Unavailable"),
            missingCause("Effect.orElse", "Unavailable"),
            missingCause("Effect.catchCause", "Errors.Unavailable"),
          ],
        },
        {
          code: `${imports}
			const a = read.pipe(Effect.tapError(Effect.logError)).pipe(Effect.map(f), Effect.mapError(() => new Failed()));
			const b = read.pipe(Effect.mapError(() => new Failed()), Effect.tapError(Effect.logError));`,
          errors: [missingCause("Effect.mapError", "Failed")],
        },
      ],
    },
  );
}

{
  const imports = `import { Effect, Stream } from "effect";`;
  const thrown = [{ messageId: "throwInEffectGen" }];

  tester.run("effect-style/throw-in-effect-gen", effectStylePlugin.rules["throw-in-effect-gen"], {
    valid: [
      // Effect.try and Effect.tryPromise capture throws from their callbacks, whatever else the options hold.
      `${imports}
		const consume = (stream: Stream.Stream<Uint8Array>) =>
			Effect.gen(function* () {
				const decoder = new TextDecoder("utf-8", { fatal: true });
				const decode = (bytes: Uint8Array | undefined) =>
					Effect.try({
						try: () => {
							const text = decoder.decode(bytes, { stream: bytes !== undefined });
							if (text.includes("\\0")) throw new Error("null byte in process output");
							return text;
						},
						catch: (cause) => new OutputNotText({ cause }),
					});
				yield* Stream.runForEach(stream, (bytes) => decode(bytes));
			});`,
      `${imports}
		const read = Effect.gen(function* () {
			return yield* Effect.try(() => {
				if (!ready) throw new Error("not ready");
				return value;
			});
		});`,
      `${imports}
		const load = Effect.fn("load")(function* (url: string) {
			return yield* Effect.tryPromise({
				try: async (signal) => {
					const response = await fetch(url, { signal });
					if (!response.ok) throw new Error(response.statusText);
					return response.json();
				},
				catch: (cause) => new LoadError({ cause }),
				...retryOptions,
			});
		});`,
      // A synchronous helper declared in the generator throws to its own caller.
      `${imports}
		const open = Effect.gen(function* () {
			const contributions = new Map<string, Contribution>();
			const realize = (tools: ReadonlyArray<Tool>) => {
				const realized: Array<Contribution> = [];
				for (const tool of tools) {
					const contribution = contributions.get(tool.name);
					if (contribution === undefined) {
						throw new Error(\`tool "\${tool.name}" was never initialized\`);
					}
					realized.push(contribution);
				}
				return realized;
			};
			return { realize };
		});`,
      `${imports}
		const program = Effect.gen(function* () {
			function invariant(condition: boolean, message: string): asserts condition {
				if (!condition) throw new Error(message);
			}
			invariant(enabled, "disabled");
		});`,
      // Promise callbacks and methods of a returned object run outside the generator.
      `${imports}
		const daemon = Effect.gen(function* () {
			let binary: Promise<string> | undefined;
			return yield* makeTransport(() =>
				(binary ??= resolveBinary().catch((error) => {
					binary = undefined;
					throw error;
				})),
			);
		});`,
      `${imports}
		const facade = Effect.gen(function* () {
			let open = false;
			return {
				send: (data: string) => {
					if (!open) throw new Error("WebSocket is not open");
					queue.push(data);
				},
			};
		});`,
      `${imports}
		const program = Effect.gen(function* () {
			const value = (async () => {
				if (!ready) throw new Error("not ready");
				return 1;
			})();
			return yield* Effect.promise(() => value);
		});`,
      // The thunk of Effect.sync is its own function; the rule only looks at generator bodies.
      `${imports}
		const handler = Effect.gen(function* () {
			return yield* Effect.sync(() => {
				if (!window) throw new Error("Window not found");
				window.show();
			});
		});`,
      // A catch clause in the same generator handles the throw.
      `${imports}
		const program = Effect.gen(function* () {
			try {
				if (!valid) throw new Error("invalid");
				return 1;
			} catch {
				return yield* Effect.fail(new Invalid());
			}
		});`,
      // Pipeable arguments of Effect.fn are functions of their own.
      `${imports}
		const program = Effect.fn("program")(
			function* () {
				return yield* step;
			},
			Effect.catchCause((cause) => {
				throw cause;
			}),
		);`,
      // Generators that Effect does not run.
      `${imports}
		function* numbers() {
			throw new Error("not a program");
		}`,
      `
		import { Effect } from "other-library";
		const program = Effect.gen(function* () {
			throw new Error("not effect");
		});`,
    ],
    invalid: [
      {
        code: `
			import { Effect } from "effect";
			import { FileSystem } from "effect/platform";
			export function readAttachment(filePath: string, maxBytes: number) {
				return Effect.scoped(
					Effect.gen(function* () {
						const fs = yield* FileSystem.FileSystem;
						const info = yield* (yield* fs.open(filePath, { flag: "r" })).stat;
						if (info.size > maxBytes) throw new Error("attachment too large");
						return info;
					}),
				);
			}`,
        errors: thrown,
      },
      {
        code: `${imports}
			const executeTool = Effect.fn("executeTool")(function* (name: string, args: ReadonlyArray<unknown>) {
				if (args.length !== 1) throw new ToolRuntimeError("InvalidToolInput", name);
				return yield* run(name, args[0]);
			}, Effect.withSpan("executeTool"));`,
        errors: thrown,
      },
      {
        code: `${imports}
			const upsert = (input: Input) =>
				db.transaction((tx) =>
					Effect.gen(function* () {
						const [settings] = yield* tx.query(insert(input).returning());
						if (!settings) throw new Error("upsert returned no row");
						return settings;
					}),
				);`,
        errors: thrown,
      },
      {
        code: `
			import * as Effect from "effect/Effect";
			const check = Effect.fnUntraced(function* (code: number) {
				if (code !== 0) throw new Error(\`exited with \${code}\`);
			});`,
        errors: thrown,
      },
      {
        code: `${imports}
			class Service {
				run() {
					return Effect.gen(this, function* () {
						for (const item of this.items) {
							if (item.broken) {
								throw new Error("broken item");
							}
						}
					});
				}
			}`,
        errors: thrown,
      },
      // An immediately invoked function runs inside the generator.
      {
        code: `${imports}
			const find = Effect.gen(function* () {
				const items = (() => {
					const found = finder.search(query);
					if (!found.ok) throw found.error;
					return found.value.items;
				})();
				return items;
			});`,
        errors: thrown,
      },
      // Rethrowing from a catch clause, or throwing past a try without catch, still escapes.
      {
        code: `${imports}
			const generate = Effect.gen(function* () {
				for (const model of models) {
					try {
						generateService(model);
					} catch (error) {
						if (!continueOnError) throw error;
						yield* Effect.logError(error);
					}
				}
			});`,
        errors: thrown,
      },
      {
        code: `${imports}
			const program = Effect.gen(function* () {
				try {
					throw new Error("boom");
				} finally {
					yield* release;
				}
			});`,
        errors: thrown,
      },
    ],
  });
}

tester.run("vitest-style/no-in-source-tests", vitestStylePlugin.rules["no-in-source-tests"], {
  valid: ["const url = import.meta.url;"],
  invalid: [{ code: "if (import.meta.vitest) { test(); }", errors: [{ messageId: "inSource" }] }],
});
