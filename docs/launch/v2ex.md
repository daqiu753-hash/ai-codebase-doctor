# V2EX 版本

标题备选：

- 做了一个检查 AI 生成 repo 到底能不能跑的 CLI
- AI 生成的项目看起来很完整，但真的能跑吗？
- `ai-codebase-doctor`：不是 linter，而是 AI-generated repo reality checker

正文：

最近做了一个小工具：`ai-codebase-doctor`。

背景很简单：现在用 Codex / Claude Code / Cursor 之类工具，几分钟生成一个 repo 很容易。但很多 repo 的问题不是“看起来没写完”，而是“看起来写完了，但第一次运行就发现 README、依赖、环境变量、测试、Docker/DB 配置互相对不上”。

所以我做了一个 **AI-generated repo reality checker**。它不是 generic linter，不检查代码风格，也不做自动修复。它只看项目现实是否自洽：

- README 里的 `npm run dev` 是否真的存在
- 代码 import 的包是否在 `package.json` 声明
- 代码使用的 env var 是否写进 `.env.example`
- 测试文件是不是只有壳，没有真实断言
- Docker / Prisma / framework setup 是否和文件结构对得上

使用方式：

```bash
npx ai-codebase-doctor .
```

默认 read-only、offline、deterministic，不执行目标项目 scripts，也不调用 LLM API。

真实 field test 的一个小例子：扫 FastAPI 官方公开模板 backend 时，v1.0.2 把 `__init__.py`、`conftest.py` 和 tests helper modules 误报成 9 个 `T001` assertion-free tests。v1.0.3 收窄 Python test detection 后，同一个项目复跑降到 0 个 findings。

这个不能当作“大规模真实验证”，目前只是第一轮公开项目试跑里的一个具体修复。后面会继续扩大 field test，尤其关注误报。

所以我现在更把它定位成 AI 生成项目的第一层 sanity check，不是安全审计，也不是生产级质量保证。

GitHub: https://github.com/daqiu753-hash/ai-codebase-doctor

npm: https://www.npmjs.com/package/ai-codebase-doctor

欢迎拍砖，尤其是：你们用 AI 生成项目时，最常见的“看起来完整但跑不起来”的坑是什么？
