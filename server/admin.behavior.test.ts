import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  recordAnalyticsEvent: vi.fn().mockResolvedValue(undefined),
  upsertEmailTemplate: vi.fn().mockResolvedValue([{ templateKey: "assessment_report", label: "Saved", subject: "Saved subject", body: "Hello {{name}}", id: 1, updatedByOpenId: "admin-test", updatedAt: new Date() }]),
  getEmailTemplates: vi.fn().mockResolvedValue([{ templateKey: "assessment_report", label: "Saved", subject: "Saved subject", body: "Hello {{name}}", id: 1, updatedByOpenId: "admin-test", updatedAt: new Date() }]),
  sendTemplateTestEmail: vi.fn().mockResolvedValue(undefined),
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
    await appRouter.createCaller(adminContext()).admin.sendTemplateTestEmail({ subject: "Preview", body: "Hello **{{name}}** at {{email}} on {{date}}." });
    expect(mocks.sendTemplateTestEmail).toHaveBeenCalledWith({ to: "admin@example.com", subject: "Preview", body: "Hello **{{name}}** at {{email}} on {{date}}." });
  });

  it("saves and reloads a branded email template", async () => {
    const caller = appRouter.createCaller(adminContext());
    await caller.admin.saveEmailTemplate({ templateKey: "assessment_report", label: "Saved", subject: "Saved subject", body: "Hello {{name}}" });
    expect(mocks.upsertEmailTemplate).toHaveBeenCalledWith({ templateKey: "assessment_report", label: "Saved", subject: "Saved subject", body: "Hello {{name}}", updatedByOpenId: "admin-test" });
    await expect(caller.admin.emailTemplates()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ templateKey: "assessment_report", subject: "Saved subject" })]));
  });
});
