import fs from 'node:fs/promises'
import path from 'node:path'
import type { Finding, Scanner } from '../types.js'
import { stripLineComment } from '../lineUtils.js'

export const envScanner: Scanner = {
  id: 'env',
  name: 'Environment Variable Checker',
  async scan(context) {
    const findings: Finding[] = []
    const documented = parseEnvExample(context.envExampleText ?? '')
    const used = new Map<string, Array<{ file: string; line: number }>>()

    for (const file of context.sourceFiles) {
      const content = await fs.readFile(path.join(context.rootPath, file), 'utf8')
      for (const envVar of extractEnvVars(content)) {
        const occurrences = used.get(envVar.value) ?? []
        occurrences.push({ file, line: envVar.line })
        used.set(envVar.value, occurrences)
      }
    }

    for (const [envName, occurrences] of used.entries()) {
      if (!documented.has(envName)) {
        const firstOccurrence = occurrences[0]
        findings.push({
          id: 'E001',
          title: 'Environment variable used but not documented',
          severity: 'critical',
          category: 'env',
          file: firstOccurrence?.file,
          line: firstOccurrence?.line,
          evidence: `${firstOccurrence?.file} uses ${envName}`,
          expected: `${envName} should be documented in .env.example`,
          actual: context.envExamplePath ? `${envName} not found in ${context.envExamplePath}` : 'No .env.example file found',
          whyItMatters: 'Missing environment documentation is one of the most common reasons an AI-generated repo cannot be started by another developer.',
          suggestedFix: `Add ${envName}= to .env.example and document how to obtain it.`,
          agentPrompt: `Document environment variable \`${envName}\` in .env.example and README if needed.`
        })
      }
    }

    for (const envName of documented) {
      if (!used.has(envName)) {
        const line = context.envExampleText ? findDocumentedEnvLine(context.envExampleText, envName) : undefined
        findings.push({
          id: 'E002',
          title: 'Environment variable documented but not used',
          severity: 'info',
          category: 'env',
          file: context.envExamplePath,
          line,
          evidence: `.env.example documents ${envName}`,
          expected: 'Documented env vars should match real code usage.',
          actual: `${envName} was not found in source files.`,
          whyItMatters: 'Unused env vars may indicate stale README/config copied by an AI agent.',
          suggestedFix: `Remove ${envName} from .env.example if it is not required, or wire it into the application.`,
          agentPrompt: `Verify whether \`${envName}\` is still needed. Remove it from .env.example if unused.`
        })
      }
    }

    return findings
  }
}

function parseEnvExample(text: string): Set<string> {
  const result = new Set<string>()
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = /^([A-Z0-9_]+)\s*=/.exec(trimmed)
    if (match) result.add(match[1])
  }
  return result
}

function findDocumentedEnvLine(text: string, envName: string): number | undefined {
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    if (new RegExp(`^${envName}\\s*=`).test(trimmed)) return index + 1
  }
  return undefined
}

function extractEnvVars(content: string): Array<{ value: string; line: number }> {
  const result = new Map<string, { value: string; line: number }>()
  const patterns = [
    /process\.env\.([A-Z0-9_]+)/g,
    /process\.env\[['"]([A-Z0-9_]+)['"]\]/g,
    /import\.meta\.env\.([A-Z0-9_]+)/g,
    /os\.getenv\(['"]([A-Z0-9_]+)['"]\)/g,
    /getenv\(['"]([A-Z0-9_]+)['"]\)/g
  ]
  for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
    const line = stripLineComment(rawLine)
    for (const pattern of patterns) {
      pattern.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = pattern.exec(line))) {
        if (match[1] && !result.has(match[1])) {
          result.set(match[1], { value: match[1], line: index + 1 })
        }
      }
    }
  }
  return Array.from(result.values())
}
