---
phase: 01-foundation
plan: "02"
subsystem: ui
tags: [next.js, react-hook-form, drizzle-orm, server-actions, vitest, typescript, zod, brand-wizard]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: Drizzle schema (brands table), shared TypeScript types (BrandProfile, PluginFact), vitest infrastructure
provides:
  - compileBrandContextBlock: assembles audience, tone, numbered style rules, plugin facts (with do-not-invent instruction), and example article excerpts into a stored context block
  - buildSEOInstructions: semantic coverage SEO prompt helper
  - saveBrandProfile / updateBrandProfile / getBrandProfile Server Actions
  - 4-step BrandWizard React component (react-hook-form, per-step validation)
  - FactsSheetForm: structured plugin facts (name, features, pricing, use cases)
  - StepIndicator: step progress visual component
  - /brand page: shows wizard on first visit, profile summary + edit link after save
  - /brand/edit page: pre-populated wizard for updates
  - brandContextBlock compiled and stored in Postgres at save time
affects: [01-03-PLAN, 01-04-PLAN, 01-05-PLAN, 01-06-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - compileBrandContextBlock invoked in Server Action before db.insert — never assembled at generation time
    - Plugin facts stored as JSONB with structured fields; features/useCases split from newline-text in wizard on save
    - react-hook-form useFieldArray for dynamic style rules (min 2, max 5) and plugin facts (min 1, max 5)
    - Per-step validation via trigger() on Next button before advancing wizard step

key-files:
  created:
    - src/lib/ai/prompts.ts
    - src/actions/brand.ts
    - src/components/brand/BrandWizard.tsx
    - src/components/brand/StepIndicator.tsx
    - src/components/brand/FactsSheetForm.tsx
    - app/(dashboard)/brand/page.tsx
    - app/(dashboard)/brand/edit/page.tsx
    - app/(dashboard)/layout.tsx
  modified:
    - tests/brand/prompts.test.ts

key-decisions:
  - "compileBrandContextBlock places do-not-invent instruction BEFORE plugin facts list — ensures AI sees constraint before facts, not buried after"
  - "Brand pages created in app/(dashboard)/ not src/app/(dashboard)/ — Next.js app dir is at project root, not under src/"
  - "FactsSheetForm takes features/useCases as newline-separated textarea strings and splits on save — simpler UX than dynamic per-feature inputs"

patterns-established:
  - "Pattern 4: Brand context compilation — compileBrandContextBlock called in Server Action before db.insert; brandContextBlock stored in DB, not assembled at generation time"
  - "Pattern 5: Dashboard route group — app/(dashboard)/ route group with shared layout for all dashboard pages"

requirements-completed: [BRAND-01, BRAND-02, BRAND-03]

# Metrics
duration: 3min
completed: 2026-03-12
---

# Phase 1 Plan 02: Brand Voice Wizard Summary

**4-step brand wizard (Brand Basics → Tone & Style → Example Articles → Plugin Facts) with compileBrandContextBlock storing assembled context to Postgres at save time, plus 12 passing unit tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-12T08:51:22Z
- **Completed:** 2026-03-12T08:54:59Z
- **Tasks:** 2 (Task 1 had 3 commits: RED test → GREEN impl; Task 2 had 1 commit)
- **Files modified:** 9

## Accomplishments

- compileBrandContextBlock and buildSEOInstructions fully implemented with 12 passing unit tests (all it.todo stubs replaced with real assertions)
- 4-step BrandWizard with react-hook-form per-step validation, dynamic style rules list, and structured FactsSheetForm for plugin facts
- saveBrandProfile / updateBrandProfile Server Actions compile brandContextBlock at save time and persist all fields to Postgres brands table

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Add failing tests for compileBrandContextBlock and buildSEOInstructions** - `8391cdd` (test)
2. **Task 1 GREEN: Implement compileBrandContextBlock and buildSEOInstructions** - `4536bff` (feat)
3. **Task 2: Build brand voice wizard UI and Server Actions** - `e4a2c81` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/lib/ai/prompts.ts` - compileBrandContextBlock and buildSEOInstructions full implementations
- `tests/brand/prompts.test.ts` - 12 real assertions (replaced it.todo stubs) covering all plan behavior specs
- `src/actions/brand.ts` - saveBrandProfile, updateBrandProfile, getBrandProfile Server Actions
- `src/components/brand/BrandWizard.tsx` - 4-step wizard with react-hook-form, per-step validation, state management
- `src/components/brand/StepIndicator.tsx` - Step progress indicator with completed/active/pending states
- `src/components/brand/FactsSheetForm.tsx` - Structured plugin facts form (name, features, pricing, use cases)
- `app/(dashboard)/brand/page.tsx` - Brand page: wizard on first visit, profile summary + edit link after save
- `app/(dashboard)/brand/edit/page.tsx` - Edit page: pre-populated wizard calling updateBrandProfile
- `app/(dashboard)/layout.tsx` - Dashboard route group layout with minimal nav

## Decisions Made

- compileBrandContextBlock places the "ONLY reference features listed here — never invent capabilities" instruction BEFORE the plugin facts list, not at the end. This ensures the AI sees the constraint before the facts.
- Brand pages are in `app/(dashboard)/` not `src/app/(dashboard)/` — Next.js app directory is at the project root. Plan specified `src/app/` as a planning path convention but Next.js routing comes from root `app/`.
- FactsSheetForm takes features and useCases as newline-separated textarea strings and splits them on save (Server Action). Simpler UX than dynamic per-feature input fields.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created app/(dashboard)/layout.tsx for route group**
- **Found during:** Task 2 (brand page creation)
- **Issue:** app/(dashboard)/ route group requires a layout.tsx file for Next.js to render correctly
- **Fix:** Created minimal dashboard layout with nav bar
- **Files modified:** app/(dashboard)/layout.tsx
- **Verification:** TypeScript compiles cleanly
- **Committed in:** e4a2c81 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required for Next.js routing to work correctly. No scope creep.

## Issues Encountered

- Plan specified pages at `src/app/(dashboard)/brand/` but Next.js app dir is at project root `app/`. Files created at `app/(dashboard)/brand/` for proper routing while keeping components and server actions in `src/` as planned.

## User Setup Required

None - no new external service configuration required beyond 01-01 setup.

## Next Phase Readiness

- compileBrandContextBlock ready for injection into generation calls in 01-03 (article generation) and 01-05 (AI pipeline)
- saveBrandProfile / getBrandProfile Server Actions ready for use in downstream plans
- All BRAND requirements (BRAND-01, BRAND-02, BRAND-03) completed
- Database migrations still need to be run: `npx drizzle-kit push` (requires DATABASE_URL in .env.local)

## Self-Check: PASSED

All claimed files verified present on disk. All task commits verified in git log.

---
*Phase: 01-foundation*
*Completed: 2026-03-12*
