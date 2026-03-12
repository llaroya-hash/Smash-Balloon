'use server'
import { db } from '@/lib/db'
import { articleDrafts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import type { ArticleOutline } from '@/types'

export async function initArticleGeneration(
  brandId: string,
  topic: string,
  selectedFormat: string | null,
) {
  // Creates a draft record with status 'generating' and returns the draft ID
  const [draft] = await db.insert(articleDrafts).values({
    brandId,
    topic,
    selectedFormat,
    status: 'generating',
  }).returning()
  return draft
}

export async function updateArticleDraft(
  draftId: string,
  data: {
    outline?: ArticleOutline
    title?: string
    metaDescription?: string
    fullContent?: string
    targetKeyword?: string
    status?: 'generating' | 'draft_ready' | 'error'
  },
) {
  await db.update(articleDrafts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(articleDrafts.id, draftId))
}

export async function getArticleDraft(draftId: string) {
  const rows = await db.select().from(articleDrafts).where(eq(articleDrafts.id, draftId)).limit(1)
  return rows[0] ?? null
}

export async function listArticleDrafts(brandId: string) {
  return db.select().from(articleDrafts)
    .where(eq(articleDrafts.brandId, brandId))
    .orderBy(desc(articleDrafts.generatedAt))
}
