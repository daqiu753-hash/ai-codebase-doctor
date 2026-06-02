# Real Field Test Results Summary

Real field tests are separate from synthetic validation. Synthetic validation uses deliberately broken fixture projects; this file records public or authorized project trials only.

External project source code and generated reports are not committed to this repository.

| Project | Type | Source | Scan success | Total findings | Useful | False positives | Unclear | Useful rate | False positive rate | Conclusion | Log |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---|---|
| `nextjs-public-starter` | Next.js official learning starter | `https://github.com/vercel/next-learn`, `dashboard/starter-example` | Yes | 9 | 1 | 0 | 8 | 11.1% | 0.0% | No critical or warning findings; useful low-severity runtime metadata note, plus unclear env-provider noise. | [nextjs-public-starter.md](nextjs-public-starter.md) |
| `vite-react-ts-starter` | Generated Vite React TypeScript starter | `npm create vite@latest vite-react-ts-starter -- --template react-ts` | Yes | 1 | 0 | 0 | 1 | 0.0% | 0.0% | Clean generated starter produced only one unclear `engines.node` info finding. | [vite-react-ts-starter.md](vite-react-ts-starter.md) |
| `fastapi-public-starter` | FastAPI official full-stack template backend | `https://github.com/fastapi/full-stack-fastapi-template`, `backend` | Yes | 0 after v1.0.3 rerun | 0 | 0 | 0 | n/a | 0.0% | v1.0.2 produced 9 Python `T001` false positives; v1.0.3 local rerun reduced this field-test result to 0 findings. | [fastapi-public-starter.md](fastapi-public-starter.md) |
