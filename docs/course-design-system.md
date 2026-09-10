# Course Design System

Brand palette (immutable):
- Navy `#16243d`
- Dark navy `#101d35`
- Ivory `#f7f3e8`
- Gold `#c9a34e`
- Muted `#657084`
- Rose `#8b4f63`
- Teal `#2f6f78`

Semantic tokens (defined in `client/src/index.css`):

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `--background` | `oklch(0.98 0.01 78)` ivory | `oklch(0.14 0.035 255)` navy | Page surface |
| `--foreground` | `oklch(0.20 0.03 255)` navy | `oklch(0.95 0.02 90)` ivory | Primary text |
| `--card` | `oklch(1 0 0)` white | `oklch(0.19 0.035 255)` navy | Card surface |
| `--card-foreground` | navy | ivory | Card text |
| `--primary` | `oklch(0.74 0.12 78)` gold | gold | Primary buttons |
| `--primary-foreground` | `oklch(0.16 0.03 255)` navy | navy | Primary button text |
| `--muted` | `oklch(0.92 0.01 255)` | `oklch(0.31 0.04 255)` | Muted surface |
| `--muted-foreground` | `oklch(0.40 0.03 255)` | `oklch(0.78 0.015 90)` | Secondary text |
| `--accent-on-dark` | n/a | `oklch(0.82 0.12 78)` | Gold text on dark |
| `--gold-on-light` | `oklch(0.34 0.12 78)` | n/a | Gold text on light |
| `--muted-on-dark` | n/a | `oklch(0.78 0.015 90)` | Muted text on dark |
| `--muted-on-light` | `oklch(0.40 0.03 255)` | n/a | Muted text on light |
| `--border` | navy/16% | white/16% | Borders |
| `--ring` | gold | gold | Focus ring |

## Typography scale

- `display` — Fraunces serif, page titles (`text-5xl`–`text-7xl`)
- `text-2xl` / `text-xl` — section titles
- `text-base` — body (`leading-7` ≥ 1.5)
- `text-sm` — secondary
- `text-xs` — captions
- `text-[9px]`–`text-[10px]` — badges/eyebrows only

Line-height minimum: body `leading-7` (1.75), tight display `leading-[.9]`–`leading-[.98]`.

## Spacing

- Paragraph spacing: `mt-3` / `space-y-3` minimum
- Section vertical: `py-16` (mobile) → `py-24` (desktop)
- Card padding: `p-5` / `sm:p-6`

## Component states

| State | Classes |
| --- | --- |
| Default | base surface + border |
| Hover | `hover:border-[#c9a34e]` or `hover:bg-[#c9a34e]` |
| Focus | `focus:border-[#c9a34e] focus:ring-2 focus:ring-[#c9a34e]/30` |
| Active | same as focus + pressed visual |
| Disabled | `disabled:cursor-not-allowed disabled:opacity-50` or `disabled:opacity-40` |

Focus indicator spec: 2px solid `#c9a34e` with 4px offset (global `:focus-visible` in `index.css`), or `focus:ring-2 focus:ring-[#c9a34e]/30` on form inputs.

## Responsive breakpoints

- `sm` 640px
- `md` 768px
- `lg` 1024px
- `xl` 1280px

Grid containers: `container` (max 1280px at ≥1024px).

## Motion

- All motion respects `prefers-reduced-motion`
- Reveal: `riseIn` 0.7s cubic-bezier(0.23,1,0.32,1)
- Transitions: 0.22s–0.28s ease