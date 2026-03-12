import { generateArticleOutline } from '@/lib/ai/generation'

export const maxDuration = 60 // REQUIRED — prevents Vercel 10s timeout

export async function POST(req: Request) {
  const { topic, brandContextBlock, selectedFormat } = await req.json()
  const outline = await generateArticleOutline(topic, brandContextBlock, selectedFormat ?? null)
  return Response.json(outline)
}
