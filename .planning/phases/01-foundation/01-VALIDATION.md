---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | BRAND-01 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | BRAND-02 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | BRAND-03 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 2 | PERF-01 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 2 | PERF-02 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 1-02-03 | 02 | 2 | PERF-03 | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 3 | ARTICLE-01 | integration | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 1-03-02 | 03 | 3 | ARTICLE-02 | manual | N/A — brand voice eval | N/A | ⬜ pending |
| 1-03-03 | 03 | 3 | ARTICLE-03 | manual | N/A — SEO output eval | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `__tests__/brand-profile.test.ts` — stubs for BRAND-01, BRAND-02, BRAND-03
- [ ] `__tests__/ga-parser.test.ts` — stubs for PERF-01, PERF-02, PERF-03
- [ ] `__tests__/article-generator.test.ts` — stubs for ARTICLE-01
- [ ] `vitest.config.ts` — framework config
- [ ] `npm install -D vitest @testing-library/react` — test framework install

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Generated article matches brand voice | ARTICLE-02 | Subjective tone/style judgment — LLM output varies | Run generation with saved brand profile; check for how-to format, numbered steps, "proven" framing, plugin CTA |
| Article SEO quality (no keyword stuffing) | ARTICLE-03 | Requires human judgment on natural language quality | Review generated article for target keyword density, meta description quality, H2/H3 semantic relevance |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
