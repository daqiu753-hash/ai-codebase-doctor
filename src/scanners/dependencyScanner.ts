import fs from 'node:fs/promises'
import path from 'node:path'
import { builtinModules } from 'node:module'
import type { Finding, Scanner } from '../types.js'
import { stripLineComment } from '../lineUtils.js'

const NODE_BUILTINS = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)])
const VIRTUAL_IMPORT_PREFIXES = ['virtual:', '/@', '\0', '@/', '~/', '#']
const NON_RUNTIME_IMPORT_EXTENSIONS = [
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif'
]

export const dependencyScanner: Scanner = {
  id: 'dependencies',
  name: 'Dependency Declaration Checker',
  async scan(context) {
    const findings: Finding[] = []
    if (!context.packageJson) return findings

    const declared = new Set([
      ...Object.keys(context.packageJson.dependencies ?? {}),
      ...Object.keys(context.packageJson.devDependencies ?? {}),
      ...Object.keys(context.packageJson.peerDependencies ?? {}),
      ...Object.keys(context.packageJson.optionalDependencies ?? {})
    ])

    for (const file of context.sourceFiles.filter((f) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(f))) {
      const content = await fs.readFile(path.join(context.rootPath, file), 'utf8')
      for (const imported of extractImports(content)) {
        const packageName = normalizePackageName(imported.value)
        if (!packageName) continue
        if (NODE_BUILTINS.has(packageName)) continue
        if (declared.has(packageName)) continue

        findings.push({
          id: 'D001',
          title: 'Imported package not declared',
          severity: 'critical',
          category: 'dependencies',
          file,
          line: imported.line,
          evidence: `${file} imports ${imported.value}`,
          expected: `${packageName} should be declared in package.json dependencies or devDependencies`,
          actual: `${packageName} is not declared in package.json`,
          whyItMatters: 'AI-generated code often imports plausible packages without adding them to package.json. In some cases the package may be hallucinated entirely.',
          suggestedFix: `Install and declare ${packageName}, replace the import, or remove unused code.`,
          agentPrompt: `Fix missing dependency declaration for \`${packageName}\` imported by \`${file}\`. Verify whether the package exists and is the intended dependency.`
        })
      }
    }

    return findings
  }
}

function extractImports(content: string): Array<{ value: string; line: number }> {
  const result = new Map<string, { value: string; line: number }>()
  const patterns = [
    /^\s*import\s+(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /^\s*export\s+[^'";]+\s+from\s+['"]([^'"]+)['"]/g,
    /require\(['"]([^'"]+)['"]\)/g,
    /import\(['"]([^'"]+)['"]\)/g
  ]

  for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
    const line = stripLineComment(rawLine).trim()
    if (!line || line.startsWith('*') || line.startsWith('/*')) continue
    for (const pattern of patterns) {
      pattern.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = pattern.exec(line))) {
        if (match[1] && !result.has(match[1])) {
          result.set(match[1], { value: match[1], line: index + 1 })
        }
      }
    }
  }

  return Array.from(result.values())
}

function normalizePackageName(importPath: string): string | undefined {
  if (importPath.startsWith('.') || importPath.startsWith('/')) return undefined
  if (VIRTUAL_IMPORT_PREFIXES.some((prefix) => importPath.startsWith(prefix))) return undefined
  if (NON_RUNTIME_IMPORT_EXTENSIONS.some((extension) => importPath.endsWith(extension))) return undefined
  if (/^[a-z][a-z0-9+.-]*:/i.test(importPath)) return undefined
  if (importPath.startsWith('@')) {
    const [scope, name] = importPath.split('/')
    return scope && name ? `${scope}/${name}` : importPath
  }
  return importPath.split('/')[0]
}
