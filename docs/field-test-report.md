# Field Test Report

This report records v1.0 stabilization checks against realistic and semi-realistic repositories. The goal is not to prove that every project can run, but to verify that scanner findings are explainable, deterministic, and useful for AI-generated repo reality checks.

## Summary

| Case | Source | Expected result | Notes |
|---|---|---|---|
| 1 | `examples/ai-generated-fake-saas` | Critical findings | Broken demo keeps the first-run failure story visible. |
| 2 | `tests/fixtures/realistic/realistic-nextjs-app` | No critical findings | Healthy Next.js app with matching API route and documented env. |
| 3 | `tests/fixtures/realistic/realistic-vite-app` | No critical findings | Healthy Vite app with `VITE_` env usage and entry files. |
| 4 | `tests/fixtures/realistic/realistic-express-app` | No critical findings | Healthy Express API with declared dependency and real entry script. |
| 5 | `tests/fixtures/realistic/realistic-fastapi-app` | No critical findings | Healthy FastAPI app with `requirements.txt` and `uvicorn main:app`. |
| 6 | `tests/fixtures/realistic/realistic-ai-saas-generated` | Critical findings | Semi-realistic generated SaaS with missing deps, env docs, script, and Prisma schema. |
| 7 | README command fixture in `tests/scanners.test.ts` | One README finding | Verifies package manager binary commands are not treated as scripts. |
| 8 | Env fixture in `tests/scanners.test.ts` | Missing and stale env findings | Verifies comments are ignored and line numbers are stable. |
| 9 | Dependency fixture in `tests/scanners.test.ts` | One dependency finding | Verifies local, virtual, asset, and Node imports are ignored. |
| 10 | Runtime fixtures in `tests/runtimeScanners.test.ts` | Runtime findings only when metadata conflicts | Verifies Docker, Node, package manager, and Prisma setup checks. |

## v1.0 Decision

The v1.0 scanner should prefer fewer, explainable findings over broad static-analysis coverage. A finding is release-worthy when it points to a concrete mismatch between docs, scripts, dependencies, env setup, runtime config, framework shape, or tests.
