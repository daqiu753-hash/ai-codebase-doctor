# Changelog

## v1.0.1

Documentation and npm bin entry fix after the first npm publication.

- Make `npx ai-codebase-doctor .` the primary README usage.
- Remove stale pre-publication language.
- Fix the CLI entrypoint when launched through npm/npx bin symlinks.

## v1.0.0

Stable public release.

- Stable CLI options: `--ci`, `--fail-on`, `--format`, `--profile`, and `--online`.
- Stable JSON report schema with `schemaVersion`.
- Conservative framework profiles for Next.js, Vite, Express, and FastAPI.
- Runtime, Docker, database, dependency, env, README, script, API path, and test reality checks.
- GitHub Actions and CI documentation.
- Realistic fixtures and field test records.
- False-positive policy and scanner quality documentation.
- Public contribution, security, issue, and pull request templates.
- First npm publication: `ai-codebase-doctor@1.0.0`.

## v0.5.0

Developer workflow release.

- Runtime reality checks.
- Framework profiles for Next.js, Vite, Express, and FastAPI.
- Best-effort API path checks.
- Stable report format options.
- `--fail-on` support.
- Report schema documentation.
- GitHub Actions / CI documentation.
- Demo documentation.

npm publishing was deferred in v0.5.0 and completed in v1.0.0.

## v0.1.0

Initial public GitHub release.

- README command checks.
- package script checks.
- dependency declaration checks.
- environment variable documentation checks.
- fake / weak test detection.
- best-effort line numbers.
- `--ci` mode.
- Markdown / JSON reports.
- agent-ready fix prompts for Codex, Claude Code, and Cursor.
