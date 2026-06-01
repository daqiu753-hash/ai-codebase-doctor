import fs from 'node:fs/promises'
import path from 'node:path'
import type { Finding, Scanner } from '../types.js'
import { findLineNumber, stripLineComment } from '../lineUtils.js'

export const profileScanner: Scanner = {
  id: 'profile',
  name: 'Framework Profile Checker',
  async scan(context) {
    const profile = context.selectedProfile
    if (profile === 'nextjs') return scanNextProfile(context)
    if (profile === 'vite') return scanViteProfile(context)
    if (profile === 'express') return scanExpressProfile(context)
    if (profile === 'fastapi') return scanFastApiProfile(context)
    return []
  }
}

async function scanNextProfile(context: Parameters<Scanner['scan']>[0]): Promise<Finding[]> {
  const findings: Finding[] = []
  const deps = allDeps(context)
  const scripts = context.packageJson?.scripts ?? {}
  const readmeText = context.readmeText ?? ''

  for (const script of ['dev', 'build', 'start']) {
    if (deps.next && !scripts[script]) {
      findings.push({
        id: 'NX003',
        title: 'Next.js dependency is present but expected script is missing',
        severity: 'warning',
        category: 'profile',
        file: context.packageJsonPath,
        evidence: `next dependency is present but script "${script}" is missing`,
        expected: `package.json should usually define "${script}" for a Next.js app.`,
        actual: `Available scripts: ${Object.keys(scripts).join(', ') || '(none)'}`,
        whyItMatters: 'AI-generated Next.js repos often omit one of the expected lifecycle scripts.',
        suggestedFix: `Add a "${script}" script or update README to match the intended workflow.`
      })
    }
  }

  const nextMentionLine = findTextLine(readmeText, /\bNext\.?js\b/i)
  if (nextMentionLine && !deps.next) {
    findings.push({
      id: 'NX004',
      title: 'README mentions Next.js but package lacks next dependency',
      severity: 'warning',
      category: 'profile',
      file: context.readmePath,
      line: nextMentionLine,
      evidence: 'README mentions Next.js',
      expected: 'package.json should include next when this is a Next.js app.',
      actual: 'next dependency was not found.',
      whyItMatters: 'Generated READMEs often advertise a framework that is not actually installed.',
      suggestedFix: 'Install next or update README to describe the real framework.'
    })
  }

  for (const issue of await findClientEnvPrefixIssues(context, 'NEXT_PUBLIC_')) {
    findings.push({
      id: 'NX002',
      title: 'Client component uses non-public env var prefix',
      severity: 'warning',
      category: 'profile',
      file: issue.file,
      line: issue.line,
      evidence: `${issue.file} uses ${issue.envName}`,
      expected: 'Client-side Next.js env vars should use NEXT_PUBLIC_.',
      actual: `${issue.envName} does not use NEXT_PUBLIC_.`,
      whyItMatters: 'Client-side env access in generated Next.js apps often confuses server-only and public variables.',
      suggestedFix: `Use NEXT_PUBLIC_${issue.envName} only if the value is safe to expose, otherwise move usage to server code.`
    })
  }

  return findings
}

async function scanViteProfile(context: Parameters<Scanner['scan']>[0]): Promise<Finding[]> {
  const findings: Finding[] = []
  const deps = allDeps(context)
  const readmeText = context.readmeText ?? ''

  for (const issue of await findViteEnvPrefixIssues(context)) {
    findings.push({
      id: 'VT001',
      title: 'Vite env var does not use VITE_ prefix',
      severity: 'warning',
      category: 'profile',
      file: issue.file,
      line: issue.line,
      evidence: `${issue.file} uses ${issue.envName}`,
      expected: 'Client-visible Vite env vars should use VITE_.',
      actual: `${issue.envName} does not use VITE_.`,
      whyItMatters: 'Generated Vite apps often use env names that will be undefined in the browser.',
      suggestedFix: `Rename ${issue.envName} to VITE_${issue.envName} if it is safe for client use.`
    })
  }

  const hasEntry = context.files.includes('index.html') || context.files.some((file) => /^src\/main\.(ts|tsx|js|jsx)$/.test(file))
  if (deps.vite && !hasEntry) {
    findings.push({
      id: 'VT002',
      title: 'Vite app is missing a basic entry file',
      severity: 'warning',
      category: 'profile',
      evidence: 'vite dependency is present',
      expected: 'index.html and src/main.* are usually present in a Vite app.',
      actual: 'No index.html or src/main.* file was found.',
      whyItMatters: 'A generated Vite app without an entry point will not start as documented.',
      suggestedFix: 'Add index.html/src/main.* or update the project metadata if this is not a Vite app.'
    })
  }

  const viteMentionLine = findTextLine(readmeText, /\bVite\b/i)
  if (viteMentionLine && !deps.vite) {
    findings.push({
      id: 'VT003',
      title: 'README mentions Vite but package lacks vite dependency',
      severity: 'warning',
      category: 'profile',
      file: context.readmePath,
      line: viteMentionLine,
      evidence: 'README mentions Vite',
      expected: 'package.json should include vite when this is a Vite app.',
      actual: 'vite dependency was not found.',
      whyItMatters: 'Generated READMEs often advertise a framework that is not installed.',
      suggestedFix: 'Install vite or update README to describe the real framework.'
    })
  }

  return findings
}

async function scanExpressProfile(context: Parameters<Scanner['scan']>[0]): Promise<Finding[]> {
  const findings: Finding[] = []
  const deps = allDeps(context)
  const importsExpress = await sourceContains(context, /\bfrom\s+['"]express['"]|require\(['"]express['"]\)/)
  const expressRoute = await sourceContains(context, /\b(?:app|router)\.(?:get|post|put|patch|delete|all)\(\s*['"]/)
  if (importsExpress && !deps.express) {
    findings.push({
      id: 'EX002',
      title: 'Server imports Express but dependency is missing',
      severity: 'critical',
      category: 'profile',
      file: importsExpress.file,
      line: importsExpress.line,
      evidence: `${importsExpress.file} imports express`,
      expected: 'package.json should declare express.',
      actual: 'express dependency was not found.',
      whyItMatters: 'An Express server cannot start if express is not installed.',
      suggestedFix: 'Install express or remove stale server code.'
    })
  }

  if ((importsExpress || deps.express) && !expressRoute) {
    findings.push({
      id: 'EX004',
      title: 'Express app has no obvious route definitions',
      severity: 'warning',
      category: 'profile',
      file: importsExpress?.file ?? context.packageJsonPath,
      line: importsExpress?.line,
      evidence: importsExpress ? `${importsExpress.file} imports express` : 'package.json declares express',
      expected: 'An Express app should define at least one obvious app.* or router.* route.',
      actual: 'No app.get/app.post/router.get/router.post style route was found.',
      whyItMatters: 'AI-generated Express servers sometimes initialize the framework but forget to wire routes.',
      suggestedFix: 'Add route handlers or update project metadata if Express is not actually used.'
    })
  }

  for (const [scriptName, command] of Object.entries(context.packageJson?.scripts ?? {})) {
    const match = /\b(?:node|tsx|ts-node)\s+([^\s]+\.(?:js|mjs|cjs|ts|tsx))/.exec(command)
    if (match?.[1] && !context.files.includes(match[1].replace(/^\.\//, ''))) {
      findings.push({
        id: 'EX003',
        title: 'Express server entry referenced in scripts is missing',
        severity: 'critical',
        category: 'profile',
        file: context.packageJsonPath,
        evidence: `script "${scriptName}": ${command}`,
        expected: `${match[1]} should exist.`,
        actual: 'Server entry file was not found.',
        whyItMatters: 'Generated Express apps often wire scripts to missing server files.',
        suggestedFix: 'Create the server entry file or update the package script.'
      })
    }
  }

  return findings
}

async function scanFastApiProfile(context: Parameters<Scanner['scan']>[0]): Promise<Finding[]> {
  const findings: Finding[] = []
  const readmeText = context.readmeText ?? ''
  const uvicornLine = findTextLine(readmeText, /uvicorn\s+main:app/i)
  const mainPy = context.files.includes('main.py')
  const mainHasApp = mainPy ? /\bapp\s*=/.test(await fs.readFile(path.join(context.rootPath, 'main.py'), 'utf8')) : false

  if (uvicornLine && (!mainPy || !mainHasApp)) {
    findings.push({
      id: 'FA001',
      title: 'README uvicorn command does not match FastAPI entrypoint',
      severity: 'critical',
      category: 'profile',
      file: context.readmePath,
      line: uvicornLine,
      evidence: 'README mentions uvicorn main:app',
      expected: 'main.py should define app.',
      actual: mainPy ? 'main.py exists but no app variable was found.' : 'main.py was not found.',
      whyItMatters: 'Generated FastAPI READMEs often include uvicorn commands that cannot import the app.',
      suggestedFix: 'Create main.py with app = FastAPI() or update the uvicorn command.'
    })
  }

  const importsFastApi = await sourceContains(context, /\bfrom\s+fastapi\s+import\b|\bimport\s+fastapi\b/)
  const hasFastApiDependency = await pythonDepsMention(context, 'fastapi')
  const fastApiRoute = await sourceContains(context, /@(?:app|router)\.(?:get|post|put|patch|delete)\(\s*['"]/)
  if (importsFastApi && !hasFastApiDependency) {
    findings.push({
      id: 'FA002',
      title: 'Python code imports FastAPI but dependency metadata is missing',
      severity: 'critical',
      category: 'profile',
      file: importsFastApi.file,
      line: importsFastApi.line,
      evidence: `${importsFastApi.file} imports fastapi`,
      expected: 'requirements.txt or pyproject.toml should declare fastapi.',
      actual: 'No fastapi dependency metadata was found.',
      whyItMatters: 'A FastAPI app cannot install cleanly without dependency metadata.',
      suggestedFix: 'Add fastapi to requirements.txt or pyproject.toml.'
    })
  }

  if ((importsFastApi || hasFastApiDependency) && !fastApiRoute) {
    findings.push({
      id: 'FA003',
      title: 'FastAPI app has no obvious route decorators',
      severity: 'warning',
      category: 'profile',
      file: importsFastApi?.file,
      line: importsFastApi?.line,
      evidence: importsFastApi ? `${importsFastApi.file} imports fastapi` : 'FastAPI dependency metadata exists',
      expected: 'A FastAPI app should usually define at least one @app.* or @router.* route decorator.',
      actual: 'No obvious FastAPI route decorator was found.',
      whyItMatters: 'Generated FastAPI services sometimes create an app object but forget route handlers.',
      suggestedFix: 'Add route decorators or remove stale FastAPI setup.'
    })
  }

  const fastApiLine = findTextLine(readmeText, /\bFastAPI\b/i)
  if (fastApiLine && !importsFastApi && !hasFastApiDependency) {
    findings.push({
      id: 'FA004',
      title: 'README mentions FastAPI but no FastAPI code or dependency was found',
      severity: 'warning',
      category: 'profile',
      file: context.readmePath,
      line: fastApiLine,
      evidence: 'README mentions FastAPI',
      expected: 'FastAPI code or dependency metadata should exist.',
      actual: 'No FastAPI import or dependency metadata was found.',
      whyItMatters: 'Generated READMEs often claim a backend framework that is not present.',
      suggestedFix: 'Add FastAPI setup or update README to match the real project.'
    })
  }

  return findings
}

async function findClientEnvPrefixIssues(context: Parameters<Scanner['scan']>[0], prefix: string) {
  const issues: Array<{ file: string; line: number; envName: string }> = []
  for (const file of context.sourceFiles.filter((item) => /\.(ts|tsx|js|jsx)$/.test(item))) {
    const content = await fs.readFile(path.join(context.rootPath, file), 'utf8')
    if (!content.includes("'use client'") && !content.includes('"use client"')) continue
    for (const envRef of extractEnvRefs(content)) {
      if (!envRef.envName.startsWith(prefix)) issues.push({ file, ...envRef })
    }
  }
  return issues
}

async function findViteEnvPrefixIssues(context: Parameters<Scanner['scan']>[0]) {
  const issues: Array<{ file: string; line: number; envName: string }> = []
  for (const file of context.sourceFiles.filter((item) => /\.(ts|tsx|js|jsx)$/.test(item))) {
    const content = await fs.readFile(path.join(context.rootPath, file), 'utf8')
    for (const envRef of extractImportMetaEnvRefs(content)) {
      if (!envRef.envName.startsWith('VITE_')) issues.push({ file, ...envRef })
    }
  }
  return issues
}

function extractEnvRefs(content: string): Array<{ line: number; envName: string }> {
  const result: Array<{ line: number; envName: string }> = []
  for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
    const line = stripLineComment(rawLine)
    const patterns = [/process\.env\.([A-Z0-9_]+)/g, /process\.env\[['"]([A-Z0-9_]+)['"]\]/g]
    for (const pattern of patterns) {
      let match: RegExpExecArray | null
      while ((match = pattern.exec(line))) {
        if (match[1]) result.push({ line: index + 1, envName: match[1] })
      }
    }
  }
  return result
}

function extractImportMetaEnvRefs(content: string): Array<{ line: number; envName: string }> {
  const result: Array<{ line: number; envName: string }> = []
  for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
    const line = stripLineComment(rawLine)
    const pattern = /import\.meta\.env\.([A-Z0-9_]+)/g
    let match: RegExpExecArray | null
    while ((match = pattern.exec(line))) {
      if (match[1]) result.push({ line: index + 1, envName: match[1] })
    }
  }
  return result
}

async function sourceContains(context: Parameters<Scanner['scan']>[0], pattern: RegExp) {
  for (const file of context.sourceFiles) {
    const content = await fs.readFile(path.join(context.rootPath, file), 'utf8')
    for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
      pattern.lastIndex = 0
      if (pattern.test(stripLineComment(rawLine))) return { file, line: index + 1 }
    }
  }
  return undefined
}

function allDeps(context: Parameters<Scanner['scan']>[0]) {
  return {
    ...context.packageJson?.dependencies,
    ...context.packageJson?.devDependencies
  }
}

function findTextLine(text: string, pattern: RegExp): number | undefined {
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    pattern.lastIndex = 0
    if (pattern.test(line)) return index + 1
  }
  return undefined
}

async function pythonDepsMention(context: Parameters<Scanner['scan']>[0], packageName: string): Promise<boolean> {
  for (const file of ['requirements.txt', 'pyproject.toml']) {
    if (!context.files.includes(file)) continue
    const content = await fs.readFile(path.join(context.rootPath, file), 'utf8')
    if (new RegExp(`\\b${packageName}\\b`, 'i').test(content)) return true
  }
  return false
}
