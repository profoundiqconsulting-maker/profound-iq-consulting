# Google OAuth production branding and verification

## Upload the branded consent-screen logo

1. Open [Google Auth Platform → Branding](https://console.cloud.google.com/auth/branding) and select the Profound IQ Consulting project.
2. In **App information**, choose the upload control for the application logo.
3. Upload the approved square brand mark. Use a clean image with the Profound IQ symbol and wordmark, without transparent or misleading background treatment. Keep the source file available in the project’s managed asset storage so the same approved mark can be reused consistently.
4. Confirm that the application name is **Profound IQ Consulting**, the support email is `profoundiqconsulting@gmail.com`, and the developer contact email is the monitored project address.
5. Confirm the public links are reachable over HTTPS:
   - Home: `https://profoundiq-vguqrhsm.manus.space`
   - Privacy Policy: `https://profoundiq-vguqrhsm.manus.space/privacy-policy`
   - Terms of Service: `https://profoundiq-vguqrhsm.manus.space/terms-of-service`
6. Save the branding configuration. If Google reports an invalid URL, remove the trailing slash from the home-page value and verify that each legal URL returns a public page without authentication.

## Complete production app verification

1. Open **Google Auth Platform → Audience** and confirm the app is configured for **External** users when accounts outside the project organization must sign in.
2. Add the production test accounts required for pre-verification testing. Use only people who have agreed to test the application.
3. In **Data access**, request only the scopes used by the application: OpenID Connect identity, basic profile, and email. Do not request Drive, Gmail, Calendar, or other restricted scopes unless a future feature truly needs them.
4. In **Google Auth Platform → Clients**, verify the web client’s authorized JavaScript origin:
   `https://profoundiq-vguqrhsm.manus.space`
5. Verify the authorized redirect URI exactly:
   `https://profoundiq-vguqrhsm.manus.space/api/oauth/google/callback`
   The scheme, hostname, path, and trailing-slash behavior must match the authorization request exactly.
6. Run the OAuth flow with a test account, confirm the callback returns to the application dashboard, and confirm the account email and Google avatar are handled according to the profile settings.
7. When the app is ready for public use, submit the consent screen for Google verification from the **Branding**, **Audience**, and **Data access** areas. Google may request an authorized-domain proof, a demonstration video, and explanations of how each requested scope is used.
8. Keep the Privacy Policy and Terms of Service publicly accessible and ensure their wording accurately describes account authentication, profile data, cookies, analytics, course payments, and report delivery.

## Operational checks

After any domain change, add the new HTTPS origin and its matching `/api/oauth/google/callback` URI to the same OAuth client. Never place the client secret in frontend code or a public repository. Re-test both a first-time consent flow and a returning-user flow after every OAuth client or domain change.

## References

- [Google OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Auth Platform branding and verification overview](https://support.google.com/cloud/answer/15549257)
