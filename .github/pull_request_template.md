## Summary

What changed?

## Safety checklist

- [ ] Scanning remains read-only.
- [ ] No target-project scripts are executed.
- [ ] No LLM API calls were added.
- [ ] Default behavior remains offline and deterministic.
- [ ] Scanner changes include fixture or test coverage.

## Validation

```bash
npm run build
npm test
npm run doctor:example
```
