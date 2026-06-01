# CI Usage

`ai-codebase-doctor` is designed for read-only CI checks. It does not execute target-project scripts and does not call LLM APIs.

## GitHub Actions

After npm publishing:

```yaml
name: AI Codebase Doctor

on:
  pull_request:
  push:
    branches: [main]

jobs:
  doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npx ai-codebase-doctor . --ci
```

Before npm publishing or inside this repository:

```yaml
- run: npm ci
- run: npm run build
- run: node dist/cli.js . --ci
```

## Failure Policies

`--ci` is equivalent to `--fail-on critical`.

```bash
node dist/cli.js . --fail-on critical
node dist/cli.js . --fail-on warning
node dist/cli.js . --fail-on none
```

Use `--fail-on warning` only after the project has already cleaned up known warnings. Use `--fail-on none` for baseline report generation.

## Network Policy

Default CI scans are offline and deterministic. Use `--online` only when the CI environment is allowed to reach the npm registry:

```bash
node dist/cli.js . --online --ci
```
