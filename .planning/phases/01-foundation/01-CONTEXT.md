# Phase 1: Foundation - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Brand voice setup, performance data ingestion, and manual-topic article generation — proving the core pipeline works before adding upstream automation. A solo content manager can configure the tool, upload GA data, enter a topic manually, and get a publish-ready article draft.

</domain>

<decisions>
## Implementation Decisions

### Article Output UX
- Output is formatted rich text with headings already applied (H1, H2, H3) — copy-paste straight into WordPress block editor, no reformatting needed
- Article streams in as it generates (word-by-word, ChatGPT-style) — no waiting spinner
- User can regenerate the whole article with one button — no section-level regeneration in v1
- Articles are saved automatically — user can return, copy again, or regenerate later

### Brand Form Design
- Step-by-step wizard for initial setup: brand basics → tone & style → example articles → plugin facts
- Example articles (BRAND-02): user pastes raw text into a textarea — one large text box per article, copy from WordPress, paste in
- Plugin facts sheet (BRAND-03): guided structured fields — Plugin name, Key features (list), Pricing tiers, Main use cases — not free text
- Brand profile is always editable after save — new articles use the latest saved version, no warnings or locks

### Performance Data Display
- After CSV upload, show a simple table: Article title | Sessions | Top format type (how-to, list, comparison) — ranked by traffic
- Performance data influence on generation is user-controlled: before generating, user picks "Use top-performing format" or "Choose format manually" — not silent/automatic
- CSV is re-uploadable anytime — new upload replaces previous data, no version history needed

### Claude's Discretion
- Tech stack and framework selection (researcher to recommend)
- Database schema details (multi-brand FK pattern already decided in STATE.md)
- Exact field labels and microcopy
- Loading skeleton and empty state designs
- Error handling and validation patterns

</decisions>

<specifics>
## Specific Ideas

- Article output should feel like copy-pasting from a document — headings, paragraphs, all formatted, ready to drop into WordPress block editor without touching anything
- The brand wizard is a one-time setup; after that the content manager should rarely need to go back to it
- Performance data: the format override happens at generation time, not as a global setting

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — stack TBD (researcher to recommend)

### Integration Points
- WordPress block editor is the destination for article output — formatting must survive copy-paste into Gutenberg
- Google Analytics CSV export format must be parsed (standard GA4 or Universal Analytics export columns)

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-12*
