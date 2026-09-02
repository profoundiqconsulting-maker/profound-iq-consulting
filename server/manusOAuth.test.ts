import { beforeEach, describe, expect, it, vi } from "vitest";
import { encodeOAuthState } from "@shared/const";

const mocks = vi.hoisted(() => ({
  findUserByLocalIdentifier: vi.fn(),
  upsertUser: vi.fn(),
  exchangeCodeForToken: vi.fn(),
  getUserInfo: vi.fn(),
  createSessionToken: vi.fn(),
}));

vi.mock("./db", () => ({
  findUserByLocalIdentifier: mocks.findUserByLocalIdentifier,
  upsertUser: mocks.upsertUser,
}));
vi.mock("./_core/sdk", () => ({
  sdk: {
    exchangeCodeForToken: mocks.exchangeCodeForToken,
    getUserInfo: mocks.getUserInfo,
    createSessionToken: mocks.createSessionToken,
  },
}));

import { registerOAuthRoutes } from "./_core/oauth";

describe("Manus OAuth account reconciliation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUserByLocalIdentifier.mockResolvedValue(undefined);
    mocks.upsertUser.mockResolvedValue(undefined);
    mocks.exchangeCodeForToken.mockResolvedValue({ accessToken: "oauth-access-token" });
    mocks.getUserInfo.mockResolvedValue({ openId: "manus-user-42", name: "Amina Example", email: "Amina@example.com", loginMethod: "email" });
    mocks.createSessionToken.mockResolvedValue("session-token");
  });

  it("does not register routes for the legacy Manus OAuth stub", () => {
    const routes = new Map<string, (...args: unknown[]) => unknown>();
    expect(() => registerOAuthRoutes({ get: (path: string, handler: (...args: unknown[]) => unknown) => routes.set(path, handler) } as any)).not.toThrow();
    expect(routes.size).toBe(0);
  });
});

