import { describe, expect, it } from 'vitest'
import { createProgram } from '../src/cli.js'
import { normalizeFailOn, normalizeFormat, normalizeProfile, shouldFail } from '../src/cliOptions.js'

describe('CLI options', () => {
  it('treats --ci as critical failure policy', () => {
    expect(shouldFail({ critical: 1, warning: 0 }, 'critical')).toBe(true)
    expect(shouldFail({ critical: 0, warning: 1 }, 'critical')).toBe(false)
  })

  it('supports fail-on none, critical, and warning policies', () => {
    expect(shouldFail({ critical: 1, warning: 1 }, 'none')).toBe(false)
    expect(shouldFail({ critical: 0, warning: 1 }, 'warning')).toBe(true)
    expect(shouldFail({ critical: 0, warning: 0 }, 'warning')).toBe(false)
  })

  it('normalizes stable option values', () => {
    expect(normalizeFormat('all')).toBe('all')
    expect(normalizeFailOn('none')).toBe('none')
    expect(normalizeProfile('fastapi')).toBe('fastapi')
  })

  it('prints stable help text for public CLI flags', () => {
    const help = createProgram().helpInformation()

    expect(help).toContain('--ci')
    expect(help).toContain('--fail-on <severity>')
    expect(help).toContain('--format <format>')
    expect(help).toContain('--profile <profile>')
    expect(help).toContain('--online')
  })
})
