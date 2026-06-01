import type { DoctorReport } from '../types.js'

export function renderMarkdownReport(report: DoctorReport): string {
  const lines: string[] = []
  lines.push('# AI Codebase Doctor Report')
  lines.push('')
  lines.push(`**Score:** ${report.score}/100`)
  lines.push(`**Schema version:** ${report.schemaVersion}`)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Critical: ${report.summary.critical}`)
  lines.push(`- Warnings: ${report.summary.warning}`)
  lines.push(`- Info: ${report.summary.info}`)
  lines.push(`- Total findings: ${report.summary.total}`)
  lines.push('')
  lines.push('## Detected Project')
  lines.push('')
  lines.push(`- Framework: ${report.context.framework}`)
  lines.push(`- Detected profile: ${report.context.detectedProfile}`)
  lines.push(`- Selected profile: ${report.context.selectedProfile}`)
  lines.push(`- Package manager: ${report.context.packageManager}`)
  lines.push(`- README: ${report.context.readmePath ?? 'not found'}`)
  lines.push(`- Package file: ${report.context.packageJsonPath ?? 'not found'}`)
  lines.push(`- Env example: ${report.context.envExamplePath ?? 'not found'}`)
  lines.push('')

  lines.push('## Findings')
  lines.push('')
  if (report.findings.length === 0) {
    lines.push('No findings detected.')
  } else {
    for (const finding of report.findings) {
      lines.push(`### [${finding.id}] ${finding.title}`)
      lines.push('')
      lines.push(`- Severity: ${finding.severity}`)
      lines.push(`- Category: ${finding.category}`)
      if (finding.file) lines.push(`- File: ${finding.file}`)
      if (finding.line) lines.push(`- Line: ${finding.line}`)
      lines.push(`- Evidence: ${finding.evidence}`)
      if (finding.expected) lines.push(`- Expected: ${finding.expected}`)
      if (finding.actual) lines.push(`- Actual: ${finding.actual}`)
      lines.push(`- Why it matters: ${finding.whyItMatters}`)
      lines.push(`- Suggested fix: ${finding.suggestedFix}`)
      lines.push('')
    }
  }

  lines.push('## Suggested Fix Order')
  lines.push('')
  const critical = report.findings.filter((f) => f.severity === 'critical')
  if (critical.length === 0) {
    lines.push('No critical issues detected.')
  } else {
    for (const [index, finding] of critical.entries()) {
      lines.push(`${index + 1}. [${finding.id}] ${finding.title}`)
    }
  }
  lines.push('')

  return lines.join('\n')
}
