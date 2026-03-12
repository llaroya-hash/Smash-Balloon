import { describe, it } from 'vitest'
import { buildSEOInstructions } from '@/lib/ai/prompts'

describe('buildSEOInstructions', () => {
  it('stub: function is importable without error', () => {
    // Verifies the import resolves
    const type = typeof buildSEOInstructions
    if (type !== 'function') throw new Error('Expected buildSEOInstructions to be a function')
  })

  it.todo('SEO instruction uses semantic coverage pattern')

  it.todo('keyword appears in instruction output')
})
