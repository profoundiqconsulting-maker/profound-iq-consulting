import { describe, expect, it } from "vitest";
import { getShareTrend } from "./socialAnalytics";

describe("getShareTrend", () => {
  it("returns a green-direction increase against a previous period", () => {
    expect(getShareTrend(15, 10)).toEqual({ deltaPercent: 50, direction: "up" });
  });

  it("returns a red-direction decrease against a previous period", () => {
    expect(getShareTrend(5, 10)).toEqual({ deltaPercent: -50, direction: "down" });
  });

  it("returns neutral for an unchanged or unavailable baseline", () => {
    expect(getShareTrend(10, 10)).toEqual({ deltaPercent: 0, direction: "neutral" });
    expect(getShareTrend(10, 0)).toEqual({ deltaPercent: null, direction: "neutral" });
  });
});
