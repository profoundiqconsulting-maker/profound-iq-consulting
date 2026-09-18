import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const authSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/Auth.tsx"),
  "utf8"
);
const settingsSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/Settings.tsx"),
  "utf8"
);

describe("profile and auth UX contracts", () => {
  it("uses the published site origin constant in the auth page", () => {
    expect(authSource).toContain(
      'import { PUBLISHED_SITE_ORIGIN } from "@shared/siteOrigin";'
    );
    expect(authSource).toContain("PUBLISHED_SITE_ORIGIN");
  });

  it("exposes connected account controls in settings", () => {
    expect(settingsSource).toContain('user.loginMethod === "google"');
    expect(settingsSource).toContain("trpc.course.state.useQuery");
    expect(settingsSource).toContain("Review your active courses");
  });
});
