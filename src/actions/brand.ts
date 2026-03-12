'use server'

import { db } from '@/lib/db'
import { brands } from '@/lib/db/schema'
import { compileBrandContextBlock } from '@/lib/ai/prompts'
import type { PluginFact } from '@/types'
import { eq } from 'drizzle-orm'

export interface BrandProfileInput {
  name: string
  url?: string | null
  targetAudience: string
  toneDescription: string
  styleRules: string[]
  pluginFacts: PluginFact[]
  exampleArticle1: string
  exampleArticle2?: string | null
  targetKeywords?: string[] | null
}

export async function saveBrandProfile(data: BrandProfileInput) {
  const brandContextBlock = compileBrandContextBlock(data)
  const result = await db.insert(brands).values({
    name: data.name,
    url: data.url ?? null,
    targetAudience: data.targetAudience,
    toneDescription: data.toneDescription,
    styleRules: data.styleRules,
    pluginFacts: data.pluginFacts,
    exampleArticle1: data.exampleArticle1,
    exampleArticle2: data.exampleArticle2 ?? null,
    targetKeywords: data.targetKeywords ?? null,
    brandContextBlock,
  }).returning({ id: brands.id })
  return result[0]
}

export async function updateBrandProfile(id: string, data: BrandProfileInput) {
  const brandContextBlock = compileBrandContextBlock(data)
  await db.update(brands).set({
    name: data.name,
    url: data.url ?? null,
    targetAudience: data.targetAudience,
    toneDescription: data.toneDescription,
    styleRules: data.styleRules,
    pluginFacts: data.pluginFacts,
    exampleArticle1: data.exampleArticle1,
    exampleArticle2: data.exampleArticle2 ?? null,
    targetKeywords: data.targetKeywords ?? null,
    brandContextBlock,
    updatedAt: new Date(),
  }).where(eq(brands.id, id))
}

export async function getBrandProfile() {
  const rows = await db.select().from(brands).limit(1)
  return rows[0] ?? null
}
