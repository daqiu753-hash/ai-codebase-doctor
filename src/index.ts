import { detectProject } from './context.js'
import { scanners } from './scanners/index.js'
import { scoreFindings, summarizeFindings } from './scoring.js'
import type { DoctorReport, Finding, RunDoctorOptions } from './types.js'

export async function runDoctor(rootPath: string, options: RunDoctorOptions = {}): Promise<DoctorReport> {
  const context = await detectProject(rootPath, options)
  const findings: Finding[] = []

  for (const scanner of scanners) {
    const scannerFindings = await scanner.scan(context)
    findings.push(...scannerFindings)
  }

  const dedupedFindings = dedupeFindings(findings)

  dedupedFindings.sort(
    (a, b) =>
      severityWeight(a.severity) - severityWeight(b.severity) ||
      a.id.localeCompare(b.id) ||
      (a.file ?? '').localeCompare(b.file ?? '') ||
      a.evidence.localeCompare(b.evidence)
  )

  return {
    score: scoreFindings(dedupedFindings),
    summary: summarizeFindings(dedupedFindings),
    context,
    findings: dedupedFindings
  }
}

function dedupeFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>()
  const result: Finding[] = []
  for (const finding of findings) {
    const key = [finding.id, finding.file ?? '', finding.line ?? '', finding.evidence].join('\0')
    if (seen.has(key)) continue
    seen.add(key)
    result.push(finding)
  }
  return result
}

function severityWeight(severity: Finding['severity']): number {
  if (severity === 'critical') return 0
  if (severity === 'warning') return 1
  return 2
}

export type { DoctorReport, Finding, ProjectContext, Scanner } from './types.js'
