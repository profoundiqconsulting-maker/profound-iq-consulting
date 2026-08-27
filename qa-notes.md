# Interactive Course Hardening QA Notes

- Desktop `/staff` rendered with the shared DashboardLayout, existing inquiry workspace, and the new Instructor Review section visible below it.
- Desktop `/courses/lead-with-clarity` rendered the protected course highlights surface with the established dark navy and ivory/gold visual system.
- The staff screenshot showed the existing cookie-consent and translation-feedback overlays, which are sitewide UI and not part of the instructor panel.
- Continue with mobile screenshots and runtime log inspection before checkpointing.


## Mobile verification

The 390px staff view collapsed into the mobile DashboardLayout header and retained readable inquiry metrics and the staff workspace title. The course highlights view kept the course title, share controls, and learning-outcomes content within the viewport without horizontal overflow. Sitewide cookie-consent overlays remain visible in both captures by design.


## Learner feedback and review analytics verification

Desktop verification showed the staff workspace retaining the established sidebar and editorial styling, with the Instructor Review section visible below the inquiry desk. The course highlights route retained its protected-learning presentation and shared action row. Mobile verification showed the staff header collapsing cleanly, the inquiry metrics stacking vertically, and the page remaining readable without horizontal overflow. The cookie-consent overlay is visible in the captures by design and can cover lower content until dismissed.

