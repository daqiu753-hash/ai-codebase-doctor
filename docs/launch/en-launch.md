# English Launch Copy

AI can generate a repo in minutes.

But can it actually run?

I built `ai-codebase-doctor`, a deterministic, read-only CLI that audits AI-generated codebases for broken project reality:

- README commands that do not exist
- imports missing from `package.json`
- env vars used in code but missing from `.env.example`
- fake or assertion-free tests
- Docker / database / framework setup drift

It is not a generic linter, not an auto-fixer, and not an LLM wrapper. It focuses on whether a generated repo is internally honest enough to install, configure, test, and start.

Try it:

```bash
npx ai-codebase-doctor .
```

GitHub: https://github.com/daqiu753-hash/ai-codebase-doctor

npm: https://www.npmjs.com/package/ai-codebase-doctor

Useful after generating a project with Codex, Claude Code, Cursor, or similar coding agents.
