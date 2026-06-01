# AI Codebase Doctor

AI can generate a full repo in minutes.

But can it actually run?

**AI Codebase Doctor** audits AI-generated codebases for broken project reality:

- hallucinated dependencies
- broken README commands
- missing environment variables
- package scripts that point nowhere
- fake or empty tests
- weak project metadata
- agent-ready fix prompts

```bash
npx ai-codebase-doctor .
```

This repository is the starter implementation for v0.1. The product direction is intentionally narrow: verify whether an AI-generated repo is internally consistent before a human wastes time debugging it.

## Current v0.1 scope

Supported first:

- Node.js / TypeScript / JavaScript projects
- README command checks
- `package.json` script checks
- `process.env.*`, `import.meta.env.*`, and Python `os.getenv()` env-var checks
- JS/TS dependency declaration checks
- test files with no real assertions
- Markdown, JSON, and console reports
- Codex / Claude Code fix-prompt generation

Not in v0.1:

- full security scanning
- complete static analysis
- automatic code repair
- cloud service
- full Python package analysis
- complete framework-specific API route matching

## Install locally during development

```bash
npm install
npm run build
node dist/cli.js examples/ai-generated-fake-saas --out reports
```

During development:

```bash
npm run dev -- examples/ai-generated-fake-saas --out reports
```

## Example output

```text
AI Codebase Doctor

Score: 21/100
Critical: 6
Warnings: 1
Info: 2

[R001] README command not found
Severity: critical
File: README.md
Evidence: README says: pnpm dev
Fix: Add a "dev" script to package.json or update the README command.

[E001] Environment variable used but not documented
Severity: critical
File: src/lib/db.ts
Evidence: src/lib/db.ts uses DATABASE_URL
Fix: Add DATABASE_URL= to .env.example and document how to obtain it.

[D001] Imported package not declared
Severity: critical
File: src/lib/ai.ts
Evidence: src/lib/ai.ts imports @ai-sdk/openai
Fix: Install and declare @ai-sdk/openai, replace the import, or remove unused code.
```

## Philosophy

AI-generated repos often look complete before they are complete. This tool focuses on reality checks across documentation, scripts, environment variables, dependencies, tests, and future agent repair loops.

## GitHub description

```text
A CLI that audits AI-generated codebases and tells you why they won't run.
```

## License

MIT
