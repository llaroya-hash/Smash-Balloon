# Roadmap: Content Marketing AI Tool

## Overview

Three phases deliver the full v1 blog content pipeline. Phase 1 proves the core value proposition — that brand voice setup plus a topic input produces a publish-ready draft — before any upstream automation is built. Phase 2 adds the differentiating layer: automatic competitor discovery, SERP gap analysis, and scored topic ideation that feeds the tool from the top. Phase 3 closes the workflow with a monthly publishing calendar, turning a list of topics into a visual plan with integrated draft generation. v2 (email suite) and v3 (WPChat multi-brand) extend the foundation after the blog pipeline is validated.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Brand voice setup, performance data, and article generation that produces publish-ready drafts
- [ ] **Phase 2: Competitor Intelligence + Topic Ideation** - Auto-discover competitors, analyze content gaps, and generate scored topic ideas
- [ ] **Phase 3: Publishing Calendar** - Monthly calendar view with scheduling, status tracking, and integrated draft generation

## Phase Details

### Phase 1: Foundation
**Goal**: A solo content manager can describe Smash Balloon's brand voice, upload performance data, and generate a publish-ready, SEO-optimized article draft from a manually entered topic — proving the core pipeline before any upstream automation is added
**Depends on**: Nothing (first phase)
**Requirements**: BRAND-01, BRAND-02, BRAND-03, PERF-01, PERF-02, PERF-03, ARTICLE-01, ARTICLE-02, ARTICLE-03
**Success Criteria** (what must be TRUE):
  1. User fills out a brand voice form (tone, audience, writing style, plugin focus, target keywords), pastes 1-2 example articles, and saves a facts sheet — and the saved profile is retrieved on every subsequent generation call
  2. User uploads a Google Analytics CSV and the tool identifies top-performing article formats, surfacing that data as a signal during topic scoring and generation style selection
  3. User enters a topic manually and generates a full article draft including title, H2/H3 structure, body sections, conclusion, and a plugin CTA — without needing to provide any other inputs
  4. Generated article matches Smash Balloon's brand voice: practical how-to format, numbered steps, "proven" framing, conversational but professional tone, and plugin use-case tie-in
  5. Generated article includes a target keyword, meta description, and semantic H2/H3 coverage — and does not keyword-stuff
**Plans**: 6 plans

Plans:
- [ ] 01-01-PLAN.md — App bootstrap, DB schema (brands/performanceData/articleDrafts), shared types, Wave 0 test stubs
- [ ] 01-02-PLAN.md — Brand voice wizard (4-step UI), compileBrandContextBlock, Server Actions, unit tests
- [ ] 01-03-PLAN.md — GA4 CSV upload, parseGA4CSV, classifyFormatType, performance table, unit tests
- [ ] 01-04-PLAN.md — Article generation pipeline (outline route, section streaming route, draft lifecycle)
- [ ] 01-05-PLAN.md — Article generation UI (streaming display, format picker, drafts list, dashboard nav)
- [ ] 01-06-PLAN.md — Human verify: end-to-end pipeline quality check

### Phase 2: Competitor Intelligence + Topic Ideation
**Goal**: The tool automatically discovers relevant WordPress plugin competitors from the brand's niche and keywords, analyzes the SERP for any entered keyword, identifies content gaps, and produces a scored list of topic ideas — so the content manager never starts from a blank page
**Depends on**: Phase 1
**Requirements**: COMP-01, COMP-02, TOPIC-01, TOPIC-02, TOPIC-03
**Success Criteria** (what must be TRUE):
  1. User triggers competitor discovery and the tool returns a list of relevant competitor domains — no manual URL input required — with the user able to review and confirm the list before full analysis runs
  2. User enters a keyword and the tool returns: top 10 ranking page titles/URLs/content types, topics repeated across 3+ pages (baseline), topics on only 1-2 pages (differentiators), People Also Ask questions, related searches, and content gaps where existing coverage is thin
  3. User generates a topic idea list and each idea is tagged with estimated SEO opportunity, relevance to Smash Balloon's plugins, and the AI-search-optimized format it fits (how-to, comparison, question-answer)
  4. Topic ideas surface gaps that Smash Balloon's blog does not yet cover, derived from competitor analysis run in the same session
**Plans**: TBD

### Phase 3: Publishing Calendar
**Goal**: The content manager can build a monthly publishing plan by scheduling topics from the idea list onto calendar dates, track each article's status from idea through draft-ready, and trigger article generation directly from a calendar entry — completing the full pipeline from brand setup to publish-ready draft
**Depends on**: Phase 2
**Requirements**: CAL-01, CAL-02
**Success Criteria** (what must be TRUE):
  1. User views a monthly calendar showing all planned posts by publish date, with each entry displaying topic title and current status (idea / scheduled / in progress / draft ready)
  2. User can add a topic to a calendar date, move it to a different date, and remove it — and changes persist across sessions
  3. User can click a calendar entry and trigger article generation for that topic, producing a draft without leaving the calendar view
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/6 | In Progress|  |
| 2. Competitor Intelligence + Topic Ideation | 0/TBD | Not started | - |
| 3. Publishing Calendar | 0/TBD | Not started | - |
