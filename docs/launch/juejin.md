# 掘金版本

## AI 生成的项目看起来完整，但真的能跑吗？

我做了一个 CLI：`ai-codebase-doctor`。

它的定位不是 generic linter，而是一个 **AI-generated repo reality checker**。

现在 AI coding 工具已经很擅长生成“看起来像完整项目”的 repo。但真正痛的地方经常发生在第一次运行：

- README 写了 `npm run dev`，但 `package.json` 里没有 `dev`
- 源码 import 了一个包，但依赖没声明
- 代码用了 `DATABASE_URL`，`.env.example` 却没写
- 测试文件存在，但没有真实断言
- Docker、Prisma、framework setup 文档和实际文件对不上

`ai-codebase-doctor` 就是专门检查这层“项目现实”的。

## 使用

```bash
npx ai-codebase-doctor .
```

默认行为：

- read-only
- offline
- deterministic
- 不执行目标项目 scripts
- 不调用 LLM API

## 它检查什么

主要检查：

- README commands vs `package.json` scripts
- imports vs declared dependencies
- env vars vs `.env.example`
- assertion-free tests
- Docker / database / framework setup drift
- Next.js / Vite / Express / FastAPI 的基础 profile checks

## 一个真实 field test 小案例

第一轮真实公开项目 field test 里，我扫了 FastAPI 官方公开模板 backend。

v1.0.2 发现一个误报问题：Python 测试检测把 `__init__.py`、`conftest.py` 和 tests helper modules 当成 assertion-free test files，于是产生了 9 个 `T001` false positives。

v1.0.3 做了小修：

- Python test detection 只识别 `test_*.py` 和 `*_test.py`
- 排除 `__init__.py`
- 排除 `conftest.py`
- 排除 helper / fixture modules

同一个 FastAPI backend 复跑后，findings 从 9 降到 0。

这不是大规模真实验证，也不是说工具已经适配所有项目。它只是一个具体 field test 反馈到修复的例子。

## 链接

GitHub: https://github.com/daqiu753-hash/ai-codebase-doctor

npm: https://www.npmjs.com/package/ai-codebase-doctor

