import { describe, it, expect } from 'vitest'
import { buildSEOInstructions } from '@/lib/ai/prompts'

describe('buildSEOInstructions', () => {
  it('stub: function is importable without error', () => {
    // Verifies the import resolves
    const type = typeof buildSEOInstructions
    if (type !== 'function') throw new Error('Expected buildSEOInstructions to be a function')
  })

  it('SEO instruction uses semantic coverage pattern (not keyword density)', () => {
    const result = buildSEOInstructions('wordpress plugin sales', ['plugin revenue', 'sell WordPress plugins'])
    // Must use semantic/variants language
    const lower = result.toLowerCase()
    expect(lower).toMatch(/semantic|variants/)
    // Must NOT promote keyword density
    expect(lower).not.toContain('keyword density')
    expect(lower).not.toContain('repeat the keyword')
  })

  it('keyword appears in instruction output', () => {
    const keyword = 'increase wordpress plugin sales'
    const result = buildSEOInstructions(keyword, [])
    expect(result).toContain(keyword)
  })
})
