import { describe, it } from 'vitest'
import { parseGA4CSV } from '@/lib/csv/parse'

describe('parseGA4CSV', () => {
  it('stub: function is importable without error', () => {
    // Verifies the import resolves
    const type = typeof parseGA4CSV
    if (type !== 'function') throw new Error('Expected parseGA4CSV to be a function')
  })

  it.todo('correctly maps GA4 column names')

  it.todo('handles GA4 metadata header rows')
})
