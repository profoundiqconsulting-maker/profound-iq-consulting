# Paystack Assessment Payment Extension

- [x] Review the current assessment/payment scope and Paystack requirements.
- [x] Confirm Paystack public and secret credential requirements and callback/webhook architecture.
- [x] Replace the blocked Stripe path with Paystack checkout and server-side verification.
- [x] Implement the approximately 100-question assessment and report gating around verified payment.
- [x] Add report generation, privacy handling, and non-diagnostic disclaimers.
- [x] Verify the Paystack flow, responsive experience, and build before delivery.
- [ ] Run an end-to-end Paystack test transaction and verify callback payment confirmation unlocks the report.
- [ ] Add automated coverage for Paystack webhook signature validation and idempotent successful-charge report unlocking.
- [ ] Save a stable checkpoint for user-led publication.
- [ ] Configure and test the published-domain Paystack callback and report unlock flow.
