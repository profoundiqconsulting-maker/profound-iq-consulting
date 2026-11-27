import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { hashPassword } from "./localAuthCrypto";

beforeEach(() => {
  process.env.SESSION_SECRET = "test-session-secret";
});

const {
  findUserByLocalIdentifier,
  createLocalUser,
  setPasswordResetToken,
  consumePasswordResetToken,
  recordLoginEvent,
  createUserSession,
  sendPasswordResetEmail,
} = vi.hoisted(() => ({
  findUserByLocalIdentifier: vi.fn(),
  createLocalUser: vi.fn(),
  setPasswordResetToken: vi.fn(),
  consumePasswordResetToken: vi.fn(),
  recordLoginEvent: vi.fn().mockResolvedValue(undefined),
  createUserSession: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn(),
}));

const mockCreateSessionToken = vi.fn().mockResolvedValue("fake-session-token");
vi.mock("./_core/sdk", () => ({
  sdk: { createSessionToken: mockCreateSessionToken },
}));

vi.mock("./db", async importOriginal => ({
  ...(await importOriginal<typeof import("./db")>()),
  findUserByLocalIdentifier,
  createLocalUser,
  setPasswordResetToken,
  consumePasswordResetToken,
  recordLoginEvent,
  createUserSession,
}));
vi.mock("./email", async importOriginal => ({
  ...(await importOriginal<typeof import("./email")>()),
  sendPasswordResetEmail,
}));
const { appRouter } = await import("./routers");

function context() {
  const cookies: unknown[] = [];
  const ctx = {
    user: null,
    req: { protocol: "https", headers: {} },
    res: {
      cookie: (...args: unknown[]) => cookies.push(args),
      clearCookie: vi.fn(),
    },
  } as unknown as TrpcContext;
  return { ctx, cookies };
}

const localUser = {
  id: 12,
  openId: "local_user-12",
  name: "Amina",
  email: "amina@example.com",
  phone: "+254727374055",
  username: "amina",
  passwordHash: "scrypt$abc$00",
  role: "user",
  loginMethod: "password",
  emailVerifiedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
  notificationPreferences: null,
  avatarUrl: null,
  timezone: null,
  passwordResetTokenHash: null,
  passwordResetExpiresAt: null,
};

describe("local credential auth procedures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recordLoginEvent.mockResolvedValue(undefined);
    createUserSession.mockResolvedValue(undefined);
  });

  it("registers and issues the existing session cookie", async () => {
    findUserByLocalIdentifier.mockResolvedValue(undefined);
    createLocalUser.mockResolvedValue(localUser);
    const { ctx, cookies } = context();
    const result = await appRouter.createCaller(ctx).auth.register({
      name: "Amina",
      email: "Amina@Example.com",
      password: "securePassword123",
    });
    expect(result.user.email).toBe("amina@example.com");
    expect(cookies).toHaveLength(1);
    expect(mockCreateSessionToken).toHaveBeenCalledWith(
      "local_user-12",
      expect.objectContaining({ expiresInMs: null })
    );
    expect(createUserSession).toHaveBeenCalledWith(
      expect.objectContaining({ expiresAt: null })
    );
  });

  it("registers with a username and password without an email or social OAuth provider", async () => {
    findUserByLocalIdentifier.mockResolvedValue(undefined);
    createLocalUser.mockResolvedValue({
      ...localUser,
      email: null,
      phone: null,
      username: "amina",
    });
    const { ctx, cookies } = context();
    const result = await appRouter.createCaller(ctx).auth.register({
      name: "Amina",
      username: "Amina",
      password: "securePassword123",
    });
    expect(result.user.username).toBe("amina");
    expect(result.user.email).toBeNull();
    expect(cookies).toHaveLength(1);
    expect(createUserSession).toHaveBeenCalledWith(
      expect.objectContaining({ openId: "local_user-12", trustedDevice: false })
    );
  });

  it("rejects a phone-only registration while keeping phone optional for profiles", async () => {
    const { ctx } = context();
    await expect(
      appRouter.createCaller(ctx).auth.register({
        name: "Amina",
        phone: "+254727374055",
        password: "securePassword123",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(createLocalUser).not.toHaveBeenCalled();
  });

  it("accepts a normalized username or phone identifier for login", async () => {
    findUserByLocalIdentifier.mockResolvedValue({
      ...localUser,
      passwordHash: "scrypt$2a$5a",
    });
    const { ctx } = context();
    await expect(
      appRouter.createCaller(ctx).auth.login({
        identifier: "amina",
        password: "not-the-hash",
        mathA: 1,
        mathB: 2,
        mathAnswer: 3,
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(findUserByLocalIdentifier).toHaveBeenCalledWith("amina");
  });

  it("normalizes a phone number before using it as a login identifier", async () => {
    findUserByLocalIdentifier.mockResolvedValue({
      ...localUser,
      passwordHash: "scrypt$2a$5a",
    });
    const { ctx } = context();
    await expect(
      appRouter.createCaller(ctx).auth.login({
        identifier: "+254 727 374 055",
        password: "not-the-hash",
        mathA: 1,
        mathB: 2,
        mathAnswer: 3,
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(findUserByLocalIdentifier).toHaveBeenCalledWith("254727374055");
  });

  it("rejects an incorrect math verification on login", async () => {
    findUserByLocalIdentifier.mockResolvedValue({
      ...localUser,
      passwordHash: hashPassword("securePassword123"),
    });
    const { ctx } = context();
    await expect(
      appRouter.createCaller(ctx).auth.login({
        identifier: "amina",
        password: "securePassword123",
        mathA: 5,
        mathB: 3,
        mathAnswer: 9,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("signs in with username and password without contacting an OAuth provider", async () => {
    findUserByLocalIdentifier.mockResolvedValue({
      ...localUser,
      passwordHash: hashPassword("securePassword123"),
    });
    const { ctx, cookies } = context();
    const result = await appRouter.createCaller(ctx).auth.login({
      identifier: "Amina",
      password: "securePassword123",
      mathA: 2,
      mathB: 3,
      mathAnswer: 5,
    });
    expect(result.user.username).toBe("amina");
    expect(cookies).toHaveLength(1);
    expect(recordLoginEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        identifierType: "username",
        success: true,
        openId: "local_user-12",
      })
    );
    expect(mockCreateSessionToken).toHaveBeenCalledWith(
      "local_user-12",
      expect.objectContaining({ expiresInMs: null })
    );
    expect(createUserSession).toHaveBeenCalledWith(
      expect.objectContaining({ expiresAt: null })
    );
  });

  it("creates a trusted session only when the login option is explicitly selected", async () => {
    findUserByLocalIdentifier.mockResolvedValue({
      ...localUser,
      passwordHash: hashPassword("securePassword123"),
    });
    const { ctx, cookies } = context();
    await appRouter.createCaller(ctx).auth.login({
      identifier: "amina",
      password: "securePassword123",
      trustDevice: true,
      mathA: 2,
      mathB: 3,
      mathAnswer: 5,
    });
    expect(cookies).toHaveLength(1);
    expect(createUserSession).toHaveBeenCalledWith(
      expect.objectContaining({
        trustedDevice: true,
        trustExpiresAt: null,
        deviceType: "unknown",
        estimatedLocation: null,
      })
    );
    const session = createUserSession.mock.calls.at(-1)?.[0] as {
      expiresAt: Date | null;
      trustExpiresAt: Date | null;
    };
    expect(session.expiresAt).toBeNull();
    expect(session.trustExpiresAt).toBeNull();
  });

  it("keeps staff sessions on the existing finite expiry policy", async () => {
    findUserByLocalIdentifier.mockResolvedValue({
      ...localUser,
      role: "staff",
      passwordHash: hashPassword("securePassword123"),
    });
    const { ctx } = context();

    await appRouter.createCaller(ctx).auth.login({
      identifier: "amina",
      password: "securePassword123",
      mathA: 2,
      mathB: 3,
      mathAnswer: 5,
    });

    const session = createUserSession.mock.calls.at(-1)?.[0] as {
      expiresAt: Date | null;
    };
    if (!session.expiresAt) throw new Error("Expected a finite staff expiry.");
    expect(session.expiresAt.getTime() - Date.now()).toBeGreaterThan(
      23 * 60 * 60 * 1000
    );
    expect(mockCreateSessionToken).toHaveBeenCalledWith(
      "local_user-12",
      expect.not.objectContaining({ expiresInMs: null })
    );
  });

  it("returns the same reset response for unknown emails and does not send mail", async () => {
    findUserByLocalIdentifier.mockResolvedValue(undefined);
    const result = await appRouter
      .createCaller(context().ctx)
      .auth.requestPasswordReset({
        email: "missing@example.com",
        origin: "https://example.com",
      });
    expect(result.success).toBe(true);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("sends a reset link for an OAuth-backed account without a local password yet", async () => {
    findUserByLocalIdentifier.mockResolvedValue({
      ...localUser,
      passwordHash: null,
      loginMethod: "google",
      role: "admin",
    });
    await appRouter.createCaller(context().ctx).auth.requestPasswordReset({
      email: "amina@example.com",
      origin: "https://example.com",
    });
    expect(setPasswordResetToken).toHaveBeenCalledWith(
      localUser.openId,
      expect.any(String),
      expect.any(Date)
    );
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "amina@example.com",
        resetUrl: expect.stringContaining("/reset-password?token="),
      })
    );
  });

  it("rejects an expired or already-consumed reset token", async () => {
    consumePasswordResetToken.mockResolvedValue(undefined);
    await expect(
      appRouter.createCaller(context().ctx).auth.resetPassword({
        token: "a".repeat(64),
        password: "newSecurePassword123",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
