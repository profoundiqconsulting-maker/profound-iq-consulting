import { describe, expect, it } from "vitest";
import { buildCourseEnrollmentCsv } from "./adminExport";
import { renderEmailTemplate, validateEmailTemplateBody } from "./emailTemplate";

describe("admin communication and export helpers", () => {
  it("validates and safely renders only approved email tokens", () => {
    expect(validateEmailTemplateBody("Hello {{name}} about {{course}}.")).toEqual([]);
    expect(validateEmailTemplateBody("Hello {{name}} {{secret}}.")).toEqual(["secret"]);
    expect(renderEmailTemplate("Hello {{name}} about {{course}}.", { name: "Amina", course: "Lead with Clarity" })).toBe("Hello Amina about Lead with Clarity.");
    expect(renderEmailTemplate("{{unsafe}} {{name}}", { name: "Amina" })).toBe(" Amina");
  });

  it("creates an escaped, timestamped course enrollment CSV", () => {
    const createdAt = new Date("2026-08-22T08:00:00.000Z");
    const csv = buildCourseEnrollmentCsv([{ id: 7, courseTitle: 'Lead with "Clarity"', name: "Amina Otieno", email: "amina@example.com", status: "new", createdAt, consentedAt: createdAt }]);
    expect(csv.split("\n")[0]).toBe('"ID","Course","Name","Email","Status","Submitted at","Consent recorded at"');
    expect(csv).toContain('"7","Lead with ""Clarity""","Amina Otieno","amina@example.com","new","2026-08-22T08:00:00.000Z","2026-08-22T08:00:00.000Z"');
  });
});
