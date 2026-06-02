# Synthetic Case: Vite Env Mismatch

This is simulated validation data.
These fixtures are synthetic projects.
This is not evidence of real-world adoption.

## Fixture Purpose

Show Vite env prefix drift and package-manager instruction mismatch.

## Simulated Project Type

Vite React

## Command Used

```bash
node dist/cli.js examples/synthetic-validation/vite-env-mismatch --out reports/synthetic/vite-env-mismatch
```

## Expected Broken Patterns

- Client code uses `import.meta.env.API_URL` without the `VITE_` prefix.
- Source also references `process.env.API_URL`, while `.env.example` documents `VITE_API_URL`.
- README uses `pnpm`, but only `package-lock.json` is present.

## Actual Findings Summary

- Total findings: 5
- Critical: 1
- Warning: 2
- Info: 2

## Useful Findings

- `E001` Environment variable used but not documented
- `PM001` README package manager conflicts with lockfile
- `VT001` Vite env var does not use VITE_ prefix
- `E002` Environment variable documented but not used
- `N003` Node engine is not documented

## Known Limitations

- The scanner does not execute Vite or validate browser runtime behavior.
- Env detection focuses on direct static references.

## Conclusion

The fixture demonstrates repo-readiness failures that should block confidence until repaired.

## Disclaimer

This is simulated validation data. These fixtures are synthetic projects. This is not evidence of real-world adoption.
