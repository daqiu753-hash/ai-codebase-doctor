# Reddit / Hacker News Draft

Title options:

- Show HN: AI Codebase Doctor - a reality checker for AI-generated repos
- I built a CLI that checks whether AI-generated repos can actually run
- AI can generate a repo in minutes. I built a tool to check whether it can run.

Post:

AI coding tools are good at producing repositories that look complete. The first painful part is often later: install commands fail, README instructions are stale, env vars are missing, tests are empty, or dependencies were hallucinated.

I built `ai-codebase-doctor` as a small CLI for that layer.

It checks things like:

- README commands vs real `package.json` scripts
- JS/TS imports vs declared dependencies
- env vars used in code vs `.env.example`
- assertion-free tests
- Docker / database / framework setup mismatches
- basic framework profiles for Next.js, Vite, Express, and FastAPI

It is deliberately not a generic linter, not a security scanner, not an auto-fixer, and not an LLM wrapper. Default scans are read-only, offline, and deterministic. It does not execute target project scripts.

Install/run:

```bash
npx ai-codebase-doctor .
```

GitHub: https://github.com/daqiu753-hash/ai-codebase-doctor

npm: https://www.npmjs.com/package/ai-codebase-doctor

Feedback especially welcome on false positives and additional AI-generated repo failure modes worth checking.
