import { describe, expect, it, vi } from "vitest";

const { getUserProfile, updateUserProfile } = vi.hoisted(() => ({ getUserProfile: vi.fn(), updateUserProfile: vi.fn() }));

vi.mock("./db", () => ({
  getUserProfile,
  updateUserProfile,
  getAssessmentAdminOverview: vi.fn(),
  getUserAssessmentHistory: vi.fn(),
  getAssessmentAttempt: vi.fn(),
  createAssessmentAttempt: vi.fn(),
  getAssessmentAttemptByReference: vi.fn(),
  markAssessmentPaid: vi.fn(),
  setPaystackReference: vi.fn(),
}));

const { appRouter } = await import("./routers");

function context(user: { openId: string } | null) {
  const now = new Date();
  return {
    user: user ? { id: 1, openId: user.openId, name: "Test User", email: "test@example.com", loginMethod: "test", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now } : null,
    req: { protocol: "https", headers: {} } as never,
    res: {} as never,
  };
}

describe("profile settings", () => {
  it("rejects unauthenticated reads and updates", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.profile.get()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.profile.update({ name: "Test User", notificationPreferences: { assessmentUpdates: true, courseAnnouncements: true, monthlyInsights: false } })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects invalid profile payloads", async () => {
    const caller = appRouter.createCaller(context({ openId: "owner-1" }));
    await expect(caller.profile.update({ name: "x", notificationPreferences: { assessmentUpdates: true, courseAnnouncements: true, monthlyInsights: false } })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("scopes reads and writes to the authenticated openId", async () => {
    getUserProfile.mockResolvedValue({ openId: "owner-1", name: "Test User", email: "test@example.com", role: "user", notificationPreferences: { assessmentUpdates: true, courseAnnouncements: true, monthlyInsights: false } });
    updateUserProfile.mockResolvedValue({ openId: "owner-1", name: "Updated User", email: "test@example.com", role: "user", notificationPreferences: { assessmentUpdates: false, courseAnnouncements: true, monthlyInsights: true } });
    const caller = appRouter.createCaller(context({ openId: "owner-1" }));
    await caller.profile.get();
    await caller.profile.update({ name: "Updated User", notificationPreferences: { assessmentUpdates: false, courseAnnouncements: true, monthlyInsights: true } });
    expect(getUserProfile).toHaveBeenCalledWith("owner-1");
    expect(updateUserProfile).toHaveBeenCalledWith("owner-1", { name: "Updated User", notificationPreferences: { assessmentUpdates: false, courseAnnouncements: true, monthlyInsights: true } });
  });
});
