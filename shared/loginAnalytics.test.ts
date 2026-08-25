import { describe, expect, it } from "vitest";
import { aggregateDeviceTrends, aggregateLoginTrends } from "./loginAnalytics";

describe("login analytics aggregation", () => {
  it("groups successful, failed, and rate-limited events by week", () => {
    expect(aggregateLoginTrends([
      { week: "2026-W33", success: true, count: 4 },
      { week: "2026-W33", success: false, failureCode: "invalid_credentials", count: 1 },
      { week: "2026-W33", success: false, failureCode: "rate_limited", count: 2 },
      { week: "2026-W34", success: true, count: 1 },
    ])).toEqual([
      { week: "2026-W33", success: 4, failed: 3, blocked: 2 },
      { week: "2026-W34", success: 1, failed: 0, blocked: 0 },
    ]);
  });

  it("normalizes device families and preserves zero-value series fields", () => {
    expect(aggregateDeviceTrends([
      { week: "2026-W34", deviceType: "desktop", count: 3 },
      { week: "2026-W34", deviceType: "mobile", count: 2 },
      { week: "2026-W34", deviceType: "watch", count: 1 },
      { week: "2026-W33", deviceType: null, count: 4 },
    ])).toEqual([
      { week: "2026-W33", desktop: 0, mobile: 0, tablet: 0, unknown: 4 },
      { week: "2026-W34", desktop: 3, mobile: 2, tablet: 0, unknown: 1 },
    ]);
  });
});
