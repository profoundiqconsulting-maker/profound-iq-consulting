import { describe, expect, it } from "vitest";

async function validateClient(
  endpoint: string,
  clientId: string,
  clientSecret: string
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: "invalid-test-code",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const body = await response.text();
  return { status: response.status, body };
}

describe("social OAuth credentials", () => {
  it("accepts the configured Google OAuth client credentials", async () => {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    if (!clientId || !clientSecret) return;
    const result = await validateClient(
      "https://oauth2.googleapis.com/token",
      clientId,
      clientSecret
    );
    expect(result.body).not.toMatch(/invalid_client|unauthorized_client/i);
    expect(result.status).toBeGreaterThanOrEqual(400);
  }, 15_000);

  it("accepts the configured LinkedIn OAuth client credentials", async () => {
    const clientId = process.env.LINKEDIN_OAUTH_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_OAUTH_CLIENT_SECRET;
    if (!clientId || !clientSecret) return;
    const result = await validateClient(
      "https://www.linkedin.com/oauth/v2/accessToken",
      clientId,
      clientSecret
    );
    expect(result.body).not.toMatch(/invalid_client|unauthorized_client/i);
    expect(result.status).toBeGreaterThanOrEqual(400);
  }, 15_000);
});
