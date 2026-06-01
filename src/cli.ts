#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { Command } from 'commander'
import { runDoctor } from './index.js'
import { renderConsoleReport } from './reporters/consoleReporter.js'
import { renderMarkdownReport } from './reporters/markdownReporter.js'
import { renderAgentFixPrompt } from './prompts.js'

const program = new Command()

program
  .name('ai-codebase-doctor')
  .description('Audit AI-generated codebases and tell you why they will not run.')
  .argument('[path]', 'Project path to scan', '.')
  .option('--out <dir>', 'Output directory for reports', 'doctor-reports')
  .option('--json', 'Print JSON report to stdout')
  .option('--no-files', 'Do not write report files')
  .option('--ci', 'Exit with a non-zero status when critical findings are present')
  .option('--online', 'Opt in to network-backed registry checks')
  .option('--profile <profile>', 'Project profile to use: auto, nextjs, vite, express, fastapi', 'auto')
  .action(
    async (
      targetPath: string,
      options: { out: string; json?: boolean; files: boolean; ci?: boolean; online?: boolean; profile: string }
    ) => {
    const report = await runDoctor(targetPath, {
      online: options.online,
      profile: normalizeProfile(options.profile)
    })

    if (options.json) {
      console.log(JSON.stringify(report, null, 2))
    } else {
      console.log(renderConsoleReport(report))
    }

    if (options.files) {
      const outDir = path.resolve(options.out)
      await fs.mkdir(outDir, { recursive: true })
      await fs.writeFile(path.join(outDir, 'doctor-report.md'), renderMarkdownReport(report), 'utf8')
      await fs.writeFile(path.join(outDir, 'doctor-report.json'), JSON.stringify(report, null, 2), 'utf8')
      await fs.writeFile(path.join(outDir, 'fix-with-codex.md'), renderAgentFixPrompt(report, 'codex'), 'utf8')
      await fs.writeFile(path.join(outDir, 'fix-with-claude-code.md'), renderAgentFixPrompt(report, 'claude-code'), 'utf8')
      await fs.writeFile(path.join(outDir, 'fix-with-cursor.md'), renderAgentFixPrompt(report, 'cursor'), 'utf8')
      console.log(`\nReports generated in ${outDir}`)
    }

    if (options.ci && report.summary.critical > 0) {
      process.exitCode = 1
    }
  }
  )

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

function normalizeProfile(profile: string) {
  if (['auto', 'nextjs', 'vite', 'express', 'fastapi'].includes(profile)) return profile as never
  throw new Error(`Unsupported profile "${profile}". Use auto, nextjs, vite, express, or fastapi.`)
}
