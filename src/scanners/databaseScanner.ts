import type { Finding, Scanner } from '../types.js'

export const databaseScanner: Scanner = {
  id: 'database',
  name: 'Database Setup Reality Checker',
  async scan(context) {
    const findings: Finding[] = []
    const readme = context.readmeText ?? ''
    const scripts = context.packageJson?.scripts ?? {}
    const deps = {
      ...context.packageJson?.dependencies,
      ...context.packageJson?.devDependencies
    }
    const hasPrismaSchema = context.files.includes('prisma/schema.prisma')
    const hasPrismaDependency = Boolean(deps.prisma || deps['@prisma/client'])
    const hasDrizzleConfig = context.files.some((file) => /^drizzle\.config\.(ts|js|mjs|cjs)$/.test(file))
    const hasDrizzleSchema = context.files.some((file) => /(^|\/)(schema|db)\.(ts|js)$/.test(file) && file.includes('drizzle'))
    const usesDatabaseUrl = context.sourceFiles.some((file) => file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js'))
    const mentionsDatabaseUrl = /\bDATABASE_URL\b/.test(readme)

    const prismaLine = findTextLine(readme, /prisma\s+migrate/i)
    if (prismaLine && !hasPrismaSchema) {
      findings.push({
        id: 'DB001',
        title: 'README mentions Prisma migrations but schema is missing',
        severity: 'critical',
        category: 'database',
        file: context.readmePath,
        line: prismaLine,
        evidence: 'README mentions prisma migrate',
        expected: 'prisma/schema.prisma should exist.',
        actual: 'prisma/schema.prisma was not found.',
        whyItMatters: 'Generated README database setup commands often reference Prisma without creating the schema.',
        suggestedFix: 'Add prisma/schema.prisma or update the README database setup instructions.'
      })
    }

    for (const [scriptName, command] of Object.entries(scripts)) {
      if (/prisma\b/.test(command) && (!hasPrismaDependency || !hasPrismaSchema)) {
        findings.push({
          id: 'DB002',
          title: 'Package script references Prisma setup that is incomplete',
          severity: 'critical',
          category: 'database',
          file: context.packageJsonPath,
          evidence: `script "${scriptName}": ${command}`,
          expected: 'Prisma scripts should have prisma dependency and prisma/schema.prisma.',
          actual: `Prisma dependency: ${hasPrismaDependency ? 'present' : 'missing'}, schema: ${hasPrismaSchema ? 'present' : 'missing'}`,
          whyItMatters: 'A package script that calls Prisma will fail if Prisma setup files are missing.',
          suggestedFix: 'Add Prisma dependencies/schema or remove stale Prisma scripts.'
        })
      }
    }

    const drizzleLine = findTextLine(readme, /drizzle/i)
    if (drizzleLine && !hasDrizzleConfig && !hasDrizzleSchema) {
      findings.push({
        id: 'DB003',
        title: 'README mentions Drizzle but config or schema is missing',
        severity: 'warning',
        category: 'database',
        file: context.readmePath,
        line: drizzleLine,
        evidence: 'README mentions Drizzle',
        expected: 'Drizzle config or schema files should exist.',
        actual: 'No obvious Drizzle config or schema was found.',
        whyItMatters: 'Generated database docs often mention an ORM without wiring it into the repo.',
        suggestedFix: 'Add Drizzle setup files or remove stale Drizzle docs.'
      })
    }

    if (usesDatabaseUrl && !mentionsDatabaseUrl && context.sourceFiles.length > 0) {
      const databaseFindingSource = context.sourceFiles.find((file) => file.includes('db')) ?? context.sourceFiles[0]
      if (databaseFindingSource && context.envExampleText?.includes('DATABASE_URL')) {
        findings.push({
          id: 'DB004',
          title: 'DATABASE_URL is documented in env example but not explained in README',
          severity: 'info',
          category: 'database',
          file: context.readmePath,
          evidence: '.env.example documents DATABASE_URL but README does not mention it',
          expected: 'README should explain database setup when DATABASE_URL is required.',
          actual: 'No DATABASE_URL setup instructions found in README.',
          whyItMatters: 'A user may have the env var name but still not know how to provision the database.',
          suggestedFix: 'Add brief database setup instructions to README.'
        })
      }
    }

    if ((prismaLine || Object.values(scripts).some((script) => /prisma\s+migrate/.test(script))) && !hasPrismaSchema) {
      findings.push({
        id: 'DB005',
        title: 'Migration command exists but migration schema is missing',
        severity: 'critical',
        category: 'database',
        file: context.readmePath ?? context.packageJsonPath,
        line: prismaLine,
        evidence: 'Prisma migration command found without prisma/schema.prisma',
        expected: 'Migration commands should have a schema file.',
        actual: 'No Prisma schema file was found.',
        whyItMatters: 'Migration commands cannot run without a schema.',
        suggestedFix: 'Add prisma/schema.prisma or remove migration instructions.'
      })
    }

    return findings
  }
}

function findTextLine(text: string, pattern: RegExp): number | undefined {
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    pattern.lastIndex = 0
    if (pattern.test(line)) return index + 1
  }
  return undefined
}
