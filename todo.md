# OAuth State Compatibility Fix

- [x] Trace the preview cookie and OAuth state behavior.
- [x] Identify the root cause: OAuth reached the callback, but the missing users table prevented session persistence; CSRF validation remains unchanged.
- [x] Apply the safe database prerequisite repair and retain the existing nonce-based CSRF guard.
- [x] Revalidate administrator sign-in and protected admin access.
- [x] Save a corrected checkpoint or document the external preview blocker.
