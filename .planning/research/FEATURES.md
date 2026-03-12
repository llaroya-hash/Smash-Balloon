# Feature Landscape

**Domain:** AI-powered content marketing tool for WordPress plugin company
**Researched:** 2026-03-12
**Confidence note:** WebSearch, WebFetch, and Bash tools were unavailable during this research session. All findings are based on training data (knowledge cutoff August 2025) from direct experience with Jasper, Surfer SEO, MarketMuse, Frase, and ContentShake. Confidence is MEDIUM overall — core feature categories are stable and well-documented but specific product changes since August 2025 cannot be verified. Flag for live validation before finalizing roadmap.

---

## Competitive Landscape Context

The tools surveyed (Jasper, Surfer SEO, MarketMuse, Frase, ContentShake) serve different points in the content pipeline:

- **Jasper**: AI writing assistant with brand voice, templates, long-form docs. No native competitor research.
- **Surfer SEO**: SERP-based content optimization, keyword clustering, content editor with NLP scoring. Weak on brand voice.
- **MarketMuse**: Content gap analysis, topic modeling, competitive benchmarking. Enterprise-priced, overkill for solo user.
- **Frase**: AI research + outline + draft, pulls competitor SERP data into briefs. Mid-market.
- **ContentShake (Semrush)**: Topic ideas from Semrush data, AI article drafts, readability scoring. Closest analog to this project's scope.

None of these tools natively combine: brand voice profile + competitor auto-discovery + editorial calendar + article draft + email generation in a single opinionated workflow for a solo marketer. That is the gap this tool fills.

---

## Table Stakes

Features users expect in any AI content tool. Missing = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| AI article draft generation | Core value prop of every tool in this category | Med | Must produce full article, not just outline |
| SEO metadata output (title, meta description, target keyword) | Every SEO-aware content tool includes this | Low | Required alongside article body |
| Header structure (H1/H2/H3) in output | Standard article structure; Jasper/Frase both enforce this | Low | Affects WordPress paste-in quality |
| Keyword placement in draft | Surfer SEO and Frase score drafts on keyword density | Med | Must feel natural, not stuffed |
| Editable output before saving | Users expect to review/edit before committing | Low | Rich text editor or plain markdown copy |
| Brand voice / tone input | Jasper's "Brand Voice" is table stakes in 2024+ tools | Med | Users won't trust generic output |
| Topic idea generation | ContentShake, MarketMuse, Frase all surface topic lists | Med | Must be keyword/niche-informed |
| Re-generate / retry controls | All major tools offer regeneration for any section | Low | Essential for quality control |
| Copy-to-clipboard export | Solo marketers paste into WordPress; no CMS integration needed | Low | Plain text + formatted HTML both useful |

---

## Differentiators

Features that set a product apart from the generic AI writer category. Not universally expected, but create strong retention when done well.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Competitor auto-discovery from niche + keywords | No tool does this without manual URL input (Frase requires user to paste competitor URLs) | High | Biggest differentiation; requires SERP API or crawler |
| Competitor content benchmarking (cadence, topics, angles) | MarketMuse does topic modeling but not cadence/frequency analysis | High | Must interpret SERP/sitemap data |
| Content gap identification (topics competitors cover, Smash Balloon doesn't) | MarketMuse's core value but $500+/mo. Making this accessible at lower price point is a differentiator | High | Requires mapping competitor topics against existing content |
| Monthly publishing calendar built from topic ideas | ContentShake has a basic planner; no tool ties competitor research -> topics -> calendar in one flow | Med | Visual calendar view with drag/drop assignment |
| Brand voice profile that persists across all outputs | Jasper has this; smaller tools don't. Crucial for Smash Balloon's specific style | Med | Configurable tone, audience, style cues, plugin context |
| "Proven framing" article templates (how-to, numbered list, case study) | Generic tools produce generic structures; matching Smash Balloon's format is a differentiator | Med | Template library scoped to the user's established content style |
| Plugin-use-case tie-in prompting | Automatically weaving Smash Balloon plugin references into articles | Med | Requires plugin-aware prompt engineering |
| Email suite tied to blog content (blog promo emails, standalone campaigns) | No content research tool bundles email generation; Jasper does email but disconnected from blog pipeline | Med | Requires v2 but rounds out the pipeline |
| Subject line A/B variants | Mailchimp and Klaviyo have this at send time; generating them pre-send is rarer | Low | Straightforward LLM task once email body exists |
| Multi-brand profile support (Smash Balloon + WPChat) | Almost no tools support multiple brand voices in a single workspace cleanly | Med | v3 requirement; schema must anticipate it from v1 |

---

## Anti-Features

Features to explicitly NOT build in this project, with rationale.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Direct WordPress publishing (REST API integration) | Out of scope per PROJECT.md; adds auth complexity, WordPress version fragility, and debugging surface. Solo user can paste. | Copy-to-clipboard with clean HTML output |
| Social media post generation | Not requested; adds scope without serving the core blog pipeline goal | Explicitly decline if user asks; flag as future phase |
| Team collaboration (comments, approvals, role-based access) | Solo user only; building multi-user features now adds auth complexity and slows v1 | Single-user workspace; revisit if user count grows |
| Email send / scheduling | Tool is a content generator, not an ESP. Competes with Mailchimp/ConvertKit badly | Generate content, export to ESP |
| Mobile app | Web-only per PROJECT.md; responsive mobile web is fine but no native app | Responsive web UI |
| Generic SEO scoring (like Surfer's 0-100 content score) | Requires SERP API calls per article, high cost, uncertain accuracy, and duplicates what Surfer already does | Focus on structural SEO (headers, meta, keyword placement) rather than numerical score |
| Plagiarism checking | Commodity feature; adds API cost and complexity; doesn't address the brand voice problem | Trust LLM output + user review |
| Automated content re-publishing / content refresh workflows | Adds complexity; not in scope for v1 | Single-article generation per calendar entry |
| Image generation / sourcing | Out of scope; Smash Balloon articles use plugin screenshots, not AI images | Leave image slots as placeholders in output |

---

## Feature Dependencies

```
Brand voice profile
  -> Topic idea generation (voice informs angle/framing)
  -> Article draft generation (voice applied to full draft)
  -> Email generation (voice applied to email copy)

Competitor auto-discovery
  -> Competitor content benchmarking (need discovered URLs to analyze)
  -> Content gap identification (need benchmark data to find gaps)
  -> Topic idea generation (gaps inform topic list)

Topic idea generation
  -> Publishing calendar (topics are calendar entries)

Publishing calendar
  -> Article draft generation (calendar entry is the draft prompt)

Article draft generation (published post)
  -> Blog promo email (email wraps the published article)

Blog promo email
  -> Subject line A/B variants (variants are tied to an email)

Standalone email campaign
  -> Subject line A/B variants

Multi-brand profile (WPChat)
  -> All v1 features (must work independently per brand)
```

**Critical path:** Brand voice profile and competitor auto-discovery are v1 blockers. Everything downstream depends on them being right.

---

## MVP Recommendation

Prioritize (v1):

1. **Brand voice profile setup** — All output quality depends on this. Build it first, make it configurable, test it thoroughly before building generation features.
2. **Competitor auto-discovery + benchmarking** — Differentiating feature; gets the research data that informs everything else. This is the hardest technical piece.
3. **Topic idea generation** — First visible output; validates that competitor research is working.
4. **Publishing calendar** — Lightweight UI wrapper around topic list; medium complexity, high UX value.
5. **Article draft generation** — Core value; relies on brand voice profile being solid.
6. **SEO metadata output** — Bundle with article generation; low incremental effort.

Defer to v2:
- **Email generation** (blog promo + standalone): Extends naturally from article generation; same LLM pipeline, different prompt template. Deferring keeps v1 scope tight.
- **Subject line A/B variants**: Trivial once email generation exists.

Defer to v3:
- **Multi-brand profile (WPChat)**: Schema decisions in v1 must anticipate this, but implementation waits until v1 is validated.

---

## Sources

**Confidence: MEDIUM — training data only (knowledge cutoff August 2025)**

All findings are based on training knowledge of these products. External verification was not possible during this research session (WebSearch, WebFetch, and Bash tools denied). The following sources should be consulted to validate before roadmap finalization:

- Jasper features: https://www.jasper.ai/features
- Surfer SEO features: https://surferseo.com/features/
- MarketMuse features: https://www.marketmuse.com/features/
- Frase features: https://www.frase.io/features/
- ContentShake (Semrush): https://www.semrush.com/contentshake/

**What is HIGH confidence (stable, unlikely to change):**
- Core article generation, brand voice, SEO metadata as table stakes — the whole category converged on these by 2024
- Anti-features (WordPress direct publish, social media, team collaboration) — these are explicitly out of scope from PROJECT.md, not derived from market research
- Feature dependencies — these are logical/technical dependencies, not market-derived

**What is LOW confidence (may have changed since August 2025):**
- Specific product feature availability per tool (e.g., whether Frase added auto-discovery; whether ContentShake added calendar)
- Pricing tiers and what's gated
- Whether any new entrants have changed table stakes expectations
