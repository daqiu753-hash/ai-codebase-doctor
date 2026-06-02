# Real Field Test: Vite React TS Starter

Real field test results are separate from synthetic validation. This log records a generated starter scan; it does not include external source code.

## Project Name

`vite-react-ts-starter`

## Project Type

Generated Vite React TypeScript starter.

## Source

Generated locally with:

```bash
npm create vite@latest vite-react-ts-starter -- --template react-ts
```

No starter install, build, test, or dev script was executed.

## Local Checkout Path

```text
/Users/daqiu/Documents/ai-codebase-doctor-field-tests/vite-react-ts-starter
```

## Command Used

```bash
npx --yes ai-codebase-doctor@latest /Users/daqiu/Documents/ai-codebase-doctor-field-tests/vite-react-ts-starter --out /Users/daqiu/Documents/ai-codebase-doctor-field-tests/reports/vite-react-ts-starter --fail-on none --format all
```

Additional profile check:

```bash
npx --yes ai-codebase-doctor@latest /Users/daqiu/Documents/ai-codebase-doctor-field-tests/vite-react-ts-starter --out /Users/daqiu/Documents/ai-codebase-doctor-field-tests/reports/vite-react-ts-starter-profile --profile auto --fail-on none --format json
```

## Scan Success

Yes.

## Total Findings

1

## Finding Counts

- Critical: 0
- Warning: 0
- Info: 1

## Useful Findings

- None confirmed.

## False Positives

- None confirmed.

## Unclear Findings

- `N003` Node engine is not documented. This can be useful for production repos, but it is common for a generated starter to omit `engines.node`, so this field test counts it as unclear rather than useful.

## Missed Obvious Issues

- None obvious from this scan-only review.

## Severity Correctness

The single finding was `info`, which is appropriately low severity for a generated starter.

## Actionability

The finding is easy to act on if the project owner wants runtime metadata, but it is not necessarily required for a minimal starter.

## Recommended Scanner Improvements

- Consider wording `N003` as optional metadata guidance in generated starter contexts.

## Would Use Again

Yes. The scan stayed quiet on a clean generated starter and did not produce critical or warning noise.

## Conclusion

The generated Vite React TS starter produced only one low-severity finding. This is a positive signal that the scanner does not over-report on a clean starter, while still surfacing optional runtime metadata.

