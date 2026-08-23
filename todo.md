# Avatar Upload Feedback

- [x] Review the existing avatar upload mutation and toast setup.
- [x] Define loading, success, and error feedback copy.
- [x] Add an accessible upload spinner and disabled state.
- [x] Add success and error toast notifications for upload outcomes.
- [x] Verify feedback rendering, tests, build, and responsive settings UI.
- [x] Save a delivery checkpoint.
- [x] Manually exercise avatar upload success and failure paths in the browser to confirm spinner and toast rendering.
- [x] Save a new checkpoint containing the avatar-upload spinner and toast feedback changes.
- [x] Add a protected server endpoint that generates a PDF only for the authenticated user's paid assessment report.
- [x] Add a dashboard download action with loading, error, and disabled states.
- [x] Add authorization and PDF-content tests for paid and unpaid attempts.
- [x] Verify the dashboard download flow, type checks, tests, build, and responsive UI.
- [x] Save a checkpoint for the PDF report download feature.
- [x] Strengthen PDF tests to assert meaningful participant and report content in the rendered paid-assessment artifact.
- [x] Verify the updated dashboard download action on a mobile viewport.
- [x] Save a new checkpoint that includes the verified PDF report download feature after the final passing tests and mobile dashboard verification.
- [x] Select a transactional email delivery approach and configure its required secret.
- [x] Email the generated PDF report after verified payment completion with safe delivery-state handling.
- [x] Add email delivery tests and preserve dashboard download behavior.
- [x] Verify the end-to-end report email flow, type checks, tests, build, and responsive UI.
- [x] Save a checkpoint for automatic PDF report email delivery.
- [x] Make report-email sending truly idempotent across webhook and browser verification paths with an atomic claim and retry for paid-but-unsent reports.
- [x] Trigger a real paid-report completion to a controlled inbox and verify receipt with the PDF attachment and correct sender/subject.
- [x] Verify the assessment completion email-status message on a mobile viewport.
- [x] Save a new checkpoint that includes the verified automatic PDF email delivery feature.
- [x] Save a new checkpoint that includes the verified automatic PDF email delivery feature after the final passing tests, real inbox verification, and mobile assessment-page review.
- [x] Add current email-delivery status data to the user assessment history response.
- [x] Add accessible sent, sending, and retry-available indicators to paid report cards.
- [x] Add tests and verify desktop/mobile dashboard rendering.
- [x] Save a checkpoint for the dashboard email-delivery indicator.
- [x] Save a new checkpoint that includes the verified dashboard email-delivery indicator after the passing tests and desktop/mobile dashboard review.
- [x] Add a protected resend-report-email procedure scoped to the signed-in user's own paid report.
- [x] Add a Resend email button for failed or pending report delivery with loading and toast feedback.
- [x] Add resend authorization and delivery tests and verify desktop/mobile dashboard rendering.
- [x] Save a checkpoint for the manual report-email resend feature.
- [x] Exercise the dashboard Resend email action in the browser and verify its loading spinner plus success/error toast behavior.
- [x] Add a resend test covering the already-in-progress conflict path when email delivery is claimed.
- [x] Re-run desktop/mobile dashboard verification after the final resend-button visibility change.
- [x] Save a new checkpoint for the manual report-email resend feature after all final verification.
- [x] Exercise the dashboard Resend email action again and explicitly verify the loading spinner plus success toast; also trigger and verify the resend error/conflict toast path.
- [x] Save a new checkpoint that includes the verified manual report-email resend feature after final browser verification.
- [x] Save a final checkpoint after the confirmed resend loading state, success toast, conflict-path test, and full validation suite.
- [x] Add an inline last-emailed timestamp beside sent report delivery status.
- [x] Preserve a clear pending/in-progress presentation when no sent timestamp exists.
- [x] Add tests and verify desktop/mobile dashboard rendering.
- [x] Save a checkpoint for the last-emailed timestamp feature.
- [x] Add automated coverage for the last-emailed timestamp display or rendering logic, then re-run the relevant tests.
- [x] Save a new checkpoint that includes the verified last-emailed timestamp feature after the tests and responsive dashboard review.
- [x] Save a final checkpoint after the executed shared timestamp test coverage, responsive dashboard review, and full validation suite.
- [x] Add a small email icon adjacent to the delivery status and last-emailed timestamp.
- [x] Preserve accessible text and pending/in-progress status behavior.
- [x] Verify desktop/mobile dashboard rendering and run tests/build.
- [x] Save a checkpoint for the email-icon refinement.
- [x] Save a final checkpoint after the verified email-icon refinement, responsive screenshots, tests, and production build.
- [x] Add a subtle spin animation to the email icon during active resend.
- [x] Respect prefers-reduced-motion and preserve static sent/pending icon states.
- [x] Verify animation markup, desktop/mobile dashboard rendering, tests, and build.
- [x] Save a checkpoint for the resend icon animation.
- [x] Save a final checkpoint after the verified resend icon animation, responsive screenshots, tests, and production build.
- [x] Upload the provided Profound IQ logo to project-managed storage and configure the app logo value.
- [x] Replace text/placeholder branding with the provided logo across public, dashboard, assessment, settings, and report surfaces.
- [x] Configure the provided logo as the browser favicon and verify document metadata.
- [x] Add branding regression coverage and verify desktop/mobile rendering plus production build.
- [x] Save a checkpoint for the provided logo and favicon rollout.
- [x] Verify the connected GitHub repository with a read-only metadata and commit fetch, then document its capabilities.
- [x] Add analytics event tracking for assessment starts, payment completions, and report downloads across client and server flows.
- [x] Add an admin-only branded email template editor with persisted templates and safe rendering fields.
- [x] Add an admin-only course enrollment CSV export workflow with appropriate privacy boundaries.
- [x] Add tests for analytics events, email template authorization/persistence, and CSV export behavior.
- [x] Verify responsive admin UI, run type checks/tests/build, and save a final checkpoint.
- [x] Instrument payment-completion analytics in the signed Paystack webhook path and cover both browser and webhook completion routes.
- [x] Add allowed-token validation and deterministic preview rendering for branded email templates.
- [x] Add behavioral tests for analytics persistence, template save/reload, and CSV headers/escaping/rows.
- [x] Deliver the GitHub connector capability summary with repository metadata and a fetched commit example.
- [x] Save a new final checkpoint after the hardening work and full validation.
- [x] Add safe rich-text formatting controls to the admin email template editor.
- [x] Expand approved email variables to include user email and date, with live preview and validation.
- [x] Add admin analytics summaries and charts for assessment starts, payment completions, report downloads, and enrollment submissions.
- [x] Add date-range and status filters to the enrollment CSV export workflow.
- [x] Add tests for formatting, variables, analytics aggregation, and filtered exports; verify responsive admin UI and save a checkpoint.
- [x] Add an admin-only test email preview action that renders the selected template with safe sample variables and sends it to the authenticated admin email.
- [x] Add funnel conversion-rate summaries and weekly trend charts for assessment starts, payment completions, report downloads, and course inquiries.
- [x] Add a weekly scheduled enrollment export that generates CSV data and stores the report in managed storage with idempotent execution.
- [x] Add tests for test-email authorization/rendering, funnel and weekly aggregation, and scheduled export behavior.
- [x] Verify the updated admin UI, run type checks/tests/build, save a checkpoint, and document deployment/schedule prerequisites.
- [x] Add a schedule status card with latest run time, report link, and export history.
- [x] Add prior-period funnel comparisons and configurable conversion benchmarks to analytics.
- [x] Persist test-email delivery records and show preview history in the template editor.
- [x] Add authorization and behavior tests for status, comparisons, benchmarks, and email history.
- [x] Verify responsive admin workflows, run checks/tests/build, and save a checkpoint.
- [x] Add behavioral tests for scheduled export status and report history responses, including latest run and downloadable run list.
- [x] Save a checkpoint after the schedule-status, funnel-comparison, and preview-history changes are fully validated.
- [x] Add admin retry controls for failed test emails with provider error details.
- [x] Add a configurable scheduled-export retention policy with safe cleanup of reports older than 30 days.
- [x] Persist custom conversion benchmark targets per admin account and restore them across sessions.
- [x] Add authorization and behavior tests for retries, retention cleanup, and benchmark persistence.
- [x] Verify responsive admin workflows, run checks/tests/build, and save a checkpoint.
- [x] Document and surface that the managed-storage layer removes expired export references from admin history but does not expose an underlying object-delete endpoint.
- [x] Add non-admin authorization tests for retryTemplateTestEmail, saveAnalyticsSettings, and updateExportRetention.
- [x] Save a new checkpoint after the retry, retention, and persistent benchmark changes are fully validated.
- [x] Add clear frontend login and registration entry points using the existing secure OAuth/session flow and database-backed user provisioning.
- [x] Add visual below-benchmark alerts to the analytics funnel using persisted admin targets.
- [x] Add search and status filters to the test-email delivery history.
- [x] Email admins on scheduled CSV export success and failure with safe error details.
- [x] Add authorization and behavior tests, verify responsive workflows, run checks/tests/build, and save a checkpoint.
- [x] Add a clear empty state when delivery-log search or status filters return no matches.
- [x] Send scheduled-export success/failure notifications to all admin users with verified email addresses and test recipient coverage.
- [x] Re-run responsive verification, mark the gap fixes complete, and save a final checkpoint.
- [x] Add an explicit verified-email rule for scheduled-export admin recipients and cover recipient selection in tests.
- [x] Re-run desktop/mobile verification after the final delivery-log and recipient changes.
- [x] Save the final checkpoint after all gap fixes pass.

# Admin Verification and Delivery Log Enhancements

- [x] Add an admin-only user verification eligibility query with safe user fields and pagination.
- [x] Add an admin-only mutation to revoke a user’s email-verification eligibility with audit-safe timestamp handling.
- [x] Add paginated delivery-log query inputs for search, status, and UTC date range.
- [x] Add a delivery-log CSV export procedure with matching filters and safe CSV escaping.
- [x] Build the admin verification review/revoke control panel.
- [x] Build delivery-log advanced filters, pagination controls, result counts, and CSV download.
- [x] Add authorization and behavior tests for verification revocation, filtering, pagination, and CSV export.
- [x] Run type checks, tests, production build, and responsive desktop/mobile verification.
- [x] Save a checkpoint containing all admin enhancements.

# Verification Audit and Background Delivery Exports

- [x] Add a verification revocation audit table with target user, admin actor, reason, and UTC timestamp.
- [x] Add a durable delivery-log export job table and idempotent queue-processing handler.
- [x] Add admin procedures to create, monitor, and download completed delivery-log export jobs.
- [x] Add admin-only revocation procedure requiring a validated reason and audit record.
- [x] Replace browser confirmation with a reason-required confirmation modal.
- [x] Add export-job status UI and audit-history UI to the admin workspace.
- [x] Add tests for audit persistence, reason validation, queue processing, export status, and authorization.
- [x] Run schema migration, type checks, tests, production build, and responsive verification.
- [x] Save a checkpoint containing the audit, queue, and modal enhancements.

# Verification Audit History Enhancements
- [x] Add shared audit-history filters, pagination, and safe CSV serialization contracts.
- [x] Add server-side paginated audit queries filtered by admin and UTC date range.
- [x] Add an admin-only audit CSV export procedure with compliance-safe fields.
- [x] Build paginated audit history UI with admin/date filters and empty states.
- [x] Add CSV download behavior and preserve admin authorization boundaries.
- [x] Add tests for filtering, pagination, CSV escaping, export status, and authorization.
- [x] Run type checks, tests, production build, and responsive desktop/mobile verification.
- [x] Save a checkpoint containing the audit-history enhancements.

# Local Credential Authentication
- [x] Add credential fields and password-reset token storage using secure schema contracts.
- [x] Implement registration with unique email, phone, and username validation.
- [x] Implement password login accepting email, phone number, or username.
- [x] Implement secure session issuance and logout compatibility with existing OAuth sessions.
- [x] Implement generic password-reset request responses and expiring single-use reset tokens.
- [x] Send password-reset links through the configured transactional email provider.
- [x] Build registration, login, forgot-password, and reset-password interfaces.
- [x] Add authorization, validation, enumeration-resistance, token-expiry, and password-hashing tests.
- [x] Run schema migration, type checks, tests, production build, and responsive verification.
- [x] Save a checkpoint containing the local credential authentication enhancement.

# Authentication Security Enhancements
- [x] Add a real-time password-strength meter to registration and reset-password forms.
- [x] Confirm password recovery remains email-only; no SMS provider is required.
- [x] Keep password-reset delivery email-only using the existing single-use, expiring email token flow.
- [x] Add server-side login rate limiting with safe per-identifier and network controls.
- [x] Track repeated failed logins and email administrators at the alert threshold.
- [x] Add tests for strength scoring, rate limiting, alert thresholds, and enumeration resistance; recovery remains email-only by decision.
- [x] Run type checks, tests, production build, and responsive authentication verification.
- [x] Save a checkpoint containing the authentication security enhancements.

# Login Security and Session Visibility
- [x] Add a user-facing rate-limit countdown with automatic refresh when the lockout expires.
- [x] Add durable login-event history with safe identifier and network redaction.
- [x] Add active-session listing and revoke-current/other-session controls scoped to the signed-in user, including a dedicated current-device sign-out action.
- [x] Add persisted admin security settings for failed-login alert threshold and review window.
- [x] Add an admin security panel for failed-login review, filtering, and threshold configuration.
- [x] Add profile settings UI for recent login history and active sessions.
- [x] Add tests for countdown behavior, explicit user login-history redaction, session ownership, revocation, and admin settings authorization.
- [x] Run type checks, tests, production build, and responsive verification for auth, admin, and profile flows.
- [x] Save a checkpoint containing the login-security and session-visibility enhancements.

# Security Observability and Trusted Devices

- [x] Add persisted configurable login-event retention settings with bounded values.
- [x] Add safe admin security-log export with retention-aware cleanup and CSV serialization.
- [x] Add an optional trusted-device login flow with explicit consent and security messaging.
- [x] Store privacy-safe estimated location and device type metadata on active sessions.
- [x] Display estimated location and device type in the active sessions view.
- [x] Add admin authorization, retention, export, trusted-device, and metadata privacy tests.
- [x] Run schema migration, type checks, tests, production build, and responsive verification.
- [x] Save a checkpoint containing the security observability and trusted-device enhancements.

# Login Analytics and Recent Activity

- [x] Add privacy-safe server aggregation for login-event trends and device classifications over time.
- [x] Add an admin-only analytics procedure with bounded date-range inputs and authorization coverage.
- [x] Build Admin login trend and device classification visualizations consistent with the Executive Observatory design.
- [x] Create a user-facing Recent Activity section in Settings with login history and active sessions.
- [x] Add safe self-scoped revoke controls for unrecognized sessions with accessible confirmation feedback.
- [x] Add tests for aggregation, authorization, privacy redaction, and session revocation behavior.
- [x] Run type checks, tests, production build, and responsive verification for Admin and Settings.
- [x] Save a checkpoint containing the login analytics and Recent Activity enhancements.

# Security Observatory UX Refinements

- [x] Add daily/weekly granularity support to Admin login trend and device-classification analytics.
- [x] Add a Recent Activity login-history filter for device type and estimated location.
- [x] Add an accessible warning confirmation modal before revoking any active user session.
- [x] Add tests for granularity aggregation, activity filtering, and revoke-confirmation behavior.
- [x] Run type checks, tests, production build, and responsive verification for Admin and Settings.
- [x] Save a checkpoint containing the security observatory UX refinements.

# Professional Assessment Report Enhancement

- [x] Expand assessment dimension readouts with detailed, strengths-based professional interpretation.
- [x] Add adaptable reflection points for leadership, learning, collaboration, and career contexts.
- [x] Add an important-context section covering interpretation boundaries, situational factors, and practical use.
- [x] Apply the enhanced content consistently to the user report view and generated PDF report.
- [x] Add regression tests for dimension, reflection, context, and PDF content coverage.
- [x] Run type checks, tests, production build, and responsive/report verification.
- [x] Save a checkpoint containing the enhanced professional assessment report.

# Report Evolution and Longitudinal Insights

- [x] Add a reusable executive one-page summary to the assessment report and PDF.
- [x] Add selectable leadership, career-transition, and team-development report lenses.
- [x] Add persisted assessment report version records for paid report results.
- [x] Add self-scoped version history and comparison data for authenticated users.
- [x] Add report UI for switching lenses and comparing results over time.
- [x] Add tests for summary content, role lenses, version persistence, comparison privacy, and PDF output.
- [x] Run schema migration, type checks, tests, production build, and responsive verification.
- [x] Save a checkpoint containing the report evolution enhancements.

# Report Sharing and Professional Delivery

- [x] Add lens-aware PDF export that includes the selected role lens and executive summary.
- [x] Add secure temporary report share links with expiry, revocation, and consent-aware access.
- [x] Add visual trend charts to the report-version comparison panel.
- [x] Ensure all report reflection prompts contain detailed, adaptable professional content.
- [x] Create and validate a reusable skill for this report-enhancement workflow.
- [x] Add tests for share-link authorization, expiry, revocation, lens-aware PDF content, trends, and reflection completeness.
- [x] Run type checks, tests, production build, and responsive verification.
- [x] Save a checkpoint containing the report-sharing and professional-delivery enhancements.

# Share Consent and Detailed Trend Enhancements

- [x] Add explicit consent before generating a report share link.
- [x] Add customizable bounded expiry presets for report share links.
- [x] Persist the selected role lens with each share and render lens-aware shared views.
- [x] Add per-dimension trend lines to the report version comparison chart.
- [x] Ensure all shared and exported report reflection prompts remain detailed and non-empty.
- [x] Update and validate the reusable assessment-report workflow skill with the new patterns.
- [x] Add tests for consent, expiry presets, lens sharing, trend data, and reflection completeness.
- [x] Run type checks, tests, production build, and responsive verification.
- [x] Save a checkpoint containing these share and comparison enhancements.

# Share Governance and Chart Controls

- [x] Add owner-only audit history for share consent, creation, and revocation events.
- [x] Add an optional recipient-purpose field for coaching or manager conversations.
- [x] Persist and display recipient purpose without exposing it in public report payloads.
- [x] Add interactive legend toggles for individual dimension trend lines.
- [x] Update and validate the reusable report-sharing skill with audit and chart-control guidance.
- [x] Add tests for audit ownership, purpose validation, event persistence, and chart-series visibility.
- [x] Run type checks, tests, production build, and responsive verification.
- [x] Save a checkpoint containing the share-governance enhancements.

# Reflection and Share Audit Usability

- [x] Fix dimension Reflection prompts so detailed content is visibly rendered below each dimension readout.
- [x] Add owner-only share-audit filters for report version and event type.
- [x] Add owner-only CSV export for filtered share-audit history.
- [x] Add show-all and hide-all controls for comparison chart dimension lines.
- [x] Update and validate the reusable assessment-report skill with reflection and audit-export patterns.
- [x] Add tests for non-empty reflection rendering, audit filters, CSV escaping, ownership, and chart bulk controls.
- [x] Run type checks, tests, production build, and responsive verification.
- [x] Save a checkpoint containing the reflection and audit usability enhancements.

# CareerPath Career Pathway and Talent Fit Assessment

- [x] Review the attached CareerPathway & Talent Fit Assessment document and map its requirements into the product.
- [x] Define competency-based learner assessment sections, scoring dimensions, and career/talent-fit output contracts.
- [x] Add a dedicated CareerPath assessment entry flow with KES 999 pricing and explicit consent.
- [x] Connect CareerPath payment initialization and verification to the existing Paystack integration.
- [x] Add secure CareerPath results with learner-friendly pathway, strengths, development, and talent-fit guidance.
- [x] Add CareerPath report history and delivery integration without exposing unpaid or cross-user data.
- [x] Add tests for CareerPath scoring, payment amount, ownership, and report privacy.
- [x] Run production build and responsive verification for the CareerPath flow.
- [x] Save a checkpoint containing the CareerPath release.

# CareerPath Reporting and Sub-Pathways

- [x] Add CareerPath attempt history to the authenticated user dashboard.
- [x] Add seven CareerPath sub-pathway scores: Pure Sciences, Applied Sciences, Technical Studies, Languages, Humanities, Arts, and Sports.
- [x] Add branded CareerPath PDF generation with sub-pathway content.
- [x] Add automated CareerPath report email delivery and delivery status handling.
- [x] Enforce KES 999 payment verification before generating or returning CareerPath reports.
- [x] Add tests for CareerPath history ownership, payment gating, sub-pathway scoring, PDF output, and email delivery.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing the CareerPath reporting enhancements.

# CareerPath Visuals, Test Fixtures, and Checkout Feedback
- [x] Add a downloadable coaching image visual (SVG) for the authenticated learner’s sub-pathway comparison.
- [x] Add safe multi-version test fixtures and a local-only preview path for mobile trend-line legend verification without seeding real customer data.
- [x] Add Paystack checkout loading animation and clear success-state feedback for the KES 200 and KES 999 flows.
- [x] Add regression tests for visual export contracts, multi-version chart controls, and checkout state transitions.
- [x] Run type checks, full tests, production build, and desktop/mobile responsive verification.
- [x] Save a checkpoint containing the visuals, fixtures, and checkout feedback enhancements.

# Coaching Visual PNG, QA Toggle, and Receipt Email
- [x] Add a PNG export option alongside the existing SVG CareerPath coaching visual.
- [x] Add a dedicated QA-only multi-version fixture toggle in Settings and connect it to the dashboard preview.
- [x] Attach the coaching visual to the automated email sent after verified Paystack CareerPath completion.
- [x] Add regression tests for PNG conversion, QA toggle behavior, and coaching-visual email attachments.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing the PNG export, QA toggle, and receipt-email enhancements.

# Coaching Visual Preview, Strengths Summary, and PNG Feedback
- [x] Add a preview modal for the CareerPath coaching visual before download or email delivery.
- [x] Add a concise top-strengths summary to automated CareerPath receipt emails.
- [x] Add an accessible PNG generation/download spinner and success toast feedback.
- [x] Add regression coverage for modal data, top-strengths email copy, and PNG feedback states.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing the preview, email summary, and PNG feedback enhancements.

# Coaching Notes, Assessment Pagination, and KES 20 Pricing
- [x] Add a Copy to Clipboard action to the coaching-visual preview modal.
- [x] Add a branded header and footer to automated CareerPath receipt emails.
- [x] Allow optional personal notes to be added to the strengths summary before receipt email delivery.
- [x] Add paginated assessment navigation with an accessible progress bar.
- [x] Update the standard professional assessment price to KES 20 across checkout and reporting copy.
- [x] Add regression coverage for clipboard fallback, email branding/notes, pagination/progress, and KES 20 pricing.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

- [x] Correct the stale homepage standard-assessment price label from KES 200 to KES 20 and revalidate the visible copy.
