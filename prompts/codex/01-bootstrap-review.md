# Codex Task 01: Bootstrap Review

You are working in the `ai-codebase-doctor` repository.

Goal: review the existing starter implementation and make it production-ready enough for v0.1 development.

Do the following:

1. Run `npm install`.
2. Run `npm run build`.
3. Fix TypeScript errors if any.
4. Run `npm run doctor:example`.
5. Verify that reports are generated.
6. Add or adjust minimal Vitest tests for at least:
   - README command extraction behavior
   - env var scanner behavior
   - dependency scanner behavior
   - test reality scanner behavior
7. Keep the project deterministic and read-only.
8. Do not add LLM API calls.
9. Do not add heavy dependencies unless necessary.
10. Update README if the actual command or output differs from the current docs.

Acceptance criteria:

- `npm run build` passes.
- `npm test` passes.
- `npm run doctor:example` produces `reports/doctor-report.md` and fix prompts.
- The example output demonstrates at least 4 findings.
