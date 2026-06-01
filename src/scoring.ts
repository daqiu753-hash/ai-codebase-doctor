import type { Finding } from './types.js'

export function scoreFindings(findings: Finding[]): number {
  let score = 100
  for (const finding of findings) {
    if (finding.severity === 'critical') score -= 12
    if (finding.severity === 'warning') score -= 5
    if (finding.severity === 'info') score -= 1
  }
  return Math.max(0, score)
}

export function summarizeFindings(findings: Finding[]) {
  return {
    critical: findings.filter((f) => f.severity === 'critical').length,
    warning: findings.filter((f) => f.severity === 'warning').length,
    info: findings.filter((f) => f.severity === 'info').length,
    total: findings.length
  }
}
