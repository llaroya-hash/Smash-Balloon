import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the AI SDK before imports that use it
vi.mock('ai', () => ({
  generateObject: vi.fn(),
  streamText: vi.fn(),
}))

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'mocked-model'),
}))

import { generateArticleOutline, buildSectionPrompt, buildIntroductionPrompt, buildConclusionPrompt } from '@/lib/ai/generation'
import { generateObject } from 'ai'
import type { ArticleOutline } from '@/types'

const mockOutline: ArticleOutline = {
  title: 'How to Increase WordPress Plugin Sales',
  metaDescription: 'A guide to growing plugin sales using proven strategies.',
  targetKeyword: 'increase WordPress plugin sales',
  sections: [
    { heading: 'Introduction', headingLevel: 'h2', brief: 'Overview of the strategies', wordCountTarget: 150 },
    { heading: 'Pricing Strategies', headingLevel: 'h2', brief: 'Tiered pricing and freemium models', wordCountTarget: 300 },
    { heading: 'Content Marketing', headingLevel: 'h2', brief: 'Blog and tutorial content', wordCountTarget: 300 },
    { heading: 'Conclusion', headingLevel: 'h2', brief: 'Summary and next steps', wordCountTarget: 150 },
  ],
  ctaPlugin: 'Try our plugin free for 14 days.',
}

describe('Article generation', () => {
  it('stub: generateArticleOutline is importable without error', () => {
    // Verifies the import resolves
    const type = typeof generateArticleOutline
    if (type !== 'function') throw new Error('Expected generateArticleOutline to be a function')
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('brand context block is present in generation system prompt', async () => {
    const brandContextBlock = '## Brand: TestPlugin\n### Target Audience\nWordPress developers'
    const mockGenerateObject = vi.mocked(generateObject)
    mockGenerateObject.mockResolvedValueOnce({
      object: mockOutline,
    } as ReturnType<typeof generateObject> extends Promise<infer T> ? T : never)

    await generateArticleOutline('wordpress plugin sales', brandContextBlock, null)

    expect(mockGenerateObject).toHaveBeenCalledOnce()
    const callArgs = mockGenerateObject.mock.calls[0][0] as { system?: string; prompt?: string; messages?: unknown[] }
    // brand context block must appear in system prompt
    expect(callArgs.system).toContain(brandContextBlock)
  })

  it('format selection injects correctly into prompt when selectedFormat is provided', async () => {
    const brandContextBlock = '## Brand: TestPlugin'
    const mockGenerateObject = vi.mocked(generateObject)
    mockGenerateObject.mockResolvedValueOnce({
      object: mockOutline,
    } as ReturnType<typeof generateObject> extends Promise<infer T> ? T : never)

    await generateArticleOutline('wordpress plugin sales', brandContextBlock, 'how-to')

    expect(mockGenerateObject).toHaveBeenCalledOnce()
    const callArgs = mockGenerateObject.mock.calls[0][0] as { system?: string; prompt?: string }
    // how-to format instruction must appear in prompt
    const promptText = (callArgs.prompt ?? '') + (callArgs.system ?? '')
    expect(promptText.toLowerCase()).toContain('how-to')
  })

  it('no format instruction when selectedFormat is null', async () => {
    const brandContextBlock = '## Brand: TestPlugin'
    const mockGenerateObject = vi.mocked(generateObject)
    mockGenerateObject.mockResolvedValueOnce({
      object: mockOutline,
    } as ReturnType<typeof generateObject> extends Promise<infer T> ? T : never)

    await generateArticleOutline('wordpress plugin sales', brandContextBlock, null)

    const callArgs = mockGenerateObject.mock.calls[0][0] as { prompt?: string }
    // No format-specific instruction injected
    expect(callArgs.prompt ?? '').not.toContain('Format style:')
  })

  it('buildSectionPrompt contains outline title and all section headings', () => {
    const prompt = buildSectionPrompt(mockOutline, 1)
    // Must contain the outline title
    expect(prompt).toContain(mockOutline.title)
    // Must contain all section headings for structural context
    for (const section of mockOutline.sections) {
      expect(prompt).toContain(section.heading)
    }
    // Must reference the specific section being written
    expect(prompt).toContain(mockOutline.sections[1].heading)
    // Must include word count target
    expect(prompt).toContain(String(mockOutline.sections[1].wordCountTarget))
  })

  it('buildSectionPrompt instructs writing only the specified section', () => {
    const prompt = buildSectionPrompt(mockOutline, 1)
    // Prompt must instruct LLM to write only the specified section
    expect(prompt.toLowerCase()).toMatch(/only|just/)
    // Must include SEO keyword reference
    expect(prompt).toContain(mockOutline.targetKeyword)
  })

  it('buildIntroductionPrompt uses body sections as context', () => {
    const bodySections = ['Body section 1 content here.', 'Body section 2 content here.']
    const prompt = buildIntroductionPrompt(mockOutline, bodySections)
    // Must contain actual body section content so intro reflects what was written
    expect(prompt).toContain(bodySections[0])
    expect(prompt).toContain(bodySections[1])
    // Must contain outline title
    expect(prompt).toContain(mockOutline.title)
  })

  it('buildConclusionPrompt uses body sections as context', () => {
    const bodySections = ['Body section 1 content here.', 'Body section 2 content here.']
    const prompt = buildConclusionPrompt(mockOutline, bodySections)
    // Must contain actual body section content so conclusion reflects what was written
    expect(prompt).toContain(bodySections[0])
    expect(prompt).toContain(bodySections[1])
    // Must contain the CTA plugin text
    expect(prompt).toContain(mockOutline.ctaPlugin)
  })
})
