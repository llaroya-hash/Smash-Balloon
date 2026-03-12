---
phase: 01-foundation
plan: "04"
subsystem: ai-pipeline
tags: [next.js, ai-sdk, openai, zod, drizzle-orm, server-actions, vitest, typescript, streaming]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: Drizzle schema (articleDrafts table), shared types (ArticleOutline, ArticleSection), vitest infrastructure
  - phase: 01-foundation/01-02
    provides: compileBrandContextBlock, buildSEOInstructions implementations
provides:
  - generateArticleOutline: uses generateObject with Zod schema to produce structured ArticleOutline via gpt-4o
  - buildSectionPrompt: assembles full-outline context prompt for writing a single section
  - buildIntroductionPrompt: assembles prompt using written body sections as context
  - buildConclusionPrompt: assembles prompt using written body sections + CTA plugin text
  - ArticleOutlineSchema: Zod schema for structured outline generation
  - POST /api/generate/outline: generates ArticleOutline JSON from topic + brand context
  - POST /api/generate/section: streams one section at a time (body/introduction/conclusion)
  - initArticleGeneration Server Action: creates articleDraft with status 'generating'
  - updateArticleDraft Server Action: updates draft fields including status
  - getArticleDraft Server Action: retrieves single draft by ID
  - listArticleDrafts Server Action: lists all drafts for a brand (ordered by generatedAt desc)
affects: [01-05-PLAN, 01-06-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - generateObject with Zod schema for structured outline (not free-form JSON parsing)
    - streamText with toUIMessageStreamResponse() for AI SDK v6 streaming pattern
    - Introduction and conclusion generated LAST (after body sections) — body sections passed as context so intro/conclusion accurately reflect what was written
    - maxDuration = 60 on both generation routes — required to prevent Vercel 10s default timeout during streaming
    - Format instruction injected as a single line into prompt when selectedFormat is non-null; omitted entirely when null
    - Brand context block passed as system prompt to every generation call

key-files:
  created:
    - src/lib/ai/generation.ts
    - src/app/api/generate/outline/route.ts
    - src/app/api/generate/section/route.ts
    - src/actions/article.ts
  modified:
    - tests/ai/generation.test.ts
    - tests/ai/prompts.test.ts

key-decisions:
  - "Introduction and conclusion generated last — body sections passed as context to buildIntroductionPrompt/buildConclusionPrompt so they reflect what was actually written, not just the outline plan"
  - "generateObject + Zod schema instead of freeform JSON parsing — structured output validation prevents malformed outline shapes reaching downstream section generation"
  - "maxDuration = 60 on both routes — Vercel default 10s timeout silently kills generation mid-stream with no error surfaced to the user"

patterns-established:
  - "Pattern 6: Multi-step generation order — body sections first (index 0 to N-1), then introduction, then conclusion; client must track sectionsComplete count and call updateArticleDraft({status: 'draft_ready'}) only after all sections finish"
  - "Pattern 7: Article draft lifecycle — create with status 'generating' via initArticleGeneration, update fields incrementally via updateArticleDraft, finalize with status 'draft_ready' after last section streams"

requirements-completed: [ARTICLE-01, ARTICLE-02, ARTICLE-03]

# Metrics
duration: 2min
completed: 2026-03-12
---

# Phase 1 Plan 04: Article Generation Pipeline Summary

**Multi-step article generation pipeline using generateObject for structured outline (ArticleOutlineSchema/Zod) and streamText with toUIMessageStreamResponse for per-section streaming, with introduction/conclusion generated last using written body sections as context**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-12T09:31:28Z
- **Completed:** 2026-03-12T09:33:40Z
- **Tasks:** 2 (Task 1 had 2 commits: RED test → GREEN impl; Task 2 had 1 commit)
- **Files modified:** 6

## Accomplishments

- generateArticleOutline fully implemented using generateObject with ArticleOutlineSchema (Zod) and gpt-4o model — brand context block as system prompt, format instruction injected when selectedFormat is non-null
- buildSectionPrompt/buildIntroductionPrompt/buildConclusionPrompt implemented — intro/conclusion receive written body sections as context so they accurately reflect what was written
- Both API routes with maxDuration = 60 and correct AI SDK v6 streaming pattern (toUIMessageStreamResponse)
- initArticleGeneration/updateArticleDraft/getArticleDraft/listArticleDrafts Server Actions implementing full draft lifecycle
- 11 unit tests pass green covering all plan behavior specs

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Add failing tests for generation functions and SEO instructions** - `1ed20b3` (test)
2. **Task 1 GREEN: Implement generateArticleOutline, buildSectionPrompt, buildIntroductionPrompt, buildConclusionPrompt** - `88babd1` (feat)
3. **Task 2: Build generation API routes and article draft Server Actions** - `401bc94` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/lib/ai/generation.ts` — Full implementation: ArticleOutlineSchema, generateArticleOutline, buildSectionPrompt, buildIntroductionPrompt, buildConclusionPrompt, streamSection
- `src/app/api/generate/outline/route.ts` — POST route generating ArticleOutline via generateArticleOutline; maxDuration = 60
- `src/app/api/generate/section/route.ts` — POST route streaming sections via streamText; dispatches by sectionType; toUIMessageStreamResponse; maxDuration = 60
- `src/actions/article.ts` — initArticleGeneration, updateArticleDraft, getArticleDraft, listArticleDrafts Server Actions
- `tests/ai/generation.test.ts` — 8 real assertions (replaced it.todo stubs): brand context in system prompt, format injection, outline context in buildSectionPrompt, body sections in intro/conclusion prompts
- `tests/ai/prompts.test.ts` — 2 real assertions (replaced it.todo stubs): semantic coverage language, keyword presence

## Decisions Made

- Introduction and conclusion prompts receive written body sections as context (not just the outline) — this ensures intro/conclusion accurately reflect what was written rather than what was planned.
- Used generateObject with Zod schema (ArticleOutlineSchema) instead of asking for JSON in a prompt — structured output validation prevents malformed outline shapes from reaching downstream section generation calls.
- Both generation routes require maxDuration = 60 — Vercel's default 10-second function timeout silently kills generation mid-stream with no error surfaced to the user.

## Deviations from Plan

None - plan executed exactly as written. All behavior specs implemented and tested. TypeScript compiles clean.

## Issues Encountered

None.

## User Setup Required

None — no new external service configuration required beyond 01-01 setup (OPENAI_API_KEY already documented in .env.local.example).

## Next Phase Readiness

- generateArticleOutline + streaming routes ready for use by the article generation UI (01-05)
- initArticleGeneration/updateArticleDraft Server Actions ready for client-side orchestration
- Client must follow generation order: body sections first, then introduction, then conclusion (call updateArticleDraft({status: 'draft_ready'}) only after all sections complete)

## Self-Check: PASSED

All claimed files verified present on disk. All task commits verified in git log.

---
*Phase: 01-foundation*
*Completed: 2026-03-12*
