# Profound IQ Executive Rebranding Specification
**Inspired by:** Professional research organizations (indepthresearch.org standard)  
**Brand Anchor:** Profound IQ Logo (Gold/Navy)  
**Version:** 3.0 — Executive Standard  
**Date:** 2026-11-24

---

## 1. EXECUTIVE DESIGN PRINCIPLES

| Principle | Standard |
|-----------|----------|
| **Authority** | Every element conveys expertise, credibility, trust |
| **Clarity** | Information hierarchy is immediately scannable |
| **Restraint** | Color, motion, decoration used only with purpose |
| **Precision** | 8px base grid, fluid clamp scales, optical alignment |
| **Accessibility** | WCAG AAA text, AA UI, reduced-motion respect |

---

## 2. EXECUTIVE COLOR PALETTE (OKLCH)

### Light Mode (Default)
| Role | Token | Value | Hex (approx) | Usage |
|------|-------|-------|--------------|-------|
| **Background** | `--bg` | `oklch(0.985 0.003 85)` | #FAFAF8 | Page background — warm paper |
| **Surface** | `--bg-elevated` | `oklch(1 0 0)` | #FFFFFF | Cards, modals |
| **Surface Sunken** | `--bg-sunken` | `oklch(0.96 0.005 85)` | #F2F1ED | Inputs, subtle depth |
| **Text Primary** | `--fg` | `oklch(0.12 0.015 260)` | #1A1A2E | Headings, body — WCAG AAA |
| **Text Secondary** | `--fg-muted` | `oklch(0.35 0.01 260)` | #545466 | Supporting text — WCAG AA |
| **Text Tertiary** | `--fg-subtle` | `oklch(0.5 0.008 260)` | #7D7D8E | Captions, disabled |
| **Brand Primary** | `--brand` | `oklch(0.55 0.15 75)` | #B8860B | Primary actions, links |
| **Brand Hover** | `--brand-hover` | `oklch(0.5 0.16 75)` | #A0720A | Hover states |
| **Brand Light** | `--brand-light` | `oklch(0.65 0.13 75)` | #D4A843 | Gradients, highlights |
| **Brand Muted** | `--brand-muted` | `oklch(0.55 0.15 75 / 0.08)` | 8% opacity | Badges, subtle accents |
| **Success** | `--success` | `oklch(0.48 0.14 155)` | #2E8B57 | Positive states |
| **Warning** | `--warning` | `oklch(0.62 0.18 85)` | #D4A01E | Caution, developing |
| **Danger** | `--danger` | `oklch(0.52 0.2 25)` | #C0392B | Errors, priority |
| **Border Subtle** | `--border` | `oklch(0.2 0.015 260 / 0.08)` | 8% | Dividers, cards |
| **Border Strong** | `--border-strong` | `oklch(0.2 0.015 260 / 0.15)` | 15% | Emphasized divisions |
| **Focus** | `--border-focus` | `var(--brand)` | — | Focus rings |

### Dark Mode
| Role | Token | Value |
|------|-------|-------|
| `--bg` | `oklch(0.085 0.025 260)` | #0D111E |
| `--bg-elevated` | `oklch(0.12 0.025 260)` | #1A1F35 |
| `--fg` | `oklch(0.96 0.01 85)` | #F5F4F0 |
| `--fg-muted` | `oklch(0.68 0.01 260)` | #A8A8B8 |
| `--brand` | `oklch(0.68 0.14 75)` | #D4A843 |
| `--border` | `oklch(1 0 0 / 0.06)` | 6% white |

---

## 3. TYPOGRAPHY SYSTEM

### Font Families
| Role | Family | Weights | Features |
|------|--------|---------|----------|
| **Display** | **Fraunces** | 400, 600 | `cv02, cv03, cv04, cv11, ss01` |
| **Body** | **Manrope** | 400, 500, 600, 700, 800 | Standard |
| **Mono** | **JetBrains Mono** | 400, 500, 600 | Code, data |

### Fluid Scale (clamp-based, no breakpoints needed)
```css
--text-fluid-xs: clamp(0.7rem, 0.8vw + 0.4rem, 0.85rem);
--text-fluid-sm: clamp(0.8rem, 0.9vw + 0.5rem, 1rem);
--text-fluid-base: clamp(0.95rem, 1vw + 0.6rem, 1.15rem);
--text-fluid-lg: clamp(1.1rem, 1.2vw + 0.7rem, 1.4rem);
--text-fluid-xl: clamp(1.25rem, 1.5vw + 0.8rem, 1.8rem);
--text-fluid-2xl: clamp(1.5rem, 2vw + 1rem, 2.5rem);
--text-fluid-3xl: clamp(1.75rem, 2.5vw + 1.2rem, 3.5rem);
--text-fluid-4xl: clamp(2rem, 3vw + 1.5rem, 4.5rem);
--text-fluid-5xl: clamp(2.5rem, 4vw + 2rem, 6rem);
```

### Heading Clamps
| Level | Size | Line Height | Tracking | Font | Weight |
|-------|------|-------------|----------|------|--------|
| H1 | `clamp(2.25rem, 4vw + 1.2rem, 5rem)` | 1.0 | -0.04em | Fraunces | 600 |
| H2 | `clamp(1.75rem, 3vw + 1rem, 3.5rem)` | 1.05 | -0.03em | Fraunces | 600 |
| H3 | `clamp(1.375rem, 2.2vw + 0.8rem, 2.5rem)` | 1.1 | -0.02em | Fraunces | 600 |
| H4 | `clamp(1.125rem, 1.8vw + 0.7rem, 2rem)` | 1.15 | -0.01em | Fraunces | 600 |

### Body Styles
| Style | Size | Line Height | Font | Weight |
|-------|------|-------------|------|--------|
| Lead | `clamp(1.125rem, 1.3vw + 0.7rem, 1.5rem)` | 1.65 | Manrope | 400 |
| Default | 1rem | 1.7 | Manrope | 400 |
| Small | 0.875rem | 1.6 | Manrope | 400 |
| Caption | 0.75rem | 1.5 | Manrope | 400 |
| Eyebrow | 0.625rem | 1 | Manrope | 700 (uppercase, 0.15em tracking) |

---

## 4. SPACING & LAYOUT SYSTEM

### Base Unit: 8px (0.5rem)

### Harmonic Scale
| Token | Value | Use Case |
|-------|-------|----------|
| `--space-1` | 4px | Icon gaps |
| `--space-2` | 8px | Base inline |
| `--space-3` | 12px | Form fields |
| `--space-4` | 16px | Component padding |
| `--space-5` | 20px | Card internal |
| `--space-6` | 24px | Section rhythm |
| `--space-8` | 32px | Component gaps |
| `--space-10` | 40px | Section gaps |
| `--space-12` | 48px | Major sections |
| `--space-16` | 64px | Page-level |

### Section Padding (fluid)
```css
--section-xs: clamp(2rem, 4vw, 3rem);      /* 32-48px */
--section-sm: clamp(3rem, 6vw, 5rem);      /* 48-80px */
--section-md: clamp(5rem, 10vw, 8rem);     /* 80-128px */
--section-lg: clamp(7rem, 14vw, 12rem);    /* 112-192px */
--section-xl: clamp(10rem, 20vw, 16rem);   /* 160-256px */
```

### Container System
```css
.container { max-width: 1200px; padding: 0 clamp(1.5rem, 4vw, 4rem); }
.container-wide { max-width: 1400px; padding: 0 clamp(2rem, 5vw, 6rem); }
.container-narrow { max-width: 800px; padding: 0 clamp(1.5rem, 3vw, 2rem); }
```

---

## 5. COMPONENT SPECIFICATIONS

### 5.1 Buttons

#### Variants (10 total)

| Variant | Background | Text | Border | Hover | Use Case |
|---------|------------|------|--------|-------|----------|
| **Primary** | `--brand` | `--brand-fg` | none | `--brand-hover` + shadow | Primary CTAs |
| **Secondary** | `--bg-sunken` | `--fg` | `--border` | `--bg-sunken/0.8` | Secondary |
| **Outline** | transparent | `--fg` | 2px `--border` | `--bg-sunken` + `--brand` border | Tertiary |
| **Ghost** | transparent | `--fg-muted` | none | `--bg-sunken` | Low emphasis |
| **Brand** | `--brand` | `--brand-fg` | none | `--brand-hover` | Hero CTAs (uppercase, 700) |
| **Brand Outline** | transparent | `--brand` | 2px `--brand` | `--brand` bg | Alternative primary |
| **Subtle** | `--bg-sunken` | `--fg-muted` | none | `--bg-sunken/0.8` | Low contrast |
| **Success** | `--success` | white | none | `--success-hover` | Confirmations |
| **Danger** | `--danger` | white | none | `--danger-hover` | Destructive |
| **Link** | transparent | `--brand` | none | underline | Text links |

#### Sizes
| Size | Height | Padding X | Font Size | Gap |
|------|--------|-----------|-----------|-----|
| `sm` | 40px | 1rem | 0.8125rem | 0.375rem |
| `default` | 48px | 1.5rem | 0.875rem | 0.5rem |
| `lg` | 56px | 2rem | 1rem | 0.625rem |
| `xl` | 64px | 2.5rem | 1.125rem | 0.75rem |

#### States
| State | Transform | Shadow | Opacity |
|-------|-----------|--------|---------|
| Hover | none | `0 8px 24px var(--brand)/0.15` (primary) | 1 |
| Active | `scale(0.98)` | — | 1 |
| Disabled | none | — | 0.4 |
| Focus Visible | — | `2px solid var(--border-focus)` offset 3px | 1 |

---

### 5.2 Inputs

```css
.input-base {
  height: 56px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  padding: 0 1rem;
  font-size: 1rem;
  transition: border-color 180ms, box-shadow 180ms;
}
.input-base:focus-visible {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px var(--ring);
}
.input-base[aria-invalid="true"] {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px var(--danger) / 0.15;
}
```

### 5.3 Cards

```css
.card-base {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-xs);
  transition: box-shadow 200ms, border-color 200ms;
}
.card-base:hover { box-shadow: var(--shadow-md); }
```

#### Variants
| Variant | Border | Shadow | Left Accent |
|---------|--------|--------|-------------|
| Default | 1px `--border` | `xs` | — |
| Elevated | 1px `--border` | `md` | — |
| Brand | 2px `--brand` | `0 0 0 1px var(--brand)/0.1` | — |
| Success | 1px `--border` | `xs` | 4px `--success` |
| Warning | 1px `--border` | `xs` | 4px `--warning` |
| Danger | 1px `--border` | `xs` | 4px `--danger` |

---

### 5.4 Progress Bars

#### Determinate
- Height: 6px (default), 4px (sm), 8px (lg)
- Radius: 9999px
- Fill transition: `width 600ms cubic-bezier(0.22, 1, 0.36, 1)`
- Color mapping: `--brand` (default), `--success` (≥70), `--warning` (50-69), `--danger` (<50)

#### Indeterminate
```css
.progress-bar__indeterminate {
  animation: indeterminate 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
@keyframes indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
```

### 5.5 Progress Rings

| Size | Diameter | Stroke | Use Case |
|------|----------|--------|----------|
| `sm` | 56px | 4px | Inline, cards |
| `default` | 72px | 6px | Section headers |
| `lg` | 96px | 7px | Dashboard hero |
| `xl` | 144px | 8px | Hero, certificates |

---

### 5.6 Badges

```css
.badge {
  display: inline-flex;
  align-items: center; gap: 6px;
  border-radius: 9999px;
  padding: 4px 10px;
  font-size: 0.625rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em;
}
```

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| `brand` | `--brand` / 0.08 | `--brand` | none |
| `success` | `--success` / 0.1 | `--success` | none |
| `warning` | `--warning` / 0.1 | `--warning` | none |
| `danger` | `--danger` / 0.1 | `--danger` | none |
| `neutral` | `--bg-sunken` | `--fg-muted` | 1px `--border` |

---

## 6. SECTION LAYOUTS

### Grid Systems
```css
/* Split */
.grid-split { grid-template-columns: 1fr 1fr; gap: 48px; }
.grid-split-asym { grid-template-columns: 1fr 1.5fr; gap: 48px; }
.grid-3col { grid-template-columns: repeat(3, 1fr); gap: 32px; }
.grid-4col { grid-template-columns: repeat(4, 1fr); gap: 32px; }

@media (max-width: 1024px) {
  .grid-split, .grid-split-asym { grid-template-columns: 1fr; }
  .grid-3col, .grid-4col { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .grid-3col, .grid-4col { grid-template-columns: 1fr; }
}
```

### Section Padding
```css
.section-hero { padding-block: var(--section-xl); }
.section-default { padding-block: var(--section-lg); }
.section-content { padding-block: var(--section-md); }
.section-tight { padding-block: var(--section-sm); }
```

### Header Styles
| Type | Padding | Border | Max Width | Align |
|------|---------|--------|-----------|-------|
| Hero | `section-xl` | none | 900px | center |
| Section | `section-lg` | 1px bottom | — | left |
| Minimal | `section-sm` | none | — | left |

---

## 7. ILLUSTRATION & ICON GUIDELINES

### Visual Language (Logo-Derived)
- **Stroke:** 1.5px, rounded caps/joins
- **Accent:** Gold (`--brand`) for key elements
- **Angles:** 45° consistency
- **Radius:** 16px (matches `--radius-xl`)
- **Shapes:** Circles, rounded rectangles, hexagons
- **Palette:** Navy (`--fg`), Gold (`--brand`), Warm Paper (`--bg`), Muted (`--fg-subtle`)

### Icon Specs
| Property | Value |
|----------|-------|
| Stroke Width | 1.5px |
| Linecap/Linejoin | round |
| Fill | none |
| Color | `currentColor` |

### Sizes
| Token | Size | Use Case |
|-------|------|----------|
| `icon-sm` | 16px | Inline, buttons |
| `icon` | 20px | UI controls |
| `icon-lg` | 24px | Section headers |
| `icon-xl` | 32px | Features |
| `icon-hero` | 64px | Hero sections |

### Executive Motif Library
| Motif | Meaning | Construction |
|-------|---------|--------------|
| Interlocking Hexagons | Connection, Integration | 6×, shared edges |
| Upward Sparklines | Growth, Progress | 45° ascending |
| Concentric Circles | Depth, Insight | 3 rings, 2px gap |
| Neuron/Node Graph | Intelligence | Geometric nodes |
| Bridge/Arch | Transition | Curved path, 45° supports |

---

## 8. MOTION & INTERACTION

### Durations
| Token | Value | Use Case |
|-------|-------|----------|
| `--dur-fast` | 150ms | Micro-interactions |
| `--dur-base` | 200ms | Default transitions |
| `--dur-slow` | 300ms | Card hover, modals |
| `--dur-enter` | 600ms | Page enter |
| `--dur-exit` | 400ms | Page exit |

### Easings
| Token | Value |
|-------|-------|
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--ease-in` | `cubic-bezier(0.55, 0, 0.68, 0.19)` |
| `--ease-spring` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` |

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. EXECUTIVE HOME PAGE REBRAND

### Hero Section
```tsx
<section className="section-hero bg-[var(--bg)]">
  <div className="container-narrow">
    <p className="eyebrow text-[var(--brand)]">Evidence-based capability development</p>
    <h1 className="heading-1 text-[var(--fg)]">
      See the patterns behind your <em className="text-[var(--brand)]">potential</em>
    </h1>
    <p className="lead text-[var(--fg-muted)] mt-6 max-w-2xl">
      100 prompts. 10 dimensions. 25 minutes. Free forever.
    </p>
    {/* Three pillars */}
    <div className="grid grid-3col mt-12">
      <Pillar icon={Sparkles} title="Evidence-based" desc="Validated psychometric framework" />
      <Pillar icon={Shield} title="Private by design" desc="Encrypted. Your data, your control." />
      <Pillar icon={Sparkles} title="Free forever" desc="No payment. No subscriptions." />
    </div>
    {/* Single CTA */}
    <Button variant="brand" size="xl" className="mt-10 w-full sm:w-auto">
      Begin your assessment <ArrowRight size={20} />
    </Button>
    {/* Trust line */}
    <div className="mt-16 flex items-center gap-4 text-sm text-[var(--fg-subtle)]">
      <div className="flex -space-x-2">avatars</div>
      <span>10,000+ professionals across 500+ organizations</span>
    </div>
  </div>
</section>
```

### Pathways Section
```tsx
<section className="section-default">
  <div className="container-narrow">
    <header className="mb-12 text-center">
      <p className="eyebrow text-[var(--brand)]">Development pathways</p>
      <h2 className="heading-2">Choose your starting point</h2>
    </header>
    <div className="grid grid-3col">
      <PathwayCard 
        title="For Me" 
        icon={User} 
        desc="Self Assessment, Psychometrics, Courses"
        cta="Start Free Assessment"
        href="/assessment"
      />
      <PathwayCard 
        title="For My Team" 
        icon={Users} 
        desc="CareerPath, Leadership Courses, Consulting"
        cta="Explore Team Solutions"
        href="/school-solutions"
      />
      <PathwayCard 
        title="For My Organization" 
        icon={Building} 
        desc="Institutional Programs, Bulk Assessments"
        cta="Contact Sales"
        href="/contact"
      />
    </div>
  </div>
</section>
```

### Trust & Credibility Section
```tsx
<section className="section-tight bg-[var(--bg-sunken)]">
  <div className="container-wide">
    <div className="grid grid-4col items-center gap-8">
      <Stat value="10,000+" label="Assessments completed" />
      <Stat value="500+" label="Organizations trust us" />
      <Stat value="94%" label="Completion rate" />
      <Stat value="4.8/5" label="Satisfaction score" />
    </div>
  </div>
</section>
```

---

## 10. ASSESSMENT PAGE REBRAND

### Intro Stage
- Single viewport: Hero + Form side-by-side (desktop)
- Three pillars instead of 7 benefits
- Condensed trust bar (single line)
- Collapsible resume section
- Form sticky on desktop

### Questions Stage
- Module progress ring (top)
- One question at a time, centered
- Auto-advance with subtle celebration
- Module overview drawer

### Results Stage
- Executive summary personalized by name/score
- Dimension grid: 4-col XL / 3-col LG / 2-col MD
- Color-coded: Green ≥70, Amber 50-69, Red <50
- Integrated course recommendations per dimension

---

## 11. COURSES PAGE REBRAND

### Catalog Grid
- 3-col desktop, 2-col tablet, 1-col mobile
- Elevated cards with hover lift
- Price, duration, completion rate badges
- Module count, level indicator

### Filtering
- Collapsible sidebar (desktop) / bottom sheet (mobile)
- Category, level, duration, price range
- URL-synced filters

---

## 12. NAVIGATION & FOOTER REBRAND

### Navigation
- Logo: 32px height, gold accent
- Links: 14px, 500 weight, 12px gap
- CTA: `variant="brand"` size="sm"
- Mobile: Full-screen drawer, staggered entrance

### Footer
```tsx
<footer className="section-lg bg-[var(--bg-sunken)] border-t border-[var(--border)]">
  <div className="container grid grid-4col gap-12">
    <BrandColumn />
    <NavColumn title="Products" links={['Assessment','Courses','Psychometrics','CareerPath']} />
    <NavColumn title="Company" links={['About','Careers','Blog','Press']} />
    <ContactColumn />
  </div>
  <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between gap-4">
    <p className="text-sm text-[var(--fg-subtle)]">© 2024 Profound IQ Consulting. All rights reserved.</p>
    <nav className="flex gap-6 text-sm text-[var(--fg-muted)]">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/contact">Contact</a>
    </nav>
  </div>
</footer>
```

---

## 13. IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Complete)
- [x] Design tokens (brand-system.json, brand-system.css)
- [x] Component base styles (buttons, inputs, cards, badges)
- [x] Typography scales, spacing, motion tokens

### Phase 2: Core Pages
- [ ] Home page rebrand
- [ ] Assessment page rebrand (intro, questions, results)
- [ ] Courses page rebrand
- [ ] Navigation & Footer rebrand

### Phase 3: Component Library
- [ ] Button, Input, Card, Badge, ProgressBar, ProgressRing
- [ ] Modal, Sheet, Dialog, Tooltip, Dropdown
- [ ] Table, Tabs, Accordion, Toast

### Phase 4: Polish
- [ ] Dark mode refinement
- [ ] Reduced-motion testing
- [ ] Cross-browser testing
- [ ] Performance audit

---

## 14. USAGE NOTES

### Import Order
```css
/* global.css */
@import './brand-system.css';  /* tokens first */
@import './components.css';    /* component base classes */
@import './utilities.css';     /* utilities last */
```

### Component Composition
```tsx
// Primary CTA
<Button variant="brand" size="xl">Begin your assessment</Button>

// Form field
<Input id="email" name="email" type="email" placeholder="you@example.com" required />

// Progress indicator
<div className="progress-bar progress-bar--brand" role="progressbar" aria-valuenow={65}>
  <div className="progress-bar__fill" style={{ width: '65%' }} />
</div>

// Metric card
<Card className="card-base card--success">
  <p className="eyebrow text-[var(--brand)]">Highest</p>
  <p className="text-display text-2xl font-bold text-[var(--success)]">Strategic Thinking</p>
  <p className="text-sm text-[var(--fg-muted)]">87/100</p>
</Card>
```

### Do's ✅
- Use semantic tokens (`--brand`, `--fg-muted`) not raw values
- Use fluid clamp scales for all typography/spacing
- Use `var(--brand)` for primary actions
- Use `--fg-muted` for secondary text
- Use `--bg-sunken` for input backgrounds

### Don'ts ❌
- Hardcode hex colors
- Use fixed pixel sizes for typography
- Use `white`/`black` for backgrounds/text
- Remove focus outlines
- Use `transition: all`

---

*End of Specification v3.0*