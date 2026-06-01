# Framework Profiles

Profiles add best-effort framework awareness on top of the generic reality checks. They do not disable the shared scanners.

## Usage

```bash
node dist/cli.js . --profile auto
node dist/cli.js . --profile nextjs
node dist/cli.js . --profile vite
node dist/cli.js . --profile express
node dist/cli.js . --profile fastapi
```

`auto` is the default. It uses package metadata and file structure to select a profile.

## Profiles

| Profile | Best-effort signals | Extra checks |
|---|---|---|
| `nextjs` | `next` dependency, `src/app`, `pages/api` | expected scripts, public env prefix, API route files |
| `vite` | `vite` dependency, `vite.config.*` | `VITE_` env prefix, entry file presence |
| `express` | `express` imports/dependency, server entry files | missing dependency and missing server entry checks |
| `fastapi` | Python files, `requirements.txt`, FastAPI imports | uvicorn entrypoint and dependency metadata checks |

## API Path Checks

The API checker extracts simple frontend calls such as:

```ts
fetch('/api/customers')
axios.get('/api/customers')
```

It then compares those paths with obvious Next.js, Express, or FastAPI route definitions. This is intentionally conservative and should be treated as a missing-route smoke test, not complete API contract validation.
