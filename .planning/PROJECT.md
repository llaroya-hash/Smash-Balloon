# Content Marketing AI Tool

## What This Is

An AI-powered content marketing tool for Smash Balloon (smashballoon.com) — a WordPress plugin company with 1.75M+ users. The tool automates the blog content pipeline: discovering competitors, generating SEO-optimized topic ideas, building a monthly publishing calendar, and producing full publish-ready article drafts in Smash Balloon's brand voice. A second brand profile for WPChat (wpchat.com) and an email suite (promo + standalone campaigns with subject line A/B variants) will follow in later phases.

## Core Value

Generate publish-ready, on-brand blog articles that drive WordPress plugin adoption — from competitor-informed topic ideas to SEO-optimized full drafts — so a solo content manager can maintain a consistent monthly publishing calendar without the blank-page bottleneck.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Blog Pipeline (v1)**
- [ ] User can set up a brand voice profile (tone, target audience, writing style, keywords, plugin focus)
- [ ] Tool discovers relevant competitors based on niche + keywords (no manual input required)
- [ ] Tool benchmarks competitor content (publishing cadence, topics covered, SEO angles)
- [ ] Tool identifies content gaps (topics competitors cover that Smash Balloon doesn't)
- [ ] User can generate a list of blog topic ideas informed by competitor research
- [ ] User can build and view a monthly publishing calendar from selected topics
- [ ] User can generate a full publish-ready article draft for any calendar topic
- [ ] Generated articles match Smash Balloon's brand voice (practical how-to style, numbered lists, "proven" framing, conversational + professional, ties back to plugin use cases)
- [ ] Generated articles are SEO-optimized (target keyword, headers, meta description)

**Email Suite (v2)**
- [ ] User can generate a blog promo email for any published post
- [ ] User can generate standalone email campaigns (newsletters, product promos)
- [ ] User can generate subject line A/B variants for any email

**WPChat Brand (v3)**
- [ ] User can add a second brand profile for WPChat
- [ ] All v1 features work independently for the WPChat brand

### Out of Scope

- Publishing directly to WordPress — out of scope for v1 (copy-paste workflow is fine)
- Social media post generation — not requested
- Team collaboration features — solo user only
- Email send/scheduling — tool generates content, not delivery
- Mobile app — web tool only

## Context

**Smash Balloon** (primary brand): WordPress social media feed plugins (Facebook, Instagram, YouTube, TikTok, Twitter, Reviews). 1.75M+ active users. Trusted by Coca-Cola, Indeed, Baileys. Founded 2013. Sells individual plugins + All Access Bundle ($239.20/year).

**WPChat** (secondary brand): WordPress chat plugin launched Oct 2025. Supports WhatsApp, Messenger, Telegram, Instagram chat. Features AI FAQ automation, Chat Funnels for lead capture, agent management, analytics.

**Blog content style** (from smashballoon.com/blog/):
- Practical how-to guides with numbered steps
- Headlines with "proven" framing (e.g., "8 Proven Ways", "9 PROVEN Tips")
- Conversational but professional tone — no jargon, accessible to non-technical users
- Content always demonstrates practical applications that showcase plugin value
- SEO-driven — articles target specific keywords and use cases
- Target audience: small business owners, WordPress site admins, marketers

**Current state:** No publishing calendar exists. Topics are decided ad hoc. The tool replaces the entire content ideation-to-draft workflow for one person.

## Constraints

- **User**: Solo content marketing manager — no team workflows needed
- **Output format**: Articles must be ready to paste into WordPress with minimal editing
- **Brand**: Must match established Smash Balloon voice — not generic AI content
- **Stack**: To be determined during research phase

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Blog pipeline before email suite | Email extends from blog; foundation first gets value sooner | — Pending |
| Smash Balloon before WPChat | Primary brand, established content style, clearer audience | — Pending |
| Brand voice via form (not URL scraping) | Simpler to implement, user controls what the tool learns | — Pending |
| Competitor auto-discovery (not manual input) | User wants the tool to find competitors from niche + keywords | — Pending |

---
*Last updated: 2026-03-12 after initialization*
