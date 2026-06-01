import path from 'node:path'
import type { Finding, Scanner } from '../types.js'

export const scriptScanner: Scanner = {
  id: 'scripts',
  name: 'Package Script Checker',
  async scan(context) {
    const findings: Finding[] = []
    const scripts = context.packageJson?.scripts ?? {}
    const fileSet = new Set(context.files)

    for (const [scriptName, command] of Object.entries(scripts)) {
      const referencedFiles = extractReferencedFiles(command)
      for (const file of referencedFiles) {
        const normalized = file.replace(/^\.\//, '')
        if (!fileSet.has(normalized) && !fileSet.has(path.normalize(normalized))) {
          findings.push({
            id: 'S002',
            title: 'Package script references missing file',
            severity: 'critical',
            category: 'scripts',
            file: context.packageJsonPath,
            evidence: `script "${scriptName}": ${command}`,
            expected: `Referenced file should exist: ${file}`,
            actual: 'File was not found in the project.',
            whyItMatters: 'Generated projects frequently include scripts that reference entry files that were never created.',
            suggestedFix: `Create ${file}, update the script, or remove the broken script.`,
            agentPrompt: `Fix package script \`${scriptName}\`: it references missing file \`${file}\`.`
          })
        }
      }
    }

    return findings
  }
}

function extractReferencedFiles(command: string): string[] {
  const results = new Set<string>()
  const filePattern = /(?:node|tsx|ts-node|vite-node|python|python3)\s+([^\s]+\.(?:js|mjs|cjs|ts|tsx|py))/g
  let match: RegExpExecArray | null
  while ((match = filePattern.exec(command))) {
    results.add(match[1])
  }
  return Array.from(results)
}
