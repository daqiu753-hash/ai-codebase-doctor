# AI Codebase Doctor

[![npm version](https://img.shields.io/npm/v/ai-codebase-doctor)](https://www.npmjs.com/package/ai-codebase-doctor)
[![npm downloads](https://img.shields.io/npm/dm/ai-codebase-doctor)](https://www.npmjs.com/package/ai-codebase-doctor)
[![CI](https://github.com/daqiu753-hash/ai-codebase-doctor/actions/workflows/ci.yml/badge.svg)](https://github.com/daqiu753-hash/ai-codebase-doctor/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/daqiu753-hash/ai-codebase-doctor)](https://github.com/daqiu753-hash/ai-codebase-doctor/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

AI 可以在几分钟内生成一个 repo。

但它真的能跑吗？

`ai-codebase-doctor` 是一个面向 AI 生成代码库的只读、确定性 CLI 检查工具。它检查的不是代码风格，而是项目是否真的自洽：依赖是否幻觉、脚本是否损坏、环境变量是否缺文档、测试是否只是空壳、README 里的运行说明是否在说谎。

![Demo terminal output](docs/assets/demo-terminal.svg)

```bash
npx ai-codebase-doctor .
```

快速入口：[npm package](https://www.npmjs.com/package/ai-codebase-doctor)、[GitHub releases](https://github.com/daqiu753-hash/ai-codebase-doctor/releases)、[demo](docs/demo.md)、[synthetic validation](docs/validation/README.md)、[real field tests](docs/field-tests/README.md)。

试扫仓库内置的 broken AI-generated SaaS 示例：

```bash
npx ai-codebase-doctor examples/ai-generated-fake-saas --out reports
```

```text
Score: 0/100
Critical: 7
Warnings: 4
Info: 3

Reports generated in ./reports
```

## 安装与使用

直接使用 npm 包：

```bash
npx ai-codebase-doctor .
```

本仓库本地开发：

```bash
npm install
npm run build
npm run doctor:example
```

扫描指定项目并输出报告：

```bash
npx ai-codebase-doctor ./path/to/project --out reports
```

CI 模式会在存在 `critical` findings 时返回非 `0`：

```bash
npx ai-codebase-doctor . --ci
```

选择输出格式和失败策略：

```bash
npx ai-codebase-doctor . --format all
npx ai-codebase-doctor . --fail-on warning
npx ai-codebase-doctor . --fail-on none
```

选择 framework profile：

```bash
npx ai-codebase-doctor . --profile auto
npx ai-codebase-doctor . --profile nextjs
```

显式开启 npm registry 检查：

```bash
npx ai-codebase-doctor . --online
```

默认扫描过程只读取文件，不执行目标项目里的 scripts，也不调用 LLM API。只有显式传入 `--online` 时才会访问 npm registry。

scanner 是 best-effort 且偏保守的：优先报告具体、可解释的项目现实不一致，而不是做宽泛静态分析。

## GitHub Actions

GitHub Actions 可直接运行：

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
- run: npx ai-codebase-doctor . --ci
```

本仓库本地开发可使用本地构建：

```yaml
- run: npm ci
- run: npm run build
- run: node dist/cli.js . --ci
```

更多 CI 说明见 [docs/ci.md](docs/ci.md)。

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

更多见 [docs/report-schema.md](docs/report-schema.md)、[docs/ci.md](docs/ci.md)、[docs/integrations.md](docs/integrations.md)、[docs/demo.md](docs/demo.md)、[docs/field-tests](docs/field-tests/README.md)。

## 模拟验证包

[synthetic validation pack](docs/validation/README.md) 用一组故意 broken 的模拟项目展示 scanner 行为。这是模拟验证数据，不是真实用户验证，也不能作为真实采用证据。

文档中会明确标注：This is simulated validation data. These fixtures are synthetic projects. This is not evidence of real-world adoption.

```bash
npm run validation:synthetic
```

真实 field tests 会单独记录在 [docs/field-tests](docs/field-tests/README.md)，不和模拟验证数据混用。

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

它也不是自动修复工具、LLM wrapper、完整静态分析器或完整 API contract verifier。

## 已知限制

见 [docs/known-limitations.md](docs/known-limitations.md)。

误报治理与 scanner 质量标准见 [docs/false-positive-policy.md](docs/false-positive-policy.md)、[docs/scanner-quality.md](docs/scanner-quality.md)。

## Roadmap

见 [docs/roadmap.md](docs/roadmap.md)。

## 传播文案

见 [docs/launch](docs/launch/)。

## License

MIT
