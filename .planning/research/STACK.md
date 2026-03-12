# Technology Stack

**Project:** Content Marketing AI Tool (Smash Balloon)
**Researched:** 2026-03-12
**Confidence:** MEDIUM-HIGH overall — Next.js details verified via official docs; AI SDK, scraping, and DB details from training data (knowledge cutoff Aug 2025) with confidence noted per item.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.1.6 (latest) | Full-stack framework | Verified via official docs (Feb 2026). App Router provides Server Components for direct DB access without an API layer, Server Actions for mutations, and streaming support for LLM output. Single codebase = less operational overhead for a solo-user internal tool. |
| React | 19 (bundled) | UI rendering | Included with Next.js 16 App Router. `use()` hook enables clean streaming patterns from Server Components. No separate choice needed. |
| TypeScript | 5.x (latest) | Type safety | Default in `create-next-app`. Zod schemas feed into TypeScript types cleanly. Non-negotiable for an AI tool where input/output shapes change frequently. |

### LLM Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel AI SDK (`ai`) | 4.x (latest) | LLM orchestration, streaming | HIGH confidence: the standard library for AI in Next.js. Provides `streamText`, `generateText`, `generateObject` — all provider-agnostic. Handles streaming to the client with Server Actions natively. Supports OpenAI and Anthropic out of the box. |
| `@ai-sdk/openai` | latest | OpenAI provider adapter | MEDIUM confidence. Use `gpt-4o` as primary model for article drafts (best balance of quality and cost vs. o3). Provider swap is trivial with the SDK's unified API. |
| `@ai-sdk/anthropic` | latest | Anthropic provider adapter | MEDIUM confidence. Claude 3.5 Sonnet or Claude 3.7 Sonnet is a strong alternative — especially for long-form writing and following brand voice instructions. Keep as a fallback or A/B option. |
| `zod` | 3.x | Output validation, schema definition | HIGH confidence: Next.js auth guide uses Zod as its explicit example. `generateObject` in the AI SDK uses Zod schemas to enforce typed JSON output from the LLM (e.g., structured topic lists, article outlines). |

**Model recommendation:** Default to `gpt-4o` for cost/quality. Use Claude 3.7 Sonnet when long-form brand-voice fidelity matters most. Both are available through the Vercel AI SDK with a one-line swap.

### Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| PostgreSQL | 16+ (via Neon or Supabase) | Primary data store | HIGH confidence. Stores brand profiles, competitor data, calendar entries, article drafts, email templates. JSON columns handle flexible AI output structures. ACID compliance matters for calendar state. |
| Drizzle ORM | 0.x (latest) | Type-safe DB queries | HIGH confidence: Next.js's own auth documentation uses Drizzle as its ORM example (confirmed via official docs). Lightweight, no codegen daemon, schema-as-TypeScript, excellent Next.js App Router compatibility. Better than Prisma here because Prisma's query engine adds overhead that matters in serverless/edge environments. |
| Neon (serverless Postgres) | — | Hosted Postgres | MEDIUM confidence. Neon's serverless driver is optimized for Next.js/Vercel deployment (connection pooling built-in, scales to zero). Alternative: Supabase (more opinionated, adds auth layer you may not need). |

### Web Scraping (Competitor Research)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Firecrawl (`@mendable/firecrawl-js`) | latest | Competitor website scraping to Markdown | MEDIUM confidence. Firecrawl converts web pages to clean Markdown suitable for LLM consumption — critical for feeding competitor blog content into prompts. Handles JavaScript-rendered pages, anti-bot protection, rate limiting. Simpler than running Playwright in a Next.js API route. Has a Node.js SDK. |
| Firecrawl Search API | — | Finding competitor URLs from niche + keywords | MEDIUM confidence. Provides search-to-scrape pipeline: find competitor blog URLs from keyword searches, then scrape them. Removes the need to build custom competitor discovery. |

**Why not Playwright/Puppeteer directly:** Running a full browser in a Next.js serverless route hits memory limits (512MB–1GB on most platforms). Firecrawl offloads browser execution to their infrastructure. If budget is a concern, Playwright can be used in a separate long-running worker — but adds significant complexity.

**Alternative to Firecrawl:** Jina AI Reader (`r.jina.ai/[url]`) is a free API that converts any URL to LLM-friendly Markdown. No SDK needed — just a fetch call. Lower reliability and no search capability, but zero cost for competitor content extraction. Use as a fallback or for MVP.

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Better Auth | latest | Session management, email/password auth | MEDIUM confidence. Listed in Next.js's official auth guide. Modern, lightweight, Next.js-native design. Good fit for a single-user internal tool where Clerk's per-seat pricing is wasteful and NextAuth.js's configuration complexity is overkill. |
| `jose` | 5.x | JWT signing/verification | HIGH confidence: explicitly recommended in Next.js auth guide as a session management library. Used for stateless JWT cookies — the recommended Next.js session pattern. |

**Why not Clerk:** Clerk is excellent for multi-tenant SaaS. This tool has one user. Per-MAU pricing and the full user management overhead are unnecessary. Better Auth gives equivalent capability with zero vendor lock-in.

**Why not NextAuth.js (Auth.js):** Still a valid choice, but Better Auth has cleaner TypeScript ergonomics and a simpler mental model for new projects as of 2025.

### UI and Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | v4 (latest) | Utility-first styling | HIGH confidence. Default in `create-next-app` v16. For an internal tool built by one developer, Tailwind is the fastest path to a usable UI without a design system. |
| shadcn/ui | latest | Component library | MEDIUM confidence. Copy-paste component library built on Radix UI + Tailwind. Provides Calendar, DataTable, Form, Dialog — all needed for this tool. No dependency lock-in; components live in your codebase. Strongly preferred over installing a full component library like Chakra or MUI. |
| `@radix-ui/*` | latest | Accessible headless primitives | MEDIUM confidence. Used under the hood by shadcn/ui. Calendar component is particularly relevant for the publishing calendar feature. |

### Infrastructure and Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel | — | Deployment platform | MEDIUM confidence. Optimal for Next.js (built by the same team). Zero-config deployment, edge functions, automatic HTTPS, preview deployments. For an internal tool, the Hobby or Pro tier is sufficient. |
| Vercel Blob or Uploadthing | — | Article draft storage (optional) | LOW confidence. If article drafts need to be stored as files (e.g., for WordPress export), Vercel Blob or Uploadthing handle file uploads cleanly in Next.js. Most likely unnecessary — storing drafts as text in Postgres is simpler. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tanstack/react-query` | v5 | Client-side data fetching/caching | When a page needs real-time polling (e.g., checking if a background scraping job is complete). Most data fetching in this app happens server-side — only use React Query for polling patterns. |
| `nuqs` | latest | URL state management | For calendar/filter state that should be shareable via URL (e.g., current month in publishing calendar, selected brand). Nuqs syncs URL query params with React state cleanly in Next.js App Router. |
| `date-fns` | 3.x | Date manipulation | Publishing calendar requires date math. Lightweight, tree-shakeable. Do not use `moment.js` (deprecated, heavy). |
| `react-hook-form` | 7.x | Form state management | Brand voice profile setup form, topic generation form. Works well with Zod schemas via `@hookform/resolvers`. |
| `@vercel/og` | latest | OG image generation (optional) | Not needed for v1. Note for future: generating OG images for articles if the tool adds sharing features. |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 16 | Remix | Remix is excellent, but the Vercel AI SDK's streaming support is tighter with Next.js. Next.js has more AI-focused examples and community patterns. |
| ORM | Drizzle | Prisma | Prisma v5 is still the market leader, but its query engine adds cold-start overhead in serverless. Next.js's own docs use Drizzle. Either works — if the team already knows Prisma, it's fine. |
| ORM | Drizzle | Prisma | LOW: Prisma Accelerate solves the connection pooling problem, but adds another vendor dependency. |
| AI SDK | Vercel AI SDK | LangChain.js | LangChain.js is powerful for complex agent workflows but is over-engineered for this use case. The Vercel AI SDK's `generateObject` + `streamText` covers all needed patterns here without the abstraction overhead. |
| AI Model | OpenAI gpt-4o | Google Gemini 2.0 Flash | Gemini is a strong option (large context, competitive pricing) but OpenAI's instruction-following for long-form structured content is more predictable. Can be added later via `@ai-sdk/google`. |
| Scraping | Firecrawl | Playwright (self-hosted) | Playwright in serverless has memory constraints and requires a separate worker process. Adds operational complexity inappropriate for v1. |
| Scraping | Firecrawl | Jina Reader (free) | Jina is a valid free-tier fallback but lacks search capability and reliability guarantees. Use Firecrawl for production, Jina for MVP if cost is a concern. |
| Auth | Better Auth | Clerk | Clerk charges per MAU and adds full user management UI. Unnecessary for a single-user internal tool. |
| Auth | Better Auth | NextAuth.js | NextAuth.js is a valid alternative with more community examples. Choose Better Auth for cleaner TypeScript types and simpler configuration. |
| Database host | Neon | Supabase | Supabase is excellent but includes an auth layer, storage, and realtime that go unused. Neon is leaner and Postgres-only. |
| Database host | Neon | PlanetScale | PlanetScale uses MySQL, which has worse JSON support than Postgres. Not recommended for AI output storage. |
| Styling | Tailwind + shadcn/ui | Chakra UI | Chakra adds a full theme provider and CSS-in-JS overhead. For an internal tool, Tailwind + shadcn/ui is faster to build and easier to maintain. |

---

## Installation

```bash
# Bootstrap
npx create-next-app@latest content-marketing-tool --typescript --tailwind --app --yes

# Core AI
npm install ai @ai-sdk/openai @ai-sdk/anthropic

# Database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Validation
npm install zod

# Auth
npm install better-auth jose

# Scraping
npm install @mendable/firecrawl-js

# Forms
npm install react-hook-form @hookform/resolvers

# UI components (shadcn/ui via CLI — adds components individually)
npx shadcn@latest init

# Date utilities
npm install date-fns

# URL state
npm install nuqs
```

---

## Key Architectural Notes for This Tool

**LLM streaming for article drafts:** Use `streamText` from the Vercel AI SDK with a Server Action. Article drafts can be 2,000–4,000 words — streaming is essential so the user sees output immediately rather than waiting 30–60 seconds for a full response.

**Competitor research pipeline:** Firecrawl search → scrape competitor blog posts → store summaries in Postgres → feed as context into topic generation prompt. This runs as a background operation (Next.js `unstable_after` or a Route Handler) so it doesn't block the UI.

**Brand voice as prompt context:** Store the brand voice profile as structured JSON in Postgres. Inject it as a system prompt prefix for every generation call. Keep the profile schema versioned so prompt changes don't break existing drafts.

**Calendar state:** Store calendar entries (topic + target date + status + linked article draft) as rows in Postgres. No need for a dedicated calendar service. Use `date-fns` for all date calculations, `nuqs` for URL-driven month navigation.

---

## Sources

- Next.js 16.1.6 official documentation (verified Feb 2026): https://nextjs.org/docs/app/guides/authentication, https://nextjs.org/docs/app/getting-started/fetching-data, https://nextjs.org/docs/app/guides/backend-for-frontend, https://nextjs.org/docs/app/guides/caching
- Next.js 16 installation guide (verified Feb 2026): https://nextjs.org/docs/app/getting-started/installation
- Vercel AI SDK: https://sdk.vercel.ai/docs/introduction (access denied during research; details from training data, MEDIUM confidence, cutoff Aug 2025)
- Drizzle ORM: referenced directly in Next.js auth guide code examples (HIGH confidence via official docs)
- Firecrawl: training data MEDIUM confidence — verify current pricing/API at https://firecrawl.dev before committing
- Better Auth: listed in Next.js official auth guide (HIGH confidence for existence; MEDIUM for API details)
- `jose`: listed in Next.js official session management guide (HIGH confidence)
- shadcn/ui: https://ui.shadcn.com (training data, MEDIUM confidence)
