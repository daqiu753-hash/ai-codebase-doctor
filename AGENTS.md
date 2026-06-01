# AGENTS.md

You are working on `ai-codebase-doctor`, a CLI that audits AI-generated codebases and tells users why they will not run.

## Product principle

Do not turn this into a generic linter. The tool should focus on AI-generated repository reality checks:

- README vs actual scripts
- code imports vs declared dependencies
- env vars used in code vs `.env.example`
- fake or assertion-free tests
- project metadata consistency
- agent-ready fix prompts

## Engineering rules

1. Keep v0.1 deterministic. Do not require an LLM API key.
2. Prefer small scanner modules with clear `Finding[]` output.
3. Every scanner must be safe and read-only.
4. Do not execute arbitrary project scripts during scanning.
5. Keep false positives explainable.
6. Every new scanner needs at least one fixture or example.
7. Keep console output useful but compact.
8. Markdown report should be readable by humans and reusable as an issue body.
9. JSON report schema should stay stable once released.
10. Do not add heavy dependencies without justification.

## Communication Language

- Chat with the project owner in Simplified Chinese.
- Keep code, commands, file paths, package names, CLI output examples, and public GitHub-facing README.md content in English unless explicitly asked otherwise.
- Summaries, plans, progress updates, explanations, and final reports to the project owner should be written in Simplified Chinese.

## Preferred implementation style

- TypeScript
- Node.js 20+
- Small pure functions
- Scanner interface: `scan(context): Promise<Finding[]>`
- Centralized scoring
- Centralized report rendering
- Vitest tests for scanners

## Git discipline

Use small commits. Suggested commit types:

- `chore:` project setup
- `feat(scanner): add env var scanner`
- `feat(report): add markdown output`
- `test:` add fixtures
- `docs:` improve README

## v0.1 acceptance criteria

The project is v0.1-ready when:

- `npm run build` passes
- `npm test` passes
- `npm run dev -- examples/ai-generated-fake-saas --out reports` generates reports
- README shows a clear demo
- findings include stable IDs
- generated fix prompt summarizes critical issues
