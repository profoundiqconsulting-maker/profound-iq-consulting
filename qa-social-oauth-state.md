# Social OAuth State QA — 2026-08-31

The social sign-in start buttons now build their `origin` parameter from `window.location.origin`, ensuring the state cookie and provider callback remain on the same host in preview and production. The callback continues to compare provider, nonce, origin, and the host-only state cookie before any token exchange.

Focused social OAuth and credential tests passed: 9 tests across 3 files. TypeScript validation passed. The full Vitest suite and production build passed. After a clean server restart, `/auth?error=invalid_social_oauth_state&returnTo=%2Fcourses%2Flead-with-clarity%3Fworkspace%3D1` rendered a clear recovery message and the browser console contained no project-owned errors.

The Amplitude remote-config stack remains an external Manus editor/preview instrumentation message from `files.manuscdn.com/manus-space-dispatcher/spaceEditor-*.js`; it is not emitted by the project application.
