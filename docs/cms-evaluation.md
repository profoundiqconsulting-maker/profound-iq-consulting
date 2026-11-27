# CMS Evaluation — Headless CMS vs. Custom Codebase

**Date:** 2026-11-25  
**Scope:** Profound IQ Consulting public + admin surfaces (React/Vite/tRPC)  
**Status:** Evaluation complete. Recommendation: retain custom codebase; no CMS migration.

---

## 1. Executive Summary

The application is a custom React/Vite frontend backed by tRPC + Drizzle ORM on a PostgreSQL server layer. Content (courses, cohorts, assessments, insights, newsletters, reports) is authored through bespoke admin panels (`client/src/pages/Admin*.tsx`, `server/routers.ts`) and rendered server-less on the client.

Evaluating a headless CMS (e.g., Sanity, Strapi, Contentful, Directus, Payload) layered behind the existing tRPC API routes was considered to decouple content authoring from code deploys. **Recommendation: do not adopt a CMS.** The custom codebase already satisfies content-management needs with lower operational complexity, zero per-seat licensing, and full control over psychometric report rendering, PDF export, and dashboard persistence. A CMS would introduce schema sync, preview, auth, and API-gateway overhead without clear benefit.

---

## 2. Current State (Custom Codebase)

| Area | Implementation | Location |
|------|---------------|----------|
| Content authoring | Admin panels with tRPC mutations + Drizzle | `server/routers.ts`, `client/src/pages/Admin*.tsx` |
| Content delivery | tRPC queries + React Query | `server/routers.ts`, `client/src/` |
| Media/assets | Static + uploaded assets | `client/public/`, server storage |
| PDF reports | PDFKit server-side generation | server PDF routes |
| Dashboards | Recharts + server-persisted state | `client/src/pages/Dashboard*.tsx` |
| Auth/access control | Session-based + role gating | `server/`, `client/src/contexts/` |

**Strengths:** Zero licensing cost; content model tightly coupled to psychometric report logic; full control over OKLCH brand tokens, motion (ScrollReveal), and PDF layout; no preview/build sync lag.

**Gaps:** Non-technical authors must use admin UI (no rich-text WYSIWYG outside custom editors); content changes require a deploy (though admin UI avoids code changes); no multi-environment content staging out of the box.

---

## 3. Headless CMS Option (Layered Behind tRPC)

### Architecture considered

```
Author (CMS UI) → CMS API → CMS webhook → tRPC route (server/routers.ts) → Drizzle → PostgreSQL
                                                    ↑
                                           Client ← tRPC query ← React Query
```

The CMS would act as the content source of truth; the tRPC layer would proxy or sync CMS content into the app's own database, preserving the existing client contracts.

### Candidates assessed

| CMS | Self-hosted | License | Notes |
|-----|-------------|---------|-------|
| Strapi | Yes | MIT (community) | Plugin ecosystem; significant customization needed for psychometric schemas |
| Directus | Yes | Apache 2 | No-code UI; strong API; extra sync layer to keep Drizzle in sync |
| Sanity | No (hosted) | Proprietary | Great authoring experience; per-seat cost; vendor lock-in |
| Contentful | No (hosted) | Proprietary | Enterprise-grade; high cost; overkill for content volume |
| Payload | Yes | MIT | TypeScript-native; good fit for JS stack but still adds sync complexity |

### Concerns identified

1. **Schema drift:** Psychometric content (assessment questions, scoring rubrics, recommendation matrices) is tightly typed in TypeScript/Drizzle. A CMS schema would drift from the TS types, requiring code-gen or manual dual maintenance.
2. **PDF/report coupling:** Executive reports are generated server-side from structured assessment data, not rich-text CMS content. A CMS cannot meaningfully author statistical visualizations or course recommendations.
3. **Auth boundary:** Admin panels already enforce role-based access (staff/admin/instructor). Adding a CMS auth layer duplicates or conflicts with existing session management.
4. **Preview complexity:** Content changes need to reflect immediately in dashboards and reports. CMS webhook → re-sync → client refetch adds latency and failure modes.
5. **Cost:** Self-hosted options add infrastructure (CMS DB, container, backups). Hosted options add per-seat licensing for a small author team.

### Verdict

A headless CMS is **not justified**. Content volume is low, authors are internal staff already using admin panels, and the content model is inseparable from psychometric logic. Revisit only if authoring volume grows substantially or non-technical editorial workflows become a hard requirement.

---

## 4. Recommended Incremental Improvements (No CMS)

Instead of a CMS, invest in the existing custom codebase:

1. **Component library foundation** (`packages/ui/`): versioned barrel re-exporting shared shadcn/ui primitives so public and admin surfaces stay in sync. See `packages/ui/package.json`, `packages/ui/src/index.ts`, `packages/ui/VERSION`.
2. **Rich-text authoring within admin panels:** Add a lightweight WYSIWYG (e.g., TipTap or Lexical) to course/insight admin editors without introducing a CMS.
3. **Content versioning:** Add `created_at`/`updated_at`/`published_at` columns and soft-delete to Drizzle tables for basic editorial workflow.
4. **Scheduled publishing:** tRPC route + cron job to publish draft content at a future timestamp.
5. **Preview mode:** Query parameter-gated draft rendering for content review before publish.

---

## 5. Decision Log

| Decision | Rationale |
|----------|-----------|
| Retain custom codebase | Lower ops cost, full psychometric control, no licensing, existing admin UI suffices |
| No headless CMS migration | Schema drift, PDF/report coupling, auth duplication, preview complexity outweigh benefits |
| Versioned `packages/ui` library | Keeps shared primitives in sync without CMS overhead |
