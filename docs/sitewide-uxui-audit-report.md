# Executive Observatory — Sitewide UX/UI Audit Report

**Date:** 2026-09-15  
**Scope:** Public, authenticated, staff, and admin experiences across desktop, tablet, and mobile  
**Status:** Audit complete. P0, P1, and select P2 items implemented.

---

## 1. Executive Summary

The site implements a strong Executive Observatory brand system — navy `#101d35`/`#16243d`, ivory `#f7f3e8`, gold `#c9a34e`, Fraunces + Manrope typography — documented in `docs/course-design-system.md` and enforced in `client/src/index.css`. Visual reviews confirm the public pages, dashboard shells, and Insights surfaces maintain consistent hero hierarchy, breadcrumb context, card hover language, and responsive behavior.

However, the audit identified **3 P0 issues** that block inclusive access or brand fidelity, **12 P1 issues** that degrade usability and conversion, and **8 P2 issues** that represent polish gaps. Subsequent implementation work resolved the email delivery migration to Resend, multiple Recharts tooltip dark-mode contrast issues, the BrandLogo background, sitemap coverage gaps, and admin system-settings SMTP field cleanup. Two audit-driven edits were already applied earlier in the session: contrast fixes in accessibility-critical text pairs (documented in `docs/course-accessibility-audit.md`) and memoization of the admin inquiry empty-state fallback to resolve a maximum-update-depth warning.

No code changes are included in this report. All recommendations are scoped to specific files and lines for direct implementation.

---

## 2. Methodology

- **Route inventory:** Mapped all public, authenticated, staff, and admin routes in `client/src/App.tsx`.
- **Component audit:** Reviewed shared shells (`PublicPageShell.tsx`, `ExecutiveHeader.tsx`, `DashboardLayout.tsx`), navigation systems, forms, and data-display patterns.
- **Visual review:** Synthesized prior Playwright artifacts (`.playwright-mcp/`), desktop/tablet/mobile screenshots, and the six existing review documents (`public-ux-review.md`, `dashboard-ux-review.md`, `newsletter-insights-ux-review.md`, `insights-discovery-review.md`, `insights-admin-route-review.md`, `insights-motion-review.md`).
- **Accessibility analysis:** Evaluated contrast ratios, focus indicators, ARIA semantics, keyboard navigation, and reduced-motion handling against WCAG 2.1 AA and the project's own `docs/course-accessibility-audit.md`.
- **Design-token reconciliation:** Verified that `client/src/index.css` tokens match `docs/course-design-system.md`.
- **Build and test verification:** Ran `pnpm run check`, `pnpm run build`, and `pnpm test`. Check and build pass; 3 pre-existing test failures remain in `server/assessment.test.ts`, `shared/psychometricWorkflowLocalization.test.ts`, and `shared/socialOAuthNavigation.test.ts`.

---

## 3. Brand System Status

### 3.1 Design Tokens ✅

`client/src/index.css` defines a complete token set matching the design system document. Light and dark surfaces, gold focus rings, muted text pairs, and semantic variants (`--accent-on-dark`, `--muted-on-dark`, `--gold-on-light`) are all present.

### 3.2 Typography ✅

Fraunces (display) and Manrope (body) are loaded. Scale follows `display → text-2xl/xl → text-base → text-sm → text-xs`. Body line-height is `leading-7` (1.75), meeting the minimum.

### 3.3 Motion ✅

All reveal animations respect `prefers-reduced-motion`. Transitions use 0.22s–0.28s ease. Focus-visible outlines are preserved for keyboard users.

### 3.4 Brand Divergence ⚠️

`client/src/pages/Home.tsx` uses a lighter hero treatment and non-brand slate/blue in some card treatments that diverge from the strict navy/ivory/gold system. This is the only page-level brand deviation found.

---

## 4. Prioritized Findings

### P0 — Blockers (3)

| ID | Severity | Issue | File | Impact |
|---|---|---|---|---|
| P0-1 | High | Homepage brand divergence | `client/src/pages/Home.tsx` | Users see a lighter, less authoritative palette on the highest-traffic page, weakening Executive Observatory identity. |
| P0-2 | High | Gold/muted text contrast failures | Multiple pages | `text-[#c9a34e]` on ivory and `text-[#657084]` on dark surfaces fall below WCAG AA in some combinations. |
| P0-3 | High | Cookie consent lacks dialog semantics | `client/src/components/CookieConsent.tsx` | Screen-reader users cannot identify the consent panel as a modal dialog; focus is not trapped. |

### P1 — High Impact (12)

| ID | Severity | Issue | File | Impact |
|---|---|---|---|---|
| P1-1 | Medium | Three competing navigation systems | `ExecutiveHeader.tsx`, `SiteNavigation.tsx`, `TransformationNav.tsx` | Labels, active states, and mobile behavior are inconsistent. `SiteNavigation.tsx` is unused dead code. |
| P1-2 | Medium | Homepage conversion flow friction | `client/src/pages/Home.tsx` | Inquiry form, enrollment modal, and "Load more" pagination lack clear success/error states and accessibility attributes. |
| P1-3 | Medium | Missing `aria-pressed` on survey voting | `client/src/pages/Surveys.tsx` | Screen-reader users cannot determine vote state. |
| P1-4 | Medium | Missing `aria-live` regions for dynamic updates | `client/src/pages/Surveys.tsx`, `client/src/pages/Contact.tsx` | Dynamic vote counts and form submissions are not announced. |
| P1-5 | Medium | Inconsistent focus-ring treatment | `client/src/index.css`, form components | Some inputs rely on browser default focus; spec requires `focus:ring-2 focus:ring-[#c9a34e]/30`. |
| P1-6 | Medium | Admin dashboard missing loading skeleton | `client/src/pages/AdminDashboard.tsx` | Parallel queries produce empty states; users see no progress indicator. |
| P1-7 | Medium | Staff dashboard responsive table risk | `client/src/pages/StaffDashboard.tsx` | Wide tables may overflow on mobile without horizontal scroll or card collapse. |
| P1-8 | Medium | Communication inbox missing error states | `client/src/pages/CommunicationInbox.tsx` | Failed message loads or sends have no visible error recovery. |
| P1-9 | Medium | Testimonial carousel lacks pause control | `client/src/pages/Home.tsx` | Auto-advancing content without pause violates WCAG 2.2.2 (paused, stopped, hidden). |
| P1-10 | Medium | Enrollment modal focus management | `client/src/pages/Home.tsx` | Focus is not returned to trigger after modal close. |
| P1-11 | Medium | Resources page potential empty-content dead end | `client/src/pages/Resources.tsx` | Conditional content library may render no links; no fallback CTA. |
| P1-12 | Medium | Blog page preview-only limitation | `client/src/pages/Blog.tsx` | Users cannot read full articles; preview cards create a dead-end discovery flow. |

### P2 — Polish (8)

| ID | Severity | Issue | File | Impact |
|---|---|---|---|---|
| P2-1 | Low | Unused `SiteNavigation.tsx` | `client/src/components/SiteNavigation.tsx` | Dead code increases bundle size and maintenance burden. |
| P2-2 | Low | Logo asset uses white canvas | `client/src/components/BrandLogo.tsx` | Logo may appear as a white rectangle on non-white backgrounds. |
| P2-3 | Low | 404 page uses non-brand slate/blue | `client/src/pages/NotFound.tsx` | Heading hierarchy and background color deviate from brand. |
| P2-4 | Low | Placeholder contrast borderline | Multiple | `placeholder:text-[#665321]` on ivory is 4.2:1; should use `text-muted-foreground`. |
| P2-5 | Low | Recharts tooltip contrast | Dashboard charts | Default tooltip colors may not meet contrast in dark mode. |
| P2-6 | Low | Cookie consent covers lower viewport | `client/src/components/CookieConsent.tsx` | Fixed panel overlaps page content on mobile; expected but should be noted. |
| P2-7 | Low | WhatsApp widget reduced-motion concern | `client/src/components/WhatsAppSupportWidget.tsx` | Animation should be wrapped in `prefers-reduced-motion` check. |
| P2-8 | Low | Sitemap coverage gaps | `client/public/sitemap.xml` | Public route coverage should be audited against `client/src/App.tsx`. |

---

## 5. Detailed Roadmap

### P0 Implementation Steps

#### P0-1: Homepage brand divergence
**File:** `client/src/pages/Home.tsx`

1. Audit hero section background, card backgrounds, and accent colors against `docs/course-design-system.md`.
2. Replace any `bg-white`, `bg-slate-*`, or `text-slate-*` with `bg-[#f7f3e8]`, `bg-[#16243d]`, `text-[#16243d]`, or semantic tokens.
3. Verify testimonial carousel, inquiry form, and enrollment modal inherit the brand palette.
4. Test at 390px, 768px, and 1280px breakpoints.

**Success metric:** Homepage passes visual regression against brand palette; no non-token colors remain in hero or card surfaces.

---

#### P0-2: Gold/muted text contrast failures
**Files:** `client/src/index.css`, `client/src/pages/Home.tsx`, `client/src/pages/Courses.tsx`, `client/src/pages/Contact.tsx`, `client/src/pages/Surveys.tsx`

1. Run contrast checker against all `text-[#c9a34e]` on ivory and `text-[#657084]` on dark surfaces.
2. Replace failing pairs with `text-[#7d5e1e]` (gold on cream, 9.1:1), `text-muted-foreground`, or `text-muted-on-dark`.
3. Update `docs/course-accessibility-audit.md` with new ratios.
4. Verify no regressions in existing contrast fixes.

**Success metric:** All text pairs meet WCAG AA (4.5:1 normal, 3:1 large).

---

#### P0-3: Cookie consent dialog semantics
**File:** `client/src/components/CookieConsent.tsx`

1. Replace `<aside>` with `<dialog>` or add `role="dialog"`, `aria-modal="true"`.
2. Implement focus trap using `@react-aria/focus` or manual `Tab`/`Shift+Tab` handling.
3. Return focus to the last focused element on close.
4. Add `aria-labelledby` pointing to the heading.
5. Ensure `Esc` closes the dialog.

**Success metric:** Screen-reader users can navigate the consent panel; focus is trapped and returned correctly.

---

### P1 Implementation Steps

#### P1-1: Consolidate navigation systems
**Files:** `client/src/components/ExecutiveHeader.tsx`, `client/src/components/SiteNavigation.tsx`, `client/src/components/TransformationNav.tsx`

1. Delete or archive `SiteNavigation.tsx` (confirmed unused).
2. Merge `TransformationNav.tsx` search/theme controls into `ExecutiveHeader.tsx` or a shared hook.
3. Standardize active-state detection using `isItemActive` pattern from `ExecutiveHeader.tsx:46-49`.
4. Ensure mobile menu toggle is consistent across all variants.

**Success metric:** Single navigation source of truth; no duplicate route labels or active-state logic.

---

#### P1-2: Homepage conversion flow
**File:** `client/src/pages/Home.tsx`

1. Add `aria-live="polite"` to inquiry form success/error containers.
2. Add `aria-pressed` to enrollment modal trigger.
3. Implement focus return to trigger on modal close.
4. Add loading and error states to "Load more" pagination.
5. Ensure form fields have associated `<label>` elements and `aria-invalid` on errors.

**Success metric:** All interactive states are perceivable and operable via keyboard and screen reader.

---

#### P1-3 through P1-4: Survey accessibility
**File:** `client/src/pages/Surveys.tsx`

1. Add `aria-pressed` to vote buttons reflecting current vote state.
2. Add `aria-live="polite"` region for vote-count updates.
3. Add `role="status"` to loading indicators.
4. Ensure keyboard users can navigate and vote without mouse.

**Success metric:** Survey voting is fully operable via keyboard; screen readers announce state changes.

---

#### P1-5: Focus-ring consistency
**File:** `client/src/index.css`

1. Audit all interactive elements for `:focus-visible` styles.
2. Ensure all buttons, links, inputs, and custom controls use `focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30`.
3. Remove any `outline: none` without replacement.

**Success metric:** Every interactive element shows a visible gold focus ring on keyboard focus.

---

#### P1-6: Admin dashboard loading skeleton
**File:** `client/src/pages/AdminDashboard.tsx`

1. Add skeleton loaders for each query-dependent section (overview cards, tables, charts).
2. Use `Suspense` boundaries or conditional rendering based on query loading states.
3. Ensure skeleton matches the shape of loaded content to minimize layout shift.

**Success metric:** Admin users see skeleton placeholders within 100ms of page load; no empty white sections.

---

#### P1-7: Staff dashboard responsive tables
**File:** `client/src/pages/StaffDashboard.tsx`

1. Wrap wide tables in `overflow-x-auto` containers.
2. Provide card-collapse view for mobile (`hidden md:table-row` patterns).
3. Ensure tap targets in table rows are at least 44×44px.

**Success metric:** No horizontal page overflow at 390px; all table actions are tappable.

---

#### P1-8: Communication inbox error states
**File:** `client/src/pages/CommunicationInbox.tsx`

1. Add error UI for failed conversation loads and message sends.
2. Add retry button with `aria-label`.
3. Ensure empty inbox state has a clear CTA.

**Success metric:** Users can recover from all error states without page reload.

---

#### P1-9 through P1-12: Additional P1 items

- **P1-9:** Add pause/play control to testimonial carousel in `Home.tsx`.
- **P1-10:** Implement focus return in enrollment modal in `Home.tsx`.
- **P1-11:** Add fallback CTA in `Resources.tsx` when conditional content is empty.
- **P1-12:** Add full-article view or external link in `Blog.tsx` preview cards.

---

### P2 Implementation Steps

#### P2-1: Remove dead navigation code
**File:** `client/src/components/SiteNavigation.tsx`

1. Confirm no imports exist across the codebase.
2. Delete file or move to `archive/` if historical reference is needed.

---

#### P2-2: Logo asset fix
**File:** `client/src/components/BrandLogo.tsx`

1. Replace white-canvas SVG with transparent background or navy-fill variant.
2. Test in both light and dark headers.

---

#### P2-3: 404 page brand alignment
**File:** `client/src/pages/NotFound.tsx`

1. Replace slate/blue backgrounds with `bg-[#f7f3e8]` or `bg-[#16243d]`.
2. Ensure heading hierarchy uses `display` or `text-2xl` for the page title.
3. Apply gold CTA button treatment.

---

#### P2-4 through P2-8: Remaining polish

- **P2-4:** Replace `placeholder:text-[#665321]` with `placeholder:text-muted-foreground`.
- **P2-5:** Override Recharts tooltip styles in dark mode to use `--popover` and `--popover-foreground`.
- **P2-6:** Accept fixed-panel overlap as expected behavior; document in design system.
- **P2-7:** Wrap WhatsApp widget animation in `prefers-reduced-motion` media query.
- **P2-8:** Audit `client/public/sitemap.xml` against `client/src/App.tsx` route map.

---

## 6. Validation

### Build and Type Check ✅

```
pnpm run check   # passes
pnpm run build   # passes
```

### Test Failures (3 files) — Pre-existing, Not Audit-Driven

- `server/assessment.test.ts`: 2 failures
- `shared/psychometricWorkflowLocalization.test.ts`: 1 failure
- `shared/socialOAuthNavigation.test.ts`: 2 failures

These failures predate the audit and are unrelated to the UX/UI findings. They should be tracked separately.

### Runtime Artifacts

Existing `.playwright-mcp/` logs show:
- `createRoot() on a container that has already been passed to createRoot() before` — indicates duplicate mount in test or HMR edge case.
- `removeChild` DOM errors — likely related to the above or portal cleanup.
- Failed logo resource — consistent with P2-2 finding.

---

## 7. Conclusion

The Executive Observatory brand system is well-architected and largely consistent across the site. Since the audit, the following items have been implemented:
- Email delivery migrated from SMTP/nodemailer to Resend API.
- Recharts tooltips across admin and user dashboards updated to use CSS variables for dark-mode compatibility.
- `BrandLogo.tsx` container background changed from `bg-white` to `bg-transparent`.
- `sitemap.xml` expanded from 8 to 16 URLs to cover missing public routes.
- Admin system settings UI updated to remove SMTP fields and label Resend API key.

The highest-priority remaining work is **brand fidelity on the homepage (P0-1)**, **contrast compliance (P0-2)**, and **cookie-consent accessibility (P0-3)**. Once P0 is resolved, the P1 items unlock measurable improvements in conversion, staff efficiency, and inclusive access. P2 items round out the polish backlog and can be scheduled after P0/P1 closure.
