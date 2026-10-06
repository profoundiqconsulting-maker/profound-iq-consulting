import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildCertificateDownloadChartData,
  filterCertificateUsageRows,
  hasIssuedCertificate,
  normalizeCertificateUsageDateRange,
} from "./certificateAnalytics";

describe("certificate analytics", () => {
  it("only treats a non-empty certificate URL as issued", () => {
    expect(hasIssuedCertificate(undefined)).toBe(false);
    expect(hasIssuedCertificate("  ")).toBe(false);
    expect(hasIssuedCertificate("https://example.com/certificate.svg")).toBe(
      true
    );
  });

  it("normalizes the admin router date input to inclusive UTC boundaries", () => {
    const range = normalizeCertificateUsageDateRange(
      "2026-08-01",
      "2026-08-31"
    );
    expect(range.fromDate?.toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(range.toDate?.toISOString()).toBe("2026-08-31T23:59:59.999Z");
  });

  it("keeps learner social sharing disabled until an issued certificate URL exists", () => {
    const source = readFileSync("client/src/pages/CourseWorkspace.tsx", "utf8");
    expect(source).toContain("CourseShareActions");
    expect(source).toContain(
      "platforms={[\"facebook\", \"linkedin\", \"whatsapp\", \"email\", \"copy\", \"native\"]}"
    );
  });

  it("filters by inclusive date range and aggregates downloads by platform and day", () => {
    const rows = [
      { eventType: "download", platform: "pdf", day: "2026-08-01", count: 2 },
      { eventType: "download", platform: "png", day: "2026-08-02", count: 3 },
      { eventType: "share", platform: "linkedin", day: "2026-08-02", count: 9 },
      { eventType: "download", platform: "pdf", day: "2026-08-05", count: 4 },
    ];
    const filtered = filterCertificateUsageRows(
      rows,
      "2026-08-02",
      "2026-08-05"
    );
    expect(buildCertificateDownloadChartData(filtered)).toEqual({
      byPlatform: [
        { platform: "png", count: 3 },
        { platform: "pdf", count: 4 },
      ],
      daily: [
        { day: "08-02", count: 3 },
        { day: "08-05", count: 4 },
      ],
    });
  });
});
