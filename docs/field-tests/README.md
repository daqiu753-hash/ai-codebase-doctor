# Real Field Tests

This directory is for future real-project trial runs of `ai-codebase-doctor` against public repositories or projects where the owner has explicitly authorized testing.

Real field tests are tracked separately from [synthetic validation](../validation/README.md). Synthetic validation uses deliberately broken fixture projects. Real field tests should record observations from actual public or authorized repositories without claiming validation work that has not been completed.

## Rules

- Do not commit external project source code into this repository.
- Do not commit generated `reports/`, `dist/`, `node_modules/`, `.npmrc`, `.env`, secrets, customer data, or proprietary logs.
- Clone external repositories only into `/Users/daqiu/Documents/ai-codebase-doctor-field-tests`.
- Do not execute external project scripts.
- Only run `npx ai-codebase-doctor` scans against the target project.
- Keep results honest: record useful findings, false positives, missed obvious issues, and recommended scanner improvements.
- Do not present empty placeholders as completed validation.

## Current Plan

Start with 3 public or authorized projects, then expand toward 10 field tests:

1. `nextjs-starter`
2. `vite-react-starter`
3. `fastapi-starter`

Track progress in [results-summary.md](results-summary.md).

## Templates And Commands

- [field-test-log-template.md](field-test-log-template.md) is the primary template for one project trial.
- [commands.md](commands.md) lists safe scan commands.
- [local-workspace.md](local-workspace.md) explains where to clone external repositories.
- [field-test-template.md](field-test-template.md) is the earlier compact template and remains available for quick notes.
