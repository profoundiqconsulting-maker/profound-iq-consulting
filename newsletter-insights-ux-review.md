# Newsletter Administration and Insights UX Review

## Desktop

The Insights page retains the Executive Observatory hierarchy and provides a clear discovery surface for search, category filtering, preview counts, and newsletter capture. The admin route remains clearly protected and retains the grouped dashboard quick navigation. The new newsletter subscriber panel is rendered within the admin observatory and follows the existing ivory/navy/gold operational-card system.

## Mobile

The Insights hero, filter controls, newsletter form, and admin shell remain readable at a 390px viewport. The public header collapses to the established menu trigger, while admin navigation remains horizontally scrollable rather than wrapping into an unusable stack. Tap targets remain comfortably sized. The privacy consent overlay can cover lower-page content in the screenshot, but it is expected fixed chrome and does not indicate layout overflow.

## Accessibility and motion

Inline email validation uses `aria-invalid` and a described hint. The success state uses a short opacity/transform animation and disables that animation under `prefers-reduced-motion`. Admin subscriber data is restricted by the server-side admin procedure, and CSV values use the shared escaped-cell builder.
