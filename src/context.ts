import fs from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import type { PackageJson, ProjectContext, ProjectProfile, RunDoctorOptions } from './types.js'

const SOURCE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'py']

export async function detectProject(rootPath: string, options: RunDoctorOptions = {}): Promise<ProjectContext> {
  const absoluteRoot = path.resolve(rootPath)
  const files = await fg(['**/*'], {
    cwd: absoluteRoot,
    dot: true,
    onlyFiles: true,
    ignore: ['node_modules/**', 'dist/**', '.git/**', 'coverage/**', 'reports/**']
  })
  files.sort((a, b) => a.localeCompare(b))

  const readmePath = findFirst(files, ['README.md', 'readme.md', 'README.MD'])
  const packageJsonPath = findFirst(files, ['package.json'])
  const envExamplePath = findFirst(files, ['.env.example', '.env.sample', 'env.example'])

  const readmeText = readmePath ? await safeRead(path.join(absoluteRoot, readmePath)) : undefined
  const envExampleText = envExamplePath ? await safeRead(path.join(absoluteRoot, envExamplePath)) : undefined

  let packageJson: PackageJson | undefined
  let packageJsonText: string | undefined
  if (packageJsonPath) {
    const raw = await safeRead(path.join(absoluteRoot, packageJsonPath))
    if (raw) {
      packageJsonText = raw
      packageJson = JSON.parse(raw) as PackageJson
    }
  }

  const sourceFiles = files.filter((file) => {
    const ext = path.extname(file).replace('.', '')
    return SOURCE_EXTENSIONS.includes(ext) && !isTestFile(file) && !file.endsWith('.d.ts')
  })

  const testFiles = files.filter(isTestFile)

  const framework = detectFramework(files, packageJson)
  const detectedProfile = detectProfile(files, packageJson, framework)

  return {
    rootPath: absoluteRoot,
    files,
    readmePath,
    readmeText,
    packageJsonPath,
    packageJsonText,
    packageJson,
    envExamplePath,
    envExampleText,
    sourceFiles,
    testFiles,
    framework,
    detectedProfile,
    selectedProfile: options.profile && options.profile !== 'auto' ? options.profile : detectedProfile,
    options: {
      online: options.online ?? false,
      profile: options.profile ?? 'auto'
    },
    packageManager: detectPackageManager(files)
  }
}

function findFirst(files: string[], candidates: string[]): string | undefined {
  return candidates.find((candidate) => files.includes(candidate))
}

async function safeRead(filePath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return undefined
  }
}

function detectPackageManager(files: string[]): ProjectContext['packageManager'] {
  if (files.includes('pnpm-lock.yaml')) return 'pnpm'
  if (files.includes('yarn.lock')) return 'yarn'
  if (files.includes('bun.lockb') || files.includes('bun.lock')) return 'bun'
  if (files.includes('package-lock.json')) return 'npm'
  if (files.includes('package.json')) return 'npm'
  return 'unknown'
}

function detectFramework(files: string[], packageJson?: PackageJson): ProjectContext['framework'] {
  const deps = {
    ...packageJson?.dependencies,
    ...packageJson?.devDependencies
  }
  if (deps.next || files.includes('next.config.js') || files.includes('next.config.ts')) return 'nextjs'
  if (deps.vite || files.includes('vite.config.ts') || files.includes('vite.config.js')) return 'vite'
  if (files.includes('requirements.txt') || files.includes('pyproject.toml')) return 'python'
  if (files.includes('package.json')) return 'node'
  return 'unknown'
}

function detectProfile(
  files: string[],
  packageJson: PackageJson | undefined,
  framework: ProjectContext['framework']
): ProjectProfile {
  const deps = {
    ...packageJson?.dependencies,
    ...packageJson?.devDependencies
  }
  if (framework === 'nextjs') return 'nextjs'
  if (framework === 'vite') return 'vite'
  if (deps.express || files.some((file) => /(^|\/)(server|app)\.(ts|js|mjs|cjs)$/.test(file))) return 'express'
  if (
    deps.fastapi ||
    files.includes('requirements.txt') ||
    files.includes('pyproject.toml') ||
    files.some((file) => file.endsWith('.py'))
  ) {
    return 'fastapi'
  }
  if (framework === 'python') return 'python'
  if (framework === 'node') return 'node'
  return 'unknown'
}

function isTestFile(file: string): boolean {
  return (
    /(^|\/)(__tests__|tests?)\//.test(file) ||
    /\.(test|spec)\.(ts|tsx|js|jsx|mjs|cjs|py)$/.test(file)
  )
}
