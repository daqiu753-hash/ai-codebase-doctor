# Synthetic Case: Broken Nextjs Saas

This is simulated validation data.
These fixtures are synthetic projects.
This is not evidence of real-world adoption.

## Fixture Purpose

Show README script, dependency, env, weak test, and Prisma setup failures in a generated SaaS-style repo.

## Simulated Project Type

Next.js + AI SaaS

## Command Used

```bash
node dist/cli.js examples/synthetic-validation/broken-nextjs-saas --out reports/synthetic/broken-nextjs-saas
```

## Expected Broken Patterns

- README says `npm run dev`, but `package.json` has no `dev` script.
- Source uses `DATABASE_URL`, but `.env.example` does not document it.
- Source imports `@ai-sdk/openai`, but `package.json` does not declare it.
- A test file exists but has no obvious assertion.
- README mentions `prisma migrate`, but no `prisma/schema.prisma` exists.

## Actual Findings Summary

- Total findings: 10
- Critical: 5
- Warning: 3
- Info: 2

## Useful Findings

- `D001` Imported package not declared
- `DB001` README mentions Prisma migrations but schema is missing
- `DB002` Package script references Prisma setup that is incomplete
- `E001` Environment variable used but not documented
- `R001` README command not found
- `A001` Frontend API route has no obvious backend route
- `NX003` Next.js dependency is present but expected script is missing
- `T001` Test file has no real assertion
- `E002` Environment variable documented but not used
- `N003` Node engine is not documented

## Known Limitations

- The scanner does not verify whether the synthetic Next.js app can compile.
- API route checks are path-level best effort and do not validate method or response schemas.

## Conclusion

The fixture demonstrates repo-readiness failures that should block confidence until repaired.

## Disclaimer

This is simulated validation data. These fixtures are synthetic projects. This is not evidence of real-world adoption.
