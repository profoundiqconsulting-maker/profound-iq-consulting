import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const NEWSLETTER_TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

export function createNewsletterToken() {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: hashNewsletterToken(raw) };
}

export function hashNewsletterToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function tokensMatch(raw: string, expectedHash: string | null | undefined) {
  if (!expectedHash || !/^[a-f0-9]{64}$/.test(expectedHash)) return false;
  const actual = Buffer.from(hashNewsletterToken(raw), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
