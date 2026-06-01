# AI Codebase Doctor

AI 五分钟生成一个项目，但它真的能跑吗？

**AI Codebase Doctor** 是一个专门检查 AI 生成代码库真实性的 CLI 工具。它不做泛泛的代码风格检查，而是优先检查 AI 生成项目最容易“看起来完整、实际跑不起来”的地方。

第一版重点检查：

- README 里的启动命令是否真实存在
- `package.json` scripts 是否完整
- 代码使用的环境变量是否写入 `.env.example`
- JS/TS import 的包是否声明在依赖文件里
- 测试文件是否只是 AI 生成的空壳测试
- 输出 Markdown / JSON 报告
- 生成可交给 Codex / Claude Code 的修复提示词

开发运行：

```bash
npm install
npm run dev -- examples/ai-generated-fake-saas --out reports
```

项目定位：

```text
AI 生成代码库的真实性、可运行性、一致性检查器。
```
