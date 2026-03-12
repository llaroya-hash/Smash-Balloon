import { describe, it, expect } from 'vitest'
import { compileBrandContextBlock, buildSEOInstructions } from '@/lib/ai/prompts'

const mockProfile = {
  name: 'Smash Balloon',
  targetAudience: 'WordPress site owners who want to display social feeds',
  toneDescription: 'Conversational but professional; no jargon',
  styleRules: [
    "Always open with the reader's specific problem",
    'Use numbered steps for any sequence with 3+ steps',
  ],
  pluginFacts: [{
    name: 'Social Feed Pro',
    features: ['Instagram feed display', 'Auto-refresh'],
    pricing: '$49/year',
    useCases: ['Display Instagram feed on homepage'],
  }],
  exampleArticle1: 'How to Display Your Instagram Feed on WordPress...',
  exampleArticle2: null,
}

describe('compileBrandContextBlock', () => {
  it('stub: function is importable without error', () => {
    const type = typeof compileBrandContextBlock
    if (type !== 'function') throw new Error('Expected compileBrandContextBlock to be a function')
  })

  it('includes the brand name in output', () => {
    const output = compileBrandContextBlock(mockProfile)
    expect(output).toContain('Smash Balloon')
  })

  it('includes targetAudience text in output', () => {
    const output = compileBrandContextBlock(mockProfile)
    expect(output).toContain('WordPress site owners who want to display social feeds')
  })

  it('includes each styleRule from the input array', () => {
    const output = compileBrandContextBlock(mockProfile)
    expect(output).toContain("Always open with the reader's specific problem")
    expect(output).toContain('Use numbered steps for any sequence with 3+ steps')
  })

  it('includes plugin name and features from pluginFacts', () => {
    const output = compileBrandContextBlock(mockProfile)
    expect(output).toContain('Social Feed Pro')
    expect(output).toContain('Instagram feed display')
    expect(output).toContain('Auto-refresh')
  })

  it('contains a do-not-invent instruction for plugin features', () => {
    const output = compileBrandContextBlock(mockProfile)
    // Must contain "ONLY reference features listed here" or similar instruction
    const hasDoNotInvent =
      output.includes('ONLY reference features listed here') ||
      output.includes('only reference features listed here') ||
      output.includes('do not invent') ||
      output.includes('Do not invent') ||
      output.includes('never invent')
    expect(hasDoNotInvent, 'Expected a do-not-invent instruction near plugin facts').toBe(true)
  })

  it('includes example article text when exampleArticle1 is provided', () => {
    const output = compileBrandContextBlock(mockProfile)
    expect(output).toContain('How to Display Your Instagram Feed on WordPress')
  })

  it('omits the example 2 block when exampleArticle2 is null', () => {
    const output = compileBrandContextBlock(mockProfile)
    // Should not have a second example article section header when article2 is null
    const secondExampleCount = (output.match(/Example Article 2|example_article_2|EXAMPLE 2/gi) || []).length
    expect(secondExampleCount).toBe(0)
  })

  it('handles a profile with two example articles', () => {
    const profileWithTwo = {
      ...mockProfile,
      exampleArticle1: 'First article content here',
      exampleArticle2: 'Second article content here',
    }
    const output = compileBrandContextBlock(profileWithTwo)
    expect(output).toContain('First article content here')
    expect(output).toContain('Second article content here')
  })
})

describe('buildSEOInstructions', () => {
  it('includes the keyword string passed in', () => {
    const output = buildSEOInstructions('instagram feed wordpress plugin', ['social feed', 'embed instagram'])
    expect(output).toContain('instagram feed wordpress plugin')
  })

  it('does NOT contain keyword density language', () => {
    const output = buildSEOInstructions('instagram feed wordpress plugin', ['social feed', 'embed instagram'])
    expect(output.toLowerCase()).not.toContain('keyword density')
    expect(output.toLowerCase()).not.toContain('keyword stuffing')
  })

  it('mentions semantic coverage or natural placement', () => {
    const output = buildSEOInstructions('instagram feed wordpress plugin', ['social feed', 'embed instagram'])
    const hasSemanticLanguage =
      output.toLowerCase().includes('semantic') ||
      output.toLowerCase().includes('natural') ||
      output.toLowerCase().includes('naturally') ||
      output.toLowerCase().includes('variants')
    expect(hasSemanticLanguage, 'Expected semantic coverage language in SEO instructions').toBe(true)
  })
})
