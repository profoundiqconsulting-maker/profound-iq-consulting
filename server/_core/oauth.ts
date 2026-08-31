import type { Express } from "express";

/**
 * Register OAuth routes.
 * In the self-hosted version, auth is handled via tRPC mutations:
 * - auth.register: Create a new account
 * - auth.login: Authenticate with email/username and password
 * - auth.requestPasswordReset: Request a password reset email
 * - auth.resetPassword: Reset password with a token
 * - auth.logout: Revoke session (handled via tRPC)
 *
 * This function is kept for compatibility with the index.ts initialization,
 * but doesn't register any routes. Auth is entirely tRPC-based.
 */
export function registerOAuthRoutes(app: Express) {
  // No routes to register - auth is handled via tRPC
  console.log("[Auth] Email/password authentication via tRPC configured");
}

