---
phase: 01-foundation
plan: "03"
subsystem: ui
tags: [papaparse, csv, drizzle, nextjs, server-actions, vitest]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: DB schema (performanceData table), PerformanceRow type, tsconfig paths
  - phase: 01-foundation/01-02
    provides: Dashboard layout, getBrandProfile action, brand page pattern
provides:
  - parseGA4CSV function — handles GA4 metadata header rows, maps Page title/Sessions/Bounce rate
  - classifyFormatType function — rule-based how-to/list/comparison/other detection from title
  - savePerformanceData Server Action — replace-semantics for brand performance rows
  - getPerformanceData Server Action — ordered by sessions descending
  - /performance page — CSV upload + ranked table with format type badges
affects: [02-competitor-research, 03-generation]

# Tech tracking
tech-stack:
  added: []
  patterns: [TDD red-green with vitest, PapaParse for CSV parsing in browser, Server Action replace pattern (delete+insert), router.refresh() for Server Component data refresh after client mutation]

key-files:
  created:
    - src/lib/csv/parse.ts
    - src/lib/csv/classify.ts
    - src/actions/performance.ts
    - src/components/performance/CSVUpload.tsx
    - src/components/performance/PerformanceTable.tsx
    - src/components/performance/PerformancePageClient.tsx
    - app/(dashboard)/performance/page.tsx
  modified:
    - tests/csv/parse.test.ts
    - tests/csv/classify.test.ts
    - app/(dashboard)/layout.tsx

key-decisions:
  - "parseGA4CSV scans raw lines for first row containing 'Page title'/'Page path' AND 'Sessions' — then slices from that row onward before passing to PapaParse with header:true, avoiding GA4 metadata row confusion"
  - "PerformancePageClient wraps CSVUpload + PerformanceTable as a Client Component calling router.refresh() on upload — allows Server Component page to re-fetch data without prop threading"
  - "savePerformanceData uses DELETE-then-INSERT (not upsert) for replace semantics — simplest correctness guarantee for the re-upload use case"
  - "classifyFormatType is purely rule-based with no LLM calls — deterministic, zero latency, zero cost"

patterns-established:
  - "Server Action replace pattern: delete all rows for brandId, then insert new batch — used for re-upload semantics"
  - "Client-driven refresh: Client Component calls router.refresh() after Server Action mutation so Server Component page re-fetches fresh data"
  - "GA4 CSV parsing: scan lines for known column header row, slice from there, parse with PapaParse"

requirements-completed: [PERF-01, PERF-02, PERF-03]

# Metrics
duration: 10min
completed: 2026-03-12
---

# Phase 1 Plan 03: GA4 CSV Upload and Performance Data Summary

**GA4 CSV parser with metadata-row skipping, rule-based format classifier, and /performance page with upload + sessions-ranked table with color-coded format type badges**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-12T17:18:00Z
- **Completed:** 2026-03-12T17:22:30Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- parseGA4CSV correctly handles GA4 exports (8-10 metadata rows before column header), maps Page title/Sessions/Bounce rate, filters invalid rows — 6 tests pass
- classifyFormatType rule-based detection: how-to/list/comparison/other from title patterns, case-insensitive — 11 tests pass
- /performance page with CSV upload section and sessions-ranked table with blue/green/yellow/gray format type badges
- Re-upload replaces all existing data for the brand (delete+insert pattern)
- Dashboard nav updated with Performance link

## Task Commits

Each task was committed atomically:

1. **Task 1: GA4 CSV parser and format type classifier with unit tests** - `8c0c9d1` (feat)
2. **Task 2: CSV upload page, Server Action, and performance table** - `5dd5a3f` (feat)

**Plan metadata:** (docs commit — see below)

_Note: Task 1 followed TDD: tests written first (RED), then implementation (GREEN). Both phases in single commit as tests + implementation together._

## Files Created/Modified
- `src/lib/csv/parse.ts` - parseGA4CSV: FileReader + PapaParse, finds header row by scanning lines
- `src/lib/csv/classify.ts` - classifyFormatType: regex-based rule-based classification
- `src/actions/performance.ts` - savePerformanceData (delete+insert) and getPerformanceData (sessions desc)
- `src/components/performance/CSVUpload.tsx` - Client component: file input, parse in browser, call Server Action, success/error states
- `src/components/performance/PerformanceTable.tsx` - Table with Article Title | Sessions | Format Type badge columns
- `src/components/performance/PerformancePageClient.tsx` - Client wrapper: combines upload + table, calls router.refresh() on upload
- `app/(dashboard)/performance/page.tsx` - Server Component: fetches brand + performance data, guards on missing brand profile
- `tests/csv/parse.test.ts` - 6 tests: fixture mapping, metadata skip, empty title filter, non-numeric filter, empty result
- `tests/csv/classify.test.ts` - 11 tests: how-to/list/comparison/other patterns, case-insensitive
- `app/(dashboard)/layout.tsx` - Added Performance nav link

## Decisions Made
- parseGA4CSV scans raw lines for first row containing both 'Page title'/'Page path' AND 'Sessions' before handing to PapaParse — handles any number of GA4 metadata comment rows
- PerformancePageClient is a Client Component calling router.refresh() after upload — keeps /performance page.tsx as a Server Component while enabling live data refresh
- savePerformanceData uses DELETE-then-INSERT — simplest way to implement re-upload replace semantics without risking duplicates
- classifyFormatType is purely rule-based (no LLM calls) — deterministic, free, zero latency

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added PerformancePageClient wrapper component**
- **Found during:** Task 2 (performance page)
- **Issue:** Plan specified Server Component page showing CSVUpload + PerformanceTable, but Server Components cannot use router.refresh() — needed a Client boundary to refresh data after upload without losing SSR benefits
- **Fix:** Created PerformancePageClient.tsx as a thin Client Component wrapper that holds the upload+table layout and calls router.refresh() on upload complete. Page.tsx remains a Server Component.
- **Files modified:** src/components/performance/PerformancePageClient.tsx (new), app/(dashboard)/performance/page.tsx
- **Verification:** TypeScript compiles cleanly, pattern matches existing codebase conventions
- **Committed in:** 5dd5a3f (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Required for correct data refresh behavior. No scope creep — component count same as plan's implied split.

## Issues Encountered
None — plan executed cleanly. TDD red/green cycle confirmed working with jsdom environment.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Performance data is stored and classified by format type — ready for PERF-03 (inject top-performing format into generation at generation time)
- classifyFormatType exported from src/lib/csv/classify.ts — importable by future generation pipeline
- getPerformanceData can be queried by brandId — ready for Phase 2/3 plans

---
*Phase: 01-foundation*
*Completed: 2026-03-12*
