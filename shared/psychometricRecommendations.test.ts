import { describe, expect, it } from "vitest";
import { getPsychometricCourseRecommendations } from "./psychometricRecommendations";

describe("psychometric course recommendations", () => {
  it("prioritizes a learner goal and still exposes difficulty and score rationale", () => {
    const recommendations = getPsychometricCourseRecommendations(
      {
        testSlug: "leadership-potential-profile",
        domains: [{ key: "influence", label: "Influence", score: 42 }],
      },
      [],
      ["leadership"]
    );
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].goalMatches).toContain("leadership");
    expect(["foundational", "applied", "advanced"]).toContain(
      recommendations[0].difficulty
    );
    expect(recommendations[0].scoreSignal).toContain("Influence");
  });

  it("omits completed courses and keeps remaining next steps actionable", () => {
    const all = getPsychometricCourseRecommendations({
      testSlug: "cognitive-reasoning-assessment",
      domains: [{ key: "reasoning", label: "Reasoning", score: 78 }],
    });
    const remaining = getPsychometricCourseRecommendations(
      {
        testSlug: "cognitive-reasoning-assessment",
        domains: [{ key: "reasoning", label: "Reasoning", score: 78 }],
      },
      [all[0]?.slug ?? ""]
    );
    expect(remaining.every(item => item.slug !== all[0]?.slug)).toBe(true);
    expect(remaining.every(item => item.action.length > 20)).toBe(true);
  });
});
