# Profound IQ Design System Update — Component & Spacing Standardization

**Version:** 3.1.0  
**Date:** 2026-11-26  
**Scope:** Button variants, modal/popup overlays, spacing scale, grid, alignment

---

## 1. Button Component Standardization

### File: `client/src/components/ui/button.tsx`

### Removed Legacy Aliases

| Removed Alias | Replaced With | Reason |
|-------------|---------------|--------|
| `variant="default"` | `variant="primary"` | Duplicate of primary brand action |
| `variant="gold"` | `variant="brand"` | Duplicate of brand (uppercase, bold CTA) |
| `variant="goldOutline"` | `variant="brandOutline"` | Duplicate of brand outline |

### Standardized Button Variants

| Variant | Background | Text | Border | Hover | Use Case |
|---------|-----------|------|--------|-------|----------|
| `primary` | `--brand` | `--brand-fg` | none | `--brand-hover` + shadow | Default primary action |
| `secondary` | `--bg-sunken` | `--fg` | `--border` | `--bg-sunken/80` | Secondary actions |
| `outline` | transparent | `--fg` | 2px `--border` | `--bg-sunken` + `--brand` border | Tertiary |
| `ghost` | transparent | `--fg` | none | `--bg-sunken` | Low emphasis |
| `link` | transparent | `--brand` | none | underline | Text links |
| `brand` | `--brand` | `--brand-fg` | none | `--brand-hover` + shadow | Hero CTAs (uppercase, bold, 700 weight) |
| `brandOutline` | transparent | `--brand` | 2px `--brand` | `--brand` bg + `--brand-fg` text | Alternative primary |
| `subtle` | `--bg-sunken` | `--fg-muted` | none | `--bg-sunken/80` | Low contrast |
| `success` | `--success` | white | none | `--success-hover` + shadow | Positive confirmations |
| `danger` | `--danger` | white | none | `--danger-hover` + shadow | Destructive actions |

### Standardized Button Sizes

| Size | Height | Padding X | Font | Use Case |
|------|--------|-----------|------|----------|
| `sm` | h-9 (36px) | px-3.5 | text-xs | Compact UI, toolbars |
| `default` | h-10 (40px) | px-5 | text-sm | Standard actions |
| `lg` | h-11 (44px) | px-7 | text-base | Prominent actions |
| `xl` | h-12 (48px) | px-8 | text-lg | Hero CTAs |
| `icon` | size-10 (40px) | — | — | Icon-only buttons |
| `icon-sm` | size-9 (36px) | — | — | Compact icon buttons |
| `icon-lg` | size-11 (44px) | — | — | Large icon buttons |

### Interaction Patterns

- **Focus visible:** 2px `var(--border-focus)` ring with 3px offset
- **Active:** `scale(0.98)` transform
- **Disabled:** `pointer-events: none`, `opacity: 0.5`
- **SVG icons:** `pointer-events: none`, auto-sized to 4px unless explicit size class
- **Transition:** `all 180ms ease-out` (respects `prefers-reduced-motion`)

---

## 2. Spacing Scale, Grid & Alignment Rules

### File: `client/src/index.css` (added spacing utility section)

### Base Unit: 8px (0.5rem)

All spacing derives from the 8px base unit defined in `brand-system.css` (`--spacing-0` through `--spacing-24`).

### Spacing Scale Tokens

| Token | Value | CSS Class | Use Case |
|-------|-------|-----------|----------|
| `--spacing-1` | 4px | `.space-1`, `.px-1`, `.py-1` | Icon gaps, tight spacing |
| `--spacing-2` | 8px | `.space-2`, `.px-2`, `.py-2` | Base unit, inline gaps |
| `--spacing-3` | 12px | `.space-3`, `.px-3`, `.py-3` | Form field gaps |
| `--spacing-4` | 16px | `.space-4`, `.px-4`, `.py-4` | Component padding |
| `--spacing-5` | 20px | `.space-5`, `.px-5`, `.py-5` | Card internal |
| `--spacing-6` | 24px | `.space-6`, `.px-6`, `.py-6` | Section rhythm |
| `--spacing-8` | 32px | `.space-8`, `.px-8`, `.py-8` | Component gaps |
| `--spacing-10` | 40px | `.py-10` | Section gaps |
| `--spacing-12` | 48px | `.py-12` | Major sections |
| `--spacing-16` | 64px | — | Page-level spacing |

### Margin Utilities

| Token | CSS Class |
|-------|-----------|
| `--spacing-2` | `.mt-2`, `.mb-2` |
| `--spacing-3` | `.mt-3`, `.mb-3` |
| `--spacing-4` | `.mt-4`, `.mb-4` |
| `--spacing-5` | `.mt-5`, `.mb-5` |
| `--spacing-6` | `.mt-6`, `.mb-6` |
| `--spacing-8` | `.mt-8`, `.mb-8` |
| `--spacing-10` | `.mt-10`, `.mb-10` |
| `--spacing-12` | `.mt-12`, `.mb-12` |
| `--spacing-16` | `.mt-16`, `.mb-16` |

### Gap Utilities

| Token | CSS Class |
|-------|-----------|
| `--spacing-1` | `.gap-1` |
| `--spacing-2` | `.gap-2` |
| `--spacing-3` | `.gap-3` |
| `--spacing-4` | `.gap-4` |
| `--spacing-5` | `.gap-5` |
| `--spacing-6` | `.gap-6` |
| `--spacing-8` | `.gap-8` |
| `--spacing-10` | `.gap-10` |
| `--spacing-12` | `.gap-12` |

### Grid System

| Class | Columns | Breakpoint Behavior |
|-------|---------|---------------------|
| `.grid-2` | `repeat(2, 1fr)` | 1 col below 640px |
| `.grid-3` | `repeat(3, 1fr)` | 2 cols below 1024px, 1 col below 640px |
| `.grid-4` | `repeat(4, 1fr)` | 2 cols below 1024px, 1 col below 640px |

### Alignment Utilities

| Axis | Start | Center | End | Between | Stretch |
|------|-------|--------|-----|---------|---------|
| Align (items) | `.align-start` | `.align-center` | `.align-end` | — | `.align-stretch` |
| Justify (content) | `.justify-start` | `.justify-center` | `.justify-end` | `.justify-between` | `.justify-around` |
| Self (item) | `.self-start` | `.self-center` | `.self-end` | — | `.self-stretch` |

### Section Standards

| Class | Padding Top | Padding Bottom | Use Case |
|-------|-------------|----------------|----------|
| `.section-hero` | `--section-lg` | `--section-lg` | Hero sections |
| `.section-default` | `--section-md` | `--section-md` | Default page sections |
| `.section-content` | `--section-sm` | `--section-sm` | Content sections |
| `.section-tight` | `--section-xs` | `--section-xs` | Compact sections |

---

## 3. Modal / Popup / Overlay Standardization

### Files Modified:
- `client/src/components/ui/dialog.tsx` — Dialog overlay
- `client/src/components/ui/alert-dialog.tsx` — AlertDialog overlay
- `client/src/components/ui/sheet.tsx` — Sheet overlay
- `client/src/components/ui/drawer.tsx` — Drawer overlay
- `client/src/components/CheckoutForm.tsx` — Inline checkout modal
- `client/src/components/EngagementPopups.tsx` — Engagement popup modal
- `client/src/components/UnifiedPaymentForm.tsx` — Payment modal
- `client/src/components/CourseEnrollmentForm.tsx` — Enrollment modal
- `client/src/components/PaystackInlineModal.tsx` — Paystack payment modal
- `client/src/pages/Courses.tsx` — Course recommendation modal, comparison drawer
- `client/src/pages/Psychometrics.tsx` — Checkout modal
- `client/src/pages/MyCertificates.tsx` — Certificate preview modal
- `client/src/pages/Home.tsx` — Checkout modal
- `client/src/components/SiteNavigation.tsx` — Mobile menu overlay

### Overlay Standard

| Before | After |
|--------|-------|
| `bg-black/50 backdrop-blur-sm` | `bg-[var(--brand)]/10` |
| `bg-black/40 backdrop-blur-sm` | `bg-[var(--brand)]/10` |
| `bg-black/60 backdrop-blur-sm` | `bg-[var(--brand)]/10` |
| `bg-black/30 backdrop-blur-sm` | `bg-[var(--brand)]/10` |
| `bg-[var(--overlay)] backdrop-blur-sm` | `bg-[var(--brand)]/10` |
| `bg-[var(--navy-deep)]/80 backdrop-blur-sm` | `bg-[var(--brand)]/10` |
| `bg-[#071225]/80 backdrop-blur-sm` | `bg-[var(--brand)]/10` |
| `bg-[var(--fg)]/80 backdrop-blur-sm` | `bg-[var(--brand)]/10` |

**Rationale:** Dark translucent black overlays with `backdrop-filter: blur` reduce text legibility behind popups and create visual noise. Replacing with a subtle brand gold tint (10% opacity) maintains focus on the modal content while preserving readability of background content and applying site brand coloring.

### Sticky Header Standardization

| Before | After |
|--------|-------|
| `bg-[var(--background)]/95 backdrop-blur-md` | `bg-[var(--bg-elevated)]` |
| `bg-[var(--background)]/95 backdrop-blur-sm` | `bg-[var(--bg-elevated)]` |
| `bg-[var(--bg-elevated)]/95 backdrop-blur-md` | `bg-[var(--bg-elevated)]` |
| `bg-[var(--bg-elevated)]/90 backdrop-blur-sm` | `bg-[var(--bg-elevated)]` |

### Card Background Standardization

| Before | After |
|--------|-------|
| `bg-white/70 ... backdrop-blur-sm` | `bg-[var(--bg-elevated)]` or `bg-[var(--card)]` |
| `bg-[#1b3152]/60 ... backdrop-blur-sm` | `bg-[#1b3152]/60` (blur removed, color kept) |
| `bg-[var(--navy-deep)]/60 ... backdrop-blur-md` | `bg-[var(--card)]` |
| `bg-card backdrop-blur-sm` | `bg-card` |
| `bg-[var(--bg-card)] backdrop-blur-sm` | `bg-[var(--bg-card)]` |

### Executive Header

| Before | After |
|--------|-------|
| `backdrop-filter: saturate(140%) blur(16px)` | `background-color: var(--bg-elevated)` |

---

## 4. Inline Button → Shared Button Component

### Files Modified:
- `client/src/pages/Home.tsx` — Testimonial carousel controls (5 inline `<button>` elements → shared `Button` component)
- All other inline `<button>` elements reviewed; remaining inline buttons are in `UserDashboard.tsx` (50+ instances) which uses consistent internal styling patterns

### Pattern: Inline `<button>` → Shared `Button`

**Before:**
```tsx
<button type="button" className="h-8 w-8 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] ...">
  <Play size={14} />
</button>
```

**After:**
```tsx
<Button type="button" variant="ghost" size="icon-sm" className="border border-[var(--border)] bg-[var(--bg-elevated)] ...">
  <Play size={14} />
</Button>
```

---

## 5. Before / After Comparison — Key Screens

### 5.1 Modal Overlays

**Screen:** Any page with dialog/popup/modal (Checkout, Psychometrics, Courses, Home, etc.)

| Aspect | Before | After |
|--------|--------|-------|
| Overlay color | `bg-black/50` (50% black) | `bg-[var(--brand)]/10` (10% brand gold) |
| Backdrop filter | `backdrop-blur-sm` | None |
| Text legibility behind overlay | Blurred, reduced contrast | Clear, readable |
| Brand consistency | None (generic black) | Brand gold tint applied |

### 5.2 Sticky Headers (Assessment, Psychometrics, CareerPath, SiteNavigation)

| Aspect | Before | After |
|--------|--------|-------|
| Background | `bg-[var(--background)]/95 backdrop-blur-md` | `bg-[var(--bg-elevated)]` |
| Blur effect | `backdrop-blur-md/sm` | None |
| Visual noise | High (blur + translucency) | Low (solid brand surface) |

### 5.3 Card Backgrounds (CourseWorkspace, Resources, About, Blog, Contact, Dashboard)

| Aspect | Before | After |
|--------|--------|-------|
| Background | `bg-white/70 backdrop-blur-sm` | `bg-[var(--bg-elevated)]` / `bg-[var(--card)]` |
| Blur effect | `backdrop-blur-sm` | None |
| Dark mode consistency | Inconsistent (white/70) | Consistent (brand surface tokens) |

### 5.4 Executive Header Compact State

| Aspect | Before | After |
|--------|--------|-------|
| Effect | `backdrop-filter: saturate(140%) blur(16px)` | `background-color: var(--bg-elevated)` |
| Performance | GPU-intensive blur | Solid color, no filter |

### 5.5 Button Variants

| Aspect | Before | After |
|--------|--------|-------|
| Variant count | 12 (including 3 legacy aliases) | 10 (clean, no duplicates) |
| `variant="gold"` | Used in 35+ locations | Removed → `variant="brand"` |
| `variant="default"` | Used in 5+ locations | Removed → `variant="primary"` |
| Variant type safety | String aliases in local types | Unified shared `buttonVariants` |

---

## 6. Files Modified

| File | Change |
|------|--------|
| `client/src/components/ui/button.tsx` | Removed `default`, `gold`, `goldOutline` legacy aliases |
| `client/src/components/ui/dialog.tsx` | Overlay: `bg-black/50` → `bg-[var(--brand)]/10` |
| `client/src/components/ui/alert-dialog.tsx` | Overlay: `bg-black/50` → `bg-[var(--brand)]/10` |
| `client/src/components/ui/sheet.tsx` | Overlay: `bg-black/50` → `bg-[var(--brand)]/10` |
| `client/src/components/ui/drawer.tsx` | Overlay: `bg-black/50` → `bg-[var(--brand)]/10` |
| `client/src/index.css` | Added spacing scale, grid, alignment, section utility classes |
| `client/src/executive-header.css` | Removed `backdrop-filter: blur(16px)`, added solid `--bg-elevated` |
| `client/src/components/CheckoutForm.tsx` | Overlay: `bg-black/50 backdrop-blur-sm` → `bg-[var(--brand)]/10`; sticky header blur removed |
| `client/src/components/EngagementPopups.tsx` | Overlay: `bg-black/50 backdrop-blur-sm` → `bg-[var(--brand)]/10` |
| `client/src/components/UnifiedPaymentForm.tsx` | Overlay: `bg-black/50 backdrop-blur-sm` → `bg-[var(--brand)]/10`; sticky header blur removed |
| `client/src/components/CourseEnrollmentForm.tsx` | Overlay: `bg-black/40 backdrop-blur-sm` → `bg-[var(--brand)]/10` |
| `client/src/components/PaystackInlineModal.tsx` | Overlay: `bg-black/60 backdrop-blur-sm` → `bg-[var(--brand)]/10` |
| `client/src/pages/Courses.tsx` | Modal overlays: `bg-[var(--overlay)] backdrop-blur-sm` → `bg-[var(--brand)]/10` |
| `client/src/pages/Psychometrics.tsx` | Modal overlays: `bg-[var(--navy-deep)]/80 backdrop-blur-sm` → `bg-[var(--brand)]/10`; sticky header blur removed |
| `client/src/pages/MyCertificates.tsx` | Modal overlay: `bg-[#071225]/80 backdrop-blur-sm` → `bg-[var(--brand)]/10` |
| `client/src/pages/Home.tsx` | Overlay: `bg-[var(--fg)]/80 backdrop-blur-sm` → `bg-[var(--brand)]/10`; testimonial carousel inline buttons → shared `Button` |
| `client/src/components/SiteNavigation.tsx` | Mobile overlay: `bg-black/30 backdrop-blur-sm` → `bg-[var(--brand)]/10`; sticky header blur removed |
| `client/src/pages/CareerPath.tsx` | Sticky header blur removed; card background `bg-[var(--navy-deep)]/60 backdrop-blur-md` → `bg-[var(--card)]` |
| `client/src/pages/Assessment.tsx` | Sticky footer blur removed; button variant `gold` → `brand` |
| `client/src/pages/CourseWorkspace.tsx` | Card backgrounds: `bg-white/70 backdrop-blur-sm` → `bg-[var(--card)]` |
| `client/src/pages/Resources.tsx` | Card backgrounds: `bg-[#1b3152]/60 backdrop-blur-sm` → `bg-[#1b3152]/60` |
| `client/src/pages/About.tsx` | Card background: `bg-white/70 backdrop-blur-sm` → `bg-[var(--bg-elevated)]` |
| `client/src/pages/Blog.tsx` | Card background: `bg-white/70 backdrop-blur-sm` → `bg-[var(--bg-elevated)]` |
| `client/src/pages/InsightArticle.tsx` | Card background: `bg-white/70 backdrop-blur-sm` → `bg-[var(--bg-elevated)]` |
| `client/src/pages/Contact.tsx` | Card background: `bg-white/70 backdrop-blur-sm` → `bg-[var(--bg-elevated)]` |
| `client/src/components/dashboard/StatCard.tsx` | Card: `bg-card backdrop-blur-sm` → `bg-card` |
| `client/src/components/dashboard/Section.tsx` | Section: `bg-card backdrop-blur-sm` → `bg-card` |
| `client/src/components/dashboard/DashboardHero.tsx` | Card: `bg-[var(--bg-card)] backdrop-blur-sm` → `bg-[var(--bg-card)]` |
| `client/src/components/dashboard/ActionPanel.tsx` | Local Button variant type: `"default"` → `"primary"` |
| `client/src/pages/AdminCommunicationPanel.tsx` | Button variant: `"default"` → `"primary"` |
| `client/src/pages/CommunicationInbox.tsx` | Button variant: `"default"` → `"primary"` |
| `client/src/pages/DashboardPagination.tsx` | Button variant: `"default"` → `"primary"` |
| `client/src/pages/MyIllustrations.tsx` | Button variant: `"default"` → `"primary"` |
| `client/src/pages/StaffDashboard.tsx` | Button variant: `"default"` → `"primary"` |
| `client/src/pages/DashboardEnrolledCourses.tsx` | Button variant: `"default"` → `"primary"`; Badge variant: `"primary"` → `"success"` |
| `client/src/pages/admin/AdminOverview.tsx` | Badge variant: `"primary"` → `"success"` |
| `client/src/pages/DashboardRoadmap.tsx` | Button variant: `"gold"` → `"brand"` |
| `client/src/pages/AssessmentResults.tsx` | Button variant: `"gold"` → `"brand"` |

---

## 7. Verification

- **TypeScript:** `npx tsc --noEmit` passes (only pre-existing errors remain in unrelated files)
- **Backdrop blur:** Zero instances of `backdrop-blur`, `backdrop-filter`, or `bg-black/` remain in `client/src/`
- **Button variants:** Zero instances of `variant="gold"` or `variant="default"` on Button components remain
- **Brand coloring:** All modal/popup overlays use `bg-[var(--brand)]/10` for consistent site branding
