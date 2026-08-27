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

# Learner Receipt Preview, Progress Labels, and CareerPath KES 20 Pricing
- [x] Add a pre-payment learner receipt preview screen showing strengths summary, personal notes, and delivery details.
- [x] Add percentage completion and clear step labels to the assessment progress bar.
- [x] Add a download fallback when clipboard image copying is unsupported on mobile browsers.
- [x] Change the CareerPath assessment price from KES 999 to KES 20 across checkout, verification, copy, and tests.
- [x] Add regression coverage for preview content, progress labels, clipboard fallback, and CareerPath KES 20 pricing.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Receipt Titles, Resume Links, Preview Themes, and Module Pagination
- [x] Allow learners to edit the receipt subject or coaching-session title in the pre-payment preview.
- [x] Add a secure Save and Continue Later flow that emails a resume link without exposing raw answers.
- [x] Add a light/dark theme toggle to the receipt preview screen.
- [x] Arrange assessment questions by module in pagination with clear module navigation and progress.
- [x] Add regression coverage for receipt title handling, resume tokens, preview themes, and module pagination.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these learner UX enhancements.

# Resume Recovery, Module Overview, and Save Confirmation
- [x] Add a user-friendly expired-resume error page with a Start Over action.
- [x] Add a slide-out assessment module overview drawer with completion badges.
- [x] Add a save-success modal with a resend resume-email action.
- [x] Add regression coverage for expired links, module completion badges, and resend behavior.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these assessment UX enhancements.

# Inline Module Completion, Resume Link Copy, and Minimal Receipt Review
- [x] Add visible completed/checkmark states to inline module navigation controls.
- [x] Make completion badges in the overview drawer clickable for direct module navigation.
- [x] Add a Copy Resume Link fallback action to the save-success modal.
- [x] Remove the detailed top-strengths block from pre-payment receipt review and keep minimal information.
- [x] Add regression coverage for completion states, badge navigation, resume-link copying, and minimal receipt content.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these assessment UX refinements.

# Assessment Progress Summary, Copy Confirmation, and Navigation Guard
- [x] Add a compact completed-modules summary to the assessment header.
- [x] Confirm successful resume-link copying with a toast notification.
- [x] Add a confirmation prompt before navigating to a completed module from the overview drawer.
- [x] Add regression coverage for summary counts, copy success feedback, and navigation guards.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these assessment progress refinements.

# Saved Timestamp, Sticky Mobile Progress, and Prompt Preference
- [x] Add a persistent last-saved timestamp beside the assessment progress summary.
- [x] Add a sticky compact mobile progress summary for long assessment pages.
- [x] Add a “Don’t show this again” preference to the completed-module navigation prompt.
- [x] Add regression coverage for timestamp persistence, mobile summary semantics, and prompt preference behavior.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these assessment progress refinements.

# Manual Save, Learner Preferences, and Save Pulse
- [x] Add a manual Save Now button beside the last-saved timestamp without sending a new email.
- [x] Add a learner preferences modal for reviewing and resetting navigation-warning choices.
- [x] Add a subtle visual pulse to the last-saved timestamp after a successful save.
- [x] Add regression coverage for manual save behavior, preference reset, and pulse state.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these assessment progress refinements.

# Auto-save, Local Resume Prompt, and Assessment Theme Preference
- [x] Auto-save locally after every answered question and update the pulsing saved timestamp.
- [x] Add a landing-page Resume previous session prompt when a local draft is detected.
- [x] Add a light/dark theme toggle to Assessment Preferences and apply it to the assessment experience.
- [x] Add regression coverage for auto-save, local-draft detection/resume, and theme preference behavior.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these assessment enhancements.

# Saved Data Clearing, System Theme Sync, and Module Navigation
- [x] Add a Clear saved data action in Assessment Preferences for local drafts and save metadata.
- [x] Default assessment theme to the system preference while preserving a manual light/dark override.
- [x] Show a brief Draft restored successfully toast after resuming a local session.
- [x] Provide clear Previous module and Next module navigation throughout the assessment.
- [x] Add regression coverage for clear-data behavior, system theme fallback, restore feedback, and module navigation.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these assessment improvements.

# Clear-Data Confirmation, Keyboard Navigation, and Resume Summary
- [x] Add a confirmation dialog before permanently clearing saved assessment data.
- [x] Add left/right arrow-key shortcuts for Previous module and Next module navigation.
- [x] Show the saved module name and completion percentage in the Resume previous session prompt.
- [x] Add regression coverage for delete confirmation, keyboard navigation, and resume summary values.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these assessment navigation refinements.

# Resume Progress Bar, Navigation Toast, and Export Before Clear
- [x] Add a visual progress bar to the Resume previous session prompt.
- [x] Show a subtle success toast after arrow-key module navigation.
- [x] Add an export/download current progress action to the clear-data confirmation dialog.
- [x] Add regression coverage for the new resume, toast, and export contracts.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these progress-management enhancements.

# Resume Progress Animation and Escape Toast Dismissal
- [x] Add a smooth entrance fill animation to the Resume previous session progress bar.
- [x] Add Escape-key dismissal for visible toast notifications.
- [x] Add regression coverage for the animation and Escape dismissal contracts.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these interaction refinements.

# Resume Preference, Toast Hover Pause, and Module Tooltip
- [x] Add a “Don’t show again” checkbox to the Resume previous session prompt.
- [x] Persist the resume-prompt preference and allow users to restore the prompt from preferences.
- [x] Pause toast auto-dismiss while a toast is hovered.
- [x] Add a progress-bar tooltip showing exact completed modules out of the total.
- [x] Add regression coverage for the preference, hover pause, and tooltip contracts.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these learner preference refinements.

# Completion Celebration, Import Progress, and Landing Settings Shortcut
- [x] Add a subtle completion celebration when saved progress reaches 100%.
- [x] Respect reduced-motion preferences for the completion celebration.
- [x] Add Import Progress to restore a previously downloaded assessment JSON file locally.
- [x] Validate imported progress safely and show clear success or error feedback.
- [x] Add a main-screen settings icon to restore a hidden Resume previous session prompt.
- [x] Add regression coverage for celebration, import validation, and settings restoration.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these assessment recovery enhancements.

# Share Results, Drag-and-Drop Import, and Settings Tooltip
- [x] Add a Share Results action to the 100% completion celebration.
- [x] Provide a local/share-sheet fallback with clear success and error feedback.
- [x] Add a drag-and-drop zone for JSON Import Progress uploads.
- [x] Preserve validation and keyboard file-selection support for imports.
- [x] Add a descriptive tooltip explaining the settings icon manages resume preferences.
- [x] Add regression coverage for sharing, drag-and-drop import, and the tooltip.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these celebration and import enhancements.

# Transformation Services and Completion Credential Enhancements
- [x] Group Self Assessment and CareerPath under a Transformation Services service category.
- [x] Apply recent resume, progress, import, navigation, completion, and sharing UX patterns across Transformation Services.
- [x] Add a downloadable completion badge or certificate for fully completed assessments.
- [x] Add an import preview showing saved module and response count before replacement.
- [x] Add localized WhatsApp and email sharing actions to Share Results.
- [x] Add regression coverage for grouping, credential download, import preview, and localized sharing.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing the Transformation Services release.

# Unified Transformation Services Navigation
- [x] Create a shared branded navigation component for Transformation Services.
- [x] Use the same navigation on Self Assessment and CareerPath pages.
- [x] Include consistent service switching, home/contact, workspace, and mobile menu behavior.
- [x] Add regression coverage for shared navigation rendering and links.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing the unified navigation update.

# Transformation Services Header Enhancements
- [x] Add a breadcrumb trail below the standardized Transformation Services navigation.
- [x] Add a smooth reduced-motion-aware transition when switching between Self Assessment and CareerPath.
- [x] Add an authenticated user profile dropdown to the standardized header.
- [x] Provide quick profile-menu links to saved progress, certificates, and settings.
- [x] Add regression coverage for breadcrumbs, transition behavior, and profile-menu destinations.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing the enhanced Transformation Services header.

# Shared Header Theme, Certificate Badge, and Quick Search
- [x] Add a light/dark theme toggle to the authenticated profile dropdown.
- [x] Persist the selected theme across Transformation Services pages.
- [x] Add a certificate notification badge when a new certificate is available.
- [x] Add a quick-search bar for modules and topics across Transformation Services.
- [x] Add keyboard-accessible search results and service-aware navigation.
- [x] Add regression coverage for theme switching, certificate badge, and quick search.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing the shared header enhancements.

# Recent Searches, Auto Theme, and Certificate Toast
- [x] Add a Recent Searches section that appears when the quick-search dropdown opens.
- [x] Persist a concise recent-search history and allow selecting a recent query.
- [x] Add an Auto theme mode that follows system light/dark preference changes.
- [x] Preserve manual light/dark overrides across sessions.
- [x] Show a celebratory toast when a new certificate is awarded with a direct View certificate link.
- [x] Add regression coverage for recent searches, Auto theme behavior, and certificate toast linking.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these shared-header refinements.

# Certificate Toast Sharing, Theme Fade, and Reusable Skill
- [x] Add a Share action directly inside the new-certificate toast.
- [x] Route toast sharing through native sharing with clipboard fallback.
- [x] Add a smooth reduced-motion-aware fade transition when the theme changes, including Auto mode updates.
- [x] Create a reusable skill documenting the Transformation Services UX workflow and patterns.
- [x] Validate the skill package with the official skill validator.
- [x] Add regression coverage for toast sharing and theme fade behavior.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing the website refinements.

# Transformation Services Navigation Improvement
- [x] Audit navigation across Self Assessment, CareerPath, report, recovery, and module-level flows.
- [x] Improve service switching, breadcrumbs, quick search, and workspace access hierarchy.
- [x] Improve module-level Previous, Next, overview, completion, and keyboard navigation clarity.
- [x] Standardize mobile navigation and persistent progress context across Transformation Services.
- [x] Add regression coverage for the improved navigation flows.
- [x] Run type checks, full tests, production build, and desktop/mobile verification.
- [x] Complete and validate the reusable Transformation Services UX skill documentation.
- [x] Save a checkpoint containing the navigation improvements.

# Collapsible Module Rail, Search Highlights, and Score Tooltips
- [x] Add an accessible toggle to collapse and expand the sticky module rail.
- [x] Persist the rail’s collapsed preference locally across assessment sessions.
- [x] Highlight quick-search keywords in matching module-rail labels.
- [x] Add exact section-score tooltips to completed module indicators.
- [x] Add regression coverage for rail collapse, search highlighting, and score tooltips.
- [x] Run type checks, full tests, production build, and desktop/mobile verification.
- [x] Save a checkpoint containing the module-rail refinements.

# Collapsed Progress, Search Keyboard Navigation, and Review Links
- [x] Add a circular overall-progress indicator to the collapsed current-module rail.
- [x] Add Up/Down keyboard navigation through highlighted quick-search results.
- [x] Add an accessible active-result state and Enter activation for search navigation.
- [x] Add a Review Section action to completed-score tooltip content.
- [x] Add regression coverage for circular progress, search keyboard navigation, and review actions.
- [x] Run type checks, full tests, production build, and desktop/mobile verification.
- [x] Save a checkpoint containing these module-rail accessibility refinements.

# Module Rail Shortcut, Mobile Review Mode, and Improvement Guidance
- [x] Add Ctrl+M to toggle the module rail collapse state.
- [x] Preserve shortcut safety by ignoring editable fields and exposing accessible shortcut guidance.
- [x] Add a focused mobile review mode when Review Section is activated on smaller screens.
- [x] Show potential score improvement guidance beside the Review Section action.
- [x] Add regression coverage for Ctrl+M, mobile review mode, and improvement indicators.
- [x] Run type checks, full tests, production build, and desktop/mobile verification.
- [x] Save a checkpoint containing these module-rail refinements.

# Sitewide Transformation Navigation and Module Filters
- [x] Apply the standardized Transformation Services navigation to all Self Assessment and CareerPath routes and states.
- [x] Add a smooth reduced-motion-aware slide-in animation to focused mobile review mode.
- [x] Add a module-rail filter for sections with the highest potential improvement scores.
- [x] Add a visible Ctrl+M shortcut hint or tooltip near the rail toggle.
- [x] Add regression coverage for sitewide navigation, slide-in review mode, filtering, and shortcut guidance.
- [x] Run type checks, full tests, production build, and desktop/mobile verification.
- [x] Save a checkpoint containing the sitewide navigation update.

# Improvement Sorting and Profile Score Summary Export
- [x] Add a sort option to order high-potential sections by largest possible score increase.
- [x] Persist the selected high-potential sort mode locally.
- [x] Add a profile-dropdown action to download a PDF summary of the user’s assessment scores.
- [x] Ensure the PDF summary is user-specific and handles empty or unavailable score history gracefully.
- [x] Add regression coverage for improvement sorting and profile PDF export.
- [x] Run type checks, full tests, production build, and desktop/mobile verification.
- [x] Save a checkpoint containing the filter and export enhancements.

# CareerPath Module Navigation Optimization
- [x] Audit CareerPath module-level navigation, progress, and completion states.
- [x] Add clearer module overview and active-module context for CareerPath learners.
- [x] Add efficient Previous/Next and direct module-jump controls with safe navigation behavior.
- [x] Improve mobile navigation with a compact sticky progress context.
- [x] Align CareerPath navigation interactions with the shared Transformation Services patterns.
- [x] Add regression coverage for CareerPath navigation and responsive behavior.
- [x] Run type checks, full tests, production build, and desktop/mobile verification.
- [x] Save a checkpoint containing the CareerPath navigation improvements.

# CareerPath Save/Resume and Mobile Module Drawer
- [x] Add CareerPath Save and Continue Later with local draft persistence and exact module resumption.
- [x] Add a save-success state with clear recovery guidance and last-saved context.
- [x] Add visual completion badges to fully finished CareerPath modules.
- [x] Add a compact swipeable mobile drawer for direct CareerPath module navigation.
- [x] Preserve keyboard, touch, and accessible navigation semantics across the drawer.
- [x] Add regression coverage for CareerPath save/resume, badges, and mobile drawer behavior.
- [x] Run type checks, full tests, production build, and desktop/mobile verification.
- [x] Save a checkpoint containing the CareerPath navigation recovery update.

# CareerPath Drawer Affordance and Completion Celebration
- [x] Add a drag handle icon at the top of the mobile CareerPath module drawer.
- [x] Add a subtle reduced-motion-aware bounce animation to indicate the drawer can be swiped.
- [x] Detect final CareerPath completion and show a celebratory confetti state.
- [x] Add an immediate Download Certificate action when the final completion badge is earned.
- [x] Add regression coverage for drawer affordances, final completion detection, confetti, and certificate download.
- [x] Run type checks, full tests, production build, and desktop/mobile verification.
- [x] Save a checkpoint containing the CareerPath completion refinements.

# My Certificates, Preview, and LinkedIn Sharing
- [x] Add a My Certificates section to the authenticated profile dropdown.
- [x] Allow users to view and re-download previously earned certificates from the certificates destination.
- [x] Add a miniature generated-certificate preview to the CareerPath completion celebration.
- [x] Add a Share to LinkedIn action beside Download Certificate.
- [x] Preserve accessible labels, authenticated routing, and sharing fallbacks.
- [x] Add regression coverage for certificate access, preview, and LinkedIn sharing.
- [x] Run type checks, full tests, production build, and desktop/mobile verification.
- [x] Save a checkpoint containing the certificate experience enhancements.

# Professional Course Learning Platform
- [x] Replace the simple course metadata with detailed professional curriculum content for every existing course.
- [x] Define 10 modules per course, with 7 lessons and a 15-question quiz per module.
- [x] Add automatic quiz availability after lesson 7 and aggregate module quiz results into final course results.
- [x] Enforce a 50% quiz pass mark with unlimited learner retries and attempt history.
- [x] Add a modern course enrollment-to-completion workspace with progress, gates, and resume support.
- [x] Set each course price to KES 4,999 and model four 25% staged Paystack charges before modules 1, 4, 7, and certificate request.
- [x] Add server-side payment initialization, verification, idempotency, and stage access controls.
- [x] Add automated professional certificate generation using the supplied certificate design direction.
- [x] Email certificates on completion request and support secure dashboard download and update flows.
- [x] Add authenticated course history, progress, quiz results, staged payment status, and certificate management to the user dashboard.
- [x] Add regression coverage for curricula, quiz scoring/retries, staged payments, certificates, email delivery, and authorization boundaries.
- [x] Run schema migration, type checks, full tests, production build, and desktop/mobile end-to-end verification.
- [x] Save a checkpoint containing the professional course learning platform.

# CareerPath Introduction and Module Step Reorder
- [x] Shorten the CareerPath landing view so introduction, purpose, pricing, and start/resume actions appear before modules.
- [x] Move CareerPath module navigation and questions to a dedicated next step/page.
- [x] Preserve resume drafts, payment callbacks, completion state, shared navigation, and mobile drawer behavior across the step boundary.
- [x] Add regression coverage for the introduction-to-modules transition and deep-link/resume behavior.
- [x] Run type checks, full tests, production build, and responsive verification for both CareerPath steps.
- [x] Save a checkpoint containing the CareerPath reorder.

# CareerPath Step URLs and Progress Sidebar
- [x] Add unique bookmarkable URLs for CareerPath Introduction, Assessment, and Results steps.
- [x] Restore the correct CareerPath step from direct links while preserving draft and payment state.
- [x] Add a visual Introduction → Assessment → Results step indicator at the top of CareerPath.
- [x] Add a desktop-only sticky sidebar with current payment status and overall assessment progress.
- [x] Keep the mobile layout compact without forcing the desktop sidebar into narrow screens.
- [x] Add regression coverage for direct step links and result routing.
- [x] Run type checks, full tests, production build, and responsive route verification.
- [x] Save a checkpoint containing the CareerPath step navigation enhancements.

# Admin Quality Control, Resume URLs, Results History, and Mobile Status
- [x] Allow only profoundiqconsulting@gmail.com to bypass learner checkout gates for quality and content control, with server-side authorization.
- [x] Preserve normal checkout and module-payment gates for all other learners.
- [x] Add a CareerPath URL parameter for the active module and restore it from the URL and saved draft.
- [x] Keep active-module URL state synchronized during module navigation and resume actions.
- [x] Connect CareerPath Results to authenticated past assessment reports and certificate history.
- [x] Add a collapsible mobile progress/payment status panel that remains accessible while scrolling.
- [x] Add regression coverage for admin bypass boundaries, resume URLs, Results history, and mobile status controls.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Quality Control Badge, Cross-Device Resume, and Results Previews
- [x] Add a visible Quality Control Mode badge only for profoundiqconsulting@gmail.com when the bypass is active.
- [x] Add database storage for each authenticated learner’s last active CareerPath module.
- [x] Add protected procedures to read and update the active module without exposing another user’s progress.
- [x] Synchronize CareerPath module navigation and resume state with the server-side active module.
- [x] Show authenticated past assessment report previews directly on the CareerPath Results page.
- [x] Show authenticated certificate previews and download links directly on the CareerPath Results page.
- [x] Add regression coverage for admin badge boundaries, cross-device module resume, and Results history previews.
- [x] Run schema migration, type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Certificate Thumbnails, Resume Conflict Choices, and LinkedIn Sharing
- [x] Add branded certificate thumbnails to authenticated CareerPath history cards.
- [x] Add direct certificate download actions from history cards when a certificate exists.
- [x] Add LinkedIn sharing for the generated CareerPath report and certificate.
- [x] Detect meaningful differences between local CareerPath draft and server active-module state.
- [x] Prompt users to keep local progress or server progress when the versions differ.
- [x] Add regression coverage for thumbnails, LinkedIn actions, and conflict resolution behavior.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Resume Transparency, Certificate URLs, LinkedIn Counts, and Post-Payment Access
- [x] Show exact timestamps, module names, and response progress for local and server resume versions in the conflict prompt.
- [x] Return secure certificate image URLs with authenticated history records and render the actual images on cards.
- [x] Persist and display each user’s LinkedIn certificate-share count.
- [x] Record LinkedIn shares only after the share action is initiated by the authenticated user.
- [x] Improve successful payment navigation with immediate report and certificate access actions.
- [x] Add regression coverage for conflict details, certificate URLs, share counts, and post-payment navigation.
- [x] Run schema migration, type checks, full tests, production build, and responsive payment-flow verification.
- [x] Save a checkpoint containing these enhancements.

# Server Share Ledger, Conflict Comparisons, and Secure Thumbnails
- [x] Add a server-backed per-user share ledger for LinkedIn certificate shares.
- [x] Extend the share ledger to record supported social platforms and display aggregate counts across devices.
- [x] Add protected share-recording and share-count procedures with strict user ownership.
- [x] Replace local-only share counting with server-backed counts and add multi-platform share controls.
- [x] Show exact local/server timestamps, module names, and response-count comparisons in the resume conflict dialog.
- [x] Fetch secure certificate image URLs for authenticated history records and render them as true thumbnails.
- [x] Add regression coverage for share ledger ownership, platform counts, conflict details, and secure thumbnails.
- [x] Run schema migration, type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Resume Comparison Dialog, Authentic Thumbnails, and Share Observatory
- [x] Replace the browser confirmation with a branded resume conflict comparison dialog.
- [x] Show exact local/server timestamps, active module names, and response totals in the comparison dialog.
- [x] Add explicit keep-local and keep-server actions with accessible focus and cancellation behavior.
- [x] Return stored certificate image URLs from authenticated history data and render authentic thumbnails.
- [x] Add an admin-only share analytics procedure for platform totals and trend data.
- [x] Add a simple admin dashboard view for certificate and report shares by social platform.
- [x] Add regression coverage for conflict dialog choices, secure thumbnails, analytics authorization, and trends.
- [x] Run schema migration if required, type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Actionable History, Paystack Error Fix, Share Filters, Thumbnails, and Alerts
- [x] Add clear actions to prior CareerPath records for payment, report generation, certificate download, and social sharing.
- [x] Fix Paystack checkout handling when the server returns HTML or another non-JSON response.
- [x] Add safe user-facing checkout error messages and preserve the raw response only in diagnostics.
- [x] Add a date-range filter to the admin Share Observatory and query filtered platform totals.
- [x] Display secure per-certificate thumbnail URLs in authenticated assessment history records.
- [x] Add configurable share-rate benchmarks and visible admin alerts when engagement falls below target.
- [x] Add regression coverage for history actions, Paystack non-JSON responses, filtered analytics, thumbnails, and alerts.
- [x] Run schema migration if required, type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Paid Reporting Access, Share Trends, Benchmarks, and Action Feedback
- [x] Gate result and certificate viewing, email sending, downloading, and generation behind successful Paystack payment verification.
- [x] Preserve the exact admin quality-control bypass only for the authorized admin identity.
- [x] Add historical time-series data and trend lines to the admin Share Observatory.
- [x] Add configurable per-platform share benchmarks with persisted admin settings.
- [x] Add loading animations and success notifications for report generation and certificate downloads.
- [x] Add regression coverage for paid-only access, share trends, benchmarks, and action feedback.
- [x] Run schema migration if required, type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Branded Outputs, Receipt History, Share Comparisons, and Payment Recovery
- [x] Add the Profound IQ logo, verification QR code, and website address to certificate SVG outputs.
- [x] Add logo, QR verification, website address, and verification metadata to all report PDFs and score summaries.
- [x] Support secure learner email delivery and an explicitly authorized requesting-organization forwarding flow.
- [x] Add payment receipt and transaction history panels beside reports and certificates in user history.
- [x] Add date-range comparison overlays to historical Share Observatory charts.
- [x] Add a Retry Payment action with clear failure/cancellation messaging and safe Paystack re-initialization.
- [x] Create and validate a reusable skill describing the branded output, payment, receipt, sharing, and delivery workflow.
- [x] Add regression coverage and run schema, type, tests, build, and responsive verification.
- [x] Save a checkpoint containing these enhancements and deliver the reusable skill.

# Live Verification, PDF Receipts, and Organization Approval
- [x] Add non-guessable credential verification tokens and a public QR verification route.
- [x] Render a live verification page showing credential authenticity, course/assessment identity, issue date, and verification status without exposing private report content.
- [x] Add PDF receipt generation for every successful Paystack transaction and stage.
- [x] Add authenticated receipt download actions in user transaction history.
- [x] Add secure organization recipient records and report-forwarding approval states.
- [x] Add organization review links with explicit accept/reject actions and audit timestamps.
- [x] Protect organization access, report content, receipt downloads, and verification metadata with server-side authorization.
- [x] Add regression coverage for token verification, receipt ownership, and organization approval boundaries.
- [x] Run schema migration, type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Receipt Branding, Organization Review Queue, and Verification UX
- [x] Add the stored company logo to generated PDF receipts.
- [x] Add a clickable QR verification link and visible verification URL to PDF receipts.
- [x] Add a dedicated admin organization review queue with pending, approved, and rejected states.
- [x] Add secure approve/reject actions with audit timestamps and clear status feedback.
- [x] Improve the public credential verification page with verified, invalid, expired, and unavailable visual states.
- [x] Add a safe public-profile view action without exposing private report data.
- [x] Update and validate the reusable credential-delivery skill with these patterns.
- [x] Add regression coverage and run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Receipt Presentation Download and Organization Invitation Monitoring
- [x] Add a branded PDF receipt download button directly to the presentation page.
- [x] Add admin filters for organization approval history by status, date range, and organization/requester.
- [x] Add a secure CSV export for filtered organization approval history.
- [x] Add visual expiry countdowns for pending organization invitations.
- [x] Add reminder alerts and reminder action feedback for invitations nearing expiry.
- [x] Add regression coverage for receipt ownership, filtered exports, and invitation expiry boundaries.
- [x] Run type checks, full tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Organization Invitation Backend Foundation
- [x] Add organization invitation and approval-history schema with UTC expiry and reminder timestamps.
- [x] Generate and apply the schema migration safely.
- [x] Add database helpers for filtered approval history, CSV rows, pending invitations, and reminder updates.
- [x] Add admin-secured tRPC procedures for approval review, filtering, export, and reminders.
- [x] Add a presentation/results receipt download route scoped to successful transactions.
- [x] Wire dashboard UI controls and countdowns to the new procedures.
- [x] Add regression tests and complete build/responsive verification.

# Approval History Pagination and Trend Summary
- [x] Add server-side pagination metadata and page controls for organization approval history.
- [x] Add compact recent approval trend aggregation for the admin dashboard.
- [x] Add receipt-download spinner and success toast behavior.
- [x] Add regression coverage and run type checks, tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Dashboard Navigation and Approval History Insights
- [x] Add clear dashboard/my-workspace menu items for key learner and admin destinations.
- [x] Add organization approval-history date range filters and organization/email search behavior.
- [x] Add a real-data 30-day approval trend aggregation for the analytics line chart.
- [x] Add a responsive line chart to the compact organization approval analytics summary.
- [x] Add regression coverage and run type checks, tests, production build, and responsive verification.
- [x] Save a checkpoint containing these enhancements.

# Organized User Dashboard
- [x] Refine the authenticated dashboard workspace navigation and section hierarchy.
- [x] Add clear overview cards for assessment progress, unlocked reports, certificates, payments, and recent activity.
- [x] Organize report history, certificate access, receipt access, and resume actions into scannable sections.
- [x] Improve empty, loading, and error states while preserving payment and privacy boundaries.
- [x] Verify responsive accessibility, tests, production build, and save a checkpoint.

# Dashboard Quick Actions and Theme Controls
- [x] Add a floating quick-action button to start a new self-assessment.
- [x] Add a personalized greeting and dynamic progress summary widget to the Overview tab.
- [x] Add a dark-mode toggle switch to the Settings tab.
- [x] Remove the JSON progress-file drop prompt from the dashboard.
- [x] Run tests, production build, responsive verification, and save a checkpoint.

# Dashboard Activity and Onboarding Polish
- [x] Add a smooth light/dark theme transition respecting reduced-motion preferences.
- [x] Add a recent activity feed for completed assessments and unlocked reports.
- [x] Add a first-use onboarding tooltip for the floating New self-assessment button.
- [x] Create or update and validate the reusable dashboard-enhancement skill.
- [x] Run tests, production build, responsive verification, and save a checkpoint.

# Frontend Authentication and Dashboard Guidance
- [x] Add frontend registration, login, and logout controls connected to database-backed session behavior.
- [x] Preserve protected-route redirects and authenticated/unauthenticated loading states.
- [x] Add a profile-completion progress bar based on saved account details and preferences.
- [x] Add a Recent Activity filter for completed assessments versus unlocked reports.
- [x] Add clickable activity links to detailed assessment/report destinations.
- [x] Add regression coverage and run tests, production build, responsive verification, and save a checkpoint.

# Profile Completion, Remember Me, and Activity Browsing
- [x] Add a Complete Profile button and modal with missing-detail prompts.
- [x] Add Remember Me to login and carry it through secure session creation without storing passwords client-side.
- [x] Add Load More behavior for older activity while preserving filters and links.
- [x] Add regression coverage and run tests, production build, responsive verification, and save a checkpoint.

# Profile Validation, Activity Exports, and Recommendations
- [x] Add real-time inline validation to the Complete Profile modal and success toast after saved updates.
- [x] Add secure PDF export buttons to completed-assessment activity items.
- [x] Add profile-driven personalized self-assessment recommendations.
- [x] Add regression coverage and run tests, production build, responsive verification, and save a checkpoint.

# Export Feedback, Recommendation Explanations, and Result Sharing
- [x] Add loading spinner and success toast feedback to completed-assessment PDF export.
- [x] Add View Details explanations for profile-driven recommendations.
- [x] Add a secure email Share action beside completed-assessment PDF export.
- [x] Add regression coverage and run tests, production build, responsive verification, and save a checkpoint.

# Professional Course Lesson Library and Interactive Player
- [x] Add reusable professional 40-minute content for all course lessons.
- [x] Add structured objectives, reading sections, examples, simulations, reflection prompts, and visual lesson treatments.
- [x] Build an interactive lesson player with responsive navigation and completion actions.
- [x] Preserve existing quiz, staged payment, progress persistence, and certification flows.
- [x] Run type checks, tests, production build, and validate the course workspace implementation.
- [x] Save a checkpoint containing the complete course lesson library and player.

# Lesson Player Progress, Bookmarks, and Notes
- [x] Add a current-lesson progress indicator for the 40-minute player.
- [x] Add Save for Later bookmarks for lesson sections and simulations.
- [x] Add persistent note-taking with export controls inside the lesson player.
- [x] Preserve course completion, payment, and quiz behavior.
- [x] Add regression coverage and run tests, production build, responsive verification, and save a checkpoint.

# Rich Lesson Notes and My Bookmarks
- [x] Add bold, italic, and bullet-point controls to lesson notes.
- [x] Preserve formatted note content in local persistence and exports.
- [x] Add a My Bookmarks dashboard section for saved lesson sections and simulations.
- [x] Add bookmark navigation and removal controls without affecting course progress.
- [x] Add regression coverage and run tests, production build, responsive verification, and save a checkpoint.

# Bookmark Search, My Notes, and AI Summaries
- [x] Add search and course filters to My Bookmarks.
- [x] Add a My Notes dashboard tab aggregating saved lesson notes across courses.
- [x] Add review and export controls for the aggregated notes.
- [x] Add built-in AI note summarization with safe limits, loading, and error states.
- [x] Add regression coverage and run tests, production build, responsive verification, and save a checkpoint.

# My Notes Exports and AI Study Aids
- [x] Add Markdown and formatted PDF export for AI-generated note summaries.
- [x] Add clickable course and lesson links to aggregated My Notes entries.
- [x] Add AI-generated practice quiz or flashcard actions from summarized notes.
- [x] Add loading, error, and review states for the study aids.
- [x] Add regression coverage and run tests, production build, responsive verification, and save a checkpoint.

# Aligned Course Lessons and Module Quizzes
- [x] Enrich lesson content with clearer concepts, applied examples, simulations, and module-specific takeaways.
- [x] Map every module quiz question to a specific lesson or learning outcome.
- [x] Recreate all module quizzes with 15 aligned questions, answers, explanations, and retry-safe scoring.
- [x] Show aligned lesson references and feedback in quiz review without exposing answer keys before submission.
- [x] Run content integrity checks, tests, production build, responsive verification, and save a checkpoint.

# OAuth Configuration and Build Warning
- [x] Restore or securely configure OAUTH_SERVER_URL for the backend OAuth flow.
- [x] Verify the corresponding frontend OAuth portal configuration and authenticated session behavior.
- [x] Adjust the production chunk-size warning threshold or splitting configuration without masking build failures.
- [x] Run tests and production build, then save a recoverable checkpoint.

# Course Quality Verification
- [x] Verify every module quiz question references an existing lesson and aligned module content.
- [x] Verify answer indexes, option counts, and 15-question module totals.
- [x] Test lesson-player navigation, simulation, notes, bookmarks, and completion controls; quiz submit/retry remains payment-gated for a future QA session.
- [x] Review build output and runtime logs for compile, browser-console, and network errors.
- [x] Record verification results; checkpoint deferred because the payment-gated quiz submit/retry path was not fully exercised.

# Complete Course QA and Accessibility Audit
- [x] Prepare a non-charging QA enrollment with all seven module lessons unlocked.
- [x] Submit a deliberate failing quiz attempt and verify retry remains available.
- [x] Submit a passing retry and verify module progression updates correctly.
- [x] Audit lesson-player and quiz accessibility, keyboard navigation, focus, labels, contrast, and reduced motion.
- [x] Audit lesson-player and quiz performance, bundle/runtime behavior, and network activity.
- [x] Generate a comprehensive PDF summary report of verification results.
- [x] Run final validation; checkpoint remains subject to the documented stale historical console entry.

# Sitewide Profound IQ Logo and Favicon
- [x] Upload the provided Profound IQ logo through the project asset pipeline.
- [x] Replace sitewide header, dashboard, course, assessment, and output logo references.
- [x] Configure the new mark as the browser favicon and application metadata image.
- [x] Verify logo rendering and generated-output references, then run tests/build and save a checkpoint.

# OAuth Backend Configuration Repair
- [x] Inspect the current OAuth connector and project configuration without exposing secret values.
- [x] Restore OAUTH_SERVER_URL through the supported project configuration path or implement a safe platform fallback.
- [x] Verify OAuth initialization, frontend login/session behavior, and runtime logs.
- [x] Run authentication regression tests and save a recoverable checkpoint.

# Managed Manus OAuth Restoration
- [x] Inspect the built-in Manus OAuth configuration and current project deployment environment state.
- [x] Restore or enable the managed backend OAUTH_SERVER_URL without changing VITE_OAUTH_PORTAL_URL.
- [x] Verify production backend initialization and OAuth API base URL resolution for ExchangeToken and GetUserInfo.
- [x] Run authentication regression checks and save a recoverable checkpoint if restored.

# Inquiry Button Activation
- [x] Inspect the existing frontend inquiry UI and backend inquiry procedure.
- [x] Connect Send Inquiry to the backend with validation and loading/success/error feedback.
- [x] Add regression coverage and verify desktop/mobile inquiry submission behavior.
- [x] Save a checkpoint for the activated inquiry flow.

# Inquiry Management and Anti-Spam
- [x] Add a subject/category selector to the public inquiry form and persist the selected category.
- [x] Add server-validated math verification to prevent automated inquiry submissions.
- [x] Build an admin-only inquiry dashboard with search, category/status filters, pagination, and status management.
- [x] Add regression coverage and verify public/admin inquiry flows responsively.
- [x] Save a checkpoint for the inquiry management enhancements.

# Inquiry Operations Update
- [x] Trace and fix the public inquiry submission JSON/HTML response error.
- [x] Add admin CSV export for the currently filtered contact inquiries.
- [x] Add bulk status updates for selected inquiries.
- [x] Add a 30-day per-category inquiry chart.
- [x] Add regression coverage and verify public/admin flows responsively.
- [x] Save a checkpoint for the inquiry operations update.

# Inquiry Date Filters, Notes, and Pagination
- [x] Add UTC-safe from/to date filters to inquiry listing and filtered CSV export.
- [x] Add persistent internal notes storage and an admin-only note update procedure.
- [x] Enhance the inquiry list pagination with stable page reset and navigation states.
- [x] Add regression coverage and verify filters, notes, export, and responsive pagination.
- [x] Save a checkpoint for the Contact Desk enhancements.

# Inquiry Presets, Assignment, and Audit History
- [x] Add Today, Last 7 Days, and Last 30 Days date preset controls to the Contact Desk.
- [x] Add admin team-member assignment storage, listing, and update controls for inquiries.
- [x] Add per-inquiry audit history for status and internal-note updates with UTC timestamps and admin actor details.
- [x] Add regression coverage and verify presets, assignment, and audit history responsively.
- [x] Save a checkpoint for the Contact Desk assignment and audit update.

# Inquiry Assignment Filter and Audit Export
- [x] Add an assigned team-member filter to inquiry listing and CSV export.
- [x] Ensure inquiry search covers customer name, email, and message keywords.
- [x] Include per-inquiry audit history records in the CSV export.
- [x] Add regression coverage and verify filters, search, export, and responsive admin behavior.
- [x] Save a checkpoint for the Contact Desk export update.

# Admin Revenue Reporting
- [x] Stabilize and verify the pending Contact Desk assignment-filter and audit-export changes.
- [x] Inspect existing payment and transaction records and define revenue aggregation rules.
- [x] Add admin-only revenue summary and trend procedures with date filtering.
- [x] Build the admin revenue report interface with summary cards and charts.
- [x] Add authorization and calculation regression coverage plus responsive verification.
- [x] Save a checkpoint for the admin revenue reporting feature.

# Staff Assigned-Work Dashboard
- [x] Inspect current role, assignment, and dashboard patterns for staff access.
- [x] Add protected staff inquiry listing scoped to the signed-in team member.
- [x] Add scoped staff status and internal-note update procedures with audit actors.
- [x] Build a staff dashboard page with assigned-work summaries, filters, notes, and status actions.
- [x] Register staff navigation and add authorization, behavior, and responsive regression coverage.
- [x] Save a checkpoint for the staff dashboard feature.

# Staff Operations and Performance
- [x] Add admin-only staff invitation persistence and onboarding flow.
- [x] Add admin-only staff role management controls.
- [x] Add inquiry assignment due dates and priority levels to admin and staff views.
- [x] Add admin staff performance summaries for completed assignments and resolution times.
- [x] Add regression coverage and responsive verification for staff operations.
- [x] Save a checkpoint for the staff operations update.

# Staff Workload and Performance Export
- [x] Add overdue assignment warning indicators and staff sorting by priority and due date.
- [x] Add date-range filters to the admin staff performance summary.
- [x] Add CSV export for filtered staff performance metrics.
- [x] Create or update a reusable staff operations skill and validate it.
- [x] Add regression coverage and responsive verification for the dashboard changes.
- [x] Save a checkpoint for the dashboard and skill update.

# Course Variety and Completion Automation
- [x] Inspect the shared quiz, lesson, payment, certificate, email, and social-sharing contracts.
- [x] Create varied answer choices and shuffle questions and choices per quiz attempt and user.
- [x] Enrich lessons with distinct content and interaction patterns that avoid repetition.
- [x] Add accessible celebration feedback for lesson, quiz, and course completion.
- [x] Automate paid course completion certificate generation, dashboard availability, email delivery, and social sharing.
- [x] Add regression coverage and verify the complete course flow responsively.
- [x] Save a checkpoint for the course learning and completion update.

# Automated Course Recommendations
- [x] Define an explainable recommendation mapping from completed self-assessment dimensions to relevant professional courses.
- [x] Add a protected recommendation query that only returns recommendations for the signed-in user and uses their paid assessment history.
- [x] Add a polished recommendations section to the user dashboard with rationale, fit signals, and course links.
- [x] Add regression tests for recommendation ranking, paid-history eligibility, authorization, and empty states.
- [x] Verify type checks, tests, production build, and responsive dashboard rendering.
- [x] Save a checkpoint for the automated course recommendations feature.

# Dynamic Frontend Catalog Updates
- [x] Define a shared data contract so code-created and admin/database-created catalog items use the same frontend shape.
- [x] Add protected admin creation/listing for catalog items with validation and publication visibility.
- [x] Make frontend catalog and recommendation surfaces query live items and refresh after creation.
- [x] Add regression tests for creation, authorization, publication filtering, and frontend data contracts.
- [x] Verify type checks, tests, production build, and responsive catalog/admin rendering.
- [x] Save a checkpoint for dynamic frontend catalog updates.

# Dedicated Courses Page
- [x] Add a dedicated public Courses route using the live hybrid catalog.
- [x] Add Courses links to desktop and mobile main navigation.
- [x] Preserve branded enrollment, syllabus, and inquiry paths with clear loading and empty states.
- [x] Add route and catalog rendering regression coverage.
- [x] Verify type checks, tests, production build, and desktop/mobile page rendering.
- [x] Save a checkpoint for the dedicated Courses page.

# Paid Course Lesson Access
- [x] Define the public course highlight versus protected lesson-content boundary.
- [x] Enforce authentication and first-stage paid enrollment before serving detailed lessons.
- [x] Add a clear locked-course experience with public highlights, pricing, and payment CTA.
- [x] Preserve authorized learner progress, quizzes, notes, and certificate flows after unlock.
- [x] Add regression tests for public, unpaid, partially paid, and authorized lesson access.
- [x] Verify type checks, tests, production build, and responsive course-workspace rendering.
- [x] Save a checkpoint for paid course lesson access.

# Personalized Reports and Certificates
- [x] Define a safe full-name and email identity contract for paid authenticated outputs.
- [x] Add the user’s full name and email to the Personal Score Summary and authenticated report views.
- [x] Propagate identity into assessment, CareerPath, course, certificate, receipt, email, PDF, SVG, and shared-report outputs.
- [x] Preserve payment gates and prevent identity leakage in public or unauthorized views.
- [x] Add regression tests for identity propagation, fallback names, authorization, and output text.
- [x] Verify type checks, tests, production build, and representative desktop/mobile report surfaces.
- [x] Save a checkpoint for personalized reporting.

# Course Completion Delivery Queue
- [x] Refresh course completion and certificate state automatically in the user dashboard.
- [x] Add a learner-controlled sequential queue for email delivery, organization forwarding, and social-image sharing.
- [x] Add consent, ordered-step status, retry feedback, and audit-safe handling for outbound actions.
- [x] Generate a branded course completion share image with download and supported native sharing fallback.
- [x] Add regression tests for completion refresh, delivery order, consent, retries, and authorization.
- [x] Verify type checks, tests, production build, and responsive delivery-queue rendering.
- [x] Save a checkpoint for the course completion delivery queue.

# Delivery Outcomes and Reusable Workflow
- [x] Add PNG export for course-completion social images.
- [x] Persist learner delivery-history records for email, organization requests, and social-image sharing.
- [x] Add an admin observatory for delivery outcomes, statuses, filters, and retry visibility.
- [x] Add a user-facing delivery-history section with ordered statuses and timestamps.
- [x] Create and validate a reusable skill documenting the delivery-queue implementation workflow.
- [x] Add regression tests for PNG conversion, persistence, authorization, and status reporting.
- [x] Verify type checks, tests, production build, and responsive dashboard/admin rendering.
- [x] Save a checkpoint for delivery outcomes and reusable workflow.

# Course Enrollment Workflow Enhancement
- [x] Improve the enrollment form with clearer course context, staged-payment explanation, validation, and privacy guidance.
- [x] Improve enrollment-to-Paystack transition states with progress feedback and safe recovery from cancellation or failure.
- [x] Improve post-payment learner handoff with clear first-module access and dashboard navigation.
- [x] Add regression coverage for enrollment validation, payment failure/retry, and first-stage access boundaries.
- [x] Verify type checks, tests, production build, runtime logs, and responsive enrollment rendering.
- [x] Save a checkpoint for the enhanced course enrollment workflow.

# Authenticated Payment Experience
- [x] Capture and persist the authenticated learner name and email before course checkout.
- [x] Add a user-facing payment rollup for staged course payments and outstanding balance.
- [x] Add a dedicated payment-success confirmation route with clear course-access next steps.
- [x] Add incomplete-enrollment dashboard cards with resume-payment actions.
- [x] Add regression coverage for identity capture, payment rollups, success routing, and resume authorization.
- [x] Verify type checks, tests, production build, runtime logs, and responsive payment/dashboard rendering.
- [x] Save a checkpoint for the authenticated payment experience.

# Authenticated Payment Experience
- [x] Implement the dedicated payment-success page with server-side Paystack reference verification and clear next steps.
- [x] Add authenticated learner name and email capture before course enrollment checkout.
- [x] Add learner payment rollup with four staged payments, paid amount, remaining balance, and status.
- [x] Add incomplete-enrollment dashboard cards with resumable course/payment actions.
- [x] Add regression tests for enrollment identity capture, payment-success verification, and payment rollup contracts.
- [x] Run full type checks, tests, production build, runtime log review, and responsive desktop/mobile verification.
- [x] Save a final completion checkpoint after all inherited payment-experience work is verified.

# Authenticated Payment Experience Stabilization
- [x] Repair the checkout identity form so a newly created enrollment is initialized before Paystack checkout.
- [x] Ensure the callback routes to the dedicated payment-success verification page.
- [x] Verify payment rollup and resume-card rendering contracts against course state data.
- [x] Re-run all validation and capture final responsive evidence.
- [x] Fix mobile dashboard header actions wrapping into a cramped four-column line during responsive verification.

# Payment Reconciliation and Cross-Device Course Resume
- [x] Add a secure Paystack webhook endpoint with signature verification and idempotent stage reconciliation.
- [x] Persist payment event history and expose reconciled, pending, failed, and exception states.
- [x] Persist the learner's active course module and lesson position server-side and hydrate it across devices.
- [x] Add admin payment-exception filters, detail views, and manual reconciliation actions.
- [x] Add regression tests for webhook security/idempotency, payment exception authorization, and cross-device lesson resume.
- [x] Run type checks, tests, production build, runtime verification, and responsive desktop/mobile audit.
- [x] Save the completed reconciliation and cross-device resume checkpoint.

# Self-Assessment Reflection Prompt Enhancement
- [x] Audit the current reflection prompt source and on-screen/PDF report renderers.
- [x] Add substantive, dimension-specific reflection prompts with practical coaching context.
- [x] Ensure prompts appear in both the on-screen report and branded PDF output.
- [x] Add regression tests that reject empty reflection sections and verify representative prompt content.
- [x] Run type checks, tests, production build, runtime review, and responsive report verification.
- [x] Save the completed reflection-prompt enhancement checkpoint.

# Reflection Notes, Status, and Coach Export
- [x] Add durable per-report reflection notes and planned/active/reviewed action statuses.
- [x] Add protected learner procedures to load and save notes/statuses for their own paid reports.
- [x] Add coach/manager export for explicitly selected prompts and learner responses with access controls.
- [x] Add learner UI text areas, status controls, save feedback, selection controls, and export actions.
- [x] Add regression tests for persistence, ownership, selection validation, export content, and authorization.
- [x] Run schema migration, type checks, tests, production build, runtime review, and responsive audit.
- [x] Save the completed reflection workflow checkpoint.

# Professional Certificate in International Curriculum Pedagogy
- [x] Add the document-grounded course catalog entry and KES 14,999 pricing contract.
- [x] Add 10 curriculum-aligned modules covering international curricula, pedagogy, professionalism, counselling, research, and education technology.
- [x] Add 7 interactive 40-minute lessons and practical learning experiences to every module.
- [x] Add 15 aligned, automatically marked quiz questions per module with a 50% pass mark and aggregated final result.
- [x] Integrate the new course into staged four-installment Paystack enrollment and access progression.
- [x] Generate and deliver branded completion certificates with learner name, course title, certificate number, logo, and QR verification.
- [x] Add regression tests for course structure, quiz alignment/scoring, staged pricing, and certificate output.
- [x] Run full tests, TypeScript, production build, runtime review, and desktop/mobile course-flow verification.
- [x] Save the completed International Curriculum Pedagogy course checkpoint.

# Module-Level Completion Badges
- [x] Define a shared module badge contract based on seven completed lessons and a passed 15-question quiz.
- [x] Add module completion badge presentation to the course workspace with earned, in-progress, and locked states.
- [x] Add module badge visibility to the learner dashboard course progress cards.
- [x] Add completion celebration feedback when a module badge is earned without fabricating learner achievements.
- [x] Add regression tests for badge eligibility, quiz pass requirements, and course-specific module counts.
- [x] Run type checks, tests, production build, runtime review, and responsive desktop/mobile verification.
- [x] Save the completed module-badge checkpoint.

# Achievement Gallery and Cohort Motivation
- [x] Add learner downloads for earned module badges as PNG images and mini-certificates.
- [x] Add a personal achievement gallery with earned badge history to My Space.
- [x] Add an opt-in cohort leaderboard with privacy-preserving display names and badge progress.
- [x] Add regression tests for badge exports, achievement history, consent, and leaderboard ranking.
- [x] Run type checks, tests, production build, runtime review, and responsive verification.
- [x] Save the completed achievement gallery and leaderboard checkpoint.

# Expanded Professional Course Catalog
- [x] Add 28 professionally framed personal-development, workplace, and entrepreneurship courses to the shared catalog.
- [x] Generate 10 modules, 7 detailed lessons, practical interactions, simulations, and gamification for every new course.
- [x] Generate 15 aligned auto-marked quiz questions per module with 50% pass threshold and aggregated final scoring.
- [x] Verify KES 4,999 four-stage pricing and preserve the existing Paystack enrollment/access workflow.
- [x] Verify automated branded certificates with logo, learner name, course, QR verification, issue date, certificate number, and web address.
- [x] Add regression coverage for course counts, lesson/quiz structure, pricing, scoring, and certificate metadata.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive course-catalog/workspace verification.
- [x] Save the expanded course catalog checkpoint.

# Catalog Discovery and Student Dashboard
- [x] Add course search to the public catalog page.
- [x] Add category filters with clear active and empty states.
- [x] Add a student course dashboard with progress and quiz scores.
- [x] Add upcoming installment payment schedule cards using server-backed course payment state.
- [x] Add regression coverage for search, filters, dashboard metrics, and payment schedule rendering.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the catalog discovery and student dashboard checkpoint.

# Timed Lesson Progression
- [x] Add a 40-minute countdown timer to every course lesson.
- [x] Prevent advancing to the next lesson until the active lesson timer completes.
- [x] Preserve timer state across refreshes and existing lesson progress flows without allowing client clock shortcuts.
- [x] Add accessible countdown, locked-next controls, and completion feedback for desktop and mobile.
- [x] Add regression coverage for timer duration, gate behavior, and lesson navigation.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the timed lesson progression checkpoint.

# Assessment Pricing Update
- [x] Update Self Assessment price to KES 399 across shared contract, checkout, webhook verification, revenue attribution, and UI.
- [x] Update CareerPath price to KES 399 across shared contract, checkout, and UI.
- [x] Update regression fixtures and expectations for KES 399 payment verification.
- [x] Run focused and full tests, TypeScript validation, production build, runtime review, and desktop/mobile pricing verification.
- [x] Save the KES 399 pricing checkpoint.

# Deep Lesson Content Enhancement
- [x] Expand reusable lesson explanations with deeper concept teaching across all course lessons.
- [x] Add practical day-to-day applications and contextual examples to every generated lesson.
- [x] Strengthen practice, simulation, reflection, and key-takeaway content while preserving 40-minute timing.
- [x] Keep all module quizzes aligned with the expanded lesson titles and concepts.
- [x] Add regression coverage for lesson depth, daily-life examples, activity content, and quiz alignment.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the deep lesson content enhancement checkpoint.

# Quiz Variation Enhancement
- [x] Shuffle quiz question order on every learner attempt and retake.
- [x] Shuffle answer-option order while preserving the correct answer mapping.
- [x] Reduce similarity across correct answers and distractors with varied, lesson-specific wording.
- [x] Preserve automatic marking, 50% pass threshold, source-lesson alignment, and unlimited retakes.
- [x] Add regression coverage for order variation, answer mapping, uniqueness, and repeat-attempt behavior.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive quiz verification.
- [x] Save the quiz variation enhancement checkpoint.

# Quiz Learning Feedback and Analytics
- [x] Add detailed explanations for every correct and incorrect quiz response.
- [x] Show a clear visual indicator when a new randomized quiz attempt begins.
- [x] Add student dashboard quiz analytics with score trends and improvement areas.
- [x] Create and validate a reusable skill documenting the quiz variation and feedback workflow.
- [x] Add regression coverage for feedback content, attempt indicators, analytics calculations, and skill validation.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the quiz learning feedback and analytics checkpoint.

# Self Assessment Naming Update
- [x] Rename learner-facing assessment labels to Self Assessment across navigation, entry pages, dashboards, metadata, and copy.
- [x] Preserve existing assessment routes, API contracts, payment references, and stored data identifiers.
- [x] Add regression coverage for the new display name and route compatibility.
- [x] Run tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the Self Assessment naming checkpoint.

# Self Assessment Discovery and Results
- [x] Update Self Assessment landing-page title, meta description, canonical metadata, and Open Graph tags.
- [x] Add a guided introductory modal and visible progress bar to the Self Assessment flow.
- [x] Add a dedicated dashboard section for past Self Assessment scores and report access.
- [x] Add personalized CareerPath recommendations based on the learner’s assessment results.
- [x] Create and validate a reusable skill documenting the SEO, onboarding, results, and recommendation workflow.
- [x] Add regression coverage for metadata, progress, results history, and recommendation logic.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the Self Assessment discovery and results checkpoint.

# Psychometrics Assessment Suite
- [x] Extract and document the attached suite background for all six psychometric tests.
- [x] Define shared test contracts, dimensions, scoring rules, interpretation bands, and non-diagnostic safeguards.
- [x] Add the six professional psychometric assessment catalogs with robust question banks and personalized result logic.
- [x] Add KES 699 payment gating and Paystack verification for each psychometric test.
- [x] Integrate dashboard history, report generation, branded PDF/email delivery, and admin visibility.
- [x] Verify certificates/reports include logo, learner identity, test title, issue date, certificate/report number, QR verification, and web address where applicable.
- [x] Add structural, scoring, payment, authorization, and delivery regression coverage.
- [x] Run full tests, TypeScript validation, production build, runtime review, accessibility, and responsive verification.
- [x] Save the Psychometrics Assessment Suite checkpoint.

# Psychometrics Suite Implementation Continuation
- [x] Complete the six-test shared psychometric catalog with 120 stable items per test, domain metadata, scoring bands, and non-diagnostic safeguards.
- [x] Correct keyed multiple-choice scoring for the Cognitive & Reasoning Assessment.
- [x] Add public catalog and interactive branded assessment route with progress indicator, response controls, consent, and KES 699 Paystack checkout.
- [x] Add server procedures for catalog, questions, payment initialization, idempotent payment verification, and authenticated history.
- [x] Add learner dashboard history cards for paid and pending psychometric attempts.
- [x] Add regression coverage for catalog size, price, scoring, and cognitive answer keys.
- [x] Add branded PDF/report email delivery for paid psychometric profiles.
- [x] Add admin visibility and operational filters for psychometric attempts.
- [x] Run full tests, production build, runtime checks, and responsive screenshots.
- [x] Save the Psychometrics Assessment Suite checkpoint.

# Psychometric Analytics and Recommendations Expansion
- [x] Add admin psychometric conversion funnel and email-delivery analytics with date filters and trend summaries.
- [x] Add authenticated learner report resend controls in My Space with loading, success, and failure states.
- [x] Add profile-specific recommended Profound IQ courses to paid psychometric results and learner history.
- [x] Add server contracts, authorization, delivery retry safety, and recommendation regression tests.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the validated psychometric analytics and recommendations checkpoint.

# Psychometric Analytics Export and Personalization
- [x] Add CSV, Excel, and PDF exports for filtered psychometric conversion and email-delivery analytics.
- [x] Add immediate admin delivery-failure alerts and unread/acknowledged operational state.
- [x] Personalize recommendations using dimension-level scores and completed-course history.
- [x] Add authorization, format, alert, and recommendation regression coverage.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the validated analytics export and personalization checkpoint.

# Weekly Analytics Delivery and Recommendation Refinement
- [x] Add a weekly scheduled psychometric analytics export job that emails administrators a branded report.
- [x] Add schedule status, recipient visibility, idempotency, and failure handling for weekly delivery.
- [x] Add administrator acknowledgement persistence for individual psychometric report delivery failures.
- [x] Add admin UI controls showing acknowledgement status and handling administrator.
- [x] Refine psychometric recommendations using course difficulty levels and learner learning goals.
- [x] Add schedule, acknowledgement, authorization, delivery, and recommendation regression coverage.
- [x] Run full tests, TypeScript validation, production build, scheduled-handler checks, runtime review, and responsive verification.
- [x] Save the validated weekly delivery and recommendation refinement checkpoint.

# Schedule Controls, Acknowledgement Audit, and Recommendation Feedback
- [x] Add pause and resume controls for the automated weekly psychometric analytics schedule.
- [x] Add acknowledgement notes and an auditable export for handled delivery failures.
- [x] Add learner feedback capture for psychometric course recommendations and use it in future ranking.
- [x] Resolve the hero image asset warning using a deployment-safe managed asset reference.
- [x] Update and validate the reusable psychometric operations skill with the new workflows.
- [x] Add authorization and behavior regression coverage for schedule controls, audit exports, feedback, and recommendation ranking.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the validated schedule-controls and recommendation-feedback checkpoint.

# Login Rate-Limit Window Adjustment
- [x] Reduce excessive-login-attempt lockout duration to one minute.
- [x] Update countdown copy and related login security tests.
- [x] Run validation and publish the rate-limit adjustment checkpoint.

# Configurable Login Security Analytics
- [x] Add an admin-configurable login lockout duration with safe bounds and persistence.
- [x] Show the exact unlock time when a user is temporarily locked out.
- [x] Add admin security analytics for rate-limit events and failed login attempts with visual trends.
- [x] Add authorization and behavior regression coverage for settings, lockout calculations, messaging, and analytics.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the validated configurable security analytics checkpoint.

# Admin Unlock, Login Filters, and Password Recovery Guidance
- [x] Initiate the secure administrator password-reset email for the confirmed admin address without exposing a password.
- [x] Add an admin-only manual unlock action that clears a user’s active login lockout state.
- [x] Add IP-address and geographic-location filters to failed-login events and security analytics.
- [x] Add a Forgot Password link directly below the lockout countdown message on the login page.
- [x] Add authorization, behavior, and UI regression coverage for the security changes.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the validated admin unlock and password-recovery checkpoint.

# SMTP Retry, Unlock Audit, Regional Trends, and Auth CTAs
- [x] Verify configured SMTP connectivity and retry the administrator password-reset email.
- [x] Add a protected unlock-audit history query and table view in the Admin Security Observatory.
- [x] Add regional failed-login aggregation and a location trend visualization.
- [x] Activate public Sign in and Create account navigation actions.
- [x] Add regression coverage for SMTP/reset handling, unlock audits, regional analytics, and CTA navigation.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the validated release checkpoint.

# Admin Reset-Link Fallback, Audit Filters, and Auth Feedback
- [x] Add an admin-only secure one-time password-reset link generator with a non-persistent console response.
- [x] Add unlock-audit search and date-range filters across the protected API and Observatory table.
- [x] Add loading spinners and clear invalid-input errors to Sign in and Create account forms.
- [x] Add regression coverage for reset-link authorization/expiry, audit filters, and auth feedback behavior.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the validated authentication update checkpoint.

# Google Sign-in, Reset Link UX, Audit Export, and Password Visibility
- [x] Complete Google sign-in across frontend, backend, and database-backed sessions.
- [x] Add reset-link copy-to-clipboard control with live expiry countdown.
- [x] Add filtered CSV export for unlock-audit history.
- [x] Add Show Password toggles to Sign In and Create Account forms.
- [x] Add regression coverage for Google sign-in/session behavior, reset-link UX, audit export, and password toggles.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the validated authentication release checkpoint.

# Reset Revocation, Export Download Audit, and Google Profile Picture
- [x] Add admin reset-link revocation with audit-safe invalidation.
- [x] Track administrator downloads of filtered unlock-audit CSV exports.
- [x] Display synchronized Google profile pictures in authenticated navigation.
- [x] Add regression coverage for revocation, export-download auditing, and profile-picture synchronization.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the validated security and navigation checkpoint.

# Security Observatory Privacy and Audit UX
- [x] Add an administrator confirmation dialog before reset-link revocation.
- [x] Add search, UTC date-range filters, and pagination to export-download history.
- [x] Add a protected profile setting to remove the stored Google profile picture and restore initials in navigation.
- [x] Create and validate the reusable profound-iq-security-observatory skill.
- [x] Run TypeScript validation, full tests, production build, runtime review, and responsive verification.
- [x] Save the validated privacy and audit UX checkpoint.

# Export Audit CSV, Revocation Detail, and Avatar Visibility
- [x] Add a protected CSV export for filtered export-history records.
- [x] Record detailed reset-link revocation audit events with acting administrator and timestamp.
- [x] Add a reversible profile preference to hide or show the stored Google avatar in navigation.
- [x] Add regression coverage for export CSV authorization, revocation audit details, and avatar visibility persistence.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the validated audit and privacy update checkpoint.

# Avatar Privacy Notice and Revocation Admin Quick-filter
- [x] Add a privacy notice or tooltip explaining Google avatar storage, display, hiding, and removal behavior.
- [x] Add a quick-filter for reset-link revocations performed by a selected administrator.
- [x] Add regression coverage for administrator filtering and privacy-copy presence.
- [x] Run full tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the validated privacy and audit filter checkpoint.

# Google and LinkedIn Social Sign-in
- [x] Add secure Google OAuth sign-in with database-backed user upsert and session creation.
- [x] Add secure LinkedIn OAuth sign-in with database-backed user upsert and session creation.
- [x] Add provider buttons and callback error/loading states to the authentication UI.
- [x] Add regression coverage for OAuth state validation, account linking, provider failures, and session creation.
- [x] Run full authentication tests, TypeScript validation, production build, runtime review, and responsive verification.
- [x] Save the validated social sign-in checkpoint.

# Footer Social Icons and WhatsApp Support
- [x] Replace footer social text links with recognizable official-style social media icons and accessible labels.
- [x] Add a WhatsApp quick-support button linking to +254727374055.
- [x] Verify social destinations, WhatsApp URL formatting, keyboard access, responsive layout, tests, and production build.
- [x] Save the validated footer update checkpoint.

# Sitewide WhatsApp Support and Footer Motion
- [x] Add a floating WhatsApp chat widget to the bottom-right corner across all routes.
- [x] Add smooth brand-specific hover color transitions and motion to footer social icons.
- [x] Add a WhatsApp quick-support tooltip showing Monday to Saturday office hours.
- [x] Verify accessibility, external links, responsive behavior, tests, and production build.
- [x] Save the validated sitewide support checkpoint.

# WhatsApp Widget Attention and Availability
- [x] Add a subtle pulse animation to the floating WhatsApp widget.
- [x] Add minimize and restore controls so users can hide or reopen the widget.
- [x] Add automatic online/offline status based on Monday–Saturday office hours.
- [x] Verify accessibility, local-time behavior, responsive interaction, tests, and production build.
- [x] Save the validated WhatsApp widget checkpoint.

# WhatsApp Widget Contextual Support Enhancements
- [x] Add page-aware greeting messages to the WhatsApp widget.
- [x] Add an office-hours hover tooltip showing the expected response time.
- [x] Add an offline fallback contact form that captures and validates an email address.
- [x] Verify support submission behavior, accessibility, responsive layout, tests, and production build.
- [x] Save the validated contextual WhatsApp widget checkpoint.

# WhatsApp Widget Course Context and Help Enhancements
- [x] Add a subtle one-time bounce after more than 30 seconds on course pages.
- [x] Add FAQ and quick-reply help actions inside the offline fallback form.
- [x] Include the current page URL in the fallback inquiry context.
- [x] Verify timing behavior, inquiry payload, accessibility, responsive layout, tests, and production build.
- [x] Save the validated course-context WhatsApp widget checkpoint.

# Deployment Branding Asset Repair
- [x] Replace the unresolved hero CSS asset reference with an explicit managed image URL.
- [x] Add a close-fit header logo asset so the logo is legible after deployment.
- [x] Add a square favicon and conventional favicon.ico fallback.
- [x] Update PDF branding and metadata to use the optimized assets.
- [x] Verify deployed asset responses, branding render, tests, and production build.
- [x] Save the validated branding repair checkpoint.

# Website SEO Implementation
- [x] Inventory and classify public and authenticated routes for SEO treatment.
- [x] Add route-aware titles, descriptions, canonical URLs, Open Graph, and Twitter metadata.
- [x] Add structured data and crawl-supporting robots/sitemap files for public content.
- [x] Add SEO regression coverage and verify metadata across key public routes.
- [x] Run type checks, tests, production build, and runtime verification.
- [x] Save the validated SEO checkpoint.

# Course SEO Expansion
- [x] Generate sitemap course entries from the published course catalog automatically.
- [x] Implement server-side rendering for the public course catalog route with course data and metadata.
- [x] Add accessible social sharing controls to course detail pages.
- [x] Verify sitemap completeness, SSR HTML, sharing behavior, tests, build, and runtime performance.
- [x] Save the validated course SEO enhancement checkpoint.

# Course Sharing and Detail SSR
- [x] Track course share actions by platform with analytics events.
- [x] Implement server-rendered HTML for individual public course detail routes.
- [x] Confirm successful course-link copying with a visual toast notification.
- [x] Add regression coverage and verify event payloads, detail SSR, SEO metadata, responsiveness, tests, and build.
- [x] Save the validated course sharing and detail SSR checkpoint.

# Social Preview Image Repair
- [x] Audit all shared-page Open Graph and Twitter image URLs and verify their public responses.
- [x] Provide a publicly resolvable branded preview image for catalog and course detail shares.
- [x] Add image dimensions and image metadata where needed for social crawlers.
- [x] Add regression coverage and verify share-preview HTML, image responses, tests, and production build.
- [x] Save the validated social preview image repair checkpoint.

# Dynamic Course Social Preview Enhancement
- [x] Generate deployment-safe course-specific Open Graph images using each course title and cover treatment.
- [x] Resolve each course detail page to its specific social preview image with a fallback.
- [x] Add a floating course share bar with per-platform analytics tracking.
- [x] Add an admin interface to update and persist the default fallback social image.
- [x] Add regression coverage and verify image responses, metadata, share tracking, admin permissions, responsiveness, tests, and build.
- [x] Save the validated dynamic course social preview checkpoint.

# Course Social Card Operations
- [x] Add admin-authorized course cover-image upload and persistence through managed storage.
- [x] Include uploaded cover artwork in generated course Open Graph cards.
- [x] Add course/platform social sharing analytics aggregation and admin chart.
- [x] Add social-card version controls and cache-busting to metadata and image routes.
- [x] Verify uploads, generated images, cache behavior, analytics, admin permissions, tests, and responsive UI.
- [x] Save the validated course social-card operations checkpoint.

# Social Card Editing and Reporting
- [x] Add a browser-side crop and focal-point editor before course cover upload.
- [x] Add CSV and PDF exports for course/platform social-sharing analytics.
- [x] Add live Twitter and Facebook card previews using the generated course preview image.
- [x] Add regression coverage and verify crop output, exports, preview fidelity, accessibility, tests, and responsive admin behavior.
- [x] Save the validated social-card editing and reporting checkpoint.

# Social Analytics and Auto-Crop Enhancement
- [x] Add comparison date ranges and trend charts to social-sharing analytics.
- [x] Add protected admin downloads for generated Open Graph preview cards.
- [x] Add subject-aware automatic crop suggestion before manual crop adjustment.
- [x] Add regression coverage and verify analytics comparisons, downloads, auto-crop output, permissions, tests, and responsive UI.
- [x] Save the validated social analytics and auto-cropping checkpoint.

# Admin Social Preview Interaction Enhancement
- [x] Add Last 7 Days, Last 30 Days, and custom date-range presets to sharing analytics.
- [x] Visualize the AI-detected subject region with a bounding overlay or heatmap in the crop editor.
- [x] Add admin quick-share actions for generated Open Graph cards with tracked platform events.
- [x] Add regression coverage and verify filters, overlay behavior, quick sharing, accessibility, tests, and responsive UI.
- [x] Save the validated admin social preview interaction checkpoint.

# Social Analytics Control Refinement
- [x] Add drag and resize controls for the AI-detected subject bounding box.
- [x] Add quick-share success toasts and a public-only analytics filter excluding admin shares.
- [x] Add green/red period-over-period trend indicators to the analytics summary.
- [x] Add regression coverage and verify crop editing, filtered analytics, trend indicators, share feedback, tests, and responsive UI.
- [x] Save the validated social analytics control refinement checkpoint.

# Privacy Policy Page
- [x] Create a dedicated branded Privacy Policy page with clear sections for data use, payments, assessments, communications, sharing, retention, and contact.
- [x] Register the Privacy Policy route with page-specific SEO metadata and canonical URL.
- [x] Add a persistent Privacy Policy link to the global footer.
- [x] Verify route navigation, accessibility, responsive presentation, tests, and production build.
- [x] Save the validated Privacy Policy checkpoint.

# Legal and Cookie Consent Experience
- [x] Add a lightweight cookie consent banner with accept-all and customizable tracking preferences.
- [x] Persist consent choices and provide an accessible way to reopen or update preferences.
- [x] Create a dedicated branded Terms of Service page with route-specific SEO metadata.
- [x] Link Terms of Service beside Privacy Policy in the global footer.
- [x] Add a sticky Privacy Policy table of contents with responsive mobile navigation.
- [x] Add regression coverage and verify consent persistence, legal navigation, accessibility, SEO, tests, and production build.
- [x] Save the validated legal and consent experience checkpoint.

# Legal and Compliance Finalization
- [x] Add a sticky Privacy Policy table of contents on desktop with anchored section navigation.
- [x] Add a collapsible mobile-friendly Privacy Policy table of contents.
- [x] Add the Terms of Service link beside Privacy Policy in the global footer.
- [x] Add Terms of Service route metadata and include it in dynamic and static sitemaps.
- [x] Verify legal pages, cookie consent presentation, responsive behavior, type checking, tests, and production build.
- [x] Save a final checkpoint for the legal and compliance experience.

# Legal regression follow-up
- [x] Update sitemap regression coverage for the additional Terms of Service URL.
- [x] Add regression coverage for Terms metadata and the cookie consent storage key.
- [x] Re-run the complete validation suite after the sitemap coverage update.
- [x] Save a final checkpoint after the complete validation suite.

## Notes
- Production build completes successfully; Vite still reports the existing large-chunk advisory for the application bundle.
- The screenshot harness showed the cookie banner correctly overlaying the lower viewport on both legal pages; the mobile contents control remains visible above it.
- Historical dev-server log entries mention an earlier missing Terms page before the inherited file was present; current type checking and production build pass.

# Archived task status
- [x] Legal/compliance refinement task complete.
- [x] SEO/social-sharing/admin platform work inherited from prior checkpoints remains preserved.
- [x] Auto-published checkpoint pending final save.

# Final validation record
- [x] Focused legal tests passed: 11 tests across 3 files.
- [x] Full non-network Vitest suite passed.
- [x] TypeScript noEmit validation passed.
- [x] Production build passed.
- [x] Desktop/mobile legal-page screenshots reviewed.
- [x] Final checkpoint ready.

# Delivery checklist
- [x] Privacy Policy sticky TOC delivered.
- [x] Terms of Service footer link delivered.
- [x] Mobile responsive legal navigation delivered.
- [x] Cookie consent banner preserved and validated.
- [x] SEO metadata and sitemap coverage delivered.
- [x] Final user report ready.

# End state
- [x] Profound IQ Consulting legal/compliance experience is ready for user review.

# Sitewide Localization
- [x] Define supported major-language locales and a translation key contract with English fallback.
- [x] Add a persistent, accessible language selector to the shared public experience.
- [x] Translate shared navigation, homepage, footer, cookie consent, WhatsApp support, Privacy Policy, Terms of Service, and public catalog labels.
- [x] Add locale-aware document language, SEO metadata, Open Graph locale, and canonical/hreflang behavior.
- [x] Ensure authenticated and assessment surfaces use the localization provider for shared labels and actions, preserving dynamic user/course data.
- [x] Add localization regression tests and verify responsive language switching, type checking, tests, and production build.
- [x] Save a checkpoint for the multilingual experience.

# Localization Enhancements
- [x] Detect the initial locale from browser language preferences while preserving an explicit saved choice.
- [x] Animate language changes and RTL direction transitions without causing layout or hydration issues.
- [x] Add a user-facing translation improvement suggestion form with locale, page, source text, suggested correction, and optional contact details.
- [x] Persist translation suggestions through the existing inquiry workflow with spam protection and clear success/error feedback.
- [x] Add regression coverage and verify accessibility, responsive behavior, type checking, tests, and production build.
- [x] Save a checkpoint for the localization enhancements.

# Translation Operations and International SEO
- [x] Add an admin-only translation-suggestion review query with status/search/date filters and pagination.
- [x] Add admin approve/reject mutations with audit-safe reviewer and timestamp fields.
- [x] Add a dashboard section for reviewing, approving, and rejecting translation suggestions.
- [x] Extend course lesson, module, quiz, and assessment body content through locale-aware content maps with English fallback.
- [x] Add locale-specific sitemap URLs and hreflang alternate links for public localized routes.
- [x] Add regression coverage and verify accessibility, responsive behavior, type checking, tests, and production build.
- [x] Save a checkpoint for translation operations and international SEO.

# Google OAuth Configuration Retest
- [x] Provide step-by-step Google Cloud Console OAuth credential configuration guidance.
- [x] Verify Google OAuth client ID and secret availability in the backend without exposing secret values.
- [x] Retest the live Google OAuth start redirect and callback prerequisites after URI updates.
- [x] Report any remaining browser-side consent or callback action required from the user.

# Google OAuth and Authenticated Localization QA
- [x] Add automated Google OAuth start/state/nonce and callback/session persistence coverage without real provider credentials.
- [x] Prepare production OAuth consent-screen branding and verified legal-link configuration.
- [x] Test authenticated dashboard language switching across supported locales.
- [x] Test Arabic RTL direction, layout transition, and persistence on the authenticated dashboard.
- [x] Run the full validation suite and publish the completed QA improvements.

# Enrollment OAuth and Profile Settings
- [x] Add a loading spinner and processing status message to Google OAuth sign-in during enrollment.
- [x] Add connected Google account details to the user profile settings page.
- [x] Add preferred-language controls to profile settings using the existing locale preference contract.
- [x] Prepare branded consent-screen logo upload guidance and Google app verification steps.
- [x] Add regression coverage and verify enrollment, settings, locale persistence, type checking, tests, and production build.
- [x] Save a checkpoint for the enrollment OAuth and profile settings improvements.

# Course Access Gate Correction
- [x] Route registered learners from the course sign-in gate to their dashboard or course enrollment continuation.
- [x] Route unregistered learners into registration while preserving the intended course slug and return step.
- [x] Make the verified first staged payment the explicit unlock action for the course.
- [x] Ensure unpaid users see course highlights only and cannot access protected lesson content.
- [x] Add regression coverage for registered, unregistered, pending-payment, and first-payment-success paths.
- [x] Run type checking, tests, production build, and responsive enrollment verification.
- [x] Save a checkpoint for the corrected course access workflow.

# Profile Payment Visibility and Checkout QA
- [x] Display current course enrollment status and recent staged-payment history in Profile Settings.
- [x] Add a localized success toast when the preferred language is updated.
- [x] Add a clearly labeled mock checkout interface for the staged first payment, isolated from production Paystack charging.
- [x] Add regression coverage for profile payment data, language update feedback, and mock checkout completion.
- [x] Validate registration-to-enrollment flow, payment gating, responsive settings UX, TypeScript, tests, and production build.
- [x] Save a checkpoint for the profile payment and checkout QA enhancements.

# Payment History QA and Localization
- [x] Add a main-dashboard shortcut linking directly to Profile Settings payment history.
- [x] Add a development-only mock payment reset action for repeating enrollment tests.
- [x] Localize payment status, enrollment progress, staged-payment, and mock QA copy in every supported locale.
- [x] Add regression coverage for dashboard navigation, reset safety, and all-locale translation keys.
- [x] Validate dashboard, profile, course gating, multilingual rendering, TypeScript, tests, and production build.
- [x] Save a checkpoint for the payment-history QA and localization enhancements.

# Course Localization and Enrollment QA Expansion
- [x] Translate all dynamic course titles and descriptions for the ten supported locales with English fallback.
- [x] Add a development-only enrollment fixture picker for pending, stage-one-paid, stage-two-paid, stage-three-paid, and completed states.
- [x] Add a dedicated Payment History tab to the main authenticated dashboard.
- [x] Create and validate a reusable skill documenting the localization and enrollment QA workflow.
- [x] Add regression coverage and verify type checking, tests, production build, responsive dashboard UX, and production safety.
- [x] Save a checkpoint for the course localization and enrollment QA expansion.

# Payment History, Full Content Localization, and Navigation Language Switcher
- [x] Add filter controls for course, payment stage, payment status, and date range to the dashboard Payment History tab.
- [x] Add stable sorting controls for transaction date, amount, course, stage, and status, with accessible empty states.
- [x] Add translated long-form lesson content for supported locales with clear English fallback and no changes to course identifiers.
- [x] Add translated quiz prompts, options, explanations, and feedback for supported locales while preserving answer correctness.
- [x] Add or refine the global navigation language switcher dropdown for all ten locales, including native labels and RTL behavior.
- [x] Add regression coverage for transaction filtering/sorting, long-form lesson/quiz localization, and navigation locale switching.
- [x] Run type checking, focused tests, full non-network tests, production build, and responsive desktop/mobile/RTL verification.
- [x] Save a checkpoint for the payment history, full content localization, and navigation language switcher enhancements.

# Server Pagination, Cultural Localization, and Browser QA
- [x] Add protected server-side payment-history pagination with filter/sort inputs and total counts.
- [x] Update the Payment History tab to query paginated transaction rows and expose accessible page controls.
- [x] Add locale-native, course-specific examples and context to long-form lesson projections without changing stable course or quiz identifiers.
- [x] Add regression coverage for paginated payment history and course-specific localized examples.
- [x] Add automated browser coverage for language switching, persistence, and Arabic RTL rendering.
- [x] Run TypeScript, focused tests, full non-network tests, production build, and responsive/RTL browser verification.
- [x] Save a checkpoint for server pagination, cultural localization, and browser QA coverage.

# Independent Email and Username Credential Authentication
- [x] Audit the existing credential registration, login, logout, session, and password-reset contracts and frontend entry points.
- [x] Ensure email and username/password registration and sign-in work without Google or LinkedIn configuration.
- [x] Preserve secure password hashing, generic authentication errors, rate limiting, session issuance, logout, and email-only password recovery.
- [x] Make social OAuth buttons explicitly optional alternatives rather than prerequisites for credential flows.
- [x] Add regression coverage for credential-only registration/login and authentication when OAuth settings are absent.
- [x] Run TypeScript, focused auth tests, full non-network tests, production build, and responsive sign-in/register verification.
- [x] Save a checkpoint for independent email and username credential authentication.

# Unified Multi-Method Authentication
- [x] Audit credential identifiers, OAuth callbacks, provider matching, and session persistence for cross-method sign-in.
- [x] Allow users to choose email/password, username/password, Google, LinkedIn, or Manus OAuth without requiring a single preferred method.
- [x] Add safe account matching/linking rules that prevent duplicate or cross-account takeover while preserving existing profile data.
- [x] Unify auth-page copy and controls so all available methods are clearly optional alternatives with consistent return-to behavior.
- [x] Add regression coverage for provider linking, existing-account matching, credential fallback, session continuity, and collision rejection.
- [x] Run TypeScript, focused authentication tests, full non-network tests, production build, and responsive sign-in/register verification.
- [x] Save a checkpoint for unified multi-method authentication.

# Complete Sitewide Localization
- [x] Audit all user-visible strings and generated copy across public pages, menus, dashboards, account flows, admin tools, courses, lessons, quizzes, checkout, assessments, reports, certificates, emails, PDFs, QR verification, and SEO.
- [x] Expand the typed locale contract and translation maps so every supported locale has native copy or an explicit safe English fallback.
- [x] Wire locale-aware rendering through all frontend pages, navigation, learning content, quizzes, payment and assessment workflows, and authenticated dashboards.
- [x] Localize report and certificate labels, generated PDFs/images, email templates, QR verification messaging, and organization-forwarded outputs using the selected locale.
- [x] Preserve locale preference precedence, Arabic RTL behavior, locale-aware metadata, hreflang, and stable IDs, routes, payment references, and quiz scoring identifiers.
- [x] Add completeness and fallback regression tests plus browser coverage for representative public, dashboard, course, checkout, assessment, report, certificate, and Arabic RTL surfaces.
- [x] Run TypeScript, focused and full tests, production build, runtime checks, and responsive/RTL visual verification.
- [x] Save a checkpoint for complete sitewide localization.

# Staged Complete Localization Batches
- [x] Batch 1: translate public homepage, footer, legal pages, contact/inquiry flows, course catalog entry points, and global navigation in all ten locales.
- [x] Batch 1: verify public locale switching, persistence, metadata, and Arabic RTL rendering; save a batch checkpoint.
- [x] Batch 2: translate authentication, dashboard, settings, profile, payment history, checkout, enrollment, and payment-success workflows in all ten locales.
- [x] Batch 2: verify authenticated locale switching and staged-payment UI; save a batch checkpoint.
- [x] Batch 3: translate course workspace, lessons, quizzes, assessments, CareerPath, feedback, and progress states in all ten locales.
- [x] Batch 3: verify localized learning content, scoring identifiers, and RTL assessment navigation; save a batch checkpoint.
- [x] Batch 4: translate emails, PDFs, certificates, QR verification, organization forwarding, and admin tools in all ten locales.
- [x] Batch 4: verify generated artifacts and delivery copy; save a batch checkpoint.
- [x] Run complete locale completeness tests, browser tests, TypeScript, full Vitest, production build, and responsive/RTL verification.
- [x] Mark the complete staged localization work finished and publish the final checkpoint.
- [x] Batch 2 increment: localize primary authentication, workspace, settings navigation, and payment-success sign-in labels through the shared locale system.
- [x] Batch 3 increment: connect CareerPath step navigation and Self Assessment persistent footer labels to the shared ten-locale provider; preserve scoring, payment, and resume behavior.
- [x] Batch 3 increment: connect psychometric results workspace navigation to the shared locale provider and add ten-locale authentication localization regression coverage.
- [x] Batch 3 increment: connect the course workspace access gate dashboard link to the shared locale provider while preserving staged-payment gating.
- [x] Batch 2 increment: connect password-reset secure-access and sign-in labels to the shared authentication locale map without changing token validation or reset behavior.
- [x] Batch 2 increment: localize the main dashboard Overview navigation labels while preserving payment-history tab routing and authenticated dashboard behavior.
- [x] Batch 4 increment: connect the public psychometric verification return action to the selected locale while preserving authenticity and payment-status verification.
- [x] Batch 2 increment: connect the staff dashboard workspace label to the shared locale provider while preserving assignment filters, updates, and pagination.
- [x] Batch 4 increment: connect the admin observatory workspace heading to the shared locale provider without changing admin authorization or operational analytics.
- [x] Batch 4 increment: add locale-aware public escape navigation to shared read-only reports while preserving secure token access and report privacy.
- [x] Batch 2 increment: localize the Settings save action through the existing translated preference vocabulary while preserving profile, theme, language, and payment updates.
- [x] Localization QA increment: extend all-locale regression coverage to core navigation labels and generated assessment, certificate, receipt, and verification copy with explicit non-empty assertions.
- [x] Batch 3 increment: localize the unauthenticated course access gate sign-in action while preserving registration return paths, staged payment gating, and protected lesson access.
- [x] Localization browser increment: verify Arabic RTL and locale metadata on representative public assessment, CareerPath, psychometric, and certificate-verification routes; all three Playwright cases pass.
- [x] Batch 3 increment: localize course-catalog escape labels in the protected course gate through the shared course vocabulary without changing lesson access or checkout behavior.
- [x] Batch 3 increment: add a server-safe ten-locale assessment workflow copy map and use it for progress restoration, reset, save, review, module navigation, and preferences controls.
- [x] Regression maintenance: update the assessment source-level navigation assertion to accept locale-map rendering; full Vitest suite now passes with 70 files and 248 tests.
- [x] Batch 3 increment: localize the Self Assessment Previous-module control through the ten-locale workflow copy map while preserving keyboard and disabled-state behavior.
- [x] Batch 3 increment: localize the course catalog category default and reset labels while preserving the full catalog on first render for non-English locales.
- [x] Browser validation increment: confirm the localized course-category filter does not hide the catalog on non-English first render; all three locale and representative-route Playwright cases pass.
- [x] Batch 3 increment: provide translated category labels for Business & Enterprise, Leadership & Workplace, Career & Education, Performance & Innovation, Personal Development, and the all-categories filter in all ten locales.
- [x] Add focused course-category localization regression coverage for all ten locales and unknown-locale fallback.
- [x] Batch 2/3 increment: localize the public course enrollment modal and staged-checkout handoff labels across all ten locales.
- [x] Validate course enrollment localization with TypeScript, focused catalog tests, the full Vitest suite, and production build.
- [x] Add complete regression coverage for the ten-locale course-enrollment copy map and English fallback.
- [x] Batch 2/3 increment: localize the unauthenticated course-workspace registration action with the shared ten-locale authentication copy map.
- [x] Verify the course-workspace authentication localization with focused tests, the complete Vitest suite, TypeScript, and a production build.
- [x] Batch 2 increment: localize the authenticated first-installment checkout form labels and payment-loading state across all ten locales.
- [x] Verify the localized first-installment checkout with focused tests, the complete Vitest suite, TypeScript, and production build.
- [x] Batch 2 increment: localize the unlocked course workspace checkout-identity dialog’s step, learner fields, close action, and Paystack continuation across all ten locales.
- [x] Verify the unlocked checkout-identity localization with focused tests, the complete Vitest suite, TypeScript, and production build.
- [x] Add and validate the localized certificate label used by the unlocked course workspace across all ten supported locales.
- [x] Batch 3 increment: localize course-workspace previous/next module and quiz submission controls with the ten-locale assessment workflow copy map.
- [x] Verify the course-workspace assessment-copy increment with focused tests, the complete Vitest suite, TypeScript, and production build.
- [x] Batch 3 increment: localize the interactive lesson-player close control and study-timer descriptor through the shared ten-locale enrollment copy map.
- [x] Verify the lesson-player localization with focused tests, the complete Vitest suite, TypeScript, and production build.
- [x] Expand the course-workspace lesson player with localized lesson-progress, save-for-later, and saved-state labels across all ten supported locales.
- [x] Verify the expanded lesson-player localization with focused tests, the complete Vitest suite, TypeScript, and production build.
- [x] Batch 3 increment: localize psychometric assessment progress, navigation, consent, and secure-checkout labels across all ten supported locales.
- [x] Add and validate psychometric workflow localization regression coverage with safe unknown-locale fallback.
- [x] Batch 3 increment: localize psychometric progress, question navigation, consent, and secure-checkout labels using a typed ten-locale workflow map.
- [x] Add regression coverage for psychometric workflow locale completeness and unknown-locale fallback.
- [x] Add a shared dashboard navigation menu that groups user, staff, and admin items for quick access.
- [x] Add a scalable dashboard item registry so newly created dashboard items can be added to navigation consistently.
- [x] Add pagination controls and compact list views for long dashboard item collections across user, staff, and admin dashboards.
- [x] Optimize dashboard responsive layout, spacing, empty states, and mobile navigation without changing existing permissions or workflows.
- [x] Add dashboard pagination/menu regression tests and verify desktop/mobile rendering, TypeScript, full Vitest, and production build.
- [x] Save a checkpoint for the dashboard navigation, pagination, and UX improvements.

# Public Website UX and SEO Refinement

- [x] Create a reusable public-page shell with branded navigation, language access, responsive mobile menu, breadcrumbs, and footer links.
- [x] Add an About page using the supplied positioning, audiences, approach, and credibility content without inventing proof points.
- [x] Add a Consulting Services page with the supplied service pathways, process, audience fit, outcomes, and FAQ content.
- [x] Add a School Solutions page for school owners, principals, teachers, and institutions with clear conversion paths.
- [x] Add a Resources page with editorial resource categories and useful internal links.
- [x] Add a Blog / Insights page with transparent editorial placeholders that do not fabricate published articles or authors.
- [x] Add a dedicated Contact page with accessible inquiry form, category selection, arithmetic spam check, consent, and support channels.
- [x] Improve public navigation and homepage pathways to expose the new pages without overcrowding the header.
- [x] Add route-specific SEO titles, descriptions, canonical metadata, Open Graph context, and JSON-LD for the new public pages.
- [x] Add public-page route and metadata regression tests, then verify desktop/mobile UX, TypeScript, full Vitest, and production build.
- [x] Read the complete TODO file, mark only validated items complete, and save a checkpoint for the public UX/SEO refinement.

# Insights Preview and Service Motion

- [x] Populate Insights with clearly labeled placeholder article cards and non-fabricated contributor profile placeholders for layout review.
- [x] Add hover states and scroll-reveal animations to the new service pages with reduced-motion support and accessible focus behavior.
- [x] Add regression coverage for placeholder labeling and motion accessibility contracts, then verify responsive screenshots, TypeScript, full Vitest, and production build.
- [x] Read the complete TODO file, mark validated items complete, and save a checkpoint for the Insights and service interaction refinement.

# Insights Discovery and Public Interaction Extension

- [x] Apply reusable scroll reveals and hover states to the About page.
- [x] Apply reusable scroll reveals and hover states to the Resources page.
- [x] Add category filtering and keyword search to the Insights preview cards with an accessible no-match state.
- [x] Add newsletter subscription capture at the bottom of Insights using an appropriate server-backed procedure and consent copy.
- [x] Add regression coverage for Insights filtering and newsletter validation, then verify responsive UX, TypeScript, full Vitest, and production build.
- [x] Read the complete TODO file, mark validated items complete, and save a checkpoint for the public interaction extension.

# Newsletter Administration and Insights Scalability

- [x] Add protected admin queries and CSV export helpers for newsletter subscribers with pagination and safe CSV escaping.
- [x] Add an admin newsletter subscribers panel with loading, empty, error, pagination, and CSV download states.
- [x] Add the newsletter management item to the role-aware admin navigation registry.
- [x] Add Load More pagination to the Insights preview cards while preserving search and category filters.
- [x] Add real-time inline email validation and an accessible animated newsletter success state with reduced-motion support.
- [x] Add regression coverage for admin authorization, subscriber pagination/export, Insights Load More behavior, and newsletter validation.
- [x] Verify responsive UX, TypeScript, full Vitest, production build, runtime logs, and desktop/mobile screenshots.
- [x] Read the complete TODO file, mark validated items complete, and save a checkpoint for the newsletter administration and Insights scalability work.

# Newsletter Filters, Insights Articles, and Reusable Workflow Skill

- [x] Add protected newsletter subscriber search and status-filter inputs with server-side pagination.
- [x] Add date-range filters to newsletter CSV export with UTC-safe inclusive boundaries and safe CSV escaping.
- [x] Add regression coverage for newsletter filtering, date boundaries, export escaping, and admin authorization.
- [x] Add individual Insights article detail routes and link each preview card to its detail page.
- [x] Add honest full-content article drafts for the current preview topics with clear preview/draft labeling and related links.
- [x] Add route-specific SEO metadata and structured data for Insights article detail pages.
- [x] Create a reusable Profound IQ consulting website workflow skill using skill-creator, validate it, and prepare the SKILL.md deliverable.
- [x] Run full TypeScript, Vitest, production build, responsive/route verification, mark validated items complete, and save a website checkpoint.
- [x] Fix the existing Admin Inquiry maximum-update-depth runtime error observed during admin route verification, then rerun runtime and dashboard checks.

# Newsletter Lifecycle and Insights Publishing

- [x] Add double opt-in subscriber confirmation tokens with expiry, resend-safe behavior, and confirmation email delivery.
- [x] Add one-click unsubscribe handling with signed/expiring token verification and clear public status pages.
- [x] Add admin subscriber lifecycle controls for pending, confirmed, unsubscribed, and resubscribe states.
- [x] Add protected Insights publishing controls for draft and published statuses without fabricating editorial identities.
- [x] Add server-side Insights article search with pagination, category/status filters, and stable slug handling.
- [x] Add rich social preview image generation for published Insights articles with safe fallback behavior.
- [x] Update the reusable Profound IQ workflow skill with consent lifecycle, publishing, search, and social-preview patterns, then validate it.
- [x] Add regression coverage for token security, unsubscribe behavior, publishing visibility, search boundaries, social previews, and admin authorization.
- [x] Verify runtime, accessibility, responsive routes, TypeScript, full Vitest, production build, and save a publishable checkpoint.

- [x] Add newsletter confirmation and unsubscribe landing routes for double opt-in links
- [x] Add admin-controlled Insights draft/published workflow with social preview URL controls
- [x] Refactor Insights search and article detail rendering to use server-backed procedures
- [x] Update the reusable Profound IQ site workflow skill with consent and publishing patterns
- [x] Validate newsletter lifecycle, publishing workflow, server search, and responsive UI

# Bi-weekly Newsletter Automation
- [x] Add a durable bi-weekly newsletter delivery handler for confirmed subscribers only.
- [x] Add idempotent delivery gating, unsubscribe-token rotation, and delivery summaries.
- [x] Add admin controls to enable and inspect the bi-weekly newsletter schedule.
- [x] Add tests for cadence, consent filtering, idempotency, token rotation, and authorization.
- [x] Validate, checkpoint, deploy, and create the production schedule.

- [x] Activate the production newsletter schedule every other Monday at 09:00 EAT (06:00 UTC) and verify its callback.

# Strict Staged Payment Access
- [x] Audit and harden lesson access so every lesson requires its staged payment.
- [x] Redirect unpaid lesson clicks to the matching installment checkout without revealing lesson content.
- [x] Add regression coverage for payment-gated lesson navigation and quality-control admin access.
- [x] Validate responsive payment-gate UX and checkpoint the release.

# Payment Required UX and Access Audit
- [x] Add a dedicated payment-required modal with matching installment details and checkout action.
- [x] Refresh course enrollment state immediately after verified Paystack payment webhooks.
- [x] Persist denied lesson-access events and expose admin drop-off analytics.
- [x] Add regression tests, responsive checks, and checkpoint the release.

# Access Funnel and Unlock Progress
- [x] Add denied-to-paid access conversion metrics to the admin observatory.
- [x] Add filtered CSV export for access-audit reports.
- [x] Add a visual lesson-unlock progress bar to the payment-required modal.
- [x] Add tests, responsive verification, and checkpoint the release.

# Access Observatory Trends, Exports, and Alerts
- [x] Add daily conversion trend data and chart to the admin access observatory.
- [x] Include individual denied-access events in the filtered CSV export.
- [x] Add persisted configurable drop-off threshold and admin alert state.
- [x] Update and validate the reusable payment-access observatory skill.
- [x] Add tests, responsive checks, production build, and checkpoint the release.

# Conversion Segmentation and Period Comparison
- [x] Add cohort and device segmentation filters to conversion trend analytics.
- [x] Add Last 7 Days and Last 30 Days presets shared by charts and CSV exports.
- [x] Add current-versus-previous-period comparison metrics and visual treatment.
- [x] Update reusable skill, add tests, verify responsive behavior, and checkpoint the release.

# Saved Segmentation Presets and Chart Exports
- [x] Add admin quick-access presets for custom access-observatory filter combinations.
- [x] Add admin controls to manually assign users to named cohorts for segmentation.
- [x] Add PNG and PDF exports for conversion trend charts.
- [x] Add tests, responsive verification, skill update, and checkpoint the release.

# Cohort Management, Branded Reports, and Shared Presets
- [x] Add a dedicated admin cohort-management route with bulk user assignment.
- [x] Replace browser print with a branded server-generated conversion PDF report.
- [x] Add persisted shared filter presets with role-based visibility controls.
- [x] Add authorization/tests, responsive checks, skill update, and checkpoint the release.

# Persistent Presets, Cohort CSV Import, and Report Email Sharing
- [x] Persist dashboard filter presets through the server across admin sessions.
- [x] Add validated CSV upload and bulk cohort assignment to cohort management.
- [x] Add an admin email-sharing action for branded server-generated PDF reports.
- [x] Add authorization/tests, responsive checks, and checkpoint the release.

# Interactive Course Lesson Hardening
- [x] Lock all course lessons and lesson navigation while a quiz is open or being submitted.
- [x] Reduce the lesson countdown to 30 minutes before the next lesson can unlock.
- [x] Expand the lesson content with deeper explanations, examples, and practical activities.
- [x] Add required, saved, formatted response fields for every lesson feedback task.
- [x] Add motivational completion motion and clear validation for incomplete responses.
- [x] Add tests, responsive checks, and checkpoint the release.

# Lesson Response Autosave, Instructor Review, and Localization
- [x] Add debounced server autosave for lesson responses with visible save-status feedback.
- [x] Add staff/instructor response review and feedback with protected authorization.
- [x] Localize response-task instructions and motivational messages across all ten supported locales.
- [x] Add tests, responsive verification, production build, and checkpoint the release.

# Learner Feedback and Instructor Review Analytics
- [x] Display reviewed instructor feedback to learners inside the course workspace.
- [x] Add review analytics by course and module for staff and administrators.
- [x] Add intuitive course and date filters to the staff response-review workspace.
- [x] Add focused tests, responsive verification, production build, and publish checkpoint.


# Feedback Notifications and Review Analytics Exports
- [x] Notify learners when new instructor feedback is posted and support read-state handling.
- [x] Add response-aging metrics and reviewer workload metrics to review analytics.
- [x] Add protected CSV and PDF exports for staff review analytics.
- [x] Add focused tests, responsive verification, production build, and publish checkpoint.


# Notification Preferences and Scheduled Review Analytics
- [x] Add learner settings for email and in-app instructor-feedback notification preferences.
- [x] Add reviewer workload trend data and a staff-facing chart over time.
- [x] Add staff-managed automated review analytics email scheduling with pause/resume controls.
- [x] Add scheduled delivery tests, responsive verification, production build, deployment, and checkpoint.


# Course Lesson Illustration Enrichment
- [x] Define reusable explanatory, applicational, and experiential illustration content fields for lessons.
- [x] Enrich all course lessons with scenario-appropriate illustrations and render them in the interactive player.
- [x] Localize illustration labels and add regression coverage for lesson illustration completeness.
- [x] Run tests, responsive verification, production build, and publish checkpoint.


# AI Lesson Visuals and Experiential Activities
- [x] Generate and integrate branded explanatory visual assets for all course lessons.
- [x] Add persistent learner bookmarks for explanatory, applicational, and experiential illustration cards.
- [x] Add experiential-story quiz and reflection interactions with localized copy and persistence.
- [x] Add focused tests, responsive verification, production build, and publish checkpoint.

# Localized My Illustrations Gallery
- [x] Localize experiential activity questions, options, feedback, and reflection prompts across all ten supported locales.
- [x] Create a protected cross-course My Illustrations gallery from durable learner bookmarks.
- [x] Add explanatory artwork zoom and visual study-sheet download actions.
- [x] Add focused tests, responsive verification, production build, and publish checkpoint.

# Localized My Illustrations Gallery and Artwork Study Tools

- [x] Complete ten-locale labels and learner-facing copy for My Illustrations and study-sheet actions.
- [x] Build the protected cross-course My Illustrations gallery with search, mode filters, and bookmark removal.
- [x] Add artwork zoom preview and branded visual study-sheet downloads in the gallery and lesson player.
- [x] Add the gallery route and shared dashboard navigation entry.
- [x] Add regression tests for the gallery contracts and study-sheet helper.
- [x] Run type checks, full Vitest suite, production build, and responsive browser verification.
- [x] Save a checkpoint with the completed localized illustration experience.

# My Illustrations PNG Export, Scaling, and Organization

- [x] Add PNG export alongside SVG study-sheet downloads.
- [x] Add server-backed pagination or virtualization for large illustration collections.
- [x] Add persistent custom tags or folders for saved illustrations.
- [x] Add localized UI copy and accessible organization controls.
- [x] Add regression tests, run full validation, and save a live checkpoint.
