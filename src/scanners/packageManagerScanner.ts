import type { Finding, Scanner } from '../types.js'
import { findLineNumber } from '../lineUtils.js'

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun'

const LOCKFILES: Record<PackageManager, string[]> = {
  npm: ['package-lock.json'],
  pnpm: ['pnpm-lock.yaml'],
  yarn: ['yarn.lock'],
  bun: ['bun.lock', 'bun.lockb']
}

export const packageManagerScanner: Scanner = {
  id: 'package-manager',
  name: 'Package Manager Reality Checker',
  async scan(context) {
    const findings: Finding[] = []
    const lockManagers = detectLockManagers(context.files)
    const readmeManagers = extractReadmePackageManagers(context.readmeText ?? '')
    const packageManagerField = parsePackageManagerField(context.packageJson?.packageManager)

    if (lockManagers.length > 1) {
      findings.push({
        id: 'PM004',
        title: 'Multiple package manager lockfiles detected',
        severity: 'warning',
        category: 'package-manager',
        evidence: `Detected lockfiles for ${lockManagers.join(', ')}`,
        expected: 'A project should usually commit one package manager lockfile.',
        actual: lockManagers.flatMap((manager) => LOCKFILES[manager]).filter((file) => context.files.includes(file)).join(', '),
        whyItMatters: 'AI-generated projects often mix lockfiles from copied templates, which makes install instructions ambiguous.',
        suggestedFix: 'Keep the lockfile for the intended package manager and remove stale lockfiles.'
      })
    }

    if (packageManagerField && lockManagers.length > 0 && !lockManagers.includes(packageManagerField)) {
      findings.push({
        id: 'PM003',
        title: 'packageManager field conflicts with lockfile',
        severity: 'warning',
        category: 'package-manager',
        file: context.packageJsonPath,
        line: context.packageJsonText ? findLineNumber(context.packageJsonText, '"packageManager"') : undefined,
        evidence: `package.json packageManager is ${context.packageJson?.packageManager}`,
        expected: `packageManager should match lockfile manager ${lockManagers.join(', ')}`,
        actual: `Detected ${lockManagers.join(', ')} lockfile(s).`,
        whyItMatters: 'Mismatched install metadata makes first-run setup less reproducible.',
        suggestedFix: 'Update packageManager or regenerate the lockfile with the intended package manager.'
      })
    }

    for (const readmeManager of readmeManagers) {
      if (lockManagers.length === 0) continue
      if (lockManagers.includes(readmeManager.value)) continue

      const id = readmeManager.value === 'pnpm' ? 'PM001' : readmeManager.value === 'yarn' ? 'PM002' : 'PM005'
      findings.push({
        id,
        title: 'README package manager conflicts with lockfile',
        severity: 'warning',
        category: 'package-manager',
        file: context.readmePath,
        line: readmeManager.line,
        evidence: `README uses ${readmeManager.value}`,
        expected: `README commands should match detected package manager ${lockManagers.join(', ')}`,
        actual: `Detected lockfile manager(s): ${lockManagers.join(', ')}`,
        whyItMatters: 'A generated README may instruct users to install with a package manager that does not match the committed lockfile.',
        suggestedFix: `Update README commands to use ${lockManagers[0]} or replace the lockfile intentionally.`
      })
    }

    return findings
  }
}

function detectLockManagers(files: string[]): PackageManager[] {
  return (Object.keys(LOCKFILES) as PackageManager[]).filter((manager) =>
    LOCKFILES[manager].some((file) => files.includes(file))
  )
}

function parsePackageManagerField(value: string | undefined): PackageManager | undefined {
  if (!value) return undefined
  const manager = value.split('@')[0]
  return manager === 'npm' || manager === 'pnpm' || manager === 'yarn' || manager === 'bun' ? manager : undefined
}

function extractReadmePackageManagers(markdown: string): Array<{ value: PackageManager; line: number }> {
  const result = new Map<PackageManager, { value: PackageManager; line: number }>()
  const pattern = /\b(npm|pnpm|yarn|bun)\s+(install|add|run|dev|build|start|test|exec|x)\b/
  for (const [index, line] of markdown.split(/\r?\n/).entries()) {
    const match = pattern.exec(line)
    const manager = match?.[1]
    if (manager === 'npm' || manager === 'pnpm' || manager === 'yarn' || manager === 'bun') {
      if (!result.has(manager)) result.set(manager, { value: manager, line: index + 1 })
    }
  }
  return Array.from(result.values())
}
