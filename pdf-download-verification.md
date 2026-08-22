PDF download verification, 2026-08-22:

- Authenticated dashboard displayed one paid assessment with a Download PDF action.
- Clicking Download PDF triggered the report download and displayed the Sonner toast: “Report downloaded — Your PDF is ready to review or share.”
- The protected procedure was covered by tests for unauthenticated access, cross-account access, unpaid reports, and paid owner reports.
- The renderer test confirmed PDF header, metadata title, nontrivial output length, and EOF marker.
The first mobile review showed the action row clipping the Download PDF button. The action container was updated to wrap on narrow screens, and a second 375px-wide screenshot confirmed that View Report and Download PDF remain fully visible and usable inside the card.
