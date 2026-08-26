import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUserByLocalIdentifier: vi.fn(),
  upsertUser: vi.fn(),
  createSessionToken: vi.fn(),
  jwtVerify: vi.fn(),
  createRemoteJWKSet: vi.fn(() => "jwks"),
}));

vi.mock("./db", () => ({ findUserByLocalIdentifier: mocks.findUserByLocalIdentifier, upsertUser: mocks.upsertUser }));
vi.mock("./_core/sdk", () => ({ sdk: { createSessionToken: mocks.createSessionToken } }));
vi.mock("jose", () => ({ jwtVerify: mocks.jwtVerify, createRemoteJWKSet: mocks.createRemoteJWKSet }));

import { buildSocialAuthorizationUrl, registerSocialOAuthRoutes, socialOAuthRedirectUri } from "./_core/socialOAuth";

const origin = "https://profoundiq-vguqrhsm.manus.space";

type Handler = (req: any, res: any) => unknown;

function registeredRoutes() {
  const routes = new Map<string, Handler>();
  registerSocialOAuthRoutes({ get: (path: string, handler: Handler) => routes.set(path, handler) } as any);
  return routes;
}

function response(json: unknown, ok = true) { return { ok, status: ok ? 200 : 400, json: vi.fn().mockResolvedValue(json), text: vi.fn().mockResolvedValue(JSON.stringify(json)) }; }

describe("Google social OAuth flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUserByLocalIdentifier.mockResolvedValue(undefined);
    mocks.upsertUser.mockResolvedValue(undefined);
    mocks.createSessionToken.mockResolvedValue("session-token");
    mocks.jwtVerify.mockResolvedValue({ payload: { nonce: "nonce-from-state" } });
  });

  it("builds the exact registered callback and authorization parameters", () => {
    const url = new URL(buildSocialAuthorizationUrl("google", origin, "state-value", "nonce-value"));
    expect(socialOAuthRedirectUri("google", origin)).toBe(`${origin}/api/oauth/google/callback`);
    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.searchParams.get("redirect_uri")).toBe(`${origin}/api/oauth/google/callback`);
    expect(url.searchParams.get("client_id")).toBeTruthy();
    expect(url.searchParams.get("state")).toBe("state-value");
    expect(url.searchParams.get("nonce")).toBe("nonce-value");
  });

  it("exchanges a valid Google callback and persists the application session", async () => {
    const routes = registeredRoutes();
    const startRedirect = vi.fn();
    const startResponse = { cookie: vi.fn(), redirect: startRedirect };
    await routes.get("/api/oauth/google/start")?.({ query: { origin } }, startResponse);
    const authUrl = new URL(startRedirect.mock.calls[0][0]);
    const state = authUrl.searchParams.get("state")!;
    const nonce = authUrl.searchParams.get("nonce")!;
    mocks.jwtVerify.mockResolvedValue({ payload: { nonce } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response({ access_token: "access-token", id_token: "id-token" })).mockResolvedValueOnce(response({ sub: "google-sub", email: "person@example.com", name: "Person Example", email_verified: true, picture: "https://example.com/avatar.png" })));
    const callbackRedirect = vi.fn();
    const callbackResponse = { clearCookie: vi.fn(), cookie: vi.fn(), redirect: callbackRedirect };
    await routes.get("/api/oauth/google/callback")?.({ query: { code: "google-code", state }, headers: { cookie: `__Host-social_oauth_state=google.${nonce}` } }, callbackResponse);
    expect(mocks.upsertUser).toHaveBeenCalledWith(expect.objectContaining({ openId: "social:google:google-sub", email: "person@example.com", loginMethod: "google" }));
    expect(mocks.createSessionToken).toHaveBeenCalledWith("social:google:google-sub", expect.objectContaining({ name: "Person Example" }));
    expect(callbackResponse.cookie).toHaveBeenCalledWith(expect.any(String), "session-token", expect.any(Object));
    expect(callbackRedirect).toHaveBeenCalledWith(`${origin}/`);
  });

  it("reuses an existing credential account when Google returns the same verified email", async () => {
    mocks.findUserByLocalIdentifier.mockResolvedValue({ openId: "local-person", name: "Local Person", email: "person@example.com", username: "person", passwordHash: "preserved-hash", avatarUrl: null });
    const routes = registeredRoutes();
    const startRedirect = vi.fn();
    await routes.get("/api/oauth/google/start")?.({ query: { origin, returnTo: "/dashboard" } }, { cookie: vi.fn(), redirect: startRedirect });
    const authUrl = new URL(startRedirect.mock.calls[0][0]);
    const state = authUrl.searchParams.get("state")!;
    const nonce = authUrl.searchParams.get("nonce")!;
    mocks.jwtVerify.mockResolvedValue({ payload: { nonce } });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response({ access_token: "access-token", id_token: "id-token" })).mockResolvedValueOnce(response({ sub: "google-sub", email: "PERSON@example.com", name: "Provider Person", email_verified: true })));
    const redirect = vi.fn();
    await routes.get("/api/oauth/google/callback")?.({ query: { code: "google-code", state }, headers: { cookie: `__Host-social_oauth_state=google.${nonce}` } }, { clearCookie: vi.fn(), cookie: vi.fn(), redirect });
    expect(mocks.upsertUser).toHaveBeenCalledWith(expect.objectContaining({ openId: "local-person", email: "person@example.com", loginMethod: "google" }));
    expect(mocks.createSessionToken).toHaveBeenCalledWith("local-person", expect.objectContaining({ name: "Provider Person" }));
    expect(redirect).toHaveBeenCalledWith(`${origin}/dashboard`);
  });

  it("rejects a callback with a mismatched state cookie before token exchange", async () => {
    const routes = registeredRoutes();
    const redirect = vi.fn();
    await routes.get("/api/oauth/google/callback")?.({ query: { code: "code", state: "bad-state" }, headers: { cookie: "__Host-social_oauth_state=google.wrong" } }, { redirect });
    expect(redirect).toHaveBeenCalledWith("//auth?error=invalid_social_oauth_state");
    expect(mocks.createSessionToken).not.toHaveBeenCalled();
  });
});
