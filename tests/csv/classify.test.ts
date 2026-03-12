import { describe, it } from 'vitest'
import { classifyFormatType } from '@/lib/csv/classify'

describe('classifyFormatType', () => {
  it('stub: function is importable without error', () => {
    // Verifies the import resolves
    const type = typeof classifyFormatType
    if (type !== 'function') throw new Error('Expected classifyFormatType to be a function')
  })

  it.todo("how-to for titles containing 'how to'")

  it.todo('list for titles starting with number')

  it.todo("comparison for titles with 'vs'")
})
