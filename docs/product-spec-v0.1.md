# v0.1 Product Spec

## Product thesis

AI-generated repos often fail because documentation, scripts, dependencies, environment variables, and tests are not internally consistent. `ai-codebase-doctor` makes this verification repeatable.

## v0.1 user story

As a developer using Codex / Claude Code / Cursor / Windsurf, I want to run one command against an AI-generated repo so that I can see whether the repo can realistically be installed, configured, tested, and started.

## v0.1 command

```bash
npx ai-codebase-doctor .
```

CI mode should fail only when critical findings exist:

```bash
npx ai-codebase-doctor . --ci
```

## v0.1 findings

| ID | Category | Severity | Meaning |
|---|---|---:|---|
| R001 | README | critical | README contains a package script command that is missing from `package.json`. |
| S002 | Scripts | critical | `package.json` script references a missing entry file. |
| E001 | Env | critical | Code uses an env var that is not documented in `.env.example`. |
| E002 | Env | info | `.env.example` documents an env var not used in source files. |
| D001 | Dependencies | critical | Source code imports a package not declared in `package.json`. |
| T001 | Tests | warning | Test file has no obvious assertion. |

## Acceptance criteria

- CLI accepts a project path.
- CLI prints score and findings.
- CLI writes Markdown and JSON reports.
- CLI writes fix prompts for Codex, Claude Code, and Cursor.
- CLI supports `--ci` mode that exits non-zero when critical findings exist.
- Findings include best-effort line numbers when practical.
- Example broken app produces multiple findings.
- `npm run build` passes.
- `npm test` passes after scanner tests are added.

## Known limitations

- v0.1 scanners are deterministic and regex-based, not full language parsers.
- Import detection is focused on common JS/TS import forms and ignores common virtual imports.
- README command checks target package script commands, not arbitrary shell command validation.
