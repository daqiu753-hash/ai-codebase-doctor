import fs from 'node:fs/promises'
import path from 'node:path'
import type { Finding, Scanner } from '../types.js'
import { findLineNumber } from '../lineUtils.js'

export const nodeRuntimeScanner: Scanner = {
  id: 'node-runtime',
  name: 'Node Runtime Reality Checker',
  async scan(context) {
    const findings: Finding[] = []
    const engineMajor = parseNodeMajor(context.packageJson?.engines?.node)
    const dockerFile = context.files.find((file) => file === 'Dockerfile' || file.endsWith('/Dockerfile'))
    const dockerText = dockerFile ? await fs.readFile(path.join(context.rootPath, dockerFile), 'utf8') : undefined
    const dockerMajor = dockerText ? extractDockerNodeMajor(dockerText) : undefined
    const readmeMajor = context.readmeText ? extractReadmeNodeMajor(context.readmeText) : undefined

    if (engineMajor && dockerMajor && engineMajor !== dockerMajor) {
      findings.push({
        id: 'N001',
        title: 'Node engine conflicts with Dockerfile runtime',
        severity: 'warning',
        category: 'runtime',
        file: dockerFile,
        line: dockerText ? findLineNumber(dockerText, /FROM\s+node:/i) : undefined,
        evidence: `package.json requires Node ${engineMajor}, Dockerfile uses Node ${dockerMajor}`,
        expected: 'Node versions should agree across package metadata and Dockerfile.',
        actual: `engines.node=${context.packageJson?.engines?.node}, Dockerfile node:${dockerMajor}`,
        whyItMatters: 'AI-generated repos often mix runtime versions from different templates, causing install or build failures.',
        suggestedFix: 'Align package.json engines.node and Dockerfile FROM node:<version>.'
      })
    }

    if (engineMajor && readmeMajor && engineMajor !== readmeMajor.value) {
      findings.push({
        id: 'N002',
        title: 'README Node version conflicts with package engine',
        severity: 'warning',
        category: 'runtime',
        file: context.readmePath,
        line: readmeMajor.line,
        evidence: `README mentions Node ${readmeMajor.value}`,
        expected: `README should match package.json engines.node ${context.packageJson?.engines?.node}`,
        actual: `README mentions Node ${readmeMajor.value}`,
        whyItMatters: 'Conflicting runtime instructions make setup brittle for new users.',
        suggestedFix: 'Update README or package.json engines.node so they describe the same supported runtime.'
      })
    }

    if (!context.packageJson?.engines?.node && ['nextjs', 'vite'].includes(context.framework)) {
      findings.push({
        id: 'N003',
        title: 'Node engine is not documented',
        severity: 'info',
        category: 'runtime',
        file: context.packageJsonPath,
        evidence: `${context.framework} project has no package.json engines.node field`,
        expected: 'Modern JS framework projects should document the supported Node version.',
        actual: 'package.json engines.node is missing.',
        whyItMatters: 'AI-generated repos frequently omit runtime requirements, which makes install failures harder to diagnose.',
        suggestedFix: 'Add an engines.node field that matches the supported runtime.'
      })
    }

    if (dockerMajor && dockerMajor < 18 && ['nextjs', 'vite'].includes(context.framework)) {
      findings.push({
        id: 'N004',
        title: 'Dockerfile uses an old Node runtime',
        severity: 'warning',
        category: 'runtime',
        file: dockerFile,
        line: dockerText ? findLineNumber(dockerText, /FROM\s+node:/i) : undefined,
        evidence: `Dockerfile uses node:${dockerMajor}`,
        expected: `${context.framework} projects usually require a modern Node runtime.`,
        actual: `Dockerfile uses Node ${dockerMajor}.`,
        whyItMatters: 'Older Node images may fail with current framework dependencies.',
        suggestedFix: 'Use a modern supported Node image such as node:20 or node:22.'
      })
    }

    return findings
  }
}

function parseNodeMajor(range: string | undefined): number | undefined {
  if (!range) return undefined
  const match = /(\d+)/.exec(range)
  return match?.[1] ? Number(match[1]) : undefined
}

function extractDockerNodeMajor(text: string): number | undefined {
  const match = /FROM\s+node:(\d+)/i.exec(text)
  return match?.[1] ? Number(match[1]) : undefined
}

function extractReadmeNodeMajor(text: string): { value: number; line: number } | undefined {
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    const match = /\bNode(?:\.js)?\s*(?:version\s*)?v?(\d+)/i.exec(line)
    if (match?.[1]) return { value: Number(match[1]), line: index + 1 }
  }
  return undefined
}
