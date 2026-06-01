import fs from 'node:fs/promises'
import path from 'node:path'
import { builtinModules } from 'node:module'
import type { Finding, Scanner } from '../types.js'

const NODE_BUILTINS = new Set([...builtinModules, ...builtinModules.map((m) => `node:${m}`)])

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
      for (const rawImport of extractImports(content)) {
        const packageName = normalizePackageName(rawImport)
        if (!packageName) continue
        if (NODE_BUILTINS.has(packageName)) continue
        if (declared.has(packageName)) continue

        findings.push({
          id: 'D001',
          title: 'Imported package not declared',
          severity: 'critical',
          category: 'dependencies',
          file,
          evidence: `${file} imports ${rawImport}`,
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

function extractImports(content: string): Set<string> {
  const result = new Set<string>()
  const patterns = [
    /import\s+(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /export\s+[^'";]+\s+from\s+['"]([^'"]+)['"]/g,
    /require\(['"]([^'"]+)['"]\)/g,
    /import\(['"]([^'"]+)['"]\)/g
  ]
  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(content))) {
      result.add(match[1])
    }
  }
  return result
}

function normalizePackageName(importPath: string): string | undefined {
  if (importPath.startsWith('.') || importPath.startsWith('/')) return undefined
  if (importPath.startsWith('@')) {
    const [scope, name] = importPath.split('/')
    return scope && name ? `${scope}/${name}` : importPath
  }
  return importPath.split('/')[0]
}
