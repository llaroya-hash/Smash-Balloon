import { describe, it } from 'vitest'
import { generateArticleOutline, streamSection } from '@/lib/ai/generation'

describe('Article generation', () => {
  it('stub: generateArticleOutline is importable without error', () => {
    // Verifies the import resolves
    const type = typeof generateArticleOutline
    if (type !== 'function') throw new Error('Expected generateArticleOutline to be a function')
  })

  it('stub: streamSection is importable without error', () => {
    // Verifies the import resolves
    const type = typeof streamSection
    if (type !== 'function') throw new Error('Expected streamSection to be a function')
  })

  it.todo('brand context block is present in generation system prompt')

  it.todo('format selection injects correctly into prompt')
})
