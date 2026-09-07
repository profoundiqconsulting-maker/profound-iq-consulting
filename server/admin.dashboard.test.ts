import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function contextWithRole(role: "admin" | "user"): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 1,
      openId: "dashboard-test",
      name: "Dashboard Test",
      email: "dashboard@example.com",
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

describe("assessment.adminOverview", () => {
  it("rejects authenticated non-admin users", async () => {
    const caller = appRouter.createCaller(contextWithRole("user"));
    await expect(caller.assessment.adminOverview()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
