export type Severity = 'critical' | 'warning' | 'info'

export type FindingCategory =
  | 'readme'
  | 'scripts'
  | 'dependencies'
  | 'env'
  | 'tests'
  | 'config'
  | 'package-manager'
  | 'runtime'
  | 'docker'
  | 'database'
  | 'api'
  | 'profile'

export type Finding = {
  id: string
  title: string
  severity: Severity
  category: FindingCategory
  file?: string
  line?: number
  evidence: string
  expected?: string
  actual?: string
  whyItMatters: string
  suggestedFix: string
  agentPrompt?: string
}

export type PackageJson = {
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  engines?: Record<string, string>
  packageManager?: string
}

export type ProjectProfile = 'auto' | 'nextjs' | 'vite' | 'express' | 'fastapi' | 'node' | 'python' | 'unknown'

export type RunDoctorOptions = {
  online?: boolean
  profile?: ProjectProfile
}

export type ProjectContext = {
  rootPath: string
  files: string[]
  readmePath?: string
  readmeText?: string
  packageJsonPath?: string
  packageJsonText?: string
  packageJson?: PackageJson
  envExamplePath?: string
  envExampleText?: string
  sourceFiles: string[]
  testFiles: string[]
  framework: 'nextjs' | 'vite' | 'node' | 'python' | 'unknown'
  detectedProfile: ProjectProfile
  selectedProfile: ProjectProfile
  options: RunDoctorOptions
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown'
}

export type Scanner = {
  id: string
  name: string
  scan: (context: ProjectContext) => Promise<Finding[]>
}

export type DoctorReport = {
  schemaVersion: '1.0.0'
  score: number
  summary: {
    critical: number
    warning: number
    info: number
    total: number
  }
  context: ProjectContext
  findings: Finding[]
}
