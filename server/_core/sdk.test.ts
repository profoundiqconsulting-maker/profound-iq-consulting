import { decodeJwt } from "jose";
import { describe, expect, it, vi } from "vitest";
import { sdk } from "./sdk";

vi.mock("./env", () => ({
  ENV: { sessionSecret: "test-session-secret" },
}));
vi.mock("../db", () => ({}));

describe("session token expiry", () => {
  it("creates learner tokens without an expiration claim when requested", async () => {
    const token = await sdk.createSessionToken("learner-1", {
      name: "Learner",
      expiresInMs: null,
    });

    expect(decodeJwt(token)).not.toHaveProperty("exp");
    await expect(sdk.verifySession(token)).resolves.toEqual({
      openId: "learner-1",
      name: "Learner",
    });
  });

  it("keeps the default token expiration for other sessions", async () => {
    const token = await sdk.createSessionToken("staff-1");

    expect(decodeJwt(token).exp).toBeGreaterThan(
      Math.floor(Date.now() / 1000) + 364 * 24 * 60 * 60
    );
  });
});
