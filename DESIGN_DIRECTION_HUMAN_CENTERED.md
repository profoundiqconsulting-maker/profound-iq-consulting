# Profound IQ Consulting — Human-Centered Design Direction

**Version:** 1.0  
**Inspiration:** indepthresearch.org (warm professionalism, clear categorization, multi-language accessibility, human-centered copy)  
**Personality:** Empathetic · Credible · Crafted · Approachable · Clear

---

## 1. Design Philosophy

### From Executive to Human

The current design reads as "executive observatory" — cold, polished, transactional. The new design shifts to **"thoughtful guide"** — a professional who listens, explains clearly, and walks beside the learner.

### Core Principles

| Principle | What it means | How it shows up |
|-----------|---------------|-----------------|
| **Warmth first** | The site feels like a conversation, not a brochure | Softened corners, inviting color, human copy, real faces |
| **Clarity over cleverness** | Every element earns its place by helping someone understand | Plain language, obvious hierarchy, no jargon without explanation |
| **Credibility through craft** | Trust is built in the details | Consistent spacing, thoughtful micro-interactions, accessible typography, honest imagery |
| **Approachability** | No one should feel "not expert enough" to start | Gentle onboarding, encouraging copy, multiple entry points, multilingual support |
| **Quiet confidence** | Authority without arrogance | Restrained animation, generous whitespace, deliberate color use |

### The "indepthresearch.org" Influence

From research: warm professional navigation, sector/topic categorization with counts, multilingual selector, clear contact paths (phone, WhatsApp, email, address), practical copy ("Gain prestigious credentials that distinguish your expertise"), and human-scale sections ("Our Work", "Venues", "Discover"). We adopt the *tone* and *accessibility mindset*, not the visual clone.

---

## 2. Tone of Voice

### Voice Attributes

- **Kind, not clinical** — We speak to people, not personas
- **Clear, not simplified** — Complex topics explained with respect
- **Encouraging, not pushy** — CTAs invite, never pressure
- **Honest, not polished-to-perfection** — Real stories, real learners, real outcomes

### Copy Examples (Before → After)

| Context | Before (Executive) | After (Human) |
|---------|-------------------|---------------|
| Hero CTA | "Transformational learning, educational consulting" | "We help you build skills that matter — at your pace" |
| Course price | "KES 4,999" | "KES 4,999 — includes all materials and certification" |
| Enroll button | "Enroll in course" | "Start this course" / "Reserve your place" |
| Error state | "Validation failed" | "Something's not quite right — let's try that again" |
| Empty state | "No courses match your filters" | "We couldn't find a match — try adjusting your search" |
| Contact | "Get in touch" | "We'd love to hear from you" |

### Language Guidelines

- Use contractions ("we're", "you'll", "don't") — feels spoken, not written
- Active voice ("You'll build" vs "Skills are built")
- Address the learner directly ("you", "your")
- Explain acronyms on first use
- Offer multilingual key labels (English/Swahili at minimum, following indepthresearch.org's model)

---

## 3. Typography System

### Font Strategy

We keep **Fraunces** (display) and **Manrope** (body) but re-tune for warmth:

| Role | Font | Use | Feeling |
|------|------|-----|---------|
| Display/Headlines | Fraunces | H1–H2, pull quotes | Editorial, crafted, warm serif |
| Body/UI | Manrope | All body, buttons, nav | Clear, friendly, legible |
| Data/Numbers | Manrope (tabular numerals) | Prices, dates, metrics | Trustworthy, consistent |

### Fluid Type Scale (clamp-based, zoom-resilient)

| Scale | Size (clamp) | Line Height | Letter Spacing | Use |
|-------|-------------|-------------|----------------|-----|
| `--type-xs` | `clamp(0.6875rem, 0.5vw + 0.5rem, 0.875rem)` | 1.5 | 0.02em | Captions, metadata, labels |
| `--type-sm` | `clamp(0.8125rem, 0.6vw + 0.55rem, 1rem)` | 1.55 | 0.01em | Small body, helper text |
| `--type-base` | `clamp(0.9375rem, 0.7vw + 0.6rem, 1.125rem)` | 1.6 | 0 | Primary body copy |
| `--type-lg` | `clamp(1.0625rem, 0.8vw + 0.65rem, 1.25rem)` | 1.6 | -0.01em | Lead paragraphs, intros |
| `--type-xl` | `clamp(1.1875rem, 1vw + 0.7rem, 1.5rem)` | 1.55 | -0.01em | Section intros, cards |
| `--type-2xl` | `clamp(1.4375rem, 1.2vw + 0.8rem, 1.875rem)` | 1.45 | -0.02em | H3, subsection heads |
| `--type-3xl` | `clamp(1.75rem, 1.5vw + 1rem, 2.25rem)` | 1.35 | -0.02em | H2 |
| `--type-4xl` | `clamp(2.125rem, 2vw + 1.2rem, 3rem)` | 1.15 | -0.03em | H1, hero |
| `--type-5xl` | `clamp(2.75rem, 2.5vw + 1.4rem, 4rem)` | 1.05 | -0.04em | Campaign H1, landing |

### Readability Rules

- **Max line length:** 65–75 characters (`max-width: min(65ch, 100%)`)
- **Paragraph spacing:** `1.5em` bottom margin (breathing room)
- **Section headings:** `clamp()` with `overflow-wrap: break-word` (never breaks at 500% zoom)
- **Body alignment:** Left-aligned only — never justified (creates rivers)
- **Link styling:** Underline by default on body links; color is brand, not blue
- **Font-size base:** `clamp(14px, 0.97vw + 10px, 18px)` on `html` — scales with browser zoom

---

## 4. Color Palette

### Philosophy

Warm, grounded, credible. We soften the stark executive contrast into something that feels human but still passes WCAG AA (4.5:1) for body text.

### Light Mode Tokens

| Token | OKLCH | Hex (approx) | Use |
|-------|-------|--------------|-----|
| `--bg` | `oklch(0.988 0.002 85)` | #FBFAF8 | Primary background — warm paper, not stark white |
| `--bg-elevated` | `oklch(1 0 0)` | #FFFFFF | Cards, modals, surfaces |
| `--bg-sunken` | `oklch(0.965 0.004 85)` | #F5F3EE | Subtle depth, secondary sections |
| `--fg` | `oklch(0.14 0.012 260)` | #242436 | Primary text — near-black, warm |
| `--fg-muted` | `oklch(0.42 0.008 260)` | #6B6B7A | Secondary text |
| `--fg-subtle` | `oklch(0.58 0.006 260)` | #9494A0 | Disabled, captions |
| `--brand` | `oklch(0.58 0.13 75)` | #C19A46 | Primary actions — warm gold, not neon |
| `--brand-hover` | `oklch(0.52 0.14 75)` | #A87E2E | Hover state |
| `--brand-fg` | `oklch(0.985 0 0)` | #FAFAF8 | Text on brand |
| `--brand-light` | `oklch(0.58 0.13 75 / 0.1)` | — | Subtle backgrounds, badges |
| `--brand-muted` | `oklch(0.58 0.13 75 / 0.12)` | — | Soft accents |
| `--success` | `oklch(0.5 0.12 155)` | #3E8E6E | Confirmations, positive |
| `--warning` | `oklch(0.64 0.16 85)` | #D9A42E | Attention, caution |
| `--danger` | `oklch(0.52 0.18 25)` | #C0504D | Destructive, errors (softer red) |
| `--border` | `oklch(0.2 0.015 260 / 0.08)` | — | Subtle dividing lines |
| `--border-strong` | `oklch(0.2 0.015 260 / 0.16)` | — | Card borders, inputs |
| `--border-focus` | `var(--brand)` | — | Focus rings |

### Dark Mode Tokens

| Token | OKLCH | Use |
|-------|-------|-----|
| `--bg` | `oklch(0.1 0.025 260)` | Deep warm navy |
| `--bg-elevated` | `oklch(0.14 0.028 260)` | Cards |
| `--bg-sunken` | `oklch(0.075 0.022 260)` | Recessed areas |
| `--fg` | `oklch(0.955 0.01 85)` | Warm white |
| `--brand` | `oklch(0.7 0.13 75)` | Lighter gold for contrast on dark |

### Accessibility

- All text meets WCAG AA (4.5:1) against its background
- Focus rings: 2px solid `--border-focus`, 3px offset
- Never rely on color alone to convey state (use icons + text + color)
- Status badges always include a text label

---

## 5. Micro-Interactions

### Principles

- **Purposeful, not decorative** — every motion teaches or confirms
- **Gentle easing** — `cubic-bezier(0.22, 1, 0.36, 1)` (soft ease-out)
- **Respect reduced motion** — disable transforms when `prefers-reduced-motion: reduce`
- **Human timing** — 180–300ms for state changes, 500–700ms for entrance
- **No autoplay** — video/audio never plays automatically

### Interaction Catalog

| Interaction | Timing | Easing | Detail |
|-------------|--------|--------|--------|
| Button press | 120ms | `scale(0.97)` active | Subtle press-down feel |
| Button hover | 180ms | `ease-out` | Background tint shift, slight lift (2px) |
| Focus ring | 120ms | `ease-out` | 2px brand ring, 3px offset |
| Card hover | 250ms | `cubic-bezier(0.22,1,0.36,1)` | Lift 4px, shadow deepens |
| Modal open | 350ms | `ease-out` | Fade + slight scale-up from 0.95 |
| Section reveal | 600ms | `cubic-bezier(0.22,1,0.36,1)` | Fade-in from translateY(12px), staggered 60ms |
| Form validation | 150ms | `ease-out` | Border color + inline message |
| Toast notification | 300ms | `ease-out` | Slide up from bottom, dismissible |
| Language switch | 200ms | `ease-out` | Instant text swap, subtle fade |

### "Thoughtful Detail" Examples

- **Course card hover:** Image softens, price glows slightly, "Start this course" button gains emphasis
- **Form focus:** Field label slides up gently, border pulses once with brand color
- **Empty state:** Gentle scale-in animation on the illustration
- **Language selector:** Smooth cross-fade, no layout jump
- **Back to top:** Appears after 400px scroll, smooth scroll behavior

---

## 6. Imagery & Photography Direction

### Style

- **Real people, real moments** — No stock handshakes. Learners in actual environments (offices, classrooms, home offices, field sites)
- **Warm lighting** — Golden hour or soft indoor light, never harsh fluorescent
- **Diverse representation** — Ages, ethnicities, genders, abilities shown naturally, not tokenized
- **Context-rich** — A notebook, a laptop, a coffee cup, a whiteboard — tells a story without words
- **Minimal retouching** — Skin texture, natural expressions, authentic clothing

### Usage by Context

| Context | Imagery Type | Treatment |
|---------|-------------|-----------|
| Hero | Single large environmental portrait | Slight overlay (brand at 15%), readable text |
| Course cards | Small square (4:3) learning moments | Rounded corners (0.75rem), subtle shadow |
| About page | Team portraits + workspace candids | Full bleed, grayscale-to-color hover (subtle) |
| Article detail | Feature image + inline illustrations | Illustration style: hand-drawn, warm line work |
| Contact | Office exterior + team group | Warm, inviting |
| Testimonials | Small circular headshots (1.5rem) | Natural expressions |

### Iconography

- **Style:** Warm, rounded, human-scale (16px–24px)
- **Set:** Lucide-replace with custom-drawn or a rounded variant
- **Color:** `--fg-muted` default, `--brand` on hover/active
- **Meaning:** Every icon has an `aria-label` or visible text — never mystery meat

---

## 7. Layout Philosophy

### Spacing

- **Base unit:** 8px (0.5rem) — from existing brand system
- **Section vertical padding:** `clamp(3rem, 6vw, 8rem)` — generous but not cavernous
- **Component gaps:** `var(--spacing-2)` (8px) tight, `var(--spacing-6)` (24px) comfortable, `var(--spacing-10)` (40px) airy
- **Container max-width:** `min(1280px, 100vw)` — never forces horizontal scroll
- **Reading measure:** `min(65ch, 100%)` for long-form text

### Grid

- **Mobile:** Single column, full width, `px-4` (16px) side padding
- **Tablet (768px+):** 2-column grid for cards, 3-column for feature rows
- **Desktop (1024px+):** 3-column for course catalogs, 4-column for feature grids
- **Auto-fit:** `repeat(auto-fit, minmax(min(280px, 100%), 1fr))` — columns reflow without media queries where possible

### Alignment

- **Headlines:** Left-aligned, ragged right (never centered for body)
- **Buttons:** Left-aligned in cards, centered only in hero
- **Forms:** Full-width inputs on mobile, max-width 480px centered on desktop
- **Navigation:** Logo left, links center, actions right (desktop); stacked mobile

---

## 8. Page-Specific Design Direction

### 8.1 Home Page

**Goal:** Make a visitor feel welcomed and understood within 5 seconds.

**Structure (top to bottom):**

1. **Skip link** — always first, keyboard-accessible
2. **Header** — Logo (left), 3–4 nav links (center), "Start a conversation" + language switcher (right), hamburger on mobile
3. **Hero section** —
   - Eyebrow: "Learning designed around you" (warm, not "Transformational learning")
   - H1: One clear value proposition, max 2 lines
   - Subhead: 2–3 sentences, human tone, reading measure ≤ 65ch
   - Two CTAs side by side: Primary ("Explore courses"), Secondary ("Book a 15-minute chat")
   - Background: Soft brand-tinted gradient or single hero photo with 15% overlay
4. **How it works** — 3 steps with simple icons and micro-copy ("Find your path → Start learning → Grow your practice")
5. **Featured courses** — 3 cards, price prominent, "Start this course" button, "Learn more" link
6. **Trusted by / Our work** — Logos or testimonial quotes with real names and roles
7. **Newsletter / Stay in touch** — Simple email + name field, warm copy ("We'll share useful resources, never spam")
8. **Footer** — Contact (phone, email, address), quick links, language switcher, social

**Copy tone check:** "We help teams and individuals build practical skills" — not "Transformational observatory for executive learning."

---

### 8.2 About Page

**Goal:** Build credibility through transparency and human stories.

**Structure:**

1. **Hero** — H1 "About us", subtitle one sentence, team environment photo
2. **Our story** — 2–3 short paragraphs, first-person plural ("We started because..."), founding motivation
3. **Meet the team** — 3–5 people, circular photos, name, role, one human detail ("Loves Kenyan coffee, bad puns, and helping teams learn"), short bio
4. **Our approach** — 3 columns: "We listen first", "We design with you", "We stay involved" — each with icon + 2 sentences
5. **Values** — 4 values with icon + definition, no corporate buzzwords
6. **FAQ** — Accordion, plain questions ("How long does a course take?", "Can I try before I buy?")
7. **Contact CTA** — "Have a question? We'd love to hear from you."

**Tone:** Vulnerable but confident. Admit limitations. Share real team members.

---

### 8.3 Article / Detail Page

**Goal:** Make reading feel effortless and rewarding.

**Structure:**

1. **Header** — Breadcrumb (Home > Category > Article), category badge, reading time estimate ("6 min read"), H1, author name + small photo + date
2. **Feature image** — Full width, warm, captioned
3. **Article body** — Single column, `max-width: min(65ch, 100%)`, fluid type, generous line height (1.6), section headings every 300–500 words
4. **Inline elements** — Pull quotes (brand-colored left border), callout boxes ("Did you know?"), related-course links embedded naturally
5. **Sidebar (desktop only)** — "Related reading" (3 cards), "Share this article" (social + copy link), newsletter signup
6. **End of article** — Author bio box, "Was this helpful?" (thumbs up/down), related articles (3 cards)
7. **Comments or contact** — Link to contact page for questions

**Micro-interactions:** Reading progress bar at top (subtle), anchor links on headings (appear on hover), "Back to top" after scroll.

**Typography:** H1 at `--type-4xl`, body at `--type-base` or `--type-lg`, section heads at `--type-2xl`.

---

### 8.4 Contact Page

**Goal:** Remove anxiety from reaching out.

**Structure:**

1. **Hero** — H1 "Get in touch", subtitle "We read every message and usually reply within one business day"
2. **Contact methods grid** (3–4 cards):
   - Email (icon: envelope) — address + "Best for detailed questions"
   - Phone (icon: phone) — number + "Best for quick questions, Mon–Fri 9–5 EAT"
   - WhatsApp (icon: message circle) — number + "Best for quick chats"
   - Office visit (icon: map pin) — address + "By appointment, Nairobi"
3. **Contact form** — Single column, max 480px centered:
   - Fields: Name, Email, "What would you like to talk about?" (select: General question / Course inquiry / Partnership / Other), Message (textarea), "How did you hear about us?" (optional)
   - Submit: "Send your message" (warm, not "Submit")
   - Success state: "Thanks — we've received your message and will get back to you soon."
4. **FAQ section** — 4–5 common questions (accordion)
5. **Map** — Simple static or embedded map of office location

**Accessibility:** Form labels always visible (no placeholder-only labels), error messages inline and descriptive, focus order logical.

---

## 9. Component Library Style Guide

### 9.1 Button

| Property | Value | Notes |
|----------|-------|-------|
| Variants | `primary` (brand), `secondary` (muted bg), `outline` (brand border), `ghost` (text only), `link` (underlined text), `brand` (bold, uppercase CTA) | `primary` = main action, `brand` = hero CTAs |
| Sizes | `sm` (36px), `default` (40px), `lg` (44px), `xl` (48px), `icon-*` (square) | `default` for most, `lg` for hero |
| Radius | `0.5rem` (8px) | Consistent |
| Focus | 2px brand ring, 3px offset | Always visible |
| Disabled | opacity 0.5, pointer-events none | Never hide |
| Text | Sentence case, sentence-style | "Start this course" not "ENROLL NOW" |
| Icon | Left or right, 16px, `pointer-events: none` | Never mystery icons |

**Do:** Left-align text in cards, centered only in hero, sentence case, clear action verb  
**Don't:** ALL CAPS body buttons, vague labels ("Click here"), no hover state

### 9.2 Card

| Property | Value |
|----------|-------|
| Background | `--card` (white or dark elevated) |
| Border | 1px `--border-strong` |
| Radius | `0.75rem` (12px) |
| Padding | `1.5rem` |
| Shadow | `0 1px 2px rgba(0,0,0,0.05)` → hover deepens |
| Layout | Flex column, `gap: 1rem` |
| Container query | `@container card (max-width: 400px)` → stack actions vertically, full-width buttons |

**Anatomy:** Optional image (top), category badge, title, description, action area (price + button side by side on wide, stacked on narrow)

### 9.3 Form Field

| Property | Value |
|----------|-------|
| Label | Always visible, above input, `--type-sm`, font-semibold |
| Input height | `2.75rem` (44px touch target) |
| Radius | `0.5rem` |
| Border | 1px `--border` → `--border-focus` on focus |
| Background | `--input-bg` |
| Font | `--type-base`, inherit family |
| Placeholder | `--fg-muted`, never the only label |
| Error | Red border + inline message below, icon (alert-circle) |
| Success | Green border + inline message |

### 9.4 Navigation

| State | Behavior |
|-------|----------|
| Desktop | Logo left, 4–5 links center, CTAs + language right |
| Tablet/Mobile | Hamburger, overlay menu, stacked links, CTAs full width |
| Active state | Brand underline (2px), brand text |
| Hover | Subtle background tint |
| Focus | Visible ring |

### 9.5 Badge / Category Pill

| Property | Value |
|----------|-------|
| Height | Auto, padding `0.125rem 0.625rem` |
| Radius | `9999px` (pill) |
| Font | `--type-xs`, font-bold, uppercase, tracking-wide |
| Background | `--bg-sunken` or `--brand-light` |
| Text | `--fg-muted` or `--brand` |
| Use | Course level, category, status (new, popular) |

### 9.6 Modal / Dialog

| Property | Value |
|----------|-------|
| Overlay | `--brand` at 10% (warm tint, not black blur) — from existing work |
| Panel | `--bg-elevated`, rounded `1rem`, padding `2rem` |
| Max width | `min(640px, 92vw)` |
| Max height | `90dvh`, scrollable inside |
| Close | X button (top right) + click outside + Escape key |
| Focus trap | Yes, return focus on close |

### 9.7 Empty State

| Property | Value |
|----------|-------|
| Illustration | Simple line art, brand-colored or `--fg-muted` |
| Heading | `--type-lg`, clear ("No courses found") |
| Body | `--type-sm`, `--fg-muted`, helpful ("Try adjusting your filters") |
| Action | One primary button ("Clear all filters") |

### 9.8 Toast / Notification

| Property | Value |
|----------|-------|
| Position | Bottom-right, staggered if multiple |
| Background | `--bg-elevated` with border |
| Border-left | 3px accent color (brand/success/warning/danger) |
| Dismiss | X button + auto-dismiss after 5s (except errors) |
| Motion | Slide up 180ms, fade out |

---

## 10. Implementation Checklist

### CSS / Design Tokens (update `index.css` + `brand-system.css`)

- [ ] Expand `clamp()` type scale with wider min/max for zoom resilience
- [ ] Add warm color tokens (paper background, softer brand gold)
- [ ] Add component container types (`container-type-card`, etc.)
- [ ] Add touch-target minimums (44px)
- [ ] Add focus-visible polish (2px ring, 3px offset)
- [ ] Add grid auto-fit utilities (`grid-auto-2/3/4`)

### Components (update `client/src/components/ui/`)

- [ ] Button: sentence case, remove `whitespace-nowrap`, add overflow-wrap
- [ ] Card: add `container-type-card`, softer shadow, larger radius
- [ ] Form: visible labels, inline errors, 44px touch targets
- [ ] Navigation: warmer hover, language switcher prominent
- [ ] Modal: brand-tinted overlay (already done in prior phase)
- [ ] Empty state component
- [ ] Toast component

### Pages

- [ ] Home: human hero copy, two-CTA layout, featured courses
- [ ] About: team cards, approach columns, values
- [ ] Article detail: reading measure, pull quotes, related reading
- [ ] Contact: contact methods grid, warm form, FAQ

### Accessibility Audit

- [ ] Keyboard navigation on all interactive elements
- [ ] Screen reader labels on icons and buttons
- [ ] Color contrast AA minimum on all text
- [ ] Focus visible on all interactive elements
- [ ] Language switcher announced to screen readers
- [ ] Zoom test: 25% → 500%, no horizontal scroll, no clipping

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Time to understand value proposition | < 5 seconds |
| Form completion rate | +15% vs baseline |
| Support contact reduction (confusion) | -20% |
| WCAG AA compliance | 100% pages |
| Zoom resilience (25–500%) | No horizontal scroll, no clipping |
| Perceived warmth (user survey) | 4.2/5+ |

---

*This document is a living design direction. Implement incrementally, starting with typography and tone, then components, then pages.*