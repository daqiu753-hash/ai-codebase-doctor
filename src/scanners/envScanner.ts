import fs from 'node:fs/promises'
import path from 'node:path'
import type { Finding, Scanner } from '../types.js'

export const envScanner: Scanner = {
  id: 'env',
  name: 'Environment Variable Checker',
  async scan(context) {
    const findings: Finding[] = []
    const documented = parseEnvExample(context.envExampleText ?? '')
    const used = new Map<string, string[]>()

    for (const file of context.sourceFiles) {
      const content = await fs.readFile(path.join(context.rootPath, file), 'utf8')
      for (const envName of extractEnvVars(content)) {
        const files = used.get(envName) ?? []
        files.push(file)
        used.set(envName, files)
      }
    }

    for (const [envName, files] of used.entries()) {
      if (!documented.has(envName)) {
        findings.push({
          id: 'E001',
          title: 'Environment variable used but not documented',
          severity: 'critical',
          category: 'env',
          file: files[0],
          evidence: `${files[0]} uses ${envName}`,
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
        findings.push({
          id: 'E002',
          title: 'Environment variable documented but not used',
          severity: 'info',
          category: 'env',
          file: context.envExamplePath,
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

function extractEnvVars(content: string): Set<string> {
  const result = new Set<string>()
  const patterns = [
    /process\.env\.([A-Z0-9_]+)/g,
    /process\.env\[['"]([A-Z0-9_]+)['"]\]/g,
    /import\.meta\.env\.([A-Z0-9_]+)/g,
    /os\.getenv\(['"]([A-Z0-9_]+)['"]\)/g,
    /getenv\(['"]([A-Z0-9_]+)['"]\)/g
  ]
  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(content))) {
      result.add(match[1])
    }
  }
  return result
}
