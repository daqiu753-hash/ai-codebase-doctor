# Scanner Quality

v1.0 scanner quality is measured by determinism, safety, and usefulness rather than breadth.

## Quality Bar

- Scans are read-only.
- Default scans are offline.
- Target project scripts are never executed.
- Findings are deterministic for the same file tree and CLI options.
- Each scanner has fixture coverage for positive and negative cases.
- Best-effort checks are documented as limitations.

## Fixture Coverage

The committed fixtures under `tests/fixtures/realistic/` cover healthy Next.js, Vite, Express, and FastAPI projects plus a semi-realistic broken AI SaaS project. Unit-style fixtures cover README command parsing, env vars, dependency imports, test assertions, runtime metadata, Docker, Prisma, and API path matching.

## Release Gate

Before v1.0 release, these commands must pass:

```bash
npm run build
npm test
npm run doctor:example
npm audit --audit-level=moderate
npm pack --dry-run
npm publish --dry-run
```
