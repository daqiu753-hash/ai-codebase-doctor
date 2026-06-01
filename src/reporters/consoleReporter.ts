import type { DoctorReport } from '../types.js'

export function renderConsoleReport(report: DoctorReport): string {
  const lines: string[] = []
  lines.push('AI Codebase Doctor')
  lines.push('')
  lines.push(`Score: ${report.score}/100`)
  lines.push(`Critical: ${report.summary.critical}`)
  lines.push(`Warnings: ${report.summary.warning}`)
  lines.push(`Info: ${report.summary.info}`)
  lines.push('')
  lines.push('Detected:')
  lines.push(`- Framework: ${report.context.framework}`)
  lines.push(`- Detected profile: ${report.context.detectedProfile}`)
  lines.push(`- Selected profile: ${report.context.selectedProfile}`)
  lines.push(`- Package manager: ${report.context.packageManager}`)
  lines.push(`- Source files: ${report.context.sourceFiles.length}`)
  lines.push(`- Test files: ${report.context.testFiles.length}`)
  lines.push('')

  if (report.findings.length === 0) {
    lines.push('No findings detected.')
    return lines.join('\n')
  }

  for (const finding of report.findings) {
    lines.push(`[${finding.id}] ${finding.title}`)
    lines.push(`Severity: ${finding.severity}`)
    if (finding.file) lines.push(`File: ${finding.file}`)
    if (finding.line) lines.push(`Line: ${finding.line}`)
    lines.push(`Evidence: ${finding.evidence}`)
    lines.push(`Fix: ${finding.suggestedFix}`)
    lines.push('')
  }

  return lines.join('\n')
}
