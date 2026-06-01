import fs from 'node:fs/promises'
import path from 'node:path'
import type { Finding, Scanner } from '../types.js'
import { stripLineComment } from '../lineUtils.js'

export const apiContractScanner: Scanner = {
  id: 'api-contract',
  name: 'API Contract Reality Checker',
  async scan(context) {
    const calls = await extractFrontendApiCalls(context)
    if (calls.length === 0) return []

    const routes = await extractBackendRoutes(context)
    if (routes.size === 0) {
      return calls.slice(0, 3).map((call): Finding => ({
        id: 'A001',
        title: 'Frontend API route has no obvious backend route',
        severity: 'warning',
        category: 'api',
        file: call.file,
        line: call.line,
        evidence: `${call.file} calls ${call.path}`,
        expected: 'A matching backend route should exist.',
        actual: 'No matching Next.js, Express, or FastAPI route was found.',
        whyItMatters: 'AI-generated frontends often call API paths that were never implemented.',
        suggestedFix: `Create a route for ${call.path} or update the frontend call.`
      }))
    }

    return calls
      .filter((call) => !routes.has(call.path))
      .slice(0, 5)
      .map((call): Finding => ({
        id: 'A001',
        title: 'Frontend API route has no obvious backend route',
        severity: 'warning',
        category: 'api',
        file: call.file,
        line: call.line,
        evidence: `${call.file} calls ${call.path}`,
        expected: `A backend route should define ${call.path}.`,
        actual: `Known routes: ${Array.from(routes).join(', ') || '(none)'}`,
        whyItMatters: 'AI-generated frontends often call API paths that were never implemented.',
        suggestedFix: `Create a route for ${call.path} or update the frontend call.`
      }))
  }
}

async function extractFrontendApiCalls(context: Parameters<Scanner['scan']>[0]) {
  const calls: Array<{ path: string; file: string; line: number }> = []
  for (const file of context.sourceFiles.filter((item) => /\.(ts|tsx|js|jsx)$/.test(item))) {
    const content = await fs.readFile(path.join(context.rootPath, file), 'utf8')
    for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
      const line = stripLineComment(rawLine)
      const pattern = /\b(?:fetch|axios(?:\.[a-z]+)?)\(\s*['"]([^'"]*\/api\/[^'"]*)['"]/g
      let match: RegExpExecArray | null
      while ((match = pattern.exec(line))) {
        if (match[1]) calls.push({ path: normalizeApiPath(match[1]), file, line: index + 1 })
      }
    }
  }
  return calls
}

async function extractBackendRoutes(context: Parameters<Scanner['scan']>[0]): Promise<Set<string>> {
  const routes = new Set<string>()
  for (const file of context.files) {
    const nextRoute = nextRouteFromFile(file)
    if (nextRoute) routes.add(nextRoute)
  }

  for (const file of context.sourceFiles) {
    const content = await fs.readFile(path.join(context.rootPath, file), 'utf8')
    for (const line of content.split(/\r?\n/)) {
      const clean = stripLineComment(line)
      for (const route of [
        ...extractExpressRoutes(clean),
        ...extractFastApiRoutes(clean)
      ]) {
        routes.add(route)
      }
    }
  }

  return routes
}

function nextRouteFromFile(file: string): string | undefined {
  const appMatch = /^src\/app\/api\/(.+)\/route\.(ts|js)$|^app\/api\/(.+)\/route\.(ts|js)$/.exec(file)
  const pagesMatch = /^pages\/api\/(.+)\.(ts|js)$|^src\/pages\/api\/(.+)\.(ts|js)$/.exec(file)
  const appRoute = appMatch?.[1] ?? appMatch?.[3]
  const pagesRoute = pagesMatch?.[1] ?? pagesMatch?.[3]
  if (appRoute) return `/api/${appRoute.replace(/\[(.+?)\]/g, ':$1')}`
  if (pagesRoute) return `/api/${pagesRoute.replace(/\/index$/, '').replace(/\[(.+?)\]/g, ':$1')}`
  return undefined
}

function extractExpressRoutes(line: string): string[] {
  const routes: string[] = []
  const pattern = /\b(?:app|router)\.(?:get|post|put|patch|delete|all)\(\s*['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(line))) {
    if (match[1]?.startsWith('/api/')) routes.push(match[1])
  }
  return routes
}

function extractFastApiRoutes(line: string): string[] {
  const routes: string[] = []
  const pattern = /@(?:app|router)\.(?:get|post|put|patch|delete)\(\s*['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(line))) {
    if (match[1]?.startsWith('/api/')) routes.push(match[1])
  }
  return routes
}

function normalizeApiPath(value: string): string {
  try {
    return new URL(value, 'http://localhost').pathname
  } catch {
    return value.split('?')[0] ?? value
  }
}
