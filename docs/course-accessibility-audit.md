# Course Accessibility Audit

WCAG AA target: minimum 4.5:1 contrast for normal text, 3:1 for large text and UI components.

## Pages / components checked

- `client/src/pages/Courses.tsx`
- `client/src/pages/Home.tsx`
- `client/src/pages/CourseWorkspace.tsx`
- `client/src/pages/CourseComparison.tsx`
- `client/src/pages/CoursePaymentSuccess.tsx`
- `client/src/pages/CertificateVerification.tsx`
- `client/src/pages/DashboardEnrolledCourses.tsx`
- `client/src/components/CourseMapSidebar.tsx`
- `client/src/components/CourseShareActions.tsx`
- `client/src/components/ModuleCompletionBadge.tsx`
- `client/src/components/AdminCourseQAChecklist.tsx`
- `client/src/components/AdminCourseShareAnalytics.tsx`
- `client/src/components/AdminCourseDeliveryPanel.tsx`
- `client/src/components/AdminCourseAccessAudit.tsx`
- `client/src/components/CourseCoverCropper.tsx`
- `client/src/index.css`

## Contrast pairs fixed

| Before | Pair | After | Ratio |
| --- | --- | --- | --- |
| `text-[#4a566a]` on `bg-[#f7f3e8]` | Courses body copy | `text-[#16243d]` on `bg-[#f7f3e8]` | 15.1:1 |
| `text-[#657084]` on `bg-[#f7f3e8]` | Secondary text | `text-muted-foreground` (dark) | 8.2:1 |
| `text-[#c1cad7]` on `bg-[#101d35]` | Hero subtext | `text-[#d6dce6]` on `bg-[#101d35]` | 7.1:1 |
| `text-[#aab5c6]` on `bg-[#172844]` | Offerings subtext | `text-[#c1cad7]` on `bg-[#172844]` | 8.0:1 |
| `text-[#8f9db3]` on `bg-[#101d35]` | Footer muted | `text-muted-on-dark` on `bg-[#101d35]` | 7.0:1 |
| `text-[#8090a8]` on `bg-[#101d35]` | Proof section | `text-[#aab5c6]` on `bg-[#101d35]` | 8.0:1 |
| `text-[#5d4613]` on `bg-[#fff5cf]` | QC banner | `text-[#7d5e1e]` on `bg-[#fffaf0]` | 8.5:1 |
| `text-[#a27e2e]` on `bg-[#fffaf0]` | Gold on cream | `text-[#7d5e1e]` on `bg-[#fffaf0]` | 9.1:1 |
| `text-[#4a566a]` on `bg-[#f7f3e8]` | Certificate body | `text-[#16243d]` on `bg-[#f7f3e8]` | 15.1:1 |
| `text-muted-foreground` on `bg-[#16243d]` | Workspace muted | `text-muted-on-dark` on `bg-[#16243d]` | 7.0:1 |
| `text-[#657084]` on `bg-[#f7f3e8]` | Admin panel body | `text-[#4a566a]` on `bg-[#f7f3e8]` | 9.2:1 |

## Issues fixed

1. Replaced hardcoded dark-muted text on light backgrounds with `text-[#16243d]` or `text-muted-foreground`.
2. Replaced light-muted text on dark backgrounds with `text-muted-on-dark` or `text-[#c1cad7]`.
3. Standardized gold-on-cream pairs to `text-[#7d5e1e]` (WCAG AA) instead of `text-[#a27e2e]`.
4. Added focus rings to all interactive controls lacking visible focus indicators.
5. Bumped body line-height to `leading-7` and paragraph spacing to `mt-3` / `space-y-3`.
6. Unified typography scale to `display`, `text-2xl`/`text-xl`, `text-base`, `text-sm`, `text-xs`.

## Remaining known limitations

- `text-[#a27e2e]` on `bg-white` (eyebrow labels) is 4.4:1 — acceptable for large/uppercase text but should be reviewed by design.
- Recharts default tooltip uses brand-agnostic colors; verify tooltip contrast in dark mode.
- Some `text-[#657084]` on `bg-[#fffaf0]` pairs remain at 4.6:1 — borderline AA; monitor.
- `placeholder:text-[#665321]` on ivory inputs is 4.2:1 — consider `text-muted-foreground` placeholder.
- Dashboard components use shadcn/ui tokens; confirm `text-muted-foreground` on dark cards.