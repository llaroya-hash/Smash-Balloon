import { pgTable, uuid, text, integer, real, timestamp, jsonb } from 'drizzle-orm/pg-core'
import type { PluginFact, ArticleOutline } from '@/types'

export const brands = pgTable('brands', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  url: text('url'),
  brandContextBlock: text('brand_context_block'), // compiled at save time
  toneDescription: text('tone_description'),
  targetAudience: text('target_audience'),
  styleRules: jsonb('style_rules').$type<string[]>(),
  pluginFacts: jsonb('plugin_facts').$type<PluginFact[]>(),
  exampleArticle1: text('example_article_1'),
  exampleArticle2: text('example_article_2'),
  targetKeywords: jsonb('target_keywords').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const performanceData = pgTable('performance_data', {
  id: uuid('id').defaultRandom().primaryKey(),
  brandId: uuid('brand_id').references(() => brands.id).notNull(), // multi-brand FK
  pageTitle: text('page_title').notNull(),
  sessions: integer('sessions').notNull(),
  bounceRate: real('bounce_rate'),
  formatType: text('format_type'), // 'how-to' | 'list' | 'comparison' | 'other' — classified at upload
  uploadedAt: timestamp('uploaded_at').defaultNow(),
})

export const articleDrafts = pgTable('article_drafts', {
  id: uuid('id').defaultRandom().primaryKey(),
  brandId: uuid('brand_id').references(() => brands.id).notNull(), // multi-brand FK
  topic: text('topic').notNull(),
  targetKeyword: text('target_keyword'),
  title: text('title'),
  metaDescription: text('meta_description'),
  outline: jsonb('outline').$type<ArticleOutline>(),
  fullContent: text('full_content'), // assembled HTML/markdown
  status: text('status').default('draft').$type<'generating' | 'draft_ready' | 'error'>(),
  selectedFormat: text('selected_format'), // 'how-to' | 'list' | 'comparison' | null
  generatedAt: timestamp('generated_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
