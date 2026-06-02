# Reddit / Hacker News Draft

## Title Options

- Show HN: AI Codebase Doctor - a reality checker for AI-generated repos
- I built a CLI that checks whether AI-generated repos can actually run
- AI can generate a repo in minutes. I built a tool to check whether it can run.

## Post

AI coding tools are good at producing repositories that look complete. The painful part often comes later: install commands fail, README instructions are stale, env vars are missing, tests are empty, or dependencies were hallucinated.

I built `ai-codebase-doctor` for that layer.

It is an **AI-generated repo reality checker**, not a generic linter. It checks whether a generated repo is internally honest enough to install, configure, test, and start.

It checks things like:

- README commands vs real `package.json` scripts
- JS/TS imports vs declared dependencies
- env vars used in code vs `.env.example`
- assertion-free tests
- Docker / database / framework setup mismatches
- basic framework profiles for Next.js, Vite, Express, and FastAPI

Default scans are read-only, offline, and deterministic. It does not execute target project scripts and does not call LLM APIs.

Run:

```bash
npx ai-codebase-doctor .
```

Small real field-test note: while scanning the public FastAPI full-stack template backend, v1.0.2 produced 9 `T001` false positives by treating `__init__.py`, `conftest.py`, and test helper modules as assertion-free tests. v1.0.3 narrowed Python test detection to `test_*.py` and `*_test.py`; rerunning the same project dropped those findings from 9 to 0.

This is not broad validation or adoption evidence. It is one concrete field-test fix. I am still collecting more public project trials and would especially appreciate feedback on false positives and AI-generated repo failure modes worth checking.

GitHub: https://github.com/daqiu753-hash/ai-codebase-doctor

npm: https://www.npmjs.com/package/ai-codebase-doctor

