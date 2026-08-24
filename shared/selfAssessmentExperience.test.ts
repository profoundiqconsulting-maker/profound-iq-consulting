import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const assessmentPage = readFileSync(new URL("../client/src/pages/Assessment.tsx", import.meta.url), "utf8");
const dashboardPage = readFileSync(new URL("../client/src/pages/UserDashboard.tsx", import.meta.url), "utf8");

describe("Self Assessment discovery and dashboard experience", () => {
  it("defines route-aware SEO metadata and a guided progress experience", () => {
    expect(assessmentPage).toContain("Self Assessment | Profound IQ Consulting");
    expect(assessmentPage).toContain('meta[name="description"]');
    expect(assessmentPage).toContain('meta[property="og:title"]');
    expect(assessmentPage).toContain('meta[property="og:description"]');
    expect(assessmentPage).toContain('meta[property="og:url"]');
    expect(assessmentPage).toContain("introModalOpen");
    expect(assessmentPage).toContain('role="progressbar"');
    expect(assessmentPage).toContain("questions answered");
  });

  it("keeps results history and CareerPath recommendations visible as dedicated learner surfaces", () => {
    expect(dashboardPage).toContain("Self Assessment results history");
    expect(dashboardPage).toContain("CareerPath recommendations");
    expect(dashboardPage).toContain("A pathway shaped by your Self Assessment.");
    expect(dashboardPage).toContain("Latest score");
    expect(dashboardPage).toContain("Open latest results");
  });
});
