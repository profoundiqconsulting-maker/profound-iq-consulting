import { describe, expect, it } from "vitest";
import { buildStaffPerformanceCsv } from "./adminExport";
import { isInquiryOverdue, sortAssignedInquiries } from "./staffOps";

describe("staff workload operations", () => {
  const now = new Date("2026-08-24T12:00:00.000Z").getTime();
  it("marks only open inquiries with past due dates as overdue", () => {
    expect(isInquiryOverdue({ status: "new", priority: "high", dueDate: "2026-08-23T23:59:59.999Z", createdAt: "2026-08-20" }, now)).toBe(true);
    expect(isInquiryOverdue({ status: "closed", priority: "high", dueDate: "2026-08-23T23:59:59.999Z", createdAt: "2026-08-20" }, now)).toBe(false);
    expect(isInquiryOverdue({ status: "new", priority: "high", dueDate: "2026-08-25T00:00:00.000Z", createdAt: "2026-08-20" }, now)).toBe(false);
  });
  it("sorts urgent work before lower priorities and due dates", () => {
    const rows = [
      { id: 1, status: "new", priority: "normal", dueDate: "2026-08-25", createdAt: "2026-08-20" },
      { id: 2, status: "new", priority: "urgent", dueDate: "2026-08-30", createdAt: "2026-08-21" },
      { id: 3, status: "new", priority: "urgent", dueDate: "2026-08-24", createdAt: "2026-08-22" },
    ];
    expect(sortAssignedInquiries(rows, "priority").map(row => row.id)).toEqual([3, 2, 1]);
  });
  it("escapes performance CSV fields", () => {
    const csv = buildStaffPerformanceCsv([{ openId: "staff-1", name: "Amina, Team", email: "amina@example.com", role: "staff", assignedCount: 4, completedCount: 2, openCount: 2, averageResolutionDays: 1.5 }]);
    expect(csv).toContain('"staff-1","Amina, Team","amina@example.com","staff","4","2","2","1.5"');
  });
});
