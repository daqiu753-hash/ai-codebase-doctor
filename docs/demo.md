# Demo

The repository includes a deliberately broken AI-generated SaaS example:

```bash
npx ai-codebase-doctor examples/ai-generated-fake-saas --out reports
```

Expected summary:

```text
Score: 0/100
Critical: 8
Warnings: 4
Info: 3
```

Short console excerpt:

```text
[D001] Imported package not declared
Severity: critical
File: src/lib/ai.ts
Evidence: src/lib/ai.ts imports @ai-sdk/openai

[E001] Environment variable used but not documented
Severity: critical
File: src/lib/db.ts
Evidence: src/lib/db.ts uses DATABASE_URL

[R001] README command not found
Severity: critical
File: README.md
Evidence: README says: pnpm dev
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
