# Git Workflow

## Branch model

Use `main` as stable and short feature branches for each scanner.

Suggested branches:

```text
feat/bootstrap-cli
feat/readme-scanner
feat/env-scanner
feat/dependency-scanner
feat/test-reality-scanner
feat/reports
```

## Commit sequence

```bash
git init
git add .
git commit -m "chore: bootstrap ai-codebase-doctor"
```

For each Codex task:

```bash
git checkout -b feat/env-scanner
# run Codex task
npm run build
npm test
git add .
git commit -m "feat(scanner): add env variable scanner"
git checkout main
git merge feat/env-scanner
```

## Push to GitHub

Create the GitHub repo first, then:

```bash
git remote add origin git@github.com:<your-user>/ai-codebase-doctor.git
git branch -M main
git push -u origin main
```

Or with GitHub CLI:

```bash
gh repo create ai-codebase-doctor --public --source=. --remote=origin --push
```
