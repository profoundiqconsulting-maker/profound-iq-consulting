import { describe, expect, it } from "vitest";
import { buildCourseEnrollmentCsv, filterCourseEnrollmentRows } from "./adminExport";
import { summarizeAnalyticsEvents } from "./adminAnalytics";
import { renderEmailTemplate, validateEmailTemplateBody } from "./emailTemplate";

describe("admin communication and export helpers", () => {
  it("aggregates analytics event counts for the dashboard", () => {
    expect(summarizeAnalyticsEvents([{ eventName: "assessment_started", count: 2 }, { eventName: "assessment_started", count: 3 }, { eventName: "payment_completed", count: 1 }])).toEqual({ assessment_started: 5, payment_completed: 1 });
  });

  it("filters enrollment rows by date range and status", () => {
    const first = new Date("2026-08-01T10:00:00.000Z");
    const second = new Date("2026-08-15T10:00:00.000Z");
    const rows = [{ id: 1, courseTitle: "A", name: "One", email: "one@example.com", status: "new", createdAt: first, consentedAt: first }, { id: 2, courseTitle: "B", name: "Two", email: "two@example.com", status: "contacted", createdAt: second, consentedAt: second }];
    expect(filterCourseEnrollmentRows(rows, { fromDate: new Date("2026-08-10T00:00:00.000Z"), status: "contacted" }).map((row) => row.id)).toEqual([2]);
  });
  it("validates and safely renders only approved email tokens", () => {
    expect(validateEmailTemplateBody("Hello {{name}} at {{email}} on {{date}} about {{course}}.")).toEqual([]);
    expect(validateEmailTemplateBody("Hello {{name}} {{secret}}.")).toEqual(["secret"]);
    expect(renderEmailTemplate("Hello {{name}} at {{email}} on {{date}} about {{course}}.", { name: "Amina", email: "amina@example.com", date: "22 Aug 2026", course: "Lead with Clarity" })).toBe("Hello Amina at amina@example.com on 22 Aug 2026 about Lead with Clarity.");
    expect(renderEmailTemplate("{{unsafe}} {{name}}", { name: "Amina" })).toBe(" Amina");
  });

  it("creates an escaped, timestamped course enrollment CSV", () => {
    const createdAt = new Date("2026-08-22T08:00:00.000Z");
    const csv = buildCourseEnrollmentCsv([{ id: 7, courseTitle: 'Lead with "Clarity"', name: "Amina Otieno", email: "amina@example.com", status: "new", createdAt, consentedAt: createdAt }]);
    expect(csv.split("\n")[0]).toBe('"ID","Course","Name","Email","Status","Submitted at","Consent recorded at"');
    expect(csv).toContain('"7","Lead with ""Clarity""","Amina Otieno","amina@example.com","new","2026-08-22T08:00:00.000Z","2026-08-22T08:00:00.000Z"');
  });
});
