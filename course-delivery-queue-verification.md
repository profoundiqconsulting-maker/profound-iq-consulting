# Course Completion Delivery Queue Verification

The dashboard renders the new completion delivery queue in the existing navy and gold workspace style at desktop and narrow mobile widths. The queue remains compact when no completed certificate exists and explains that the flow unlocks after course completion. On authenticated preview data, completed course records are selected from the live course-state query, which refreshes on window focus and every 30 seconds.

The intended ordered flow is visible in the implementation as email status first, organization review second, and social-image sharing third. Organization requests require organization name, organization email, and explicit consent. The social step uses native file sharing when supported and otherwise downloads a branded SVG fallback. Mobile stacking remains readable without horizontal overflow in the full-page capture.
