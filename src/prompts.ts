import type { DoctorReport } from './types.js'

export function renderAgentFixPrompt(report: DoctorReport, agentName: 'codex' | 'claude-code' | 'cursor'): string {
  const critical = report.findings.filter((f) => f.severity === 'critical')
  const warnings = report.findings.filter((f) => f.severity === 'warning')

  const lines: string[] = []
  lines.push(`# Fix Prompt for ${agentName}`)
  lines.push('')
  lines.push('You are working on a codebase that was audited by AI Codebase Doctor.')
  lines.push('')
  lines.push('## Goal')
  lines.push('')
  lines.push('Fix the issues below without changing unrelated behavior. Prefer small, verifiable changes. After changes, run the relevant build/test commands and summarize what changed.')
  lines.push('')
  lines.push('## Critical issues')
  lines.push('')
  if (critical.length === 0) lines.push('No critical issues detected.')
  for (const finding of critical) {
    lines.push(`### [${finding.id}] ${finding.title}`)
    lines.push(`- File: ${finding.file ?? 'n/a'}`)
    lines.push(`- Evidence: ${finding.evidence}`)
    lines.push(`- Suggested fix: ${finding.suggestedFix}`)
    if (finding.agentPrompt) lines.push(`- Specific task: ${finding.agentPrompt}`)
    lines.push('')
  }

  lines.push('## Warnings')
  lines.push('')
  if (warnings.length === 0) lines.push('No warnings detected.')
  for (const finding of warnings) {
    lines.push(`- [${finding.id}] ${finding.title}: ${finding.suggestedFix}`)
  }

  lines.push('')
  lines.push('## Constraints')
  lines.push('')
  lines.push('- Do not delete files unless they are clearly obsolete.')
  lines.push('- Do not introduce new frameworks unless necessary.')
  lines.push('- Keep README, scripts, env docs, and tests consistent.')
  lines.push('- Explain every non-trivial change in the final response.')

  return lines.join('\n')
}
