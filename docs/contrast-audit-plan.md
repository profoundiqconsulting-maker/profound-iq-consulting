# Contrast Audit Plan — WCAG AAA Text Claims

**Date:** 2026-11-25  
**Scope:** Public-facing pages of Profound IQ Consulting  
**Target:** WCAG AAA (7:1 normal text, 4.5:1 large text, 3:1 UI components/graphics)  
**Status:** Plan documented; scan not yet executed

---

## 1. Objective

Verify that all text on public pages meets WCAG AAA contrast ratios, and document any gaps. The project already targets WCAG AA (documented in `docs/course-accessibility-audit.md`); this plan raises the bar to AAA for public-facing text claims where the brand makes legibility promises.

> Note: WCAG AAA (7:1) is the enhanced level. Large text (18pt+ or 14pt+ bold) requires 4.5:1. UI components and graphical objects require 3:1. Achieving AAA body copy is aspirational; the plan identifies which public text pairs can realistically meet it.

---

## 2. Scan Targets (Public Pages)

The following public routes/pages are in scope. Admin, staff, and authenticated dashboard pages are out of scope for AAA (they target AA).

| # | Page / Component | File | Text types to check |
|---|------------------|------|---------------------|
| 1 | Homepage hero | `client/src/pages/Home.tsx` | Eyebrow, headline, subhead, CTA |
| 2 | Homepage cards | `client/src/pages/Home.tsx` | Card title, body, meta |
| 3 | Courses listing | `client/src/pages/Courses.tsx` | Course title, description, price |
| 4 | About page | `client/src/pages/About.tsx` | Body copy, pull quotes |
| 5 | Insights blog | `client/src/pages/Blog.tsx` | Article title, excerpt, date |
| 6 | Contact page | `client/src/pages/Contact.tsx` | Form labels, helper text |
| 7 | Privacy / Terms | `client/src/pages/PrivacyPolicy.tsx`, `TermsOfService.tsx` | Legal body copy |
| 8 | NotFound | `client/src/pages/NotFound.tsx` | Page title, message |
| 9 | Public shell navigation | `client/src/components/PublicPageShell.tsx`, `SiteNavigation.tsx` | Nav links, active states |
| 10 | BrandLogo | `client/src/components/BrandLogo.tsx` | Logotype legibility |
| 11 | Cookie consent | `client/src/components/CookieConsent.tsx` | Message, button text |
| 12 | Course pages (public) | `client/src/pages/CourseWorkspace.tsx` (public view) | Course title, module titles |

### Scan per page:
- Normal body text: target 7:1 against background
- Large text (headlines 18px+/bold 14px+): target 4.5:1 against background
- UI components (buttons, inputs, links, focus rings): target 3:1 against adjacent background
- Placeholder text: target 4.5:1 (large) / 7:1 (normal) — note placeholders are commonly exempt but included for completeness

---

## 3. Tooling

| Tool | Role |
|------|------|
| **axe-core** (via `@axe-core/react` or axe CLI) | Automated contrast detection on rendered DOM |
| **WAVE** (webaim.org) | Manual spot-check + contrast details per element |
| **Colour Contrast Analyser (CCA)** | Manual verification of specific pairs flagged by automated tools |
| **Browser DevTools** (Chrome "Inspect" contrast tooltip) | Quick per-element ratio checks |

### Preferred automated approach

Use axe CLI or `@axe-core/webdriver` against a built/local dev server:

```bash
# Example (install axe CLI if not present)
npm i -g @axe-core/cli
axe http://localhost:5173/ --tags color-contrast --report-v2
```

For per-component checks during development, import `axe` from `@axe-core/react` in a test harness that renders each public component with theme variants (light/dark).

---

## 4. Methodology

1. **Build/serve** the client locally (`npm run dev`) and confirm the build passes (`npm run build:client`).
2. **Capture each public page** at desktop (1280px), tablet (768px), and mobile (390px) breakpoints.
3. **Run axe contrast scan** on each breakpoint variant, light and dark theme.
4. **Flag** any pair below:
   - 7:1 for normal text
   - 4.5:1 for large text
   - 3:1 for UI components/graphics
5. **Manually verify** flagged pairs with CCA / DevTools color picker to confirm foreground/background colors (OKLCH tokens resolve to computed RGB).
6. **Record results** in the table below (pass/fail + ratio + remediation).
7. **Update** `docs/course-accessibility-audit.md` with any new fixed pairs and ratios.

---

## 5. Result Tracker

| Page | Element | Foreground | Background | Ratio | Target | Status | Remediation |
|------|---------|------------|------------|-------|--------|--------|-------------|
| Homepage | Hero headline | `--fg` | `--bg` | TBD | 4.5:1 (large) | Pending | — |
| Homepage | Hero subhead | `--fg-muted` | `--bg` | TBD | 7:1 (normal) | Pending | — |
| Homepage | CTA button | `--brand-fg` | `--brand` | TBD | 3:1 (UI) | Pending | — |
| Courses | Course title | `--fg` | `--bg` | TBD | 4.5:1 (large) | Pending | — |
| Courses | Course body | `--fg-muted` | `--bg` | TBD | 7:1 (normal) | Pending | — |
| About | Body copy | `--fg` | `--bg` | TBD | 7:1 (normal) | Pending | — |
| Insights | Article title | `--fg` | `--bg` | TBD | 4.5:1 (large) | Pending | — |
| Contact | Form label | `--fg` | `--bg` | TBD | 7:1 (normal) | Pending | — |
| Privacy | Legal body | `--fg` | `--bg` | TBD | 7:1 (normal) | Pending | — |
| NotFound | Page title | `--fg` | `--bg` | TBD | 4.5:1 (large) | Pending | — |
| Nav | Nav link | `--fg` | `--bg` | TBD | 4.5:1 (large) | Pending | — |
| Cookie | Message | `--fg` | `--bg-elevated` | TBD | 7:1 (normal) | Pending | — |

> Fill in actual ratios after running the scan. Mark "Pass"/"Fail" in Status.

---

## 6. Known Brand-Token Considerations

`client/src/index.css` defines OKLCH tokens used across public text:
- `--fg` / `--fg-muted` — primary/muted foreground
- `--brand` / `--brand-hover` — brand accent (button fills, links)
- `--brand-fg` — text on brand background
- `--bg` / `--bg-elevated` / `--bg-sunken` — surfaces
- `--border` / `--border-strong` — separators

When remediating, prefer swapping foreground tokens (`--fg` → `--fg`, `--fg-muted` → `--fg`, or `--brand-fg` on brand) rather than changing backgrounds, to preserve the OKLCH design system. Avoid introducing new hardcoded hex colors.

---

## 7. Acceptance Criteria

- [ ] All public pages scanned at 3 breakpoints × 2 themes (light/dark)
- [ ] Every normal text pair documented with its actual ratio
- [ ] All pairs below AAA target have a remediation entry or documented exemption
- [ ] No new hardcoded hex colors introduced during remediation
- [ ] `docs/course-accessibility-audit.md` updated with AAA-relevant findings
- [ ] `npm run build:client` passes with zero errors after remediation

---

## 8. Out of Scope

- Authenticated dashboard/admin pages (target WCAG AA, covered by existing audit)
- Recharts tooltip dark-mode contrast (tracked separately; already migrated to CSS variables)
- Third-party widgets (WhatsApp, social embeds) — brand has no control over their internal contrast
- Print stylesheets (PDF reports use PDFKit, not CSS contrast rules)
