# AI Codebase Doctor

AI 可以在几分钟内生成一个 repo。

但它真的能跑吗？

`ai-codebase-doctor` 是一个面向 AI 生成代码库的只读、确定性 CLI 检查工具。它检查的不是代码风格，而是项目是否真的自洽：依赖是否幻觉、脚本是否损坏、环境变量是否缺文档、测试是否只是空壳、README 里的运行说明是否在说谎。

![Demo terminal output](docs/assets/demo-terminal.svg)

## 安装与使用

首次 npm 发布前，本地使用：

```bash
npm install
npm run build
node dist/cli.js .
```

发布到 npm 后可使用：

```bash
npx ai-codebase-doctor .
```

扫描指定项目并输出报告：

```bash
node dist/cli.js ./path/to/project --out reports
```

CI 模式会在存在 `critical` findings 时返回非 `0`：

```bash
node dist/cli.js . --ci
```

选择输出格式和失败策略：

```bash
node dist/cli.js . --format all
node dist/cli.js . --fail-on warning
node dist/cli.js . --fail-on none
```

选择 framework profile：

```bash
node dist/cli.js . --profile auto
node dist/cli.js . --profile nextjs
```

显式开启 npm registry 检查：

```bash
node dist/cli.js . --online
```

本仓库本地 demo：

```bash
npm install
npm run build
npm run doctor:example
```

默认扫描过程只读取文件，不执行目标项目里的 scripts，也不调用 LLM API。只有显式传入 `--online` 时才会访问 npm registry。

## 示例输出

```text
AI Codebase Doctor

Score: 21/100
Critical: 6
Warnings: 1
Info: 2

[D001] Imported package not declared
Severity: critical
File: src/lib/ai.ts
Line: 1
Evidence: src/lib/ai.ts imports @ai-sdk/openai
Fix: Install and declare @ai-sdk/openai, replace the import, or remove unused code.

[E001] Environment variable used but not documented
Severity: critical
File: src/lib/db.ts
Line: 2
Evidence: src/lib/db.ts uses DATABASE_URL
Fix: Add DATABASE_URL= to .env.example and document how to obtain it.
```

## 生成报告

默认输出到 `doctor-reports/`。本仓库 demo 输出到 `reports/`，该目录已在 `.gitignore` 中忽略。

- `doctor-report.md`
- `doctor-report.json`
- `fix-with-codex.md`
- `fix-with-claude-code.md`
- `fix-with-cursor.md`

更多见 [docs/report-schema.md](docs/report-schema.md)、[docs/integrations.md](docs/integrations.md)、[docs/demo.md](docs/demo.md)。

## 当前检查项

| ID | 领域 | 含义 |
|---|---|---|
| `R001` | README | README 提到的 package script 在 `package.json` 中不存在。 |
| `S002` | Scripts | `package.json` script 指向不存在的入口文件。 |
| `E001` | Env | 代码使用了 `.env.example` 未记录的环境变量。 |
| `E002` | Env | `.env.example` 记录了源码未使用的环境变量。 |
| `D001` | Dependencies | JS/TS 源码 import 了未声明的包。 |
| `T001` | Tests | 测试文件没有明显断言。 |

runtime checks 还覆盖 package manager mismatch、Node/Docker 版本漂移、Docker command、Prisma/Drizzle setup 和 opt-in npm registry 检查。详见 [docs/checks.md](docs/checks.md)。

framework profiles 提供 Next.js、Vite、Express、FastAPI 的 best-effort 检查。详见 [docs/profiles.md](docs/profiles.md)。

## 它不是什么

它不是 ESLint、Semgrep、Gitleaks 或 Knip 的替代品。那些工具分别擅长代码规则、安全模式、secret 检测和未使用代码清理；`ai-codebase-doctor` 专注检查 AI 生成项目是否真的能安装、配置、测试和启动。

它也不是自动修复工具、LLM wrapper 或完整静态分析器。

## 已知限制

见 [docs/known-limitations.md](docs/known-limitations.md)。

## Roadmap

见 [docs/roadmap.md](docs/roadmap.md)。

## License

MIT
