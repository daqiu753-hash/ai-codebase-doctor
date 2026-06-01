import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { detectProject } from '../src/context.js'
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

  it('reports Express apps without obvious route handlers', async () => {
    const report = await withFixture(
      {
        'package.json': JSON.stringify({ dependencies: { express: '^4.19.2' }, scripts: { dev: 'node server.js' } }),
        'server.js': ["import express from 'express'", 'const app = express()', 'app.listen(3000)'].join('\n')
      },
      (rootPath) => runDoctor(rootPath, { profile: 'express' })
    )

    expect(report.findings.map((finding) => finding.id)).toContain('EX004')
  })

  it('does not report API mismatch when an Express route exists', async () => {
    const report = await withFixture(
      {
        'package.json': JSON.stringify({ dependencies: { express: '^4.19.2' }, scripts: { dev: 'node server.js' } }),
        'server.js': [
          "import express from 'express'",
          'const app = express()',
          "app.get('/api/health', (_req, res) => res.json({ ok: true }))",
          'app.listen(3000)'
        ].join('\n'),
        'src/client.ts': "fetch('/api/health')"
      },
      (rootPath) => runDoctor(rootPath, { profile: 'express' })
    )

    const ids = report.findings.map((finding) => finding.id)
    expect(ids).not.toContain('A001')
    expect(ids).not.toContain('EX004')
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
    expect(ids).toContain('FA003')
  })

  it('does not report FastAPI route warning when a route decorator exists', async () => {
    const report = await withFixture(
      {
        'README.md': ['# Demo FastAPI', '', 'Run `uvicorn main:app`.'].join('\n'),
        'requirements.txt': 'fastapi==0.115.0\nuvicorn==0.30.0\n',
        'main.py': ['from fastapi import FastAPI', 'app = FastAPI()', '', '@app.get("/api/health")', 'def health():', '    return {"ok": True}'].join('\n')
      },
      (rootPath) => runDoctor(rootPath, { profile: 'fastapi' })
    )

    expect(report.findings.map((finding) => finding.id)).not.toContain('FA003')
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

  it('does not report API route mismatch for pages/api routes', async () => {
    const report = await withFixture(
      {
        'package.json': JSON.stringify({ dependencies: { next: '^15.0.0', react: '^19.0.0' } }),
        'src/app/page.tsx': "export default function Page() { fetch('/api/customers'); return null }",
        'pages/api/customers.ts': 'export default function handler(_req, res) { res.status(200).json([]) }'
      },
      (rootPath) => runDoctor(rootPath, { profile: 'nextjs' })
    )

    expect(report.findings.map((finding) => finding.id)).not.toContain('A001')
  })

  it('detects supported project profiles', async () => {
    await withFixture(
      {
        'package.json': JSON.stringify({ dependencies: { vite: '^6.0.0' } }),
        'index.html': '<div id="root"></div>',
        'src/main.ts': 'console.log("vite")'
      },
      async (rootPath) => {
        const context = await detectProject(rootPath)
        expect(context.detectedProfile).toBe('vite')
        return emptyReport(context.rootPath)
      }
    )
  })
})

function emptyReport(rootPath: string): DoctorReport {
  return {
    score: 100,
    summary: { critical: 0, warning: 0, info: 0, total: 0 },
    context: {
      rootPath,
      files: [],
      sourceFiles: [],
      testFiles: [],
      framework: 'unknown',
      detectedProfile: 'unknown',
      selectedProfile: 'unknown',
      options: {},
      packageManager: 'unknown'
    },
    findings: []
  }
}

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
