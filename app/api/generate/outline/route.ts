import { generateArticleOutline } from '@/lib/ai/generation'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { topic, brandContextBlock, selectedFormat } = await req.json()
    const outline = await generateArticleOutline(topic, brandContextBlock, selectedFormat ?? null)
    return Response.json(outline)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[outline route error]', msg)
    return Response.json({ error: msg }, { status: 500 })
  }
}
