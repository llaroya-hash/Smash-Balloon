import { generateObject, streamText } from 'ai'
import { createGroq } from '@ai-sdk/groq'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

// Groq has token limits — cap brand context to avoid exceeding them
const MAX_CONTEXT_CHARS = 12000
function trimContext(ctx: string): string {
  return ctx.length > MAX_CONTEXT_CHARS ? ctx.slice(0, MAX_CONTEXT_CHARS) + '\n[context truncated]' : ctx
}

import { z } from 'zod'
import type { ArticleOutline } from '@/types'

// ---------------------------------------------------------------------------
// Zod schema for structured outline generation
// ---------------------------------------------------------------------------

export const ArticleOutlineSchema = z.object({
  title: z.string(),
  metaDescription: z.string().max(160),
  targetKeyword: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    headingLevel: z.enum(['h2', 'h3']),
    brief: z.string(),
    wordCountTarget: z.number(),
  })),
  ctaPlugin: z.string(),
})

// ---------------------------------------------------------------------------
// generateArticleOutline
// ---------------------------------------------------------------------------

export async function generateArticleOutline(
  topic: string,
  brandContextBlock: string,
  selectedFormat: string | null,
): Promise<ArticleOutline> {
  const formatInstruction = selectedFormat
    ? `\nFormat style: This article should follow a "${selectedFormat}" structure. Apply the conventions of this format throughout the outline.`
    : ''

  const prompt = `Generate a complete SEO-optimized article outline for the following topic: "${topic}"

Requirements:
- Target keyword appears naturally in the H1 title
- Include 4-6 H2 sections with scannable, descriptive headers
- Each section has a clear brief describing what to cover and a realistic word count target (100–400 words per section)
- Sections ordered: introduction (h2) → body sections (h2/h3) → conclusion with CTA
- The ctaPlugin field should contain a compelling call-to-action sentence for the brand's plugin
- Meta description must be under 160 characters
- Target keyword must be extracted from the topic${formatInstruction}`

  const result = await generateObject({
    model: groq('moonshotai/kimi-k2-instruct'),
    system: trimContext(brandContextBlock),
    schema: ArticleOutlineSchema,
    prompt,
  })

  return result.object as ArticleOutline
}

// ---------------------------------------------------------------------------
// buildSectionPrompt
// ---------------------------------------------------------------------------

export function buildSectionPrompt(outline: ArticleOutline, sectionIndex: number): string {
  const section = outline.sections[sectionIndex]
  const allSectionsContext = outline.sections
    .map((s, i) => `${i + 1}. [${s.headingLevel.toUpperCase()}] ${s.heading} — ${s.brief}`)
    .join('\n')

  return `You are writing one section of a multi-part article. Write ONLY the section specified below — do not write the introduction, other sections, or conclusion.

## Article Title
${outline.title}

## Full Article Outline (for structural context — do NOT write these sections)
${allSectionsContext}

## Section to Write Now
**Heading:** ${section.heading} (${section.headingLevel})
**Brief:** ${section.brief}
**Target length:** approximately ${section.wordCountTarget} words

## SEO Guidance
Target keyword: "${outline.targetKeyword}"
Use the keyword naturally where it fits. Focus on topical relevance and semantic coverage rather than keyword frequency.

Write the section content below. Start with the heading formatted as appropriate markdown.`
}

// ---------------------------------------------------------------------------
// buildIntroductionPrompt
// ---------------------------------------------------------------------------

export function buildIntroductionPrompt(outline: ArticleOutline, bodySections: string[]): string {
  const bodyContext = bodySections
    .map((content, i) => `--- Body Section ${i + 1} ---\n${content}`)
    .join('\n\n')

  return `You are writing the introduction for a blog article. The body sections have already been written — your introduction must accurately set up what was actually written, not just what the outline planned.

## Article Title
${outline.title}

## Target Keyword
${outline.targetKeyword}

## Body Sections Already Written
${bodyContext}

## Your Task
Write a compelling introduction (approximately 150 words) that:
- Opens with a hook that draws the reader in
- Naturally includes the target keyword: "${outline.targetKeyword}"
- Accurately previews the content covered in the body sections above
- Does NOT promise content that wasn't covered in the body

Write the introduction content only. Do not include a heading.`
}

// ---------------------------------------------------------------------------
// buildConclusionPrompt
// ---------------------------------------------------------------------------

export function buildConclusionPrompt(outline: ArticleOutline, bodySections: string[]): string {
  const bodyContext = bodySections
    .map((content, i) => `--- Body Section ${i + 1} ---\n${content}`)
    .join('\n\n')

  return `You are writing the conclusion for a blog article. The body sections have already been written — your conclusion must accurately summarize what was actually written.

## Article Title
${outline.title}

## Target Keyword
${outline.targetKeyword}

## CTA Plugin Text
${outline.ctaPlugin}

## Body Sections Already Written
${bodyContext}

## Your Task
Write a conclusion (approximately 150 words) that:
- Summarizes the key points covered in the body sections above
- Reinforces the value of taking action
- Ends with the call-to-action: "${outline.ctaPlugin}"

Write the conclusion content only. Do not include a heading.`
}

// ---------------------------------------------------------------------------
// streamSection (legacy export — kept for backward compatibility with stubs)
// ---------------------------------------------------------------------------

export async function streamSection(
  outline: ArticleOutline,
  sectionIndex: number,
  brandContextBlock: string,
): Promise<Response> {
  const prompt = buildSectionPrompt(outline, sectionIndex)
  const result = streamText({
    model: groq('moonshotai/kimi-k2-instruct'),
    system: trimContext(brandContextBlock),
    prompt,
  })
  return result.toUIMessageStreamResponse()
}
