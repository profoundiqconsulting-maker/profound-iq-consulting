import { describe, expect, it, vi } from "vitest";

const { getSessionByTokenHash, revokeUserSession } = vi.hoisted(() => ({
  getSessionByTokenHash: vi.fn(),
  revokeUserSession: vi.fn(),
}));

vi.mock("./db", async importOriginal => ({
  ...(await importOriginal<typeof import("./db")>()),
  getSessionByTokenHash,
  revokeUserSession,
}));

import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(cookie?: string): {
  ctx: TrpcContext;
  clearedCookies: CookieCall[];
} {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "google",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: cookie ? { cookie } : {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("auth.logout", () => {
  it("revokes a non-expiring session on explicit sign-out", async () => {
    getSessionByTokenHash.mockResolvedValue({ id: 8, expiresAt: null });
    const { ctx } = createAuthContext(`${COOKIE_NAME}=active-session`);
    const caller = appRouter.createCaller(ctx);

    await caller.auth.logout();

    expect(getSessionByTokenHash).toHaveBeenCalledTimes(1);
    expect(revokeUserSession).toHaveBeenCalledWith("sample-user", 8);
  });

  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});
