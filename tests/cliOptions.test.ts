import { describe, expect, it } from 'vitest'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createProgram, isCliEntryPoint } from '../src/cli.js'
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

  it('recognizes npm bin symlinks as CLI entrypoints', async () => {
    const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'ai-codebase-doctor-cli-'))
    try {
      const realEntry = path.join(root, 'dist', 'cli.js')
      const binEntry = path.join(root, 'node_modules', '.bin', 'ai-codebase-doctor')
      await fsp.mkdir(path.dirname(realEntry), { recursive: true })
      await fsp.mkdir(path.dirname(binEntry), { recursive: true })
      await fsp.writeFile(realEntry, '#!/usr/bin/env node\n', 'utf8')
      await fsp.symlink(realEntry, binEntry)

      expect(isCliEntryPoint(pathToFileURL(realEntry).href, binEntry)).toBe(true)
    } finally {
      await fsp.rm(root, { recursive: true, force: true })
    }
  })
})
