import { describe, expect, it } from "vitest";
import { buildVerificationAuditCsv, clampAuditPagination, filterAuditHistoryRows } from "./adminAudit";

describe("verification audit exports", () => {
  it("bounds pagination inputs", () => {
    expect(clampAuditPagination(0, 1000)).toEqual({ page: 1, pageSize: 100 });
    expect(clampAuditPagination(3, 8)).toEqual({ page: 3, pageSize: 8 });
  });

  it("filters by administrator and UTC date range", () => {
    const rows = [
      { id: 1, targetOpenId: "target-1", targetEmail: "one@example.com", actorOpenId: "admin-1", actorName: "Amina", actorEmail: "amina@example.com", reason: "Review one", createdAt: new Date("2026-08-01T10:00:00.000Z") },
      { id: 2, targetOpenId: "target-2", targetEmail: "two@example.com", actorOpenId: "admin-2", actorName: "David", actorEmail: "david@example.com", reason: "Review two", createdAt: new Date("2026-08-10T10:00:00.000Z") },
    ];
    expect(filterAuditHistoryRows(rows, { adminSearch: "amina", fromDate: new Date("2026-08-01T00:00:00.000Z"), toDate: new Date("2026-08-05T23:59:59.999Z") })).toHaveLength(1);
    expect(filterAuditHistoryRows(rows, { adminSearch: "missing" })).toHaveLength(0);
  });

  it("escapes compliance-sensitive CSV fields", () => {
    const csv = buildVerificationAuditCsv([{ id: 1, targetOpenId: "user-1", targetEmail: "target@example.com", actorOpenId: "admin-1", actorName: "Admin, One", actorEmail: "admin@example.com", reason: "Mailbox\nreview", createdAt: new Date("2026-08-22T10:00:00.000Z") }]);
    expect(csv).toContain('"Admin, One"');
    expect(csv).toContain('"Mailbox\nreview"');
    expect(csv).toContain("2026-08-22T10:00:00.000Z");
  });
});
