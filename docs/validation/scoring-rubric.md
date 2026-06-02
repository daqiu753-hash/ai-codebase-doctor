# Validation Scoring Rubric

This is simulated validation data when used with the synthetic validation pack.
These fixtures are synthetic projects.
This is not evidence of real-world adoption.

Use this rubric to review both synthetic fixtures and real field tests, but keep the two result types clearly separated.

## Terms

| Term | Definition |
|---|---|
| Useful finding | A finding that points to a real, actionable repo-readiness issue in the scanned project. |
| False positive | A finding that is technically wrong, misleading, or not actionable for the project. |
| Missed issue | An obvious repo-readiness issue that the scanner did not report. |
| Severity correctness | Whether `critical`, `warning`, and `info` match the actual impact. |
| Actionability | Whether the finding gives enough file, line, evidence, and fix direction to act. |
| Report clarity | Whether the report is understandable without reading scanner source code. |

## Rates

```text
useful_rate = useful_findings / total_findings
false_positive_rate = false_positives / total_findings
```

When `total_findings` is `0`, do not compute either rate. Record the scan as inconclusive for rate-based scoring.

## Suggested Interpretation

| Useful rate | Interpretation |
|---|---|
| `>= 70%` | Healthy. The scanner is likely useful for this project type. |
| `50% - 70%` | Needs tuning. Review severity, evidence, and false positives. |
| `< 50%` | Not ready for broad launch on this project type. |

This rubric is intentionally practical rather than academic. The goal is to improve scanner trust and reduce launch friction.

