import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const authSource = readFileSync("client/src/pages/Auth.tsx", "utf8");

describe("social OAuth navigation", () => {
  it("starts Google and LinkedIn from the browser origin so callback cookies stay on the same host", () => {
    expect(authSource).toContain("/api/oauth/google/start?origin=${encodeURIComponent(window.location.origin)}");
    expect(authSource).toContain("/api/oauth/linkedin/start?origin=${encodeURIComponent(window.location.origin)}");
    expect(authSource).not.toContain("/api/oauth/google/start?origin=${encodeURIComponent(PUBLISHED_SITE_ORIGIN)}");
    expect(authSource).not.toContain("/api/oauth/linkedin/start?origin=${encodeURIComponent(PUBLISHED_SITE_ORIGIN)}");
  });

  it("provides a learner-facing recovery message for invalid social OAuth state", () => {
    expect(authSource).toContain("invalid_social_oauth_state");
    expect(authSource).toContain("Social sign-in could not be verified");
    expect(authSource).toContain("Start Google or LinkedIn sign-in again from this page");
  });
});
