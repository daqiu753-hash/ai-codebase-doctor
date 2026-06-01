# 中文 soft launch 文案

我做了一个小工具：`ai-codebase-doctor`。

AI 现在几分钟就能生成一个 repo，但最常见的问题不是代码看起来不完整，而是它“看起来完整但跑不起来”：

- README 写的命令不存在
- 代码 import 了 package.json 里没声明的依赖
- 环境变量用了但 `.env.example` 没写
- 测试文件看起来像测试，但没有真实断言
- Prisma / Docker / framework setup 说明和实际文件对不上

`ai-codebase-doctor` 不是 generic linter，也不调用 LLM。它是一个 deterministic、read-only 的 AI-generated repo reality check。

试用：

```bash
npx ai-codebase-doctor .
```

GitHub: https://github.com/daqiu753-hash/ai-codebase-doctor

npm: https://www.npmjs.com/package/ai-codebase-doctor

适合场景：用 Codex / Claude Code / Cursor 快速生成项目后，先扫一遍，看看这个 repo 到底能不能安装、配置、测试和启动。
