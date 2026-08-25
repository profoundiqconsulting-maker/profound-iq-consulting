import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { courseCatalog } from "../shared/courseCatalog";

function contextWithRole(role: "admin" | "user"): TrpcContext {
  const now = new Date();
  return { user: { id: 1, openId: "features-test", name: "Features Test", email: "features@example.com", loginMethod: "test", role, createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("admin feature boundaries", () => {
  it("rejects non-admin template reads and CSV exports", async () => {
    const caller = appRouter.createCaller(contextWithRole("user"));
    await expect(caller.admin.emailTemplates()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.exportCourseEnrollments()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.sendTemplateTestEmail({ templateKey: "assessment_report", subject: "Preview", body: "Hello {{name}}" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.scheduledExportStatus()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.emailPreviewHistory()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.retryTemplateTestEmail({ deliveryId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.saveAnalyticsSettings({ paidBenchmark: 40, downloadBenchmark: 60 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.updateExportRetention({ retentionDays: 30 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.userVerificationReview()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.revokeUserEmailVerification({ openId: "someone" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.exportEmailPreviewHistory()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.verificationRevocationAudits()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.deliveryLogExportJobs()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.deliveryLogExportJob({ id: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.queueDeliveryLogExport({ status: "all" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.enableDeliveryLogExportWorker()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.exportVerificationRevocationAudits({ adminSearch: "admin" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.securitySettings()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.saveSecuritySettings({ alertThreshold: 5, reviewWindowDays: 7, loginEventRetentionDays: 90, lockoutWindowSeconds: 60 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.failedLoginEvents()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.unlockUserLogin({ targetOpenId: "someone" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.loginSecurityAnalytics()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.admin.exportSecurityLoginEvents()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects analytics events outside the supported event contract", async () => {
    const caller = appRouter.createCaller(contextWithRole("user"));
    await expect(caller.analytics.track({ eventName: "unsupported_event" as never })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("requires the authenticated account email for course enrollment", async () => {
    const caller = appRouter.createCaller(contextWithRole("user"));
    await expect(caller.course.enroll({ courseSlug: courseCatalog[0].slug, name: "Test Person", email: "other@example.com", consent: true })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("blocks non-admin access to payment exceptions", async () => {
    const caller = appRouter.createCaller(contextWithRole("user"));
    await expect(caller.admin.coursePaymentExceptions({ status: "all", limit: 10 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("requires privacy consent for course enrollment", async () => {
    const caller = appRouter.createCaller(contextWithRole("user"));
    await expect(caller.enrollment.create({ courseTitle: "Lead with Clarity", name: "Test Person", email: "test@example.com", consent: false as never })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
