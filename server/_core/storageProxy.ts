import type { Express } from "express";

/**
 * Storage proxy for DigitalOcean Spaces.
 * In the self-hosted version, files are stored directly in DO Spaces
 * and accessed via public URLs. No proxy layer needed.
 *
 * This function is kept for compatibility with the index.ts initialization,
 * but doesn't register any routes.
 */
export function registerStorageProxy(app: Express) {
  // No routes needed - DO Spaces files are accessed directly via public URLs
  console.log("[Storage] DigitalOcean Spaces configured for direct access");
}

