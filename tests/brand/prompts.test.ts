import { describe, it } from 'vitest'
import { compileBrandContextBlock } from '@/lib/ai/prompts'

describe('compileBrandContextBlock', () => {
  it('stub: function is importable without error', () => {
    // Verifies the import resolves
    const type = typeof compileBrandContextBlock
    if (type !== 'function') throw new Error('Expected compileBrandContextBlock to be a function')
  })

  it.todo('includes all profile fields in output')

  it.todo('includes example article text')

  it.todo('includes plugin facts with do-not-invent instruction')
})
