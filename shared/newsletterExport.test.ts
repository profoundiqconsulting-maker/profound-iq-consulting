import { describe, expect, it } from "vitest";
import { buildNewsletterSubscriberCsv } from "./adminExport";

describe("newsletter subscriber CSV export", () => {
  it("exports subscriber fields with escaped values and ISO timestamps", () => {
    const csv = buildNewsletterSubscriberCsv([{ id: 7, email: "person@example.com", source: "Insights, homepage", status: "subscribed", consentedAt: new Date("2026-08-27T00:00:00.000Z"), createdAt: new Date("2026-08-27T01:00:00.000Z"), updatedAt: new Date("2026-08-27T02:00:00.000Z") }]);
    expect(csv).toContain('"ID","Email","Source","Status","Consented at","Subscribed at","Updated at"');
    expect(csv).toContain('"Insights, homepage"');
    expect(csv).toContain("2026-08-27T01:00:00.000Z");
  });
});
