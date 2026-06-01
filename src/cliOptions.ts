import type { DoctorReport, ProjectProfile } from './types.js'

export type OutputFormat = 'console' | 'markdown' | 'json' | 'all'
export type FailOnSeverity = 'critical' | 'warning' | 'none'

export function normalizeProfile(profile: string): ProjectProfile {
  if (profile === 'auto' || profile === 'nextjs' || profile === 'vite' || profile === 'express' || profile === 'fastapi') {
    return profile
  }
  throw new Error(`Unsupported profile "${profile}". Use auto, nextjs, vite, express, or fastapi.`)
}

export function normalizeFormat(format: string): OutputFormat {
  if (format === 'console' || format === 'markdown' || format === 'json' || format === 'all') return format
  throw new Error(`Unsupported format "${format}". Use console, markdown, json, or all.`)
}

export function normalizeFailOn(failOn: string): FailOnSeverity {
  if (failOn === 'critical' || failOn === 'warning' || failOn === 'none') return failOn
  throw new Error(`Unsupported fail-on "${failOn}". Use critical, warning, or none.`)
}

export function shouldFail(summary: Pick<DoctorReport['summary'], 'critical' | 'warning'>, failOn: FailOnSeverity): boolean {
  if (failOn === 'none') return false
  if (failOn === 'critical') return summary.critical > 0
  return summary.critical > 0 || summary.warning > 0
}
