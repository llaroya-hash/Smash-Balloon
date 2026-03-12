# Phase 1: Foundation - Research

**Researched:** 2026-03-12
**Domain:** Next.js full-stack application — brand voice setup, GA4 CSV ingestion, multi-step LLM article generation with streaming
**Confidence:** HIGH for stack (verified via official docs and live npm); HIGH for architecture patterns (derived directly from requirements + prior project research); MEDIUM for AI SDK v6 streaming specifics (verified current version, docs partially restricted during research)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Article Output UX
- Output is formatted rich text with headings already applied (H1, H2, H3) — copy-paste straight into WordPress block editor, no reformatting needed
- Article streams in as it generates (word-by-word, ChatGPT-style) — no waiting spinner
- User can regenerate the whole article with one button — no section-level regeneration in v1
- Articles are saved automatically — user can return, copy again, or regenerate later

#### Brand Form Design
- Step-by-step wizard for initial setup: brand basics → tone & style → example articles → plugin facts
- Example articles (BRAND-02): user pastes raw text into a textarea — one large text box per article, copy from WordPress, paste in
- Plugin facts sheet (BRAND-03): guided structured fields — Plugin name, Key features (list), Pricing tiers, Main use cases — not free text
- Brand profile is always editable after save — new articles use the latest saved version, no warnings or locks

#### Performance Data Display
- After CSV upload, show a simple table: Article title | Sessions | Top format type (how-to, list, comparison) — ranked by traffic
- Performance data influence on generation is user-controlled: before generating, user picks "Use top-performing format" or "Choose format manually" — not silent/automatic
- CSV is re-uploadable anytime — new upload replaces previous data, no version history needed

### Claude's Discretion
- Tech stack and framework selection (researcher to recommend)
- Database schema details (multi-brand FK pattern already decided in STATE.md)
- Exact field labels and microcopy
- Loading skeleton and empty state designs
- Error handling and validation patterns

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BRAND-01 | User can fill out a brand voice form (tone, target audience, writing style, plugin focus, target keywords) | Multi-step wizard pattern with react-hook-form + Zod + shadcn/ui; compiled system prompt block pattern |
| BRAND-02 | User can paste 1-2 example articles so the AI learns the actual writing structure and style | Large textarea input per article; stored as TEXT in Postgres; injected as few-shot examples in generation system prompt |
| BRAND-03 | User can fill out a plugin facts sheet (product names, features, pricing, use cases) to prevent AI hallucination | Structured form fields (not free text); stored as JSON in Postgres; injected into every generation call with explicit "only use these facts" instruction |
| PERF-01 | User can upload a Google Analytics CSV export for existing articles | PapaParse for browser-side CSV parsing; Server Action for upload handling; Postgres storage of extracted performance rows |
| PERF-02 | Tool uses top-performing article data to inform topic scoring | Format classification via LLM (how-to, list, comparison) at upload time; stored with each row; surfaced in generation prompt when user selects "Use top-performing format" |
| PERF-03 | Tool uses top-performing article data to inform writing style | User-controlled format selection at generation time (not silent); selected format injected as a constraint in the article generation prompt |
| ARTICLE-01 | User can generate a full publish-ready article draft for any manually entered topic | Multi-step pipeline: generateObject for outline → streamText per section → streamText for intro/conclusion assembly; Vercel AI SDK v6 |
| ARTICLE-02 | Generated articles match Smash Balloon brand voice | Brand voice compiled to system prompt block at save time; few-shot exemplar excerpts from BRAND-02 injected; structural rules (not adjectives) in prompt |
| ARTICLE-03 | Generated articles are SEO-optimized (target keyword, meta description, H2/H3, no keyword stuffing) | Semantic coverage instruction pattern (2-3 natural uses of keyword); separate meta description generation step; H2/H3 headers defined in outline step |
</phase_requirements>

---

## Summary

Phase 1 builds the core pipeline of this greenfield Next.js application: brand voice setup, performance data ingestion, and streaming article generation. This is a solo-user internal tool with no existing codebase — every dependency is a fresh install. The prior project research (`.planning/research/`) established the full stack: Next.js 16 App Router + Vercel AI SDK (now confirmed at v6, not v4 as previously researched) + Drizzle ORM + Neon Postgres + Tailwind + shadcn/ui. Phase 1 specifically requires three new technical capabilities beyond basic CRUD: (1) a multi-step wizard form with cross-step state persistence, (2) CSV file upload and column parsing against GA4's export format, and (3) a multi-step LLM generation pipeline (outline → sections → assembly) with streaming to the UI.

The Vercel AI SDK has moved to v6 (current: `ai@6.0.116` as of March 2026). The core APIs are stable — `streamText`, `generateObject`, `generateText` — and the primary architectural shift in v6 is introducing agents as a first-class abstraction, which is not needed for Phase 1. The Route Handler pattern for streaming remains valid; Server Actions are also supported for mutations. The multi-step article generation pipeline is the highest-risk implementation in this phase: a single `streamText` call for a 1,500-word article degrades structurally past ~800 words. The solution is `generateObject` for the outline, followed by sequential `streamText` calls per section, with the outline passed as context for every call.

**Primary recommendation:** Build in dependency order — DB schema first (with `brand_id` FK on all tables for multi-brand readiness), then brand profile wizard, then CSV upload/ingestion, then article generation pipeline with streaming. The brand voice compiled prompt block is the single highest-leverage decision: it must use structural rules + exemplar excerpts + plugin facts, not adjective lists.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x (latest stable — see note) | Full-stack framework | App Router, Server Actions, streaming SSE, Server Components — all needed. Verified Feb 2026 via official docs. |
| React | 19 (bundled) | UI rendering | Included with Next.js App Router. `use()` hook for streaming. |
| TypeScript | 5.x | Type safety | Default in `create-next-app`. Non-negotiable for AI tool where input/output shapes change. |
| `ai` (Vercel AI SDK) | **6.0.116** (latest, verified March 2026) | LLM orchestration, streaming | Standard library for AI in Next.js. `streamText`, `generateObject`, Route Handlers + Server Actions both supported. Provider-agnostic. |
| `@ai-sdk/openai` | latest | OpenAI provider | `gpt-4o` for article generation; `gpt-4o-mini` for classification tasks. |
| `zod` | 3.x | Schema validation + LLM output typing | Used by `generateObject` to enforce typed JSON from LLM. Also validates form inputs. |
| Drizzle ORM | latest | Type-safe DB queries | Referenced directly in Next.js official auth guide. No codegen daemon, schema-as-TypeScript, serverless-optimized. |
| `@neondatabase/serverless` | latest | Neon Postgres driver | Connection pooling built-in for serverless/Vercel. Optimized for Next.js. |
| Tailwind CSS | v4 | Styling | Default in `create-next-app`. Fastest path for internal tool UI. |
| shadcn/ui | latest | Component library | Copy-paste components (Form, Input, Textarea, Table, Button, Badge). Radix UI primitives underneath. No dep lock-in. |
| `react-hook-form` | 7.x | Form state management | Multi-step wizard state, field validation. Works with Zod via `@hookform/resolvers`. |
| Better Auth | latest | Session management | Single-user auth. Listed in Next.js official auth guide. No per-MAU pricing. |

**Note on Next.js version:** Prior research referenced "Next.js 16.1.6" but this may have been a training data artifact. Use `npx create-next-app@latest` to get the current stable release — do not pin to a specific version number until confirmed at install time.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `papaparse` | 5.x | CSV parsing | GA4 CSV upload — browser-side parsing with header row support. PapaParse is the standard JS CSV library. |
| `date-fns` | 3.x | Date utilities | Needed for any date math in CSV data, generation timestamps. |
| `nuqs` | latest | URL state | Brand form step navigation; preserves step position across refreshes. |
| `@hookform/resolvers` | latest | Zod integration for react-hook-form | Connects Zod schemas to react-hook-form validation. |
| `@ai-sdk/anthropic` | latest | Anthropic provider (optional) | Claude 3.7 Sonnet as fallback for long-form brand voice. One-line swap via AI SDK. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vercel AI SDK v6 | LangChain.js | LangChain is over-engineered for this use case. AI SDK covers all needed patterns with less abstraction overhead. |
| `papaparse` | Node.js `csv-parse` | csv-parse is server-side only. PapaParse runs in browser (no round-trip), parses on upload. |
| `react-hook-form` + Zod | Zustand + Zod for wizard state | Zustand (with persist middleware) is valid for multi-step wizard state. react-hook-form is lighter for form-specific state; Zustand is better if state must persist beyond the wizard component. Either works — decide at implementation. |
| Neon | Supabase Postgres | Supabase includes auth/realtime/storage that go unused. Neon is leaner. |
| Better Auth | NextAuth.js | NextAuth is a valid fallback with more examples. Better Auth has cleaner TypeScript types for new projects. |

**Installation:**

```bash
# Bootstrap (use current latest)
npx create-next-app@latest content-marketing-tool --typescript --tailwind --app --yes

# Core AI
npm install ai @ai-sdk/openai @ai-sdk/anthropic

# Database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Validation
npm install zod @hookform/resolvers

# Auth
npm install better-auth

# Forms
npm install react-hook-form

# CSV parsing
npm install papaparse
npm install -D @types/papaparse

# UI components (shadcn via CLI — adds individually)
npx shadcn@latest init

# Date utilities + URL state
npm install date-fns nuqs
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login/session pages
│   ├── (dashboard)/
│   │   ├── brand/           # Brand voice wizard + edit
│   │   ├── performance/     # CSV upload + performance table
│   │   └── generate/        # Topic input + article streaming output
│   └── api/
│       └── generate/        # Route Handler for streaming article output
├── components/
│   ├── brand/               # BrandWizard, StepIndicator, FactsSheetForm
│   ├── performance/         # CSVUpload, PerformanceTable, FormatPicker
│   └── article/             # ArticleStream, ArticleOutput, RegenerateButton
├── lib/
│   ├── db/
│   │   ├── schema.ts        # Drizzle schema (brands, perf_data, articles)
│   │   └── index.ts         # DB client
│   ├── ai/
│   │   ├── prompts.ts       # Brand context block compiler + article prompts
│   │   └── generation.ts    # Multi-step pipeline orchestration
│   └── csv/
│       └── parse.ts         # GA4 column mapping + format classification
├── actions/
│   ├── brand.ts             # Server Actions: saveBrandProfile, updateBrandProfile
│   ├── performance.ts       # Server Actions: savePerformanceData
│   └── article.ts           # Server Actions: initArticleGeneration
└── types/
    └── index.ts             # Shared TypeScript types
```

### Pattern 1: Multi-Step Brand Voice Wizard

**What:** A 4-step wizard (brand basics → tone & style → example articles → plugin facts) built with react-hook-form + Zod per step, with final save as a single Server Action.

**When to use:** Initial brand profile setup; form state does not need to persist beyond the session.

**Key decision:** Each step validates independently with its own Zod schema. All step data is held in component state (or a lightweight Zustand store if the user might navigate away mid-wizard). On final step submission, a single Server Action writes the complete brand profile to Postgres.

```typescript
// lib/ai/prompts.ts — compiled at save time
export function compileBrandContextBlock(profile: BrandProfile): string {
  return `
BRAND VOICE: ${profile.brandName}

AUDIENCE: ${profile.targetAudience}

TONE: ${profile.toneDescription}

STYLE RULES:
${profile.styleRules.map(rule => `- ${rule}`).join('\n')}

PLUGIN CONTEXT:
${profile.pluginFacts.map(p => `Plugin: ${p.name}\nFeatures: ${p.features.join(', ')}\nPricing: ${p.pricing}\nUse cases: ${p.useCases.join(', ')}`).join('\n\n')}

EXAMPLE WRITING STYLE:
The following excerpts are from published articles that represent the exact voice and structure to match:

--- EXAMPLE 1 ---
${profile.exampleArticle1}

${profile.exampleArticle2 ? `--- EXAMPLE 2 ---\n${profile.exampleArticle2}` : ''}
`.trim();
}
```

**Save action:**

```typescript
// actions/brand.ts
'use server'
import { db } from '@/lib/db'
import { brands } from '@/lib/db/schema'
import { compileBrandContextBlock } from '@/lib/ai/prompts'

export async function saveBrandProfile(data: BrandProfileInput) {
  const brandContextBlock = compileBrandContextBlock(data)
  await db.insert(brands).values({
    ...data,
    brandContextBlock,
    updatedAt: new Date(),
  }).onConflictDoUpdate({ target: brands.id, set: { brandContextBlock, updatedAt: new Date() } })
}
```

### Pattern 2: GA4 CSV Upload and Format Classification

**What:** Browser-side CSV parsing with PapaParse; column mapping against known GA4 export column names; LLM classification of article format (how-to, list, comparison, other) per row; Server Action stores the classified rows.

**When to use:** PERF-01 CSV upload; re-upload replaces all existing data for that brand.

**GA4 CSV column mapping (confirmed from research):**
GA4 standard page-level report CSV exports use these columns (varies by custom report configuration):
- `Page title` or `Page path` — article identifier
- `Sessions` — session count
- `Engaged sessions` — engaged session count
- `Bounce rate` — bounce percentage
- `Average engagement time` — time on page

The format type column does NOT exist in GA4 exports — it must be inferred from the article title/URL using an LLM classification call at upload time.

```typescript
// lib/csv/parse.ts
import Papa from 'papaparse'

export interface PerformanceRow {
  pageTitle: string
  sessions: number
  bounceRate: number | null
}

export function parseGA4CSV(file: File): Promise<PerformanceRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // GA4 exports have metadata rows at top — skip until actual data headers
        const rows = results.data as Record<string, string>[]
        const mapped = rows
          .filter(row => row['Page title'] && row['Sessions'])
          .map(row => ({
            pageTitle: row['Page title'] || row['Page path'] || '',
            sessions: parseInt(row['Sessions'] ?? '0', 10),
            bounceRate: row['Bounce rate'] ? parseFloat(row['Bounce rate']) : null,
          }))
        resolve(mapped)
      },
      error: reject,
    })
  })
}
```

**GA4 CSV format caveat:** GA4 CSV exports include 8–10 metadata/header lines at the top of the file before the actual column headers. PapaParse's `header: true` will treat the first row as headers — which is the GA4 metadata, not the data headers. Filter rows by checking for expected column names or skip until a row contains `Sessions` as a column value. Treat this as a known parsing challenge and add explicit handling.

### Pattern 3: Multi-Step Article Generation Pipeline

**What:** Three-stage LLM pipeline — (1) `generateObject` to produce a structured article outline with H2/H3 headers and section briefs, (2) sequential `streamText` calls per section with the full outline as context, (3) separate `streamText` calls for introduction and conclusion (written last, after body sections exist).

**When to use:** ARTICLE-01 generation; avoids the structural degradation that occurs in single-call generation past ~800 words.

**Critical design:** The outline is generated first and shown to the user briefly (or used invisibly). Each section generation call receives: system prompt (brand context block), the full article outline, and instruction to write specifically the named section. Introduction and conclusion are written last so they accurately summarize what was actually written.

**Why this beats single-call:** LLMs lose structural consistency past ~800 tokens of output. A 5-section article generated in one call often repeats content in sections 4-5 or forgets the structure it promised in section 1. Per-section calls with outline context keep each section tight and on-spec.

```typescript
// lib/ai/generation.ts
import { generateObject, streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const ArticleOutlineSchema = z.object({
  title: z.string(),
  metaDescription: z.string().max(160),
  targetKeyword: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    headingLevel: z.enum(['h2', 'h3']),
    brief: z.string(), // 2-3 sentence section summary
    wordCountTarget: z.number(),
  })),
  ctaPlugin: z.string(), // which Smash Balloon plugin to tie CTA to
})

export async function generateArticleOutline(
  topic: string,
  brandContextBlock: string,
  topPerformingFormat: string | null,
): Promise<z.infer<typeof ArticleOutlineSchema>> {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: ArticleOutlineSchema,
    system: brandContextBlock,
    prompt: `
Create a detailed article outline for the following topic: "${topic}"
${topPerformingFormat ? `Format style: ${topPerformingFormat} (user-selected based on top-performing content)` : ''}

Requirements:
- Target keyword must appear naturally in the H1 title
- Include 4-6 H2 sections with specific, scannable headers
- Meta description must be accurate to the outline (not generic)
- Each section brief must describe what the reader will learn, not just restate the heading
- The final section should be a conclusion with a CTA to the most relevant plugin
    `,
  })
  return object
}

// Route Handler for streaming (app/api/generate/section/route.ts)
export async function streamSection(
  outline: z.infer<typeof ArticleOutlineSchema>,
  sectionIndex: number,
  brandContextBlock: string,
): Promise<Response> {
  const section = outline.sections[sectionIndex]
  const result = streamText({
    model: openai('gpt-4o'),
    system: brandContextBlock,
    prompt: `
You are writing Section ${sectionIndex + 1} of ${outline.sections.length} in this article.

FULL ARTICLE OUTLINE (for structural context):
Title: ${outline.title}
${outline.sections.map((s, i) => `${i + 1}. ${s.headingLevel.toUpperCase()}: ${s.heading} — ${s.brief}`).join('\n')}

YOUR TASK: Write ONLY the "${section.heading}" section (${section.headingLevel.toUpperCase()}).
Target: ~${section.wordCountTarget} words.
Section brief: ${section.brief}

SEO instruction: The primary keyword is "${outline.targetKeyword}". Use it naturally 0-1 times in this section. Do not repeat the heading text verbatim in the first sentence.
    `,
  })
  return result.toUIMessageStreamResponse()
}
```

### Pattern 4: Streaming Output to the UI

**What:** Article sections stream to the client in real-time via a Route Handler that returns `result.toUIMessageStreamResponse()`. The client uses `useChat` or a custom `ReadableStream` reader to append tokens to the display.

**When to use:** The "word-by-word streaming" UX decided in CONTEXT.md. The article displays like ChatGPT output.

**Note on architecture:** The multi-step pipeline means multiple sequential stream calls (one per section). The UI should render sections progressively: show the outline/headings first (already generated from `generateObject`), then fill in body content as each section streams. This gives the user structure immediately and visible progress throughout.

**Route Handler pattern (AI SDK v6):**

```typescript
// app/api/generate/section/route.ts
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export const maxDuration = 60 // Required for long LLM calls on Vercel

export async function POST(req: Request) {
  const { outline, sectionIndex, brandContextBlock } = await req.json()

  const section = outline.sections[sectionIndex]
  const result = streamText({
    model: openai('gpt-4o'),
    system: brandContextBlock,
    prompt: buildSectionPrompt(outline, sectionIndex),
  })

  return result.toUIMessageStreamResponse()
}
```

**Critical Vercel config:** Set `maxDuration = 60` (or higher) on any Route Handler or Server Action that calls `streamText`. The default 10-second function timeout kills LLM calls before they complete.

### Anti-Patterns to Avoid

- **Single-call article generation:** Do not call `streamText` with "write a 1500-word article about [topic]". Structural coherence breaks past ~800 words. Use the outline → sections pipeline.
- **Brand voice as adjective list:** "Conversational, professional, no jargon" in a system prompt produces generic AI prose. Use structural rules ("always open with reader's problem") + exemplar excerpts. The compiled context block pattern is the solution.
- **Assembling brand context on every request:** Compile the `brandContextBlock` once at profile save time. Store it in Postgres. Retrieve and inject it — never reassemble from parts on the hot path.
- **Silent CSV parse failures:** GA4 CSV exports have metadata rows at the top. PapaParse with `header: true` alone will misidentify headers. Add row filtering/skipping logic to handle this reliably.
- **Keyword stuffing via "optimize for [keyword]":** This instruction pattern produces unnatural repetition. Use the semantic coverage pattern instead: "Use this phrase 2-3 times naturally; use these semantic variants throughout."
- **No `maxDuration` on streaming routes:** Vercel's default 10-second function timeout silently kills generation. Always set `export const maxDuration = 60` on generation routes.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV parsing | Custom string splitting | PapaParse | Handles quoted fields, encoding, malformed rows, large files, header detection |
| LLM streaming to browser | Custom SSE implementation | AI SDK `streamText` + `toUIMessageStreamResponse()` | Handles backpressure, connection drops, token buffering, browser stream API |
| Structured LLM output | JSON.parse on raw LLM response | AI SDK `generateObject` + Zod schema | Handles retry on invalid JSON, provider-specific structured output APIs, type safety |
| Form validation | Custom validation functions | Zod + react-hook-form `zodResolver` | Handles async validation, deeply nested objects, union types, error message formatting |
| DB connection pooling in serverless | Manual pg Pool management | `@neondatabase/serverless` | Handles connection pooling edge cases specific to serverless/Next.js — naive pools exhaust quickly |
| Multi-step wizard state | Complex useState chains | react-hook-form (per step) + component state for step tracking | Form libraries handle field registration, dirty/touched/error states, re-validation on change |
| Authentication session | Custom JWT implementation | Better Auth + jose | Session security has many edge cases (CSRF, secure cookies, token rotation) — do not build from scratch |

**Key insight:** In an AI tool where LLM output shapes are the primary data, the streaming, structured output, and validation infrastructure is where bugs hide. Using the AI SDK's `generateObject` instead of parsing raw LLM JSON output alone saves 2-3 debugging sessions per feature.

---

## Common Pitfalls

### Pitfall 1: Brand Voice Adjective Trap

**What goes wrong:** Brand voice form collects adjectives ("conversational," "professional") that barely shift LLM output distribution. Every draft opens with "In today's digital landscape..." and requires 1-2 hour rewrites.

**Why it happens:** LLMs are trained on millions of generic marketing articles. Adjective descriptors are too common to distinguish output. The model has no grounding data showing what Smash Balloon content actually looks like.

**How to avoid:**
1. Require 3-5 structural rules in the brand voice form: "Always open with the reader's problem statement," "Use numbered steps for any sequence with 3+ steps," "Every H2 section must end with a specific actionable takeaway"
2. BRAND-02 example articles are injected as few-shot examples in the system prompt — this is the highest-impact voice-grounding mechanism
3. BRAND-03 plugin facts sheet prevents hallucinated product claims: include explicit instruction "Only reference plugin features from the provided facts sheet. Never invent capabilities not listed."

**Warning signs:** Generated intros start with "In today's..." — draft articles don't mention specific plugin features until late — headers are generic ("Why This Matters") rather than specific.

### Pitfall 2: GA4 CSV Metadata Row Problem

**What goes wrong:** GA4 CSV exports contain 8-10 metadata rows at the top (property name, date range, report name, etc.) before the actual column headers. PapaParse with `header: true` reads the first row as headers, producing column names like `"# Google Analytics 4 Report: Pages and screens"` instead of `"Page title"`.

**Why it happens:** GA4 does not produce clean tabular CSVs — the export format includes an information header block inherited from Universal Analytics export conventions.

**How to avoid:** Scan the raw string for the row that contains known GA4 column names (`Page title`, `Sessions`, `Users`) and skip to that row before passing to PapaParse. Alternatively, use PapaParse without `header: true`, detect the header row index manually, and slice from there.

**Warning signs:** `pageTitle` fields are all empty or contain GA4 metadata text — `sessions` is NaN for all rows.

### Pitfall 3: Vercel Function Timeout on Long Generation Calls

**What goes wrong:** Article generation (outline → sections) takes 30-90 seconds total. Without `maxDuration`, Vercel's default 10-second function timeout silently kills the streaming response mid-article. The user sees partial output and no error.

**Why it happens:** Vercel defaults are calibrated for API endpoints, not LLM generation streams. The timeout applies even to streaming responses.

**How to avoid:** Add `export const maxDuration = 60` (or `90`) to every Route Handler that calls `streamText` or `generateObject`. For multi-step pipelines with sequential calls, consider whether each section call needs its own route or whether a single orchestration route can manage the full pipeline.

**Warning signs:** Articles consistently truncate at the same point — generation "completes" in exactly 10 seconds.

### Pitfall 4: Plugin Hallucination Without Facts Sheet Enforcement

**What goes wrong:** Generated articles invent Smash Balloon plugin features, pricing tiers, or capabilities that don't exist. A reader acts on incorrect information and loses trust in the brand.

**Why it happens:** LLMs infer plausible-sounding product details from training data. Without explicit grounding, they will fill in gaps with confident fabrications.

**How to avoid:** BRAND-03 plugin facts sheet must be (a) required, not optional, and (b) injected into every generation call with an explicit "ONLY reference features from this list" instruction in the system prompt. The instruction must appear prominently near the start of the system prompt, not buried at the end.

**Warning signs:** Generated article references a free tier limit that differs from the current pricing page — article mentions a "coming soon" feature that is already live.

### Pitfall 5: Saving Articles Before Generation Completes

**What goes wrong:** Auto-save logic triggers on `onFinish` callback but the article draft record is inserted before all sections finish streaming. Partial drafts appear as complete in the article list, and regeneration overwrites partially-complete content.

**Why it happens:** Multi-step streaming pipeline has multiple `onFinish` events (one per section). Auto-save must trigger only when ALL sections have completed, not per-section.

**How to avoid:** Track generation state (e.g., `sectionsDone: number`, `totalSections: number`) in the article record. Only update the draft record status to `draft_ready` when `sectionsDone === totalSections`. Use a `generating` status during the pipeline.

---

## Code Examples

### Database Schema (Drizzle + multi-brand ready)

```typescript
// lib/db/schema.ts
import { pgTable, uuid, text, integer, real, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core'

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
```

### Brand Context Block Compiler

```typescript
// lib/ai/prompts.ts
export function compileBrandContextBlock(profile: {
  name: string
  targetAudience: string
  toneDescription: string
  styleRules: string[]
  pluginFacts: PluginFact[]
  exampleArticle1?: string | null
  exampleArticle2?: string | null
}): string {
  const factsBlock = profile.pluginFacts.map(p => `
Plugin: ${p.name}
Key features: ${p.features.join('; ')}
Pricing: ${p.pricing}
Use cases: ${p.useCases.join('; ')}
  `.trim()).join('\n\n')

  return `
BRAND VOICE: ${profile.name}

AUDIENCE: ${profile.targetAudience}

TONE: ${profile.toneDescription}

STYLE RULES (follow these precisely):
${profile.styleRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

PLUGIN FACTS (ONLY reference features listed here — never invent capabilities):
${factsBlock}

EXAMPLE WRITING STYLE (write in exactly this style and structure):
${profile.exampleArticle1 ? `--- Example 1 ---\n${profile.exampleArticle1.slice(0, 1500)}` : ''}
${profile.exampleArticle2 ? `\n--- Example 2 ---\n${profile.exampleArticle2.slice(0, 1500)}` : ''}
  `.trim()
}
```

### SEO Prompt Pattern (semantic coverage, not keyword stuffing)

```typescript
// lib/ai/prompts.ts — SEO instruction block
export function buildSEOInstructions(keyword: string, semanticVariants: string[]): string {
  return `
SEO INSTRUCTIONS:
- Primary keyword: "${keyword}"
  - Use this exact phrase in: the H1 title, the first paragraph, and the meta description
  - Use it naturally 1-2 additional times in the body
  - DO NOT repeat it more than once in any 200-word span
- Semantic variants to use throughout: ${semanticVariants.join(', ')}
- Write for the reader who searched this query — focus on what they want to LEARN or DO
- Headers must read naturally when spoken aloud — avoid keyword-padded headers
- Meta description: describe what the article actually delivers; 150-160 characters; no "...plugin today!" padding
  `.trim()
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vercel AI SDK v4 `streamText` | AI SDK v6 — same API, added agents + `ToolLoopAgent` | Late 2025 | Non-breaking for this use case; v6 migration tool available |
| API Routes for streaming | Route Handlers (still valid) OR Server Actions | Next.js App Router | Either works; Route Handlers are simpler for streaming; Server Actions for mutations |
| NextAuth.js | Better Auth (modern alternative) | 2024-2025 | Cleaner TypeScript types; simpler setup for single-user tools |
| `prisma` as default ORM | `drizzle-orm` cited in Next.js official docs | 2024 | Drizzle is now the recommended option in official Next.js auth guide |
| Universal Analytics CSV | GA4 CSV (different header structure) | 2023 (GA4 only since July 2023) | GA4 CSVs have metadata header rows — requires special parsing logic |

**Deprecated/outdated:**
- Universal Analytics (UA) — Google shut down UA in July 2024. All PERF-01 CSV uploads will be GA4 format only.
- `moment.js` — deprecated and heavy; use `date-fns` v3 instead
- `next/legacy/image` — use `next/image` with App Router
- Vercel AI SDK v3/v4 patterns (e.g., `useCompletion`, old `experimental_StreamingTextResponse`) — v6 uses `toUIMessageStreamResponse()`

---

## Open Questions

1. **Exact GA4 CSV column names for this user's reports**
   - What we know: GA4 standard page report includes `Page title`, `Sessions`, `Bounce rate`; but column names vary by report configuration and locale
   - What's unclear: The user's specific GA4 report export may use custom column names or a different report template
   - Recommendation: In Wave 0, add a CSV preview step — show the parsed first 3 rows to the user and let them map columns manually if auto-detection fails. This is a better UX than a hard failure.

2. **Format type classification — LLM call at upload vs. rule-based**
   - What we know: GA4 CSV has no "format type" column; it must be inferred from article titles
   - What's unclear: Whether rule-based title matching (contains "how to", contains numbers + list words) is sufficient, or whether an LLM classification call per row is needed
   - Recommendation: Start with rule-based classification (fast, no API cost); add LLM classification fallback for unmatched rows. A title containing "how to" = how-to; a title with a leading number + plural = list; titles with "vs" or "comparison" = comparison; else = other.

3. **Streaming UX for multi-step pipeline**
   - What we know: The decision is word-by-word streaming; outline generates first; then sections stream sequentially
   - What's unclear: Whether to show each section streaming one at a time (simpler) or whether all section placeholders appear at once and each fills in as it completes (requires parallel requests + more complex state)
   - Recommendation: Sequential is simpler to implement and matches the "feel like a document being written" UX. Show the full outline (headings) immediately after outline generation, then stream body content into each section top-to-bottom. Implement parallel only if sequential feels too slow after testing.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (preferred) or Jest — greenfield, no existing config |
| Config file | `vitest.config.ts` — Wave 0 gap |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BRAND-01 | `compileBrandContextBlock()` includes all profile fields in output | unit | `npx vitest run tests/brand/prompts.test.ts` | ❌ Wave 0 |
| BRAND-02 | Example article text is included in compiled context block | unit | `npx vitest run tests/brand/prompts.test.ts` | ❌ Wave 0 |
| BRAND-03 | Plugin facts appear in compiled block with "do not invent" instruction | unit | `npx vitest run tests/brand/prompts.test.ts` | ❌ Wave 0 |
| PERF-01 | `parseGA4CSV()` correctly maps standard GA4 column names | unit | `npx vitest run tests/csv/parse.test.ts` | ❌ Wave 0 |
| PERF-01 | `parseGA4CSV()` handles GA4 metadata header rows correctly | unit | `npx vitest run tests/csv/parse.test.ts` | ❌ Wave 0 |
| PERF-02 | Format type classification returns correct type for known title patterns | unit | `npx vitest run tests/csv/classify.test.ts` | ❌ Wave 0 |
| PERF-03 | Format selection injects correctly into generation prompt | unit | `npx vitest run tests/ai/generation.test.ts` | ❌ Wave 0 |
| ARTICLE-01 | `generateArticleOutline()` returns valid ArticleOutlineSchema object | integration | manual — requires live LLM call | manual-only |
| ARTICLE-02 | Brand context block is present in every generation call system prompt | unit | `npx vitest run tests/ai/generation.test.ts` | ❌ Wave 0 |
| ARTICLE-03 | SEO instruction block uses semantic coverage pattern, not keyword density | unit | `npx vitest run tests/ai/prompts.test.ts` | ❌ Wave 0 |

**Manual-only justifications:**
- ARTICLE-01: Requires live LLM API call; cannot be automated without API key in CI. Test manually: generate an outline for a test topic and verify all schema fields are populated.

### Sampling Rate
- **Per task commit:** `npx vitest run tests/brand/ tests/csv/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` — test framework config (`npm install -D vitest @vitejs/plugin-react`)
- [ ] `tests/brand/prompts.test.ts` — covers BRAND-01, BRAND-02, BRAND-03 (unit tests for `compileBrandContextBlock`)
- [ ] `tests/csv/parse.test.ts` — covers PERF-01 (unit tests for `parseGA4CSV` with fixture CSV)
- [ ] `tests/csv/classify.test.ts` — covers PERF-02 (unit tests for format type classification)
- [ ] `tests/ai/generation.test.ts` — covers PERF-03, ARTICLE-02 (mocked LLM, verifies prompt assembly)
- [ ] `tests/csv/fixtures/ga4-sample.csv` — GA4 format sample CSV for parse tests
- [ ] `tests/ai/prompts.test.ts` — covers ARTICLE-03 (SEO instruction block content verification)

---

## Sources

### Primary (HIGH confidence)
- Next.js official authentication documentation (verified Feb 2026) — Drizzle ORM as example, Better Auth listing, jose recommendation: https://nextjs.org/docs/app/guides/authentication
- Vercel AI SDK npm package — version 6.0.116 confirmed current as of March 2026: https://www.npmjs.com/package/ai
- AI SDK v6 release post — architecture changes, agent abstractions, backwards-compatible migration: https://vercel.com/blog/ai-sdk-6
- AI SDK official documentation — `streamText`, `generateText`, `generateObject` API: https://ai-sdk.dev/docs/ai-sdk-core/generating-text
- AI SDK Next.js App Router getting started — Route Handler streaming pattern: https://ai-sdk.dev/docs/getting-started/nextjs-app-router
- Google Analytics support — GA4 CSV export documentation: https://support.google.com/analytics/answer/9317657

### Secondary (MEDIUM confidence)
- LogRocket: Streaming with Vercel AI SDK in Next.js — `streamText` + Server Actions shift confirmed: https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/
- shadcn/ui multi-step form discussion + tutorials — react-hook-form + Zod wizard pattern confirmed as current standard: https://github.com/shadcn-ui/ui/discussions/1869
- PapaParse documentation — browser-side CSV parsing with header row support: https://www.papaparse.com/docs
- Drizzle ORM official documentation — schema definition, FK patterns, Neon integration: https://orm.drizzle.team/docs/overview
- GA4 CSV export community thread — metadata header rows at top confirmed: https://support.google.com/analytics/thread/257808259/ga4-report-export-csv-format-different

### Tertiary (LOW confidence)
- Training data: exact GA4 CSV column names for this user's specific report configuration (validate at implementation with a real export)
- Training data: specific streaming UX behavior differences between sequential vs. parallel section generation

### Prior Project Research (HIGH confidence for decisions made)
- `.planning/research/STACK.md` — full stack analysis with alternatives
- `.planning/research/ARCHITECTURE.md` — component boundaries, brand voice injection pattern, data flows
- `.planning/research/PITFALLS.md` — full pitfall catalog with phase-specific warnings
- `.planning/research/SUMMARY.md` — executive summary, phase ordering rationale

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Next.js, Drizzle, Better Auth verified via official docs; AI SDK v6 current version confirmed via npm; PapaParse is the unambiguous standard for JS CSV parsing
- Architecture: HIGH — component boundaries derived directly from requirements; compiled brand context block pattern from prior research; multi-step pipeline is the established solution to LLM context degradation
- Pitfalls: HIGH — GA4 metadata row issue confirmed via community thread; Vercel timeout pitfall documented in official deployment guidance; brand voice adjective trap is extensively documented in LLM engineering literature
- GA4 CSV column names: MEDIUM — standard columns documented; user's specific report configuration may vary

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (AI SDK moves fast; re-verify streaming API if planning extends beyond April)
