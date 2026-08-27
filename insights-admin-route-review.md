# Insights and Newsletter Admin Route Review

## Desktop

The Insights index retains the established navy/ivory editorial hierarchy, and preview cards now lead to stable article detail URLs. The article detail page presents a clear draft-preview label, readable long-form sections, a related-pathway footer, and a direct return path to the Insights index. The admin route remains protected and keeps the newsletter section within the existing admin observatory navigation.

## Mobile

The article detail typography wraps cleanly at 390px, with readable line lengths, visible draft status, and a clear return link. The Insights index remains reachable through the compact public menu. The admin shell remains usable with horizontally scrollable dashboard navigation; fixed privacy chrome overlays lower content in screenshots as expected and does not indicate page overflow.

## SEO and security

Article slugs are shared between preview cards, client metadata, server-rendered HTML, Article JSON-LD, and the localized sitemap. Newsletter search, status, and date filters are passed through the admin-only server procedure; date-only filters use inclusive UTC start/end bounds.

## Runtime follow-up

The Admin Inquiry panel previously emitted a maximum-update-depth warning because its empty fallback rows array changed identity on every render while synchronizing note drafts. The fallback is now memoized. TypeScript, the full test suite, and production build pass; the post-fix admin render produced no new maximum-update-depth errors. Older entries remain in the rolling browser log as historical records.
