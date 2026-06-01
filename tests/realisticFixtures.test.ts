import { describe, expect, it } from 'vitest'
import { runDoctor } from '../src/index.js'

const healthyFixtures = [
  ['realistic-nextjs-app', 'nextjs'],
  ['realistic-vite-app', 'vite'],
  ['realistic-express-app', 'express'],
  ['realistic-fastapi-app', 'fastapi']
] as const

describe('realistic fixtures', () => {
  it.each(healthyFixtures)('%s has no critical findings', async (fixtureName, profile) => {
    const report = await runDoctor(`tests/fixtures/realistic/${fixtureName}`, { profile })
    expect(report.summary.critical).toBe(0)
  })

  it('keeps generated AI SaaS fixture findings explainable', async () => {
    const report = await runDoctor('tests/fixtures/realistic/realistic-ai-saas-generated', { profile: 'auto' })
    const ids = report.findings.map((finding) => finding.id)

    expect(report.summary.critical).toBeGreaterThan(0)
    expect(ids).toContain('D001')
    expect(ids).toContain('E001')
    expect(ids).toContain('R001')
    expect(ids).toContain('S002')
    expect(new Set(report.findings.map((finding) => `${finding.id}:${finding.file}:${finding.line}:${finding.evidence}`)).size).toBe(
      report.findings.length
    )
  })
})
