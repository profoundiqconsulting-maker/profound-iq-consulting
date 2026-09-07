import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  getAdminRevenueReport: vi
    .fn()
    .mockResolvedValue({
      totalRevenueKes: 60,
      transactionCount: 3,
      averageTransactionKes: 20,
      bySource: [
        { source: "Self-assessment", revenueKes: 40, transactions: 2 },
      ],
      trend: [],
      transactions: [],
      fromDate: new Date("2026-08-01T00:00:00.000Z"),
      toDate: new Date("2026-08-31T23:59:59.999Z"),
    }),
}));
vi.mock("./db", async importOriginal => ({
  ...(await importOriginal<typeof import("./db")>()),
  ...mocks,
}));
import { appRouter } from "./routers";

function contextWithRole(role: "admin" | "user"): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 1,
      openId: "revenue-test",
      name: "Revenue Admin",
      email: "revenue@example.com",
      loginMethod: "test",
      role,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin.revenueReport", () => {
  beforeEach(() => mocks.getAdminRevenueReport.mockClear());
  it("rejects non-admin access", async () => {
    await expect(
      appRouter.createCaller(contextWithRole("user")).admin.revenueReport()
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
  it("forwards normalized UTC date filters for admins", async () => {
    const result = await appRouter
      .createCaller(contextWithRole("admin"))
      .admin.revenueReport({ fromDate: "2026-08-01", toDate: "2026-08-31" });
    expect(result.totalRevenueKes).toBe(60);
    expect(mocks.getAdminRevenueReport).toHaveBeenCalledWith({
      fromDate: new Date("2026-08-01T00:00:00.000Z"),
      toDate: new Date("2026-08-31T23:59:59.999Z"),
    });
  });
});
