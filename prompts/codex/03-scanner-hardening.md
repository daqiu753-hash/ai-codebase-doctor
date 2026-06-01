# Codex Task 03: Scanner Hardening

Goal: reduce obvious false positives and improve report quality.

Tasks:

1. Add line numbers when possible for findings.
2. Improve import parsing without adding a large parser dependency unless clearly justified.
3. Ignore common framework virtual imports when appropriate.
4. Add `--severity-threshold` or `--ci` mode that exits non-zero on critical findings.
5. Add tests using fixtures.
6. Document known limitations.

Acceptance criteria:

- `npm run build` passes.
- `npm test` passes.
- `ai-codebase-doctor examples/ai-generated-fake-saas --ci` exits non-zero.
- Normal scan mode does not exit non-zero just because findings exist.
