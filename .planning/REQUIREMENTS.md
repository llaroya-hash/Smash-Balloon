# Requirements: Content Marketing AI Tool

**Defined:** 2026-03-12
**Core Value:** Generate publish-ready, on-brand blog articles that drive WordPress plugin adoption — from competitor-informed topic ideas to SEO-optimized full drafts — so a solo content manager can maintain a consistent monthly publishing calendar without the blank-page bottleneck.

## v1 Requirements

### Brand Setup

- [ ] **BRAND-01**: User can fill out a brand voice form (tone, target audience, writing style, plugin focus, target keywords)
- [ ] **BRAND-02**: User can paste 1-2 example articles so the AI learns the actual writing structure and style
- [ ] **BRAND-03**: User can fill out a plugin facts sheet (product names, features, pricing, use cases) to prevent AI from hallucinating product details

### Performance Data

- [ ] **PERF-01**: User can upload a Google Analytics CSV export (traffic, bounce rate, sessions, etc.) for existing articles
- [ ] **PERF-02**: Tool uses top-performing article data to inform topic scoring — surfaces more topics similar to high-traffic articles
- [ ] **PERF-03**: Tool uses top-performing article data to inform writing style — if long-form how-to guides drive the most traffic, generated articles prioritize that format

### Competitor Intelligence

- [ ] **COMP-01**: Tool auto-discovers relevant competitors from the brand's niche and target keywords — no manual URL input required
- [ ] **COMP-02**: User can enter a keyword and the tool searches Google, analyzes the top 10 ranking pages, and reports: page titles/URLs/content types, topics repeated across 3+ pages (baseline expectations), topics appearing on only 1-2 pages (potential differentiators), People Also Ask questions, related searches and keyword variations, and content gaps where existing content is missing or thin

### Topic Generation

- [ ] **TOPIC-01**: User can generate a list of blog topic ideas informed by competitor content gaps (topics competitors cover that Smash Balloon doesn't)
- [ ] **TOPIC-02**: Topic ideas factor in AI-search-optimized formats (how-to guides, comparison posts, specific question-answer articles) favored by ChatGPT, Perplexity, and Google AI Overviews
- [ ] **TOPIC-03**: Each generated topic is scored by estimated SEO opportunity and relevance to Smash Balloon's plugins

### Publishing Calendar

- [ ] **CAL-01**: User can view a monthly publishing calendar showing planned posts by publish date
- [ ] **CAL-02**: User can add, remove, and reschedule topics on the calendar

### Article Generation

- [ ] **ARTICLE-01**: User can generate a full publish-ready article draft for any calendar topic, including: title, introduction, H2/H3 section structure, body content, conclusion, and a CTA linking to the relevant plugin
- [ ] **ARTICLE-02**: Generated articles match Smash Balloon's brand voice (practical how-to style, numbered lists, "proven" framing, conversational + professional, accessible to non-technical users)
- [ ] **ARTICLE-03**: Generated articles are SEO-optimized with a target keyword, meta description, and semantic topic coverage (no keyword stuffing)

## v2 Requirements

### Email Suite

- **EMAIL-01**: User can generate standalone email campaigns (newsletters, product promos, drip sequences) in Smash Balloon's brand voice

## v3 Requirements

### WPChat Brand

- **WPCHAT-01**: User can add a second brand profile for WPChat with its own voice form, facts sheet, and example articles
- **WPCHAT-02**: All v1 features (competitor intel, topic generation, calendar, article generation) work independently under the WPChat brand profile

## Out of Scope

| Feature | Reason |
|---------|--------|
| Direct WordPress publishing | Copy-paste workflow is sufficient for v1 |
| Blog promo emails | Not selected for v2 scope |
| Subject line A/B testing | Not selected |
| Social media post generation | Not requested |
| Team collaboration / multi-user | Solo user only |
| Email send / scheduling | Tool generates content only, not delivery |
| Mobile app | Web tool only |
| Content benchmarking (cadence tracking) | SERP analysis covers gap identification; cadence tracking is lower priority |
| Article streaming output | Can add later if UX feels slow |
| Section-level regeneration | Full regeneration sufficient for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| BRAND-01 | Phase 1 | Pending |
| BRAND-02 | Phase 1 | Pending |
| BRAND-03 | Phase 1 | Pending |
| PERF-01 | Phase 1 | Pending |
| PERF-02 | Phase 1 | Pending |
| PERF-03 | Phase 1 | Pending |
| ARTICLE-01 | Phase 1 | Pending |
| ARTICLE-02 | Phase 1 | Pending |
| ARTICLE-03 | Phase 1 | Pending |
| COMP-01 | Phase 2 | Pending |
| COMP-02 | Phase 2 | Pending |
| TOPIC-01 | Phase 2 | Pending |
| TOPIC-02 | Phase 2 | Pending |
| TOPIC-03 | Phase 2 | Pending |
| CAL-01 | Phase 3 | Pending |
| CAL-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 after roadmap creation*
