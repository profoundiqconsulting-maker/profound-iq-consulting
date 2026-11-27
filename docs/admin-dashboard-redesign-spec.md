# Profound IQ Admin Dashboard — Executive Redesign Specification

## 1. Design Principles

| Principle                    | Application                                                          |
| ---------------------------- | -------------------------------------------------------------------- |
| **Calm authority**           | Navy + ivory palette with antique-gold accents; no screaming colors  |
| **Scan-first hierarchy**     | KPI cards → trend charts → detailed tables → contextual actions      |
| **Progressive disclosure**   | Filters hidden until needed; advanced settings in collapsible panels |
| **Consistent motion**        | 220ms hover transitions; reduced-motion respected globally           |
| **Accessibility by default** | Focus rings, ARIA labels, keyboard navigation, sufficient contrast   |

## 2. Color System

```
Navy deep:    #0f172a  (primary surface, text on light)
Ivory soft:   #f7f3e8  (page background)
Antique gold: #c9a34e  (accent, focus rings, positive indicators)
Gold deep:     #7d5e1e  (secondary accent)
Slate:        #64748b  (muted text)
Success:      #16a34a
Warning:      #d97706
Danger:       #dc2626
```

## 3. Typography Scale

| Token           | Size    | Weight | Use                        |
| --------------- | ------- | ------ | -------------------------- |
| `.text-display` | 2rem+   | 600    | Hero numbers, page titles  |
| `.text-section` | 1.5rem  | 600    | Section headings           |
| `.text-body`    | 1rem    | 400    | Paragraphs                 |
| `.text-caption` | 0.75rem | 500    | Labels, metadata           |
| `.eyebrow`      | 0.68rem | 800    | Category labels, uppercase |

## 4. Spacing Scale

- Base unit: 0.25rem (4px)
- Standard gap: 1.5rem (24px) between sections
- Card padding: 1.25rem (20px)
- Section margin: 3rem (48px)

## 5. Component Patterns

### 5.1 Executive Header

- Sticky, with role badge, global search, notification bell, user avatar
- Breadcrumb trail below header
- Contextual actions bar (primary + secondary actions)

### 5.2 KPI Card Grid

- 4-column on desktop, 2 on tablet, 1 on mobile
- Each card: label (caption), value (display), trend indicator
- Hover: subtle lift + shadow

### 5.3 Filter Panel

- Collapsible, with "Show filters" / "Hide filters" toggle
- Inline layout: label → input/select → clear button
- Applied filters shown as removable chips

### 5.4 Data Table

- Sticky header, zebra striping on hover
- Row actions revealed on hover (desktop) or via kebab menu (mobile)
- Pagination with page size selector
- Empty state: dashed border + helpful message

### 5.5 Alert Panel

- Left border accent + soft background
- Icon + title + description + optional action
- Dismissible with animation

## 6. Screen-by-Screen Redesign

### 6.1 Overview / Reports

**Current:** Overview data was mixed with report navigation, several summary
values were inaccurate or based only on the visible page of results, and
inquiry actions were duplicated.
**Redesign:**

- Keep the executive overview separate from the dedicated Reports workspace.
- Show six data-backed KPIs: assessment starts, completed payments, report
  downloads, total users, enrollment submissions, and total contact inquiries.
- Use the contact-inquiry API's total count rather than the current page size.
- Show unavailable metrics and a retry action when a data source fails; never
  present a hardcoded value as live data.
- Keep latest inquiries and common admin tasks in separate, clearly labeled
  panels, with a single full-featured inquiry workflow.

### 6.2 Psychometrics

**Current:** Heavy bordered containers, duplicated chart code
**Redesign:**

- Profile conversion as horizontal stacked bars with percentage labels
- Funnel trend as compact area chart
- Attempts as virtualized table with inline status badges
- Export actions in sticky action bar

### 6.3 Security

**Current:** Dark surface with duplicated login charts
**Redesign:**

- Login trend + device mix in tabbed chart container
- Failed events in filterable table with inline unlock action
- Settings in right sidebar (desktop) or bottom sheet (mobile)

### 6.4 Communications

**Current:** Mixed template editor + delivery history
**Redesign:**

- Split view: template editor (left) + live preview (right)
- Delivery history below with status badges
- Retry actions inline, not in modals

## 7. Responsive Breakpoints

| Breakpoint | Width      | Layout                                              |
| ---------- | ---------- | --------------------------------------------------- |
| Mobile     | < 640px    | Single column, bottom nav, full-width tables        |
| Tablet     | 640-1024px | 2-column KPI grid, collapsible sidebar              |
| Desktop    | > 1024px   | 4-column KPI grid, fixed sidebar, max-width content |

## 8. Accessibility Requirements

- All interactive elements: visible focus ring (2px gold, 4px offset)
- Tables: proper th scope attributes, caption for complex tables
- Charts: aria-label with data summary, fallback table for screen readers
- Modals: focus trap, Escape to close, return focus on close
- Live regions: aria-live for toasts, status updates
- Reduced motion: all animations disabled, transitions 0.01ms

## 9. Performance Targets

- First contentful paint: < 1.2s
- Time to interactive: < 2.5s
- Cumulative layout shift: < 0.1
- Table virtualization for > 100 rows
- Chart data pagination (max 90 points)
