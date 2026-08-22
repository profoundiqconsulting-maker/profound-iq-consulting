import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const { findUserByLocalIdentifier, createLocalUser, setPasswordResetToken, consumePasswordResetToken, checkLoginRateLimit, recordFailedLogin, clearLoginFailures, getEffectiveLoginAlertThreshold, recordLoginEvent, createUserSession, getAdminNotificationRecipients, sendPasswordResetEmail, sendFailedLoginAlert } = vi.hoisted(() => ({
  findUserByLocalIdentifier: vi.fn(),
  createLocalUser: vi.fn(),
  setPasswordResetToken: vi.fn(),
  consumePasswordResetToken: vi.fn(),
  checkLoginRateLimit: vi.fn().mockResolvedValue({ blocked: false, failedCount: 0 }),
  recordFailedLogin: vi.fn().mockResolvedValue({ failedCount: 1, shouldAlert: false }),
  clearLoginFailures: vi.fn().mockResolvedValue(undefined),
  getEffectiveLoginAlertThreshold: vi.fn().mockResolvedValue(5),
  recordLoginEvent: vi.fn().mockResolvedValue(undefined),
  createUserSession: vi.fn().mockResolvedValue(undefined),
  getAdminNotificationRecipients: vi.fn().mockResolvedValue(["admin@example.com"]),
  sendPasswordResetEmail: vi.fn(),
  sendFailedLoginAlert: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./db", async (importOriginal) => ({ ...(await importOriginal<typeof import("./db")>()), findUserByLocalIdentifier, createLocalUser, setPasswordResetToken, consumePasswordResetToken, checkLoginRateLimit, recordFailedLogin, clearLoginFailures, getEffectiveLoginAlertThreshold, recordLoginEvent, createUserSession, getAdminNotificationRecipients }));
vi.mock("./email", async (importOriginal) => ({ ...(await importOriginal<typeof import("./email")>()), sendPasswordResetEmail, sendFailedLoginAlert }));
const { appRouter } = await import("./routers");

function context() {
  const cookies: unknown[] = [];
  const ctx = { user: null, req: { protocol: "https", headers: {} }, res: { cookie: (...args: unknown[]) => cookies.push(args), clearCookie: vi.fn() } } as unknown as TrpcContext;
  return { ctx, cookies };
}

const localUser = { id: 12, openId: "local_user-12", name: "Amina", email: "amina@example.com", phone: "+254727374055", username: "amina", passwordHash: "scrypt$abc$00", role: "user", loginMethod: "password", emailVerifiedAt: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), notificationPreferences: null, avatarUrl: null, timezone: null, passwordResetTokenHash: null, passwordResetExpiresAt: null };

describe("local credential auth procedures", () => {
  beforeEach(() => { vi.clearAllMocks(); checkLoginRateLimit.mockResolvedValue({ blocked: false, failedCount: 0 }); recordFailedLogin.mockResolvedValue({ failedCount: 1, shouldAlert: false }); clearLoginFailures.mockResolvedValue(undefined); getEffectiveLoginAlertThreshold.mockResolvedValue(5); recordLoginEvent.mockResolvedValue(undefined); createUserSession.mockResolvedValue(undefined); getAdminNotificationRecipients.mockResolvedValue(["admin@example.com"]); sendFailedLoginAlert.mockResolvedValue(undefined); });

  it("registers and issues the existing session cookie", async () => {
    findUserByLocalIdentifier.mockResolvedValue(undefined);
    createLocalUser.mockResolvedValue(localUser);
    const { ctx, cookies } = context();
    const result = await appRouter.createCaller(ctx).auth.register({ name: "Amina", email: "Amina@Example.com", password: "securePassword123" });
    expect(result.user.email).toBe("amina@example.com");
    expect(cookies).toHaveLength(1);
  });

  it("accepts a normalized username or phone identifier for login", async () => {
    findUserByLocalIdentifier.mockResolvedValue({ ...localUser, passwordHash: "scrypt$2a$5a" });
    const { ctx } = context();
    await expect(appRouter.createCaller(ctx).auth.login({ identifier: "amina", password: "not-the-hash" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(findUserByLocalIdentifier).toHaveBeenCalledWith("amina");
    expect(recordFailedLogin).toHaveBeenCalledTimes(3);
  });

  it("blocks a rate-limited login and alerts administrators at the threshold", async () => {
    checkLoginRateLimit.mockResolvedValue({ blocked: true, failedCount: 5 });
    const { ctx } = context();
    await expect(appRouter.createCaller(ctx).auth.login({ identifier: "amina", password: "wrongPassword123" })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(findUserByLocalIdentifier).not.toHaveBeenCalled();

    checkLoginRateLimit.mockResolvedValue({ blocked: false, failedCount: 0 });
    findUserByLocalIdentifier.mockResolvedValue(undefined);
    recordFailedLogin.mockResolvedValueOnce({ failedCount: 5, shouldAlert: true }).mockResolvedValue({ failedCount: 5, shouldAlert: false });
    await expect(appRouter.createCaller(ctx).auth.login({ identifier: "unknown@example.com", password: "wrongPassword123" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(sendFailedLoginAlert).toHaveBeenCalledWith(expect.objectContaining({ recipients: ["admin@example.com"], failedCount: 5 }));
  });

  it("returns the same reset response for unknown emails and does not send mail", async () => {
    findUserByLocalIdentifier.mockResolvedValue(undefined);
    const result = await appRouter.createCaller(context().ctx).auth.requestPasswordReset({ email: "missing@example.com", origin: "https://example.com" });
    expect(result.success).toBe(true);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("rejects an expired or already-consumed reset token", async () => {
    consumePasswordResetToken.mockResolvedValue(undefined);
    await expect(appRouter.createCaller(context().ctx).auth.resetPassword({ token: "a".repeat(64), password: "newSecurePassword123" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
