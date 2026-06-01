import fs from 'node:fs/promises'
import path from 'node:path'
import type { Finding, Scanner } from '../types.js'
import { findFirstMatchingLine } from '../lineUtils.js'

export const testRealityScanner: Scanner = {
  id: 'test-reality',
  name: 'Test Reality Checker',
  async scan(context) {
    const findings: Finding[] = []

    for (const file of context.testFiles) {
      const content = await fs.readFile(path.join(context.rootPath, file), 'utf8')
      if (!hasAssertion(content)) {
        findings.push({
          id: 'T001',
          title: 'Test file has no real assertion',
          severity: 'warning',
          category: 'tests',
          file,
          line: findFirstMatchingLine(content, /\b(describe|it|test)\s*\(/),
          evidence: `${file} contains test structure but no obvious assertion.`,
          expected: 'Tests should include expect/assert/should or equivalent assertions.',
          actual: 'No assertion pattern was found.',
          whyItMatters: 'AI agents often generate test files that look legitimate but verify nothing.',
          suggestedFix: 'Add meaningful assertions that verify real application behavior.',
          agentPrompt: `Rewrite \`${file}\` so that it contains meaningful assertions against real behavior.`
        })
      }
    }

    return findings
  }
}

function hasAssertion(content: string): boolean {
  return /\b(expect|assert|should|toBe|toEqual|toMatch|pytest\.raises|self\.assert)\b/.test(content)
}
