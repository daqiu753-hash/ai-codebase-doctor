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
  .option('--format <format>', 'Output format: console, markdown, json, all', 'all')
  .option('--fail-on <severity>', 'Exit non-zero on findings at or above severity: critical, warning, none', 'none')
  .option('--online', 'Opt in to network-backed registry checks')
  .option('--profile <profile>', 'Project profile to use: auto, nextjs, vite, express, fastapi', 'auto')
  .action(
    async (
      targetPath: string,
      options: {
        out: string
        json?: boolean
        files: boolean
        ci?: boolean
        format: string
        failOn: string
        online?: boolean
        profile: string
      }
    ) => {
    const format = options.json ? 'json' : normalizeFormat(options.format)
    const failOn = options.ci ? 'critical' : normalizeFailOn(options.failOn)
    const report = await runDoctor(targetPath, {
      online: options.online,
      profile: normalizeProfile(options.profile)
    })
    const outDir = path.resolve(options.out)

    if (options.json) {
      console.log(JSON.stringify(report, null, 2))
    } else if (format === 'console' || format === 'all') {
      console.log(renderConsoleReport(report))
    } else if (!options.files && format === 'json') {
      console.log(JSON.stringify(report, null, 2))
    } else if (!options.files && format === 'markdown') {
      console.log(renderMarkdownReport(report))
    } else {
      console.log(`AI Codebase Doctor: ${report.summary.total} findings, score ${report.score}/100`)
    }

    if (options.files) {
      await fs.mkdir(outDir, { recursive: true })
      if (format === 'markdown' || format === 'all') {
        await fs.writeFile(path.join(outDir, 'doctor-report.md'), renderMarkdownReport(report), 'utf8')
        await fs.writeFile(path.join(outDir, 'fix-with-codex.md'), renderAgentFixPrompt(report, 'codex'), 'utf8')
        await fs.writeFile(path.join(outDir, 'fix-with-claude-code.md'), renderAgentFixPrompt(report, 'claude-code'), 'utf8')
        await fs.writeFile(path.join(outDir, 'fix-with-cursor.md'), renderAgentFixPrompt(report, 'cursor'), 'utf8')
      }
      if (format === 'json' || format === 'all') {
        await fs.writeFile(path.join(outDir, 'doctor-report.json'), JSON.stringify(report, null, 2), 'utf8')
      }
      if (format !== 'console') console.log(`\nReports generated in ${outDir}`)
    }

    if (shouldFail(report.summary, failOn)) {
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

function normalizeFormat(format: string): 'console' | 'markdown' | 'json' | 'all' {
  if (format === 'console' || format === 'markdown' || format === 'json' || format === 'all') return format
  throw new Error(`Unsupported format "${format}". Use console, markdown, json, or all.`)
}

function normalizeFailOn(failOn: string): 'critical' | 'warning' | 'none' {
  if (failOn === 'critical' || failOn === 'warning' || failOn === 'none') return failOn
  throw new Error(`Unsupported fail-on "${failOn}". Use critical, warning, or none.`)
}

function shouldFail(summary: { critical: number; warning: number }, failOn: 'critical' | 'warning' | 'none'): boolean {
  if (failOn === 'none') return false
  if (failOn === 'critical') return summary.critical > 0
  return summary.critical > 0 || summary.warning > 0
}
