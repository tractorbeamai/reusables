---
"@tractorbeam/oxlint-config": minor
---

The `vitest` preset enables Landmines' `no-test-doubles` and `no-flake-masking` in test files, which report mocks and stubbed globals, and test retries and raised timeouts, and `no-fixed-sleep`, `no-unsignaled-poll`, and `strict-msw`, which report fixed sleeps, polling without a signal to wait on, and an MSW server that lets unhandled requests through.
