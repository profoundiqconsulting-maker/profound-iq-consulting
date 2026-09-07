import { describe, expect, it } from "vitest";
import { sameUtcWeek } from "./scheduledEnrollmentExport";

describe("weekly enrollment export scheduling", () => {
  it("treats dates in the same UTC week as one idempotent run", () => {
    expect(
      sameUtcWeek(
        new Date("2026-08-17T00:01:00.000Z"),
        new Date("2026-08-23T23:59:00.000Z")
      )
    ).toBe(true);
    expect(
      sameUtcWeek(
        new Date("2026-08-23T23:59:00.000Z"),
        new Date("2026-08-24T00:00:00.000Z")
      )
    ).toBe(false);
  });
});
