import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const authSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/Auth.tsx"),
  "utf8"
);

describe("social OAuth navigation", () => {
  it("does not expose OAuth start URLs in the client-side auth page", () => {
    expect(authSource).not.toContain("/api/oauth/google/start");
    expect(authSource).not.toContain("/api/oauth/linkedin/start");
  });

  it("does not contain legacy Google OAuth pending state in the auth page", () => {
    expect(authSource).not.toContain("googleSignInPending");
    expect(authSource).not.toContain("Redirecting securely to Google");
  });
});
