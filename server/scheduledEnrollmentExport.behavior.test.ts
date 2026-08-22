import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ authenticateRequest: vi.fn(), getScheduledExport: vi.fn(), getCourseEnrollments: vi.fn(), storagePut: vi.fn(), addScheduledExportRun: vi.fn(), updateScheduledExport: vi.fn() }));
vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock("./db", () => ({ getScheduledExport: mocks.getScheduledExport, getCourseEnrollments: mocks.getCourseEnrollments, addScheduledExportRun: mocks.addScheduledExportRun, updateScheduledExport: mocks.updateScheduledExport }));
vi.mock("./storage", () => ({ storagePut: mocks.storagePut }));
const { weeklyEnrollmentExportHandler, WEEKLY_EXPORT_KEY } = await import("./scheduledEnrollmentExport");

describe("scheduled enrollment export handler", () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it("generates and stores an authenticated weekly CSV", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "task-1" });
    mocks.getScheduledExport.mockResolvedValue({ exportKey: WEEKLY_EXPORT_KEY, scheduleTaskUid: "task-1", lastRunAt: null });
    const date = new Date("2026-08-22T09:00:00.000Z");
    mocks.getCourseEnrollments.mockResolvedValue([{ id: 1, courseTitle: "Lead", name: "Amina", email: "amina@example.com", status: "new", createdAt: date, consentedAt: date }]);
    mocks.storagePut.mockResolvedValue({ key: "scheduled-exports/report.csv", url: "/manus-storage/scheduled-exports/report.csv" });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await weeklyEnrollmentExportHandler({ originalUrl: "/api/scheduled/weeklyEnrollmentExport" } as never, res as never);
    expect(mocks.storagePut).toHaveBeenCalledWith(expect.stringContaining("scheduled-exports/course-enrollments-"), expect.stringContaining("Amina"), "text/csv;charset=utf-8");
    expect(mocks.updateScheduledExport).toHaveBeenCalledWith(WEEKLY_EXPORT_KEY, expect.objectContaining({ lastFileKey: "scheduled-exports/report.csv" }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true, rows: 1 }));
  });

  it("skips a duplicate run in the same UTC week", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "task-1" });
    mocks.getScheduledExport.mockResolvedValue({ exportKey: WEEKLY_EXPORT_KEY, scheduleTaskUid: "task-1", lastRunAt: new Date() });
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    await weeklyEnrollmentExportHandler({ originalUrl: "/api/scheduled/weeklyEnrollmentExport" } as never, res as never);
    expect(mocks.storagePut).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ skipped: "already-generated" }));
  });
});
