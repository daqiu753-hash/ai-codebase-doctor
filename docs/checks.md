# Checks

`ai-codebase-doctor` focuses on AI-generated repository reality checks, not generic linting.

## v0.1 Checks

| ID | Area | Severity | Meaning |
|---|---|---:|---|
| `R001` | README | critical | README mentions a package script that is missing from `package.json`. |
| `S002` | Scripts | critical | A `package.json` script references an entry file that does not exist. |
| `E001` | Env | critical | Source code uses an env var that is missing from `.env.example`. |
| `E002` | Env | info | `.env.example` documents an env var that source code does not use. |
| `D001` | Dependencies | critical | JS/TS source imports a package not declared in `package.json`. |
| `T001` | Tests | warning | A test file has no obvious assertion. |

## Runtime Reality Checks

| ID | Area | Default | Meaning |
|---|---|---:|---|
| `PM001` | Package manager | warning | README uses `pnpm`, but lockfiles indicate another package manager. |
| `PM002` | Package manager | warning | README uses `yarn`, but lockfiles indicate another package manager. |
| `PM003` | Package manager | warning | `packageManager` conflicts with the detected lockfile. |
| `PM004` | Package manager | warning | Multiple package manager lockfiles are present. |
| `PM005` | Package manager | warning | README package manager command conflicts with the detected lockfile. |
| `N001` | Runtime | warning | `engines.node` conflicts with `Dockerfile` Node version. |
| `N002` | Runtime | warning | README Node version conflicts with `engines.node`. |
| `N003` | Runtime | info | A modern JS framework project does not document `engines.node`. |
| `N004` | Runtime | warning | `Dockerfile` uses an old Node runtime for a modern JS framework. |
| `C001` | Docker | critical | Dockerfile command references a missing entry file. |
| `C002` | Docker | warning | Dockerfile `EXPOSE` port conflicts with README URL port. |
| `C003` | Docker | critical | Dockerfile runs a missing package script. |
| `C004` | Docker | critical | docker-compose command references a missing package script. |
| `DB001` | Database | critical | README mentions Prisma migrations but `prisma/schema.prisma` is missing. |
| `DB002` | Database | critical | package script references Prisma setup that is incomplete. |
| `DB003` | Database | warning | README mentions Drizzle but config/schema files are missing. |
| `DB004` | Database | info | `DATABASE_URL` is documented without README setup guidance. |
| `DB005` | Database | critical | Migration command exists but migration schema is missing. |

## Opt-in Online Checks

Online checks are disabled by default. They only run when `--online` is passed.

| ID | Area | Default | Meaning |
|---|---|---:|---|
| `D004` | Dependencies | warning | Imported package was not found in the npm registry. |
| `D005` | Dependencies | info | npm registry check failed or timed out. |

`--online` should not be used for deterministic offline CI unless network access is expected.
