# Real Field Test Commands

These commands scan a public or authorized project without executing that project's scripts.

Replace `/path/to/project` with a checkout under `/Users/daqiu/Documents/ai-codebase-doctor-field-tests`.

```bash
npx --yes ai-codebase-doctor /path/to/project --out reports
```

```bash
npx --yes ai-codebase-doctor /path/to/project --out reports --profile auto
```

```bash
npx --yes ai-codebase-doctor /path/to/project --out reports --format json
```

```bash
npx --yes ai-codebase-doctor /path/to/project --out reports --fail-on none
```

Notes:

- Do not run `npm install`, `npm test`, `npm run build`, `pnpm dev`, `uvicorn`, or any other target-project script as part of a field test.
- Do not pass `--online` unless the field test explicitly needs opt-in npm registry checks and the result log notes that network-backed checks were enabled.
- Keep synthetic validation results in `docs/validation/`; keep real field test notes in `docs/field-tests/`.
