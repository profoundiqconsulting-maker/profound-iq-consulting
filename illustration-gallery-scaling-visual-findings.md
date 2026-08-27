# My Illustrations Scaling Visual QA

- Desktop `/my-illustrations` at 1280px renders the branded gallery shell, shared learner navigation, search field, mode filters, folder selector, saved-count card, and readable empty state without layout errors.
- Mobile `/my-illustrations` at 390px keeps the search field and organization controls inside the content column; mode buttons wrap into a vertical stack and the folder selector remains accessible.
- The shared dashboard quick navigation is intentionally horizontally clipped/scrollable on mobile, matching the existing dashboard navigation pattern; the gallery content itself does not overflow horizontally.
- Empty-state screenshots cannot exercise card-level PNG, pagination, or folder-edit controls because the current authenticated QA session has no saved illustration rows. These controls are covered by source-level regression tests and should be manually exercised with a seeded bookmark account.
