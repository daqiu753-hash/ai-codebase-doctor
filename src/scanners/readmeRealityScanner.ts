import type { Finding, Scanner } from '../types.js'
import { stripLineComment } from '../lineUtils.js'

export const readmeRealityScanner: Scanner = {
  id: 'readme-reality',
  name: 'README Reality Checker',
  async scan(context) {
    const findings: Finding[] = []
    if (!context.readmeText) return findings
    if (!context.packageJson) return findings

    const scriptNames = new Set(Object.keys(context.packageJson.scripts ?? {}))
    const commands = extractPackageCommands(context.readmeText)

    for (const command of commands) {
      if (!scriptNames.has(command.script)) {
        findings.push({
          id: 'R001',
          title: 'README command not found',
          severity: 'critical',
          category: 'readme',
          file: context.readmePath,
          line: command.line,
          evidence: `README says: ${command.raw}`,
          expected: `package.json should define script "${command.script}"`,
          actual: `Available scripts: ${Array.from(scriptNames).join(', ') || '(none)'}`,
          whyItMatters: 'AI-generated READMEs often contain plausible startup commands that do not exist. This blocks the first run experience.',
          suggestedFix: `Add a "${command.script}" script to package.json or update the README command.`,
          agentPrompt: `Fix README/package.json mismatch: README uses \`${command.raw}\`, but package.json does not define \`${command.script}\`.`
        })
      }
    }

    return findings
  }
}

type PackageCommand = { raw: string; script: string; line: number }

export function extractPackageCommands(markdown: string): PackageCommand[] {
  const commands = new Map<string, PackageCommand>()
  for (const [index, line] of markdown.split(/\r?\n/).entries()) {
    for (const segment of splitShellSegments(line)) {
      const command = parsePackageCommand(segment, index + 1)
      if (command) commands.set(command.raw, command)
    }
  }

  return Array.from(commands.values())
}

const packageManagerCommands = new Set(['install', 'add', 'remove', 'create', 'dlx', 'exec', 'x', 'init'])
const scriptNamePattern = '[a-zA-Z0-9:_-]+'

function splitShellSegments(line: string): string[] {
  return stripLineComment(line)
    .replace(/^\s*(?:[$>]\s*)?/, '')
    .split(/\s*(?:&&|\|\||;)\s*/)
    .map((segment) => segment.trim())
    .filter(Boolean)
}

function parsePackageCommand(segment: string, line: number): PackageCommand | undefined {
  const npmRun = new RegExp(`^npm\\s+run\\s+(${scriptNamePattern})(?:\\s|$)`).exec(segment)
  if (npmRun?.[1]) {
    return { raw: npmRun[0].trim(), script: npmRun[1], line }
  }

  const run = new RegExp(`^(pnpm|yarn|bun)\\s+run\\s+(${scriptNamePattern})(?:\\s|$)`).exec(segment)
  if (run?.[2]) {
    return { raw: run[0].trim(), script: run[2], line }
  }

  const shorthand = new RegExp(`^(pnpm|yarn|bun)\\s+(${scriptNamePattern})\\s*$`).exec(segment)
  if (!shorthand?.[2]) return undefined

  const script = shorthand[2]
  if (packageManagerCommands.has(script)) return undefined
  return { raw: shorthand[0].trim(), script, line }
}
