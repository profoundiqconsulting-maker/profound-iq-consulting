import { describe, expect, it } from "vitest";
import { sameUtcWeek } from "./scheduledPsychometricAnalytics";

describe("weekly psychometric analytics scheduling", () => {
  it("treats dates within one UTC Monday-Sunday window as one run", () => {
    expect(
      sameUtcWeek(
        new Date("2026-08-24T00:00:00.000Z"),
        new Date("2026-08-30T23:59:59.000Z")
      )
    ).toBe(true);
    expect(
      sameUtcWeek(
        new Date("2026-08-30T23:59:59.000Z"),
        new Date("2026-08-31T00:00:00.000Z")
      )
    ).toBe(false);
  });
});
