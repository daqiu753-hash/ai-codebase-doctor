#!/usr/bin/env node
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const cliPath = path.join(root, 'dist', 'cli.js')
const reportsRoot = path.join(root, 'reports', 'synthetic')
const docsRoot = path.join(root, 'docs', 'validation')

const disclaimer = [
  'This is simulated validation data.',
  'These fixtures are synthetic projects.',
  'This is not evidence of real-world adoption.'
]

const fixtures = [
  {
    name: 'broken-nextjs-saas',
    caseFile: 'simulated-case-broken-nextjs-saas.md',
    projectType: 'Next.js + AI SaaS',
    purpose: 'Show README script, dependency, env, weak test, and Prisma setup failures in a generated SaaS-style repo.',
    brokenPatterns: [
      'README says `npm run dev`, but `package.json` has no `dev` script.',
      'Source uses `DATABASE_URL`, but `.env.example` does not document it.',
      'Source imports `@ai-sdk/openai`, but `package.json` does not declare it.',
      'A test file exists but has no obvious assertion.',
      'README mentions `prisma migrate`, but no `prisma/schema.prisma` exists.'
    ],
    knownLimitations: [
      'The scanner does not verify whether the synthetic Next.js app can compile.',
      'API route checks are path-level best effort and do not validate method or response schemas.'
    ]
  },
  {
    name: 'vite-env-mismatch',
    caseFile: 'simulated-case-vite-env-mismatch.md',
    projectType: 'Vite React',
    purpose: 'Show Vite env prefix drift and package-manager instruction mismatch.',
    brokenPatterns: [
      'Client code uses `import.meta.env.API_URL` without the `VITE_` prefix.',
      'Source also references `process.env.API_URL`, while `.env.example` documents `VITE_API_URL`.',
      'README uses `pnpm`, but only `package-lock.json` is present.'
    ],
    knownLimitations: [
      'The scanner does not execute Vite or validate browser runtime behavior.',
      'Env detection focuses on direct static references.'
    ]
  },
  {
    name: 'express-api-route-mismatch',
    caseFile: 'simulated-case-express-api-route-mismatch.md',
    projectType: 'Express API + frontend fetch',
    purpose: 'Show frontend/backend API path mismatch and broken server entry scripts.',
    brokenPatterns: [
      'Frontend calls `fetch("/api/login")`.',
      'Backend defines `/auth/login` instead of `/api/login`.',
      '`package.json` script points at missing `server.js`.',
      'README documents an endpoint that does not match the obvious route.'
    ],
    knownLimitations: [
      'The scanner compares obvious API paths only; it does not understand proxies, rewrites, routers mounted under prefixes, or auth middleware.',
      'README endpoint text is not a full contract source.'
    ]
  },
  {
    name: 'fastapi-env-missing',
    caseFile: 'simulated-case-fastapi-env-missing.md',
    projectType: 'FastAPI',
    purpose: 'Show FastAPI README entrypoint drift, missing dependency metadata, and undocumented env usage.',
    brokenPatterns: [
      'README says `uvicorn main:app`, but there is no `main.py` defining `app`.',
      'Python code imports `fastapi`, but `requirements.txt` does not declare it.',
      'Code uses `os.getenv("DATABASE_URL")`, but `.env.example` omits `DATABASE_URL`.',
      'The app object is named `api`, not `app`.'
    ],
    knownLimitations: [
      'The scanner does not import Python modules or run `uvicorn`.',
      'FastAPI profile checks are smoke tests based on obvious imports and decorators.'
    ]
  },
  {
    name: 'docker-prisma-missing-schema',
    caseFile: 'simulated-case-docker-prisma-missing-schema.md',
    projectType: 'Docker + Prisma',
    purpose: 'Show Docker command drift, port mismatch, and Prisma migration setup without a schema.',
    brokenPatterns: [
      'Dockerfile `CMD` references missing `server.js`.',
      'Dockerfile exposes `3000`, while README says `localhost:8080`.',
      'README mentions `prisma migrate`.',
      '`package.json` has a Prisma migration script.',
      'No `prisma/schema.prisma` exists.'
    ],
    knownLimitations: [
      'The scanner does not build Docker images.',
      'As of v1.0.2, this fixture should report specific `DB001`/`DB002` findings and should not produce the removed duplicate `DB005` path.'
    ]
  }
]

if (!existsSync(cliPath)) {
  console.error(`Missing local CLI build: ${path.relative(root, cliPath)}`)
  console.error('Run `npm run build` before `npm run validation:synthetic`.')
  process.exit(1)
}

await fs.mkdir(reportsRoot, { recursive: true })
await fs.mkdir(docsRoot, { recursive: true })

const results = []

for (const fixture of fixtures) {
  const fixturePath = path.join('examples', 'synthetic-validation', fixture.name)
  const outDir = path.join('reports', 'synthetic', fixture.name)
  const args = [cliPath, fixturePath, '--out', outDir]

  console.log(`\nScanning synthetic fixture: ${fixture.name}`)
  console.log(`Command: node ${args.join(' ')}`)

  const child = spawnSync(process.execPath, args, {
    cwd: root,
    stdio: 'inherit'
  })

  if (child.status !== 0) {
    console.error(`Synthetic fixture scan failed: ${fixture.name}`)
    process.exit(child.status ?? 1)
  }

  const reportPath = path.join(root, outDir, 'doctor-report.json')
  const report = JSON.parse(await fs.readFile(reportPath, 'utf8'))
  results.push({ fixture, fixturePath, outDir, report })
}

await writeSummary(results)
await Promise.all(results.map(writeCase))

console.log('\nSynthetic validation docs updated:')
console.log('- docs/validation/simulated-results-summary.md')
for (const { fixture } of results) {
  console.log(`- docs/validation/${fixture.caseFile}`)
}

async function writeSummary(results) {
  const rows = results.map(({ fixture, fixturePath, outDir, report }) => {
    const useful = uniqueFindingLabels(report).join('<br>') || 'None'
    return [
      code(fixture.name),
      escapeCell(fixture.projectType),
      fixture.brokenPatterns.map(escapeCell).join('<br>'),
      code(`node dist/cli.js ${fixturePath} --out ${outDir}`),
      String(report.summary.total),
      String(report.summary.critical),
      String(report.summary.warning),
      String(report.summary.info),
      useful,
      'None expected in this synthetic fixture; review manually.',
      conclusionFor(report)
    ]
  })

  const content = [
    '# Simulated Results Summary',
    '',
    ...disclaimer,
    '',
    'Generated by `npm run validation:synthetic` from local fixture scans.',
    '',
    '| Fixture | Project type | Intended broken patterns | Scan command | Total findings | Critical | Warnings | Info | Useful findings | Expected false positives | Conclusion |',
    '|---|---|---|---|---:|---:|---:|---:|---|---|---|',
    ...rows.map((row) => `| ${row.join(' | ')} |`),
    ''
  ].join('\n')

  await fs.writeFile(path.join(docsRoot, 'simulated-results-summary.md'), content, 'utf8')
}

async function writeCase({ fixture, fixturePath, outDir, report }) {
  const findings = uniqueFindingLabels(report)
  const content = [
    `# Synthetic Case: ${titleCase(fixture.name)}`,
    '',
    ...disclaimer,
    '',
    '## Fixture Purpose',
    '',
    fixture.purpose,
    '',
    '## Simulated Project Type',
    '',
    fixture.projectType,
    '',
    '## Command Used',
    '',
    '```bash',
    `node dist/cli.js ${fixturePath} --out ${outDir}`,
    '```',
    '',
    '## Expected Broken Patterns',
    '',
    ...fixture.brokenPatterns.map((item) => `- ${item}`),
    '',
    '## Actual Findings Summary',
    '',
    `- Total findings: ${report.summary.total}`,
    `- Critical: ${report.summary.critical}`,
    `- Warning: ${report.summary.warning}`,
    `- Info: ${report.summary.info}`,
    '',
    '## Useful Findings',
    '',
    ...(findings.length > 0 ? findings.map((item) => `- ${item}`) : ['- None']),
    '',
    '## Known Limitations',
    '',
    ...fixture.knownLimitations.map((item) => `- ${item}`),
    '',
    '## Conclusion',
    '',
    conclusionFor(report),
    '',
    '## Disclaimer',
    '',
    disclaimer.join(' '),
    ''
  ].join('\n')

  await fs.writeFile(path.join(docsRoot, fixture.caseFile), content, 'utf8')
}

function uniqueFindingLabels(report) {
  const seen = new Set()
  const labels = []
  for (const finding of report.findings) {
    const label = `${code(finding.id)} ${escapeCell(finding.title)}`
    if (seen.has(label)) continue
    seen.add(label)
    labels.push(label)
  }
  return labels
}

function conclusionFor(report) {
  if (report.summary.critical > 0) {
    return 'The fixture demonstrates repo-readiness failures that should block confidence until repaired.'
  }
  if (report.summary.warning > 0) {
    return 'The fixture demonstrates non-blocking drift that should be reviewed before relying on the repo.'
  }
  return 'The fixture produced no findings; review whether the fixture still represents an intended broken pattern.'
}

function titleCase(value) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function code(value) {
  return `\`${escapeCell(value)}\``
}

function escapeCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, '<br>')
}
