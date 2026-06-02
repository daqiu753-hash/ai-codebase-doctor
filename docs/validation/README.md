# Synthetic Validation Pack

This is simulated validation data.
These fixtures are synthetic projects.
This is not evidence of real-world adoption.

The synthetic validation pack demonstrates how `ai-codebase-doctor` behaves on deliberately broken fixture projects. It is meant for demos, README examples, launch notes, and repeatable scanner behavior checks.

It should not be presented as real-world validation, user adoption evidence, benchmark data, or proof that the scanner performs well on arbitrary production repositories.

## Reproduce Locally

Build the local CLI first:

```bash
npm run build
```

Run all synthetic scans and refresh the simulated summary documents:

```bash
npm run validation:synthetic
```

Run one fixture manually:

```bash
node dist/cli.js examples/synthetic-validation/broken-nextjs-saas --out reports/synthetic/broken-nextjs-saas
```

The scans are offline by default and do not pass `--online`. The scanner reads fixture files only and does not execute fixture project scripts.

## Fixtures

| Fixture | Project type | Purpose |
|---|---|---|
| `broken-nextjs-saas` | Next.js + AI SaaS | README/script/env/dependency/test/database mismatch demo. |
| `vite-env-mismatch` | Vite React | Vite env prefix and package-manager mismatch demo. |
| `express-api-route-mismatch` | Express API + frontend fetch | API path mismatch and missing server entry demo. |
| `fastapi-env-missing` | FastAPI | README entrypoint, dependency metadata, and env mismatch demo. |
| `docker-prisma-missing-schema` | Docker + Prisma | Docker command, port mismatch, and Prisma missing schema demo. |

## Generated Synthetic Docs

`npm run validation:synthetic` updates:

- [simulated-results-summary.md](simulated-results-summary.md)
- [simulated-case-broken-nextjs-saas.md](simulated-case-broken-nextjs-saas.md)
- [simulated-case-vite-env-mismatch.md](simulated-case-vite-env-mismatch.md)
- [simulated-case-express-api-route-mismatch.md](simulated-case-express-api-route-mismatch.md)
- [simulated-case-fastapi-env-missing.md](simulated-case-fastapi-env-missing.md)
- [simulated-case-docker-prisma-missing-schema.md](simulated-case-docker-prisma-missing-schema.md)

Real field tests are tracked separately in [docs/field-tests](../field-tests/README.md). Keep real project observations out of this synthetic pack.

The older [field-test-template.md](field-test-template.md) remains for reference, but the active real field test workflow lives in `docs/field-tests/`.
