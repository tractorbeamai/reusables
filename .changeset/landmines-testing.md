---
"@tractorbeam/oxlint-config": minor
---

The `vitest` preset enables Landmines' `no-test-doubles` and `no-flake-masking` in test files, which report mocks and stubbed globals, and test retries and raised timeouts, and `no-fixed-sleep`, `no-unsignaled-poll`, and `strict-msw`, which report fixed sleeps, polling without a signal to wait on, and an MSW server that lets unhandled requests through. The `vitest` preset also enables Landmines' `test-file-names`, which asks for `.test.ts`, `.fixture.ts`, and `.test-utils.ts` over names such as `.spec.ts`, `helpers.ts`, or `mocks.ts`, and `core` enables its `package-exports`, which reports a wildcard export such as `"./*": "./src/*.ts"` in `package.json`.
