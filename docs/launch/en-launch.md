# English Launch Copy

AI can generate a repo in minutes.

But can it actually run?

I built `ai-codebase-doctor`: an **AI-generated repo reality checker**.

It is not a generic linter. It checks whether a generated repository is internally honest enough to install, configure, test, and start.

It looks for things like:

- README commands that do not exist
- imports missing from `package.json`
- env vars used in code but missing from `.env.example`
- fake or assertion-free tests
- Docker / database / framework setup drift
- basic profile checks for Next.js, Vite, Express, and FastAPI

Run it:

```bash
npx ai-codebase-doctor .
```

Default scans are read-only, offline, and deterministic. It does not execute target project scripts and does not call LLM APIs.

One real field-test example: on the public FastAPI full-stack template backend, v1.0.2 produced 9 `T001` false positives by treating `__init__.py`, `conftest.py`, and test helper modules as assertion-free tests. v1.0.3 narrowed Python test detection to `test_*.py` and `*_test.py`, and the same project rerun dropped to 0 findings.

This is not a claim of broad real-world validation. It is one concrete field-test result, and broader field testing is still ongoing.

GitHub: https://github.com/daqiu753-hash/ai-codebase-doctor

npm: https://www.npmjs.com/package/ai-codebase-doctor

