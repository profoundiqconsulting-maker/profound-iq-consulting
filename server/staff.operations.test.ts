import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  createStaffInvitation: vi.fn().mockResolvedValue(44),
  listStaffInvitations: vi.fn().mockResolvedValue([]),
  updateUserRole: vi.fn().mockResolvedValue({ openId: "staff-1", role: "admin" }),
  updateContactInquiryWorkload: vi.fn().mockResolvedValue({ id: 12, dueDate: new Date("2026-09-01T23:59:59.999Z"), priority: "high" }),
  getStaffPerformanceSummary: vi.fn().mockResolvedValue([{ openId: "staff-1", assignedCount: 4, completedCount: 2, openCount: 2, averageResolutionDays: 1.5 }]),
}));

vi.mock("./db", async importOriginal => ({ ...(await importOriginal<typeof import("./db")>()), ...mocks }));
const { appRouter } = await import("./routers");

function context(role: "admin" | "staff" | "user" = "admin"): TrpcContext {
  const now = new Date();
  return { user: { id: 1, openId: `${role}-test`, name: "Test User", email: `${role}@example.com`, loginMethod: "test", role, createdAt: now, updatedAt: now, lastSignedIn: now }, req: { protocol: "https", headers: { origin: "https://example.com" } } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("admin staff operations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a time-limited invitation link", async () => {
    const result = await appRouter.createCaller(context()).admin.inviteStaff({ name: "Amina Team", email: "Amina@Example.com", role: "staff" });
    expect(result.invitationId).toBe(44);
    expect(result.inviteUrl).toMatch(/^https:\/\/example\.com\/auth\?invite=/);
    expect(mocks.createStaffInvitation).toHaveBeenCalledWith(expect.objectContaining({ email: "amina@example.com", role: "staff", expiresAt: expect.any(Date), tokenHash: expect.any(String), invitedByOpenId: "admin-test" }));
  });

  it("keeps staff operations admin-only", async () => {
    await expect(appRouter.createCaller(context("staff")).admin.staffPerformance()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(context("user")).admin.updateStaffRole({ openId: "staff-1", role: "staff" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("forwards role, workload, and performance operations to protected helpers", async () => {
    const caller = appRouter.createCaller(context());
    await caller.admin.updateStaffRole({ openId: "staff-1", role: "admin" });
    await caller.admin.updateContactInquiryWorkload({ id: 12, dueDate: "2026-09-01", priority: "high" });
    const summary = await caller.admin.staffPerformance();
    expect(mocks.updateUserRole).toHaveBeenCalledWith("staff-1", "admin");
    expect(mocks.updateContactInquiryWorkload).toHaveBeenCalledWith(12, { dueDate: new Date("2026-09-01T23:59:59.999Z"), priority: "high" }, expect.objectContaining({ openId: "admin-test" }));
    expect(summary[0].completedCount).toBe(2);
  });
});
