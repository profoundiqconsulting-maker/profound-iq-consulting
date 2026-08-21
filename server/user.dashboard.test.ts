import { describe, expect, it, vi } from "vitest";

const { getUserAssessmentHistory } = vi.hoisted(() => ({ getUserAssessmentHistory: vi.fn() }));

vi.mock("./db", () => ({
  getUserAssessmentHistory,
  getAssessmentAdminOverview: vi.fn(),
  getAssessmentAttempt: vi.fn(),
  createAssessmentAttempt: vi.fn(),
  getAssessmentAttemptByReference: vi.fn(),
  markAssessmentPaid: vi.fn(),
  setPaystackReference: vi.fn(),
}));

const { appRouter } = await import("./routers");

function context(user: { email?: string } | null) {
  const now = new Date();
  return {
    user: user ? { id: 1, openId: "user-dashboard-test", name: "Participant", email: user.email ?? null, loginMethod: "test", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now } : null,
    req: { protocol: "https", headers: {} } as never,
    res: {} as never,
  };
}

describe("dashboard.mine", () => {
  it("requires authentication", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.dashboard.mine()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("scopes the query to the authenticated account email", async () => {
    getUserAssessmentHistory.mockResolvedValue([]);
    const caller = appRouter.createCaller(context({ email: "owner@example.com" }));
    await caller.dashboard.mine();
    expect(getUserAssessmentHistory).toHaveBeenCalledWith("owner@example.com");
  });
});
