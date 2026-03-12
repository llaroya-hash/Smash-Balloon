# Project Research Summary

**Project:** Content Marketing AI Tool (Smash Balloon)
**Domain:** AI-powered content pipeline — blog generation, competitor research, editorial calendar, email suite
**Researched:** 2026-03-12
**Confidence:** MEDIUM overall (Next.js/Drizzle stack HIGH; feature landscape and AI patterns MEDIUM — web search unavailable during research)

## Executive Summary

This is a bespoke AI content pipeline tool for a single internal user at a WordPress plugin company. The product fills a real gap in the market: no existing tool combines brand voice persistence, competitor auto-discovery, content gap analysis, an editorial calendar, and article draft generation in a single workflow. The closest analog (ContentShake by Semrush) does not tie competitor research to calendar to draft in one opinionated flow, and none of the surveyed tools embed plugin-specific domain knowledge into prompts. The recommended approach is a Next.js 16 App Router full-stack application using the Vercel AI SDK for streaming generation, Drizzle + Neon Postgres for persistence, and Firecrawl for competitor content discovery — a modern, well-documented stack with strong ecosystem alignment.

The central architectural insight is that a compiled brand voice block, assembled once at profile-save time and injected as a system prompt prefix on every generation call, is the single highest-leverage design decision in the system. Everything downstream — topic ideation, article drafts, email copy — either works or fails based on how precisely this voice block captures Smash Balloon's actual writing style. Vague adjectives ("conversational, professional") produce generic AI prose; structural rules plus exemplar excerpts produce on-brand output. This must be solved in Phase 1 before any content generation feature ships.

The top risk is building too much infrastructure before validating that generated article quality is acceptable. Competitor auto-discovery, content gap analysis, and calendar automation are all differentiating features — but they are worth nothing if the core article draft requires a two-hour rewrite. The roadmap should sequence "proof of article quality" before "automation of upstream research," and must build LLM cost logging before the first generation call reaches production, as per-article costs appear small but aggregate costs can surprise.

## Key Findings

### Recommended Stack

The stack is anchored on Next.js 16 App Router, which provides Server Components for direct database access, Server Actions for LLM mutation calls, and built-in streaming support — all critical for a tool that generates 1,500–2,500 word articles over 15–30 second LLM calls. Drizzle ORM with Neon serverless Postgres is the data layer (Drizzle is cited by name in Next.js's own auth documentation; Neon's connection pooling is optimized for the serverless environment). The Vercel AI SDK handles all LLM orchestration — `streamText` for article generation, `generateObject` with Zod schemas for structured outputs like topic lists. Better Auth replaces Clerk/NextAuth for single-user auth with no per-MAU cost. Firecrawl replaces direct Playwright scraping to avoid serverless memory constraints.

**Core technologies:**
- Next.js 16 + React 19: full-stack framework with App Router — single codebase, streaming-native, serverless-optimized
- Vercel AI SDK 4.x: LLM orchestration — provider-agnostic, handles streaming to client via Server Actions
- gpt-4o (primary) / Claude 3.7 Sonnet (fallback): article generation — GPT-4o for cost/quality balance; Claude for long-form brand-voice fidelity
- Drizzle ORM + Neon Postgres: type-safe data layer — verified in Next.js official docs, serverless-optimized
- Firecrawl: competitor content scraping — offloads anti-bot challenge handling; Jina Reader is a free MVP fallback
- Better Auth + jose: session management — lightweight, no per-MAU pricing, native Next.js TypeScript ergonomics
- Tailwind CSS v4 + shadcn/ui: UI — fastest path to a usable internal tool without a design system

See `.planning/research/STACK.md` for full alternatives analysis and install commands.

### Expected Features

No existing tool natively combines the full pipeline this project targets. The market gap is real and specific: brand voice + competitor auto-discovery + editorial calendar + article draft + email in one workflow for a solo marketer.

**Must have (table stakes) — v1:**
- Brand voice / tone profile with structural rules and exemplar excerpts — without this, all output is generic
- AI article draft generation (full article, not outline-only) — the core value proposition
- SEO metadata output: H1, meta description, H2/H3 structure, keyword placement
- Topic idea generation informed by competitor research and content gaps
- Publishing calendar tied to topic list — visual monthly view with status tracking
- Re-generate / retry controls and copy-to-clipboard export

**Should have (differentiators) — v1:**
- Competitor auto-discovery from niche + keywords (no manual URL input required)
- Competitor content benchmarking: cadence, topic clusters, gap analysis
- Plugin-use-case tie-in prompting: Smash Balloon plugin references woven into articles
- "Proven framing" article templates matching established content style

**Defer to v2:**
- Email suite: blog promo emails + standalone campaigns + subject line A/B variants
- Few-shot style examples in generation prompt (validated after baseline article quality proven)

**Defer to v3:**
- Multi-brand support (WPChat) — schema must anticipate this in v1 but implementation waits

**Anti-features (do not build):**
- WordPress REST API direct publishing
- Social media post generation
- Team collaboration / multi-user
- Email send / scheduling (content generation only, not ESP)
- Generic SEO scoring (numerical content score)

See `.planning/research/FEATURES.md` for full feature dependency map.

### Architecture Approach

A pipeline architecture with a central Brand Context layer consumed by all generation components. The Generation Engine is a pure orchestrator — it loads brand context, topic data, and competitor context at call time, assembles the prompt, streams from the LLM, and persists the result. It owns no domain data itself. The Competitor Scraping Pipeline runs as a background job (not in the web request cycle) because full discovery + scraping takes minutes; the UI polls for completion. All content types (articles, emails) have separate DB tables from the start — a polymorphic "content" table becomes unmanageable as email and article schemas diverge.

**Major components:**
1. Brand Profile Store — captures voice definition, compiles it into a reusable system prompt block at save time; owns the plugin facts sheet
2. Competitor Scraping Pipeline — discovers competitor domains, crawls sitemaps and post metadata, computes gap analysis; runs as background job
3. Topic & Calendar Store — manages topic lifecycle from idea through scheduled through draft_ready; provides topic data for prompt assembly
4. Generation Engine — orchestrates prompt assembly + LLM calls + output persistence; separate workflows for articles (v1) and emails (v2)
5. Persistence Layer — Postgres for all structured data; Postgres TEXT columns adequate for article bodies at v1 scale (~10 articles/month)

See `.planning/research/ARCHITECTURE.md` for full data flow diagrams, schema fields, and anti-patterns.

### Critical Pitfalls

1. **Brand voice defined with adjectives only** — "conversational, professional" is the same description used by 90% of brands and barely shifts LLM output. Prevention: require 3-5 exemplar excerpts from actual smashballoon.com/blog/ content, define voice as structural rules ("always open with reader's problem, use numbered steps for any how-to sequence"), and include a plugin facts sheet to prevent hallucinated feature claims. This must be solved before any content generation is built.

2. **Single-call long-form generation degrades past ~800 words** — LLMs lose structural consistency as context fills; second half of articles repeats points, loses numbered list formatting, and contradicts earlier commitments. Prevention: multi-step pipeline — (1) generate detailed outline with section briefs, (2) user approves outline, (3) generate each section independently against the outline, (4) assemble introduction and conclusion last with full body as context.

3. **Competitor auto-discovery returns wrong competitors** — Keyword-based search surfaces HubSpot/Buffer-scale generic sites, not niche WordPress plugin competitors. Prevention: seed discovery with 3-5 manually provided competitor URLs; run LLM classification to filter by domain relevance (does this site blog about WordPress plugins?); show user the discovered list before running full pipeline.

4. **Web scraping fails silently** — Cloudflare anti-bot, JavaScript rendering, and rate limiting return 200 OK responses with challenge-page HTML. The dashboard shows stale data the user trusts. Prevention: use XML sitemaps and Search API results for post metadata extraction instead of page body scraping; validate output (>30% null dates = failed scrape, surface error not empty results); use Firecrawl for any direct page scraping.

5. **LLM API costs grow nonlinearly and silently** — Each feature priced in isolation; total monthly workflow (8 articles + topic generation runs + competitor refresh + emails) can reach $50-200/month. Prevention: log every LLM call from day 1 with model, tokens, and feature tag; use GPT-4o-mini for classification and scoring tasks, GPT-4o only for article section generation; cache LLM outputs with 7-day minimum TTL.

Additional pitfalls: plugin hallucination in feature claims (facts sheet required); over-engineering calendar before validating simple list; email generation inheriting blog prompt patterns; treating brand voice as one-time setup rather than an editable versioned system. See `.planning/research/PITFALLS.md` for full phase-specific warning matrix.

## Implications for Roadmap

Based on the dependency map from FEATURES.md, build order from ARCHITECTURE.md, and phase warnings from PITFALLS.md, the following phase structure is recommended.

### Phase 1: Foundation — Brand Voice + Article Quality Proof

**Rationale:** The most dangerous mistake is building automation infrastructure around a generation pipeline that produces unusable drafts. Phase 1 validates the core value proposition: does a brand voice profile + topic input produce a draft that requires only light editing? Everything else depends on this being true. Brand voice profile is also a hard dependency for all downstream generation.

**Delivers:** Working article draft pipeline — brand profile form (with exemplar excerpts + facts sheet), manual topic input, multi-step article generation (outline → sections → assembly), streaming to UI, copy-to-clipboard export, SEO metadata output. Token cost logging infrastructure.

**Addresses features:** Brand voice profile, article draft generation, SEO metadata output, re-generate controls, copy-to-clipboard export.

**Must avoid:** Pitfall 1 (adjective-only voice), Pitfall 2 (single-call generation), Pitfall 5 (keyword stuffing), Pitfall 6 (no cost logging), Pitfall 10 (hallucinated plugin claims).

**Research flag:** Needs `/gsd:research-phase` — multi-step generation pipeline details, few-shot prompting implementation, streaming with Server Actions.

### Phase 2: Competitor Research + Topic Ideation

**Rationale:** Competitor research feeds topic ideation; topic ideation feeds the calendar. Both are differentiating features. Must follow Phase 1 because the topic+draft pipeline needs to be proven before adding the upstream research layer. Building auto-discovery before validating article quality (Pitfall 9) is the sequencing mistake to avoid.

**Delivers:** Competitor discovery (seeded by user-provided URLs, then auto-expanded), sitemap/metadata extraction as background job, content gap analysis, LLM-assisted topic idea generation with competitor references, topic management list.

**Addresses features:** Competitor auto-discovery, competitor benchmarking, content gap identification, topic idea generation.

**Must avoid:** Pitfall 3 (wrong competitors), Pitfall 4 (silent scraping failures), Pitfall 8 (no search demand signal).

**Research flag:** Needs `/gsd:research-phase` — Firecrawl API specifics, sitemap parsing patterns, background job implementation in Next.js (unstable_after vs. Route Handler), keyword volume signal options.

### Phase 3: Publishing Calendar

**Rationale:** Calendar is a UX wrapper around the topic list. Its value depends on having a topic list (Phase 2). It is medium complexity, high UX value, and unblocks the "full pipeline" user story where a content plan for the month flows through to drafts.

**Delivers:** Monthly calendar view with topic scheduling, drag-and-drop (or click-to-assign) placement, status tracking (idea → scheduled → in_progress → draft_ready), article generation triggered from calendar entry, nuqs-driven URL state for month navigation.

**Addresses features:** Monthly publishing calendar, status tracking, integrated draft generation.

**Must avoid:** Pitfall 11 (over-engineered calendar CRUD before simple list validated).

**Research flag:** Standard patterns — shadcn/ui Calendar component, date-fns, nuqs. No research phase needed.

### Phase 4: Email Suite

**Rationale:** Email generation extends the article pipeline with a different prompt template and content type. Deferred to v2 per FEATURES.md because it does not affect article quality validation, and email prompts must be engineered from scratch (not inherited from article prompts). Implement only after Phase 1-3 flow is proven stable.

**Delivers:** Blog promo email generation from published article, standalone email campaign generation, 3x subject line A/B variants, email draft persistence and copy-export.

**Addresses features:** Blog promo email, standalone email campaign, subject line variants.

**Must avoid:** Pitfall 12 (email inheriting blog prompt structure).

**Research flag:** Standard patterns for email prompt engineering. No deep research needed — well-understood LLM task if prompts are designed correctly.

### Phase 5: Multi-Brand Support (WPChat)

**Rationale:** Deferred to v3 per FEATURES.md. Implementation depends on v1 schema anticipating multiple brands from the start (brand_id FK on all tables). Only build the UI and profile management after Phase 1-4 are validated.

**Delivers:** WPChat brand profile (separate voice, facts sheet, exemplars), brand switcher in UI, all generation features working per brand independently.

**Addresses features:** Multi-brand profile support.

**Must avoid:** Treating WPChat as a clone of Smash Balloon voice (requires entirely separate exemplars and facts sheet).

**Research flag:** Standard patterns once schema is correct. No research phase needed.

### Phase Ordering Rationale

- **Article quality before automation:** Pitfall 9 (over-engineering before validating core value) is the highest-likelihood sequencing mistake. Phases 1 before 2-3 enforces this.
- **Competitor research before topic ideation:** FEATURES.md dependency map — topic ideas draw from gap analysis; gap analysis requires competitor data.
- **Calendar after topics:** Calendar entries are scheduled topics; the topic store must exist first.
- **Brand voice before everything:** All generation calls consume the brand context block; it is a hard dependency for every phase.
- **Schema anticipates multi-brand from Phase 1:** brand_id FK on all tables, even in Phase 1, so Phase 5 is additive not a rewrite.

### Research Flags

Phases needing deeper research during planning:
- **Phase 1:** Multi-step streaming generation with Server Actions — verify current Vercel AI SDK patterns for outline-then-sections pipeline; streaming interruption handling.
- **Phase 2:** Firecrawl API current capabilities and pricing (MEDIUM confidence — verify before committing); background job patterns in Next.js App Router; keyword volume signal API options (Ahrefs, Semrush, Google Search Console).

Phases with standard patterns (skip research-phase):
- **Phase 3:** Calendar UI — well-documented with shadcn/ui + date-fns + nuqs.
- **Phase 4:** Email prompt engineering — well-understood LLM task; no novel integration needed.
- **Phase 5:** Multi-brand — additive schema/UI work, no new infrastructure.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js, Drizzle, jose verified against official Next.js documentation. Vercel AI SDK and Firecrawl at MEDIUM — training data only, verify current APIs. |
| Features | MEDIUM | Core table stakes stable and well-documented by 2024. Specific competitor product state (whether Frase added auto-discovery, etc.) unverified since Aug 2025. Anti-features are HIGH confidence — explicitly out of scope from project requirements. |
| Architecture | MEDIUM-HIGH | Component boundaries derived directly from requirements (HIGH). Brand voice injection pattern and build order are HIGH. Specific background job and scraping pipeline details at MEDIUM — training data. |
| Pitfalls | HIGH | LLM context window degradation, anti-bot scraping failures, and keyword stuffing patterns are extensively documented and stable. Cost structure patterns are HIGH as of Aug 2025 — verify current GPT-4o pricing. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Firecrawl pricing and API shape:** Verify current Firecrawl docs before Phase 2 specification. If cost is prohibitive, Jina Reader (free) or XML sitemap parsing (no external dependency) are documented fallbacks.
- **Background job pattern in Next.js App Router:** `unstable_after` vs. Route Handler with polling — confirm current recommended pattern for Phase 2 planning.
- **Keyword volume signal:** Research Phase 2 should evaluate Google Search Console API, Ahrefs API, and Semrush API for search demand validation alongside topic ideas. This is identified as Pitfall 8 but no API was selected.
- **Competitor product feature state:** FEATURES.md was written from training data through Aug 2025. Run a live competitive check before finalizing Phase 1 feature scope — a competitor may have shipped auto-discovery since cutoff.
- **GPT-4o token pricing:** Verify current pricing before finalizing cost logging thresholds and model tier decisions. The $0.10-0.30/article estimate should be re-calculated.

## Sources

### Primary (HIGH confidence)
- Next.js 16.1.6 official documentation (verified Feb 2026) — authentication patterns, data fetching, Drizzle ORM usage, session management with jose
- Next.js installation guide (verified Feb 2026) — Tailwind v4 default, TypeScript scaffold

### Secondary (MEDIUM confidence)
- Vercel AI SDK documentation — LLM orchestration, streaming, generateObject (training data, Aug 2025 cutoff; access denied during research)
- Firecrawl documentation — scraping service capabilities (training data, Aug 2025 cutoff)
- shadcn/ui — component library (training data, MEDIUM confidence)
- Competitive landscape: Jasper, Surfer SEO, MarketMuse, Frase, ContentShake (training data, Aug 2025 cutoff — validate before roadmap finalization)

### Tertiary (LOW confidence)
- Vercel Blob / Uploadthing for file storage — not needed for v1; evaluate only if draft versioning is required
- Google Gemini 2.0 Flash as model alternative — viable via `@ai-sdk/google`, evaluate if OpenAI pricing is a concern

---
*Research completed: 2026-03-12*
*Ready for roadmap: yes*
