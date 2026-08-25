import { describe, expect, it } from "vitest";
import { buildPsychometricAnalyticsCsv, buildPsychometricAnalyticsExcel } from "./psychometricAnalyticsExport";
import { getPsychometricCourseRecommendations } from "./psychometricRecommendations";

describe("psychometric analytics exports", () => {
  const analytics = { totals: { started: 4, paid: 3, pending: 1, sent: 2, sending: 0, failed: 1, conversionRate: 75, emailRate: 67 }, byProfile: [{ testSlug: "leadership-potential-profile", started: 4, paid: 3, sent: 2, pending: 1, conversionRate: 75, emailRate: 67 }], trend: [{ date: "2026-08-25", started: 4, paid: 3, sent: 2 }] };
  it("exports aggregate, profile, and trend rows as escaped CSV", () => { const csv = buildPsychometricAnalyticsCsv(analytics); expect(csv).toContain('"section","profile_or_date"'); expect(csv).toContain('"totals","all","4"'); expect(csv).toContain('"profile","leadership-potential-profile"'); expect(csv).toContain('"trend","2026-08-25"'); });
  it("exports an Excel-compatible XML workbook", () => { const xls = buildPsychometricAnalyticsExcel(analytics); expect(xls).toContain("urn:schemas-microsoft-com:office:spreadsheet"); expect(xls).toContain("leadership-potential-profile"); });
});

describe("personalized psychometric recommendations", () => {
  it("adds the lowest-dimension signal and excludes completed courses", () => { const recommendations = getPsychometricCourseRecommendations({ testSlug: "leadership-potential-profile", domains: [{ label: "Strategic judgement", score: 42 }, { label: "Influence", score: 78 }] as never }, ["leadership-and-self-leadership"]); expect(recommendations.every((item) => item.slug !== "leadership-and-self-leadership")).toBe(true); expect(recommendations[0]?.scoreSignal).toContain("Strategic judgement is 42/100"); });
});
