import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { runDoctor } from '../src/index.js'
import type { DoctorReport, RunDoctorOptions } from '../src/types.js'

describe('framework profile scanners', () => {
  it('reports Next.js profile issues and missing API route paths', async () => {
    const report = await withFixture(
      {
        'package.json': JSON.stringify({
          dependencies: { next: '^15.0.0', react: '^19.0.0' },
          scripts: { build: 'next build' }
        }),
        'src/app/page.tsx': [
          "'use client'",
          'export default function Page() {',
          "  fetch('/api/customers')",
          '  return process.env.SECRET_TOKEN',
          '}'
        ].join('\n')
      },
      (rootPath) => runDoctor(rootPath, { profile: 'nextjs' })
    )

    const ids = report.findings.map((finding) => finding.id)
    expect(ids).toContain('NX003')
    expect(ids).toContain('NX002')
    expect(ids).toContain('A001')
  })

  it('reports Vite env prefix and missing entry issues', async () => {
    const report = await withFixture(
      {
        'README.md': '# Demo Vite app',
        'package.json': JSON.stringify({
          dependencies: { vite: '^8.0.0' },
          scripts: { dev: 'vite' }
        }),
        'src/component.tsx': 'export const apiUrl = import.meta.env.API_URL'
      },
      (rootPath) => runDoctor(rootPath, { profile: 'vite' })
    )

    const ids = report.findings.map((finding) => finding.id)
    expect(ids).toContain('VT001')
    expect(ids).toContain('VT002')
  })

  it('reports Express imports when dependency metadata is missing', async () => {
    const report = await withFixture(
      {
        'package.json': JSON.stringify({ scripts: { dev: 'node server.js' } }),
        'server.js': [
          "import express from 'express'",
          "const app = express()",
          "app.get('/api/health', (_req, res) => res.json({ ok: true }))"
        ].join('\n')
      },
      (rootPath) => runDoctor(rootPath, { profile: 'express' })
    )

    expect(report.findings.map((finding) => finding.id)).toContain('EX002')
  })

  it('reports FastAPI README and dependency mismatches', async () => {
    const report = await withFixture(
      {
        'README.md': ['# Demo FastAPI', '', 'Run `uvicorn main:app`.'].join('\n'),
        'main.py': 'from fastapi import FastAPI\napi = FastAPI()\n'
      },
      (rootPath) => runDoctor(rootPath, { profile: 'fastapi' })
    )

    const ids = report.findings.map((finding) => finding.id)
    expect(ids).toContain('FA001')
    expect(ids).toContain('FA002')
  })

  it('does not report API route mismatch when a route file exists', async () => {
    const report = await withFixture(
      {
        'package.json': JSON.stringify({ dependencies: { next: '^15.0.0', react: '^19.0.0' } }),
        'src/app/page.tsx': "export default function Page() { fetch('/api/customers'); return null }",
        'src/app/api/customers/route.ts': 'export function GET() { return Response.json([]) }'
      },
      (rootPath) => runDoctor(rootPath, { profile: 'nextjs' })
    )

    expect(report.findings.map((finding) => finding.id)).not.toContain('A001')
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
