# Real Field Test: FastAPI Public Starter

Real field test results are separate from synthetic validation. This log records a scan of a public project checkout; it does not include external source code.

## Project Name

`fastapi-public-starter`

## Project Type

FastAPI official full-stack template backend.

## Source

Public repository: `https://github.com/fastapi/full-stack-fastapi-template`

Scanned subdirectory:

```text
backend
```

## Local Checkout Path

```text
/Users/daqiu/Documents/ai-codebase-doctor-field-tests/fastapi-public-starter/backend
```

## Command Used

```bash
npx --yes ai-codebase-doctor@latest /Users/daqiu/Documents/ai-codebase-doctor-field-tests/fastapi-public-starter/backend --out /Users/daqiu/Documents/ai-codebase-doctor-field-tests/reports/fastapi-public-starter --fail-on none --format all
```

Additional profile check:

```bash
npx --yes ai-codebase-doctor@latest /Users/daqiu/Documents/ai-codebase-doctor-field-tests/fastapi-public-starter/backend --out /Users/daqiu/Documents/ai-codebase-doctor-field-tests/reports/fastapi-public-starter-profile --profile auto --fail-on none --format json
```

v1.0.3 local rerun:

```bash
node dist/cli.js /Users/daqiu/Documents/ai-codebase-doctor-field-tests/fastapi-public-starter/backend --out /Users/daqiu/Documents/ai-codebase-doctor-field-tests/reports/fastapi-public-starter-v1.0.3 --fail-on none --format all
```

## Scan Success

Yes.

## Total Findings

Initial v1.0.2 scan: 9

v1.0.3 local rerun: 0

## Finding Counts

Initial v1.0.2 scan:

- Critical: 0
- Warning: 9
- Info: 0

v1.0.3 local rerun:

- Critical: 0
- Warning: 0
- Info: 0

## Useful Findings

- None confirmed.

## False Positives

- 9 `T001` findings. The scanner flagged `tests/__init__.py`, nested `__init__.py` files, `tests/conftest.py`, and helper modules under `tests/utils/` as assertion-free test files. These files are package markers, fixtures, or helpers rather than test cases, while actual `test_*.py` files in the project contain assertions.

v1.0.3 local rerun removed this false-positive cluster. The same backend scan produced 0 findings. This does not prove there are no remaining false positives in broader FastAPI projects; it only confirms this specific field-test regression was fixed.

## Unclear Findings

- None.

## Missed Obvious Issues

- None obvious from this scan-only review.

## Severity Correctness

The findings were `warning`, but this field test suggests they should not be emitted for Python package marker files, fixture files, or helper modules.

## Actionability

Low. The report points to files that should not normally need test assertions.

## Recommended Scanner Improvements

- Completed in v1.0.3: Python `T001` detection is limited to likely test case files such as `test_*.py` or `*_test.py`.
- Completed in v1.0.3: `__init__.py`, `conftest.py`, and helper/fixture modules are excluded from assertion-free test detection.

## Would Use Again

Yes. After the v1.0.3 local rerun, this project no longer shows the Python helper-file false-positive cluster.

## Conclusion

The initial v1.0.2 scan found a clear false-positive cluster in Python test detection. The v1.0.3 local rerun reduced those 9 `T001` false positives to 0 findings for this project. Broader FastAPI field testing is still needed.
