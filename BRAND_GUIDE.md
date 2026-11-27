# Profound IQ Executive Brand System — Component Style Guide

**Version:** 2.1.0 | **Color Space:** OKLCH | **Base Unit:** 8px

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Specifications](#component-specifications)
   - [Buttons](#buttons)
   - [Inputs](#inputs)
   - [Progress Bars](#progress-bars)
   - [Progress Rings](#progress-rings)
   - [Borders & Dividers](#borders--dividers)
   - [Cards](#cards)
   - [Badges](#badges)
6. [Section Layouts](#section-layouts)
7. [Illustration & Icon Guidelines](#illustration--icon-guidelines)
8. [Accessibility](#accessibility)
9. [Usage Notes](#usage-notes)

---

## Design Principles

1. **Executive-Grade Contrast** — WCAG AAA (7:1) for text, AA (4.5:1) for UI elements
2. **Semantic Token Naming** — Purpose-based (e.g., `--brand`, `--fg-muted`), not value-based
3. **Fluid, Responsive Scales** — All sizing uses `clamp()` for proportional scaling
4. **Consistent Spacing Rhythm** — 8px base unit with harmonic scale
5. **Purposeful Motion** — Respects `prefers-reduced-motion`; transitions communicate state
6. **Subtle Backgrounds** — Neutral tones, low-opacity accents, generous whitespace
7. **Logo-Derived Visual Language** — Gold accent (#B8860B), Navy depth (#1A1A2E), warm paper (#FAFAF8)

---

## Color System

### Light Mode (Default)

| Token             | Value                        | Usage                           |
| ----------------- | ---------------------------- | ------------------------------- |
| `--bg`            | `oklch(0.985 0.003 85)`      | Page background — warm paper    |
| `--bg-elevated`   | `oklch(1 0 0)`               | Cards, modals, dropdowns        |
| `--bg-sunken`     | `oklch(0.96 0.005 85)`       | Input backgrounds, subtle depth |
| `--fg`            | `oklch(0.12 0.015 260)`      | Primary text — AAA on bg        |
| `--fg-muted`      | `oklch(0.35 0.01 260)`       | Secondary text — AA on bg       |
| `--fg-subtle`     | `oklch(0.5 0.008 260)`       | Tertiary, disabled text         |
| `--brand`         | `oklch(0.55 0.15 75)`        | Primary actions, links, focus   |
| `--brand-hover`   | `oklch(0.5 0.16 75)`         | Hover states                    |
| `--brand-muted`   | `oklch(0.55 0.15 75 / 0.12)` | Badges, subtle accents          |
| `--success`       | `oklch(0.48 0.14 155)`       | Positive states, completion     |
| `--warning`       | `oklch(0.62 0.18 85)`        | Caution, developing             |
| `--danger`        | `oklch(0.52 0.2 25)`         | Errors, priority items          |
| `--border`        | `oklch(0.2 0.015 260 / 0.1)` | Subtle divisions                |
| `--border-strong` | `oklch(0.2 0.015 260 / 0.2)` | Emphasized divisions            |
| `--border-focus`  | `var(--brand)`               | Focus rings, active inputs      |

### Dark Mode

| Token             | Value                    | Usage                     |
| ----------------- | ------------------------ | ------------------------- |
| `--bg`            | `oklch(0.095 0.025 260)` | Deep navy page background |
| `--bg-elevated`   | `oklch(0.13 0.028 260)`  | Cards, modals             |
| `--bg-sunken`     | `oklch(0.07 0.022 260)`  | Recessed areas            |
| `--fg`            | `oklch(0.96 0.01 85)`    | Warm white primary text   |
| `--fg-muted`      | `oklch(0.7 0.01 260)`    | Secondary text            |
| `--fg-subtle`     | `oklch(0.55 0.008 260)`  | Tertiary text             |
| `--brand`         | `oklch(0.68 0.14 75)`    | Lighter gold for dark bg  |
| `--border`        | `oklch(1 0 0 / 0.08)`    | Subtle divisions          |
| `--border-strong` | `oklch(1 0 0 / 0.16)`    | Emphasized divisions      |

---

## Typography

### Font Families

| Role        | Family         | Weights                 | Features                       |
| ----------- | -------------- | ----------------------- | ------------------------------ |
| **Display** | Fraunces       | 400, 600                | `cv02, cv03, cv04, cv11, ss01` |
| **Body**    | Manrope        | 400, 500, 600, 700, 800 | Standard                       |
| **Mono**    | JetBrains Mono | 400, 500, 600           | Code, data                     |

### Fluid Scale (clamp-based)

| Token               | Min     | Preferred      | Max     |
| ------------------- | ------- | -------------- | ------- |
| `--text-fluid-xs`   | 0.7rem  | 0.8vw + 0.4rem | 0.85rem |
| `--text-fluid-sm`   | 0.8rem  | 0.9vw + 0.5rem | 1rem    |
| `--text-fluid-base` | 0.95rem | 1vw + 0.6rem   | 1.15rem |
| `--text-fluid-lg`   | 1.1rem  | 1.2vw + 0.7rem | 1.4rem  |
| `--text-fluid-xl`   | 1.25rem | 1.5vw + 0.8rem | 1.8rem  |
| `--text-fluid-2xl`  | 1.5rem  | 2vw + 1rem     | 2.5rem  |
| `--text-fluid-3xl`  | 1.75rem | 2.5vw + 1.2rem | 3.5rem  |
| `--text-fluid-4xl`  | 2rem    | 3vw + 1.5rem   | 4.5rem  |
| `--text-fluid-5xl`  | 2.5rem  | 4vw + 2rem     | 6rem    |

### Heading Clamps

| Level | Size                                     | Line Height | Tracking | Font    | Weight |
| ----- | ---------------------------------------- | ----------- | -------- | ------- | ------ |
| H1    | `clamp(2rem, 3.5vw + 1.2rem, 4.5rem)`    | 1.02        | -0.04em  | Display | 600    |
| H2    | `clamp(1.5rem, 2.5vw + 1rem, 3rem)`      | 1.08        | -0.03em  | Display | 600    |
| H3    | `clamp(1.25rem, 2vw + 0.8rem, 2.25rem)`  | 1.12        | -0.02em  | Display | 600    |
| H4    | `clamp(1.1rem, 1.5vw + 0.7rem, 1.75rem)` | 1.15        | -0.01em  | Display | 600    |

### Body Styles

| Style   | Size                                    | Line Height | Font | Weight                           |
| ------- | --------------------------------------- | ----------- | ---- | -------------------------------- |
| Default | 1rem                                    | 1.7         | Body | 400                              |
| Lead    | `clamp(1.1rem, 1.2vw + 0.7rem, 1.4rem)` | 1.6         | Body | 400                              |
| Small   | 0.875rem                                | 1.5         | Body | 400                              |
| Caption | 0.75rem                                 | 1.5         | Body | 400                              |
| Eyebrow | 0.68rem                                 | 1           | Body | 800 (uppercase, 0.18em tracking) |

---

## Spacing & Layout

### Base Unit: 8px (0.5rem)

| Scale          | Value | Use Case                     |
| -------------- | ----- | ---------------------------- |
| `--spacing-0`  | 0     | Reset                        |
| `--spacing-1`  | 4px   | Icon gaps, tight spacing     |
| `--spacing-2`  | 8px   | Base unit, inline gaps       |
| `--spacing-3`  | 12px  | Form field gaps              |
| `--spacing-4`  | 16px  | Card padding, component gaps |
| `--spacing-5`  | 20px  | Section inner spacing        |
| `--spacing-6`  | 24px  | Section rhythm               |
| `--spacing-8`  | 32px  | Major section gaps           |
| `--spacing-10` | 40px  | Large section gaps           |
| `--spacing-12` | 48px  | Hero sections                |
| `--spacing-16` | 64px  | Page-level spacing           |

### Rhythm Classes

```css
.space-y-rhythm > * + * {
  margin-top: 1.5rem;
} /* 24px */
.space-y-rhythm-sm > * + * {
  margin-top: 1rem;
} /* 16px */
.space-y-rhythm-lg > * + * {
  margin-top: 2rem;
} /* 32px */
.space-y-rhythm-xl > * + * {
  margin-top: 3rem;
} /* 48px */
```

### Section Padding

```css
.section-py {
  padding-top: var(--section-md);
  padding-bottom: var(--section-md);
} /* 4-8rem */
.section-py-sm {
  padding-top: var(--section-sm);
  padding-bottom: var(--section-sm);
} /* 2.5-5rem */
.section-py-xs {
  padding-top: var(--section-xs);
  padding-bottom: var(--section-xs);
} /* 1.5-3rem */
```

### Container Widths

```css
.container {
  max-width: 1280px;
  padding: 0 clamp(1rem, 3vw, 3rem);
}
@media (min-width: 1024px) {
  .container {
    max-width: 1320px;
    padding: 0 clamp(2rem, 5vw, 6rem);
  }
}
```

---

## Component Specifications

### Buttons

#### Base Styles

```css
.btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 180ms ease-out;
  height: 2.5rem;
  padding: 0 1.25rem;
}
.btn-base:disabled {
  pointer-events: none;
  opacity: 0.5;
}
.btn-base:active {
  transform: scale(0.98);
}
```

#### Variants

| Variant           | Background    | Text         | Border         | Hover                            | Use Case                    |
| ----------------- | ------------- | ------------ | -------------- | -------------------------------- | --------------------------- |
| **Primary**       | `--brand`     | `--brand-fg` | none           | `--brand-hover` + shadow         | Primary CTAs                |
| **Secondary**     | `--bg-sunken` | `--fg`       | `--border`     | `--bg-sunken/0.8`                | Secondary actions           |
| **Outline**       | transparent   | `--fg`       | 2px `--border` | `--bg-sunken` + `--brand` border | Tertiary                    |
| **Ghost**         | transparent   | `--fg-muted` | none           | `--bg-sunken`                    | Low emphasis                |
| **Brand**         | `--brand`     | `--brand-fg` | none           | `--brand-hover`                  | Hero CTAs (uppercase, bold) |
| **Brand Outline** | transparent   | `--brand`    | 2px `--brand`  | `--brand` bg                     | Alternative primary         |
| **Subtle**        | `--bg-sunken` | `--fg-muted` | none           | `--bg-sunken/0.8`                | Low contrast                |
| **Success**       | `--success`   | white        | none           | `--success-hover`                | Positive confirmations      |
| **Danger**        | `--danger`    | white        | none           | `--danger-hover`                 | Destructive actions         |

#### Sizes

| Size      | Height  | Padding | Font Size | Gap      |
| --------- | ------- | ------- | --------- | -------- |
| `sm`      | 2.25rem | 1rem    | 0.75rem   | 0.375rem |
| `default` | 2.5rem  | 1.25rem | 0.875rem  | 0.5rem   |
| `lg`      | 2.75rem | 1.75rem | 1rem      | 0.625rem |
| `xl`      | 3rem    | 2rem    | 1.125rem  | 0.75rem  |
| `icon`    | 2.5rem  | 0       | —         | —        |

#### States

| State         | Transform     | Shadow                                     | Opacity |
| ------------- | ------------- | ------------------------------------------ | ------- |
| Hover         | none          | `0 10px 20px var(--brand)/0.2` (primary)   | 1       |
| Active        | `scale(0.98)` | —                                          | 1       |
| Disabled      | none          | —                                          | 0.5     |
| Focus Visible | —             | `2px solid var(--border-focus)` offset 3px | 1       |

---

### Inputs

#### Base Styles

```css
.input-base {
  height: 2.5rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid var(--border);
  background: var(--input-bg);
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  color: var(--fg);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition:
    color 180ms,
    box-shadow 180ms,
    border-color 180ms;
}
```

#### States

| State    | Border                | Box Shadow                    |
| -------- | --------------------- | ----------------------------- |
| Default  | `var(--border)`       | `0 1px 2px rgba(0,0,0,0.05)`  |
| Focus    | `var(--border-focus)` | `0 0 0 2px var(--ring)`       |
| Invalid  | `var(--danger)`       | `0 0 0 2px var(--danger)/0.2` |
| Disabled | `var(--border)`       | — (opacity 0.5)               |

#### Sizes

| Size      | Height | Padding           | Font Size |
| --------- | ------ | ----------------- | --------- |
| `sm`      | 2rem   | 0.375rem 0.625rem | 0.875rem  |
| `default` | 2.5rem | 0.5rem 0.75rem    | 1rem      |
| `lg`      | 3rem   | 0.625rem 1rem     | 1.125rem  |

---

### Progress Bars

#### Determinate

```html
<div
  class="progress-bar progress-bar--brand"
  role="progressbar"
  aria-valuenow="65"
  aria-valuemin="0"
  aria-valuemax="100"
>
  <div class="progress-bar__fill" style="width: 65%"></div>
</div>
```

| Property         | Value                                                     |
| ---------------- | --------------------------------------------------------- |
| Container height | 4px (default), 2px (sm), 6px (lg)                         |
| Border radius    | 9999px (pill)                                             |
| Fill transition  | `width 500ms cubic-bezier(0.22, 1, 0.36, 1)`              |
| Colors           | `--brand` (default), `--success`, `--warning`, `--danger` |

#### Color Mapping for Assessment Scores

| Score Range | Label      | Color       |
| ----------- | ---------- | ----------- |
| ≥70         | Strength   | `--success` |
| 50-69       | Developing | `--warning` |
| <50         | Priority   | `--danger`  |

#### Indeterminate

```html
<div class="progress-bar progress-bar--indeterminate">
  <div class="progress-bar__indeterminate"></div>
</div>
```

```css
.progress-bar__indeterminate {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 30%;
  background: var(--brand);
  border-radius: 9999px;
  animation: indeterminate 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}
```

---

### Progress Rings

| Size      | Diameter | Stroke | Use Case           |
| --------- | -------- | ------ | ------------------ |
| `sm`      | 48px     | 4px    | Inline, cards      |
| `default` | 64px     | 6px    | Section headers    |
| `lg`      | 80px     | 6px    | Dashboard hero     |
| `xl`      | 120px    | 8px    | Hero, certificates |

```html
<svg
  class="progress-ring"
  width="64"
  height="64"
  role="progressbar"
  aria-valuenow="75"
>
  <circle
    class="progress-ring__bg"
    r="29"
    cx="32"
    cy="32"
    fill="none"
    stroke="currentColor"
    stroke-width="6"
  />
  <circle
    class="progress-ring__fg"
    r="29"
    cx="32"
    cy="32"
    fill="none"
    stroke="currentColor"
    stroke-width="6"
    stroke-linecap="round"
    stroke-dasharray="182.2"
    stroke-dashoffset="45.5"
    style="transform-origin: center"
  />
</svg>
```

---

### Borders & Dividers

| Token             | Width | Style | Color                  | Radius     | Use Case          |
| ----------------- | ----- | ----- | ---------------------- | ---------- | ----------------- |
| `--border`        | 1px   | solid | `var(--border)`        | —          | Default divisions |
| `--border-strong` | 2px   | solid | `var(--border-strong)` | —          | Emphasized        |
| `--border-focus`  | 2px   | solid | `var(--brand)`         | 3px offset | Focus rings       |
| Card              | 1px   | solid | `var(--card-border)`   | 12px       | Cards             |
| Input             | 1px   | solid | `var(--input)`         | 6px        | Form fields       |
| Divider           | 1px   | solid | `var(--border)`        | —          | Section breaks    |

#### Status Borders (Left Accent)

```css
.card--success {
  border-left: 4px solid var(--success);
}
.card--warning {
  border-left: 4px solid var(--warning);
}
.card--danger {
  border-left: 4px solid var(--danger);
}
.card--brand {
  border-left: 4px solid var(--brand);
}
```

---

### Cards

#### Base

```css
.card-base {
  background: var(--card);
  color: var(--card-fg);
  border: 1px solid var(--card-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-xs);
  transition: all 180ms ease-out;
}
.card-base:hover {
  box-shadow: var(--shadow-md);
}
```

#### Variants

| Variant    | Border               | Shadow                       | Use Case          |
| ---------- | -------------------- | ---------------------------- | ----------------- |
| `default`  | 1px `--card-border`  | `xs`                         | Default content   |
| `elevated` | 1px `--card-border`  | `md`                         | Modals, dropdowns |
| `outlined` | 2px `--card-border`  | none                         | Emphasis          |
| `brand`    | 2px `--brand`        | `0 0 0 1px var(--brand)/0.1` | Primary content   |
| `success`  | 4px left `--success` | `xs`                         | Positive metrics  |
| `warning`  | 4px left `--warning` | `xs`                         | Caution           |
| `danger`   | 4px left `--danger`  | `xs`                         | Errors, priority  |

---

### Badges

```html
<span class="badge badge--brand">High Match</span>
<span class="badge badge--success">Complete</span>
<span class="badge badge--warning">Developing</span>
<span class="badge badge--danger">Priority</span>
<span class="badge badge--neutral">Explore</span>
```

| Variant   | Background              | Text         | Border         |
| --------- | ----------------------- | ------------ | -------------- |
| `brand`   | `--brand-muted` (12%)   | `--brand`    | none           |
| `success` | `--success-muted` (12%) | `--success`  | none           |
| `warning` | `--warning-muted` (12%) | `--warning`  | none           |
| `danger`  | `--danger-muted` (12%)  | `--danger`   | none           |
| `neutral` | `--bg-sunken`           | `--fg-muted` | 1px `--border` |

Base: `0.625rem` font, uppercase, 0.12em tracking, 700 weight, pill radius.

---

## Section Layouts

### Containers

```css
.container {
  max-width: 1280px;
  padding: 0 clamp(1rem, 3vw, 3rem);
}
@media (min-width: 1024px) {
  .container {
    max-width: 1320px;
    padding: 0 clamp(2rem, 5vw, 6rem);
  }
}
```

### Content Block Grids

```css
/* Split */
.grid-split {
  grid-template-columns: 1fr 1fr;
  gap: var(--rhythm-lg);
}
.grid-split-asym {
  grid-template-columns: 1fr 2fr;
  gap: var(--rhythm-lg);
}
.grid-3col {
  grid-template-columns: repeat(3, 1fr);
  gap: var(--rhythm-md);
}
.grid-4col {
  grid-template-columns: repeat(4, 1fr);
  gap: var(--rhythm-md);
}

/* Responsive */
@media (max-width: 768px) {
  .grid-split,
  .grid-split-asym,
  .grid-3col,
  .grid-4col {
    grid-template-columns: 1fr;
  }
}
```

### Headers

| Type    | Padding             | Border     | Max Width | Align  |
| ------- | ------------------- | ---------- | --------- | ------ |
| Default | `var(--section-md)` | 1px bottom | —         | left   |
| Hero    | `var(--section-lg)` | none       | 800px     | center |
| Minimal | `var(--section-xs)` | none       | —         | left   |

### Footers

| Type    | Padding             | Border  | Background         | Align  |
| ------- | ------------------- | ------- | ------------------ | ------ |
| Default | `var(--section-md)` | 1px top | transparent        | center |
| Minimal | `var(--section-xs)` | none    | transparent        | center |
| CTA     | `var(--section-lg)` | none    | `var(--bg-sunken)` | center |

---

## Illustration & Icon Guidelines

### Visual Language (Derived from Logo)

1. **Stroke Weight:** 1.5px standard, rounded caps/joins
2. **Accent Color:** Gold (#B8860B) for key elements
3. **Angle Consistency:** 45° diagonals
4. **Corner Radius:** 8px (matches `--radius`)
5. **Shapes:** Circles, rounded rectangles, hexagons
6. **Palette:** Navy (#1A1A2E), Gold (#B8860B), Warm White (#FAFAF8), Muted Gray (#7D7D8E)

### Icon Specifications

| Property        | Value          |
| --------------- | -------------- |
| Stroke Width    | 1.5px          |
| Stroke Linecap  | round          |
| Stroke Linejoin | round          |
| Fill            | none           |
| Color           | `currentColor` |

### Sizes

| Size      | Diameter | Use Case             |
| --------- | -------- | -------------------- |
| `sm`      | 16px     | Inline text, buttons |
| `default` | 20px     | UI controls, cards   |
| `lg`      | 24px     | Section headers      |
| `xl`      | 32px     | Feature highlights   |
| `hero`    | 64px     | Hero sections        |

### Motif Library (Echoes Logo)

| Motif                 | Meaning                 | Construction              |
| --------------------- | ----------------------- | ------------------------- |
| Interlocking Hexagons | Connection, Integration | 6× hexagons, shared edges |
| Upward Sparklines     | Growth, Progress        | 45° ascending segments    |
| Concentric Circles    | Depth, Insight          | 3 rings, 2px gap          |
| Neuron Abstractions   | Intelligence            | Geometric nodes + edges   |
| Bridge/Arch           | Transition              | Curved path, 45° supports |

---

## Accessibility

### Contrast Targets

| Element          | Ratio | Standard |
| ---------------- | ----- | -------- |
| Body Text        | 7:1   | WCAG AAA |
| Large Text       | 4.5:1 | WCAG AA  |
| UI Components    | 3:1   | WCAG AA  |
| Focus Indicators | 3:1   | WCAG AA  |

### Focus Management

- Visible focus: `2px solid var(--border-focus)` with 3px offset
- Never remove focus styles
- `:focus-visible` only for keyboard navigation
- Skip links for main content

### Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  html {
    scroll-behavior: auto;
  }
}
```

---

## Usage Notes

### Do's ✅

- Use semantic tokens (`--brand`, `--fg-muted`) not raw values
- Use fluid clamp scales for all typography and spacing
- Use `clamp()` for responsive sizing without breakpoints
- Default to `var(--brand)` for primary actions
- Use `var(--fg-muted)` for secondary text, never `#666` or similar
- Use `--bg-sunken` for input backgrounds, not `white`/`gray`
- Use `--border` for subtle divisions, `--border-strong` for emphasis
- Test in both light and dark modes
- Respect `prefers-reduced-motion`

### Don'ts ❌

- Hardcode hex colors (`#B8860B`, `#1A1A2E`)
- Use fixed pixel sizes for typography (`font-size: 16px`)
- Use `white`/`black` for backgrounds/text
- Use `gray-500` or similar utility classes
- Remove focus outlines
- Use `transition: all`
- Mix spacing scales (stick to 8px base)
- Use `!important` except for reduced-motion overrides

### Dark Mode Testing Checklist

- [ ] All text meets WCAG AA on dark surfaces
- [ ] Brand gold is lighter (`oklch(0.68 0.14 75)`) for contrast
- [ ] Borders use `oklch(1 0 0 / 0.08)` not dark grays
- [ ] Cards use `--card` (navy) not white
- [ ] Inputs use `--input-bg` (dark navy)
- [ ] Shadows are subtle (dark mode shadows are invisible anyway)

### Component Composition Patterns

```tsx
// Primary CTA
<Button variant="brand" size="lg">Begin your assessment</Button>

// Secondary action
<Button variant="outline">View all courses</Button>

// Form field
<Input id="email" name="email" type="email" placeholder="you@example.com" required />

// Progress indicator
<div className="progress-bar progress-bar--brand" role="progressbar" aria-valuenow={65}>
  <div className="progress-bar__fill" style={{ width: '65%' }} />
</div>

// Metric card
<Card className="card-base card--success">
  <p className="eyebrow text-[var(--gold)]">Highest</p>
  <p className="text-display text-2xl font-bold text-[var(--success)]">Strategic Thinking</p>
</Card>
```

### File Structure

```
client/src/
├── index.css              # Global styles + design tokens
├── brand-system.css       # Auto-generated token CSS
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── progress-ring.tsx
│   │   └── ...
│   └── AssessmentIntro.tsx
├── pages/
│   ├── Assessment.tsx
│   ├── AssessmentResults.tsx
│   └── ...
└── brand-system.json      # Source of truth (JSON)
```

---

## Maintenance

### Adding New Tokens

1. Add to `brand-system.json`
2. Run build to regenerate `brand-system.css`
3. Update component files to use new tokens
4. Test in light/dark modes

### Versioning

- **Major:** Breaking token changes, color space migration
- **Minor:** New tokens, component variants
- **Patch:** Bug fixes, token value adjustments

---

_Generated from `brand-system.json` v2.1.0_
_Last updated: 2026-11-24_
