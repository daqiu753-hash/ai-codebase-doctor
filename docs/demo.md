# Demo

The repository includes a deliberately broken AI-generated SaaS example:

```bash
node dist/cli.js examples/ai-generated-fake-saas --out reports
```

Expected summary:

```text
Score: 0/100
Critical: 8
Warnings: 5
Info: 3
```

Representative findings:

- missing dependencies such as `@ai-sdk/openai` and `super-fast-rag`
- missing env documentation for `RAG_API_KEY` and `DATABASE_URL`
- README command mismatch for `pnpm dev`
- missing `scripts/seed.ts`
- Prisma migration docs without `prisma/schema.prisma`
- frontend `/api/...` calls without obvious backend routes
- assertion-free test file

Generated files:

- `reports/doctor-report.md`
- `reports/doctor-report.json`
- `reports/fix-with-codex.md`
- `reports/fix-with-claude-code.md`
- `reports/fix-with-cursor.md`

`reports/` is generated output and is ignored by git.
