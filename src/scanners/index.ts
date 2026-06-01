import type { Scanner } from '../types.js'
import { databaseScanner } from './databaseScanner.js'
import { dependencyScanner } from './dependencyScanner.js'
import { dockerScanner } from './dockerScanner.js'
import { envScanner } from './envScanner.js'
import { nodeRuntimeScanner } from './nodeRuntimeScanner.js'
import { packageManagerScanner } from './packageManagerScanner.js'
import { readmeRealityScanner } from './readmeRealityScanner.js'
import { scriptScanner } from './scriptScanner.js'
import { testRealityScanner } from './testRealityScanner.js'

export const scanners: Scanner[] = [
  readmeRealityScanner,
  packageManagerScanner,
  scriptScanner,
  envScanner,
  dependencyScanner,
  nodeRuntimeScanner,
  dockerScanner,
  databaseScanner,
  testRealityScanner
]
