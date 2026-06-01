# False Positive Policy

`ai-codebase-doctor` is conservative by design. It should flag project reality mismatches that are likely to block a developer from installing, configuring, testing, or starting an AI-generated repository.

## Principles

- Prefer `warning` over `critical` when a finding may be project-specific rather than clearly broken.
- Use `critical` only when the observed mismatch is very likely to fail: missing declared dependency, missing package script, missing env documentation for used env vars, missing script entry file, or impossible documented setup.
- Keep every finding explainable with file, line, evidence, expected state, actual state, and suggested fix when possible.
- Avoid broad lint-style checks that do not connect to run-readiness.
- Document best-effort behavior in `docs/known-limitations.md`.

## Duplicate Handling

Findings are de-duplicated by stable ID, file, line, and evidence before reporting. Semantically related findings from different scanners may still appear when they explain different repair actions.

## Severity Review

Before changing a finding to `critical`, ask whether a new developer following the README would probably hit a hard failure. If not, use `warning` or `info`.
