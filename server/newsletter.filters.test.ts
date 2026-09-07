import { describe, expect, it } from "vitest";
import { normalizeNewsletterDateBound } from "./db";

describe("newsletter date filters", () => {
  it("normalizes the start date to the beginning of the UTC day", () => {
    expect(normalizeNewsletterDateBound("2026-08-27")?.toISOString()).toBe(
      "2026-08-27T00:00:00.000Z"
    );
  });

  it("normalizes the end date inclusively to the final millisecond", () => {
    expect(
      normalizeNewsletterDateBound("2026-08-27", true)?.toISOString()
    ).toBe("2026-08-27T23:59:59.999Z");
  });

  it("leaves empty values unbounded and preserves Date inputs", () => {
    const date = new Date("2026-08-27T12:00:00.000Z");
    expect(normalizeNewsletterDateBound(undefined)).toBeUndefined();
    expect(normalizeNewsletterDateBound(date)).toBe(date);
  });
});
