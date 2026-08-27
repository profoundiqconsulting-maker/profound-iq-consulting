import { describe, expect, it } from "vitest";
import { hashNewsletterToken, isBiweeklyDue } from "./scheduledNewsletter";

describe("bi-weekly newsletter scheduling", () => {
  const now = new Date("2026-08-27T09:00:00.000Z");

  it("sends on the first run and only after fourteen days", () => {
    expect(isBiweeklyDue(null, now)).toBe(true);
    expect(isBiweeklyDue(new Date("2026-08-13T09:00:00.000Z"), now)).toBe(true);
    expect(isBiweeklyDue(new Date("2026-08-14T09:00:00.000Z"), now)).toBe(false);
  });

  it("produces a deterministic 64-character SHA-256 token hash without exposing the raw token", () => {
    const first = hashNewsletterToken("raw-unsubscribe-token");
    expect(first).toHaveLength(64);
    expect(first).toMatch(/^[a-f0-9]+$/);
    expect(hashNewsletterToken("raw-unsubscribe-token")).toBe(first);
    expect(first).not.toContain("raw-unsubscribe-token");
  });
});
