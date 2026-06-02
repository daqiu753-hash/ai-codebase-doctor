# Synthetic Case: Express Api Route Mismatch

This is simulated validation data.
These fixtures are synthetic projects.
This is not evidence of real-world adoption.

## Fixture Purpose

Show frontend/backend API path mismatch and broken server entry scripts.

## Simulated Project Type

Express API + frontend fetch

## Command Used

```bash
node dist/cli.js examples/synthetic-validation/express-api-route-mismatch --out reports/synthetic/express-api-route-mismatch
```

## Expected Broken Patterns

- Frontend calls `fetch("/api/login")`.
- Backend defines `/auth/login` instead of `/api/login`.
- `package.json` script points at missing `server.js`.
- README documents an endpoint that does not match the obvious route.

## Actual Findings Summary

- Total findings: 5
- Critical: 2
- Warning: 2
- Info: 1

## Useful Findings

- `EX003` Express server entry referenced in scripts is missing
- `S002` Package script references missing file
- `A001` Frontend API route has no obvious backend route
- `T001` Test file has no real assertion
- `E002` Environment variable documented but not used

## Known Limitations

- The scanner compares obvious API paths only; it does not understand proxies, rewrites, routers mounted under prefixes, or auth middleware.
- README endpoint text is not a full contract source.

## Conclusion

The fixture demonstrates repo-readiness failures that should block confidence until repaired.

## Disclaimer

This is simulated validation data. These fixtures are synthetic projects. This is not evidence of real-world adoption.
