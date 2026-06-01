import { detectProject } from './context.js'
import { scanners } from './scanners/index.js'
import { scoreFindings, summarizeFindings } from './scoring.js'
import type { DoctorReport, Finding } from './types.js'

export async function runDoctor(rootPath: string): Promise<DoctorReport> {
  const context = await detectProject(rootPath)
  const findings: Finding[] = []

  for (const scanner of scanners) {
    const scannerFindings = await scanner.scan(context)
    findings.push(...scannerFindings)
  }

  findings.sort(
    (a, b) =>
      severityWeight(a.severity) - severityWeight(b.severity) ||
      a.id.localeCompare(b.id) ||
      (a.file ?? '').localeCompare(b.file ?? '') ||
      a.evidence.localeCompare(b.evidence)
  )

  return {
    score: scoreFindings(findings),
    summary: summarizeFindings(findings),
    context,
    findings
  }
}

function severityWeight(severity: Finding['severity']): number {
  if (severity === 'critical') return 0
  if (severity === 'warning') return 1
  return 2
}

export type { DoctorReport, Finding, ProjectContext, Scanner } from './types.js'
