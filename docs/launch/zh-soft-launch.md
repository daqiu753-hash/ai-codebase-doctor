# 中文 Soft Launch

我做了一个小工具：`ai-codebase-doctor`。

AI 现在几分钟就能生成一个 repo，但很多时候问题不是“代码看起来不完整”，而是“看起来很完整，但第一次运行就卡住”：

- README 写的命令不存在
- 代码 import 了 `package.json` 里没声明的依赖
- 代码用了环境变量，但 `.env.example` 没写
- 测试文件看起来像测试，其实没有真实断言
- Docker / Prisma / framework setup 和实际文件对不上

`ai-codebase-doctor` 是一个 **AI-generated repo reality checker**，不是 generic linter。它默认 read-only、offline、deterministic，不执行目标项目 scripts，也不调用 LLM API。

使用：

```bash
npx ai-codebase-doctor .
```

一个真实 field test 小例子：在 FastAPI 官方公开模板 backend 上，v1.0.2 曾把 `__init__.py`、`conftest.py` 和 tests helper modules 误报成 9 个 `T001` assertion-free tests。v1.0.3 针对这个问题收窄 Python test detection 后，同一项目复跑降到 0 个 findings。

这不是“大规模真实验证”，只是第一轮 field test 中一个具体误报被修掉的例子。后续还会继续扩大公开项目试跑。

所以它现在更适合当作 AI 生成项目的第一层 sanity check，而不是安全审计或生产级质量保证。

GitHub: https://github.com/daqiu753-hash/ai-codebase-doctor

npm: https://www.npmjs.com/package/ai-codebase-doctor
