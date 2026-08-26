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

type Handler = (req: any, res: any) => unknown;

function registeredRoutes() {
  const routes = new Map<string, Handler>();
  registerOAuthRoutes({ get: (path: string, handler: Handler) => routes.set(path, handler) } as any);
  return routes;
}

describe("Manus OAuth account reconciliation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUserByLocalIdentifier.mockResolvedValue(undefined);
    mocks.upsertUser.mockResolvedValue(undefined);
    mocks.exchangeCodeForToken.mockResolvedValue({ accessToken: "oauth-access-token" });
    mocks.getUserInfo.mockResolvedValue({ openId: "manus-user-42", name: "Amina Example", email: "Amina@example.com", loginMethod: "email" });
    mocks.createSessionToken.mockResolvedValue("session-token");
  });

  it("reuses the matching credential account without dropping its local identity", async () => {
    const localAccount = { openId: "local_user-42", name: "Amina Local", email: "amina@example.com", username: "amina", passwordHash: "hashed-password", avatarUrl: null };
    mocks.findUserByLocalIdentifier.mockResolvedValue(localAccount);
    const origin = "https://profoundiq-vguqrhsm.manus.space";
    const nonce = "nonce-42";
    const state = encodeOAuthState({ redirectUri: `${origin}/api/oauth/callback`, nonce });
    const redirect = vi.fn();
    const response = { clearCookie: vi.fn(), cookie: vi.fn(), redirect };

    await registeredRoutes().get("/api/oauth/callback")?.({ query: { code: "oauth-code", state }, headers: { cookie: `__Host-oauth_state=${nonce}` } }, response);

    expect(mocks.findUserByLocalIdentifier).toHaveBeenCalledWith("amina@example.com");
    expect(mocks.upsertUser).toHaveBeenCalledWith(expect.objectContaining({ openId: "local_user-42", email: "amina@example.com", loginMethod: "email" }));
    expect(mocks.createSessionToken).toHaveBeenCalledWith("local_user-42", expect.objectContaining({ name: "Amina Example" }));
    expect(redirect).toHaveBeenCalledWith(302, "/");
  });
});

