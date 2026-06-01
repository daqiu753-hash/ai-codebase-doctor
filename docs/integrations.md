# Integrations

## GitHub Actions

After the npm package is published:

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

Before npm publishing, use the local build:

```yaml
- run: npm install
- run: npm run build
- run: node dist/cli.js . --ci
```

## Fail-on Policies

```bash
node dist/cli.js . --fail-on critical
node dist/cli.js . --fail-on warning
node dist/cli.js . --fail-on none
```

`--ci` is equivalent to `--fail-on critical`.

## Output Formats

```bash
node dist/cli.js . --format all
node dist/cli.js . --format console
node dist/cli.js . --format markdown
node dist/cli.js . --format json
```

Use `--online` only when CI is allowed to reach the npm registry.
