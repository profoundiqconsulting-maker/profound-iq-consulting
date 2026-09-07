import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Self Assessment display naming", () => {
  it("uses the official label without changing route compatibility", () => {
    const navigation = readFileSync(
      "client/src/components/TransformationNav.tsx",
      "utf8"
    );
    const dashboard = readFileSync(
      "client/src/components/dashboardNavigation.ts",
      "utf8"
    );
    const assessmentPage = readFileSync(
      "client/src/pages/Assessment.tsx",
      "utf8"
    );
    expect(navigation).toContain('assessment: "Self Assessment"');
    expect(navigation).toContain('href="/assessment"');
    expect(dashboard).toContain('labelKey: "selfAssessment"');
    expect(dashboard).toContain('path: "/assessment"');
    expect(assessmentPage).toContain("This 100-question Self Assessment");
  });
});
