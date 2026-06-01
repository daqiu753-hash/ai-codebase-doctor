export type LineMatch = {
  value: string
  line: number
}

export function findLineNumber(content: string, pattern: string | RegExp): number | undefined {
  const lines = content.split(/\r?\n/)
  for (const [index, line] of lines.entries()) {
    if (typeof pattern === 'string' ? line.includes(pattern) : pattern.test(line)) {
      return index + 1
    }
  }
  return undefined
}

export function findFirstMatchingLine(content: string, pattern: RegExp): number | undefined {
  for (const [index, line] of content.split(/\r?\n/).entries()) {
    pattern.lastIndex = 0
    if (pattern.test(line)) return index + 1
  }
  return undefined
}

export function stripLineComment(line: string): string {
  let quote: '"' | "'" | '`' | undefined
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]
    if (char === '\\') {
      index += 1
      continue
    }
    if (quote) {
      if (char === quote) quote = undefined
      continue
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char
      continue
    }
    if (char === '/' && next === '/') return line.slice(0, index)
    if (char === '#') return line.slice(0, index)
  }
  return line
}
