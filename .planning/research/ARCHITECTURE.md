# Architecture Patterns

**Domain:** AI Content Marketing Tool (blog pipeline + email suite)
**Project:** Content Marketing AI Tool for Smash Balloon
**Researched:** 2026-03-12
**Confidence:** MEDIUM — based on training knowledge of LLM application patterns (cutoff Aug 2025); web search unavailable in this environment

---

## Recommended Architecture

A pipeline architecture with a central Brand Context layer that all generation components consume. Six major components with clear ownership boundaries.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web UI (Next.js)                         │
│  Brand Setup | Competitor View | Topic Ideas | Calendar | Draft  │
└──────┬──────────────┬──────────────┬──────────────┬────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────────┐
│   Brand    │ │ Competitor │ │  Topic   │ │  Generation      │
│  Profile   │ │  Scraping  │ │ & Calendar│ │  Engine (LLM)    │
│  Store     │ │  Pipeline  │ │  Store   │ │                  │
└────────────┘ └────────────┘ └──────────┘ └──────────────────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Persistence Layer │
                    │  (DB + file store) │
                    └───────────────────┘
```

### Component Overview

| Component | Responsibility | Primary Consumer |
|-----------|---------------|-----------------|
| Brand Profile Store | Stores brand voice config per brand; compiles prompt context blocks | Generation Engine |
| Competitor Scraping Pipeline | Discovers, fetches, and indexes competitor content | Topic Generator |
| Topic & Calendar Store | Holds topic ideas, gap analysis, calendar entries with status | UI + Generation Engine |
| Generation Engine | Assembles prompts, calls LLM API, streams/returns output | UI |
| Persistence Layer | Postgres (structured data) + object storage (article drafts) | All components |
| Web UI | Next.js frontend — all user interactions | — |

---

## Component Boundaries

### 1. Brand Profile Store

**Responsibility:** Captures and persists the brand voice definition. Converts the human-readable brand config into a reusable prompt context block.

**Inputs (from user):**
- Tone descriptors (conversational, professional, approachable)
- Target audience definition (small business owners, WordPress admins, non-technical marketers)
- Writing style rules (numbered steps, "proven" framing, practical how-tos)
- Keyword priorities (plugin names, use-case keywords)
- Plugin focus areas (which products to reference and when)
- Brand name + URL

**Outputs:**
- `brand_context_block: string` — a compiled, reusable system-prompt fragment injected into every generation call
- Raw brand config record (JSON) stored in DB

**Communicates with:** Generation Engine (provides context block), UI (CRUD operations)

**Does NOT:**
- Call the LLM
- Scrape competitor content
- Know about calendar or topics

**Key design decision:** Brand context is compiled once at save time into an opinionated system prompt fragment. This avoids re-assembly on every generation call and makes the voice injection deterministic. See "Brand Voice Injection" section below.

---

### 2. Competitor Scraping Pipeline

**Responsibility:** Auto-discovers relevant competitors from the brand's niche + keywords, fetches their blog content, extracts metadata, and surfaces content gaps.

**Inputs:**
- Brand niche + keyword list (from Brand Profile)
- Target domain (e.g., smashballoon.com) for gap detection

**Process (stages):**
1. **Discovery** — Use search API (e.g., SerpAPI or similar) to find top-ranking blogs for target keywords. Extract competitor domains. No manual input required.
2. **Crawl** — Fetch blog index pages + individual post metadata (title, date, URL, estimated word count). Respect robots.txt. Rate-limit requests.
3. **Extract** — Parse title, meta description, publish date, estimated topic category. Do NOT store full article text (copyright, storage cost).
4. **Analyze** — Compute: publishing cadence (posts/month), topic clusters (via keyword extraction or LLM classification), topics covered vs. not covered by target brand.
5. **Gap Report** — Topics competitors rank for that target brand has no article about.

**Outputs:**
- Competitor record (domain, niche, discovered date)
- Post metadata records (title, URL, date, topic tags)
- Gap analysis records (topic, competitor coverage count, target brand coverage: none/partial/full)

**Communicates with:** Topic Generator (provides gap analysis), UI (displays competitor benchmarks)

**Does NOT:**
- Store full article content
- Call generation LLM
- Know about calendar

**Re-run cadence:** On-demand (user-triggered). No automatic background polling in v1.

---

### 3. Topic & Calendar Store

**Responsibility:** Manages the lifecycle of content ideas from raw suggestions through calendar placement to completion.

**Topic record:**
```
topic_id        uuid
brand_id        uuid (FK)
title           string
keyword_target  string
seo_angle       string
source          enum: gap_analysis | manual | llm_generated
competitor_refs uuid[] (FK to competitor posts that inspired it)
status          enum: idea | scheduled | in_progress | draft_ready | published
created_at      timestamp
```

**Calendar entry record:**
```
entry_id        uuid
topic_id        uuid (FK)
brand_id        uuid (FK)
publish_date    date
month           string (YYYY-MM, for monthly view)
slot            int (ordering within month)
article_draft_id  uuid | null (FK to generated draft)
```

**Key behaviors:**
- Multiple topics can exist without being on the calendar
- A calendar entry is created when the user schedules a topic
- Draft generation is triggered from a calendar entry (or directly from a topic)
- Status transitions: idea → scheduled (when placed on calendar) → in_progress (when generation starts) → draft_ready (when LLM output saved)

**Communicates with:** UI (calendar views, topic list), Generation Engine (provides topic + SEO data for prompt assembly)

---

### 4. Generation Engine

**Responsibility:** Assembles prompts from components, calls the LLM, and persists outputs. This is the orchestration layer — it does not own brand data, topics, or competitor data, it retrieves them.

**Article generation workflow:**

```
User triggers "Generate Article" for calendar entry
         │
         ▼
1. Load brand_context_block from Brand Profile Store
2. Load topic record (title, keyword, SEO angle, competitor refs)
3. Load any relevant gap analysis context for this topic
4. (Optional) Load style examples — saved exemplar passages from
   brand's existing articles for few-shot style grounding
5. Assemble full prompt (see Brand Voice Injection section)
6. Call LLM API (streaming)
7. Receive article draft
8. Save to article_drafts table + object storage (markdown)
9. Update topic status → draft_ready
10. Return draft to UI
```

**Email generation workflow (v2):**

```
User triggers "Generate Promo Email" for a published post
         │
         ▼
1. Load brand_context_block (email variant — shorter, punchier rules)
2. Load article title + URL + meta description
3. Load email template constraints (word count target, CTA style)
4. Assemble email prompt
5. Call LLM API
6. Generate: body copy, 3x subject line variants (A/B/C)
7. Save email draft record
8. Return to UI
```

**Communicates with:** Brand Profile Store, Topic & Calendar Store, LLM API (external), Persistence Layer

**Does NOT:**
- Manage brand config
- Run competitor scraping
- Handle HTTP routing

---

### 5. Persistence Layer

**Structured data (Postgres):**
- `brands` — brand profiles, compiled context blocks
- `competitors` — discovered competitor domains
- `competitor_posts` — scraped post metadata
- `gap_analysis` — topic gaps vs. target brand
- `topics` — content ideas
- `calendar_entries` — scheduled topics
- `article_drafts` — draft metadata (body stored in object storage)
- `email_drafts` — email draft metadata + subject variants

**File/object storage:**
- Article draft bodies (markdown) — stored as flat files or in S3-compatible store
- Reason: Article drafts can be 1,500-3,000+ words. Storing in Postgres TEXT columns is fine at this scale, but object storage is cleaner for retrieval and future export features.

**At v1 scale (solo user, ~10 articles/month):** Postgres TEXT columns are perfectly adequate. Introduce object storage only if exporting, versioning drafts, or performance becomes a concern.

---

## Data Flow

### Flow 1: Brand Setup

```
User fills brand voice form
    → POST /api/brands
    → Brand Profile Store compiles context block
    → Saved to brands table
    → brand_context_block available for all future generation calls
```

### Flow 2: Competitor Discovery

```
User triggers "Find Competitors" (uses brand niche + keywords)
    → Competitor Scraping Pipeline: Discovery stage (search API)
    → Scraping Pipeline: Crawl + Extract stages
    → Competitor records + post metadata saved to DB
    → Gap analysis computed + saved
    → UI displays competitor benchmark table
```

### Flow 3: Topic Ideation

```
User requests topic ideas
    → Generation Engine loads: brand_context_block + gap_analysis records
    → LLM generates list of topic titles + keyword targets + SEO angles
    → Topics saved to topics table with source=llm_generated + competitor_refs
    → UI displays idea list; user selects/rejects
```

### Flow 4: Calendar Placement

```
User drags topic to calendar month
    → Calendar entry created (topic_id, brand_id, publish_date)
    → Topic status → scheduled
    → UI renders monthly calendar view
```

### Flow 5: Article Generation

```
User clicks "Generate Draft" on calendar entry
    → Generation Engine assembles prompt (brand context + topic + SEO data)
    → LLM API call (streaming response to UI)
    → Draft saved: article_drafts table + markdown body persisted
    → Topic status → draft_ready
    → UI renders article in editor (copy-paste ready)
```

### Flow 6: Email Generation (v2)

```
User clicks "Generate Promo Email" for a topic/article
    → Generation Engine loads brand_context_block (email variant)
    → Loads article title + URL + meta description
    → LLM generates email body + 3 subject line variants
    → Email draft saved
    → UI renders email with subject variant tabs
```

---

## Brand Voice Injection

This is the most architecturally critical decision in the system. Poor brand voice injection produces generic AI content; good injection produces content that reads as authentically Smash Balloon.

### Pattern: Compiled System Prompt Block

Brand voice is compiled at save time into a structured system prompt fragment. This fragment is prepended to every generation call as part of the system message.

**Structure of `brand_context_block`:**

```
BRAND VOICE: Smash Balloon

AUDIENCE: Small business owners, WordPress site admins, and non-technical
marketers who want to grow their online presence. They are results-focused,
skeptical of fluff, and appreciate clear practical steps they can follow today.

TONE: Conversational but professional. Warm without being casual. Never
corporate jargon. Write like a knowledgeable friend explaining something,
not a consultant billing by the hour.

STYLE RULES:
- Open with a concrete promise (e.g., "In this guide you'll learn exactly how to...")
- Use numbered steps for any process with 3+ steps
- Headlines use "proven" framing where genuine (e.g., "8 Proven Ways to...")
- Every article ties back to a practical WordPress plugin use case
- End sections with a clear takeaway or next action
- Avoid: passive voice, filler phrases ("in today's digital landscape"),
  unsupported superlatives, generic CTAs

KEYWORD FOCUS: [injected from brand config at runtime]
PLUGIN CONTEXT: [injected based on article topic]
```

**Why compile at save time:**
- Deterministic — same voice rules applied every call
- Fast — no re-assembly logic in the hot path
- Testable — can inspect the compiled block independently
- Auditable — user can see exactly what instructions the LLM receives

### Pattern: Topic-Scoped Context Injection

Beyond the static brand block, each generation call injects topic-specific context:

```
ARTICLE BRIEF:
Target keyword: [keyword]
SEO angle: [angle from topic record]
Target word count: 1,500-2,000 words
Competitor coverage: [list of competitor titles covering this topic — for differentiation context]
Content gap opportunity: [what angle competitors miss]

OUTPUT FORMAT:
- H1: [keyword-focused, "proven" framing if applicable]
- Meta description: 150-160 chars, includes target keyword
- H2/H3 structure with scannable headers
- Body: numbered steps where applicable
- Closing CTA: ties back to [relevant plugin name]
```

### Pattern: Few-Shot Style Examples (optional enhancement)

Store 2-3 exemplar passages from existing Smash Balloon articles. Inject these into the prompt as "write in this style" examples. This is the highest-confidence method for voice matching but adds token cost. Flag as Phase 2 enhancement after baseline generation is validated.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Brand Voice in Every Request Body
**What:** Passing brand voice parameters as structured JSON fields on each API request, reassembled per-call.
**Why bad:** Inconsistency risk (caller can omit fields), hard to audit what voice rules were used, higher latency from assembly logic in request path.
**Instead:** Compile brand voice to a text block once at save time. Store it. Inject the stored block.

### Anti-Pattern 2: Storing Full Competitor Article Text
**What:** Scraping and storing complete article bodies from competitor sites.
**Why bad:** Copyright exposure, significant storage costs, robots.txt violations at scale. Not needed for gap analysis — metadata is sufficient.
**Instead:** Store title, URL, publish date, topic tags, estimated length. Derive gaps from metadata.

### Anti-Pattern 3: Blocking UI on LLM Generation
**What:** Synchronous HTTP request that waits for full article generation before returning (1,500+ word articles can take 15-30 seconds).
**Why bad:** Request timeouts, poor UX, no progress indication.
**Instead:** Use streaming (Server-Sent Events or WebSockets) to stream tokens to the UI as they arrive. Show generation in real-time.

### Anti-Pattern 4: Single "Content" Table for All Generated Output
**What:** One polymorphic table storing articles, emails, subject lines with a `type` discriminator.
**Why bad:** Schema becomes messy fast; email drafts and article drafts have fundamentally different shapes (email has subject variants, articles have SEO fields).
**Instead:** Separate `article_drafts` and `email_drafts` tables from the start.

### Anti-Pattern 5: Embedding Competitor Scraping in the Web Request Cycle
**What:** Running full competitor discovery + scraping synchronously when user clicks "Find Competitors."
**Why bad:** Scraping dozens of URLs takes minutes; web requests timeout in seconds.
**Instead:** Trigger a background job. Return a job ID immediately. Poll for completion. Show progress in UI.

---

## Suggested Build Order

Dependencies drive this order. Each layer must exist before the next can be built.

```
1. Persistence Layer (DB schema + migrations)
        ↓
2. Brand Profile Store (needed by all generation)
        ↓
3. Generation Engine — Article (minimal: brand context + topic → draft)
        ↓
4. Topic & Calendar Store (depends on: brand, generation)
        ↓
5. Competitor Scraping Pipeline (can be built in parallel with 3-4,
   but gap analysis feeds topic ideation — so complete before topic
   ideation feature ships)
        ↓
6. Topic Ideation (LLM-assisted, uses gap analysis + brand context)
        ↓
7. Email Generation Engine (v2 — extends generation engine, needs brand
   profile email variant)
        ↓
8. Multi-brand Support (v3 — brand store already handles multiple brands
   if designed correctly from step 2)
```

**Critical path:** Brand Profile Store → Generation Engine → Calendar. Everything else is additive.

**Parallel work possible:**
- Competitor Scraping Pipeline can be built alongside Generation Engine (different engineers, no shared code path)
- UI components can be built once API contracts are defined

---

## Scalability Considerations

| Concern | At v1 (solo user, ~10 articles/month) | At v2-v3 (2 brands, emails added) | Future (multi-tenant) |
|---------|---------------------------------------|------------------------------------|-----------------------|
| LLM API costs | Minimal; direct API calls fine | Add usage tracking per brand | Add per-user quotas |
| Competitor scraping | On-demand, synchronous job queue fine | Background worker (BullMQ or similar) | Rate limiting, caching |
| DB scale | SQLite or Postgres, no optimization needed | Postgres, standard indexing | Read replicas if needed |
| Article storage | Postgres TEXT columns adequate | Consider object storage if versioning drafts | S3 with CDN |
| Streaming | SSE to single user fine | Same | WebSocket upgrade if multi-user concurrent |

---

## Sources

**Note:** Web search was unavailable in this research session. Findings are based on:
- Training knowledge of LLM application architecture patterns (cutoff Aug 2025) — MEDIUM confidence
- Direct analysis of PROJECT.md requirements — HIGH confidence for project-specific decisions
- Standard web application architecture patterns (widely documented) — HIGH confidence

**Confidence by section:**
- Component boundaries: HIGH (derived directly from requirements)
- Brand voice injection pattern (compiled system prompt block): MEDIUM (well-established pattern in LLM apps as of Aug 2025, verify current best practices)
- Competitor scraping pipeline stages: MEDIUM (standard web crawling patterns)
- Build order: HIGH (logical dependency ordering from requirements)
- Few-shot style examples: MEDIUM (established technique, token cost estimates should be verified against current LLM pricing)
