# Contributing

Thanks for helping improve `ai-codebase-doctor`.

## Project Scope

This project is an AI-generated codebase reality checker, not a generic linter. Good contributions usually improve checks for:

- README commands vs real scripts
- imports vs declared dependencies
- env vars vs `.env.example`
- fake or weak tests
- runtime, Docker, database, and framework setup mismatches
- deterministic reports and CI behavior

## Safety Rules

- Keep scanning read-only.
- Do not execute target-project scripts.
- Do not add LLM API calls.
- Keep default scans offline and deterministic.
- Keep false positives explainable.

## Development

```bash
npm install
npm run build
npm test
npm run doctor:example
```

Before opening a pull request, add or update fixtures when scanner behavior changes.
