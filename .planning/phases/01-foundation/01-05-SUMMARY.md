---
phase: 01-foundation
plan: "05"
subsystem: ui
tags: [next.js, react, typescript, streaming, ai-sdk, tailwind, drizzle-orm, server-actions]

# Dependency graph
requires:
  - phase: 01-foundation/01-02
    provides: compileBrandContextBlock, getBrandProfile server action
  - phase: 01-foundation/01-03
    provides: getPerformanceData server action, PerformanceRow type
  - phase: 01-foundation/01-04
    provides: initArticleGeneration, updateArticleDraft, listArticleDrafts server actions; POST /api/generate/outline; POST /api/generate/section streaming routes; ArticleOutline type
provides:
  - /generate page: topic input + format picker + streaming article display end-to-end
  - FormatPicker: user-controlled format selection (top-performing badge vs manual dropdown)
  - ArticleStream: full generation state machine with section-by-section streaming via AI SDK data stream protocol
  - ArticleOutput: completed article rendered as formatted rich text with copy-to-clipboard markdown export
  - RegenerateButton: full pipeline reset for same topic/format
  - /drafts page: saved drafts list with status badges, empty state, Open links
  - Dashboard layout: client-side active nav with Brand, Performance, Generate, Drafts links
affects: [01-06-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - AI SDK data stream parsing in client: read lines prefixed with "0:" (text deltas), ignore "e:"/"d:" control lines
    - Generation order enforced in client state machine: body sections → introduction → conclusion (matches server expectation for bodySections context)
    - Top-performing format derived client-side by summing sessions per formatType, highest wins
    - Dashboard layout uses 'use client' + usePathname for active link detection

key-files:
  created:
    - app/(dashboard)/generate/page.tsx
    - app/(dashboard)/drafts/page.tsx
    - src/components/article/ArticleStream.tsx
    - src/components/article/ArticleOutput.tsx
    - src/components/article/RegenerateButton.tsx
    - src/components/performance/FormatPicker.tsx
  modified:
    - app/(dashboard)/layout.tsx

key-decisions:
  - "Dashboard layout converted to 'use client' to enable usePathname for active link state — only nav needs client, children remain server components"
  - "Format sentinel value '__top__' used internally in FormatPicker to distinguish 'use top-performing' from manual selection — resolved to actual format string before API calls"
  - "AI SDK data stream parsed manually in client (line-prefix protocol '0:') rather than using SDK helpers — avoids bundling full AI SDK client-side"

patterns-established:
  - "Pattern 8: Streaming section display — outline skeleton renders immediately with pulse placeholders; content fills in as tokens arrive; cursor blink on active section"
  - "Pattern 9: Format picker sentinel — '__top__' internal value resolved to actual topPerformingFormat string before any API or server action call"

requirements-completed: [ARTICLE-01, ARTICLE-02, ARTICLE-03, PERF-03]

# Metrics
duration: 4min
completed: 2026-03-12
---

# Phase 1 Plan 05: Article Generation UI Summary

**Streaming article generation UI with section-by-section display, user-controlled format picker (top-performing badge vs manual), auto-save on completion, and /drafts list with status badges**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-12T09:39:01Z
- **Completed:** 2026-03-12T09:43:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- /generate page fetches brand profile + performance data server-side, derives top-performing format by session total, passes to ArticleStream client component
- ArticleStream implements full generation state machine: outline fetch → body sections (sequential streaming) → introduction → conclusion → updateArticleDraft(status: draft_ready)
- FormatPicker renders two explicit choices per CONTEXT.md locked decision: top-performing badge (locked behind performance data upload) vs manual dropdown with 4 format options
- ArticleOutput renders completed article as H1/H2/H3 rich text with copy-to-clipboard producing clean markdown for WordPress Gutenberg paste
- /drafts page lists all saved drafts with color-coded status badges (Draft Ready/Generating/Error), generation date, and Open link
- Dashboard layout updated to 'use client' with usePathname active link detection, all four nav items present

## Task Commits

Each task was committed atomically:

1. **Task 1: Build article generation page with format picker and streaming display** - `f367f4c` (feat)
2. **Task 2: Add drafts list page and update dashboard navigation** - `b580fb4` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `app/(dashboard)/generate/page.tsx` — Server component fetching brand + perf data; derives topPerformingFormat; renders ArticleStream
- `app/(dashboard)/drafts/page.tsx` — Server component listing drafts via listArticleDrafts; status badges; empty state
- `app/(dashboard)/layout.tsx` — Updated to 'use client' with usePathname active link detection; added Generate and Drafts nav items
- `src/components/article/ArticleStream.tsx` — Full generation state machine; section-by-section streaming; calls initArticleGeneration + updateArticleDraft; assembleMarkdown helper
- `src/components/article/ArticleOutput.tsx` — Renders completed article with heading hierarchy, meta description, CTA note, copy button producing markdown
- `src/components/article/RegenerateButton.tsx` — Simple button invoking full pipeline reset via onRegenerate prop
- `src/components/performance/FormatPicker.tsx` — Radio group: top-performing (badge, disabled without perf data) vs manual (dropdown, 4 options); '__top__' sentinel value

## Decisions Made

- Dashboard layout became `'use client'` to enable `usePathname` for active link styling. Only the layout shell needs client-side rendering; page content remains server components.
- FormatPicker uses `'__top__'` as an internal sentinel value to represent "use top-performing format" choice. The sentinel is resolved to the actual format string (`topPerformingFormat`) before any API or server action call.
- AI SDK data stream protocol parsed manually in the client via line-prefix detection (`0:` = text delta). This avoids importing the full AI SDK into the client bundle while correctly consuming the streaming response.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no new external service configuration required.

## Next Phase Readiness

- Full /generate → /drafts pipeline ready for end-to-end manual testing
- ArticleStream correctly calls updateArticleDraft with status 'draft_ready' only after all sections complete
- Copy button produces markdown with `#`/`##`/`###` heading prefixes suitable for WordPress Gutenberg block editor paste
- /generate?draftId={id} link from /drafts is navigable (draftId param not yet consumed by the generate page — can be added in 01-06 if needed)

## Self-Check: PASSED

All claimed files verified present on disk. Both task commits verified in git log.

---
*Phase: 01-foundation*
*Completed: 2026-03-12*
