import type { Scanner } from '../types.js'
import { dependencyScanner } from './dependencyScanner.js'
import { envScanner } from './envScanner.js'
import { readmeRealityScanner } from './readmeRealityScanner.js'
import { scriptScanner } from './scriptScanner.js'
import { testRealityScanner } from './testRealityScanner.js'

export const scanners: Scanner[] = [
  readmeRealityScanner,
  scriptScanner,
  envScanner,
  dependencyScanner,
  testRealityScanner
]
