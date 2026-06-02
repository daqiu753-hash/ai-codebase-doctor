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

## Scan Success

Yes.

## Total Findings

9

## Finding Counts

- Critical: 0
- Warning: 9
- Info: 0

## Useful Findings

- None confirmed.

## False Positives

- 9 `T001` findings. The scanner flagged `tests/__init__.py`, nested `__init__.py` files, `tests/conftest.py`, and helper modules under `tests/utils/` as assertion-free test files. These files are package markers, fixtures, or helpers rather than test cases, while actual `test_*.py` files in the project contain assertions.

## Unclear Findings

- None.

## Missed Obvious Issues

- None obvious from this scan-only review.

## Severity Correctness

The findings were `warning`, but this field test suggests they should not be emitted for Python package marker files, fixture files, or helper modules.

## Actionability

Low. The report points to files that should not normally need test assertions.

## Recommended Scanner Improvements

- For Python projects, limit `T001` to likely test case files such as `test_*.py` or `*_test.py`.
- Exclude `__init__.py`, `conftest.py`, and utility/helper modules under `tests/` from assertion-free test detection.

## Would Use Again

Yes, but this project type clearly needs test scanner tuning before broader FastAPI field testing.

## Conclusion

This scan found a clear false-positive cluster in Python test detection. It is useful evidence for scanner quality work, but not evidence that the target project has weak tests.

