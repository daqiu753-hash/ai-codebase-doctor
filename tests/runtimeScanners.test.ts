import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { runDoctor } from '../src/index.js'
import type { DoctorReport } from '../src/types.js'

describe('runtime reality scanners', () => {
  it('reports README package manager commands that conflict with lockfiles', async () => {
    const report = await withFixture(
      {
        'README.md': ['# Demo', '', '```bash', 'pnpm install', 'pnpm dev', '```'].join('\n'),
        'package-lock.json': '{}',
        'package.json': JSON.stringify({ scripts: { dev: 'vite' } })
      },
      runDoctor
    )

    const finding = report.findings.find((item) => item.id === 'PM001')
    expect(finding?.line).toBe(4)
    expect(finding?.severity).toBe('warning')
  })

  it('reports Node engine and Dockerfile runtime conflicts', async () => {
    const report = await withFixture(
      {
        'package.json': JSON.stringify({
          engines: { node: '>=20' },
          dependencies: { vite: '^8.0.0' }
        }),
        Dockerfile: ['FROM node:16-alpine', 'EXPOSE 5173', 'CMD ["npm", "run", "dev"]'].join('\n')
      },
      runDoctor
    )

    expect(report.findings.map((item) => item.id)).toContain('N001')
    expect(report.findings.map((item) => item.id)).toContain('N004')
  })

  it('reports Dockerfile commands that reference missing scripts and files', async () => {
    const report = await withFixture(
      {
        'package.json': JSON.stringify({ scripts: { build: 'vite build' } }),
        Dockerfile: ['FROM node:20', 'CMD ["node", "server.js"]', 'RUN npm run serve'].join('\n')
      },
      runDoctor
    )

    const ids = report.findings.map((item) => item.id)
    expect(ids).toContain('C001')
    expect(ids).toContain('C003')
  })

  it('reports Prisma setup claims without schema files', async () => {
    const report = await withFixture(
      {
        'README.md': ['# Demo', '', 'Run `pnpm prisma migrate dev`.'].join('\n'),
        'package.json': JSON.stringify({
          scripts: { migrate: 'prisma migrate dev' },
          dependencies: { prisma: '^6.0.0' }
        })
      },
      runDoctor
    )

    const ids = report.findings.map((item) => item.id)
    expect(ids).toContain('DB001')
    expect(ids).toContain('DB002')
    expect(ids).toContain('DB005')
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
