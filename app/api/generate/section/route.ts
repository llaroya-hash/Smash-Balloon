import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { buildSectionPrompt, buildIntroductionPrompt, buildConclusionPrompt } from '@/lib/ai/generation'
import type { ArticleOutline } from '@/types'

export const maxDuration = 60 // REQUIRED — prevents Vercel 10s timeout

export async function POST(req: Request) {
  const {
    outline,
    sectionIndex,
    sectionType,
    brandContextBlock,
    bodySections,
  }: {
    outline: ArticleOutline
    sectionIndex: number
    sectionType: 'section' | 'introduction' | 'conclusion'
    brandContextBlock: string
    bodySections?: string[]
  } = await req.json()

  let prompt: string
  if (sectionType === 'introduction') {
    prompt = buildIntroductionPrompt(outline, bodySections ?? [])
  } else if (sectionType === 'conclusion') {
    prompt = buildConclusionPrompt(outline, bodySections ?? [])
  } else {
    prompt = buildSectionPrompt(outline, sectionIndex)
  }

  const result = streamText({
    model: openai('gpt-4o'),
    system: brandContextBlock,
    prompt,
  })

  return result.toUIMessageStreamResponse()
}
