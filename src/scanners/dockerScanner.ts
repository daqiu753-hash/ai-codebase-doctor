import fs from 'node:fs/promises'
import path from 'node:path'
import type { Finding, Scanner } from '../types.js'
import { findLineNumber } from '../lineUtils.js'

export const dockerScanner: Scanner = {
  id: 'docker',
  name: 'Docker Reality Checker',
  async scan(context) {
    const findings: Finding[] = []
    const fileSet = new Set(context.files)
    const scripts = context.packageJson?.scripts ?? {}

    for (const dockerFile of context.files.filter((file) => file === 'Dockerfile' || file.endsWith('/Dockerfile'))) {
      const content = await fs.readFile(path.join(context.rootPath, dockerFile), 'utf8')
      const missingFile = extractDockerReferencedFile(content)
      if (missingFile && !fileSet.has(missingFile)) {
        findings.push({
          id: 'C001',
          title: 'Dockerfile references a missing entry file',
          severity: 'critical',
          category: 'docker',
          file: dockerFile,
          line: findLineNumber(content, missingFile),
          evidence: `${dockerFile} references ${missingFile}`,
          expected: `Referenced file should exist: ${missingFile}`,
          actual: 'File was not found in the project.',
          whyItMatters: 'Generated Dockerfiles often point at entry files that were never created.',
          suggestedFix: `Create ${missingFile}, update the Dockerfile command, or remove stale Docker config.`
        })
      }

      const exposedPort = extractExposePort(content)
      const readmePort = context.readmeText ? extractReadmePort(context.readmeText) : undefined
      if (exposedPort && readmePort && exposedPort.value !== readmePort.value) {
        findings.push({
          id: 'C002',
          title: 'Dockerfile port conflicts with README',
          severity: 'warning',
          category: 'docker',
          file: dockerFile,
          line: exposedPort.line,
          evidence: `${dockerFile} exposes ${exposedPort.value}`,
          expected: `README documented port ${readmePort.value}`,
          actual: `Dockerfile exposes ${exposedPort.value}`,
          whyItMatters: 'Port mismatches make generated Docker instructions fail at the first browser check.',
          suggestedFix: 'Align Dockerfile EXPOSE and README URL/port.'
        })
      }

      for (const command of extractPackageScriptCommands(content)) {
        if (!scripts[command.script]) {
          findings.push({
            id: 'C003',
            title: 'Dockerfile runs a missing package script',
            severity: 'critical',
            category: 'docker',
            file: dockerFile,
            line: command.line,
            evidence: `${dockerFile} runs ${command.raw}`,
            expected: `package.json should define script "${command.script}"`,
            actual: `Available scripts: ${Object.keys(scripts).join(', ') || '(none)'}`,
            whyItMatters: 'A Docker image that runs a missing script will fail on startup.',
            suggestedFix: `Add script "${command.script}" or update the Dockerfile command.`
          })
        }
      }
    }

    for (const composeFile of context.files.filter((file) => /^docker-compose\.ya?ml$/.test(file))) {
      const content = await fs.readFile(path.join(context.rootPath, composeFile), 'utf8')
      for (const command of extractPackageScriptCommands(content)) {
        if (!scripts[command.script]) {
          findings.push({
            id: 'C004',
            title: 'docker-compose command references a missing package script',
            severity: 'critical',
            category: 'docker',
            file: composeFile,
            line: command.line,
            evidence: `${composeFile} runs ${command.raw}`,
            expected: `package.json should define script "${command.script}"`,
            actual: `Available scripts: ${Object.keys(scripts).join(', ') || '(none)'}`,
            whyItMatters: 'Generated compose files frequently drift from package.json scripts.',
            suggestedFix: `Add script "${command.script}" or update docker-compose command.`
          })
        }
      }
    }

    return findings
  }
}

function extractDockerReferencedFile(text: string): string | undefined {
  const shellForm = /\b(?:CMD|ENTRYPOINT)\b[^\n]*(?:node|tsx|python|python3)\s+["']?([^\s"',\]]+\.(?:js|mjs|cjs|ts|tsx|py))/i.exec(text)
  if (shellForm?.[1]) return shellForm[1].replace(/^\.\//, '')
  const jsonForm = /\b(?:CMD|ENTRYPOINT)\b[^\n]*\[\s*["'](?:node|tsx|python|python3)["']\s*,\s*["']([^"']+\.(?:js|mjs|cjs|ts|tsx|py))["']/i.exec(text)
  return jsonForm?.[1]?.replace(/^\.\//, '')
}

function extractExposePort(text: string): { value: number; line: number } | undefined {
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    const match = /^\s*EXPOSE\s+(\d+)/i.exec(line)
    if (match?.[1]) return { value: Number(match[1]), line: index + 1 }
  }
  return undefined
}

function extractReadmePort(text: string): { value: number; line: number } | undefined {
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    const match = /localhost:(\d+)/i.exec(line)
    if (match?.[1]) return { value: Number(match[1]), line: index + 1 }
  }
  return undefined
}

function extractPackageScriptCommands(text: string): Array<{ raw: string; script: string; line: number }> {
  const commands: Array<{ raw: string; script: string; line: number }> = []
  const pattern = /\b(npm|pnpm|yarn|bun)\s+(?:run\s+)?([a-zA-Z0-9:_-]+)/g
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(line))) {
      if (!match[1] || !match[2]) continue
      if (['install', 'add', 'remove', 'exec', 'x'].includes(match[2])) continue
      commands.push({ raw: match[0], script: match[2], line: index + 1 })
    }
  }
  return commands
}
