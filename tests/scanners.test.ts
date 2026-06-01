import { describe, expect, it } from 'vitest'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { runDoctor } from '../src/index.js'
import type { DoctorReport } from '../src/types.js'

describe('ai-codebase-doctor example fixture', () => {
  it('finds expected issues in the broken example app', async () => {
    const report = await runDoctor('examples/ai-generated-fake-saas')
    const ids = report.findings.map((finding) => finding.id)
    expect(ids).toContain('R001')
    expect(ids).toContain('E001')
    expect(ids).toContain('D001')
    expect(ids).toContain('T001')
    expect(report.score).toBeLessThan(100)
  })
})

describe('scanner behavior', () => {
  it('checks README package script commands without flagging package binary commands', async () => {
    const report = await withFixture(
      {
        'README.md': [
          '# Demo',
          '',
          '```bash',
          'pnpm dev',
          'pnpm prisma migrate dev',
          'npm run test',
          '```'
        ].join('\n'),
        'package.json': JSON.stringify({
          scripts: {
            test: 'vitest run'
          }
        })
      },
      runDoctor
    )

    const readmeFindings = report.findings.filter((finding) => finding.id === 'R001')
    expect(readmeFindings).toHaveLength(1)
    expect(readmeFindings[0]?.evidence).toContain('pnpm dev')
  })

  it('reports env vars used without docs and docs without code usage', async () => {
    const report = await withFixture(
      {
        '.env.example': ['DATABASE_URL=', 'STALE_TOKEN='].join('\n'),
        'package.json': JSON.stringify({ scripts: {} }),
        'src/index.ts': [
          'export const databaseUrl = process.env.DATABASE_URL',
          'export const secret = process.env.SECRET_TOKEN'
        ].join('\n')
      },
      runDoctor
    )

    const envEvidence = report.findings
      .filter((finding) => finding.category === 'env')
      .map((finding) => finding.evidence)

    expect(envEvidence).toContain('src/index.ts uses SECRET_TOKEN')
    expect(envEvidence).toContain('.env.example documents STALE_TOKEN')
    expect(envEvidence).not.toContain('src/index.ts uses DATABASE_URL')
  })

  it('reports imported packages that are not declared', async () => {
    const report = await withFixture(
      {
        'package.json': JSON.stringify({
          dependencies: {
            react: '^19.0.0'
          }
        }),
        'src/index.ts': [
          "import path from 'node:path'",
          "import React from 'react'",
          "import express from 'express'",
          "import local from './local.js'",
          'export { path, React, express, local }'
        ].join('\n'),
        'src/local.ts': 'export default true'
      },
      runDoctor
    )

    const dependencyFindings = report.findings.filter((finding) => finding.id === 'D001')
    expect(dependencyFindings).toHaveLength(1)
    expect(dependencyFindings[0]?.evidence).toBe('src/index.ts imports express')
  })

  it('reports test files that do not contain obvious assertions', async () => {
    const report = await withFixture(
      {
        'package.json': JSON.stringify({ scripts: { test: 'vitest run' } }),
        'tests/empty.test.ts': [
          "import { it } from 'vitest'",
          "it('does nothing', () => {",
          '  const result = true',
          '})'
        ].join('\n'),
        'tests/real.test.ts': [
          "import { expect, it } from 'vitest'",
          "it('checks a value', () => {",
          '  expect(true).toBe(true)',
          '})'
        ].join('\n')
      },
      runDoctor
    )

    const testFindings = report.findings.filter((finding) => finding.id === 'T001')
    expect(testFindings).toHaveLength(1)
    expect(testFindings[0]?.file).toBe('tests/empty.test.ts')
  })
})

async function withFixture(
  files: Record<string, string>,
  callback: (rootPath: string) => Promise<DoctorReport>
): Promise<DoctorReport> {
  const rootPath = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-codebase-doctor-'))
  try {
    for (const [file, content] of Object.entries(files)) {
      const filePath = path.join(rootPath, file)
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, content, 'utf8')
    }
    return await callback(rootPath)
  } finally {
    await fs.rm(rootPath, { recursive: true, force: true })
  }
}
