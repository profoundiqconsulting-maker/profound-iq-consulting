# Interactive Course Hardening QA Notes

- Desktop `/staff` rendered with the shared DashboardLayout, existing inquiry workspace, and the new Instructor Review section visible below it.
- Desktop `/courses/lead-with-clarity` rendered the protected course highlights surface with the established dark navy and ivory/gold visual system.
- The staff screenshot showed the existing cookie-consent and translation-feedback overlays, which are sitewide UI and not part of the instructor panel.
- Continue with mobile screenshots and runtime log inspection before checkpointing.


## Mobile verification

The 390px staff view collapsed into the mobile DashboardLayout header and retained readable inquiry metrics and the staff workspace title. The course highlights view kept the course title, share controls, and learning-outcomes content within the viewport without horizontal overflow. Sitewide cookie-consent overlays remain visible in both captures by design.


## Learner feedback and review analytics verification

Desktop verification showed the staff workspace retaining the established sidebar and editorial styling, with the Instructor Review section visible below the inquiry desk. The course highlights route retained its protected-learning presentation and shared action row. Mobile verification showed the staff header collapsing cleanly, the inquiry metrics stacking vertically, and the page remaining readable without horizontal overflow. The cookie-consent overlay is visible in the captures by design and can cover lower content until dismissed.


## Feedback notifications and analytics exports

Desktop visual QA confirms the staff workspace preserves the shared navigation and editorial dashboard styling, while the course surface retains its protected-learning presentation. The cookie-consent overlay is visible in the captures by design and may cover lower content until dismissed. The new notification and analytics panels are located below the initial staff viewport and require scrolling for direct visual inspection.

## Notification preferences and scheduled review analytics QA

Desktop verification passed for `/staff`: the Instructor Review workspace shows course/date filters, CSV/PDF controls, response-aging cards, reviewer workload summary, automated weekly delivery controls, and the workload trend area in the established navy/ivory/gold visual system. The empty state is clear when no review data is present, and the delivery control is prominent without dominating the review queue. The full-page `/settings` capture is very tall, so the notification section should also be spot-checked in a viewport capture for readability.

## Mobile verification

At 390px, `/settings` preserves readable heading hierarchy and profile layout; the sitewide privacy banner covers lower content until dismissed, so the notification section should be reached after accepting or customizing consent. `/staff` collapses into the mobile dashboard header and retains the inquiry metrics without horizontal overflow. The review analytics panel is below the initial viewport and remains reachable by scrolling; its stacked controls and delivery card are designed for narrow widths.

