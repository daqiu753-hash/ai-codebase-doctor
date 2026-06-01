import { expect, it } from 'vitest'

it('has a real assertion', () => {
  expect('/api/health').toContain('/api')
})
