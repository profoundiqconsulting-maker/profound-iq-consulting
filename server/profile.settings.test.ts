import { describe, expect, it, vi } from "vitest";

const { getUserProfile, updateUserProfile, getLoginEventsForUser, getSessionByTokenHash, getUserSessions, revokeUserSession, revokeOtherUserSessions } = vi.hoisted(() => ({ getUserProfile: vi.fn(), updateUserProfile: vi.fn(), getLoginEventsForUser: vi.fn().mockResolvedValue([]), getSessionByTokenHash: vi.fn().mockResolvedValue({ id: 4 }), getUserSessions: vi.fn().mockResolvedValue([]), revokeUserSession: vi.fn().mockResolvedValue(undefined), revokeOtherUserSessions: vi.fn().mockResolvedValue(undefined) }));

vi.mock("./db", () => ({
  getUserProfile,
  updateUserProfile,
  getLoginEventsForUser,
  getSessionByTokenHash,
  getUserSessions,
  revokeUserSession,
  revokeOtherUserSessions,
  getAssessmentAdminOverview: vi.fn(),
  getUserAssessmentHistory: vi.fn(),
  getAssessmentAttempt: vi.fn(),
  createAssessmentAttempt: vi.fn(),
  getAssessmentAttemptByReference: vi.fn(),
  markAssessmentPaid: vi.fn(),
  setPaystackReference: vi.fn(),
}));

const { appRouter } = await import("./routers");

function context(user: { openId: string } | null, cookie = "") {
  const now = new Date();
  return {
    user: user ? { id: 1, openId: user.openId, name: "Test User", email: "test@example.com", loginMethod: "test", role: "user", createdAt: now, updatedAt: now, lastSignedIn: now } : null,
    req: { protocol: "https", headers: cookie ? { cookie } : {} } as never,
    res: {} as never,
  };
}

describe("profile settings", () => {
  it("rejects unauthenticated reads and updates", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.profile.get()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.profile.update({ name: "Test User", notificationPreferences: { assessmentUpdates: true, courseAnnouncements: true, monthlyInsights: false } })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects unauthenticated avatar uploads", async () => {
    const caller = appRouter.createCaller(context(null));
    await expect(caller.profile.uploadAvatar({ dataUrl: "data:image/png;base64,AAAA" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects invalid and oversized avatar payloads", async () => {
    const caller = appRouter.createCaller(context({ openId: "owner-1" }));
    await expect(caller.profile.uploadAvatar({ dataUrl: "data:image/svg+xml;base64,AAAA" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    const oversized = `data:image/png;base64,${Buffer.alloc(2 * 1024 * 1024 + 1).toString("base64")}`;
    await expect(caller.profile.uploadAvatar({ dataUrl: oversized })).rejects.toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
  });

  it("rejects invalid profile payloads", async () => {
    const caller = appRouter.createCaller(context({ openId: "owner-1" }));
    await expect(caller.profile.update({ name: "x", notificationPreferences: { assessmentUpdates: true, courseAnnouncements: true, monthlyInsights: false } })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("returns recent login history and active sessions only for the authenticated user", async () => {
    getLoginEventsForUser.mockResolvedValue([{ id: 1, identifierType: "email", success: true, failureCode: null, userAgent: "Browser", deviceType: "desktop", estimatedLocation: "Kenya", createdAt: new Date() }]);
    getUserSessions.mockResolvedValue([{ id: 4, openId: "owner-1", userAgent: "Browser", createdAt: new Date(), lastSeenAt: new Date(), expiresAt: new Date(Date.now() + 10000), revokedAt: null }]);
    const caller = appRouter.createCaller(context({ openId: "owner-1" }, "app_session_id=test-token"));
    const history = await caller.profile.loginHistory();
    const sessionList = await caller.profile.sessions();
    expect(history).toHaveLength(1);
    expect(history[0]).not.toHaveProperty("networkHash");
    expect(history[0]).not.toHaveProperty("openId");
    expect(getLoginEventsForUser).toHaveBeenCalledWith({ openId: "owner-1", limit: 10, deviceType: "all", locationSearch: undefined });
    expect(sessionList.currentSessionId).toBe(4);
    expect(getUserSessions).toHaveBeenCalledWith("owner-1");
  });

  it("passes device and location filters without exposing raw identifiers", async () => {
    const caller = appRouter.createCaller(context({ openId: "owner-1" }));
    await caller.profile.loginHistory({ deviceType: "mobile", locationSearch: "Kenya" });
    expect(getLoginEventsForUser).toHaveBeenCalledWith({ openId: "owner-1", limit: 10, deviceType: "mobile", locationSearch: "Kenya" });
  });

  it("revokes only sessions belonging to the authenticated user", async () => {
    const caller = appRouter.createCaller(context({ openId: "owner-1" }, "app_session_id=test-token"));
    await caller.profile.revokeSession({ sessionId: 9 });
    await caller.profile.revokeOtherSessions();
    expect(revokeUserSession).toHaveBeenCalledWith("owner-1", 9);
    expect(revokeOtherUserSessions).toHaveBeenCalledWith("owner-1", expect.any(String));
  });

  it("scopes reads and writes to the authenticated openId", async () => {
    getUserProfile.mockResolvedValue({ openId: "owner-1", name: "Test User", email: "test@example.com", role: "user", notificationPreferences: { assessmentUpdates: true, courseAnnouncements: true, monthlyInsights: false } });
    updateUserProfile.mockResolvedValue({ openId: "owner-1", name: "Updated User", email: "test@example.com", role: "user", notificationPreferences: { assessmentUpdates: false, courseAnnouncements: true, monthlyInsights: true } });
    const caller = appRouter.createCaller(context({ openId: "owner-1" }));
    await caller.profile.get();
    await caller.profile.update({ name: "Updated User", timezone: "Africa/Nairobi", notificationPreferences: { assessmentUpdates: false, courseAnnouncements: true, monthlyInsights: true } });
    expect(getUserProfile).toHaveBeenCalledWith("owner-1");
    expect(updateUserProfile).toHaveBeenCalledWith("owner-1", { name: "Updated User", timezone: "Africa/Nairobi", learningGoals: [], notificationPreferences: { assessmentUpdates: false, courseAnnouncements: true, monthlyInsights: true, showAvatar: true } });
  });
});
