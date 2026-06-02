# Synthetic Case: Fastapi Env Missing

This is simulated validation data.
These fixtures are synthetic projects.
This is not evidence of real-world adoption.

## Fixture Purpose

Show FastAPI README entrypoint drift, missing dependency metadata, and undocumented env usage.

## Simulated Project Type

FastAPI

## Command Used

```bash
node dist/cli.js examples/synthetic-validation/fastapi-env-missing --out reports/synthetic/fastapi-env-missing
```

## Expected Broken Patterns

- README says `uvicorn main:app`, but there is no `main.py` defining `app`.
- Python code imports `fastapi`, but `requirements.txt` does not declare it.
- Code uses `os.getenv("DATABASE_URL")`, but `.env.example` omits `DATABASE_URL`.
- The app object is named `api`, not `app`.

## Actual Findings Summary

- Total findings: 6
- Critical: 3
- Warning: 2
- Info: 1

## Useful Findings

- `E001` Environment variable used but not documented
- `FA001` README uvicorn command does not match FastAPI entrypoint
- `FA002` Python code imports FastAPI but dependency metadata is missing
- `FA003` FastAPI app has no obvious route decorators
- `T001` Test file has no real assertion
- `E002` Environment variable documented but not used

## Known Limitations

- The scanner does not import Python modules or run `uvicorn`.
- FastAPI profile checks are smoke tests based on obvious imports and decorators.

## Conclusion

The fixture demonstrates repo-readiness failures that should block confidence until repaired.

## Disclaimer

This is simulated validation data. These fixtures are synthetic projects. This is not evidence of real-world adoption.
