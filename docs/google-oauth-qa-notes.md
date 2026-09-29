# Google OAuth QA notes

Official references consulted:

- Google OAuth 2.0 for Web Server Applications: https://developers.google.com/identity/protocols/oauth2/web-server
- Google Cloud Manage OAuth Clients: https://support.google.com/cloud/answer/15549257?hl=en
- Configure the OAuth consent screen: https://developers.google.com/workspace/guides/configure-oauth-consent

Current project values:

- Application home page: https://profoundiqconsulting.com/
- Privacy policy: https://profoundiqconsulting.com/privacy-policy
- Terms of service: https://profoundiqconsulting.com/terms-of-service
- Authorized domains shown in Google Auth Platform: profoundiqconsulting.com.

Automated checks:

- GOOGLE_OAUTH_CLIENT_ID is present in the backend environment; only length and suffix were inspected.
- GOOGLE_OAUTH_CLIENT_SECRET is present in the backend environment; only length and suffix were inspected.
- Live Google OAuth start endpoint returns a Google authorization URL with client_id, state, nonce, and callback https://profoundiqconsulting.com/api/oauth/google/callback.
- Browser consent completed successfully and returned to /dashboard with an authenticated session.
- Deterministic OAuth tests cover exact callback construction, state/nonce cookie validation, mocked token exchange, profile persistence, and session-cookie creation.

Console finding:

- Google Auth Platform Branding rejected the first save with “Please review and update the invalid fields”; the visible form did not expose a field-level error. The three public URLs each returned HTTP 200. The browser session therefore needs the form to be rechecked for Google’s accepted URL/domain validation before claiming branding was saved.
