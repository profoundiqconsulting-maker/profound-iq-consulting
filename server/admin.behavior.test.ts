import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  recordAnalyticsEvent: vi.fn().mockResolvedValue(undefined),
  upsertEmailTemplate: vi.fn().mockResolvedValue([{ templateKey: "assessment_report", label: "Saved", subject: "Saved subject", body: "Hello {{name}}", id: 1, updatedByOpenId: "admin-test", updatedAt: new Date() }]),
  getEmailTemplates: vi.fn().mockResolvedValue([{ templateKey: "assessment_report", label: "Saved", subject: "Saved subject", body: "Hello {{name}}", id: 1, updatedByOpenId: "admin-test", updatedAt: new Date() }]),
  sendTemplateTestEmail: vi.fn().mockResolvedValue(undefined),
  addEmailPreviewDelivery: vi.fn().mockResolvedValue(undefined),
  getScheduledExport: vi.fn().mockResolvedValue({ exportKey: "weekly_course_enrollments", scheduleTaskUid: "task-1", lastRunAt: new Date("2026-08-24T09:00:00.000Z"), lastFileKey: "scheduled-exports/latest.csv", lastFileUrl: "/manus-storage/scheduled-exports/latest.csv" }),
  getScheduledExportRuns: vi.fn().mockResolvedValue([{ id: 1, exportKey: "weekly_course_enrollments", fileKey: "scheduled-exports/latest.csv", fileUrl: "/manus-storage/scheduled-exports/latest.csv", rowCount: 4, createdAt: new Date("2026-08-24T09:00:00.000Z") }]),
  getEmailPreviewDeliveries: vi.fn().mockResolvedValue([{ id: 1, templateKey: "assessment_report", recipientEmail: "admin@example.com", subject: "Preview", status: "sent", errorMessage: null, createdAt: new Date("2026-08-24T09:00:00.000Z") }]),
}));
vi.mock("./db", async (importOriginal) => ({ ...(await importOriginal<typeof import("./db")>()), ...mocks }));
vi.mock("./email", async (importOriginal) => ({ ...(await importOriginal<typeof import("./email")>()), sendTemplateTestEmail: mocks.sendTemplateTestEmail }));
const { appRouter } = await import("./routers");

function adminContext(): TrpcContext {
  const now = new Date();
  return { user: { id: 1, openId: "admin-test", name: "Admin Test", email: "admin@example.com", loginMethod: "test", role: "admin", createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("admin feature behavior", () => {
  it("records a supported analytics event", async () => {
    await appRouter.createCaller(adminContext()).analytics.track({ eventName: "payment_completed", attemptId: 12, metadata: { source: "browser" } });
    expect(mocks.recordAnalyticsEvent).toHaveBeenCalledWith({ eventName: "payment_completed", attemptId: 12, metadata: { source: "browser" }, userOpenId: "admin-test" });
  });

  it("sends a safe test preview to the authenticated admin email", async () => {
    await appRouter.createCaller(adminContext()).admin.sendTemplateTestEmail({ templateKey: "assessment_report", subject: "Preview", body: "Hello **{{name}}** at {{email}} on {{date}}." });
    expect(mocks.sendTemplateTestEmail).toHaveBeenCalledWith({ to: "admin@example.com", subject: "Preview", body: "Hello **{{name}}** at {{email}} on {{date}}." });
    expect(mocks.addEmailPreviewDelivery).toHaveBeenCalledWith({ templateKey: "assessment_report", recipientEmail: "admin@example.com", subject: "Preview", status: "sent" });
  });

  it("returns schedule status and report history for an admin", async () => {
    const result = await appRouter.createCaller(adminContext()).admin.scheduledExportStatus();
    expect(result.config?.lastFileUrl).toBe("/manus-storage/scheduled-exports/latest.csv");
    expect(result.runs).toEqual(expect.arrayContaining([expect.objectContaining({ rowCount: 4, fileUrl: "/manus-storage/scheduled-exports/latest.csv" })]));
    await expect(appRouter.createCaller(adminContext()).admin.emailPreviewHistory()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ status: "sent", recipientEmail: "admin@example.com" })]));
  });

  it("saves and reloads a branded email template", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.saveEmailTemplate({ templateKey: "assessment_report", label: "Saved", subject: "Saved subject", body: "Hello {{name}}" });
    expect(mocks.upsertEmailTemplate).toHaveBeenCalledWith({ templateKey: "assessment_report", label: "Saved", subject: "Saved subject", body: "Hello {{name}}", updatedByOpenId: "admin-test" });
    await expect(caller.admin.emailTemplates()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ templateKey: "assessment_report", subject: "Saved subject" })]));
  });
});
