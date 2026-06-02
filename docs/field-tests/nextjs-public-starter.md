# Real Field Test: Next.js Public Starter

Real field test results are separate from synthetic validation. This log records a scan of a public project checkout; it does not include external source code.

## Project Name

`nextjs-public-starter`

## Project Type

Next.js official learning starter.

## Source

Public repository: `https://github.com/vercel/next-learn`

Scanned subdirectory:

```text
dashboard/starter-example
```

## Local Checkout Path

```text
/Users/daqiu/Documents/ai-codebase-doctor-field-tests/nextjs-public-starter/dashboard/starter-example
```

## Command Used

```bash
npx --yes ai-codebase-doctor@latest /Users/daqiu/Documents/ai-codebase-doctor-field-tests/nextjs-public-starter/dashboard/starter-example --out /Users/daqiu/Documents/ai-codebase-doctor-field-tests/reports/nextjs-public-starter --fail-on none --format all
```

Additional profile check:

```bash
npx --yes ai-codebase-doctor@latest /Users/daqiu/Documents/ai-codebase-doctor-field-tests/nextjs-public-starter/dashboard/starter-example --out /Users/daqiu/Documents/ai-codebase-doctor-field-tests/reports/nextjs-public-starter-profile --profile auto --fail-on none --format json
```

## Scan Success

Yes.

## Total Findings

9

## Finding Counts

- Critical: 0
- Warning: 0
- Info: 9

## Useful Findings

- `N003` Node engine is not documented. This is a low-severity but actionable reproducibility note for a modern Next.js starter.

## False Positives

- None confirmed.

## Unclear Findings

- 8 `E002` findings for `AUTH_SECRET`, `AUTH_URL`, and several `POSTGRES_*` variables documented in `.env.example` but not directly referenced by static code patterns. These may be framework/provider-driven values from the official tutorial flow, so they should not be counted as useful without deeper project-specific review.

## Missed Obvious Issues

- None obvious from this scan-only review.

## Severity Correctness

The scanner kept all findings at `info`, which is appropriate for a public starter where no clear run-blocking mismatch was found.

## Actionability

The `N003` finding is actionable. The `E002` findings are less actionable because implicit framework/provider env usage is outside the scanner's current static model.

## Recommended Scanner Improvements

- Reduce `E002` noise for provider/framework env variables that are documented for deployment platforms but not directly referenced in source code.
- Consider grouping repeated env-documentation findings when they come from the same `.env.example` provider block.

## Would Use Again

Yes, with manual review for env-related `info` findings.

## Conclusion

The scan did not find critical or warning issues in the official Next.js starter. It surfaced one useful metadata suggestion and several unclear env-documentation findings, suggesting that env scanner tuning would help real starter projects.

