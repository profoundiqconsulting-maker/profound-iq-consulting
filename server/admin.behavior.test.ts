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
  getEmailPreviewDeliveries: vi.fn().mockResolvedValue([{ id: 1, templateKey: "assessment_report", recipientEmail: "admin@example.com", subject: "Preview", body: "Hello **{{name}}**", status: "sent", errorMessage: null, createdAt: new Date("2026-08-24T09:00:00.000Z") }]),
  getEmailPreviewDeliveriesPage: vi.fn().mockResolvedValue({ rows: [{ id: 1, templateKey: "assessment_report", recipientEmail: "admin@example.com", subject: "Preview", status: "sent", errorMessage: null, createdAt: new Date("2026-08-24T09:00:00.000Z") }], total: 1, totalPages: 1, page: 1, pageSize: 12 }),
  getEmailPreviewDeliveriesForExport: vi.fn().mockResolvedValue([{ id: 1, templateKey: "assessment_report", recipientEmail: "admin@example.com", subject: "Preview", status: "sent", errorMessage: null, createdAt: new Date("2026-08-24T09:00:00.000Z") }]),
  getAdminUsersForReview: vi.fn().mockResolvedValue({ rows: [{ id: 2, openId: "user-2", name: "Amina", email: "amina@example.com", role: "user", emailVerifiedAt: new Date("2026-08-20T09:00:00.000Z"), createdAt: new Date(), lastSignedIn: new Date() }], total: 1, totalPages: 1, page: 1, pageSize: 8 }),
  revokeUserEmailVerification: vi.fn().mockResolvedValue({ openId: "user-2", emailVerifiedAt: null }),
  getVerificationRevocationAudits: vi.fn().mockResolvedValue([{ id: 4, targetOpenId: "user-2", targetEmail: "amina@example.com", actorOpenId: "admin-test", actorName: "Admin Test", actorEmail: "admin@example.com", reason: "Mailbox ownership could not be confirmed", createdAt: new Date() }]),
  createDeliveryLogExportJob: vi.fn().mockResolvedValue({ id: 7, requestedByOpenId: "admin-test", status: "queued", filters: {}, fileKey: null, fileUrl: null, rowCount: null, errorMessage: null, createdAt: new Date(), startedAt: null, completedAt: null }),
  getDeliveryLogExportJobs: vi.fn().mockResolvedValue([]),
  getDeliveryLogExportJob: vi.fn().mockResolvedValue(undefined),
  getAdminAnalyticsSettings: vi.fn().mockResolvedValue({ adminOpenId: "admin-test", paidBenchmark: 42, downloadBenchmark: 68 }),
  upsertAdminAnalyticsSettings: vi.fn().mockResolvedValue({ adminOpenId: "admin-test", paidBenchmark: 42, downloadBenchmark: 68 }),
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
    expect(mocks.addEmailPreviewDelivery).toHaveBeenCalledWith({ templateKey: "assessment_report", recipientEmail: "admin@example.com", subject: "Preview", body: "Hello **{{name}}** at {{email}} on {{date}}.", status: "sent" });
  });

  it("retries a failed preview using its original body", async () => {
    mocks.getEmailPreviewDeliveries.mockResolvedValueOnce([{ id: 9, templateKey: "assessment_report", recipientEmail: "admin@example.com", subject: "Preview", body: "Hello **{{name}}**", status: "failed", errorMessage: "Mailbox unavailable", createdAt: new Date() }]);
    await appRouter.createCaller(adminContext()).admin.retryTemplateTestEmail({ deliveryId: 9 });
    expect(mocks.sendTemplateTestEmail).toHaveBeenCalledWith({ to: "admin@example.com", subject: "Preview", body: "Hello **{{name}}**" });
    expect(mocks.addEmailPreviewDelivery).toHaveBeenCalledWith(expect.objectContaining({ templateKey: "assessment_report", body: "Hello **{{name}}**", status: "sent" }));
  });

  it("returns schedule status and report history for an admin", async () => {
    const result = await appRouter.createCaller(adminContext()).admin.scheduledExportStatus();
    expect(result.config?.lastFileUrl).toBe("/manus-storage/scheduled-exports/latest.csv");
    expect(result.runs).toEqual(expect.arrayContaining([expect.objectContaining({ rowCount: 4, fileUrl: "/manus-storage/scheduled-exports/latest.csv" })]));
    await expect(appRouter.createCaller(adminContext()).admin.emailPreviewHistory({ page: 1, pageSize: 12, status: "sent" })).resolves.toEqual(expect.objectContaining({ rows: expect.arrayContaining([expect.objectContaining({ status: "sent", recipientEmail: "admin@example.com" })]), total: 1 }));
  });

  it("passes delivery filters to the paginated history query and exports matching CSV", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.emailPreviewHistory({ page: 2, pageSize: 24, search: "amina", status: "failed", fromDate: "2026-08-01", toDate: "2026-08-24" });
    expect(mocks.getEmailPreviewDeliveriesPage).toHaveBeenCalledWith({ page: 2, pageSize: 24, search: "amina", status: "failed", fromDate: new Date("2026-08-01T00:00:00.000Z"), toDate: new Date("2026-08-24T23:59:59.999Z") });
    const exported = await caller.admin.exportEmailPreviewHistory({ status: "sent" });
    expect(exported.filename).toContain("profound-iq-delivery-log-");
    expect(exported.data).toContain("Recipient");
  });

  it("requires a meaningful reason and blocks self-revocation", async () => {
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.admin.revokeUserEmailVerification({ openId: "user-2", reason: "no" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.admin.revokeUserEmailVerification({ openId: "admin-test", reason: "Security review" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("reviews and revokes another user’s verification eligibility", async () => {
    const caller = appRouter.createCaller(adminContext());
    await expect(caller.admin.userVerificationReview({ verification: "verified" })).resolves.toEqual(expect.objectContaining({ total: 1 }));
    await caller.admin.revokeUserEmailVerification({ openId: "user-2", reason: "Mailbox ownership could not be confirmed" });
    expect(mocks.revokeUserEmailVerification).toHaveBeenCalledWith("user-2", { openId: "admin-test", name: "Admin Test", email: "admin@example.com" }, "Mailbox ownership could not be confirmed");
    await expect(caller.admin.verificationRevocationAudits()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ targetOpenId: "user-2", reason: "Mailbox ownership could not be confirmed" })]));
  });

  it("persists custom benchmark targets for the admin account", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.saveAnalyticsSettings({ paidBenchmark: 42, downloadBenchmark: 68 });
    expect(mocks.upsertAdminAnalyticsSettings).toHaveBeenCalledWith("admin-test", { paidBenchmark: 42, downloadBenchmark: 68 });
    await expect(caller.admin.analyticsSettings()).resolves.toEqual(expect.objectContaining({ paidBenchmark: 42, downloadBenchmark: 68 }));
  });

  it("saves and reloads a branded email template", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.saveEmailTemplate({ templateKey: "assessment_report", label: "Saved", subject: "Saved subject", body: "Hello {{name}}" });
    expect(mocks.upsertEmailTemplate).toHaveBeenCalledWith({ templateKey: "assessment_report", label: "Saved", subject: "Saved subject", body: "Hello {{name}}", updatedByOpenId: "admin-test" });
    await expect(caller.admin.emailTemplates()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ templateKey: "assessment_report", subject: "Saved subject" })]));
  });
});
