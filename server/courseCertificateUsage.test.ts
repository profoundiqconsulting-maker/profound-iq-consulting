import { describe, expect, it } from "vitest";
import {
  normalizeCertificateUsageDateRange,
  summarizeCertificateUsageRows,
} from "../shared/certificateAnalytics";

describe("server certificate usage analytics contract", () => {
  it("normalizes protected admin date filters to inclusive UTC boundaries", () => {
    const range = normalizeCertificateUsageDateRange(
      "2026-08-01",
      "2026-08-31"
    );
    expect(range.fromDate?.toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(range.toDate?.toISOString()).toBe("2026-08-31T23:59:59.999Z");
  });

  it("preserves download counts by platform while separating shares", () => {
    expect(
      summarizeCertificateUsageRows([
        { eventType: "download", platform: "pdf", count: 4 },
        { eventType: "download", platform: "png", count: 2 },
        { eventType: "share", platform: "linkedin", count: 3 },
      ])
    ).toMatchObject({
      totals: { downloads: 6, shares: 3 },
      byPlatform: expect.arrayContaining([
        { eventType: "download", platform: "pdf", count: 4 },
        { eventType: "download", platform: "png", count: 2 },
      ]),
    });
  });
});
