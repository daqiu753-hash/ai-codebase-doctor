# Synthetic Case: Docker Prisma Missing Schema

This is simulated validation data.
These fixtures are synthetic projects.
This is not evidence of real-world adoption.

## Fixture Purpose

Show Docker command drift, port mismatch, and Prisma migration setup without a schema.

## Simulated Project Type

Docker + Prisma

## Command Used

```bash
node dist/cli.js examples/synthetic-validation/docker-prisma-missing-schema --out reports/synthetic/docker-prisma-missing-schema
```

## Expected Broken Patterns

- Dockerfile `CMD` references missing `server.js`.
- Dockerfile exposes `3000`, while README says `localhost:8080`.
- README mentions `prisma migrate`.
- `package.json` has a Prisma migration script.
- No `prisma/schema.prisma` exists.

## Actual Findings Summary

- Total findings: 5
- Critical: 3
- Warning: 1
- Info: 1

## Useful Findings

- `C001` Dockerfile references a missing entry file
- `DB001` README mentions Prisma migrations but schema is missing
- `DB002` Package script references Prisma setup that is incomplete
- `C002` Dockerfile port conflicts with README
- `DB004` DATABASE_URL is documented in env example but not explained in README

## Known Limitations

- The scanner does not build Docker images.
- As of v1.0.2, this fixture should report specific `DB001`/`DB002` findings and should not produce the removed duplicate `DB005` path.

## Conclusion

The fixture demonstrates repo-readiness failures that should block confidence until repaired.

## Disclaimer

This is simulated validation data. These fixtures are synthetic projects. This is not evidence of real-world adoption.
