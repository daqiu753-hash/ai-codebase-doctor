# Report Schema

The JSON report is stable as of v1.0.0. Patch and minor releases should preserve existing fields and compatible meanings. New optional fields may be added in minor releases.

## Top-level Fields

| Field | Type | Meaning |
|---|---|---|
| `schemaVersion` | string | Report schema version. v1.0 reports use `1.0.0`. |
| `score` | number | Score from `0` to `100`, derived from finding severities. |
| `summary` | object | Finding counts by severity. |
| `context` | object | Detected project metadata. |
| `findings` | array | Scanner findings. |

## `summary`

| Field | Type |
|---|---|
| `critical` | number |
| `warning` | number |
| `info` | number |
| `total` | number |

## `context`

| Field | Type | Meaning |
|---|---|---|
| `rootPath` | string | Absolute scanned project path. |
| `files` | string[] | Discovered project files, sorted deterministically. |
| `readmePath` | string | README path when present. |
| `packageJsonPath` | string | `package.json` path when present. |
| `envExamplePath` | string | `.env.example` path when present. |
| `sourceFiles` | string[] | Source files scanned for imports and env usage. |
| `testFiles` | string[] | Test files scanned for assertion reality. |
| `framework` | string | Coarse framework detection. |
| `detectedProfile` | string | Auto-detected profile. |
| `selectedProfile` | string | Profile used for profile-specific checks. |
| `packageManager` | string | Detected package manager. |

## `finding`

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Stable finding ID, such as `D001`. |
| `title` | string | Short finding title. |
| `severity` | string | `critical`, `warning`, or `info`. |
| `category` | string | Finding category. |
| `file` | string | Best-effort file location. |
| `line` | number | Best-effort 1-based line number. |
| `evidence` | string | What the scanner observed. |
| `expected` | string | Expected project reality. |
| `actual` | string | Actual project reality. |
| `whyItMatters` | string | Why the issue blocks real use. |
| `suggestedFix` | string | Suggested repair direction. |
| `agentPrompt` | string | Optional agent-ready task text. |

## Score

The score starts at `100`.

- `critical`: `-12`
- `warning`: `-5`
- `info`: `-1`

The minimum score is `0`.

## Compatibility

v1.x releases should not remove existing top-level fields or finding fields. Any future incompatible schema change should use a new major version.
