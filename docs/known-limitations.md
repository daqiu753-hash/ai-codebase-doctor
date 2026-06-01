# Known Limitations

`ai-codebase-doctor` is a deterministic, read-only reality checker for AI-generated repos. It intentionally avoids heavy parser dependencies in v0.5.

## Current Limits

- Import detection is regex-based and may miss unusual multi-line imports.
- Env detection focuses on direct static references such as `process.env.NAME`, `import.meta.env.NAME`, and `os.getenv("NAME")`.
- README command checks focus on package manager and package script commands, not arbitrary shell command validation.
- Runtime checks are best-effort and intentionally conservative.
- Framework profiles are smoke tests, not complete framework analyzers.
- API path matching checks obvious paths only and does not validate request/response schemas.
- `--online` checks use the npm registry and are disabled by default.
- Line numbers are best-effort and may point to the first matching line.

## Non-goals

- Generic linting.
- Security scanning.
- Secret scanning.
- Automatic code repair.
- LLM-based analysis.
- Executing target-project scripts.
